// =====================================================================
// AFROBACK — Edge Function "cinetpay" (cdc-paiement-geniuspay.md, §10)
//
// Remplace la fonction "geniuspay" (Mobile Money Cameroun jamais reçu via
// GeniusPay, 2026-09-29). Nouvelle API CinetPay v1 (2026) : connexion par
// clé + mot de passe API → jeton, puis appels authentifiés.
//   - clé sk_test_… → bac à sable https://api.cinetpay.net
//   - clé sk_live_… → production   https://api.cinetpay.co
//
// Trois usages dans une seule fonction :
//   - action "creer"    (app, personne connectée) : calcule le montant côté
//     serveur, enregistre la ligne `paiements`, crée le paiement CinetPay
//     et renvoie l'adresse de la page de paiement ;
//   - actions "verifier" / "verifier_en_attente" (app) : redemande le statut
//     À CINETPAY et crédite si le paiement est réussi ;
//   - notification CinetPay (notify_url) : même vérification.
// Le statut n'est JAMAIS cru sur parole : il est toujours relu auprès de
// l'API CinetPay avant de créditer.
//
// Mise en place par Yannick (tableau de bord Supabase → Edge Functions) :
//   1. "Deploy a new function" → "Via Editor", nom : cinetpay, coller ce
//      fichier, déployer, puis DÉSACTIVER "Verify JWT" dans ses réglages.
//   2. Edge Functions → Secrets :
//        CINETPAY_API_KEY      = sk_test_… (puis sk_live_…)
//        CINETPAY_API_PASSWORD = le mot de passe API du panel CinetPay
//        CINETPAY_CURRENCY     = XAF (facultatif, XAF par défaut)
//      Ne jamais coller ces clés ailleurs.
// =====================================================================
import { createClient } from 'npm:@supabase/supabase-js@2';

const API_KEY = Deno.env.get('CINETPAY_API_KEY') ?? '';
const API_PASSWORD = Deno.env.get('CINETPAY_API_PASSWORD') ?? '';
const API = API_KEY.startsWith('sk_live_') ? 'https://api.cinetpay.co' : 'https://api.cinetpay.net';
const ENVIRONNEMENT = API_KEY.startsWith('sk_live_') ? 'live' : 'sandbox';
const DEVISE = Deno.env.get('CINETPAY_CURRENCY') ?? 'XAF';
const SITE = 'https://afroback-test.vercel.app';
const NOTIFY_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/cinetpay`;

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

// Appel authentifié à l'API CinetPay v1 : connexion (clé + mot de passe) → jeton, puis requête.
async function cinetpay(method: string, path: string, body?: unknown): Promise<{ status: number; data: any }> {
  const entetes = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const login = await fetch(`${API}/v1/oauth/login`, {
    method: 'POST',
    headers: entetes,
    body: JSON.stringify({ api_key: API_KEY, api_password: API_PASSWORD }),
  });
  const auth = await login.json().catch(() => null);
  if (!auth?.access_token) {
    return { status: 401, data: { description: `connexion CinetPay refusée (${auth?.status ?? login.status})` } };
  }
  const r = await fetch(`${API}${path}`, {
    method,
    headers: { ...entetes, Authorization: `Bearer ${auth.access_token}` },
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

function statutDepuisCinetpay(s: unknown): string {
  switch (String(s ?? '').toUpperCase()) {
    case 'SUCCESS':
      return 'reussi';
    case 'FAILED':
    case 'INSUFFICIENT_BALANCE':
    case 'USER_IS_BLOCKED':
    case 'NOT_ALLOWED':
      return 'echoue';
    case 'EXPIRED':
      return 'expire';
    default:
      return 'en_attente';
  }
}

// Relit le paiement auprès de CinetPay et met la base à jour. Renvoie le statut AFROBACK
// et, pour le diagnostic, la réponse brute de CinetPay.
async function synchroniser(db: ReturnType<typeof admin>, p: { id: string; reference: string | null; statut: string }) {
  if (p.statut === 'reussi' || !p.reference) return { statut: p.statut, diag: p.reference ? 'deja_credite' : 'sans_reference' };
  const { status, data: d } = await cinetpay('GET', `/v1/payment/${encodeURIComponent(p.reference)}`);
  if (status >= 400 || !d) {
    console.error('CinetPay statut', p.reference, status, JSON.stringify(d));
    return { statut: p.statut, diag: `HTTP ${status} ${d?.status ?? d?.description ?? ''}`.trim() };
  }
  // La transaction interrogée doit bien être la nôtre.
  if (d.merchant_transaction_id && d.merchant_transaction_id !== p.id) return { statut: p.statut, diag: 'transaction_etrangere' };
  const brut = d.status ?? null;
  const statut = statutDepuisCinetpay(brut);
  if (statut === 'reussi') {
    const moyen = d.payment_method ?? d.operator ?? d.channel ?? null;
    const { error } = await db.rpc('crediter_paiement', {
      p_paiement_id: p.id,
      p_frais: null,
      p_moyen: moyen ? String(moyen).slice(0, 40) : null,
      p_environnement: ENVIRONNEMENT,
    });
    if (error) {
      console.error('crediter_paiement', p.id, JSON.stringify(error));
      return { statut: p.statut, diag: `credit: ${error.message}` };
    }
  } else if (statut !== 'en_attente' && statut !== p.statut) {
    await db.from('paiements').update({ statut }).eq('id', p.id).neq('statut', 'reussi');
  }
  return { statut, diag: `cinetpay: ${brut ?? '?'}` };
}

// Notification CinetPay (JSON ou formulaire) : on n'en retient que l'identifiant de
// NOTRE paiement (merchant_transaction_id), puis on relit le statut chez CinetPay.
async function notification(body: Record<string, unknown>) {
  const merchantId = String(body.merchant_transaction_id ?? '');
  const cpId = body.transaction_id ? String(body.transaction_id) : null;
  if (!/^[0-9a-f-]{36}$/i.test(merchantId)) return json({ ok: true, ignore: true });
  const db = admin();
  const { data: p } = await db.from('paiements').select('id, reference, statut').eq('id', merchantId).maybeSingle();
  if (!p) return json({ ok: true, inconnu: true });
  if (!p.reference && cpId) {
    await db.from('paiements').update({ reference: cpId }).eq('id', p.id);
    p.reference = cpId;
  }
  const { statut } = await synchroniser(db, p);
  return json({ ok: true, statut });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    // Appel depuis l'app : identité vérifiée via le jeton de la personne connectée.
    // Sans jeton utilisateur, seule une notification CinetPay est acceptée.
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
      if (body.merchant_transaction_id) return await notification(body);
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
        .eq('statut', 'en_attente')
        .gte('created_at', depuis)
        .order('created_at', { ascending: false })
        .limit(5);
      let credite = 0;
      const diags: string[] = [];
      for (const r of rows ?? []) {
        if (!r.reference) {
          // Paiement jamais parti chez CinetPay : on le clôt après 1 h.
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
    if (!API_KEY || !API_PASSWORD) return json({ ok: false, error: 'non_configure' }, 503);

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
      // CinetPay : montant multiple de 5.
      if (!Number.isFinite(montant) || montant < DON_MIN || montant > DON_MAX || montant % 5 !== 0) {
        return json({ ok: false, error: 'montant_invalide' }, 400);
      }
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
    const prenom = String(meta.prenom ?? meta.pseudo ?? 'Membre').slice(0, 60);
    const { status, data: cp } = await cinetpay('POST', '/v1/payment', {
      currency: DEVISE,
      merchant_transaction_id: p.id,
      amount: montant,
      lang: meta.langue === 'en' ? 'en' : 'fr',
      designation: description,
      client_email: user.email ?? 'afroback3d@gmail.com',
      client_first_name: prenom,
      client_last_name: 'AFROBACK',
      success_url: `${retour}${sep}id=${p.id}`,
      failed_url: `${retour}${sep}id=${p.id}&echec=1`,
      notify_url: NOTIFY_URL,
      channel: 'PUSH',
    });
    if (status >= 400 || !cp?.payment_url) {
      await db.from('paiements').update({ statut: 'echoue' }).eq('id', p.id);
      console.error('CinetPay creation', status, JSON.stringify(cp));
      const detail = [cp?.status, cp?.description ?? cp?.message ?? `HTTP ${status}`].filter(Boolean).join(' · ');
      return json({ ok: false, error: 'passerelle', detail }, 502);
    }
    await db
      .from('paiements')
      .update({ reference: cp.transaction_id ? String(cp.transaction_id) : null, checkout_url: cp.payment_url, environnement: ENVIRONNEMENT })
      .eq('id', p.id);
    return json({ ok: true, paiement_id: p.id, checkout_url: cp.payment_url, montant });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: 'interne', detail: String(e).slice(0, 200) }, 500);
  }
});
