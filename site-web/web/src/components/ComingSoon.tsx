import Link from 'next/link';
import { pick, type Lang } from '@/lib/lang';

/** Page d'un module prévu dans un lot suivant (cahier des charges §7), avec renvoi vers l'app. */
export function ComingSoon({ title, lot, text, appPath = '', lang = 'fr' }: { title: string; lot: string; text: string; appPath?: string; lang?: Lang }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pt-24">
      <div className="max-w-lg text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-gold">{pick(lang, 'BIENTÔT SUR LE SITE', 'COMING SOON TO THE SITE')} · {lot}</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-heading">{title}</h1>
        <p className="mt-4 text-body">{text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`https://afroback-test.vercel.app${appPath}`}
            className="rounded-md bg-gold px-6 py-3 font-bold text-ink hover:bg-gold-pale"
          >
            {pick(lang, "Ouvrir dans l'application", 'Open in the app')}
          </a>
          <Link href="/" className="rounded-md bg-text/15 px-6 py-3 font-bold text-ivory hover:bg-text/25">
            {pick(lang, "Retour à l'accueil", 'Back to home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
