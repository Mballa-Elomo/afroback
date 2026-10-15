import type { Metadata } from 'next';
import { getLang } from '@/lib/lang-server';
import { pick } from '@/lib/lang';
import { ListePartenaires } from '@/components/Sponsor';

export async function generateMetadata(): Promise<Metadata> {
  return { title: pick(await getLang(), 'Nos partenaires', 'Our partners') };
}

/** Page Partenaires (backoffice/cdc-module-sponsors.md) : sponsors actifs ayant cet emplacement. */
export default async function Page() {
  const lang = await getLang();
  const t = (fr: string, en: string) => pick(lang, fr, en);
  return (
    <article className="mx-auto max-w-5xl px-5 pb-20 pt-32">
      <h1 className="text-gold-gradient font-display text-4xl font-black">{t('Nos partenaires', 'Our partners')}</h1>
      <p className="mb-10 mt-3 max-w-2xl text-body">
        {t(
          'Ils soutiennent AFROBACK et la transmission du patrimoine africain. Merci à eux.',
          'They support AFROBACK and the passing on of African heritage. Thank you to them.',
        )}
      </p>
      <ListePartenaires />
    </article>
  );
}
