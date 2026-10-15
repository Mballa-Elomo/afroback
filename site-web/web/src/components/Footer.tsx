import Link from 'next/link';
import { pick, type Lang } from '@/lib/lang';

export function Footer({ lang = 'fr' }: { lang?: Lang }) {
  const t = (fr: string, en: string) => pick(lang, fr, en);
  return (
    <footer className="relative z-[2] mt-24 overflow-hidden border-t border-gold/15 bg-[#050302]">
      <div className="bg-pattern absolute inset-0 opacity-[0.04]" />
      <div className="relative mx-auto max-w-[1500px] px-5 py-16 md:px-14">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-medaillon.jpg" alt="" className="h-12 w-12 rounded-full ring-2 ring-gold" />
              <p className="text-gold-gradient font-display text-3xl font-black tracking-[0.18em]">AFROBACK</p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-body">
              {t(
                'Héros, mythes et trésors du patrimoine africain, racontés comme par un griot. Ce qui est attesté est distingué de ce qui est raconté.',
                'Heroes, myths and treasures of African heritage, told the way a griot would. What is documented is kept apart from what is told.',
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
            <p className="col-span-2 mb-1 text-xs font-bold tracking-[0.25em] text-gold">{t('EXPLORER', 'EXPLORE')}</p>
            <Link href="/heros" className="text-body hover:text-gold">{t('Histoires & Héros', 'History & Heroes')}</Link>
            <Link href="/mythes" className="text-body hover:text-gold">{t('Mythologie', 'Mythology')}</Link>
            <Link href="/decouverte" className="text-body hover:text-gold">{t('Découverte', 'Discovery')}</Link>
            <Link href="/recherche" className="text-body hover:text-gold">{t('Recherche', 'Search')}</Link>
            <Link href="/partenaires" className="text-body hover:text-gold">{t('Partenaires', 'Partners')}</Link>
            <Link href="/legal/cgu" className="text-body hover:text-gold">{t("Conditions d'utilisation", 'Terms of use')}</Link>
            <Link href="/legal/confidentialite" className="text-body hover:text-gold">{t('Confidentialité', 'Privacy')}</Link>
          </div>
        </div>
        <p className="mt-16 select-none font-display text-[16vw] font-black leading-none text-ivory/[0.035]">AFROBACK</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span>© {new Date().getFullYear()} AFROBACK · {t('Retour aux origines', 'Back to the roots')}</span>
          <span>{t('Fait au Cameroun', 'Made in Cameroon')}</span>
        </div>
      </div>
    </footer>
  );
}
