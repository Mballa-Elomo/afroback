// =====================================================================
// AFROBACK — Edge Function "geniuspay" (cdc-paiement-geniuspay.md)
//
// Trois usages dans une seule fonction :
//   - action "creer"    (app, personne connectée) : calcule le montant côté
//     serveur, enregistre la ligne `paiements`, crée le paiement GeniusPay
//     et renvoie l'adresse de la page de paiement sécurisée ;
//   - action "verifier" (app) : redemande le statut À GENIUSPAY et crédite
//     si le paiement est réussi (marche même sans webhook configuré) ;
//   - webhook GeniusPay (en-tête X-Webhook-Signature) : même vérification.
// Le statut n'est JAMAIS cru sur parole : il est toujours relu auprès de
// l'API GeniusPay avec la clé secrète avant de créditer.
//
// Mise en place par Yannick (tableau de bord Supabase → Edge Functions) :
//   1. "Deploy a new function" → "Via Editor", nom : geniuspay, coller ce
//      fichier, déployer. Puis dans les réglages de la fonction, DÉSACTIVER
//      "Verify JWT" (GeniusPay n'a pas de jeton Supabase ; la fonction
//      vérifie elle-même l'identité de l'app).
//   2. Edge Functions → Secrets :
//        GENIUSPAY_API_KEY    = pk_sandbox_… (puis pk_live_…)
//        GENIUSPAY_API_SECRET = sk_sandbox_… (puis sk_live_…)
//        GENIUSPAY_WEBHOOK_SECRET = whsec_… (facultatif, recommandé)
//      Ne jamais coller ces clés ailleurs.
// =====================================================================
import { createClient } from 'npm:@supabase/supabase-js@2';

const API = 'https://geniuspay.ci/api/v1/merchant';
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

function geniusHeaders() {
  return {
    'X-API-Key': Deno.env.get('GENIUSPAY_API_KEY') ?? '',
    'X-API-Secret': Deno.env.get('GENIUSPAY_API_SECRET') ?? '',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
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

function statutDepuisGenius(s: unknown): string {
  switch (String(s ?? '').toLowerCase()) {
    case 'completed':
    case 'success':
    case 'succeeded':
    case 'paid':
      return 'reussi';
    case 'failed':
      return 'echoue';
    case 'cancelled':
    case 'canceled':
      return 'annule';
    case 'expired':
      return 'expire';
    case 'refunded':
      return 'rembourse';
    default:
      return 'en_attente';
  }
}

// Relit le paiement auprès de GeniusPay et met la base à jour. Renvoie le statut AFROBACK
// et, pour le diagnostic, la réponse brute de GeniusPay (code HTTP + statut).
async function synchroniser(db: ReturnType<typeof admin>, p: { id: string; reference: string | null; statut: string }) {
  if (p.statut === 'reussi' || !p.reference) return { statut: p.statut, diag: p.reference ? 'deja_credite' : 'sans_reference' };
  const res = await fetch(`${API}/payments/${encodeURIComponent(p.reference)}`, { headers: geniusHeaders() });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body) {
    console.error('GeniusPay statut', p.reference, res.status, JSON.stringify(body));
    return { statut: p.statut, diag: `HTTP ${res.status} ${body?.error?.code ?? ''}`.trim() };
  }
  // Format documenté : { success, data: { status, ... } } ; variantes tolérées (data.payment, data.transaction).
  const d = body.data?.payment ?? body.data?.transaction ?? body.data ?? body;
  const brut = d.status ?? d.state ?? null;
  let statut = statutDepuisGenius(brut);
  if (statut === 'en_attente' && d.completed_at && !['failed', 'cancelled', 'expired'].includes(String(brut))) statut = 'reussi';
  if (statut === 'reussi') {
    const frais = Number.isFinite(Number(d.fees)) ? Math.round(Number(d.fees)) : null;
    const moyen = d.payment_method ?? d.payment_provider ?? d.gateway ?? d.provider ?? null;
    const { error } = await db.rpc('crediter_paiement', {
      p_paiement_id: p.id,
      p_frais: frais,
      p_moyen: moyen ? String(moyen).slice(0, 40) : null,
      p_environnement: d.environment ?? body.environment ?? null,
    });
    if (error) {
      console.error('crediter_paiement', p.id, JSON.stringify(error));
      return { statut: p.statut, diag: `credit: ${error.message}` };
    }
  } else if (statut !== 'en_attente' && statut !== p.statut) {
    await db.from('paiements').update({ statut }).eq('id', p.id).neq('statut', 'reussi');
  }
  return { statut, diag: `geniuspay: ${brut ?? '?'}` };
}

async function signatureValide(raw: string, req: Request): Promise<boolean> {
  const secret = Deno.env.get('GENIUSPAY_WEBHOOK_SECRET');
  // Sans secret configuré : on accepte l'appel, car le statut est de toute façon relu auprès de GeniusPay.
  if (!secret) return true;
  const sig = req.headers.get('X-Webhook-Signature') ?? '';
  const ts = req.headers.get('X-Webhook-Timestamp') ?? '';
  if (!sig || !ts || Math.abs(Date.now() / 1000 - Number(ts)) > 600) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${raw}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const recu = sig.replace(/^sha256=/, '').toLowerCase();
  if (recu.length !== hex.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ recu.charCodeAt(i);
  return diff === 0;
}

async function webhook(req: Request) {
  const raw = await req.text();
  if (!(await signatureValide(raw, req))) return json({ ok: false, error: 'signature' }, 401);
  const body = JSON.parse(raw || '{}');
  const d = body.data ?? body.payment ?? body;
  const reference: string | undefined = d.reference ?? body.reference;
  const paiementId: string | undefined = d.metadata?.paiement_id ?? body.metadata?.paiement_id;
  const db = admin();
  let q = db.from('paiements').select('id, reference, statut');
  if (reference) q = q.eq('reference', reference);
  else if (paiementId) q = q.eq('id', paiementId);
  else return json({ ok: true, ignore: true });
  const { data: p } = await q.maybeSingle();
  if (!p) return json({ ok: true, inconnu: true });
  // Le webhook peut arriver avant que la référence ne soit enregistrée.
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
    if (req.headers.get('X-Webhook-Signature') || req.headers.get('X-Webhook-Event')) return await webhook(req);

    // Appel depuis l'app : identité vérifiée via le jeton de la personne connectée.
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ ok: false, error: 'non_authentifie' }, 401);

    const body = await req.json().catch(() => ({}));
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
        .eq('statut', 'en_attente')
        .gte('created_at', depuis)
        .order('created_at', { ascending: false })
        .limit(5);
      let credite = 0;
      const diags: string[] = [];
      for (const r of rows ?? []) {
        if (!r.reference) {
          // Paiement jamais parti chez GeniusPay : on le clôt après 1 h.
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

    if (body.action !== 'creer') return json({ ok: false, error: 'action_inconnue' }, 400);
    if (!Deno.env.get('GENIUSPAY_API_KEY')) return json({ ok: false, error: 'non_configure' }, 503);

    const type = body.type === 'don' ? 'don' : 'abonnement';
    let montant: number;
    let description: string;
    let plan: string | null = null;
    let periode: string | null = null;
    if (type === 'abonnement') {
      plan = String(body.plan);
      periode = body.periode === 'yearly' ? 'yearly' : 'monthly';
      if (!PRIX_MENSUEL[plan]) return json({ ok: false, error: 'forfait_invalide' }, 400);
      montant = prix(plan, periode);
      description = `AFROBACK ${NOMS[plan]} · ${periode === 'yearly' ? '12 mois' : '1 mois'}`;
    } else {
      montant = Math.round(Number(body.montant));
      if (!Number.isFinite(montant) || montant < DON_MIN || montant > DON_MAX) return json({ ok: false, error: 'montant_invalide' }, 400);
      description = 'Don · Soutenir AFROBACK';
    }

    const { data: p, error: insErr } = await db
      .from('paiements')
      .insert({ user_id: user.id, type, plan, periode, montant_fcfa: montant, anonyme: !!body.anonyme })
      .select('id')
      .single();
    if (insErr || !p) {
      console.error('Enregistrement paiement', JSON.stringify(insErr));
      return json({ ok: false, error: 'enregistrement', detail: insErr?.message ?? null }, 500);
    }

    const retour = retourAutorise(body.retour_url) ?? `${SITE}/paiement-termine.html`;
    const sep = retour.includes('?') ? '&' : '?';
    const meta = user.user_metadata ?? {};
    const customer: Record<string, string> = {};
    if (meta.prenom || meta.pseudo) customer.name = String(meta.prenom ?? meta.pseudo).slice(0, 80);
    if (user.email) customer.email = user.email;
    const phone = user.phone || meta.telephone;
    if (phone) customer.phone = `+${String(phone).replace(/\D/g, '')}`;

    const res = await fetch(`${API}/payments`, {
      method: 'POST',
      headers: geniusHeaders(),
      body: JSON.stringify({
        amount: montant,
        // L'API n'accepte que XOF/EUR/USD (une autre devise est refusée ou convertie).
        // XOF et XAF ont exactement la même valeur (655,957 pour 1 euro) : 1 500 XOF = 1 500 FCFA.
        currency: 'XOF',
        description,
        customer,
        success_url: `${retour}${sep}id=${p.id}`,
        error_url: `${retour}${sep}id=${p.id}&echec=1`,
        metadata: { paiement_id: p.id, user_id: user.id, type, plan, periode },
      }),
    });
    const gp = await res.json().catch(() => null);
    const d = gp?.data ?? gp;
    const url = d?.checkout_url ?? d?.payment_url;
    if (!res.ok || !url) {
      await db.from('paiements').update({ statut: 'echoue' }).eq('id', p.id);
      console.error('GeniusPay creation', res.status, JSON.stringify(gp));
      const champs = gp?.error?.details ?? gp?.error?.errors ?? gp?.errors;
      const detail = [gp?.error?.message ?? gp?.message ?? `HTTP ${res.status}`, champs ? JSON.stringify(champs).slice(0, 200) : null]
        .filter(Boolean)
        .join(' ');
      return json({ ok: false, error: 'geniuspay', detail }, 502);
    }
    await db.from('paiements').update({ reference: d.reference ?? null, checkout_url: url }).eq('id', p.id);
    return json({ ok: true, paiement_id: p.id, checkout_url: url, montant });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: 'interne', detail: String(e).slice(0, 200) }, 500);
  }
});
