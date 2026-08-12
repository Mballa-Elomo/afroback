import { getSupabaseAdmin } from '../supabase/server';

/**
 * Miroir de `mythes` (mobile-app/supabase/schema-mythologie.sql). Lecture
 * seule côté back-office, comme `decouverte.ts` : contenu produit par
 * l'agent griot, pas édité ici. Pas de colonne de publication sur cette
 * table (les 5 mythes sont publics dès leur insertion) — la liste sert
 * uniquement à voir en un coup d'œil ce qui manque (image, narration audio).
 */
export interface MytheAdmin {
  id: string;
  slug: string;
  titre: string;
  peuple: string;
  zone: string;
  /** Toujours peuplé par le pipeline actuel (recit_chapitres_fr jamais vide) — gardé en booléen calculé plutôt qu'affiché brut. */
  aRecit: boolean;
  image_url: string | null;
  narration_audio_url: string | null;
  ordre_affichage: number;
}

const LIST_COLUMNS = 'id, slug, titre, peuple, zone, recit_chapitres_fr, image_url, narration_audio_url, ordre_affichage';

interface RawMythe {
  id: string;
  slug: string;
  titre: string;
  peuple: string;
  zone: string;
  recit_chapitres_fr: unknown[];
  image_url: string | null;
  narration_audio_url: string | null;
  ordre_affichage: number;
}

export async function getMythesAdmin(): Promise<MytheAdmin[]> {
  const { data, error } = await getSupabaseAdmin().from('mythes').select(LIST_COLUMNS).order('ordre_affichage', { ascending: true });
  if (error) throw new Error(`Impossible de charger les mythes : ${error.message}`);
  return ((data ?? []) as unknown as RawMythe[]).map((m) => ({
    id: m.id,
    slug: m.slug,
    titre: m.titre,
    peuple: m.peuple,
    zone: m.zone,
    aRecit: (m.recit_chapitres_fr ?? []).length > 0,
    image_url: m.image_url,
    narration_audio_url: m.narration_audio_url,
    ordre_affichage: m.ordre_affichage,
  }));
}
