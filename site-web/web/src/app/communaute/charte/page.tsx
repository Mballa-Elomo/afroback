'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CHARTE } from '@/components/community';
import { useLang } from '@/lib/lang-client';

export default function Charte() {
  const { tr } = useLang();
  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 pt-32">
      <Link href="/communaute" className="text-sm font-semibold text-gold">
        ‹ {tr('Communauté', 'Community')}
      </Link>
      <p className="mt-6 text-xs font-bold tracking-[0.3em] text-terra">{tr('CHARTE DE LA COMMUNAUTÉ', 'COMMUNITY CHARTER')}</p>
      <h1 className="text-gold-gradient mt-2 font-display text-5xl font-black">{tr('Les règles de la maison', 'House rules')}</h1>
      <div className="mt-10 space-y-4">
        {CHARTE.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-5 rounded-3xl bg-surface p-6 ring-1 ring-ivory/10"
          >
            <span className="font-display text-4xl font-black text-gold/50">{i + 1}</span>
            <div>
              <p className="font-display text-xl font-bold text-ivory">{tr(r.title, r.titleEn)}</p>
              <p className="mt-1 leading-relaxed text-body">{tr(r.text, r.textEn)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
