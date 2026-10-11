'use client';

import { useEffect, useRef, useState } from 'react';

/** Nombre qui défile de 0 à sa valeur à l'affichage (respecte « réduire les animations »). */
export function Compteur({ valeur, duree = 1100, suffixe = '' }: { valeur: number; duree?: number; suffixe?: string }) {
  const [v, setV] = useState(0);
  const depart = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(valeur);
      return;
    }
    let raf = 0;
    depart.current = null;
    const pas = (t: number) => {
      depart.current ??= t;
      const p = Math.min(1, (t - depart.current) / duree);
      setV(Math.round(valeur * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [valeur, duree]);

  return (
    <>
      {v.toLocaleString('fr-FR')}
      {suffixe}
    </>
  );
}
