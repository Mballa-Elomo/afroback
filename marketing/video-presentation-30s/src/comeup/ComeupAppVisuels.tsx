// Visuels du 2e service ComeUp de Madou Consulting : « présentation de votre application ou site web
// en motion design » (Reels / Shorts). Même charte et mêmes briques que ComeupVisuels.tsx.
// Téléphone : vrais écrans AFROBACK (vidéo de présentation 60 s). Navigateur : maquette schématique
// (le site AFROBACK a encore des photos provisoires, on ne le montre pas). Pas de prix sur les visuels.
import React from "react";
import { Coche, Fond, IVOIRE, Marque, NAVY, OR, Or, outfit, sora, Surtitre, Telephone, TEXTE, Titre } from "./ComeupVisuels";

/* Fenêtre de navigateur schématique (blocs d'interface stylisés) */
const Navigateur: React.FC<{ largeur: number; style?: React.CSSProperties }> = ({ largeur, style }) => {
  const hauteur = largeur * 0.62;
  const corps = hauteur - 34;
  const bloc = (s: React.CSSProperties, key?: number) => <div key={key} style={{ position: "absolute", borderRadius: 8, ...s }} />;
  const carte = (largeur - 56 - 28) / 3;
  return (
    <div
      style={{
        position: "absolute",
        width: largeur,
        height: hauteur,
        borderRadius: 16,
        overflow: "hidden",
        background: "#0E2148",
        border: "2px solid rgba(245,196,81,0.45)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      <div style={{ height: 34, background: "#081733", display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
        {["#E86A5C", "#F5C451", "#5CC47A"].map((c) => (
          <div key={c} style={{ width: 11, height: 11, borderRadius: 99, background: c }} />
        ))}
        <div style={{ marginLeft: 14, flex: 1, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.08)" }} />
      </div>
      <div style={{ position: "relative", height: corps }}>
        {bloc({ left: 28, top: 22, width: 70, height: 14, background: OR })}
        {bloc({ right: 28, top: 18, width: 90, height: 22, borderRadius: 99, background: OR })}
        {bloc({ left: 28, top: 66, width: largeur * 0.4, height: 24, background: IVOIRE })}
        {bloc({ left: 28, top: 100, width: largeur * 0.3, height: 24, background: OR })}
        {bloc({ left: 28, top: 140, width: largeur * 0.36, height: 9, background: "rgba(255,255,255,0.25)" })}
        {bloc({ left: 28, top: 156, width: largeur * 0.28, height: 9, background: "rgba(255,255,255,0.25)" })}
        {bloc({ left: 28, top: 182, width: 110, height: 30, borderRadius: 99, background: OR })}
        {bloc({ right: 28, top: 62, width: largeur * 0.38, height: largeur * 0.25, borderRadius: 14, background: "linear-gradient(135deg, rgba(245,196,81,0.55), rgba(23,52,99,0.9))" })}
        {[0, 1, 2].map((i) =>
          bloc(
            { left: 28 + i * (carte + 14), top: corps - 62, width: carte, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(245,196,81,0.25)" },
            i,
          ),
        )}
      </div>
    </div>
  );
};

/* ================= 1. Couverture ================= */

export const AppCouverture: React.FC = () => (
  <Fond>
    <div style={{ position: "absolute", left: 64, top: 64, width: 600 }}>
      <Surtitre>Reels · Shorts · TikTok</Surtitre>
      <Titre taille={60}>
        Présentez votre
        <br />
        <Or>app ou site web</Or>
        <br />
        en 30 secondes.
      </Titre>
      <div style={{ fontFamily: outfit, fontWeight: 400, fontSize: 24, lineHeight: 1.4, color: TEXTE, marginTop: 20, width: 540 }}>
        Vos vrais écrans animés en motion design, dans une vidéo verticale prête à publier.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24, width: 560 }}>
        {["App mobile", "Site web", "SaaS", "Script + voix off"].map((t) => (
          <div key={t} style={{ fontFamily: outfit, fontWeight: 600, fontSize: 19, color: NAVY, background: OR, borderRadius: 999, padding: "8px 16px" }}>
            {t}
          </div>
        ))}
      </div>
    </div>
    <Navigateur largeur={500} style={{ left: 690, top: 120, transform: "rotate(-3deg)" }} />
    <Telephone src="comeup/app_24.jpg" largeur={215} style={{ left: 990, top: 210, transform: "rotate(5deg)", zIndex: 2 }} />
    <Marque />
  </Fond>
);

/* ================= 2. Les 3 formules (sans prix) ================= */

export const AppOffres: React.FC = () => {
  const offres: { nom: string; duree: string; lignes: string[]; star?: boolean }[] = [
    { nom: "Basic", duree: "1 vidéo · 20 s", lignes: ["Jusqu'à 3 écrans animés", "Textes animés", "Musique libre de droits", "1 retouche"] },
    { nom: "Standard", duree: "1 vidéo · 30 s", lignes: ["Jusqu'à 5 écrans animés", "Script écrit pour vous", "Voix off + sous-titres", "2 retouches"], star: true },
    { nom: "Premium", duree: "Pack lancement", lignes: ["1 vidéo de 45 s", "+ 2 teasers de 15 s", "+ version 16:9 site web", "Script + voix off"] },
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

/* ================= 3. Ce que je produis ================= */

export const AppInclus: React.FC = () => {
  const items: [string, string][] = [
    ["Vos vrais écrans animés", "Captures de votre app ou site, mises en mouvement"],
    ["Mockups téléphone et ordinateur", "Zooms, défilements, clics simulés"],
    ["Script orienté bénéfices", "Le problème, votre solution, l'appel à l'action"],
    ["Voix off et sous-titres", "Voix française, sous-titres animés"],
    ["À vos couleurs", "Logo, couleurs et polices de votre marque"],
    ["Format vertical 9:16", "Prêt pour Reels, Shorts, TikTok, WhatsApp"],
  ];
  return (
    <Fond>
      <div style={{ position: "absolute", left: 64, top: 62 }}>
        <Surtitre>Ce que je produis</Surtitre>
        <Titre taille={52}>
          Votre produit, <Or>enfin compris</Or>
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

/* ================= 4. Comment ça marche ================= */

export const AppProcess: React.FC = () => {
  const etapes: [string, string][] = [
    ["Vous m'envoyez", "Captures ou enregistrement d'écran, logo, lien"],
    ["Je propose le script", "Vous validez le texte avant l'animation"],
    ["J'anime vos écrans", "Mockups, zooms, voix off, sous-titres"],
    ["Vous publiez", "Réseaux sociaux, site web, publicités"],
  ];
  return (
    <Fond>
      <div style={{ position: "absolute", left: 64, top: 62 }}>
        <Surtitre>Comment ça marche</Surtitre>
        <Titre taille={52}>
          4 étapes, <Or>zéro tournage</Or>
        </Titre>
      </div>
      <div style={{ position: "absolute", left: 64, top: 300, width: 1132, height: 3, background: "rgba(245,196,81,0.25)" }} />
      <div style={{ position: "absolute", left: 64, top: 268, width: 1132, display: "flex", gap: 24 }}>
        {etapes.map(([t, d], i) => (
          <div key={t} style={{ flex: 1 }}>
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: 999,
                background: i === 3 ? OR : NAVY,
                border: `3px solid ${OR}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: sora,
                fontWeight: 800,
                fontSize: 28,
                color: i === 3 ? NAVY : OR,
              }}
            >
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
