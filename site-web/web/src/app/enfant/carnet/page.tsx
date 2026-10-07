'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { KidShell, Soon } from '@/components/kids';
import { useKid } from '@/lib/kid';
import { supabase } from '@/lib/supabase';
import { decouverteLabel } from '@/lib/catalogue';
import { loc } from '@/lib/lang';
import type { DecouverteCard } from '@/lib/types';
import { useLang } from '@/lib/lang-client';

/** Carnet d'explorateur : les vraies fiches Découverte, si le parent l'a activé. */
export default function Carnet() {
  const { kid } = useKid();
  const { tr, lang } = useLang();
  const [items, setItems] = useState<DecouverteCard[] | null>(null);
  useEffect(() => {
    const cols = 'id,slug,type,pays,region_ethnie,titre,sous_titre,resume_liste,image_url,ordre_affichage,statut_publication';
    (async () => {
      const first = await supabase.from('decouverte_items').select(`${cols},titre_en`).order('ordre_affichage');
      const data = first.error ? (await supabase.from('decouverte_items').select(cols).order('ordre_affichage')).data : first.data;
      setItems(((data ?? []) as DecouverteCard[]).filter((d) => (d.statut_publication ?? 'publie') !== 'depublie'));
    })();
  }, []);

  return (
    <KidShell back="/enfant" title={tr('Carnet d’explorateur', 'Explorer’s notebook')}>
      {kid && !kid.decouverte_activee ? (
        <Soon icon="🧭" text={tr('Le carnet d’explorateur n’est pas activé. Demande à un parent !', 'The explorer’s notebook is not turned on. Ask a parent!')} />
      ) : (
        <>
          <p className="text-lg font-bold text-white/75">{tr('Découvre un village, une coutume ou un objet africain !', 'Discover an African village, custom or object!')}</p>
          {items === null && <p className="mt-6 text-white/60">{tr('Un instant…', 'One moment…')}</p>}
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
            {items?.map((d, i) => (
              <motion.div key={d.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.04, rotate: i % 2 ? 1 : -1 }}>
                <Link href={`/enfant/carnet/${d.slug}`} className="block overflow-hidden rounded-[28px] bg-white/10 ring-4 ring-white/10 transition hover:ring-gold/60">
                  {d.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.image_url} alt="" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="grid aspect-square place-items-center text-5xl">🧭</div>
                  )}
                  <div className="p-4">
                    <p className="text-xs font-black tracking-[0.15em] text-gold">{decouverteLabel(d.type, lang).toUpperCase()}</p>
                    <p className="mt-1 line-clamp-2 text-lg font-black leading-tight text-white">{loc(d as never, 'titre', lang)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </KidShell>
  );
}
