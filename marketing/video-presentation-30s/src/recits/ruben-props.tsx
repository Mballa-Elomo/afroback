/**
 * Accessoires dessinés de la vidéo « Le nom interdit » (Ruben Um Nyobè) :
 * textures (papier, bois, béton), barre de censure, tampon encré, registre du greffe,
 * feuillets ronéotypés, carte UPC, micro de tribune, machine à écrire, forêt bassa en couches.
 */
import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, W, H, cinzel, manrope, ramp } from "../theme";
import { loadFont as loadElite } from "@remotion/google-fonts/SpecialElite";

export const typeFont = loadElite("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const RU = {
  black: "#0B0806",
  ink: "#1B1510",
  paper: "#EADFC8",
  terra: "#B8432A",
  terraLight: "#E3A277",
  violet: "#3B2F6B",
  forest: "#0E1A12",
};

/* ---------- Textures ---------- */

/** Bruit fractal coloré : alpha = k * bruit + b (rgb entre 0 et 1). */
export const Turb: React.FC<{ id: string; w?: number | string; h?: number | string; freq: string; oct?: number; seed?: number; rgb: [number, number, number]; k: number; b: number; style?: React.CSSProperties }> = ({ id, w = "100%", h = "100%", freq, oct = 3, seed = 1, rgb, k, b, style }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", ...style }}>
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={oct} seed={seed} />
      <feColorMatrix type="matrix" values={`0 0 0 0 ${rgb[0]} 0 0 0 0 ${rgb[1]} 0 0 0 0 ${rgb[2]} ${k} 0 0 0 ${b}`} />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);

/** Bureau en bois sombre éclairé par une lampe (haut gauche). */
export const Desk: React.FC<{ id: string; width?: number; lamp?: [number, number] }> = ({ id, width = W, lamp = [30, 22] }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width, height: H, background: "linear-gradient(180deg,#2c1b10 0%,#1d120a 55%,#120a05 100%)", overflow: "hidden" }}>
    <Turb id={`${id}-g1`} freq="0.0025 0.07" oct={3} seed={4} rgb={[0.06, 0.03, 0.01]} k={1.1} b={-0.3} />
    <Turb id={`${id}-g2`} freq="0.012 0.35" oct={2} seed={9} rgb={[0.62, 0.38, 0.18]} k={0.45} b={-0.2} />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${lamp[0]}% ${lamp[1]}%, rgba(255,196,120,0.38) 0%, rgba(255,170,90,0.12) 35%, rgba(0,0,0,0) 62%)`, mixBlendMode: "screen" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.7) 100%)" }} />
  </div>
);

/** Feuille de papier vieilli (fibres, taches, bords plus sombres, ombre portée). */
export const Paper: React.FC<{ id: string; w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties; tone?: string }> = ({ id, w, h, children, style, tone = "#F2E8D2" }) => (
  <div style={{ position: "absolute", width: w, height: h, background: `radial-gradient(ellipse at 38% 30%, ${tone} 0%, #E4D4B3 58%, #C8B087 100%)`, boxShadow: "0 40px 70px rgba(0,0,0,0.65), 0 8px 18px rgba(0,0,0,0.5)", overflow: "hidden", ...style }}>
    <Turb id={`${id}-f`} freq="0.55 0.025" oct={2} seed={3} rgb={[0.35, 0.25, 0.12]} k={0.4} b={-0.14} />
    <Turb id={`${id}-b`} freq="0.011" oct={4} seed={7} rgb={[0.45, 0.3, 0.12]} k={0.55} b={-0.26} />
    <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 90px rgba(120,80,30,0.38)" }} />
    {children}
  </div>
);

/* ---------- Barre de censure ---------- */

const raggedPath = (w: number, h: number, seed: string) => {
  let d = `M 0 ${4 + random(seed + "a") * 8}`;
  for (let x = 24; x <= w; x += 24) d += ` L ${x} ${random(seed + x) * 10}`;
  d += ` Q ${w + 14} ${h / 2} ${w} ${h - random(seed + "z") * 8}`;
  for (let x = w - 24; x >= 0; x -= 24) d += ` L ${x} ${h - random(seed + "b" + x) * 10}`;
  d += ` Q -12 ${h / 2} 0 ${4} Z`;
  return d;
};

export const RedactBar: React.FC<{ w: number; h: number; seed: string }> = ({ w, h, seed }) => (
  <svg width={w + 20} height={h} style={{ position: "absolute", left: -10, top: 0, overflow: "visible" }}>
    <defs>
      <linearGradient id={`rb-${seed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b1714" />
        <stop offset="0.45" stopColor="#0a0807" />
        <stop offset="1" stopColor="#050403" />
      </linearGradient>
    </defs>
    <path d={raggedPath(w, h, seed)} fill={`url(#rb-${seed})`} transform="translate(10 0)" />
    <path d={`M 24 ${h * 0.28} L ${w - 10} ${h * 0.24}`} stroke="rgba(255,255,255,0.07)" strokeWidth={10} strokeLinecap="round" transform="translate(10 0)" />
  </svg>
);

/* ---------- Tampon encré (bords irréguliers, encre manquante) ---------- */

export const InkStamp: React.FC<{ id: string; w: number; h: number; lines: { text: string; size: number }[]; color?: string; rot?: number }> = ({ id, w, h, lines, color = RU.terra, rot = -8 }) => {
  const total = lines.reduce((a, l) => a + l.size * 1.1, 0);
  let y = h / 2 - total / 2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", overflow: "visible", transform: `rotate(${rot}deg)` }}>
      <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves={3} seed={5} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={7} result="d" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 0 0 0 2.35" result="m" />
        <feComposite in="d" in2="m" operator="in" />
      </filter>
      <g filter={`url(#${id})`} fill={color} stroke={color}>
        <rect x={8} y={8} width={w - 16} height={h - 16} rx={10} fill="none" strokeWidth={9} />
        <rect x={24} y={24} width={w - 48} height={h - 48} rx={6} fill="none" strokeWidth={3} />
        {lines.map((l, i) => {
          y += l.size * 1.1;
          return (
            <text key={i} x={w / 2} y={y - l.size * 0.2} textAnchor="middle" fontFamily={cinzel} fontWeight={900} fontSize={l.size} letterSpacing={l.size * 0.08} stroke="none">
              {l.text}
            </text>
          );
        })}
      </g>
    </svg>
  );
};

/* ---------- Registre du greffe ---------- */

const scribble = (x0: number, y: number, len: number, seed: string) => {
  let d = `M ${x0} ${y}`;
  for (let x = x0; x < x0 + len; x += 9) {
    const r = random(seed + x);
    d += ` q 4 ${-6 - r * 7} 9 ${r > 0.8 ? -2 : 0}`;
  }
  return d;
};

export const Ledger: React.FC<{ write: number }> = ({ write }) => {
  const frame = useCurrentFrame();
  const rows = 13;
  const PW = 400;
  const PH = 560;
  const curRow = Math.min(rows - 1, Math.floor(write * 9));
  const rowProg = (write * 9) % 1;
  const penX = 470 + 40 + rowProg * 300;
  const penY = 40 + 70 + curRow * 36;
  return (
    <div style={{ position: "relative", width: 900, height: 640, transform: "perspective(1500px) rotateX(24deg)", transformOrigin: "50% 60%" }}>
      <div style={{ position: "absolute", left: 40, top: 70, width: 860, height: 620, borderRadius: 60, background: "rgba(0,0,0,0.7)", filter: "blur(36px)" }} />
      {/* couverture de cuir */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(135deg,#4a3322 0%,#2c1d12 55%,#1b110a 100%)", overflow: "hidden", boxShadow: "inset 0 0 0 3px rgba(0,0,0,0.5)" }}>
        <Turb id="lg-leather" freq="0.18" oct={3} seed={2} rgb={[0, 0, 0]} k={0.7} b={-0.25} />
        <div style={{ position: "absolute", inset: 12, border: "3px solid rgba(240,195,107,0.55)", borderRadius: 10 }} />
      </div>
      {/* tranche des pages */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: 30 - i * 2, top: 34 + i * 3, width: 840 + i * 4, height: 580, borderRadius: 6, background: i % 2 ? "#d8c7a4" : "#efe3c8", boxShadow: "0 1px 0 rgba(0,0,0,0.25)" }} />
      ))}
      {/* deux pages */}
      {[0, 1].map((p) => (
        <div key={p} style={{ position: "absolute", left: 50 + p * PW, top: 40, width: PW, height: PH, overflow: "hidden", background: p === 0 ? "linear-gradient(90deg,#efe5cd 0%,#ebdfc3 80%,#b9a37c 100%)" : "linear-gradient(90deg,#a99370 0%,#e9ddc1 18%,#f1e7d0 100%)" }}>
          <Turb id={`lg-p${p}`} freq="0.012" oct={4} seed={11 + p} rgb={[0.45, 0.32, 0.15]} k={0.5} b={-0.26} />
          <svg width={PW} height={PH} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: rows + 1 }).map((_, r) => (
              <line key={r} x1={0} x2={PW} y1={62 + r * 36} y2={62 + r * 36} stroke="rgba(70,100,150,0.38)" strokeWidth={1.6} />
            ))}
            <line x1={p === 0 ? 70 : 40} x2={p === 0 ? 70 : 40} y1={0} y2={PH} stroke="rgba(180,50,40,0.5)" strokeWidth={2} />
            <line x1={300} x2={300} y1={30} y2={PH} stroke="rgba(70,100,150,0.3)" strokeWidth={1.4} />
            <rect x={p === 0 ? 70 : 40} y={22} width={240} height={10} rx={3} fill="rgba(40,30,22,0.55)" />
            {Array.from({ length: rows }).map((_, r) => {
              if (p === 1 && r > curRow) return null;
              const len = 120 + random(`len${p}${r}`) * 140;
              const x0 = p === 0 ? 82 : 52;
              const live = p === 1 && r === curRow;
              return (
                <g key={r}>
                  <path d={scribble(x0, 56 + r * 36, len, `s${p}${r}`)} fill="none" stroke="#2a2018" strokeWidth={2.4} strokeLinecap="round" opacity={0.8} pathLength={1} strokeDasharray={1} strokeDashoffset={live ? 1 - rowProg : 0} />
                  <path d={scribble(312, 56 + r * 36, 50 + random(`n${p}${r}`) * 30, `t${p}${r}`)} fill="none" stroke="#2a2018" strokeWidth={2.2} opacity={live ? 0 : 0.7} />
                </g>
              );
            })}
          </svg>
        </div>
      ))}
      {/* ombre de la reliure */}
      <div style={{ position: "absolute", left: 420, top: 40, width: 60, height: PH, background: "linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(60,40,20,0.45) 50%,rgba(0,0,0,0) 100%)" }} />
      {/* signet */}
      <div style={{ position: "absolute", left: 444, top: 560, width: 20, height: 150, background: "linear-gradient(90deg,#8e2f1e,#c2583a,#7a2616)", clipPath: "polygon(0 0,100% 0,100% 100%,50% 86%,0 100%)" }} />
      {/* encrier */}
      <svg width={150} height={170} style={{ position: "absolute", left: 790, top: -90, overflow: "visible" }}>
        <ellipse cx={75} cy={160} rx={70} ry={14} fill="rgba(0,0,0,0.55)" />
        <path d="M 15 60 L 135 60 L 140 150 Q 75 166 10 150 Z" fill="rgba(30,40,55,0.88)" stroke="rgba(220,230,240,0.45)" strokeWidth={3} />
        <path d="M 22 100 L 128 100 L 132 148 Q 75 160 18 148 Z" fill="#06070c" />
        <rect x={48} y={28} width={54} height={34} rx={6} fill="#151515" stroke="rgba(240,195,107,0.6)" strokeWidth={3} />
        <path d="M 30 70 L 34 140" stroke="rgba(255,255,255,0.55)" strokeWidth={6} strokeLinecap="round" />
      </svg>
      {/* porte-plume */}
      <svg width={420} height={300} style={{ position: "absolute", left: penX - 6, top: penY - 288 + Math.sin(frame * 0.9) * 3, overflow: "visible" }}>
        <defs>
          <linearGradient id="penwood" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3a1f10" />
            <stop offset="0.45" stopColor="#8a5530" />
            <stop offset="1" stopColor="#2a160a" />
          </linearGradient>
          <linearGradient id="nib" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6d6d6d" />
            <stop offset="0.5" stopColor="#f0f0f0" />
            <stop offset="1" stopColor="#555" />
          </linearGradient>
        </defs>
        <g transform="translate(6 288) rotate(-38)">
          <path d="M 0 0 L 40 -9 L 60 -8 L 60 8 L 40 9 Z" fill="url(#nib)" />
          <line x1={4} y1={0} x2={44} y2={0} stroke="#333" strokeWidth={1.5} />
          <rect x={58} y={-12} width={34} height={24} rx={4} fill="#b8862f" stroke="#6b4a14" strokeWidth={2} />
          <path d="M 90 -11 L 380 -16 Q 396 0 380 16 L 90 11 Z" fill="url(#penwood)" />
          <path d="M 96 -6 L 370 -9" stroke="rgba(255,220,170,0.4)" strokeWidth={3} />
        </g>
      </svg>
    </div>
  );
};

/* ---------- Feuillets ronéotypés du syndicat ---------- */

export const UnionSheets: React.FC = () => (
  <div style={{ position: "relative", width: 720, height: 900 }}>
    {[-7, 4, -2].map((r, i) => (
      <Paper key={i} id={`us${i}`} w={700} h={880} tone="#EFE6D3" style={{ left: 10 + i * 6, top: 10 - i * 4, transform: `rotate(${r}deg)`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }} />
    ))}
    <Paper id="us-top" w={700} h={880} tone="#F4ECDA" style={{ left: 10, top: 0, transform: "rotate(1deg)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: typeFont, fontSize: 150, color: RU.violet, opacity: 0.88, letterSpacing: 14, filter: "blur(0.6px)" }}>USCC</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 250, textAlign: "center", fontFamily: typeFont, fontSize: 38, lineHeight: 1.25, color: RU.violet, opacity: 0.85, filter: "blur(0.4px)" }}>
        Union des syndicats
        <br />
        confédérés du Cameroun
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 370, height: 4, background: RU.violet, opacity: 0.55 }} />
      <svg width={700} height={500} style={{ position: "absolute", left: 0, top: 400 }}>
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={i} x={70} y={20 + i * 38} width={300 + random(`ul${i}`) * 260} height={13} rx={4} fill={RU.violet} opacity={0.22 + random(`uo${i}`) * 0.12} />
        ))}
      </svg>
      {/* cachet rond */}
      <svg width={200} height={200} style={{ position: "absolute", left: 460, top: 640, transform: "rotate(-14deg)", opacity: 0.75 }}>
        <circle cx={100} cy={100} r={86} fill="none" stroke={RU.violet} strokeWidth={7} />
        <circle cx={100} cy={100} r={68} fill="none" stroke={RU.violet} strokeWidth={3} />
        <text x={100} y={114} textAnchor="middle" fontFamily={typeFont} fontSize={44} fill={RU.violet}>USCC</text>
      </svg>
    </Paper>
    {/* trombone */}
    <svg width={90} height={200} style={{ position: "absolute", left: 90, top: -50, overflow: "visible", filter: "drop-shadow(3px 6px 4px rgba(0,0,0,0.55))" }}>
      <defs>
        <linearGradient id="clip" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d7d7d" />
          <stop offset="0.5" stopColor="#f5f5f5" />
          <stop offset="1" stopColor="#8a8a8a" />
        </linearGradient>
      </defs>
      <path d="M 30 150 L 30 30 Q 30 8 48 8 Q 66 8 66 30 L 66 170 Q 66 192 44 192 Q 22 192 22 170 L 22 60 Q 22 46 34 46 Q 46 46 46 60 L 46 150" fill="none" stroke="url(#clip)" strokeWidth={7} strokeLinecap="round" />
    </svg>
  </div>
);

/* ---------- Carte UPC (en relief doré) ---------- */

export const UpcCard: React.FC<{ shine: number; dim?: number }> = ({ shine, dim = 0 }) => (
  <Paper id="upc" w={800} h={560} tone="#F3EAD6" style={{ left: 0, top: 0, borderRadius: 8 }}>
    <div style={{ position: "absolute", inset: 26, border: "3px solid rgba(160,110,40,0.65)", borderRadius: 4 }} />
    <div style={{ position: "absolute", inset: 38, border: "1.5px solid rgba(160,110,40,0.5)", borderRadius: 2 }} />
    <svg width={800} height={330} style={{ position: "absolute", left: 0, top: 40, opacity: 1 - dim, overflow: "visible" }}>
      <defs>
        <linearGradient id="upcGold" x1="0" y1="0" x2="1" y2="0.25">
          <stop offset="0" stopColor="#8a5a1c" />
          <stop offset={Math.min(1, Math.max(0, (shine - 20) / 100))} stopColor="#c98a3d" />
          <stop offset={Math.min(1, Math.max(0, shine / 100))} stopColor="#fff1c4" />
          <stop offset={Math.min(1, Math.max(0, (shine + 20) / 100))} stopColor="#c98a3d" />
          <stop offset="1" stopColor="#7a4e16" />
        </linearGradient>
      </defs>
      <text x={400} y={262} textAnchor="middle" fontFamily={cinzel} fontWeight={900} fontSize={240} letterSpacing={18} fill="rgba(255,250,235,0.85)" transform="translate(-2 -2)">UPC</text>
      <text x={400} y={262} textAnchor="middle" fontFamily={cinzel} fontWeight={900} fontSize={240} letterSpacing={18} fill="rgba(90,55,15,0.6)" transform="translate(3 4)">UPC</text>
      <text x={400} y={262} textAnchor="middle" fontFamily={cinzel} fontWeight={900} fontSize={240} letterSpacing={18} fill="url(#upcGold)">UPC</text>
    </svg>
    <div style={{ position: "absolute", left: 90, right: 90, top: 345, height: 3, background: "linear-gradient(90deg,rgba(201,138,61,0),#c98a3d,rgba(201,138,61,0))" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 372, textAlign: "center", fontFamily: cinzel, fontWeight: 700, fontSize: 31, letterSpacing: 3, color: "#3a2a18" }}>
      UNION DES POPULATIONS
      <br />
      DU CAMEROUN
    </div>
  </Paper>
);

/* ---------- Micro de tribune des années 1950 ---------- */

export const Microphone: React.FC = () => (
  <svg width={520} height={1000} viewBox="-260 -460 520 1000" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#1e1e1e" />
        <stop offset="0.18" stopColor="#8d8d8d" />
        <stop offset="0.32" stopColor="#f4f4f4" />
        <stop offset="0.5" stopColor="#5c5c5c" />
        <stop offset="0.7" stopColor="#d9d9d9" />
        <stop offset="1" stopColor="#262626" />
      </linearGradient>
      <linearGradient id="chromeWarm" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3a2a14" />
        <stop offset="0.25" stopColor="#f7d98b" />
        <stop offset="0.45" stopColor="#6b5a40" />
        <stop offset="0.75" stopColor="#c9c0b0" />
        <stop offset="1" stopColor="#1e1a14" />
      </linearGradient>
      <clipPath id="capsule">
        <rect x={-130} y={-420} width={260} height={440} rx={130} />
      </clipPath>
    </defs>
    {/* pied */}
    <rect x={-14} y={20} width={28} height={420} fill="url(#chrome)" />
    <rect x={-22} y={210} width={44} height={36} rx={6} fill="url(#chrome)" />
    <ellipse cx={0} cy={450} rx={150} ry={34} fill="url(#chrome)" />
    <ellipse cx={0} cy={440} rx={150} ry={30} fill="url(#chromeWarm)" opacity={0.6} />
    {/* étrier */}
    <path d="M -160 -200 L -160 0 Q -160 40 -100 40 L 100 40 Q 160 40 160 0 L 160 -200" fill="none" stroke="url(#chrome)" strokeWidth={22} />
    <circle cx={-160} cy={-200} r={22} fill="url(#chrome)" />
    <circle cx={160} cy={-200} r={22} fill="url(#chrome)" />
    {/* capsule */}
    <rect x={-130} y={-420} width={260} height={440} rx={130} fill="url(#chromeWarm)" />
    <g clipPath="url(#capsule)">
      {Array.from({ length: 50 }).map((_, i) => (
        <line key={i} x1={-140} x2={140} y1={-418 + i * 9} y2={-418 + i * 9} stroke={i % 2 ? "rgba(0,0,0,0.55)" : "rgba(255,240,210,0.18)"} strokeWidth={4} />
      ))}
      <rect x={-140} y={-215} width={280} height={46} fill="url(#chrome)" />
      <rect x={-140} y={-213} width={280} height={4} fill="rgba(255,255,255,0.5)" />
      <rect x={-78} y={-420} width={30} height={440} fill="rgba(255,250,235,0.35)" style={{ filter: "blur(6px)" }} />
      <rect x={70} y={-420} width={60} height={440} fill="rgba(0,0,0,0.45)" />
    </g>
    <rect x={-130} y={-420} width={260} height={440} rx={130} fill="none" stroke="rgba(255,235,190,0.55)" strokeWidth={4} />
  </svg>
);

/* ---------- Forêt bassa en couches ---------- */

const leafD = (len: number, wid: number) => `M 0 0 C ${len * 0.25} ${-wid} ${len * 0.72} ${-wid * 0.75} ${len} 0 C ${len * 0.72} ${wid * 0.75} ${len * 0.25} ${wid} 0 0 Z`;

const Leaf: React.FC<{ x: number; y: number; len: number; wid: number; rot: number; fill: string; rim: number }> = ({ x, y, len, wid, rot, fill, rim }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={leafD(len, wid)} fill={fill} stroke={`rgba(240,195,107,${rim})`} strokeWidth={2.5} />
    <path d={`M 0 0 Q ${len * 0.5} ${-wid * 0.08} ${len} 0`} stroke="rgba(0,0,0,0.5)" strokeWidth={3} fill="none" />
    {[1, 2, 3, 4, 5, 6].map((i) => {
      const px = (len * i) / 7.3;
      const k = Math.sin((Math.PI * i) / 7.3) * 0.72;
      return (
        <g key={i} stroke={`rgba(240,195,107,${rim * 0.35})`} strokeWidth={1.4}>
          <line x1={px} y1={0} x2={px + len * 0.09} y2={-wid * k} />
          <line x1={px} y1={0} x2={px + len * 0.09} y2={wid * k} />
        </g>
      );
    })}
  </g>
);

const Fern: React.FC<{ x: number; y: number; len: number; rot: number; sway: number }> = ({ x, y, len, rot, sway }) => {
  const P1 = [len * 0.5, -len * 0.22];
  const P2 = [len, len * 0.05];
  const pt = (t: number) => [2 * (1 - t) * t * P1[0] + t * t * P2[0], 2 * (1 - t) * t * P1[1] + t * t * P2[1]];
  const n = 16;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + sway})`}>
      <path d={`M 0 0 Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} stroke="#0f1d0b" strokeWidth={6} fill="none" />
      {Array.from({ length: n }).map((_, i) => {
        const t = 0.08 + (i / n) * 0.9;
        const [px, py] = pt(t);
        const [qx, qy] = pt(t + 0.01);
        const ang = (Math.atan2(qy - py, qx - px) * 180) / Math.PI;
        const sz = (1 - t) * 90 + 18;
        return (
          <g key={i}>
            <g transform={`translate(${px} ${py}) rotate(${ang - 62})`}>
              <path d={leafD(sz, sz * 0.22)} fill="#183013" stroke="rgba(240,195,107,0.22)" strokeWidth={1.5} />
            </g>
            <g transform={`translate(${px} ${py}) rotate(${ang + 62})`}>
              <path d={leafD(sz, sz * 0.22)} fill="#132810" stroke="rgba(240,195,107,0.15)" strokeWidth={1.5} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

const trunkD = (x: number, w: number, top: number, base: number) =>
  `M ${x - w / 2} ${top} C ${x - w / 2 - 6} ${(top + base) / 2} ${x - w / 2} ${base - 220} ${x - w * 1.7} ${base} L ${x + w * 1.7} ${base} C ${x + w / 2} ${base - 220} ${x + w / 2 + 6} ${(top + base) / 2} ${x + w / 2} ${top} Z`;

const layer = (s: number) => `translate(540 900) scale(${s}) translate(-540 -900)`;

/** t : secondes depuis l'entrée dans la forêt ; light : 1 = rais dorés, 0 = éteints ; still : feuillage figé. */
export const Forest: React.FC<{ t: number; light?: number; still?: boolean }> = ({ t, light = 1, still = false }) => {
  const dolly = t <= 4 ? t : 4 + (t - 4) * 0.3;
  const sw = (i: number, a = 2) => (still ? 0 : Math.sin(t * 1.6 + i * 1.7) * a);
  const farTrunks = Array.from({ length: 10 }).map((_, i) => ({ x: 40 + i * 112 + random(`ft${i}`) * 60, w: 24 + random(`fw${i}`) * 26 }));
  const midTrunks = [
    { x: 120, w: 95 },
    { x: 410, w: 64 },
    { x: 760, w: 80 },
    { x: 990, w: 120 },
  ];
  const rays = [
    { xt: 300, wt: 70, xb: 200, wb: 330 },
    { xt: 560, wt: 120, xb: 520, wb: 520 },
    { xt: 760, wt: 60, xb: 840, wb: 300 },
    { xt: 430, wt: 40, xb: 360, wb: 220 },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#2f3f1e 0%,#18250f 32%,#0c150a 68%,#060a05 100%)", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 700px 600px at 560px 260px, rgba(255,214,140,${0.5 * light}) 0%, rgba(255,190,100,${0.15 * light}) 45%, rgba(0,0,0,0) 75%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="trFar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4a5e3a" />
            <stop offset="0.5" stopColor="#2a3a22" />
            <stop offset="1" stopColor="#1b2716" />
          </linearGradient>
          <linearGradient id="trMid" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3b3220" />
            <stop offset="0.25" stopColor="#1d1a10" />
            <stop offset="1" stopColor="#0a0b06" />
          </linearGradient>
          <linearGradient id="leafG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2f5223" />
            <stop offset="1" stopColor="#0b1909" />
          </linearGradient>
          <linearGradient id="leafD" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#14260f" />
            <stop offset="1" stopColor="#050b04" />
          </linearGradient>
          <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,222,150,0.55)" />
            <stop offset="1" stopColor="rgba(255,222,150,0)" />
          </linearGradient>
          <filter id="dof">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id="rayBlur">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        {/* couche lointaine */}
        <g transform={layer(1 + dolly * 0.03)} opacity={0.85}>
          {farTrunks.map((tr, i) => (
            <path key={i} d={trunkD(tr.x, tr.w, -100, 1330 + random(`fb${i}`) * 80)} fill="url(#trFar)" opacity={0.55} />
          ))}
        </g>
        {/* rais de lumière */}
        <g filter="url(#rayBlur)" style={{ mixBlendMode: "screen" }} opacity={light}>
          {rays.map((r, i) => (
            <polygon key={i} points={`${r.xt - r.wt / 2},-50 ${r.xt + r.wt / 2},-50 ${r.xb + r.wb / 2},1750 ${r.xb - r.wb / 2},1750`} fill="url(#ray)" opacity={0.55 + 0.25 * Math.sin(t * 1.3 + i * 2)} />
          ))}
        </g>
        {/* couche médiane : troncs, contreforts, lianes */}
        <g transform={layer(1 + dolly * 0.07)}>
          {midTrunks.map((tr, i) => (
            <g key={i}>
              <path d={trunkD(tr.x, tr.w, -200, 1520)} fill="url(#trMid)" />
              <path d={`M ${tr.x - tr.w / 2 + 6} -200 C ${tr.x - tr.w / 2} 600 ${tr.x - tr.w / 2 + 4} 1200 ${tr.x - tr.w * 1.4} 1510`} stroke={`rgba(240,195,107,${0.28 * light + 0.05})`} strokeWidth={5} fill="none" />
            </g>
          ))}
          {[
            [120, 300, 410, 520, 260],
            [410, 180, 760, 380, 340],
            [760, 260, 990, 640, 300],
            [200, 600, 300, 1100, 180],
          ].map(([x1, y1, x2, y2, sag], i) => (
            <path key={i} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + sw(i, 6)} ${Math.max(y1, y2) + sag} ${x2} ${y2}`} stroke="#121a0c" strokeWidth={9} fill="none" />
          ))}
        </g>
        {/* canopée haute */}
        <g transform={layer(1 + dolly * 0.09)}>
          {Array.from({ length: 34 }).map((_, i) => (
            <Leaf key={i} x={-60 + random(`cx${i}`) * 1200} y={-40 + random(`cy${i}`) * 330} len={180 + random(`cl${i}`) * 200} wid={50 + random(`cw${i}`) * 50} rot={random(`cr${i}`) * 360 + sw(i, 3)} fill="url(#leafD)" rim={0.25 * light} />
          ))}
        </g>
        {/* premier plan : grandes feuilles et fougères */}
        <g transform={layer(1 + dolly * 0.16)} filter="url(#dof)">
          {[
            [-40, 1500, 520, 150, -38],
            [-60, 1180, 440, 120, -10],
            [1120, 1450, 520, 150, 212],
            [1130, 1080, 420, 110, 188],
            [-30, 520, 380, 100, 18],
            [1110, 640, 400, 105, 165],
          ].map(([x, y, len, wid, rot], i) => (
            <Leaf key={i} x={x} y={y} len={len} wid={wid} rot={rot + sw(i + 10, 2.5)} fill="url(#leafG)" rim={0.45 * light + 0.08} />
          ))}
          {[
            [-20, 1900, 620, -55],
            [160, 1960, 560, -75],
            [1100, 1900, 620, 235],
            [900, 1980, 540, 255],
            [520, 2000, 520, -95],
          ].map(([x, y, len, rot], i) => (
            <Fern key={i} x={x} y={y} len={len} rot={rot} sway={sw(i + 20, 2)} />
          ))}
        </g>
      </svg>
      {/* spores dans la lumière */}
      {Array.from({ length: 36 }).map((_, i) => {
        const x = random(`sp${i}`) * W + Math.sin(t * 0.8 + i) * 20;
        const y = ((random(`sq${i}`) * H - t * (12 + random(`sv${i}`) * 18) * (still ? 0.2 : 1)) % H + H) % H;
        const sz = 3 + random(`ss${i}`) * 5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: sz, background: "#FFE2A0", opacity: (0.35 + 0.4 * random(`so${i}`)) * (0.25 + 0.75 * light), boxShadow: "0 0 8px rgba(255,200,110,0.8)" }} />;
      })}
    </AbsoluteFill>
  );
};

/** Formulaire vierge du maquis (en-tête seul, champs pointillés). */
export const FormDoc: React.FC<{ id: string; title: string[] }> = ({ id, title }) => (
  <Paper id={id} w={330} h={430} tone="#EFE5CE">
    <div style={{ position: "absolute", left: 0, right: 0, top: 34, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 33, lineHeight: 1.1, color: RU.ink }}>
      {title.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 50, right: 50, top: 140, height: 3, background: RU.ink, opacity: 0.6 }} />
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 182 + i * 40, borderBottom: "3px dotted rgba(40,30,20,0.45)" }} />
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, top: 210, height: 2, background: "linear-gradient(90deg,rgba(0,0,0,0),rgba(90,60,30,0.35),rgba(0,0,0,0))" }} />
    <div style={{ position: "absolute", right: 0, top: 0, width: 36, height: 36, background: "linear-gradient(225deg, #2b1d10 50%, #d6c3a0 50%)", boxShadow: "-3px 3px 6px rgba(0,0,0,0.3)" }} />
  </Paper>
);

/* ---------- Béton ---------- */

export const Concrete: React.FC<{ id: string }> = ({ id }) => (
  <AbsoluteFill style={{ background: "linear-gradient(125deg,#8f8a82 0%,#77726b 45%,#5c5751 100%)", overflow: "hidden" }}>
    <Turb id={`${id}-bl`} freq="0.012" oct={4} seed={21} rgb={[0.2, 0.19, 0.18]} k={2.4} b={-1.05} />
    <Turb id={`${id}-wl`} freq="0.03" oct={3} seed={31} rgb={[0.8, 0.78, 0.74]} k={1.4} b={-0.72} />
    <Turb id={`${id}-dk`} freq="0.7" oct={2} seed={22} rgb={[0.12, 0.11, 0.1]} k={3.2} b={-1.62} />
    <Turb id={`${id}-lt`} freq="0.5" oct={2} seed={23} rgb={[0.85, 0.83, 0.8]} k={2.6} b={-1.48} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 80 }).map((_, i) => {
        const x = random(`px${i}`) * W;
        const y = random(`py${i}`) * H;
        const r = 2 + random(`pr${i}`) * 7;
        return (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.8} fill="rgba(25,23,21,0.75)" />
            <ellipse cx={x + 1} cy={y + r * 0.6} rx={r * 0.9} ry={r * 0.3} fill="rgba(200,195,188,0.35)" />
          </g>
        );
      })}
      {[340, 700, 1060, 1420, 1780].map((y, i) => (
        <g key={y}>
          <line x1={0} x2={W} y1={y} y2={y + (i % 2 ? 4 : -3)} stroke="rgba(30,28,25,0.55)" strokeWidth={4} />
          <line x1={0} x2={W} y1={y + 5} y2={y + 5 + (i % 2 ? 4 : -3)} stroke="rgba(220,215,205,0.25)" strokeWidth={2} />
        </g>
      ))}
    </svg>
    <AbsoluteFill style={{ background: "linear-gradient(110deg, rgba(255,240,220,0.12) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)" }} />
  </AbsoluteFill>
);

/* ---------- Anneaux dorés du portrait (coordonnées de l'image 1024 × 1024) ---------- */

export const Rings: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.6 }) => (
  <svg viewBox="0 0 1024 1024" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "screen", opacity }}>
    {[
      { r: 335, dash: "4 18", sp: 0.35, w: 3 },
      { r: 420, dash: "120 40 10 40", sp: -0.22, w: 2.5 },
      { r: 478, dash: "2 10", sp: 0.15, w: 4 },
    ].map((g, i) => (
      <circle key={i} cx={512} cy={468} r={g.r} fill="none" stroke={C.goldPale} strokeWidth={g.w} strokeDasharray={g.dash} transform={`rotate(${frame * g.sp} 512 468)`} style={{ filter: "drop-shadow(0 0 6px rgba(240,195,107,0.9))" }} />
    ))}
  </svg>
);

/** Petit texte de mention, toujours sur pastille sombre. */
export const Mention: React.FC<{ text: string; y: number; opacity?: number }> = ({ text, y, opacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity }}>
    <div style={{ background: "rgba(8,6,4,0.62)", borderRadius: 30, padding: "8px 26px", fontFamily: manrope, fontWeight: 700, fontSize: 30, color: "rgba(255,244,224,0.85)" }}>{text}</div>
  </div>
);

export const fadeIn = (frame: number, at: number, d = 8) => ramp(frame, at, d, 0, 1);
