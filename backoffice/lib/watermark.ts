import { Jimp, loadFont, JimpMime } from 'jimp';
import { SANS_16_WHITE, SANS_32_WHITE } from 'jimp/fonts';

/**
 * Lot 2 cybersécurité (2026-09-25) : filigrane discret "AFROBACK" apposé sur
 * chaque photo uploadée depuis le back-office (héros, Découverte,
 * Mythologie) — dissuade/trace une réutilisation du contenu hors du produit,
 * sans dégrader la lisibilité de l'image.
 *
 * LIMITE HONNÊTE : `jimp` (bibliothèque pure JS, choisie pour rester
 * portable en environnement serverless sans dépendance native comme
 * `sharp`) ne sait pas décoder/encoder le WEBP. Les 3 pipelines d'upload
 * acceptent pourtant `.webp` (format déjà utilisé côté app mobile) — dans
 * ce cas précis, le fichier est uploadé tel quel, SANS filigrane, plutôt que
 * de rejeter l'upload ou de planter. Signalé explicitement à l'appelant
 * (voir `watermarked` dans le retour) pour ne jamais prétendre à tort qu'un
 * filigrane a été appliqué.
 */
export interface WatermarkResult {
  buffer: Buffer;
  contentType: string;
  watermarked: boolean;
}

const WATERMARKABLE_MIME = new Set(['image/jpeg', 'image/png']);

export async function applyWatermark(input: Buffer, mimeType: string): Promise<WatermarkResult> {
  if (!WATERMARKABLE_MIME.has(mimeType)) {
    // webp (ou tout autre format non supporté par jimp) : passage tel quel, honnêtement signalé.
    return { buffer: input, contentType: mimeType, watermarked: false };
  }

  const image = await Jimp.fromBuffer(input);
  const label = 'AFROBACK';
  const font = await loadFont(image.width >= 500 ? SANS_32_WHITE : SANS_16_WHITE);

  // Bandeau semi-transparent en bas à droite, assez large pour le texte
  // quelle que soit la taille de police choisie ci-dessus.
  const padding = Math.round(image.width * 0.015) + 6;
  const textWidth = label.length * (image.width >= 500 ? 20 : 10) + padding * 2;
  const textHeight = (image.width >= 500 ? 32 : 16) + padding * 2;
  const badge = new Jimp({ width: textWidth, height: textHeight, color: 0x000000aa });
  badge.print({ font, x: padding, y: padding, text: label });

  image.composite(badge, image.width - textWidth - 10, image.height - textHeight - 10, { opacitySource: 0.75 });

  const outMime = mimeType === 'image/png' ? JimpMime.png : JimpMime.jpeg;
  const buffer = await image.getBuffer(outMime);
  return { buffer, contentType: outMime, watermarked: true };
}
