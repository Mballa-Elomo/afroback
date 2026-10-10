// Visuels de la fiche service ComeUp de Madou Consulting : « vidéo TikTok / Reels / Shorts animée, sans tournage ».
// Format vignette ComeUp 1260 × 708. Charte Madou : navy #0B1E3F + or #F5C451 / #C9971C, monogramme « M ».
// Les captures dans les téléphones viennent des vidéos AFROBACK (produit de Yannick, aucune marque tierce).
// Pas de prix sur les visuels : les tarifs bougent (prix de lancement), seule la fiche texte les porte.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";

export const sora = loadSora("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const outfit = loadOutfit("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const CW = 1260;
export const CH = 708;

export const NAVY = "#0B1E3F";
const NAVY_DEEP = "#06122A";
export const OR = "#F5C451";
const OR_DEEP = "#C9971C";
export const IVOIRE = "#FAF7F1";
export const TEXTE = "#C8D0E0";
const DEGRADE_OR = `linear-gradient(90deg, ${OR} 0%, ${OR_DEEP} 100%)`;

/* Fond commun : navy, halo or discret, fine grille */
export const Fond: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 78% 40%, #173463 0%, ${NAVY} 45%, ${NAVY_DEEP} 100%)`, overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        backgroundImage: "linear-gradient(rgba(245,196,81,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.05) 1px, transparent 1px)",
        backgroundSize: "54px 54px",
      }}
    />
    {children}
  </AbsoluteFill>
);

export const Marque: React.FC = () => (
  <div style={{ position: "absolute", left: 64, bottom: 40, display: "flex", alignItems: "center", gap: 14 }}>
    <Img src={staticFile("comeup/monogram.png")} style={{ width: 40, height: (40 / 490) * 460 }} />
    <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 21, color: IVOIRE, letterSpacing: 3, textTransform: "uppercase" }}>Madou Consulting</div>
  </div>
);

export const Surtitre: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 21, letterSpacing: 5, color: OR, textTransform: "uppercase" }}>{children}</div>
);

export const Titre: React.FC<{ children: React.ReactNode; taille?: number }> = ({ children, taille = 62 }) => (
  <div style={{ fontFamily: sora, fontWeight: 800, fontSize: taille, lineHeight: 1.04, color: IVOIRE, letterSpacing: -2, marginTop: 12 }}>{children}</div>
);

export const Or: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: DEGRADE_OR, WebkitBackgroundClip: "text", color: "transparent" }}>{children}</span>
);

/* Téléphone vertical avec une capture de vidéo */
export const Telephone: React.FC<{ src: string; largeur: number; style?: React.CSSProperties }> = ({ src, largeur, style }) => {
  const hauteur = largeur * (16 / 9);
  return (
    <div
      style={{
        position: "absolute",
        width: largeur + 16,
        height: hauteur + 16,
        padding: 8,
        borderRadius: 34,
        background: "#05070D",
        border: `2px solid rgba(245,196,81,0.55)`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
        ...style,
      }}
    >
      <Img src={staticFile(src)} style={{ width: largeur, height: hauteur, objectFit: "cover", borderRadius: 27, display: "block" }} />
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: 64, height: 16, borderRadius: 10, background: "#05070D" }} />
    </div>
  );
};

/* ================= 1. Couverture ================= */

export const ComeupCouverture: React.FC = () => (
  <Fond>
    <div style={{ position: "absolute", left: 64, top: 70, width: 600 }}>
      <Surtitre>TikTok · Reels · YouTube Shorts</Surtitre>
      <Titre taille={70}>
        Votre vidéo animée,
        <br />
        <Or>sans tournage.</Or>
      </Titre>
      <div style={{ fontFamily: outfit, fontWeight: 400, fontSize: 25, lineHeight: 1.4, color: TEXTE, marginTop: 22, width: 540 }}>
        Script, motion design, voix off et sous-titres. Vous envoyez l'idée, vous recevez une vidéo prête à publier.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28, width: 560 }}>
        {["Motion design sur mesure", "Voix off FR", "Sous-titres animés", "Format 9:16"].map((t) => (
          <div key={t} style={{ fontFamily: outfit, fontWeight: 600, fontSize: 19, color: NAVY, background: OR, borderRadius: 999, padding: "8px 16px" }}>
            {t}
          </div>
        ))}
      </div>
    </div>
    <Telephone src="comeup/phone1.jpg" largeur={190} style={{ left: 735, top: 150, transform: "rotate(-7deg)" }} />
    <Telephone src="comeup/phone3.jpg" largeur={190} style={{ left: 1015, top: 150, transform: "rotate(7deg)" }} />
    <Telephone src="comeup/phone2.jpg" largeur={215} style={{ left: 865, top: 70, zIndex: 2 }} />
    <Marque />
  </Fond>
);

/* ================= 2. Ce que vous recevez ================= */

export const Coche: React.FC = () => (
  <div style={{ width: 34, height: 34, borderRadius: 999, background: OR, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M4 12.5l5 5L20 6.5" stroke={NAVY} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const ComeupInclus: React.FC = () => {
  const items: [string, string][] = [
    ["Animation sur mesure", "À vos couleurs, pas un template recyclé"],
    ["Script qui accroche", "Un hook dans les 3 premières secondes"],
    ["Voix off française", "Homme ou femme, ton au choix"],
    ["Sous-titres animés", "La majorité des vidéos est vue sans le son"],
    ["Musique libre de droits", "Mixée avec la voix, prête à publier"],
    ["MP4 1080 × 1920", "Optimisé TikTok, Reels et Shorts"],
  ];
  return (
    <Fond>
      <div style={{ position: "absolute", left: 64, top: 62 }}>
        <Surtitre>Ce que vous recevez</Surtitre>
        <Titre taille={52}>
          Une vidéo <Or>prête à publier</Or>
        </Titre>
      </div>
      <div style={{ position: "absolute", left: 64, top: 230, width: 1132, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 46, rowGap: 30 }}>
        {items.map(([t, d]) => (
          <div key={t} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <Coche />
            <div>
              <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 27, color: IVOIRE }}>{t}</div>
              <div style={{ fontFamily: outfit, fontSize: 21, color: TEXTE, marginTop: 4 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <Marque />
    </Fond>
  );
};

/* ================= 3. Méthode HOOK-RÉCIT-ACTION ================= */

export const ComeupMethode: React.FC = () => {
  const etapes: [string, string, string][] = [
    ["01", "HOOK", "Les 3 premières secondes arrêtent le scroll : une question, un chiffre, une image forte."],
    ["02", "RÉCIT", "Un mini-scénario raconté, pas une liste de caractéristiques. On retient une histoire."],
    ["03", "ACTION", "Une fin claire qui fait agir : commander, s'abonner, cliquer sur le lien."],
  ];
  return (
    <Fond>
      <div style={{ position: "absolute", left: 64, top: 62 }}>
        <Surtitre>Ma méthode</Surtitre>
        <Titre taille={52}>
          HOOK <Or>·</Or> RÉCIT <Or>·</Or> ACTION
        </Titre>
      </div>
      <div style={{ position: "absolute", left: 64, top: 236, width: 1132, display: "flex", gap: 26 }}>
        {etapes.map(([n, t, d], i) => (
          <div
            key={t}
            style={{
              flex: 1,
              height: 330,
              borderRadius: 22,
              padding: "30px 30px",
              background: i === 0 ? "rgba(245,196,81,0.12)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${i === 0 ? OR : "rgba(245,196,81,0.25)"}`,
            }}
          >
            <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 64, lineHeight: 1 }}>
              <Or>{n}</Or>
            </div>
            <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 34, color: IVOIRE, marginTop: 20, letterSpacing: 1 }}>{t}</div>
            <div style={{ fontFamily: outfit, fontSize: 22, lineHeight: 1.42, color: TEXTE, marginTop: 14 }}>{d}</div>
          </div>
        ))}
      </div>
      <Marque />
    </Fond>
  );
};

/* ================= 4. Les 3 offres (sans prix) ================= */

export const ComeupOffres: React.FC = () => {
  const offres: { nom: string; duree: string; lignes: string[]; star?: boolean }[] = [
    { nom: "Basic", duree: "1 vidéo · 15 s", lignes: ["Motion design à vos couleurs", "Sous-titres animés", "Musique libre de droits", "1 retouche"] },
    { nom: "Standard", duree: "1 vidéo · 30 s", lignes: ["Tout le Basic", "Script écrit pour vous", "Voix off française", "2 retouches"], star: true },
    { nom: "Premium", duree: "3 vidéos · 30 s", lignes: ["Une série cohérente", "3 angles différents", "Script + voix off", "2 retouches par vidéo"] },
  ];
  return (
    <Fond>
      <div style={{ position: "absolute", left: 64, top: 56 }}>
        <Surtitre>3 formules</Surtitre>
        <Titre taille={50}>
          Choisissez <Or>votre format</Or>
        </Titre>
      </div>
      <div style={{ position: "absolute", left: 64, top: 214, width: 1132, display: "flex", gap: 26 }}>
        {offres.map((o) => (
          <div
            key={o.nom}
            style={{
              flex: 1,
              height: 380,
              borderRadius: 22,
              padding: "28px 30px",
              background: o.star ? OR : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${o.star ? OR : "rgba(245,196,81,0.25)"}`,
              position: "relative",
            }}
          >
            {o.star && (
              <div style={{ position: "absolute", top: -16, right: 24, fontFamily: outfit, fontWeight: 700, fontSize: 16, color: OR, background: NAVY, border: `1.5px solid ${OR}`, borderRadius: 999, padding: "6px 14px", letterSpacing: 1, textTransform: "uppercase" }}>
                Recommandé
              </div>
            )}
            <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 38, color: o.star ? NAVY : IVOIRE }}>{o.nom}</div>
            <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 21, color: o.star ? NAVY : OR, marginTop: 6 }}>{o.duree}</div>
            <div style={{ height: 1.5, background: o.star ? "rgba(11,30,63,0.25)" : "rgba(245,196,81,0.25)", margin: "20px 0" }} />
            {o.lignes.map((l) => (
              <div key={l} style={{ fontFamily: outfit, fontWeight: o.star ? 600 : 400, fontSize: 21, color: o.star ? NAVY : TEXTE, marginBottom: 13 }}>
                · {l}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Marque />
    </Fond>
  );
};

/* ================= 5. Comment ça marche ================= */

export const ComeupProcess: React.FC = () => {
  const etapes: [string, string][] = [
    ["Vous m'écrivez", "Votre activité, votre objectif, votre logo"],
    ["Je propose le script", "Vous validez le texte avant l'animation"],
    ["J'anime la vidéo", "Motion design, voix off, musique, sous-titres"],
    ["Vous publiez", "MP4 prêt pour TikTok, Reels et Shorts"],
  ];
  return (
    <Fond>
      <div style={{ position: "absolute", left: 64, top: 62 }}>
        <Surtitre>Comment ça marche</Surtitre>
        <Titre taille={52}>
          4 étapes, <Or>zéro caméra</Or>
        </Titre>
      </div>
      <div style={{ position: "absolute", left: 64, top: 300, width: 1132, height: 3, background: "rgba(245,196,81,0.25)" }} />
      <div style={{ position: "absolute", left: 64, top: 268, width: 1132, display: "flex", gap: 24 }}>
        {etapes.map(([t, d], i) => (
          <div key={t} style={{ flex: 1 }}>
            <div style={{ width: 66, height: 66, borderRadius: 999, background: i === 3 ? OR : NAVY, border: `3px solid ${OR}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sora, fontWeight: 800, fontSize: 28, color: i === 3 ? NAVY : OR }}>
              {i + 1}
            </div>
            <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 27, color: IVOIRE, marginTop: 26 }}>{t}</div>
            <div style={{ fontFamily: outfit, fontSize: 21, lineHeight: 1.4, color: TEXTE, marginTop: 10, paddingRight: 10 }}>{d}</div>
          </div>
        ))}
      </div>
      <Marque />
    </Fond>
  );
};
