import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AFROBACK — Back-office',
  description: "Outil interne d'administration d'AFROBACK.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      {/* suppressHydrationWarning : certaines extensions navigateur (antivirus,
          gestionnaires de mots de passe) injectent des attributs sur <body>
          avant l'hydratation React (ex. bis_register), ce qui déclenche un
          faux avertissement d'hydratation sans rapport avec le code de l'app. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
