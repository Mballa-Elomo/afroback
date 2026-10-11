'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { colors, fonts } from '@/lib/theme';
import { analyserLienVideo, miniature } from '@/lib/lienVideo';
import { ConfirmModal } from './ConfirmModal';

/**
 * Emplacement vidéo par lien YouTube / Vimeo (2026-10-11), utilisé pour les
 * chapitres des héros et des mythes et pour les fiches Découverte. On colle
 * le lien, on voit l'aperçu, on enregistre. Une ancienne vidéo envoyée en
 * fichier reste affichée et peut être remplacée par un lien.
 */
export function LienVideoCellule({
  label,
  url,
  visionnages,
  enregistrer,
  retirer,
}: {
  label: string;
  url?: string;
  visionnages: number;
  enregistrer: (lien: string) => Promise<{ error: string | null }>;
  retirer: () => Promise<void>;
}) {
  const router = useRouter();
  const [saisie, setSaisie] = useState('');
  const [edition, setEdition] = useState(!url);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const actuel = analyserLienVideo(url);
  const apercu = analyserLienVideo(saisie);
  const apercuValide = !!apercu && apercu.type !== 'fichier';
  const vignette = actuel ? miniature(actuel) : null;

  const valider = () => {
    setErreur(null);
    startTransition(async () => {
      const r = await enregistrer(saisie);
      if (r.error) setErreur(r.error);
      else {
        setSaisie('');
        setEdition(false);
        router.refresh();
      }
    });
  };

  const source = !actuel ? null : actuel.type === 'youtube' ? 'YouTube' : actuel.type === 'vimeo' ? 'Vimeo' : 'Fichier hébergé (ancien envoi)';

  return (
    <div>
      {url && actuel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: edition ? 10 : 0 }}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Ouvrir la vidéo dans un nouvel onglet"
            style={{
              position: 'relative',
              width: 112,
              height: 63,
              flex: 'none',
              borderRadius: 9,
              overflow: 'hidden',
              background: vignette ? `center / cover no-repeat url(${vignette})` : 'linear-gradient(135deg, #241910, #120c07)',
              border: `1px solid ${colors.borderStrong}`,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(240,195,107,.92)',
                color: '#1a1109',
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
                boxShadow: '0 4px 14px rgba(0,0,0,.4)',
              }}
            >
              ▶
            </span>
          </a>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>
              Vidéo {label} · <span style={{ color: colors.accentGold }}>{source}</span>
            </div>
            <div style={{ fontSize: 10.5, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
            <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>
              👁 {visionnages.toLocaleString('fr-FR')} visionnage{visionnages === 1 ? '' : 's'}
            </div>
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.positive, flex: 'none' }}>EN LIGNE</span>
        </div>
      )}

      {edition ? (
        <div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={saisie}
              onChange={(e) => {
                setSaisie(e.target.value);
                setErreur(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && apercuValide && !pending) {
                  e.preventDefault();
                  valider();
                }
              }}
              placeholder={`Lien YouTube ou Vimeo de la vidéo ${label.toLowerCase()}`}
              style={{
                flex: 1,
                minWidth: 0,
                background: '#170f0a',
                border: `1px solid ${saisie && !apercuValide ? 'rgba(224,122,95,.6)' : colors.border}`,
                borderRadius: 10,
                padding: '10px 12px',
                color: colors.textPrimary,
                fontSize: 13,
              }}
            />
            <button
              type="button"
              disabled={!apercuValide || pending}
              onClick={valider}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: '0 16px',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: !apercuValide || pending ? 'default' : 'pointer',
                opacity: !apercuValide || pending ? 0.45 : 1,
                background: `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
                color: colors.ctaTextOnGold,
              }}
            >
              {pending ? '…' : 'Enregistrer'}
            </button>
            {url && (
              <button
                type="button"
                onClick={() => {
                  setEdition(false);
                  setSaisie('');
                  setErreur(null);
                }}
                style={{ background: 'none', border: `1px solid ${colors.border}`, borderRadius: 10, padding: '0 12px', color: colors.textMuted, fontSize: 12, cursor: 'pointer' }}
              >
                Annuler
              </button>
            )}
          </div>
          <div style={{ fontSize: 10.5, marginTop: 6, color: saisie && !apercuValide ? colors.terracottaText : colors.textMuted }}>
            {!saisie
              ? 'Ex. : https://youtu.be/… ou https://vimeo.com/… (vidéo publique ou non répertoriée, intégration autorisée).'
              : apercuValide
                ? `✓ Lien ${apercu!.type === 'youtube' ? 'YouTube' : 'Vimeo'} reconnu`
                : 'Ce lien n’est pas une vidéo YouTube ou Vimeo.'}
          </div>
          {apercuValide && apercu!.type === 'youtube' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={miniature(apercu!)!} alt="" style={{ marginTop: 8, width: 160, borderRadius: 8, border: `1px solid ${colors.border}` }} />
          )}
        </div>
      ) : (
        url && (
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            <span onClick={() => setEdition(true)} style={{ fontSize: 10.5, color: colors.accentGold, cursor: 'pointer', textDecoration: 'underline' }}>
              Remplacer par un autre lien
            </span>
            <ConfirmModal
              trigger={<span style={{ fontSize: 10.5, color: colors.textFaint, cursor: 'pointer', textDecoration: 'underline' }}>Retirer cette vidéo</span>}
              title="Retirer cette vidéo ?"
              description="L'app et le site ne l'afficheront plus. La vidéo elle-même reste sur YouTube ou Vimeo."
              confirmLabel="Retirer"
              onConfirm={retirer}
            />
          </div>
        )
      )}
      {erreur && <div style={{ fontSize: 11, color: colors.terracottaText, marginTop: 6 }}>{erreur}</div>}
    </div>
  );
}
