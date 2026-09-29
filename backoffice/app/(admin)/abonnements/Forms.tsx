'use client';

import { useActionState } from 'react';
import { colors, fonts } from '@/lib/theme';
import { ajouterContenuGratuit, offrirAbonnement, type ActionState } from './actions';

const input: React.CSSProperties = {
  background: colors.panelDeep,
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 10,
  padding: '10px 12px',
  color: colors.textPrimary,
  fontSize: 14,
  fontFamily: fonts.body,
};

const button: React.CSSProperties = {
  background: `linear-gradient(135deg, ${colors.ctaGradient[0]}, ${colors.ctaGradient[1]})`,
  color: colors.ctaTextOnGold,
  border: 'none',
  borderRadius: 999,
  padding: '10px 20px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

function Feedback({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p style={{ margin: '10px 0 0', fontSize: 13, color: state.ok ? colors.positive : colors.warning }}>{state.message}</p>
  );
}

export function OffrirForm() {
  const [state, action, pending] = useActionState(offrirAbonnement, null);
  return (
    <form action={action} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: colors.textMuted, flex: '2 1 220px' }}>
        E-mail du compte
        <input name="email" type="email" required placeholder="personne@exemple.com" style={input} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: colors.textMuted }}>
        Forfait
        <select name="plan" defaultValue="racines" style={input}>
          <option value="racines">Racines</option>
          <option value="heritage">Héritage</option>
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: colors.textMuted }}>
        Durée
        <select name="duree" defaultValue="30" style={input}>
          <option value="7">7 jours</option>
          <option value="30">30 jours</option>
          <option value="90">3 mois</option>
          <option value="365">1 an</option>
          <option value="illimite">Sans fin</option>
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: colors.textMuted, flex: '1 1 180px' }}>
        Note (facultatif)
        <input name="note" placeholder="ex. testeur, partenaire" style={input} />
      </label>
      <button type="submit" disabled={pending} style={{ ...button, opacity: pending ? 0.6 : 1 }}>
        {pending ? 'Envoi…' : 'Offrir'}
      </button>
      <div style={{ flexBasis: '100%' }}>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function GratuitForm() {
  const [state, action, pending] = useActionState(ajouterContenuGratuit, null);
  return (
    <form action={action} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: colors.textMuted }}>
        Type
        <select name="type" defaultValue="heros" style={input}>
          <option value="heros">Héros</option>
          <option value="mythe">Mythe</option>
          <option value="decouverte">Découverte</option>
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: colors.textMuted, flex: '1 1 220px' }}>
        Identifiant (slug)
        <input name="slug" required placeholder="ex. sultan-njoya" style={input} />
      </label>
      <button type="submit" disabled={pending} style={{ ...button, opacity: pending ? 0.6 : 1 }}>
        {pending ? 'Ajout…' : 'Rendre gratuit'}
      </button>
      <div style={{ flexBasis: '100%' }}>
        <Feedback state={state} />
      </div>
    </form>
  );
}
