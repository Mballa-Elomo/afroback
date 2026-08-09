import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'AFROBACK — Back-office',
  description: "Outil interne d'administration d'AFROBACK.",
};

/**
 * Certaines extensions navigateur (Bitdefender en tête) injectent un
 * attribut `bis_skin_checked` sur des éléments existants dès qu'ils
 * apparaissent dans le DOM — avant que React n'hydrate la page. React
 * détecte l'écart avec le HTML rendu serveur et l'affiche comme une erreur
 * d'hydratation, alors que ce n'est ni un bug de l'app ni quelque chose que
 * `suppressHydrationWarning` peut corriger (il ne s'applique qu'au nœud sur
 * lequel il est posé, jamais à ses descendants — inutilisable ici vu que
 * l'extension touche quasiment chaque <div>). On retire l'attribut avant que
 * React ne compare quoi que ce soit : `beforeInteractive` s'exécute "avant
 * toute hydratation" (doc next/script), donc l'attribut n'existe déjà plus
 * quand React regarde le DOM. Le MutationObserver couvre les injections
 * ultérieures de l'extension (contenu ajouté après le chargement initial).
 */
const STRIP_EXTENSION_ATTRS_SCRIPT = `
(function () {
  var ATTR = 'bis_skin_checked';
  function strip(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    var nodes = root.querySelectorAll('[' + ATTR + ']');
    for (var i = 0; i < nodes.length; i++) nodes[i].removeAttribute(ATTR);
  }
  strip(document);
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === 'attributes' && m.attributeName === ATTR) {
        m.target.removeAttribute(ATTR);
      } else if (m.type === 'childList') {
        for (var j = 0; j < m.addedNodes.length; j++) strip(m.addedNodes[j]);
      }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: [ATTR], childList: true, subtree: true });
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      {/* suppressHydrationWarning : filet de sécurité pour <body> lui-même
          (ex. attribut bis_register ajouté directement dessus). Le script
          ci-dessous couvre le reste de l'arbre. */}
      <body suppressHydrationWarning>
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {STRIP_EXTENSION_ATTRS_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
