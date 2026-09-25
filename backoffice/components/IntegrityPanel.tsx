'use client';

import { useState, useTransition } from 'react';
import { colors, fonts } from '@/lib/theme';
import { verifyContentIntegrity } from '@/lib/integrityActions';

/**
 * Panneau "Intégrité du contenu" (lot cybersécurité, 2026-09-25) — affiche
 * l'empreinte SHA-256 et la signature HMAC calculées automatiquement par un
 * trigger Postgres à chaque écriture (voir
 * mobile-app/supabase/schema-integrite-contenu.sql), et permet de
 * revérifier à la demande que le contenu actuel correspond bien à
 * l'empreinte stockée. Utilisé sur les 3 fiches de contenu éditorial
 * (héros, Découverte, Mythologie).
 */
export function IntegrityPanel({
  tableName,
  rowId,
  contenuHash,
  contenuSignature,
  integriteCalculeeLe,
}: {
  tableName: 'heros' | 'decouverte_items' | 'mythes';
  rowId: string;
  contenuHash: string | null;
  contenuSignature: string | null;
  integriteCalculeeLe: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ match: boolean; recomputedHash: string } | { error: string } | null>(null);

  const onVerify = () => {
    startTransition(async () => {
      const res = await verifyContentIntegrity(tableName, rowId);
      setResult(res.ok ? { match: res.match, recomputedHash: res.recomputedHash } : { error: res.error });
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Row label="EMPREINTE SHA-256" value={contenuHash} />
      <Row label="SIGNATURE (HMAC)" value={contenuSignature} />
      <Row
        label="CALCULÉE LE"
        value={integriteCalculeeLe ? new Date(integriteCalculeeLe).toLocaleString('fr-FR') : null}
        mono={false}
      />

      <button
        onClick={onVerify}
        disabled={pending || !contenuHash}
        title={!contenuHash ? "Pas encore d'empreinte calculée pour cette fiche" : undefined}
        style={{
          font: 'inherit',
          fontSize: 12,
          fontWeight: 700,
          padding: '9px 14px',
          borderRadius: 9,
          border: `1px solid ${colors.borderStrong}`,
          background: 'transparent',
          color: colors.accentGold,
          cursor: pending || !contenuHash ? 'default' : 'pointer',
          opacity: pending || !contenuHash ? 0.5 : 1,
          alignSelf: 'flex-start',
          marginTop: 4,
        }}
      >
        {pending ? 'Vérification...' : "Vérifier l'intégrité"}
      </button>

      {result && 'error' in result && <p style={{ fontSize: 11.5, color: colors.terracottaText, margin: 0 }}>{result.error}</p>}
      {result && 'match' in result && (
        <p
          style={{
            fontSize: 11.5,
            margin: 0,
            color: result.match ? colors.positive : colors.terracottaText,
            fontWeight: 700,
          }}
        >
          {result.match
            ? '✅ Contenu intact — l’empreinte recalculée correspond à celle stockée.'
            : '⚠️ Écart détecté — le contenu actuel ne correspond plus à l’empreinte enregistrée.'}
        </p>
      )}

      <p style={{ fontSize: 10.5, color: colors.textFaint, lineHeight: 1.5, margin: '4px 0 0' }}>
        Empreinte et signature recalculées automatiquement à chaque écriture (trigger Postgres, pas le code
        applicatif) — s&apos;appliquent quel que soit le chemin d&apos;écriture. La signature est un HMAC-SHA256
        avec une clé connue uniquement du serveur, pas une signature numérique asymétrique complète (PKI) — voir la
        limite documentée dans le script SQL.
      </p>
    </div>
  );
}

function Row({ label, value, mono = true }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: '.06em', color: colors.textFaint, marginBottom: 3 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? fonts.mono : 'inherit',
          fontSize: mono ? 11 : 12.5,
          color: value ? colors.textPrimary : colors.textFaint,
          wordBreak: 'break-all',
        }}
      >
        {value ?? '— pas encore calculée —'}
      </div>
    </div>
  );
}
