import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, cinzel, manrope, goldGradient } from "./theme";

/** Écran logique de l'app : 390 × 844 (taille iPhone 14, comme les captures). */
export const SW = 390;
export const SH = 844;
const BEZEL = 12;

export const img = (p: string) => staticFile(p);

/* ---------- Téléphone ---------- */

export type PhonePose = {
  x: number; // centre dans le cadre 1080 × 1920
  y: number;
  scale: number;
  rotate?: number;
  rotateY?: number;
  opacity?: number;
};

export const Phone: React.FC<{ pose: PhonePose; children: React.ReactNode; zIndex?: number }> = ({
  pose,
  children,
  zIndex,
}) => {
  const w = SW + BEZEL * 2;
  const h = SH + BEZEL * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: pose.x - w / 2,
        top: pose.y - h / 2,
        width: w,
        height: h,
        zIndex,
        opacity: pose.opacity ?? 1,
        transform: `perspective(2400px) scale(${pose.scale}) rotate(${pose.rotate ?? 0}deg) rotateY(${pose.rotateY ?? 0}deg)`,
        borderRadius: 58,
        background: "linear-gradient(145deg, #2a2622 0%, #0c0b0a 40%, #1b1917 100%)",
        boxShadow: `0 40px 90px rgba(0,0,0,0.75), 0 0 70px rgba(240,195,107,0.28), inset 0 0 0 2px rgba(255,255,255,0.08)`,
        padding: BEZEL,
      }}
    >
      <div style={{ width: SW, height: SH, borderRadius: 46, overflow: "hidden", position: "relative", background: C.appBg }}>
        {children}
        {/* îlot caméra */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: SW / 2 - 55,
            width: 110,
            height: 32,
            borderRadius: 16,
            background: "#000",
            zIndex: 50,
          }}
        />
      </div>
    </div>
  );
};

/** Convertit un point de l'écran (390 × 844) en point du cadre vidéo. */
export const toStage = (pose: PhonePose, sx: number, sy: number) => ({
  x: pose.x + (sx - SW / 2) * pose.scale,
  y: pose.y + (sy - SH / 2) * pose.scale,
});

/** Affiche un écran en plein cadre (1080 × 1920), recadré au centre. */
export const FullScreen: React.FC<{ children: React.ReactNode; zoom?: number; originY?: number }> = ({
  children,
  zoom = 1,
  originY = 0.5,
}) => {
  const k = (1080 / SW) * zoom;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.appBg }}>
      <div
        style={{
          position: "absolute",
          width: SW,
          height: SH,
          left: 540 - SW / 2,
          top: 960 - SH / 2,
          transform: `scale(${k})`,
          transformOrigin: `50% ${originY * 100}%`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Petits éléments d'interface ---------- */

const StatusBar: React.FC = () => (
  <div
    style={{
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 28px 0",
      fontFamily: manrope,
      fontWeight: 700,
      fontSize: 15,
      color: C.ivory,
      position: "relative",
      zIndex: 5,
    }}
  >
    <span>9:41</span>
    <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <span style={{ width: 17, height: 11, display: "flex", alignItems: "flex-end", gap: 2 }}>
        {[4, 6, 8, 11].map((h) => (
          <span key={h} style={{ width: 3, height: h, background: C.ivory, borderRadius: 1 }} />
        ))}
      </span>
      <span style={{ width: 24, height: 12, border: `1.5px solid ${C.ivory}`, borderRadius: 4, padding: 1.5 }}>
        <span style={{ display: "block", width: "80%", height: "100%", background: C.ivory, borderRadius: 2 }} />
      </span>
    </span>
  </div>
);

export const GoldButton: React.FC<{ label: string; style?: React.CSSProperties; pressed?: boolean }> = ({
  label,
  style,
  pressed,
}) => (
  <div
    style={{
      background: "linear-gradient(90deg, #F0C36B 0%, #8B5A2B 100%)",
      color: "#1a1109",
      fontFamily: manrope,
      fontWeight: 800,
      fontSize: 16,
      borderRadius: 16,
      height: 54,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: pressed ? "scale(0.95)" : undefined,
      boxShadow: pressed ? "0 0 30px rgba(240,195,107,0.9)" : "0 8px 24px rgba(240,195,107,0.25)",
      ...style,
    }}
  >
    {label}
  </div>
);

const Pill: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <div
    style={{
      padding: "7px 14px",
      borderRadius: 999,
      border: `1px solid ${active ? C.gold : C.border}`,
      background: active ? "linear-gradient(90deg,#F0C36B,#C98A3D)" : C.cardBg,
      color: active ? "#1a1109" : C.textBody,
      fontFamily: manrope,
      fontWeight: 700,
      fontSize: 13,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

/* ---------- Icônes (SVG, pas d'émoji) ---------- */

export const Icon: React.FC<{ name: string; size?: number; color?: string; fill?: boolean }> = ({
  name,
  size = 22,
  color = C.gold,
  fill,
}) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "like":
      return (
        <svg {...p} fill={fill ? color : "none"}>
          <path d="M7 10v11H3V10h4zm0 0l4-8c1.7 0 3 1.3 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7" />
        </svg>
      );
    case "comment":
      return (
        <svg {...p}>
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.2A8 8 0 1 1 21 12z" />
        </svg>
      );
    case "share":
      return (
        <svg {...p}>
          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13" />
        </svg>
      );
    case "search":
      return (
        <svg {...p}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case "crown":
      return (
        <svg {...p}>
          <path d="M3 18h18M4 16L3 7l5 4 4-7 4 7 5-4-1 9z" />
        </svg>
      );
    case "moon":
      return (
        <svg {...p}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      );
    case "compass":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M16 8l-2 6-6 2 2-6 6-2z" />
        </svg>
      );
    case "bag":
      return (
        <svg {...p}>
          <path d="M5 8h14l-1 13H6L5 8zM9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case "play":
      return (
        <svg {...p} fill={color}>
          <path d="M7 4l13 8-13 8V4z" />
        </svg>
      );
    case "pause":
      return (
        <svg {...p} fill={color} stroke="none">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      );
    case "headphones":
      return (
        <svg {...p}>
          <path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1v-6h3v4zM3 19a2 2 0 0 0 2 2h1v-6H3v4z" />
        </svg>
      );
    case "film":
      return (
        <svg {...p}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
        </svg>
      );
    case "book":
      return (
        <svg {...p}>
          <path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14" />
        </svg>
      );
    case "check":
      return (
        <svg {...p} strokeWidth={3}>
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      );
    case "cart":
      return (
        <svg {...p}>
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
          <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" />
        </svg>
      );
    case "home":
      return (
        <svg {...p}>
          <path d="M3 11l9-8 9 8v10H3z" />
        </svg>
      );
    case "users":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="4" />
          <path d="M1 21a8 8 0 0 1 16 0M17 4a4 4 0 0 1 0 8M23 21a8 8 0 0 0-5-7.4" />
        </svg>
      );
    case "user":
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...p}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    default:
      return null;
  }
};

/* ---------- Drapeaux dessinés (les drapeaux émoji ne s'affichent pas sous Windows) ---------- */

const FlagFR: React.FC = () => (
  <span style={{ display: "inline-flex", width: 26, height: 18, borderRadius: 3, overflow: "hidden" }}>
    <span style={{ flex: 1, background: "#0055A4" }} />
    <span style={{ flex: 1, background: "#fff" }} />
    <span style={{ flex: 1, background: "#EF4135" }} />
  </span>
);
const FlagUK: React.FC = () => (
  <span style={{ display: "inline-block", width: 26, height: 18, borderRadius: 3, overflow: "hidden", position: "relative", background: "#012169" }}>
    <span style={{ position: "absolute", left: 0, right: 0, top: 6, height: 6, background: "#fff" }} />
    <span style={{ position: "absolute", top: 0, bottom: 0, left: 10, width: 6, background: "#fff" }} />
    <span style={{ position: "absolute", left: 0, right: 0, top: 7.5, height: 3, background: "#C8102E" }} />
    <span style={{ position: "absolute", top: 0, bottom: 0, left: 11.5, width: 3, background: "#C8102E" }} />
  </span>
);

export const FlagPill: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "18px 30px",
      borderRadius: 999,
      background: goldGradient,
      fontFamily: manrope,
      fontWeight: 800,
      fontSize: 44,
      color: "#1a1109",
      boxShadow: "0 20px 60px rgba(240,195,107,0.5)",
    }}
  >
    <span style={{ transform: "scale(1.8)", display: "inline-flex", marginRight: 16 }}>
      <FlagFR />
    </span>
    FR
  </div>
);

/* ================================================================
   ÉCRANS
   ================================================================ */

/** Démarrage : logo, « Choisis ta langue », bouton Commencer. */
export const LanguageScreen: React.FC<{ open: boolean; pressedStart?: boolean; pressedFr?: boolean }> = ({
  open,
  pressedStart,
  pressedFr,
}) => (
  <AbsoluteFill>
    <Img src={img("img/splash.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,9,6,0.2) 0%, rgba(12,9,6,0.55) 45%, rgba(12,9,6,0.97) 72%)" }} />
    <StatusBar />
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Img src={img("img/icon.png")} style={{ width: 150, height: 150, borderRadius: 75, boxShadow: "0 0 50px rgba(240,195,107,0.5)" }} />
      <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 38, color: C.gold, marginTop: 18, letterSpacing: 2 }}>AFROBACK</div>
      <div style={{ fontFamily: manrope, fontWeight: 600, fontSize: 16, color: C.ivory, opacity: 0.85, marginTop: 4 }}>Retour aux origines</div>
    </div>
    {/* sélecteur de langue : y 470 → 526 */}
    <div style={{ position: "absolute", left: 32, right: 32, top: 440 }}>
      <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 14, color: C.muted, marginBottom: 10 }}>Choisis ta langue</div>
      <div
        style={{
          height: 56,
          borderRadius: 14,
          border: `1px solid ${open ? C.gold : C.border}`,
          background: C.surface,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          fontFamily: manrope,
          fontWeight: 700,
          fontSize: 17,
          color: C.ivory,
        }}
      >
        <FlagFR /> Français
        <span style={{ marginLeft: "auto" }}>
          <Icon name="chevron" size={20} />
        </span>
      </div>
      {open ? (
        <div style={{ marginTop: 8, borderRadius: 14, background: "#221810", border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {[
            { f: <FlagFR />, l: "Français", sel: true },
            { f: <FlagUK />, l: "English", sel: false },
          ].map((o) => (
            <div
              key={o.l}
              style={{
                height: 54,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
                fontFamily: manrope,
                fontWeight: 700,
                fontSize: 17,
                color: C.ivory,
                background: o.sel && pressedFr ? "rgba(240,195,107,0.25)" : "transparent",
              }}
            >
              {o.f} {o.l}
              {o.sel ? (
                <span style={{ marginLeft: "auto" }}>
                  <Icon name="check" size={18} />
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
    <GoldButton label="Commencer" pressed={pressedStart} style={{ position: "absolute", left: 32, right: 32, top: 720 }} />
  </AbsoluteFill>
);
// Points à toucher (coordonnées écran)
export const TAP_FR = { x: 120, y: 553 };
export const TAP_START = { x: 195, y: 747 };

const TabBar: React.FC<{ active: number }> = ({ active }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 84,
      background: "rgba(12,9,6,0.94)",
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      justifyContent: "space-around",
      paddingTop: 12,
    }}
  >
    {[
      ["home", "Accueil"],
      ["crown", "Héros"],
      ["compass", "Découverte"],
      ["users", "Communauté"],
      ["user", "Profil"],
    ].map(([ic, l], i) => (
      <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: manrope, fontSize: 10.5, fontWeight: 700, color: i === active ? C.gold : C.muted }}>
        <Icon name={ic} size={21} color={i === active ? C.gold : C.muted} />
        {l}
      </div>
    ))}
  </div>
);

export const SHORTCUTS = [
  { ic: "crown", l: "Héros" },
  { ic: "moon", l: "Mythes" },
  { ic: "compass", l: "Découverte" },
  { ic: "bag", l: "Marché" },
];

/** Accueil : en-tête, recherche, 4 raccourcis, Histoire du jour. */
export const HomeScreen: React.FC<{ hideShortcuts?: boolean; pressedRead?: boolean }> = ({ hideShortcuts, pressedRead }) => (
  <AbsoluteFill style={{ background: C.appBg }}>
    <StatusBar />
    <div style={{ padding: "10px 22px 0", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 54, height: 54, borderRadius: 27, padding: 3, background: "linear-gradient(135deg,#F7D98B,#C98A3D)" }}>
        <Img src={img("img/racines.jpg")} style={{ width: 48, height: 48, borderRadius: 24, objectFit: "cover", border: `2px solid ${C.appBg}` }} />
      </div>
      <div>
        <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 25, color: "#F7E7C8" }}>Bonjour</div>
        <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 13.5, color: C.muted }}>Retour aux origines</div>
      </div>
    </div>
    <div
      style={{
        margin: "18px 22px 0",
        height: 48,
        borderRadius: 14,
        background: C.surface,
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
        fontFamily: manrope,
        fontSize: 14.5,
        color: C.muted,
      }}
    >
      <Icon name="search" size={19} color={C.muted} /> Rechercher un héros, un mythe…
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 22px 0", opacity: hideShortcuts ? 0 : 1 }}>
      {SHORTCUTS.map((s) => (
        <div key={s.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: 76 }}>
          <div style={{ width: 62, height: 62, borderRadius: 18, background: C.cardBg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={s.ic} size={26} />
          </div>
          <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 12, color: C.textBody }}>{s.l}</div>
        </div>
      ))}
    </div>
    {/* Histoire du jour : y 300 → 700 */}
    <div style={{ position: "absolute", left: 22, right: 22, top: 300, height: 400, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <Img src={img("heros/reine-nzinga.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(12,9,6,0.95) 85%)" }} />
      <div style={{ position: "absolute", left: 18, top: 16 }}>
        <Pill label="Histoire du jour" active />
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 18 }}>
        <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 28, color: "#F7E7C8" }}>Reine Nzinga</div>
        <div style={{ fontFamily: manrope, fontSize: 14, color: C.textBody, margin: "4px 0 14px" }}>Reine du Ndongo et du Matamba</div>
        <GoldButton label="Lire le récit" pressed={pressedRead} style={{ height: 48, fontSize: 15 }} />
      </div>
    </div>
    <TabBar active={0} />
  </AbsoluteFill>
);
export const HOME_CARD_CENTER = { x: 195, y: 500 };
export const TAP_READ = { x: 195, y: 658 };
export const SHORTCUT_POS = [0, 1, 2, 3].map((i) => ({ x: 22 + 38 + i * ((SW - 44 - 76) / 3), y: 212 }));

/** Fiche héros : photo immersive, pastilles, Lire / Écouter / Regarder, actions. */
export const HeroScreen: React.FC<{ pulse?: number }> = ({ pulse = 0 }) => (
  <AbsoluteFill style={{ background: C.appBg }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 520 }}>
      <Img src={img("heros/reine-nzinga.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,11,8,0.3) 0%, rgba(15,11,8,0) 25%, rgba(15,11,8,0.6) 70%, #0F0B08 100%)" }} />
    </div>
    <StatusBar />
    <div style={{ position: "absolute", left: 22, right: 22, top: 420 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Pill label="Angola" active />
        <Pill label="XVIIe siècle" />
        <Pill label="Résistance" />
      </div>
      <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 36, color: "#F7E7C8", marginTop: 14 }}>Reine Nzinga</div>
      <div style={{ fontFamily: manrope, fontSize: 15, color: C.textBody, marginTop: 4 }}>Reine du Ndongo et du Matamba</div>
      <GoldButton
        label="Lire le récit"
        style={{ marginTop: 22, transform: `scale(${1 + pulse * 0.06})`, boxShadow: `0 0 ${20 + pulse * 40}px rgba(240,195,107,${0.3 + pulse * 0.5})` }}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        {[
          ["headphones", "Écouter"],
          ["film", "Regarder"],
        ].map(([ic, l]) => (
          <div key={l} style={{ flex: 1, height: 50, borderRadius: 14, border: "1px solid rgba(240,195,107,0.3)", background: C.cardBg, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: manrope, fontWeight: 800, fontSize: 15, color: C.gold }}>
            <Icon name={ic} size={19} /> {l}
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

/** Lecteur audio : pochette, titre, forme d'onde dorée. */
export const PlayerScreen: React.FC<{ beat: number }> = ({ beat }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#3a1d0a 0%,#1a1006 55%,#0c0805 100%)" }}>
    <StatusBar />
    <div style={{ textAlign: "center", fontFamily: manrope, fontWeight: 700, fontSize: 13, color: C.muted, marginTop: 10, letterSpacing: 2 }}>NARRATION · FRANÇAIS</div>
    <div style={{ margin: "26px auto 0", width: 290, height: 290, borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(240,195,107,0.25)" }}>
      <Img src={img("heros/reine-nzinga.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
    </div>
    <div style={{ textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 28, color: "#F7E7C8", marginTop: 26 }}>Reine Nzinga</div>
    <div style={{ textAlign: "center", fontFamily: manrope, fontSize: 14, color: C.textBody, marginTop: 4 }}>Chapitre 1 · La princesse du Ndongo</div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 110, marginTop: 20 }}>
      {Array.from({ length: 34 }).map((_, i) => {
        const base = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + beat * 0.9));
        const kick = Math.exp(-((beat * 15) % 15) / 4) * Math.abs(Math.cos(i * 0.6));
        const h = 12 + 90 * Math.min(1, base * 0.6 + kick * 0.6);
        return <div key={i} style={{ width: 5, height: h, borderRadius: 3, background: i < 14 ? C.gold : "rgba(240,195,107,0.35)" }} />;
      })}
    </div>
    <div style={{ margin: "14px 36px 0", height: 4, borderRadius: 2, background: "rgba(240,195,107,0.2)" }}>
      <div style={{ width: "38%", height: "100%", borderRadius: 2, background: C.gold }} />
    </div>
    <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
      <div style={{ width: 76, height: 76, borderRadius: 38, background: "linear-gradient(135deg,#F0C36B,#C98A3D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="pause" size={32} color="#1a1109" />
      </div>
    </div>
  </AbsoluteFill>
);

export const PLANCHES = [
  "heros/reine-nzinga.jpg",
  "img/histoires.jpg",
  "img/voyage.jpg",
  "img/racines.jpg",
  "img/transmettre.jpg",
  "img/bienvenue.jpg",
  "img/mythe-sao-geants-kotoko.jpg",
  "img/palais-royal-foumban.jpg",
];

/** Regarder : planche du storyboard en cours. */
export const WatchScreen: React.FC<{ planche: number; zoom?: number }> = ({ planche, zoom = 1 }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <StatusBar />
    <div style={{ padding: "6px 22px", fontFamily: cinzel, fontWeight: 700, fontSize: 20, color: "#F7E7C8" }}>Regarder</div>
    <div style={{ padding: "0 22px", fontFamily: manrope, fontSize: 13, color: C.muted }}>Reine Nzinga · Chapitre 1</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, height: 520, overflow: "hidden" }}>
      <Img
        src={img(PLANCHES[planche % PLANCHES.length])}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: "sepia(0.25) contrast(1.05)" }}
      />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(0,0,0,0.8)" }} />
    </div>
    <div style={{ position: "absolute", left: 22, right: 22, top: 692, display: "flex", gap: 5 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= planche ? C.gold : "rgba(240,195,107,0.2)" }} />
      ))}
    </div>
    <div style={{ position: "absolute", left: 22, top: 716, fontFamily: manrope, fontWeight: 700, fontSize: 14, color: C.textBody }}>
      Planche {planche + 1}
    </div>
  </AbsoluteFill>
);

/** Mythologie : liste avec la carte Ngan Medza en tête. */
export const MythScreen: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#0d1420 0%,#0F0B08 60%)" }}>
    <StatusBar />
    <div style={{ padding: "6px 22px", fontFamily: cinzel, fontWeight: 900, fontSize: 28, color: "#F7E7C8" }}>Mythologie</div>
    <div style={{ padding: "0 22px 14px", fontFamily: manrope, fontSize: 14, color: C.muted }}>Les récits fondateurs des peuples</div>
    {["img/mythe-ngan-medza-beti.jpg", "img/mythe-sao-geants-kotoko.jpg", "img/mythe-nchare-yen-bamoun.jpg"].map((p, i) => (
      <div key={p} style={{ margin: "0 22px 14px", height: i === 0 ? 300 : 150, borderRadius: 20, overflow: "hidden", position: "relative" }}>
        <Img src={img(p)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,0.85))" }} />
      </div>
    ))}
  </AbsoluteFill>
);

/** Carte « contenu » autonome (sort du téléphone). */
export const ContentCard: React.FC<{ src: string; title: string; sub?: string; w?: number; h?: number; tag?: string }> = ({
  src,
  title,
  sub,
  w = 620,
  h = 820,
  tag,
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 40,
      overflow: "hidden",
      position: "relative",
      border: `2px solid rgba(240,195,107,0.45)`,
      boxShadow: "0 40px 90px rgba(0,0,0,0.7), 0 0 60px rgba(240,195,107,0.25)",
      background: C.surface,
    }}
  >
    <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(10,8,6,0.95) 90%)" }} />
    {tag ? (
      <div style={{ position: "absolute", left: 30, top: 28, transform: "scale(1.8)", transformOrigin: "left top" }}>
        <Pill label={tag} active />
      </div>
    ) : null}
    <div style={{ position: "absolute", left: 36, right: 36, bottom: 34 }}>
      <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: w * 0.085, color: "#F7E7C8", lineHeight: 1.05 }}>{title}</div>
      {sub ? <div style={{ fontFamily: manrope, fontWeight: 600, fontSize: w * 0.045, color: C.textBody, marginTop: 10, lineHeight: 1.3 }}>{sub}</div> : null}
    </div>
  </div>
);

/** Découverte : carte verte « Explorer le Cameroun », filtres, grille. */
export const DecouverteScreen: React.FC<{ filterShift: number; activeFilter: number }> = ({ filterShift, activeFilter }) => (
  <AbsoluteFill style={{ background: C.appBg }}>
    <StatusBar />
    <div style={{ padding: "6px 22px", fontFamily: cinzel, fontWeight: 900, fontSize: 28, color: "#F7E7C8" }}>Découverte</div>
    <div
      style={{
        margin: "12px 22px 0",
        height: 130,
        borderRadius: 22,
        background: "linear-gradient(135deg,#2f6b45 0%,#1d4a2f 60%,#12301f 100%)",
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", right: -20, top: -20, opacity: 0.25 }}>
        <Icon name="compass" size={170} color="#bfe8c9" />
      </div>
      <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 24, color: "#F4FFF6" }}>Explorer le Cameroun</div>
      <div style={{ fontFamily: manrope, fontSize: 13.5, color: "#cfe9d6", marginTop: 6, width: 230 }}>Villages, coutumes, objets et lieux de mémoire</div>
    </div>
    <div style={{ display: "flex", gap: 8, margin: "16px 0 0 22px", transform: `translateX(${-filterShift}px)` }}>
      {["Tout", "Village", "Coutume", "Objet", "Personnage", "Lieu"].map((f, i) => (
        <Pill key={f} label={f} active={i === activeFilter} />
      ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 22px 0" }}>
      {[
        ["img/palais-royal-foumban.jpg", "Palais royal de Foumban"],
        ["img/nguon.jpg", "Le Nguon"],
        ["img/trone-mandu-yenu.jpg", "Trône Mandu Yenu"],
        ["img/ebolowa.jpg", "Ebolowa"],
      ].map(([p, t]) => (
        <div key={t} style={{ height: 200, borderRadius: 18, overflow: "hidden", position: "relative" }}>
          <Img src={img(p)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,0.85))" }} />
          <div style={{ position: "absolute", left: 12, right: 10, bottom: 10, fontFamily: manrope, fontWeight: 800, fontSize: 13.5, color: C.ivory }}>{t}</div>
        </div>
      ))}
    </div>
    <TabBar active={2} />
  </AbsoluteFill>
);

/** WhatsApp (discussion générique) : message partagé + carte d'aperçu. */
export const WhatsAppScreen: React.FC<{ showMsg: boolean; hidePreview?: boolean }> = ({ showMsg, hidePreview }) => (
  <AbsoluteFill style={{ background: "#0b141a" }}>
    <div style={{ height: 110, background: "#1f2c34", paddingTop: 54, display: "flex", alignItems: "center", gap: 12, paddingLeft: 18 }}>
      <div style={{ width: 40, height: 40, borderRadius: 20, background: "#6b7c85", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="users" size={22} color="#dfe5e7" />
      </div>
      <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 17, color: "#e9edef" }}>Famille</div>
    </div>
    <AbsoluteFill style={{ top: 110, opacity: 0.05 }}>
      <Icon name="compass" size={400} color="#fff" />
    </AbsoluteFill>
    {showMsg ? (
      <div style={{ position: "absolute", right: 14, top: 300, width: 300, borderRadius: 14, background: "#005c4b", padding: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
        <div style={{ borderRadius: 10, overflow: "hidden", background: "#025144", opacity: hidePreview ? 0 : 1 }}>
          <Img src={img("heros/reine-nzinga.jpg")} style={{ width: "100%", height: 150, objectFit: "cover", objectPosition: "center 25%" }} />
          <div style={{ padding: "8px 10px" }}>
            <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 14, color: "#e9edef" }}>Reine Nzinga · AFROBACK</div>
            <div style={{ fontFamily: manrope, fontSize: 12, color: "#aebac1" }}>Lire sur AFROBACK</div>
          </div>
        </div>
        <div style={{ padding: "8px 8px 4px", fontFamily: manrope, fontSize: 15, color: "#e9edef", lineHeight: 1.35 }}>
          Découvre l'histoire de Reine Nzinga sur AFROBACK
        </div>
        <div style={{ textAlign: "right", fontFamily: manrope, fontSize: 11, color: "#aebac1", paddingRight: 6 }}>9:41 ✓✓</div>
      </div>
    ) : null}
  </AbsoluteFill>
);

/** Carte d'aperçu du lien, sortie de l'écran. */
export const PreviewCard: React.FC = () => (
  <div style={{ width: 560, borderRadius: 30, overflow: "hidden", background: "#1f2c34", boxShadow: "0 40px 90px rgba(0,0,0,0.7), 0 0 50px rgba(240,195,107,0.3)" }}>
    <Img src={img("heros/reine-nzinga.jpg")} style={{ width: "100%", height: 330, objectFit: "cover", objectPosition: "center 25%" }} />
    <div style={{ padding: "22px 26px", display: "flex", alignItems: "center", gap: 18 }}>
      <Img src={img("img/icon.png")} style={{ width: 70, height: 70, borderRadius: 35 }} />
      <div>
        <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 30, color: "#e9edef" }}>Reine Nzinga</div>
        <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 24, color: C.gold }}>Lire sur AFROBACK</div>
      </div>
    </div>
  </div>
);

/** Marché : artisanat, espace vendeur, panier. */
const craftTile = (kind: number): React.CSSProperties => {
  if (kind === 0)
    return { background: "repeating-linear-gradient(45deg,#1b2a5c 0 10px,#e8e2d0 10px 13px,#1b2a5c 13px 22px), #1b2a5c" };
  if (kind === 1)
    return { background: "radial-gradient(circle,#e34b3b 0 5px,transparent 6px) 0 0/18px 18px, radial-gradient(circle,#f0c36b 0 5px,transparent 6px) 9px 9px/18px 18px, #2a1a10" };
  if (kind === 2) return { background: "repeating-linear-gradient(95deg,#6b3f1f 0 6px,#8a5530 6px 9px,#5a3318 9px 16px)" };
  return { background: "repeating-linear-gradient(0deg,#c9772b 0 8px,#1a130d 8px 12px,#e8c35a 12px 18px,#1a130d 18px 22px)" };
};
export const MarketScreen: React.FC = () => (
  <AbsoluteFill style={{ background: C.appBg }}>
    <StatusBar />
    <div style={{ padding: "6px 22px", display: "flex", alignItems: "center" }}>
      <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 28, color: "#F7E7C8" }}>Marché</div>
      <div style={{ marginLeft: "auto" }}>
        <Icon name="cart" size={26} />
      </div>
    </div>
    <div style={{ padding: "0 22px", fontFamily: manrope, fontSize: 14, color: C.textBody }}>Artisanat authentique, en direct des artisans</div>
    <div style={{ margin: "14px 22px 0", height: 48, borderRadius: 14, border: `1px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: manrope, fontWeight: 800, fontSize: 15, color: C.gold }}>
      <Icon name="bag" size={19} /> Espace vendeur
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 22px 0" }}>
      {["Textiles", "Perles", "Bois sculpté", "Vannerie"].map((t, i) => (
        <div key={t} style={{ borderRadius: 18, overflow: "hidden", background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ height: 170, ...craftTile(i) }} />
          <div style={{ padding: "10px 12px", fontFamily: manrope, fontWeight: 800, fontSize: 14, color: C.ivory }}>{t}</div>
        </div>
      ))}
    </div>
    <TabBar active={0} />
  </AbsoluteFill>
);
export const CraftTexture: React.FC<{ kind: number; style?: React.CSSProperties }> = ({ kind, style }) => (
  <div style={{ ...craftTile(kind), ...style }} />
);

/** Carte de forfait (sort de l'écran Abonnements). */
export const PlanCard: React.FC<{ name: string; price: string; desc: string; highlight?: boolean; pressed?: boolean }> = ({
  name,
  price,
  desc,
  highlight,
  pressed,
}) => (
  <div
    style={{
      width: 780,
      borderRadius: 36,
      padding: "34px 40px",
      background: highlight ? "linear-gradient(160deg,#3a2410 0%,#1A130D 70%)" : C.surface,
      border: `3px solid ${highlight ? C.gold : "rgba(240,195,107,0.3)"}`,
      boxShadow: highlight ? "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(240,195,107,0.35)" : "0 30px 80px rgba(0,0,0,0.6)",
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 64, color: highlight ? C.gold : "#F7E7C8" }}>{name}</div>
      <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 40, color: C.ivory }}>{price}</div>
    </div>
    <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 28, color: C.textBody, marginTop: 12, lineHeight: 1.35 }}>{desc}</div>
    {highlight ? (
      <GoldButton label={`Choisir ${name}`} pressed={pressed} style={{ marginTop: 24, height: 90, fontSize: 32, borderRadius: 24 }} />
    ) : null}
  </div>
);

/** Confirmation : « Bienvenue dans Racines ! ». */
export const SuccessScreen: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%,#3a2410 0%,#0F0B08 65%)", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div style={{ width: 150, height: 150, borderRadius: 75, background: "linear-gradient(135deg,#F7D98B,#C98A3D)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(240,195,107,0.6)" }}>
      <Icon name="check" size={84} color="#1a1109" />
    </div>
    <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 30, color: "#F7E7C8", marginTop: 30, textAlign: "center", padding: "0 30px" }}>Bienvenue dans Racines !</div>
    <div style={{ fontFamily: manrope, fontSize: 15, color: C.textBody, marginTop: 10, textAlign: "center", padding: "0 40px" }}>
      Tous les héros, mythes et lieux · narrations et vidéos
    </div>
  </AbsoluteFill>
);
export const SUCCESS_CHECK = { x: 195, y: 350 };
