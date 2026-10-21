import { getSupabaseAdmin } from '@/lib/supabase/server';
import { colors, fonts } from '@/lib/theme';
import { TeaserSlots } from './TeaserSlots';
import type { Teaser, TeaserType } from '@/lib/actionsTeaser';

const TABLE: Record<TeaserType, string> = { heros: 'heros', mythe: 'mythes', decouverte: 'decouverte_items' };

/**
 * Section « Teaser » d'une fiche (héros, mythe, Découverte) : les 4 versions
 * de la vidéo d'introduction de 30 s (FR / EN × paysage / vertical), produites
 * avec /afroback_teaser. Composant serveur : lit lui-même la colonne `teaser`.
 */
export async function TeaserPanel({ type, slug }: { type: TeaserType; slug: string }) {
  const { data, error } = await getSupabaseAdmin().from(TABLE[type]).select('teaser').eq('slug', slug).maybeSingle();
  const manqueSchema = !!error && /teaser/.test(error.message);
  const teaser = ((data as { teaser?: Teaser } | null)?.teaser ?? {}) as Teaser;

  return (
    <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <div style={{ fontFamily: fonts.display, fontSize: 12, letterSpacing: '.1em', color: colors.accentGoldSoft, marginBottom: 6 }}>TEASER (VIDÉO D’INTRODUCTION)</div>
      <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.5, margin: '0 0 16px' }}>
        Vidéo de 30 s affichée en premier sur la fiche, pour tous (abonnés ou non). L’app utilise la version verticale, le site la version paysage (et
        l’autre à défaut). Collez le lien YouTube (Shorts accepté) ou Vimeo de chaque version.
      </p>
      {manqueSchema ? (
        <p style={{ fontSize: 12, color: colors.accentGold }}>Exécutez d’abord supabase/schema-teasers.sql dans Supabase pour activer les teasers.</p>
      ) : (
        <TeaserSlots type={type} slug={slug} teaser={teaser} />
      )}
    </div>
  );
}
