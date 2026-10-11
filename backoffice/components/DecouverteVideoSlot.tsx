'use client';

import { removeDecouverteVideo } from '@/app/(admin)/decouverte/[slug]/actions';
import { definirLienVideoDecouverte } from '@/lib/actionsLienVideo';
import { LienVideoCellule } from './LienVideoCellule';

/**
 * Vidéo d'une fiche Découverte pour UNE langue (pas de chapitres). Depuis le
 * 2026-10-11 : lien YouTube / Vimeo au lieu d'un fichier envoyé.
 */
export function DecouverteVideoSlot({
  slug,
  lang,
  label,
  url,
  visionnages,
}: {
  slug: string;
  lang: string;
  label: string;
  url?: string;
  visionnages: number;
}) {
  return (
    <LienVideoCellule
      label={label}
      url={url}
      visionnages={visionnages}
      enregistrer={(lien) => definirLienVideoDecouverte(slug, lang, lien)}
      retirer={() => removeDecouverteVideo(slug, lang)}
    />
  );
}
