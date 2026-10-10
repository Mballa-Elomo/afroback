'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useMfaPolicy } from '@/lib/settings';

/**
 * Aiguillage du compte, comme dans l'application : navigateur à vérifier →
 * « Nouveau navigateur » ; vérification en 2 étapes demandée → code ;
 * inscription pas terminée → « Bienvenue ». Les pages publiques restent
 * visitables en invité.
 */
const FREE = ['/nouvel-appareil', '/double-authentification', '/bienvenue', '/legal', '/verification', '/connexion', '/inscription', '/mot-de-passe-oublie', '/supprimer-mon-compte'];

export function SessionGuard() {
  const { ready, session, device, mfa, onboardingComplete } = useAuth();
  const mfaObligatoire = useMfaPolicy().obligatoire;
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
    if (!onboardingComplete && !free) {
      router.replace('/bienvenue');
      return;
    }
    // Vérification en 2 étapes rendue obligatoire dans le back-office (Paramètres → Sécurité).
    if (mfaObligatoire && mfa === 'none' && !free && !path.startsWith('/compte/securite')) router.replace('/compte/securite');
  }, [ready, session, device, mfa, onboardingComplete, path, router, mfaObligatoire]);

  return null;
}
