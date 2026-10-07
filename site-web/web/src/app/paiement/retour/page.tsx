'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentWatcher } from '@/components/PaymentWatcher';
import { useLang } from '@/lib/lang-client';

/** Retour depuis Campay (quand l'adresse du site est autorisée par la fonction de paiement). */
function Retour() {
  const params = useSearchParams();
  const { tr } = useLang();
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    let v = params.get('id');
    if (!v) {
      try {
        v = localStorage.getItem('afroback-web:paiement');
      } catch {
        v = null;
      }
    }
    setId(v);
  }, [params]);
  if (!id) return <p className="px-5 pt-40 text-center text-body">{tr('Aucun paiement en cours.', 'No payment in progress.')}</p>;
  return (
    <div className="min-h-screen">
      <PaymentWatcher paiementId={id} kind="abonnement" onClose={() => window.location.assign('/')} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Retour />
    </Suspense>
  );
}
