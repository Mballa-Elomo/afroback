import { ComingSoon } from '@/components/ComingSoon';
import { getLang } from '@/lib/lang-server';
import { pick } from '@/lib/lang';

type Props = { params: Promise<{ doc: string }> };

export default async function Page({ params }: Props) {
  const { doc } = await params;
  const lang = await getLang();
  const title = doc === 'confidentialite' ? pick(lang, 'Confidentialité', 'Privacy') : pick(lang, "Conditions d'utilisation", 'Terms of use');
  return (
    <ComingSoon
      lang={lang}
      title={title}
      lot="LOT 7"
      text={pick(lang, "Les documents légaux seront repris tels quels sur le site. Ils sont déjà lisibles dans l'application.", 'The legal documents will be published on the site as they are. They can already be read in the app.')}
      appPath={`/legal/${doc}`}
    />
  );
}
