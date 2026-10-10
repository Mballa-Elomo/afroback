/**
 * Accessoires dessinés de la vidéo « Les faits sur la natte » (Paul Biya, mode Mémoire).
 * Natte tressée vue d'en haut, objets posés un par un, fiches datées, compteur d'années.
 * Aucune personne réelle représentée : seules des mains génériques en silhouette (le griot).
 */
import React from "react";
import { random } from "remotion";
import { cinzel, manrope } from "../theme";

export const B = {
  ink: "#15110D",
  paper: "#E8DFCC",
  paperDark: "#CDBF9F",
  straw: "#B89A62",
  strawLight: "#D2B67C",
  strawDark: "#5E4A2A",
  bronze: "#A8875A",
  bronzeLight: "#C9A46C",
  terra: "#9C4A33",
  admin: "#5C6670",
  ground: "#140E09",
  ivory: "#F3EADB",
};

/* ---------- Natte tressée (monde : coordonnées en px du « monde ») ---------- */

export const MAT = { x: -230, y: 110, w: 1720, h: 2880 };

export const Mat: React.FC = () => {
  const { x, y, w, h } = MAT;
  return (
    <svg width={w + 200} height={h + 200} style={{ position: "absolute", left: x - 100, top: y - 100, overflow: "visible" }} viewBox={`${x - 100} ${y - 100} ${w + 200} ${h + 200}`}>
      <defs>
        <linearGradient id="bh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={B.strawLight} />
          <stop offset="0.5" stopColor={B.straw} />
          <stop offset="1" stopColor="#8E7444" />
        </linearGradient>
        <linearGradient id="bv" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9C8150" />
          <stop offset="0.5" stopColor={B.straw} />
          <stop offset="1" stopColor="#7E6538" />
        </linearGradient>
        <pattern id="weave" width="56" height="56" patternUnits="userSpaceOnUse">
          <rect width="56" height="56" fill={B.strawDark} />
          <rect x="1" y="3" width="27" height="22" rx="5" fill="url(#bh)" />
          <rect x="29" y="31" width="27" height="22" rx="5" fill="url(#bh)" />
          <rect x="31" y="1" width="22" height="27" rx="5" fill="url(#bv)" />
          <rect x="3" y="29" width="22" height="27" rx="5" fill="url(#bv)" />
        </pattern>
        <filter id="matNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.07  0 0 0 0 0.03  0 0 0 0.55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      {/* ombre de la natte sur la terre battue */}
      <rect x={x + 24} y={y + 30} width={w} height={h} rx="26" fill="rgba(0,0,0,0.55)" style={{ filter: "blur(18px)" }} />
      {/* franges haut et bas */}
      {Array.from({ length: 54 }).map((_, i) => {
        const fx = x + 20 + i * ((w - 40) / 53);
        const l = 34 + random(`fr${i}`) * 26;
        return (
          <g key={i} stroke="#8E7444" strokeWidth="5" strokeLinecap="round">
            <line x1={fx} y1={y + 4} x2={fx + (random(`fa${i}`) - 0.5) * 14} y2={y - l} />
            <line x1={fx} y1={y + h - 4} x2={fx + (random(`fb${i}`) - 0.5) * 14} y2={y + h + l} />
          </g>
        );
      })}
      <rect x={x} y={y} width={w} height={h} rx="22" fill="url(#weave)" />
      <rect x={x} y={y} width={w} height={h} rx="22" fill="#000" filter="url(#matNoise)" />
      {/* bordure tressée plus sombre */}
      <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx="18" fill="none" stroke="rgba(60,40,18,0.75)" strokeWidth="26" />
      <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx="18" fill="none" stroke="rgba(210,182,124,0.35)" strokeWidth="4" strokeDasharray="18 10" />
    </svg>
  );
};

/* ---------- Ombre portée commune (lampe hors champ, à gauche) ---------- */
export const objShadow = "drop-shadow(20px 16px 14px rgba(0,0,0,0.62))";

/* ---------- Fiche du nom ---------- */
export const NameCard: React.FC = () => (
  <div style={{ width: 820, height: 300, background: `linear-gradient(160deg, ${B.paper} 0%, ${B.paperDark} 100%)`, borderRadius: 6, boxShadow: "inset 0 0 40px rgba(120,90,40,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 120, color: B.ink, letterSpacing: 6, lineHeight: 1 }}>PAUL BIYA</div>
    <div style={{ height: 22 }} />
    <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 38, color: "rgba(21,17,13,0.8)", textAlign: "center", lineHeight: 1.25 }}>
      président du Cameroun
      <br />
      depuis le 6 novembre 1982
    </div>
  </div>
);

/* ---------- Carte ancienne du Sud ---------- */
export const MapCard: React.FC<{ dot: number }> = ({ dot }) => (
  <svg width={420} height={330} viewBox="0 0 420 330">
    <defs>
      <linearGradient id="mapP" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E6D3A8" />
        <stop offset="1" stopColor="#C9B07C" />
      </linearGradient>
    </defs>
    <rect width="420" height="330" rx="4" fill="url(#mapP)" />
    {/* plis */}
    <line x1="140" y1="0" x2="140" y2="330" stroke="rgba(90,60,20,0.28)" strokeWidth="3" />
    <line x1="280" y1="0" x2="280" y2="330" stroke="rgba(90,60,20,0.22)" strokeWidth="3" />
    <line x1="0" y1="165" x2="420" y2="165" stroke="rgba(90,60,20,0.25)" strokeWidth="3" />
    {/* côte atlantique */}
    <path d="M 0 40 C 30 70, 22 120, 40 160 S 30 250, 48 330 L 0 330 Z" fill="rgba(70,95,105,0.35)" />
    <path d="M 0 40 C 30 70, 22 120, 40 160 S 30 250, 48 330" fill="none" stroke="#6B4A22" strokeWidth="3" />
    {/* forêt en hachures */}
    {Array.from({ length: 120 }).map((_, i) => {
      const x = 60 + random(`mx${i}`) * 340;
      const y = 30 + random(`my${i}`) * 280;
      return <path key={i} d={`M ${x} ${y} l 7 -10 l 7 10`} fill="none" stroke="rgba(52,80,44,0.55)" strokeWidth="2.2" />;
    })}
    {/* rivière */}
    <path d="M 410 70 C 330 100, 300 150, 230 160 S 120 210, 46 230" fill="none" stroke="rgba(60,90,110,0.7)" strokeWidth="4" />
    <rect x="6" y="6" width="408" height="318" fill="none" stroke="#6B4A22" strokeWidth="3" />
    <text x="210" y="40" textAnchor="middle" fontFamily={cinzel} fontWeight={700} fontSize="24" fill="#4A3216">SUD DU CAMEROUN</text>
    {/* Mvomeka'a */}
    <circle cx="270" cy="230" r={10 + 26 * dot} fill={`rgba(201,164,108,${0.35 * dot})`} />
    <circle cx="270" cy="230" r="9" fill={dot > 0 ? B.bronze : "#6B4A22"} stroke="#3A260E" strokeWidth="2" />
    <text x="270" y="275" textAnchor="middle" fontFamily={manrope} fontWeight={800} fontSize="30" fill="#2E1E0A" opacity={0.3 + 0.7 * dot}>Mvomeka'a</text>
  </svg>
);

/* ---------- Soutane pliée ---------- */
export const Soutane: React.FC = () => (
  <svg width={330} height={300} viewBox="0 0 330 300">
    <defs>
      <linearGradient id="sou" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2B2622" />
        <stop offset="0.6" stopColor="#151210" />
        <stop offset="1" stopColor="#0B0908" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="310" height="280" rx="18" fill="url(#sou)" />
    <rect x="10" y="10" width="310" height="280" rx="18" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
    {/* col romain */}
    <path d="M 95 10 Q 165 70 235 10" fill="none" stroke="#111" strokeWidth="30" />
    <rect x="148" y="16" width="34" height="16" rx="3" fill="#EDE6D8" />
    {/* boutonnière */}
    {Array.from({ length: 9 }).map((_, i) => (
      <circle key={i} cx="165" cy={62 + i * 25} r="5.5" fill="#2F2A26" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    ))}
    {/* plis */}
    <path d="M 60 40 C 70 140, 55 210, 70 285" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
    <path d="M 270 40 C 262 130, 280 210, 262 285" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="8" />
    <line x1="10" y1="150" x2="320" y2="150" stroke="rgba(0,0,0,0.55)" strokeWidth="4" />
  </svg>
);

/* ---------- Rouleaux de diplômes ---------- */
export const Diplomas: React.FC = () => (
  <svg width={360} height={200} viewBox="0 0 360 200">
    <defs>
      <linearGradient id="roll" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F4ECDC" />
        <stop offset="0.5" stopColor="#E2D5BB" />
        <stop offset="1" stopColor="#B9A984" />
      </linearGradient>
    </defs>
    {[0, 1, 2].map((i) => {
      const y = 20 + i * 58;
      const x = 20 + (i % 2) * 22;
      return (
        <g key={i} transform={`rotate(${-6 + i * 5} ${x + 150} ${y + 22})`}>
          <rect x={x} y={y} width="300" height="44" rx="22" fill="url(#roll)" stroke="rgba(90,70,40,0.4)" strokeWidth="2" />
          <ellipse cx={x + 22} cy={y + 22} rx="10" ry="20" fill="none" stroke="rgba(110,85,50,0.5)" strokeWidth="2" />
          <rect x={x + 140} y={y - 2} width="22" height="48" fill={B.terra} />
          <path d={`M ${x + 151} ${y + 44} l -12 26 M ${x + 151} ${y + 44} l 12 26`} stroke={B.terra} strokeWidth="7" strokeLinecap="round" />
        </g>
      );
    })}
  </svg>
);

/* ---------- Pile de dossiers (étiquettes qui s'écrivent) ---------- */
export const FOLDER_LABELS = ["1962 · chargé de mission à la présidence", "1968 · secrétaire général de la présidence", "1970 · ministre d'État"];
export const Folders: React.FC<{ shown: number[] }> = ({ shown }) => (
  <div style={{ position: "relative", width: 560, height: 560 }}>
    {FOLDER_LABELS.map((lab, i) => {
      const p = shown[i] ?? 0;
      if (p <= 0) return null;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 20 + i * 18,
            top: 330 - i * 150 + (1 - p) * 60,
            width: 500,
            height: 200,
            opacity: Math.min(1, p * 2),
            borderRadius: 8,
            background: `linear-gradient(160deg, #6E7882 0%, ${B.admin} 60%, #49525A 100%)`,
            boxShadow: "0 12px 22px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.08)",
          }}
        >
          {/* onglet */}
          <div style={{ position: "absolute", left: 24, top: -22, width: 150, height: 30, borderRadius: "8px 8px 0 0", background: "#68727C" }} />
          {/* sangle */}
          <div style={{ position: "absolute", left: 420, top: 0, width: 26, height: 200, background: "#3A3128", boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.3)" }} />
          {/* étiquette */}
          <div style={{ position: "absolute", left: 26, top: 68, width: 380, minHeight: 112, padding: "12px 18px", boxSizing: "border-box", background: B.paper, borderRadius: 4, fontFamily: manrope, fontWeight: 800, fontSize: 36, lineHeight: 1.2, color: B.ink }}>
            {lab}
          </div>
        </div>
      );
    })}
  </div>
);

export const Pen: React.FC = () => (
  <svg width={360} height={40} viewBox="0 0 360 40">
    <rect x="40" y="10" width="260" height="20" rx="10" fill="#1A1714" stroke="rgba(201,164,108,0.6)" strokeWidth="2" />
    <rect x="200" y="9" width="22" height="22" fill={B.bronze} />
    <path d="M 300 12 L 352 20 L 300 28 Z" fill={B.bronzeLight} />
    <rect x="60" y="4" width="110" height="6" rx="3" fill={B.bronze} />
  </svg>
);

/* ---------- Éphéméride ---------- */
const Sheet: React.FC<{ day: string }> = ({ day }) => (
  <div style={{ position: "absolute", inset: "34px 0 0 0", background: `linear-gradient(180deg, #F2ECDF 0%, ${B.paper} 100%)`, borderRadius: "0 0 8px 8px", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.08)" }}>
    <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 30, color: B.terra, letterSpacing: 4 }}>NOVEMBRE</div>
    <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 150, lineHeight: 1, color: B.ink }}>{day}</div>
    <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 40, color: B.ink }}>1982</div>
  </div>
);
export const Ephemeride: React.FC<{ tear: number }> = ({ tear }) => (
  <div style={{ position: "relative", width: 300, height: 330 }}>
    <div style={{ position: "absolute", inset: 0, background: "#2A221A", borderRadius: 10 }} />
    <Sheet day="6" />
    {tear < 1 ? (
      <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 0%", transform: `translate(${tear * 260}px, ${tear * 120}px) rotate(${tear * 28}deg)`, opacity: 1 - tear * 0.9 }}>
        <Sheet day="4" />
      </div>
    ) : null}
    {/* anneaux */}
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: "absolute", top: 8, left: 52 + i * 62, width: 18, height: 40, borderRadius: 9, border: "4px solid #B8B2A6", background: "transparent" }} />
    ))}
  </div>
);

/* ---------- Livre « CONSTITUTION » ---------- */
export const ConstitutionBook: React.FC = () => (
  <div style={{ position: "relative", width: 300, height: 400, borderRadius: "6px 14px 14px 6px", background: "linear-gradient(120deg, #2E3A33 0%, #1E2722 70%, #161D19 100%)", boxShadow: "inset 10px 0 0 rgba(0,0,0,0.35), inset 0 0 0 3px rgba(168,135,90,0.35)" }}>
    <div style={{ position: "absolute", left: 28, right: 18, top: 24, bottom: 24, border: `2px solid rgba(168,135,90,0.6)`, borderRadius: 6 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: cinzel, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: B.bronze }}>CONSTITUTION</div>
    <div style={{ position: "absolute", left: 120, right: 110, top: 205, height: 2, background: B.bronze, opacity: 0.6 }} />
    {/* tranche des pages */}
    <div style={{ position: "absolute", right: -10, top: 10, bottom: 10, width: 12, borderRadius: "0 4px 4px 0", background: "repeating-linear-gradient(180deg, #E6DCC6 0 3px, #C8BB9E 3px 5px)" }} />
  </div>
);

/* ---------- Fiche datée (toutes identiques en forme, taille, couleur) ---------- */
export const FactCard: React.FC<{ year: string; text: string }> = ({ year, text }) => (
  <div style={{ width: 880, height: 232, boxSizing: "border-box", padding: "22px 34px", background: `linear-gradient(170deg, ${B.paper} 0%, ${B.paperDark} 100%)`, borderRadius: 6, boxShadow: "inset 0 0 30px rgba(120,90,40,0.3)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 56, color: "#7A5E36", lineHeight: 1.05, letterSpacing: 2 }}>{year}</div>
    <div style={{ height: 8 }} />
    <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 38, color: B.ink, lineHeight: 1.22 }}>{text}</div>
  </div>
);

/* ---------- Mains du griot (silhouette générique) ---------- */
export const Hand: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg width={300} height={300} viewBox="0 0 300 300" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
    <path
      d="M 70 300 C 60 240, 50 200, 60 170 C 66 150, 84 150, 92 168 L 104 196 L 98 70 C 98 52, 124 50, 126 70 L 136 160 L 140 48 C 142 28, 170 28, 170 48 L 170 160 L 186 62 C 190 44, 216 46, 214 66 L 202 168 L 226 100 C 232 82, 258 88, 252 108 L 224 210 C 214 250, 210 270, 214 300 Z"
      fill="#0D0A07"
      stroke="rgba(201,164,108,0.28)"
      strokeWidth="3"
    />
    <path d="M 214 300 C 210 270, 214 250, 224 210 L 252 108" fill="none" stroke="rgba(255,190,110,0.25)" strokeWidth="4" />
  </svg>
);

/* ---------- Compteur d'années mécanique ---------- */
const DIGIT_H = 250;
export const Odometer: React.FC<{ value: number }> = ({ value }) => {
  const digits = [3, 2, 1, 0];
  return (
    <div style={{ display: "flex", gap: 18 }}>
      {digits.map((p) => {
        const pow = Math.pow(10, p);
        const base = Math.floor(value / pow) % 10;
        let frac = 0;
        if (p === 0) frac = value - Math.floor(value);
        else {
          const lower = value % pow;
          frac = Math.max(0, lower - (pow - 1));
        }
        const pos = base + frac;
        return (
          <div key={p} style={{ position: "relative", width: 190, height: DIGIT_H, overflow: "hidden", borderRadius: 14, background: "linear-gradient(180deg, #050403 0%, #17120D 50%, #050403 100%)", boxShadow: "inset 0 0 0 3px rgba(168,135,90,0.35), 0 20px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: -pos * DIGIT_H }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
                <div key={i} style={{ height: DIGIT_H, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 200, color: B.bronzeLight }}>
                  {d}
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: DIGIT_H / 2 - 1, height: 2, background: "rgba(0,0,0,0.7)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.7) 100%)" }} />
          </div>
        );
      })}
    </div>
  );
};
