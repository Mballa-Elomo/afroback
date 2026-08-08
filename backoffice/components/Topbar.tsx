'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { colors, fonts } from '@/lib/theme';

/**
 * Fil d'ariane calculé depuis le chemin — un seul point de vérité, pas besoin
 * que chaque layout/page le passe en prop. Complété au fur et à mesure des
 * lots (voir lib/navItems.ts pour la liste complète des sections prévues).
 */
function crumbFor(pathname: string): string {
  if (pathname === '/') return 'Tableau de bord';
  if (pathname.startsWith('/heros/')) return 'Héros / Fiche';
  if (pathname === '/heros') return 'Héros';
  if (pathname.startsWith('/media')) return 'Bibliothèque médias';
  return '';
}

/**
 * Barre supérieure. La recherche globale de la maquette est réduite ici à
 * une recherche réelle sur le seul contenu déjà cherchable en lot 1 (les
 * héros) plutôt qu'un champ décoratif qui ne ferait rien — jamais un champ
 * mort. À étendre aux autres piliers quand ils seront construits.
 */
export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const crumb = crumbFor(pathname);
  const [q, setQ] = useState('');

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 28px',
        background: 'rgba(15,11,8,.86)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.borderHairline}`,
      }}
    >
      <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: '.06em', color: colors.textMuted }}>
        AFROBACK / <span style={{ color: colors.accentGold }}>{crumb}</span>
      </div>
      <div
        style={{
          flex: 1,
          maxWidth: 420,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          background: '#170f0a',
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: '9px 13px',
        }}
      >
        <span style={{ color: colors.textMutedAlt, fontSize: 13 }}>⌕</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && q.trim()) router.push(`/heros?q=${encodeURIComponent(q.trim())}`);
          }}
          placeholder="Rechercher un héros… (Entrée)"
          style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: colors.textPrimary, fontSize: 13 }}
        />
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
}
