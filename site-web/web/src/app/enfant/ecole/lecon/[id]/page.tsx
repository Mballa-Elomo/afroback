'use client';

import { use, useEffect, useState } from 'react';
import { KidButton, KidShell, Soon } from '@/components/kids';
import { heroesList, lecon as getLecon, shortEra, type Lecon } from '@/lib/kids';
import { loc } from '@/lib/lang';
import type { HerosCard } from '@/lib/types';
import { useLang } from '@/lib/lang-client';

type Format = 'lire' | 'ecouter' | 'regarder' | 'bd';
const FORMATS: { id: Format; icon: string; label: string; en: string }[] = [
  { id: 'lire', icon: '📖', label: 'Lire', en: 'Read' },
  { id: 'ecouter', icon: '🎧', label: 'Écouter', en: 'Listen' },
  { id: 'regarder', icon: '🎬', label: 'Regarder', en: 'Watch' },
  { id: 'bd', icon: '💬', label: 'BD', en: 'Comic' },
];

/**
 * Leçon en 4 formats (comme app/enfant/ecole/lecon/[id].tsx). Seul le
 * contenu écrit POUR les enfants est montré, jamais le récit adulte. Un
 * format sans contenu affiche « pas encore prêt ». Le quiz s'ouvre dès
 * qu'au moins un format a du contenu.
 */
export default function LeconPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tr, lang } = useLang();
  const [l, setL] = useState<Lecon | null | undefined>(undefined);
  const [hero, setHero] = useState<HerosCard | undefined>();
  const [format, setFormat] = useState<Format>('lire');

  useEffect(() => {
    getLecon(id).then(async (x) => {
      setL(x);
      if (x) setHero((await heroesList()).find((h) => h.id === x.heros_id));
    });
  }, [id]);

  if (l === undefined)
    return (
      <KidShell back="/enfant/ecole">
        <p className="text-center text-xl font-bold text-white/60">{tr('La leçon se prépare…', 'The lesson is getting ready…')}</p>
      </KidShell>
    );
  if (l === null)
    return (
      <KidShell back="/enfant/ecole">
        <Soon icon="🤔" text={tr('Cette leçon n’existe pas ou plus.', 'This lesson does not exist anymore.')} />
      </KidShell>
    );

  const planches = [...(l.bd_planches ?? [])].sort((a, b) => a.ordre - b.ordre);
  const texte = (lang === 'en' && l.texte_adapte_en) || l.texte_adapte;
  const audio = (lang === 'en' && l.narration_audio_url_en) || l.narration_audio_url;
  const has: Record<Format, boolean> = { lire: !!texte, ecouter: !!audio, regarder: !!l.video_url, bd: planches.length > 0 };
  const canQuiz = Object.values(has).some(Boolean);

  return (
    <KidShell back="/enfant/ecole" title={hero ? loc(hero as never, 'nom_affiche', lang) : tr('Leçon', 'Lesson')}>
      <div className="flex items-center gap-5">
        {hero?.image_carte_catalogue && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.image_carte_catalogue} alt="" className="h-24 w-24 rounded-full object-cover object-top ring-4 ring-gold" />
        )}
        <div>
          <h1 className="text-3xl font-black text-white md:text-4xl">{hero ? loc(hero as never, 'nom_affiche', lang) : tr('Héros', 'Hero')}</h1>
          <p className="font-semibold text-white/60">{hero ? `${shortEra(loc(hero as never, 'epoque', lang))} · ${shortEra(loc(hero as never, 'region', lang))}` : '—'}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-3">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={`relative rounded-[22px] p-4 text-center transition ${format === f.id ? 'bg-gold text-ink shadow-[0_5px_0_#b9792f]' : 'bg-white/10 text-white hover:bg-white/15'}`}
          >
            <span className="block text-3xl">{f.icon}</span>
            <span className="mt-1 block text-sm font-black">{tr(f.label, f.en)}</span>
            {!has[f.id] && <span className="absolute right-2 top-2 text-xs">🔒</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {format === 'lire' && (has.lire ? <p className="whitespace-pre-line rounded-[28px] bg-white/8 p-7 text-xl leading-relaxed text-white/90">{texte}</p> : <Soon icon="📖" />)}
        {format === 'ecouter' &&
          (has.ecouter ? (
            <div className="rounded-[28px] bg-white/8 p-7 text-center">
              <p className="text-lg font-black text-white">{tr('Narration pour les enfants', 'Narration for children')}</p>
              <audio controls src={audio!} className="mt-5 w-full" />
            </div>
          ) : (
            <Soon icon="🎧" />
          ))}
        {format === 'regarder' && (has.regarder ? <video controls src={l.video_url!} className="w-full rounded-[28px] bg-black" /> : <Soon icon="🎬" />)}
        {format === 'bd' &&
          (has.bd ? (
            <div className="grid gap-5 md:grid-cols-2">
              {planches.map((p) => (
                <figure key={p.ordre} className="overflow-hidden rounded-[24px] bg-white/8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" className="w-full" />
                  {p.texte && <figcaption className="p-4 text-lg font-semibold text-white/90">{p.texte}</figcaption>}
                </figure>
              ))}
            </div>
          ) : (
            <Soon icon="💬" />
          ))}
      </div>

      <div className="mx-auto mt-10 max-w-md">
        <KidButton href={canQuiz ? `/enfant/ecole/quiz/${l.id}` : undefined} disabled={!canQuiz}>
          {canQuiz ? tr('Je suis prêt pour le quiz !', "I'm ready for the quiz!") : tr('Contenu pas encore disponible', 'Content not available yet')}
        </KidButton>
      </div>
    </KidShell>
  );
}
