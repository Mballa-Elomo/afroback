// =====================================================================
// AFROBACK — Edge Function "campay" (cdc-paiement-geniuspay.md, §11)
//
// Paiement Mobile Money MTN / Orange Cameroun via Campay (prestataire
// camerounais), après GeniusPay puis CinetPay (Cameroun non couvert en
// pratique, 2026-09-29). Page de paiement Campay (/get_payment_link/) :
// la personne y saisit son numéro MTN ou Orange et valide sur son téléphone.
//
// Usages dans une seule fonction :
//   - action "demander" (app et site, personne connectée, 2026-10-07,
//     cdc-paiement-sans-sortie.md) : DEMANDE DE PAIEMENT DIRECTE (/collect/)
//     envoyée au numéro MTN / Orange de la personne, qui valide sur son
//     téléphone sans quitter AFROBACK. Montant calculé côté serveur ;
//   - action "annuler" : abandonne une demande en attente (si elle est
//     validée quand même sur le téléphone, elle est créditée normalement) ;
//   - action "creer" (ancien parcours, gardé pour les versions de l'app déjà
//     installées) : lien vers la page de paiement Campay ;
//   - actions "verifier" / "verifier_en_attente" (app) : redemande le statut
//     À CAMPAY (/transaction/{reference}/) et crédite si le paiement est réussi ;
//   - notification Campay (callback, GET ou POST, sans jeton Supabase) :
//     même vérification.
// Le statut n'est JAMAIS cru sur parole : il est toujours relu auprès de
// l'API Campay avant de créditer.
//
// Mise en place par Yannick (tableau de bord Supabase → Edge Functions) :
//   1. "Deploy a new function" → "Via Editor", nom : campay, coller ce
//      fichier, déployer, puis DÉSACTIVER "Verify JWT" dans ses réglages.
//   2. Edge Functions → Secrets :
//        CAMPAY_TOKEN = jeton d'accès permanent (APP KEYS de l'application Campay)
//        CAMPAY_ENV   = demo (tests, demo.campay.net) puis live (www.campay.net)
//        CAMPAY_MONTANT_TEST = facultatif, en demo seulement : montant envoyé à
//          Campay à la place du vrai prix (l'environnement demo plafonne les montants)
//      Ne jamais coller ces clés ailleurs.
//   3. Dans l'application Campay : Callback URL =
//      https://<projet>.supabase.co/functions/v1/campay
// =====================================================================
import { createClient } from 'npm:@supabase/supabase-js@2';

const ENV = (Deno.env.get('CAMPAY_ENV') ?? 'demo').toLowerCase() === 'live' ? 'live' : 'demo';
const API = ENV === 'live' ? 'https://www.campay.net/api' : 'https://demo.campay.net/api';
const TOKEN = Deno.env.get('CAMPAY_TOKEN') ?? '';
const MONTANT_TEST = ENV === 'demo' ? Number(Deno.env.get('CAMPAY_MONTANT_TEST') ?? '') : NaN;
const SITE = 'https://afroback-test.vercel.app';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tarifs : doivent rester identiques à src/onboarding/pricing.ts (source d'affichage de l'app).
const PRIX_MENSUEL: Record<string, number> = { racines: 1500, heritage: 3000 };
const REDUCTION_ANNUELLE = 0.83;
const NOMS: Record<string, string> = { racines: 'Racines', heritage: 'Héritage' };
const DON_MIN = 200;
const DON_MAX = 1_000_000;

function prix(plan: string, periode: string): number {
  const m = PRIX_MENSUEL[plan];
  return periode === 'yearly' ? Math.round(m * 12 * REDUCTION_ANNUELLE) : m;
}

// Ce qui est acheté : montant et libellé TOUJOURS calculés ici, jamais repris de l'app.
function preparer(body: Record<string, any>):
  | { type: 'abonnement' | 'don'; montant: number; description: string; plan: string | null; periode: string | null }
  | { erreur: string } {
  if (body.type === 'don') {
    const montant = Math.round(Number(body.montant));
    if (!Number.isFinite(montant) || montant < DON_MIN || montant > DON_MAX) return { erreur: 'montant_invalide' };
    return { type: 'don', montant, description: 'Don - Soutenir AFROBACK', plan: null, periode: null };
  }
  const plan = String(body.plan);
  const periode = body.periode === 'yearly' ? 'yearly' : 'monthly';
  if (!PRIX_MENSUEL[plan]) return { erreur: 'forfait_invalide' };
  return {
    type: 'abonnement',
    montant: prix(plan, periode),
    description: `AFROBACK ${NOMS[plan]} - ${periode === 'yearly' ? '12 mois' : '1 mois'}`,
    plan,
    periode,
  };
}

// Numéro Mobile Money camerounais (MTN ou Orange) au format attendu par Campay : 2376XXXXXXXX.
function numeroCamerounais(v: unknown): string | null {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.startsWith('00237')) d = d.slice(5);
  else if (d.startsWith('237') && d.length === 12) d = d.slice(3);
  if (!/^6\d{8}$/.test(d)) return null;
  if (!operateurDe(`237${d}`)) return null;
  return `237${d}`;
}

// MTN : 67, 68, 650 à 654 · Orange : 69, 655 à 659, 640.
function operateurDe(tel: string): 'MTN' | 'ORANGE' | null {
  const n = tel.slice(3);
  if (/^6(7|8|5[0-4])/.test(n)) return 'MTN';
  if (/^6(9|5[5-9]|40)/.test(n)) return 'ORANGE';
  return null;
}

function masquer(tel: string): string {
  const n = tel.slice(3);
  return `${n.slice(0, 1)}•• •• •• ${n.slice(-2)}`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

async function campay(method: string, path: string, body?: unknown): Promise<{ status: number; data: any }> {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Token ${TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: r.status, data: await r.json().catch(() => null) };
}

// Adresse de retour après paiement : uniquement le site AFROBACK ou un test local.
function retourAutorise(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    if (u.origin === SITE) return u.toString();
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) return u.toString();
  } catch {
    /* adresse invalide */
  }
  return null;
}

function statutDepuisCampay(s: unknown): string {
  switch (String(s ?? '').toUpperCase()) {
    case 'SUCCESSFUL':
      return 'reussi';
    case 'FAILED':
      return 'echoue';
    default:
      return 'en_attente';
  }
}

// Relit le paiement auprès de Campay et met la base à jour. Renvoie le statut AFROBACK
// et, pour le diagnostic, la réponse brute de Campay.
async function synchroniser(db: ReturnType<typeof admin>, p: { id: string; reference: string | null; statut: string }) {
  if (p.statut === 'reussi' || !p.reference) return { statut: p.statut, diag: p.reference ? 'deja_credite' : 'sans_reference' };
  const { status, data: d } = await campay('GET', `/transaction/${encodeURIComponent(p.reference)}/`);
  if (status >= 400 || !d) {
    console.error('Campay statut', p.reference, status, JSON.stringify(d));
    return { statut: p.statut, diag: `HTTP ${status} ${d?.message ?? d?.detail ?? ''}`.trim() };
  }
  // La transaction interrogée doit bien être la nôtre.
  if (d.external_reference && d.external_reference !== p.id) return { statut: p.statut, diag: 'transaction_etrangere' };
  const brut = d.status ?? null;
  const statut = statutDepuisCampay(brut);
  if (statut === 'reussi') {
    const { error } = await db.rpc('crediter_paiement', {
      p_paiement_id: p.id,
      p_frais: null,
      p_moyen: d.operator ? String(d.operator).slice(0, 40) : null,
      p_environnement: ENV,
    });
    if (error) {
      console.error('crediter_paiement', p.id, JSON.stringify(error));
      return { statut: p.statut, diag: `credit: ${error.message}` };
    }
  } else if (statut !== 'en_attente' && statut !== p.statut) {
    await db.from('paiements').update({ statut }).eq('id', p.id).neq('statut', 'reussi');
  }
  return { statut, diag: `campay: ${brut ?? '?'}${d.reason ? ` (${d.reason})` : ''}` };
}

// Callback Campay : on retrouve NOTRE paiement (external_reference, sinon la
// référence Campay), puis on relit le statut chez Campay.
async function notification(params: Record<string, unknown>) {
  const externe = String(params.external_reference ?? '');
  const reference = params.reference ? String(params.reference) : null;
  const db = admin();
  let q = db.from('paiements').select('id, reference, statut');
  if (/^[0-9a-f-]{36}$/i.test(externe)) q = q.eq('id', externe);
  else if (reference) q = q.eq('reference', reference);
  else return json({ ok: true, ignore: true });
  const { data: p } = await q.maybeSingle();
  if (!p) return json({ ok: true, inconnu: true });
  if (!p.reference && reference) {
    await db.from('paiements').update({ reference }).eq('id', p.id);
    p.reference = reference;
  }
  const { statut } = await synchroniser(db, p);
  return json({ ok: true, statut });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    // Callback Campay en GET : paramètres dans l'adresse.
    if (req.method === 'GET') {
      return await notification(Object.fromEntries(new URL(req.url).searchParams.entries()));
    }

    // Appel depuis l'app : identité vérifiée via le jeton de la personne connectée.
    // Sans jeton utilisateur, seul un callback Campay (POST) est accepté.
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    const ct = req.headers.get('content-type') ?? '';
    const body: Record<string, any> = ct.includes('application/json')
      ? await req.json().catch(() => ({}))
      : Object.fromEntries((await req.formData().catch(() => new FormData())).entries());
    if (!user) {
      if (body.reference || body.external_reference) return await notification(body);
      return json({ ok: false, error: 'non_authentifie' }, 401);
    }
    const db = admin();

    if (body.action === 'verifier') {
      const { data: p } = await db
        .from('paiements')
        .select('id, reference, statut, type, plan, montant_fcfa')
        .eq('id', String(body.paiement_id ?? ''))
        .eq('user_id', user.id)
        .maybeSingle();
      if (!p) return json({ ok: false, error: 'introuvable' }, 404);
      const { statut, diag } = await synchroniser(db, p);
      return json({ ok: true, statut, diag, type: p.type, plan: p.plan, montant: p.montant_fcfa });
    }

    // Rattrapage : revérifie les paiements de la personne restés en attente (retour
    // interrompu, app fermée pendant le paiement…). Appelé à l'ouverture de l'écran Abonnements.
    if (body.action === 'verifier_en_attente') {
      const depuis = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
      const { data: rows } = await db
        .from('paiements')
        .select('id, reference, statut, created_at')
        .eq('user_id', user.id)
        .in('statut', ['en_attente', 'annule'])
        .gte('created_at', depuis)
        .order('created_at', { ascending: false })
        .limit(5);
      let credite = 0;
      const diags: string[] = [];
      for (const r of rows ?? []) {
        if (!r.reference) {
          // Paiement jamais parti chez le prestataire : on le clôt après 1 h.
          if (Date.now() - new Date(r.created_at).getTime() > 3600 * 1000) {
            await db.from('paiements').update({ statut: 'echoue' }).eq('id', r.id).eq('statut', 'en_attente');
          }
          continue;
        }
        const { statut, diag } = await synchroniser(db, r);
        if (statut === 'reussi') credite++;
        else diags.push(diag);
      }
      return json({ ok: true, verifies: rows?.length ?? 0, credite, diag: diags[0] ?? null });
    }

    // Abandon d'une demande en attente (bouton « Annuler » de l'écran d'attente).
    if (body.action === 'annuler') {
      await db
        .from('paiements')
        .update({ statut: 'annule' })
        .eq('id', String(body.paiement_id ?? ''))
        .eq('user_id', user.id)
        .eq('statut', 'en_attente');
      return json({ ok: true });
    }

    if (body.action !== 'creer' && body.action !== 'demander') return json({ ok: false, error: 'action_inconnue' }, 400);
    if (!TOKEN) return json({ ok: false, error: 'non_configure' }, 503);

    const commande = preparer(body);
    if ('erreur' in commande) return json({ ok: false, error: commande.erreur }, 400);
    const { type, montant, description, plan, periode } = commande;
    // En demo, Campay plafonne les montants : CAMPAY_MONTANT_TEST remplace le vrai prix (le crédit reste celui du forfait).
    const montantEnvoye = Number.isFinite(MONTANT_TEST) && MONTANT_TEST > 0 ? Math.round(MONTANT_TEST) : montant;

    if (body.action === 'demander') {
      const tel = numeroCamerounais(body.telephone);
      if (!tel) return json({ ok: false, error: 'numero_invalide' }, 400);
      // Garde-fou : 5 demandes par heure et par compte au maximum.
      const uneHeure = new Date(Date.now() - 3600 * 1000).toISOString();
      const { count } = await db.from('paiements').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', uneHeure);
      if ((count ?? 0) >= 5) return json({ ok: false, error: 'trop_de_demandes' }, 429);
      // Une seule demande en attente à la fois : les précédentes sont abandonnées (créditées quand même si validées).
      await db.from('paiements').update({ statut: 'annule' }).eq('user_id', user.id).eq('statut', 'en_attente').not('telephone_masque', 'is', null);

      const { data: p, error: insErr } = await db
        .from('paiements')
        .insert({
          user_id: user.id,
          type,
          plan,
          periode,
          montant_fcfa: montant,
          anonyme: !!body.anonyme,
          environnement: ENV,
          telephone_masque: masquer(tel),
          operateur: operateurDe(tel),
        })
        .select('id')
        .single();
      if (insErr || !p) {
        console.error('Enregistrement paiement', JSON.stringify(insErr));
        return json({ ok: false, error: 'enregistrement', detail: insErr?.message ?? null }, 500);
      }
      const { status, data: cp } = await campay('POST', '/collect/', {
        amount: String(montantEnvoye),
        currency: 'XAF',
        from: tel,
        description,
        external_reference: p.id,
      });
      if (status >= 400 || !cp?.reference) {
        await db.from('paiements').update({ statut: 'echoue' }).eq('id', p.id);
        console.error('Campay collect', status, JSON.stringify(cp));
        const detail = [cp?.error_code, cp?.message ?? cp?.detail ?? (cp ? JSON.stringify(cp).slice(0, 160) : `HTTP ${status}`)]
          .filter(Boolean)
          .join(' · ');
        return json({ ok: false, error: 'passerelle', detail }, 502);
      }
      const operateur = cp.operator ? String(cp.operator).toUpperCase().slice(0, 20) : operateurDe(tel);
      await db.from('paiements').update({ reference: String(cp.reference), operateur }).eq('id', p.id);
      return json({
        ok: true,
        paiement_id: p.id,
        montant,
        operateur,
        ussd_code: cp.ussd_code ? String(cp.ussd_code) : operateur === 'ORANGE' ? '#150*50#' : '*126#',
        telephone_masque: masquer(tel),
      });
    }

    const { data: p, error: insErr } = await db
      .from('paiements')
      .insert({ user_id: user.id, type, plan, periode, montant_fcfa: montant, anonyme: !!body.anonyme, environnement: ENV })
      .select('id')
      .single();
    if (insErr || !p) {
      console.error('Enregistrement paiement', JSON.stringify(insErr));
      return json({ ok: false, error: 'enregistrement', detail: insErr?.message ?? null }, 500);
    }

    const retour = retourAutorise(body.retour_url) ?? `${SITE}/paiement-termine.html`;
    const sep = retour.includes('?') ? '&' : '?';
    const meta = user.user_metadata ?? {};
    const { status, data: cp } = await campay('POST', '/get_payment_link/', {
      amount: String(montantEnvoye),
      currency: 'XAF',
      description,
      first_name: String(meta.prenom ?? meta.pseudo ?? 'Membre').slice(0, 60),
      last_name: 'AFROBACK',
      email: user.email ?? '',
      external_reference: p.id,
      redirect_url: `${retour}${sep}id=${p.id}`,
      failure_redirect_url: `${retour}${sep}id=${p.id}&echec=1`,
      payment_options: 'MOMO',
      payer_can_pay_more: 'no',
    });
    if (status >= 400 || !cp?.link) {
      await db.from('paiements').update({ statut: 'echoue' }).eq('id', p.id);
      console.error('Campay creation', status, JSON.stringify(cp));
      const detail = [cp?.error_code, cp?.message ?? cp?.detail ?? (cp ? JSON.stringify(cp).slice(0, 160) : `HTTP ${status}`)]
        .filter(Boolean)
        .join(' · ');
      return json({ ok: false, error: 'passerelle', detail }, 502);
    }
    await db
      .from('paiements')
      .update({ reference: cp.reference ? String(cp.reference) : null, checkout_url: cp.link })
      .eq('id', p.id);
    return json({ ok: true, paiement_id: p.id, checkout_url: cp.link, montant });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: 'interne', detail: String(e).slice(0, 200) }, 500);
  }
});
