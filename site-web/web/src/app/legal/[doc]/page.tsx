import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang-server';
import { LEGAL_DOCS, type LegalDocId } from '@/lib/legal-documents';

type Props = { params: Promise<{ doc: string }> };

function isDoc(doc: string): doc is LegalDocId {
  return doc === 'cgu' || doc === 'confidentialite';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await params;
  if (!isDoc(doc)) return {};
  const lang = await getLang();
  return { title: LEGAL_DOCS[doc][lang === 'en' ? 'en' : 'fr'].title };
}

/**
 * Conditions d'utilisation et politique de confidentialité, mêmes textes que
 * l'application (src/lib/legal-documents.ts). La politique de confidentialité
 * doit être lisible à une adresse publique (exigence Google Play) :
 * https://afroback-web.vercel.app/legal/confidentialite
 */
export default async function Page({ params }: Props) {
  const { doc } = await params;
  if (!isDoc(doc)) notFound();
  const lang = await getLang();
  const d = LEGAL_DOCS[doc][lang === 'en' ? 'en' : 'fr'];
  return (
    <article className="mx-auto max-w-3xl px-5 pb-20 pt-32">
      <h1 className="text-gold-gradient font-display text-4xl font-black">{d.title}</h1>
      <p className="mt-3 text-sm text-muted">{d.updated}</p>
      <p className="mt-4 rounded-2xl bg-gold/10 p-4 text-sm text-body ring-1 ring-gold/30">{d.draftNotice}</p>
      {d.sections.map((s) => (
        <section key={s.title} className="mt-10">
          <h2 className="font-display text-xl font-bold text-heading">{s.title}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="mt-3 leading-relaxed text-body">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
