'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserButton } from './UserButton';
import { useCart } from '@/lib/cart';
import { LangSwitch, useLang } from '@/lib/lang-client';

/**
 * Barre du site : transparente au-dessus du carrousel, puis verre dépoli qui
 * se resserre au défilement. Pastille dorée qui glisse d'une rubrique à
 * l'autre, recherche qui se déploie, menu plein écran animé sur téléphone.
 */

const LINKS = [
  { href: '/', label: 'Accueil', en: 'Home', match: (p: string) => p === '/' },
  { href: '/heros', label: 'Héros', en: 'Heroes', match: (p: string) => p.startsWith('/heros') },
  { href: '/mythes', label: 'Mythes', en: 'Myths', match: (p: string) => p.startsWith('/mythes') },
  { href: '/decouverte', label: 'Découverte', en: 'Discovery', match: (p: string) => p.startsWith('/decouverte') },
  { href: '/marche', label: 'Marché', en: 'Market', match: (p: string) => p.startsWith('/marche') },
  { href: '/communaute', label: 'Communauté', en: 'Community', match: (p: string) => p.startsWith('/communaute') },
];

export function TopNav() {
  const { tr } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      setHidden(y > 400 && y > lastY.current + 4);
      if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/recherche?q=${encodeURIComponent(query)}` : '/recherche');
  };
  const active = LINKS.find((l) => l.match(pathname))?.href ?? null;
  const pill = hover ?? active;

  return (
    <>
      <motion.header
        animate={{ y: hidden && !menuOpen ? -110 : 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
      >
        <nav
          className={`mx-auto flex max-w-[1500px] items-center gap-4 rounded-2xl px-4 transition-all duration-500 md:gap-8 md:px-6 ${
            scrolled
              ? 'h-16 border border-gold/15 bg-ink/70 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl'
              : 'h-20 border border-transparent bg-transparent'
          }`}
        >
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label={tr('AFROBACK, accueil', 'AFROBACK, home')}>
            <span className="relative">
              <span className="absolute inset-0 rounded-full bg-gold/40 blur-md transition group-hover:bg-gold/70" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-medaillon.jpg" alt="" className="relative h-10 w-10 rounded-full ring-[1.5px] ring-gold transition duration-500 group-hover:rotate-[20deg]" />
            </span>
            <span className="text-gold-gradient is-animated font-display text-xl font-black tracking-[0.18em]">AFROBACK</span>
          </Link>

          <ul className="hidden items-center lg:flex" onMouseLeave={() => setHover(null)}>
            {LINKS.map((l) => {
              const isActive = l.href === active;
              return (
                <li key={l.href} className="relative">
                  {pill === l.href && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gold/12 ring-1 ring-gold/30"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Link
                    href={l.href}
                    onMouseEnter={() => setHover(l.href)}
                    className={`relative block px-4 py-2 text-[15px] transition-colors ${isActive ? 'font-bold text-gold' : 'font-medium text-text/80 hover:text-ivory'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {tr(l.label, l.en)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <form onSubmit={submit}>
              <motion.div
                animate={{ width: searchOpen ? 280 : 44 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`flex h-11 items-center overflow-hidden rounded-full border ${searchOpen ? 'border-gold/40 bg-ink/90' : 'border-transparent hover:bg-text/10'}`}
              >
                <button
                  type={searchOpen ? 'submit' : 'button'}
                  onClick={() => !searchOpen && setSearchOpen(true)}
                  className="grid h-11 w-11 shrink-0 place-items-center text-text"
                  aria-label={tr('Rechercher', 'Search')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onBlur={() => !q && setSearchOpen(false)}
                  placeholder={tr('Un héros, un mythe, un lieu…', 'A hero, a myth, a place…')}
                  className="w-full bg-transparent pr-4 text-sm text-text placeholder:text-muted focus:outline-none"
                  aria-label={tr('Rechercher sur AFROBACK', 'Search AFROBACK')}
                />
              </motion.div>
            </form>

            <LangSwitch className="hidden sm:flex" />

            <CartLink />

            <UserButton />

            <button
              className="relative z-[60] grid h-11 w-11 place-items-center rounded-full text-text hover:bg-text/10 lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h10M4 17h16" />}
              </svg>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-pattern fixed inset-0 z-[45] flex flex-col justify-center bg-ink/95 px-8 backdrop-blur-xl lg:hidden"
          >
            <ul className="space-y-2">
              {LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link href={l.href} className={`font-display text-4xl font-bold ${l.match(pathname) ? 'text-gold' : 'text-ivory'}`}>
                    {tr(l.label, l.en)}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-10 flex items-center gap-4">
              <LangSwitch />
              <UserButton compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CartLink() {
  const { tr } = useLang();
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <Link href="/marche/panier" aria-label={tr(`Panier, ${count} article(s)`, `Cart, ${count} item(s)`)} className="relative grid h-11 w-11 place-items-center rounded-full text-text hover:bg-text/10">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-extrabold text-ink">{count}</span>
    </Link>
  );
}
