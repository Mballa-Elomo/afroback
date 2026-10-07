'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang-client';

/**
 * Briques des écrans de compte : mise en page en écran partagé (illustration
 * à gauche, formulaire à droite), champs, code à 6 chiffres, boutons.
 */

const ART = 'https://ygkyapryramhaskfbrrt.supabase.co/storage/v1/object/public/heroes-media/images/reine-nzinga.jpg';

export function AuthShell({ title, subtitle, children, art = ART, quote }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode; art?: string; quote?: string }) {
  const { tr } = useLang();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/30 via-ink/40 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="absolute bottom-16 left-14 right-16">
          <p className="text-xs font-bold tracking-[0.3em] text-gold">{tr('RETOUR AUX ORIGINES', 'BACK TO THE ROOTS')}</p>
          <p className="mt-4 font-display text-4xl font-bold leading-tight text-ivory">
            {quote ?? tr('Un seul compte pour l’application et le site.', 'One account for the app and the site.')}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 pb-16 pt-32 md:px-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <h1 className="text-gold-gradient font-display text-4xl font-black leading-tight md:text-5xl">{title}</h1>
          {subtitle && <div className="mt-3 text-base leading-relaxed text-body">{subtitle}</div>}
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  error?: string | null;
}) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const { tr } = useLang();
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text">{label}</span>
      <span className={`flex items-center rounded-2xl border bg-surface/80 transition focus-within:border-gold ${error ? 'border-terra' : 'border-ivory/15'}`}>
        <input
          type={isPwd && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent px-5 py-4 text-base text-ivory placeholder:text-muted focus:outline-none"
        />
        {isPwd && (
          <button type="button" onClick={() => setShow((v) => !v)} className="px-4 text-sm font-semibold text-gold" aria-label={show ? 'Masquer' : 'Afficher'}>
            {show ? tr('Masquer', 'Hide') : tr('Afficher', 'Show')}
          </button>
        )}
      </span>
      {error ? <span className="mt-1.5 block text-sm text-terra">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [cc, setCc] = useState('+237');
  const { tr } = useLang();
  const [num, setNum] = useState('');
  const update = (c: string, n: string) => onChange(`${c}${n.replace(/\D/g, '')}`);
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text">{tr('Téléphone', 'Phone')}</span>
      <span className="flex items-center rounded-2xl border border-ivory/15 bg-surface/80 focus-within:border-gold">
        <select
          value={cc}
          onChange={(e) => {
            setCc(e.target.value);
            update(e.target.value, num);
          }}
          className="rounded-l-2xl bg-transparent py-4 pl-4 pr-2 text-base text-ivory focus:outline-none"
          aria-label={tr('Indicatif', 'Country code')}
        >
          {['+237', '+225', '+221', '+241', '+242', '+243', '+229', '+228', '+33', '+32', '+1', '+44'].map((c) => (
            <option key={c} value={c} className="bg-ink">
              {c}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={num}
          onChange={(e) => {
            setNum(e.target.value);
            update(cc, e.target.value);
          }}
          placeholder="6XX XX XX XX"
          autoComplete="tel-national"
          className="w-full bg-transparent px-3 py-4 text-base text-ivory placeholder:text-muted focus:outline-none"
        />
      </span>
      {value && <span className="mt-1.5 block text-xs text-muted">{value}</span>}
    </label>
  );
}

export function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { tr } = useLang();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        className="absolute inset-0 opacity-0"
        aria-label={tr('Code à 6 chiffres', '6-digit code')}
      />
      <div className="flex justify-between gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`grid h-16 flex-1 place-items-center rounded-2xl border font-display text-3xl font-bold text-ivory transition ${
              value.length === i ? 'border-gold bg-gold/10' : value[i] ? 'border-gold/40 bg-surface' : 'border-ivory/15 bg-surface/60'
            }`}
          >
            {value[i] ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Submit({ children, busy, disabled }: { children: React.ReactNode; busy?: boolean; disabled?: boolean }) {
  const { tr } = useLang();
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-gold-pale via-gold to-gold-deep py-4 text-base font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.3)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
    >
      {busy ? tr('Un instant…', 'One moment…') : children}
    </button>
  );
}

export function Notice({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: React.ReactNode }) {
  const c = tone === 'error' ? 'border-terra/40 bg-terra-deep/15 text-terra' : tone === 'success' ? 'border-free/40 bg-free/10 text-free' : 'border-gold/30 bg-gold/10 text-gold-pale';
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${c}`}>{children}</div>;
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-gold hover:underline">
      {children}
    </Link>
  );
}
