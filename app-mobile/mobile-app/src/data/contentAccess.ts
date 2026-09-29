import { supabase } from './supabaseClient';

/**
 * Accès au contenu complet (cdc-acces-gratuit-abonnement.md, lot A).
 *
 * Les catalogues ne lisent que les colonnes publiques (titre, image,
 * résumé…). Le contenu complet (récit, audio, vidéo, texte Découverte) passe
 * par une fonction serveur `get_<type>_detail` qui décide : contenu gratuit
 * ou abonnement actif → tout ; sinon → un court aperçu et `verrouille: true`.
 * Le cadenas n'est donc pas qu'un affichage : l'app ne reçoit jamais le
 * contenu réservé.
 *
 * Transition : tant que `supabase/schema-acces-abonnement.sql` n'a pas été
 * exécuté, la fonction serveur n'existe pas → on retombe sur l'ancienne
 * lecture directe (tout reste accessible, comme avant).
 */

export type ContentType = 'heros' | 'mythe' | 'decouverte';

export interface AccesContenu {
  verrouille: boolean;
  apercu_fr?: string;
  apercu_en?: string;
}

type DetailResult =
  | { verrouille: false; row: Record<string, unknown> }
  | { verrouille: true; apercu_fr: string; apercu_en: string }
  | null;

const RPC: Record<ContentType, string> = {
  heros: 'get_heros_detail',
  mythe: 'get_mythe_detail',
  decouverte: 'get_decouverte_detail',
};
const TABLE: Record<ContentType, string> = {
  heros: 'heros',
  mythe: 'mythes',
  decouverte: 'decouverte_items',
};

const cache = new Map<string, Promise<DetailResult>>();

/** Vide le cache des détails (connexion, déconnexion, abonnement qui change). */
export function clearContentDetailCache() {
  cache.clear();
}

supabase.auth.onAuthStateChange(() => clearContentDetailCache());

async function loadDetail(type: ContentType, slug: string): Promise<DetailResult> {
  const { data, error } = await supabase.rpc(RPC[type], { p_slug: slug });
  if (!error) {
    if (!data) return null;
    const json = data as Record<string, unknown>;
    if (json.verrouille === true) {
      return {
        verrouille: true,
        apercu_fr: (json.apercu_fr as string) ?? '',
        apercu_en: (json.apercu_en as string) ?? '',
      };
    }
    return { verrouille: false, row: json };
  }
  // Fonction serveur absente (script SQL pas encore exécuté) : ancienne lecture directe.
  if (error.code === 'PGRST202' || /function .* does not exist|Could not find the function/i.test(error.message)) {
    const res = await supabase.from(TABLE[type]).select('*').eq('slug', slug).maybeSingle();
    if (res.error) throw new Error(`Impossible de charger le contenu : ${res.error.message}`);
    return res.data ? { verrouille: false, row: res.data as Record<string, unknown> } : null;
  }
  throw new Error(`Impossible de charger le contenu : ${error.message}`);
}

export function getContentDetail(type: ContentType, slug: string): Promise<DetailResult> {
  const key = `${type}:${slug}`;
  let p = cache.get(key);
  if (!p) {
    p = loadDetail(type, slug);
    cache.set(key, p);
    p.catch(() => cache.delete(key));
  }
  return p;
}
