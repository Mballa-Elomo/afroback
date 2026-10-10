import type { Metadata } from 'next';
import { Cinzel, Manrope } from 'next/font/google';
import { TopNav } from '@/components/TopNav';
import { Footer } from '@/components/Footer';
import { InfoProvider } from '@/components/InfoModal';
import { Ambient } from '@/components/Ambient';
import { AuthProvider } from '@/lib/auth';
import { SessionGuard } from '@/components/SessionGuard';
import { ContentShield } from '@/components/ContentShield';
import { CartProvider } from '@/lib/cart';
import { KidProvider } from '@/lib/kid';
import { AdultOnly, KidGuard } from '@/components/kids';
import { getLang } from '@/lib/lang-server';
import { pick } from '@/lib/lang';
import { LangProvider } from '@/lib/lang-client';
import './globals.css';

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['600', '700', '800', '900'], variable: '--font-cinzel' });
const manrope = Manrope({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700', '800'], variable: '--font-manrope' });

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: { default: pick(lang, 'AFROBACK · Retour aux origines', 'AFROBACK · Back to the roots'), template: '%s · AFROBACK' },
    description: pick(lang, 'Héros, mythes et trésors du patrimoine africain : récits, narrations et vidéos.', 'Heroes, myths and treasures of African heritage: stories, narrations and videos.'),
    icons: { icon: '/icon.png' },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${cinzel.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-ink">
        <LangProvider initial={lang}>
        <AuthProvider>
        <CartProvider>
        <KidProvider>
        <SessionGuard />
        <ContentShield />
        <KidGuard />
        <InfoProvider>
          <Ambient />
          <AdultOnly>
            <TopNav />
          </AdultOnly>
          <main className="relative z-[2]">{children}</main>
          <AdultOnly>
            <Footer lang={lang} />
          </AdultOnly>
        </InfoProvider>
        </KidProvider>
        </CartProvider>
        </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
