'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useKid } from '@/lib/kid';
import { AVATAR_GRADIENTS, childProfiles, getPin, setPin, type AvatarCouleur } from '@/lib/kids';
import { useLang } from '@/lib/lang-client';

export function KidAvatar({ prenom, couleur, size = 96 }: { prenom: string; couleur: AvatarCouleur; size?: number }) {
  const [a, b] = AVATAR_GRADIENTS[couleur] ?? AVATAR_GRADIENTS.or;
  return (
    <span
      style={{ width: size, height: size, background: `linear-gradient(145deg, ${a}, ${b})`, fontSize: size * 0.42 }}
      className="grid shrink-0 place-items-center rounded-[30%] font-black text-white shadow-[inset_0_-6px_0_rgba(0,0,0,0.18)]"
    >
      {prenom.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * Code PIN parent à 4 chiffres, comme dans l'app (src/profils/PinGate.tsx) :
 * demandé pour quitter l'espace enfant et pour ouvrir l'Espace Parent,
 * jamais pour choisir un profil enfant. Pas encore de code : on le crée.
 */
export function PinGate({ open, onCancel, onSuccess }: { open: boolean; onCancel: () => void; onSuccess: () => void }) {
  const { tr } = useLang();
  const [mode, setMode] = useState<'loading' | 'enter' | 'create'>('loading');
  const [pin, setPinState] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const first = useRef<HTMLInputElement>(null);
  const second = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setMode('loading');
    setValue('');
    setConfirm('');
    setError(null);
    let alive = true;
    getPin()
      .then((p) => {
        if (!alive) return;
        setPinState(p);
        setMode(p ? 'enter' : 'create');
        setTimeout(() => first.current?.focus(), 50);
      })
      // Même règle que l'app : une panne technique ne bloque jamais le parent.
      .catch(() => alive && onSuccess());
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (mode === 'enter' && value.length === 4) {
      if (value === pin) onSuccess();
      else {
        setError(tr('Code incorrect.', 'Incorrect code.'));
        setValue('');
      }
    }
    if (mode === 'create' && value.length === 4 && confirm.length === 0) second.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, mode]);

  useEffect(() => {
    if (mode !== 'create' || value.length !== 4 || confirm.length !== 4) return;
    if (value !== confirm) {
      setError(tr('Les deux codes ne correspondent pas.', "The two codes don't match."));
      setConfirm('');
      return;
    }
    setSaving(true);
    setPin(value).then((r) => {
      setSaving(false);
      if (r.error) setError(r.error);
      else onSuccess();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm, mode]);

  const digits = (v: string) => v.replace(/\D/g, '').slice(0, 4);
  const input = 'w-full rounded-2xl bg-ink px-5 py-4 text-center text-3xl font-black tracking-[0.6em] text-ivory ring-1 ring-ivory/15 focus:outline-none focus:ring-gold';

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-5 backdrop-blur" onClick={onCancel}>
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-surface p-8 text-center ring-1 ring-gold/25"
          >
            <p className="text-4xl">🔐</p>
            <p className="mt-3 font-display text-2xl font-black text-ivory">{mode === 'create' ? tr('Crée ton code parent', 'Create your parent code') : tr('Code parent', 'Parent code')}</p>
            {mode === 'loading' && <p className="mt-4 text-muted">{tr('Un instant…', 'One moment…')}</p>}
            {mode === 'enter' && (
              <>
                <p className="mt-2 text-sm text-body">{tr('Saisis ton code à 4 chiffres.', 'Enter your 4-digit code.')}</p>
                <input ref={first} value={value} onChange={(e) => (setError(null), setValue(digits(e.target.value)))} inputMode="numeric" type="password" placeholder="••••" className={`mt-6 ${input}`} />
              </>
            )}
            {mode === 'create' && (
              <>
                <p className="mt-2 text-sm text-body">{tr("Il sera demandé pour quitter l'espace enfant et pour ouvrir l'Espace Parent.", "It will be asked to leave the kids' space and to open the Parent Space.")}</p>
                <input ref={first} value={value} onChange={(e) => (setError(null), setValue(digits(e.target.value)))} inputMode="numeric" type="password" placeholder={tr('Nouveau code', 'New code')} className={`mt-6 ${input} placeholder:text-base placeholder:tracking-normal`} />
                <input ref={second} value={confirm} onChange={(e) => (setError(null), setConfirm(digits(e.target.value)))} inputMode="numeric" type="password" placeholder={tr('Confirme le code', 'Confirm the code')} className={`mt-3 ${input} placeholder:text-base placeholder:tracking-normal`} />
              </>
            )}
            {saving && <p className="mt-3 text-sm text-muted">{tr('Enregistrement…', 'Saving…')}</p>}
            {error && <p className="mt-3 text-sm font-semibold text-terra">{error}</p>}
            <button onClick={onCancel} className="mt-6 text-sm font-semibold text-body hover:text-ivory">
              {tr('Annuler', 'Cancel')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const DEVICE_PATHS = ['/nouvel-appareil', '/double-authentification', '/connexion'];

/**
 * Aiguillage de l'espace enfant :
 * - un enfant actif ne peut pas sortir de /enfant sans le code parent ;
 * - /enfant sans enfant actif renvoie vers « Qui regarde ? » ;
 * - comme l'app, « Qui regarde ? » s'affiche à l'arrivée quand le compte a
 *   au moins un profil enfant (une fois par onglet).
 */
export function KidGuard() {
  const { ready: authReady, session, device, onboardingComplete } = useAuth();
  const { ready, kid, chosen } = useKid();
  const path = usePathname();
  const router = useRouter();
  const [hasKids, setHasKids] = useState<boolean | null>(null);

  useEffect(() => {
    if (session && device === 'ok') childProfiles().then((l) => setHasKids(l.length > 0)).catch(() => setHasKids(false));
  }, [session, device]);

  useEffect(() => {
    if (!ready || !authReady) return;
    if (kid) {
      if (!path.startsWith('/enfant') && !DEVICE_PATHS.some((p) => path.startsWith(p))) router.replace('/enfant');
      return;
    }
    if (path.startsWith('/enfant')) {
      router.replace(session ? '/profils' : '/connexion?suite=/profils');
      return;
    }
    if (path === '/' && session && device === 'ok' && onboardingComplete && hasKids && !chosen) router.replace('/profils');
  }, [ready, authReady, kid, path, session, device, onboardingComplete, hasKids, chosen, router]);

  return null;
}

/** Masque la barre du haut et le pied de page des adultes en mode enfant. */
export function AdultOnly({ children }: { children: React.ReactNode }) {
  const { kid } = useKid();
  const path = usePathname();
  if (kid || path.startsWith('/enfant')) return null;
  return <>{children}</>;
}

/** Cadre des pages enfant : en-tête coloré, retour, sortie protégée par le code parent. */
export function KidShell({ children, back, title }: { children: React.ReactNode; back?: string; title?: string }) {
  const { kid, exitKid } = useKid();
  const { tr } = useLang();
  const router = useRouter();
  const [pin, setPinOpen] = useState(false);
  if (!kid) return <div className="min-h-screen bg-kid" />;
  return (
    <div className="min-h-screen bg-kid pb-20">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a1030]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3">
          {back ? (
            <Link href={back} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-2xl font-black text-white hover:bg-white/20" aria-label={tr('Retour', 'Back')}>
              ‹
            </Link>
          ) : (
            <KidAvatar prenom={kid.prenom} couleur={kid.avatar_couleur} size={44} />
          )}
          <Link href="/enfant" className="min-w-0 flex-1">
            <p className="truncate text-lg font-black text-white">{title ?? tr(`Espace de ${kid.prenom}`, `${kid.prenom}'s space`)}</p>
          </Link>
          <button onClick={() => setPinOpen(true)} className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20">
            ↩ {tr('Quitter', 'Exit')}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 pt-8">{children}</main>
      <PinGate
        open={pin}
        onCancel={() => setPinOpen(false)}
        onSuccess={() => {
          setPinOpen(false);
          exitKid();
          router.replace('/profils');
        }}
      />
    </div>
  );
}

/** État honnête « pas encore prêt », jamais un contenu simulé. */
export function Soon({ icon, text }: { icon: string; text?: string }) {
  const { tr } = useLang();
  return (
    <div className="rounded-[28px] bg-white/5 p-10 text-center ring-1 ring-white/10">
      <p className="text-5xl">{icon}</p>
      <p className="mt-4 text-lg font-bold text-white/85">{text ?? tr('Ce contenu n’est pas encore prêt, reviens bientôt !', 'This content is not ready yet, come back soon!')}</p>
    </div>
  );
}

export function KidButton({ children, onClick, href, disabled, tone = 'gold' }: { children: React.ReactNode; onClick?: () => void; href?: string; disabled?: boolean; tone?: 'gold' | 'ghost' }) {
  const cls = `inline-flex w-full items-center justify-center rounded-[22px] px-6 py-4 text-lg font-black transition ${
    tone === 'gold' ? 'bg-gold text-ink shadow-[0_6px_0_#b9792f] active:translate-y-1 active:shadow-none' : 'bg-white/10 text-white hover:bg-white/15'
  } ${disabled ? 'pointer-events-none opacity-40' : ''}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
