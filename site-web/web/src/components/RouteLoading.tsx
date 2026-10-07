/**
 * Écran affiché immédiatement au clic sur Lire / Écouter / Regarder / Quiz,
 * pendant que le serveur prépare la page (fichiers loading.tsx). Sans lui, le
 * navigateur attendait la réponse complète sans rien montrer : sur téléphone,
 * on avait l'impression que le bouton ne réagissait pas.
 */
export function RouteLoading({ variant = 'page' }: { variant?: 'page' | 'video' }) {
  return (
    <div className={`min-h-screen pt-24 md:pt-[72px] ${variant === 'video' ? 'bg-black' : ''}`} role="status" aria-live="polite">
      {variant === 'video' ? (
        <div className="mx-auto max-w-[1500px] md:px-8 md:pt-6">
          <div className="grid aspect-video w-full place-items-center bg-ink">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-gold/25 border-t-gold" />
          </div>
          <div className="space-y-3 px-4 pt-5 md:px-0">
            <div className="h-4 w-32 animate-pulse rounded bg-ivory/10" />
            <div className="h-7 w-3/4 animate-pulse rounded bg-ivory/10" />
          </div>
        </div>
      ) : (
        <div className="grid min-h-[60vh] place-items-center">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-gold/25 border-t-gold" />
        </div>
      )}
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
