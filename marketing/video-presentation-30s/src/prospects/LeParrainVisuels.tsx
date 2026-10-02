// Visuels de démonstration pour la candidature community manager Le Parrain (leparrain.com).
// Format Instagram 4:5 (1080 × 1350). Charte du site : bleu nuit #1B294B, bleu #3C83F6 → violet,
// titres Sora, texte Outfit. Chiffres relevés sur les fiches le 2026-10-02.
// Parti pris anti « rendu IA » : objets graphiques réels (ticket, étiquette), grain papier,
// trait manuscrit imparfait, données exactes et lisibles.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

export const sora = loadSora("normal", { weights: ["600", "700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const outfit = loadOutfit("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const caveat = loadCaveat("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const NUIT = "#1B294B";
export const ARDOISE = "#414958";
export const BLEU = "#3C83F6";
export const VIOLET = "#8B5CF6";
export const VERT = "#047756";
const PAPIER = "#F6F3EC";
export const DEGRADE = `linear-gradient(90deg, ${BLEU} 0%, ${VIOLET} 100%)`;

/* Grain papier (bruit SVG) */
export const Grain: React.FC<{ opacite?: number; id: string }> = ({ opacite = 0.18, id }) => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: opacite, mixBlendMode: "multiply", pointerEvents: "none" }}>
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);

const Signature: React.FC<{ couleur?: string }> = ({ couleur = NUIT }) => (
  <div style={{ position: "absolute", left: 70, right: 70, bottom: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <Img src={staticFile("leparrain/logo.png")} style={{ width: 210, height: (210 / 400) * 142 }} />
    <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 30, color: couleur }}>leparrain.com</div>
  </div>
);

/* ================= Visuel 1 : « Un ticket, deux gagnants » (Distingo Bank) ================= */

export const VisuelDistingo: React.FC = () => {
  const tw = 940;
  const th = 470;
  return (
    <AbsoluteFill style={{ background: PAPIER, overflow: "hidden" }}>
      {/* bandes de couleur discrètes derrière le ticket */}
      <div style={{ position: "absolute", left: -100, top: 560, width: 1400, height: 260, background: DEGRADE, opacity: 0.12, transform: "rotate(-6deg)" }} />

      <div style={{ position: "absolute", top: 90, left: 70, right: 70 }}>
        <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: BLEU, textTransform: "uppercase" }}>Distingo Bank · jusqu'au 30 octobre</div>
        <div style={{ marginTop: 18, fontFamily: sora, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: NUIT, letterSpacing: -3 }}>
          Un parrainage,
          <br />
          <span style={{ background: DEGRADE, WebkitBackgroundClip: "text", color: "transparent" }}>deux gagnants.</span>
        </div>
      </div>

      {/* le ticket */}
      <div style={{ position: "absolute", left: (1080 - tw) / 2, top: 450, width: tw, height: th, transform: "rotate(-4deg)", filter: "drop-shadow(0 26px 30px rgba(27,41,75,0.28))" }}>
        <svg width={tw} height={th} viewBox={`0 0 ${tw} ${th}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <mask id="encoches">
              <rect width={tw} height={th} fill="white" rx="26" />
              {/* encoches au niveau de la ligne de découpe */}
              <circle cx={tw / 2} cy={0} r={30} fill="black" />
              <circle cx={tw / 2} cy={th} r={30} fill="black" />
            </mask>
            <linearGradient id="talon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={BLEU} />
              <stop offset="1" stopColor={VIOLET} />
            </linearGradient>
          </defs>
          <g mask="url(#encoches)">
            <rect width={tw / 2} height={th} fill={NUIT} />
            <rect x={tw / 2} width={tw / 2} height={th} fill="url(#talon)" />
          </g>
          {/* pointillés de découpe */}
          <line x1={tw / 2} y1={40} x2={tw / 2} y2={th - 40} stroke="#fff" strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" opacity={0.85} />
          {/* fines lignes de sécurité */}
          {new Array(9).fill(0).map((_, i) => (
            <line key={i} x1={30} y1={th - 40 - i * 6} x2={tw / 2 - 40} y2={th - 40 - i * 6} stroke="#fff" strokeOpacity={0.06} strokeWidth={2} />
          ))}
        </svg>
        {/* contenu talon gauche */}
        <div style={{ position: "absolute", left: 0, top: 0, width: tw / 2, height: th, padding: "44px 46px", boxSizing: "border-box", color: "#fff" }}>
          <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 28, letterSpacing: 4, opacity: 0.75 }}>POUR VOUS</div>
          <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 168, lineHeight: 1, marginTop: 20, letterSpacing: -6 }}>
            80<span style={{ fontSize: 96 }}>€</span>
          </div>
          <div style={{ fontFamily: outfit, fontWeight: 500, fontSize: 26, marginTop: 26, opacity: 0.85, lineHeight: 1.3 }}>
            à l'ouverture de
            <br />
            votre livret
          </div>
        </div>
        {/* contenu talon droit */}
        <div style={{ position: "absolute", left: tw / 2, top: 0, width: tw / 2, height: th, padding: "44px 46px", boxSizing: "border-box", color: "#fff" }}>
          <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 28, letterSpacing: 4, opacity: 0.85 }}>VOTRE PARRAIN</div>
          <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 168, lineHeight: 1, marginTop: 20, letterSpacing: -6 }}>
            80<span style={{ fontSize: 96 }}>€</span>
          </div>
          <div style={{ fontFamily: outfit, fontWeight: 500, fontSize: 26, marginTop: 26, lineHeight: 1.3 }}>
            par filleul,
            <br />
            jusqu'à 10 filleuls
          </div>
        </div>
        {/* numéro de série = code de parrainage */}
        <div style={{ position: "absolute", left: tw / 2 + 46, bottom: 40, fontFamily: "monospace", fontSize: 30, fontWeight: 700, color: NUIT, background: "rgba(255,255,255,0.92)", padding: "6px 16px", borderRadius: 8, letterSpacing: 3 }}>
          N° VVCGT
        </div>
      </div>

      {/* note manuscrite */}
      <div style={{ position: "absolute", left: 110, top: 990, fontFamily: caveat, fontWeight: 700, fontSize: 46, color: ARDOISE, transform: "rotate(-3deg)" }}>
        ↑ le code de parrainage est sur le ticket
      </div>

      {/* conditions */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 1080, fontFamily: outfit, fontWeight: 500, fontSize: 25, color: ARDOISE, lineHeight: 1.45, borderTop: `2px solid rgba(27,41,75,0.15)`, paddingTop: 20 }}>
        Prime filleul sous réserve de 10 000 € d'encours pendant 3 mois. Épargne garantie par le FGDR jusqu'à 100 000 €. Conditions complètes sur la fiche Distingo Bank.
      </div>
      <Signature />
      <Grain id="g1" />
    </AbsoluteFill>
  );
};

/* ================= Visuel 2 : « L'étiquette réécrite » (Sunology) ================= */

export const VisuelSunology: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, #E9F1FF 0%, #F7F2E6 62%, #FFE7B8 100%)`, overflow: "hidden" }}>
      {/* soleil géométrique */}
      <svg width={620} height={620} viewBox="-310 -310 620 620" style={{ position: "absolute", right: -150, top: -150 }}>
        {new Array(24).fill(0).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          const r1 = 170;
          const r2 = i % 2 ? 250 : 290;
          return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke="#F5A623" strokeWidth={14} strokeLinecap="round" />;
        })}
        <circle r={140} fill="#FFC23D" />
        <circle r={100} fill="#FFD36B" />
      </svg>

      <div style={{ position: "absolute", top: 100, left: 70, width: 640 }}>
        <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: BLEU, textTransform: "uppercase" }}>Sunology · solaire</div>
        <div style={{ marginTop: 18, fontFamily: sora, fontWeight: 800, fontSize: 84, lineHeight: 1.04, color: NUIT, letterSpacing: -3 }}>
          On a réécrit
          <br />
          l'étiquette.
        </div>
      </div>

      {/* étiquette de prix suspendue */}
      <div style={{ position: "absolute", left: 150, top: 470, width: 780, height: 520, transform: "rotate(5deg)" }}>
        {/* ficelle */}
        <svg width={300} height={160} style={{ position: "absolute", left: -60, top: -70 }}>
          <path d="M90 10 C 120 40, 150 70, 155 90" stroke="#8C7A5B" strokeWidth={4} fill="none" />
        </svg>
        <svg width={780} height={520} viewBox="0 0 780 520" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 24px 28px rgba(27,41,75,0.25))" }}>
          <path d="M120 0 H760 a20 20 0 0 1 20 20 V500 a20 20 0 0 1 -20 20 H120 L0 260 Z" fill="#fff" />
          <circle cx={100} cy={260} r={22} fill="none" stroke="#C9C2B3" strokeWidth={6} />
          <path d="M140 18 H760 V502 H140" fill="none" stroke="rgba(27,41,75,0.12)" strokeWidth={3} strokeDasharray="10 10" />
        </svg>
        {/* ancien taux barré à la main */}
        <div style={{ position: "absolute", left: 190, top: 40, fontFamily: sora, fontWeight: 700, fontSize: 70, color: "#9AA1AE" }}>
          7 %
          <svg width={190} height={90} style={{ position: "absolute", left: -18, top: 10 }}>
            <path d="M8 62 C 50 50, 100 36, 182 20" stroke="#E5484D" strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d="M14 70 C 70 54, 120 42, 178 30" stroke="#E5484D" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
          </svg>
          <span style={{ fontFamily: caveat, fontWeight: 700, fontSize: 40, color: ARDOISE, marginLeft: 26, verticalAlign: "middle" }}>offre officielle</span>
        </div>
        {/* nouveau taux */}
        <div style={{ position: "absolute", left: 180, top: 120, fontFamily: sora, fontWeight: 800, fontSize: 250, lineHeight: 1, letterSpacing: -10, color: NUIT }}>
          10<span style={{ fontSize: 150, background: DEGRADE, WebkitBackgroundClip: "text", color: "transparent" }}>%</span>
        </div>
        <div style={{ position: "absolute", left: 190, top: 380, fontFamily: outfit, fontWeight: 600, fontSize: 34, color: NUIT }}>de remise sur votre commande</div>
        <div style={{ position: "absolute", left: 190, top: 432, fontFamily: "monospace", fontSize: 30, color: "#fff", background: NUIT, padding: "6px 18px", borderRadius: 8, letterSpacing: 3 }}>
          CODE SUNO1020
        </div>
      </div>

      {/* tampon */}
      <svg width={250} height={250} viewBox="-125 -125 250 250" style={{ position: "absolute", right: 70, top: 900, transform: "rotate(-14deg)", opacity: 0.92 }}>
        <defs>
          <path id="cercleTexte" d="M -88 0 A 88 88 0 1 1 88 0 A 88 88 0 1 1 -88 0" />
        </defs>
        <circle r={115} fill="none" stroke={VERT} strokeWidth={6} />
        <circle r={70} fill="none" stroke={VERT} strokeWidth={3} />
        <text fill={VERT} style={{ fontFamily: sora, fontWeight: 800, fontSize: 21, letterSpacing: 1 }}>
          <textPath href="#cercleTexte" textLength={540} lengthAdjust="spacingAndGlyphs">EXCLUSIVITÉ · LE PARRAIN · EXCLUSIVITÉ · LE PARRAIN ·</textPath>
        </text>
        <text textAnchor="middle" y={14} fill={VERT} style={{ fontFamily: sora, fontWeight: 800, fontSize: 40 }}>+3 pts</text>
      </svg>

      <div style={{ position: "absolute", left: 70, width: 620, top: 1100, fontFamily: outfit, fontWeight: 500, fontSize: 25, color: ARDOISE, lineHeight: 1.45 }}>
        Code à saisir avant de valider le paiement. Offre partenaire non cumulable avec le S-Club Sunology.
      </div>
      <Signature />
      <Grain id="g2" opacite={0.14} />
    </AbsoluteFill>
  );
};
