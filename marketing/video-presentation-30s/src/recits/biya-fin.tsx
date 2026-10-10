/**
 * Fin de la vidéo Paul Biya, ISOLÉE pour être remplacée facilement.
 *
 * Tant que le récit n'est pas publié dans l'app, CAPTURE vaut null et le téléphone
 * affiche une fiche PROVISOIRE dessinée au style de l'app, sans portrait.
 * Une fois le récit publié :
 *   1. capturer la fiche :  node scripts/capture-app.mjs '[{"click":"Héros","wait":3000},{"click":"Paul Biya","wait":4000},{"shot":"paul-biya"}]'
 *      (→ public/img/capture-app-paul-biya.png, 390 × 844)
 *   2. mettre CAPTURE = "img/capture-app-paul-biya.png" et RING_Y = ordonnée du titre ou du bouton (écran 390 × 844)
 *   3. relancer le rendu.
 * Attention : si la vraie fiche montre un portrait réaliste, le signaler à Yannick avant diffusion.
 */
import React from "react";
import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame } from "remotion";
import { C, cinzel, manrope, popScale, ramp } from "../theme";
import { Diamonds, LetterDrop, PunchWord } from "../fx";
import { Fog, Night, Vig } from "../recit-kit";
import { Phone } from "../phone";
import { B } from "./biya-props";

export const CAPTURE: string | null = null;
const RING_Y = 372; // titre « PAUL BIYA » dans la fiche provisoire

/* ---------- Fiche provisoire (écran 390 × 844, style de la fiche héros de l'app) ---------- */

const Chip: React.FC<{ label: string; filled?: boolean }> = ({ label, filled }) => (
  <div style={{ padding: "5px 12px", borderRadius: 20, fontFamily: manrope, fontWeight: 700, fontSize: 12, color: filled ? "#1A130D" : C.ivory, background: filled ? C.gold : "transparent", border: filled ? "none" : `1.5px solid ${C.gold}` }}>{label}</div>
);

const Action: React.FC<{ label: string; w: number }> = ({ label, w }) => (
  <div style={{ width: w, height: 36, borderRadius: 18, background: "#211A14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: manrope, fontWeight: 700, fontSize: 12.5, color: C.ivory }}>{label}</div>
);

/** portrait : chemin d'image (v2, décision de Yannick) ; sans portrait = en-tête natte (v1). */
export const FicheProvisoire: React.FC<{ portrait?: string }> = ({ portrait }) => (
  <div style={{ position: "absolute", inset: 0, background: C.appBg }}>
    {portrait ? (
      <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 400, overflow: "hidden", background: "#070504" }}>
        <Img src={staticFile(portrait)} style={{ position: "absolute", left: 10, top: 44, width: 370, height: 370, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(15,11,8,0) 55%, ${C.appBg} 100%)` }} />
      </div>
    ) : (
    <svg width={390} height={360} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <pattern id="wv-fiche" width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill="#2A2116" />
          <rect x="1" y="1.5" width="12" height="10" rx="2.5" fill="#6E5A38" />
          <rect x="14" y="14.5" width="12" height="10" rx="2.5" fill="#6E5A38" />
          <rect x="14.5" y="1" width="10" height="12" rx="2.5" fill="#5B4A2E" />
          <rect x="1.5" y="14" width="10" height="12" rx="2.5" fill="#5B4A2E" />
        </pattern>
        <radialGradient id="lampe-fiche" cx="0.3" cy="0.45" r="0.8">
          <stop offset="0" stopColor="rgba(255,190,110,0.25)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id="fondu-fiche" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="rgba(15,11,8,0)" />
          <stop offset="1" stopColor={C.appBg} />
        </linearGradient>
      </defs>
      <rect width="390" height="360" fill="url(#wv-fiche)" />
      <rect width="390" height="360" fill="url(#lampe-fiche)" />
      <rect width="390" height="360" fill="url(#fondu-fiche)" />
      <circle cx="195" cy="165" r="62" fill="rgba(10,8,6,0.75)" stroke={B.bronze} strokeWidth="2" />
      <text x="195" y="160" textAnchor="middle" fontFamily={cinzel} fontWeight={700} fontSize="17" fill={B.bronzeLight} letterSpacing="1.5">MÉMOIRE</text>
      <text x="195" y="183" textAnchor="middle" fontFamily={manrope} fontWeight={700} fontSize="10.5" fill="rgba(243,234,219,0.75)">les faits, et d'où</text>
      <text x="195" y="197" textAnchor="middle" fontFamily={manrope} fontWeight={700} fontSize="10.5" fill="rgba(243,234,219,0.75)">ils viennent</text>
    </svg>
    )}
    <div style={{ position: "absolute", left: 18, top: 22, width: 38, height: 38, borderRadius: 19, border: "1.5px solid rgba(240,195,107,0.5)", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontFamily: manrope, fontWeight: 800, fontSize: 18 }}>‹</div>
    <div style={{ position: "absolute", left: 18, top: 316, display: "flex", gap: 8 }}>
      <Chip label="Contemporain" />
      <Chip label="Politique" filled />
    </div>
    <div style={{ position: "absolute", left: 18, top: 352, fontFamily: cinzel, fontWeight: 900, fontSize: 34, color: C.ivory, letterSpacing: 1 }}>PAUL BIYA</div>
    <div style={{ position: "absolute", left: 18, right: 18, top: 402, fontFamily: manrope, fontWeight: 500, fontSize: 12.5, color: C.textBody, whiteSpace: "nowrap", overflow: "hidden" }}>Né en 1933 · Afrique centrale (Cameroun)</div>
    <div style={{ position: "absolute", left: 18, top: 430, padding: "4px 10px", borderRadius: 6, background: "rgba(168,135,90,0.16)", border: "1px solid rgba(168,135,90,0.45)", fontFamily: manrope, fontWeight: 700, fontSize: 11, color: B.bronzeLight }}>Récit Mémoire · factuel, sans louange ni accusation</div>
    <div style={{ position: "absolute", left: 18, top: 474, display: "flex", gap: 8 }}>
      <Action label="J'aime" w={96} />
      <Action label="Commenter" w={120} />
      <Action label="Partager" w={112} />
    </div>
    <div style={{ position: "absolute", left: 18, right: 18, top: 530, fontFamily: manrope, fontWeight: 500, fontSize: 14.5, lineHeight: 1.5, color: C.textBody }}>
      Président de la République du Cameroun depuis le 6 novembre 1982, après sept ans comme Premier ministre d'Ahmadou Ahidjo. Né en 1933 à Mvomeka'a. Récit traité en mode « Mémoire » : factuel, sans glorification ni dénigrement.
    </div>
    {/* barre d'onglets */}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 74, borderTop: "1px solid rgba(240,195,107,0.12)", background: "#0F0B08", display: "flex", justifyContent: "space-around", alignItems: "center", paddingBottom: 8 }}>
      {["Accueil", "Découverte", "Marché", "Communauté", "Profil"].map((t, i) => (
        <div key={t} style={{ fontFamily: manrope, fontWeight: 700, fontSize: 10.5, color: i === 0 ? C.gold : C.muted, padding: "6px 8px", borderRadius: 14, background: i === 0 ? "rgba(240,195,107,0.12)" : "transparent" }}>{t}</div>
      ))}
    </div>
  </div>
);

/* ---------- Fin (3,6 s) : téléphone + fiche, puis médaillon, AFROBACK, afroback.app ---------- */

export const OutroBiya: React.FC<{ portrait?: string; warm?: boolean }> = ({ portrait, warm }) => {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 16, 0, 1, Easing.out(Easing.back(1.2)));
  const leave = ramp(frame, 50, 12, 0, 1, Easing.in(Easing.cubic));
  const pose = { x: 540, y: 1200 + (1 - rise) * 1100 + leave * 1300, scale: 1.5, rotate: (1 - rise) * 8 };
  const ry = pose.y + (RING_Y - 422) * pose.scale;
  const pulse = frame >= 22 && frame < 52 ? ((frame - 22) % 15) / 15 : -1;
  const logoAt = 56;
  return (
    <AbsoluteFill style={{ opacity: ramp(frame, 0, 6, 0, 1) }}>
      {warm ? <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #21170f 0%, #0d0906 55%, #070504 100%)" }} /> : <Night glow="rgba(201,164,108,0.14)" />}
      <Diamonds id="mb" size={110} opacity={0.04} />
      <Fog y={1500} opacity={0.35} />
      {leave < 1 ? (
        <>
          <Phone pose={pose}>{CAPTURE ? <Img src={staticFile(CAPTURE)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <FicheProvisoire portrait={portrait} />}</Phone>
          {pulse >= 0 ? <div style={{ position: "absolute", left: 540 - 270, top: ry - 52, width: 540, height: 104, borderRadius: 60, border: `5px solid ${C.gold}`, opacity: 1 - pulse, transform: `scale(${1 + pulse * 0.25})` }} /> : null}
        </>
      ) : null}
      {frame < 54 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 255 }}>
          <PunchWord text="CONNAIS LES FAITS." at={2} size={70} color={C.ivory} />
          <div style={{ height: 16 }} />
          <PunchWord text="ÉCOUTE SON HISTOIRE" at={36} size={56} />
        </AbsoluteFill>
      ) : null}
      {frame >= logoAt ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 200 }}>
          <div style={{ transform: `scale(${popScale(frame, logoAt, 10, 1.15)})`, width: 330, height: 330, borderRadius: 165, overflow: "hidden", border: `5px solid ${C.gold}`, boxShadow: "0 0 70px rgba(240,195,107,0.4)" }}>
            <Img src={staticFile("img/logo-medaillon.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ height: 50 }} />
          <LetterDrop text="AFROBACK" at={logoAt + 6} size={120} />
          <div style={{ height: 30 }} />
          <LetterDrop text="afroback.app" at={logoAt + 20} size={60} family={manrope} weight={800} color={C.ivory} colorFrom={{ index: 8, color: C.gold }} stagger={0.6} />
        </AbsoluteFill>
      ) : null}
      <Vig strength={0.6} />
    </AbsoluteFill>
  );
};
