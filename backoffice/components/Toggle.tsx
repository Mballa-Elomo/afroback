'use client';

import { useTransition } from 'react';
import { colors } from '@/lib/theme';

/** Interrupteur on/off réutilisable — écrit immédiatement (action réversible en un clic, pas de confirmation nécessaire). */
export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => Promise<void>; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <span
      onClick={() => !disabled && !pending && startTransition(onChange)}
      style={{
        cursor: disabled || pending ? 'default' : 'pointer',
        width: 40,
        height: 22,
        borderRadius: 999,
        background: on ? colors.terracotta : '#2a1f14',
        position: 'relative',
        flex: 'none',
        transition: 'background .15s',
        opacity: pending ? 0.6 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .15s',
        }}
      />
    </span>
  );
}
