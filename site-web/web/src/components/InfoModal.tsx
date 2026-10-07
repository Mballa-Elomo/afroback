'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ContentType, Detail, Tile } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { ContentView } from './ContentView';
import { useLang } from '@/lib/lang-client';

/**
 * Fenêtre « Plus d'infos » façon Netflix : s'ouvre par-dessus la page, se
 * ferme avec Échap, la croix ou un clic à côté. Le détail est demandé à la
 * fonction serveur get_*_detail (qui ne renvoie qu'un aperçu si le contenu
 * est réservé aux abonnés).
 */

const RPC: Record<ContentType, string> = { heros: 'get_heros_detail', mythe: 'get_mythe_detail', decouverte: 'get_decouverte_detail' };
const PATH: Record<ContentType, string> = { heros: 'heros', mythe: 'mythes', decouverte: 'decouverte' };

const Ctx = createContext<{ open: (t: Tile) => void }>({ open: () => {} });
export const useInfo = () => useContext(Ctx);

export function InfoProvider({ children }: { children: React.ReactNode }) {
  const { tr } = useLang();
  const [tile, setTile] = useState<Tile | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);

  const open = useCallback((t: Tile) => {
    setTile(t);
    setDetail(null);
    setLoading(true);
    supabase.rpc(RPC[t.type], { p_slug: t.slug }).then(({ data }) => {
      setDetail((data as Detail) ?? null);
      setLoading(false);
    });
  }, []);
  const close = useCallback(() => setTile(null), []);

  useEffect(() => {
    if (!tile) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [tile, close]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {tile && (
          <motion.div
            className="fixed inset-0 z-[70] overflow-y-auto bg-black/80 px-2 py-6 backdrop-blur-sm md:py-10"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={tile.title}
          >
            <motion.div
              initial={{ y: 40, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 30, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative mx-auto max-w-[1100px] overflow-hidden rounded-3xl bg-ink shadow-[0_40px_120px_rgba(0,0,0,0.8)] ring-1 ring-gold/25"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={close}
                className="absolute right-5 top-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-ink/80 text-ivory ring-1 ring-ivory/20 backdrop-blur transition hover:rotate-90 hover:bg-gold hover:text-ink"
                aria-label={tr('Fermer', 'Close')}
              >
                ✕
              </button>
              <ContentView tile={tile} detail={detail} loading={loading} compact />
              <div className="border-t border-gold/10 px-6 py-4 text-right md:px-10">
                <Link href={`/${PATH[tile.type]}/${tile.slug}`} onClick={close} className="text-sm font-semibold text-gold hover:underline">
                  {tr('Ouvrir la page complète ›', 'Open the full page ›')}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
