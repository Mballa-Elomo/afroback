'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LANG_COOKIE, localeOf, pick, type Lang } from './lang';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** tr('Texte', 'Text') : la version de la langue choisie. */
  tr: (fr: string, en: string) => string;
  locale: string;
};
const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ initial, children }: { initial: Lang; children: React.ReactNode }) {
  const [lang, setState] = useState<Lang>(initial);
  const router = useRouter();
  const setLang = useCallback(
    (l: Lang) => {
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
      setState(l);
      // Les pages préparées côté serveur (catalogue, fiches) se rechargent dans la nouvelle langue.
      router.refresh();
    },
    [router],
  );
  const value = useMemo(() => ({ lang, setLang, tr: (fr: string, en: string) => pick(lang, fr, en), locale: localeOf(lang) }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const c = useContext(LangContext);
  if (!c) throw new Error('useLang doit être utilisé dans <LangProvider>.');
  return c;
}

/** Sélecteur FR / EN. */
export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label="Langue / Language" className={`flex rounded-full bg-text/10 p-0.5 text-[11px] font-extrabold tracking-wider ${className}`}>
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => l !== lang && setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1.5 transition ${lang === l ? 'bg-gold text-ink' : 'text-body hover:text-ivory'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
