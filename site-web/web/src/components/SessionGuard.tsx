'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/**
 * Aiguillage du compte, comme dans l'application : navigateur à vérifier →
 * « Nouveau navigateur » ; vérification en 2 étapes demandée → code ;
 * inscription pas terminée → « Bienvenue ». Les pages publiques restent
 * visitables en invité.
 */
const FREE = ['/nouvel-appareil', '/double-authentification', '/bienvenue', '/legal', '/verification', '/connexion', '/inscription', '/mot-de-passe-oublie'];

export function SessionGuard() {
  const { ready, session, device, mfa, onboardingComplete } = useAuth();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !session) return;
    const free = FREE.some((p) => path.startsWith(p));
    if (device === 'a_verifier' || device === 'indisponible') {
      if (!path.startsWith('/nouvel-appareil')) router.replace('/nouvel-appareil');
      return;
    }
    if (device !== 'ok') return;
    if (mfa === 'required') {
      if (!path.startsWith('/double-authentification')) router.replace('/double-authentification');
      return;
    }
    if (mfa === 'unknown') return;
    if (!onboardingComplete && !free) router.replace('/bienvenue');
  }, [ready, session, device, mfa, onboardingComplete, path, router]);

  return null;
}
