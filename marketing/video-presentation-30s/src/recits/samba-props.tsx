/**
 * Accessoires dessinés de la vidéo « Changer de camp » (Martin Paul Samba) :
 * couture de lumière froid / chaud, plaques typographiques qui pivotent, bouton de tunique,
 * silhouettes pleines (cadets à casque à pointe, colonne, porteurs, statue), village bulu,
 * académie prussienne, crête au crépuscule, Ebolowa à midi, diptyque nocturne Ebolowa / Douala,
 * lanterne, enveloppe à cachet de cire, main gantée, mouchoir blanc.
 */
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, W, H, cinzel, manrope, goldGradient } from "../theme";
import { Flame } from "../recit-kit";

export const SB = {
  steel: "#AEB8C2",
  prussian: "#1C2A3A",
  slate: "#3B434C",
  coldWhite: "#DDE3E8",
  ochre: "#D8913E",
  terra: "#C2583A",
  earth: "#8A3B22",
  ivory: "#F3E9D8",
  black: "#0B0806",
};

export const steelGradient = "linear-gradient(180deg, #FFFFFF 0%, #DDE3E8 40%, #94A3B3 100%)";
export const textFill = (g: string): React.CSSProperties => ({ background: g, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" });

/* ---------- Étalonnage froid et couture de lumière ---------- */

/** Passe tout son contenu au froid (acier, bleu de Prusse) selon `cold` (0 à 1). */
export const Graded: React.FC<{ cold: number; children: React.ReactNode }> = ({ cold, children }) => (
  <AbsoluteFill style={{ filter: cold > 0.001 ? `grayscale(${0.82 * cold}) brightness(${1 - 0.16 * cold}) contrast(${1 + 0.1 * cold})` : undefined }}>
    {children}
    {cold > 0.001 ? <AbsoluteFill style={{ background: "#2E5276", mixBlendMode: "color", opacity: 0.5 * cold }} /> : null}
    {cold > 0.001 ? <AbsoluteFill style={{ background: "rgba(20,34,52,1)", mixBlendMode: "soft-light", opacity: 0.45 * cold }} /> : null}
  </AbsoluteFill>
);

/**
 * Deux versions d'une même image séparées par une couture verticale en x :
 * `warmSide` = côté chaud ("right" : chaud à droite de x).
 */
export const SplitGrade: React.FC<{ x: number; warmSide: "left" | "right"; render: () => React.ReactNode; seam?: number; frame: number }> = ({ x, warmSide, render, seam = 1, frame }) => {
  const clip = warmSide === "right" ? `inset(0 0 0 ${Math.max(0, x)}px)` : `inset(0 ${Math.max(0, W - x)}px 0 0)`;
  const allWarm = warmSide === "right" ? x <= 0 : x >= W;
  const allCold = warmSide === "right" ? x >= W : x <= 0;
  return (
    <AbsoluteFill>
      {!allWarm ? <Graded cold={1}>{render()}</Graded> : null}
      {!allCold ? <AbsoluteFill style={{ clipPath: allWarm ? undefined : clip }}>{render()}</AbsoluteFill> : null}
      {!allWarm && !allCold ? <Seam x={x} o={seam} frame={frame} /> : null}
    </AbsoluteFill>
  );
};

/** Couture de lumière verticale (or et terracotta), avec étincelles qui tombent. */
export const Seam: React.FC<{ x: number; o?: number; frame: number; top?: number; bottom?: number }> = ({ x, o = 1, frame, top = 0, bottom = H }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: o, pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: x - 60, top, width: 120, height: bottom - top, background: "linear-gradient(90deg, rgba(194,88,58,0) 0%, rgba(214,120,60,0.28) 35%, rgba(255,214,140,0.55) 50%, rgba(214,120,60,0.28) 65%, rgba(194,88,58,0) 100%)" }} />
    <div style={{ position: "absolute", left: x - 3, top, width: 6, height: bottom - top, background: "linear-gradient(180deg, #F7D98B 0%, #FFF1C4 45%, #E3A277 100%)", boxShadow: "0 0 18px rgba(255,200,120,0.95), 0 0 50px rgba(240,160,70,0.6)" }} />
    {Array.from({ length: 16 }).map((_, i) => {
      const life = 26 + random(`sl${i}`) * 20;
      const t = (frame + random(`so${i}`) * life) % life;
      const sx = x + (random(`sx${i}`) - 0.5) * 30 + (t / life) * (random(`sd${i}`) - 0.5) * 60;
      const sy = top + random(`sy${i}`) * (bottom - top) * 0.8 + t * 9;
      const sz = 3 + random(`ss${i}`) * 5;
      return <div key={i} style={{ position: "absolute", left: sx, top: sy, width: sz, height: sz, borderRadius: sz, background: "#FFE2A6", opacity: (1 - t / life) * 0.9, boxShadow: "0 0 8px #FFB45A" }} />;
    })}
  </div>
);

/* ---------- Plaque typographique qui pivote ---------- */

const plaqueStyle = (tone: "steel" | "gold"): React.CSSProperties =>
  tone === "steel"
    ? {
        background: "linear-gradient(160deg, #33414F 0%, #1A232E 55%, #10161D 100%)",
        border: "4px solid #A9B6C3",
        boxShadow: "inset 0 0 0 10px rgba(16,22,29,0.9), inset 0 0 0 12px rgba(169,182,195,0.45), 0 30px 60px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.35)",
      }
    : {
        background: "linear-gradient(160deg, #3A2412 0%, #1E1209 55%, #120A05 100%)",
        border: `4px solid ${C.gold}`,
        boxShadow: "inset 0 0 0 10px rgba(18,10,5,0.9), inset 0 0 0 12px rgba(240,195,107,0.5), 0 30px 60px rgba(0,0,0,0.7), 0 0 50px rgba(240,170,70,0.25)",
      };

export const PlaqueText: React.FC<{ lines: { t: string; size: number }[]; tone: "steel" | "gold" }> = ({ lines, tone }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
    {lines.map((l, i) => (
      <div
        key={i}
        style={{
          fontFamily: cinzel,
          fontWeight: 900,
          fontSize: l.size,
          lineHeight: 1.08,
          letterSpacing: l.size * 0.03,
          whiteSpace: "nowrap",
          ...textFill(tone === "steel" ? steelGradient : goldGradient),
          filter: tone === "steel" ? "drop-shadow(0 3px 0 rgba(0,0,0,0.85))" : "drop-shadow(0 3px 0 rgba(60,32,8,0.95)) drop-shadow(0 0 14px rgba(240,170,60,0.45))",
        }}
      >
        {l.t}
      </div>
    ))}
  </div>
);

/** Plaque à deux faces qui pivote sur l'axe vertical (angle en degrés : 0 = face avant, 180 = face arrière). */
export const FlipPlaque: React.FC<{ x: number; y: number; w: number; h: number; angle: number; front: React.ReactNode; back: React.ReactNode; frontTone: "steel" | "gold"; backTone: "steel" | "gold"; scale?: number; opacity?: number }> = ({ x, y, w, h, angle, front, back, frontTone, backTone, scale = 1, opacity = 1 }) => {
  const sheen = Math.sin((angle / 180) * Math.PI);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, perspective: 1600, opacity, transform: `scale(${scale})` }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${angle}deg)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", ...plaqueStyle(frontTone) }}>
          {front}
          <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: `linear-gradient(100deg, rgba(255,255,255,0) 30%, rgba(255,255,255,${0.35 * sheen}) 50%, rgba(255,255,255,0) 70%)` }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", ...plaqueStyle(backTone) }}>
          {back}
          <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: `linear-gradient(100deg, rgba(255,240,200,0) 30%, rgba(255,240,200,${0.35 * sheen}) 50%, rgba(255,240,200,0) 70%)` }} />
        </div>
      </div>
    </div>
  );
};

/* ---------- Bouton de tunique (métal bombé) ---------- */

export const TunicButton: React.FC<{ size: number; glint: number }> = ({ size, glint }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: "visible" }}>
    <defs>
      <radialGradient id="btn-g" cx="0.38" cy="0.32" r="0.75">
        <stop offset="0" stopColor="#F2E2BE" />
        <stop offset="0.22" stopColor="#B8955E" />
        <stop offset="0.62" stopColor="#5E4628" />
        <stop offset="1" stopColor="#1E160C" />
      </radialGradient>
    </defs>
    <ellipse cx={6} cy={10} rx={50} ry={46} fill="rgba(0,0,0,0.55)" />
    <circle r={46} fill="url(#btn-g)" />
    <circle r={38} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
    <circle r={46} fill="none" stroke="rgba(20,24,28,0.8)" strokeWidth={3} />
    <ellipse cx={-14} cy={-16} rx={12} ry={6} fill="rgba(255,248,230,0.55)" transform="rotate(-35 -14 -16)" />
    <circle r={22} fill="none" stroke="rgba(40,28,12,0.45)" strokeWidth={3} />
    <clipPath id="btn-clip">
      <circle r={46} />
    </clipPath>
    <g clipPath="url(#btn-clip)">
      <rect x={-60} y={-8} width={120} height={16} fill="rgba(255,250,235,0.5)" transform={`rotate(-40) translate(${-110 + glint * 220} 0)`} />
    </g>
  </svg>
);

/* ---------- Silhouettes pleines (profil vers la droite ; origine : sol entre les pieds ; hauteur ≈ 650) ---------- */

export type FigKind = "cadet" | "colonial" | "porter" | "porterF" | "statue";

const leg = (a: number, k: number, fill: string, detail: string, style: "boot" | "bare" | "trouser") => (
  <g transform={`rotate(${a})`}>
    <path d={style === "bare" ? "M -23 -10 Q -28 50 -15 152 L 16 152 Q 28 60 23 -10 Z" : "M -29 -10 Q -33 60 -19 152 L 20 152 Q 34 60 29 -10 Z"} fill={fill} />
    <circle cx={0} cy={150} r={style === "bare" ? 16 : 20} fill={fill} />
    <g transform={`translate(0 148) rotate(${k})`}>
      {style === "boot" ? (
        <>
          <path d="M -20 -4 L 20 -4 L 19 128 L 48 134 Q 62 140 58 152 L -21 152 Z" fill={fill} />
          <path d="M -20 34 L 20 34" stroke={detail} strokeWidth={4} />
          <path d="M -21 146 L 58 146" stroke={detail} strokeWidth={3} />
        </>
      ) : style === "bare" ? (
        <path d="M -15 -4 Q -20 40 -12 70 Q -6 110 -8 134 L 34 140 Q 46 146 40 152 L -14 152 Q -8 110 -14 134 Z M -15 -4 L 16 -4 Q 20 40 10 80 L 10 136 L -10 136 Z" fill={fill} />
      ) : (
        <>
          <path d="M -18 -4 L 18 -4 L 17 132 L 44 138 Q 56 144 52 152 L -19 152 Z" fill={fill} />
          <path d="M -19 112 L 18 112" stroke={detail} strokeWidth={3} />
        </>
      )}
    </g>
  </g>
);

const arm = (a: number, e: number, fill: string, w = 26) => (
  <g transform={`rotate(${a})`}>
    <circle cx={0} cy={4} r={w * 0.72} fill={fill} />
    <path d={`M ${-w / 2 - 2} -4 Q ${-w / 2 - 5} 50 ${-w / 2 + 2} 112 L ${w / 2 - 2} 112 Q ${w / 2 + 5} 50 ${w / 2 + 2} -4 Z`} fill={fill} />
    <circle cx={0} cy={110} r={w / 2 - 1} fill={fill} />
    <g transform={`translate(0 108) rotate(${e})`}>
      <path d={`M ${-w / 2 + 1} -2 Q ${-w / 2 - 2} 40 ${-w / 2 + 5} 94 L ${w / 2 - 5} 94 Q ${w / 2 + 2} 40 ${w / 2 - 1} -2 Z`} fill={fill} />
      <path d="M -11 90 Q -15 108 -8 122 Q 2 130 10 120 Q 15 106 11 90 Z" fill={fill} />
      <path d="M 9 96 Q 18 104 14 114" stroke={fill} strokeWidth={6} strokeLinecap="round" fill="none" />
    </g>
  </g>
);

export const Figure: React.FC<{ kind: FigKind; p: number; base?: string; detail?: string; metal?: string }> = ({ kind, p, base = "#0B0E12", detail = "#28313B", metal = "#9AA6B2" }) => {
  const isPorter = kind === "porter" || kind === "porterF";
  const isStatue = kind === "statue";
  const amp = isStatue ? 0 : isPorter ? 17 : 24;
  const legA = -amp * Math.sin(p);
  const legB = amp * Math.sin(p);
  const kneeA = isStatue ? 0 : 6 + 26 * Math.max(0, Math.cos(p + 0.5));
  const kneeB = isStatue ? 0 : 6 + 26 * Math.max(0, Math.cos(p + Math.PI + 0.5));
  const bob = isStatue ? 0 : -7 * Math.abs(Math.cos(p));
  const lean = isPorter ? 11 : 2;
  const swing = isStatue ? 0 : 20 * Math.sin(p);
  const legStyle = kind === "cadet" || kind === "colonial" ? "boot" : isPorter ? "bare" : "trouser";
  const farTone = "#06080B";
  return (
    <g>
      {/* jambe arrière */}
      <g transform={`translate(0 ${-300 + bob})`}>{leg(legB, kneeB, farTone, detail, legStyle)}</g>
      <g transform={`translate(0 ${bob}) rotate(${lean} 0 -300)`}>
        {/* bras arrière */}
        {kind === "colonial" || isPorter ? <g transform="translate(-6 -480)">{arm(-swing * 0.8, -10, farTone)}</g> : null}
        {kind === "cadet" ? <g transform="translate(-4 -480)">{arm(swing, -12, farTone)}</g> : null}
        {/* sac et fusil dans le dos */}
        {kind === "colonial" ? (
          <>
            <path d="M -40 -300 L -32 -300 L -50 -655 L -58 -655 Z" fill={base} />
            <rect x={-52} y={-660} width={6} height={14} fill={metal} />
            <path d="M -44 -360 L -26 -350 L -30 -300 L -46 -306 Z" fill={detail} />
          </>
        ) : null}
        {kind === "cadet" || kind === "colonial" ? (
          <>
            <rect x={-88} y={-490} width={50} height={122} rx={9} fill={base} />
            <rect x={-84} y={-480} width={42} height={8} fill={detail} />
            <ellipse cx={-50} cy={-496} rx={48} ry={14} fill={base} stroke={detail} strokeWidth={3} />
            <path d="M -60 -500 Q -40 -488 -20 -500" stroke={detail} strokeWidth={2} fill="none" />
          </>
        ) : null}
        {/* torse */}
        {kind === "cadet" || kind === "colonial" ? (
          <>
            <path d="M -38 -494 Q -50 -400 -40 -328 L -48 -256 L 52 -256 L 42 -328 Q 54 -412 38 -494 Q 0 -508 -38 -494 Z" fill={base} />
            <rect x={-46} y={-338} width={94} height={15} fill={detail} />
            <rect x={30} y={-341} width={12} height={21} rx={2} fill={metal} opacity={0.85} />
            <rect x={-6} y={-358} width={22} height={22} rx={3} fill={detail} />
            <rect x={-32} y={-358} width={22} height={22} rx={3} fill={detail} />
            {[-480, -454, -428, -402, -376].map((y) => (
              <circle key={y} cx={37} cy={y} r={3.2} fill={metal} />
            ))}
            <path d="M 40 -494 L -30 -330" stroke={detail} strokeWidth={5} />
            <rect x={-16} y={-522} width={34} height={32} fill={base} />
            <rect x={6} y={-516} width={12} height={12} fill={detail} />
          </>
        ) : null}
        {kind === "statue" ? (
          <>
            <path d="M -46 -500 Q -56 -380 -60 -168 L 62 -168 Q 58 -380 44 -500 Q 0 -514 -46 -500 Z" fill={base} />
            <path d="M 30 -496 L 18 -300 M 34 -440 L 54 -420" stroke={detail} strokeWidth={4} fill="none" />
            {[-470, -430, -390, -350].map((y) => (
              <circle key={y} cx={30} cy={y} r={4} fill={detail} />
            ))}
            <rect x={-16} y={-526} width={34} height={34} fill={base} />
          </>
        ) : null}
        {isPorter ? (
          <>
            <path d="M -32 -488 Q -44 -400 -36 -320 L 38 -320 Q 46 -410 32 -488 Q 0 -500 -32 -488 Z" fill={base} />
            {kind === "porter" ? (
              <path d="M -42 -332 L 44 -332 L 48 -238 L -44 -234 Z" fill={base} />
            ) : (
              <path d="M -42 -336 L 46 -336 L 58 -150 L -50 -150 Z" fill={base} />
            )}
            <path d={kind === "porter" ? "M -30 -320 L -20 -240 M 10 -326 L 18 -238" : "M -26 -326 L -34 -160 M 12 -330 L 24 -158 M -42 -336 L 46 -336"} stroke={detail} strokeWidth={3} fill="none" />
            <rect x={-12} y={-518} width={26} height={32} fill={base} />
          </>
        ) : null}
        {/* fusil et bras avant */}
        {kind === "cadet" ? (
          <>
            <path d="M 36 -430 L 44 -428 L -44 -770 L -51 -768 Z" fill={base} />
            <rect x={-50} y={-776} width={6} height={12} fill={metal} transform="rotate(-15 -47 -770)" />
            <path d="M 22 -424 L 50 -404 L 62 -372 L 40 -360 L 14 -416 Z" fill={base} />
            <path d="M 26 -410 L 46 -396" stroke={detail} strokeWidth={3} />
            <rect x={12} y={-478} width={16} height={8} fill={metal} transform="rotate(-15 20 -474)" />
            <path d="M 52 -380 Q 4 -520 -30 -700" stroke={detail} strokeWidth={3} fill="none" />
            <g transform="translate(14 -482)">{arm(-10, -78, base, 24)}</g>
          </>
        ) : null}
        {kind === "colonial" ? <g transform="translate(10 -482)">{arm(swing * 0.8, -14, base, 24)}</g> : null}
        {isPorter ? <g transform="translate(26 -478)">{arm(-158, -22, base, 24)}</g> : null}
        {kind === "statue" ? (
          <>
            <g transform="translate(-30 -486)">{arm(4, -4, base, 26)}</g>
            <g transform="translate(34 -486)">{arm(-6, -4, base, 26)}</g>
          </>
        ) : null}
        {/* tête */}
        <circle cx={6} cy={-552} r={31} fill={base} />
        <path d="M 34 -562 L 46 -546 L 34 -540 Z" fill={base} />
        <path d="M 30 -532 Q 26 -516 8 -514 L 10 -530 Z" fill={base} />
        <circle cx={-4} cy={-550} r={6} fill={detail} />
        {kind === "cadet" ? (
          <>
            <path d="M -30 -560 Q -28 -608 6 -610 Q 40 -608 40 -560 Z" fill={base} />
            <path d="M 36 -564 L 64 -552 L 36 -550 Z" fill={base} />
            <path d="M -30 -564 L -44 -546 L -24 -552 Z" fill={base} />
            <rect x={0} y={-620} width={13} height={11} fill={metal} />
            <path d="M 2 -620 L 6.5 -656 L 11 -620 Z" fill={metal} />
            <ellipse cx={26} cy={-586} rx={8} ry={12} fill={metal} opacity={0.75} />
            <path d="M 34 -554 Q 30 -532 14 -524" stroke={metal} strokeWidth={2.5} fill="none" opacity={0.8} />
          </>
        ) : null}
        {kind === "colonial" ? (
          <>
            <path d="M -40 -560 Q -36 -618 6 -620 Q 48 -618 50 -560 Z" fill={base} />
            <ellipse cx={6} cy={-560} rx={60} ry={9} fill={base} />
            <path d="M -38 -578 Q 6 -584 48 -578" stroke={detail} strokeWidth={5} fill="none" />
          </>
        ) : null}
        {kind === "porter" ? (
          <>
            <ellipse cx={4} cy={-590} rx={26} ry={8} fill={detail} />
            <path d="M -64 -598 Q -72 -606 -70 -648 Q -68 -676 -40 -676 L 44 -676 Q 72 -674 70 -648 Q 72 -606 62 -596 Q 0 -588 -64 -598 Z" fill={base} />
            <path d="M -30 -676 L -26 -594 M 34 -676 L 30 -594 M -70 -636 Q 0 -626 70 -636" stroke={detail} strokeWidth={4} fill="none" />
          </>
        ) : null}
        {kind === "porterF" ? (
          <>
            <path d="M -26 -572 Q -10 -606 30 -580 Q 40 -560 30 -566 Q 4 -588 -26 -572 Z" fill={base} />
            <path d="M -60 -596 L 62 -596 L 50 -684 L -48 -684 Z" fill={base} />
            {[-664, -642, -620].map((y) => (
              <path key={y} d={`M -54 ${y} L 58 ${y}`} stroke={detail} strokeWidth={3} />
            ))}
            {[-36, -12, 12, 36].map((x) => (
              <path key={x} d={`M ${x} -684 L ${x * 1.15} -596`} stroke={detail} strokeWidth={2.5} />
            ))}
            {[-30, -6, 20, 40].map((x, i) => (
              <circle key={x} cx={x} cy={-694 - (i % 2) * 8} r={16} fill={base} />
            ))}
          </>
        ) : null}
      </g>
      {/* jambe avant */}
      <g transform={`translate(0 ${-300 + bob})`}>{leg(legA, kneeA, base, detail, legStyle)}</g>
    </g>
  );
};

/** Un groupe de silhouettes dans un SVG plein cadre, avec liseré de lumière (rim) d'un côté. */
export const FigureLayer: React.FC<{
  figs: { kind: FigKind; x: number; y: number; s: number; p: number; flip?: boolean; base?: string; detail?: string }[];
  rim: string;
  rimDx?: number;
  glow?: string;
  blur?: number;
  style?: React.CSSProperties;
}> = ({ figs, rim, rimDx = -4, glow, blur = 0, style }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: `drop-shadow(${rimDx}px -2px 0 ${rim}) ${glow ? `drop-shadow(0 0 12px ${glow})` : ""} ${blur ? `blur(${blur}px)` : ""}`, ...style }}>
    {figs.map((g, i) => (
      <g key={i} transform={`translate(${g.x} ${g.y}) scale(${g.flip ? -g.s : g.s} ${g.s})`}>
        <Figure kind={g.kind} p={g.p} base={g.base} detail={g.detail} />
      </g>
    ))}
  </svg>
);

/* ---------- Village bulu à l'aube ---------- */

const Hut: React.FC<{ x: number; y: number; w: number; h: number; id: string; light: number; smoke?: number; frame: number }> = ({ x, y, w, h, id, light, smoke, frame }) => {
  const roofH = h * 0.62;
  const eave = 26 * (w / 300);
  return (
    <g>
      <ellipse cx={x + w * 0.1} cy={y + 6} rx={w * 0.7} ry={h * 0.08} fill="rgba(30,10,4,0.45)" />
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill={`url(#${id}-wall)`} filter="url(#mud)" />
      <rect x={x - w / 2} y={y - h} width={w} height={h * 0.28} fill="rgba(40,14,6,0.55)" />
      <path d={`M ${x - w * 0.12} ${y} L ${x - w * 0.12} ${y - h * 0.62} Q ${x} ${y - h * 0.7} ${x + w * 0.12} ${y - h * 0.62} L ${x + w * 0.12} ${y} Z`} fill="#1a0b05" />
      <path d={`M ${x - w * 0.12} ${y - h * 0.62} Q ${x} ${y - h * 0.7} ${x + w * 0.12} ${y - h * 0.62}`} stroke={`rgba(255,200,130,${0.4 * light})`} strokeWidth={3} fill="none" />
      <path d={`M ${x - w / 2 - eave} ${y - h + 6} L ${x + w / 2 + eave} ${y - h + 6} L ${x + w * 0.3} ${y - h - roofH} L ${x - w * 0.3} ${y - h - roofH} Z`} fill={`url(#${id}-roof)`} />
      {Array.from({ length: Math.round(w / 9) }).map((_, i) => {
        const u = i / Math.round(w / 9);
        const bx = x - w / 2 - eave + u * (w + 2 * eave);
        const tx = x - w * 0.3 + u * w * 0.6;
        return <path key={i} d={`M ${bx} ${y - h + 6} L ${tx} ${y - h - roofH}`} stroke={i % 3 === 0 ? "rgba(40,22,8,0.55)" : "rgba(230,180,100,0.18)"} strokeWidth={2} />;
      })}
      <path d={`M ${x - w / 2 - eave} ${y - h + 6} ${Array.from({ length: 16 }).map((_, i) => `L ${x - w / 2 - eave + ((i + 0.5) / 16) * (w + 2 * eave)} ${y - h + 16 + (i % 2) * 8} L ${x - w / 2 - eave + ((i + 1) / 16) * (w + 2 * eave)} ${y - h + 6}`).join(" ")}`} fill="#4a2d12" />
      <path d={`M ${x - w * 0.3} ${y - h - roofH} L ${x + w * 0.3} ${y - h - roofH}`} stroke="#2b1708" strokeWidth={8} />
      <path d={`M ${x + w / 2 + eave} ${y - h + 6} L ${x + w * 0.3} ${y - h - roofH}`} stroke={`rgba(255,210,140,${0.5 * light})`} strokeWidth={3} />
      {smoke
        ? Array.from({ length: 7 }).map((_, i) => {
            const t = ((frame * 0.9 + i * 14) % 100) / 100;
            return <circle key={i} cx={x + w * 0.1 + Math.sin(t * 5 + i) * 18 + t * 60} cy={y - h - roofH - t * 340} r={18 + t * 50} fill={`rgba(220,200,180,${0.22 * (1 - t) * smoke})`} filter="url(#soft)" />;
          })
        : null}
    </g>
  );
};

const PalmFrond: React.FC<{ x: number; y: number; len: number; rot: number; sway: number; fill: string }> = ({ x, y, len, rot, sway, fill }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot + sway})`}>
    <path d={`M 0 0 Q ${len * 0.5} ${-len * 0.12} ${len} ${len * 0.18}`} stroke={fill} strokeWidth={7} fill="none" />
    {Array.from({ length: 34 }).map((_, i) => {
      const u = 0.06 + (i / 34) * 0.92;
      const px = len * u;
      const py = -len * 0.12 * 4 * u * (1 - u) + len * 0.18 * u * u;
      const l = len * 0.5 * (1 - u * 0.55);
      const wv = Math.sin(i * 1.7) * 0.08;
      return (
        <g key={i}>
          <path d={`M ${px} ${py} q ${l * (0.45 + wv)} ${l * 0.2} ${l * (0.62 + wv)} ${l * 0.85} q ${-l * 0.1} ${-l * 0.45} ${-l * 0.62} ${-l * 0.82} Z`} fill={fill} />
          <path d={`M ${px} ${py} q ${-l * (0.2 - wv)} ${l * 0.35} ${-l * 0.1} ${l * 0.95} q ${-l * 0.02} ${-l * 0.55} ${l * 0.08} ${-l * 0.93} Z`} fill={fill} />
        </g>
      );
    })}
  </g>
);

const Fromager: React.FC<{ x: number; y: number; s: number; fill: string }> = ({ x, y, s, fill }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <path d="M -22 0 L -60 0 Q -30 -20 -16 -60 L -12 -340 L 12 -340 L 16 -60 Q 30 -20 62 0 L 22 0 Z" />
    <path d="M -12 -300 Q -80 -330 -140 -330 M 12 -290 Q 80 -320 150 -326" stroke={fill} strokeWidth={10} fill="none" />
    <ellipse cx={-130} cy={-350} rx={110} ry={34} />
    <ellipse cx={130} cy={-348} rx={120} ry={36} />
    <ellipse cx={0} cy={-372} rx={150} ry={44} />
    <ellipse cx={-40} cy={-404} rx={90} ry={30} />
    <ellipse cx={60} cy={-400} rx={80} ry={28} />
  </g>
);

export const SceneDefs: React.FC = () => (
  <defs>
    <filter id="mud" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves={3} seed={4} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.16  0 0 0 0 0.06  0 0 0 0.9 -0.15" result="c" />
      <feComposite in="c" in2="SourceGraphic" operator="in" result="m" />
      <feBlend in="m" in2="SourceGraphic" mode="multiply" />
    </filter>
    <filter id="stone" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves={4} seed={9} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.27  0 0 0 0 0.3  0 0 0 0.7 -0.1" result="c" />
      <feComposite in="c" in2="SourceGraphic" operator="in" result="m" />
      <feBlend in="m" in2="SourceGraphic" mode="multiply" />
    </filter>
    <filter id="soft">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <filter id="soft4">
      <feGaussianBlur stdDeviation="4" />
    </filter>
  </defs>
);

const hutGrads = (id: string, wall: [string, string], roof: [string, string]) => (
  <>
    <linearGradient id={`${id}-wall`} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor={wall[0]} />
      <stop offset="1" stopColor={wall[1]} />
    </linearGradient>
    <linearGradient id={`${id}-roof`} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stopColor={roof[0]} />
      <stop offset="1" stopColor={roof[1]} />
    </linearGradient>
  </>
);

/** Village bulu à l'aube, 4 couches de parallaxe (f : image locale). */
export const BuluVillage: React.FC<{ f: number; push: number }> = ({ f, push }) => {
  const sway = Math.sin(f * 0.07) * 2.5;
  const huts = [
    { x: 150, y: 1240, w: 330, h: 230, side: -1 },
    { x: 960, y: 1290, w: 360, h: 250, side: 1 },
    { x: 330, y: 1085, w: 190, h: 130, side: -1 },
    { x: 760, y: 1095, w: 200, h: 136, side: 1 },
    { x: 440, y: 1010, w: 110, h: 76, side: -1 },
    { x: 650, y: 1015, w: 116, h: 80, side: 1 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "540px 1000px" }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #2B1E2C 0%, #6A3A3A 22%, #C46E42 44%, #F0BC73 54%, #F6D79A 58%, #6B3A24 60%, #3A1C10 100%)" }} />
        <div style={{ position: "absolute", left: 120, top: 640, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,236,190,0.95) 0%, rgba(255,200,120,0.45) 22%, rgba(255,170,90,0) 62%)" }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <SceneDefs />
          <defs>
            {hutGrads("hl", ["#B8743E", "#7A4422"], ["#C9A062", "#6E4A22"])}
            {hutGrads("hr", ["#8E5530", "#5E3218"], ["#A9824C", "#4E3216"])}
            <linearGradient id="path-g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#C46A44" />
              <stop offset="1" stopColor="#7A2E18" />
            </linearGradient>
          </defs>
          {/* collines lointaines et fromagers */}
          <path d={`M 0 990 ${Array.from({ length: 28 }).map((_, i) => `L ${i * 40 + 40} ${940 - 30 * Math.sin(i * 0.5) - 14 * Math.sin(i * 1.7)}`).join(" ")} L ${W} 1010 L 0 1010 Z`} fill="#7B4636" opacity={0.75} />
          <g opacity={0.8}>
            <Fromager x={160} y={985} s={0.55} fill="#4E2A22" />
            <Fromager x={880} y={980} s={0.62} fill="#4E2A22" />
            <Fromager x={560} y={960} s={0.35} fill="#6A3A2C" />
          </g>
          <path d={`M 0 1010 ${Array.from({ length: 28 }).map((_, i) => `L ${i * 40 + 40} ${985 - 18 * Math.sin(i * 0.8 + 1) - 8 * Math.sin(i * 2.1)}`).join(" ")} L ${W} 1030 L 0 1030 Z`} fill="#4A2618" />
          {/* sol et chemin */}
          <rect x={0} y={1020} width={W} height={900} fill="#5A2414" />
          <path d="M 500 1020 L 580 1020 L 980 1920 L 100 1920 Z" fill="url(#path-g)" />
          {Array.from({ length: 30 }).map((_, i) => (
            <ellipse key={i} cx={540 + (random(`pp${i}`) - 0.5) * (200 + i * 22)} cy={1040 + i * 29} rx={6 + i * 0.6} ry={2 + i * 0.2} fill="rgba(60,20,8,0.45)" />
          ))}
          {huts
            .slice()
            .reverse()
            .map((h, i) => (
              <Hut key={i} x={h.x} y={h.y} w={h.w} h={h.h} id={h.side < 0 ? "hl" : "hr"} light={h.side < 0 ? 0.4 : 1} smoke={i === 3 ? 1 : 0} frame={f} />
            ))}
          {/* premier plan : palmes et herbes */}
          <PalmFrond x={-60} y={1320} len={520} rot={-48} sway={sway} fill="#1A0D07" />
          <PalmFrond x={-40} y={1380} len={460} rot={-12} sway={-sway} fill="#140A05" />
          <PalmFrond x={1140} y={1260} len={540} rot={-150} sway={-sway} fill="#1A0D07" />
          <PalmFrond x={1120} y={1400} len={420} rot={-176} sway={sway} fill="#120904" />
          {Array.from({ length: 70 }).map((_, i) => {
            const gx = random(`gx${i}`) * W;
            const gl = 70 + random(`gl${i}`) * 140;
            const bend = Math.sin(f * 0.08 + i) * 10 + (random(`gb${i}`) - 0.5) * 40;
            return <path key={i} d={`M ${gx} 1940 q ${bend * 0.4} ${-gl * 0.6} ${bend} ${-gl}`} stroke={i % 3 ? "#1E0E06" : "#3A1C0C"} strokeWidth={5} fill="none" />;
          })}
        </svg>
      </AbsoluteFill>
      {/* rais de lumière et poussière */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: -200 + i * 260, top: 300, width: 260, height: 1500, background: "linear-gradient(180deg, rgba(255,220,150,0.18) 0%, rgba(255,220,150,0) 80%)", transform: `rotate(${-28 + i * 4}deg)`, transformOrigin: "50% 0", mixBlendMode: "screen", filter: "blur(28px)", opacity: 0.7 + 0.3 * Math.sin(f * 0.05 + i) }} />
      ))}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (random(`dx${i}`) * W + f * (0.6 + random(`dv${i}`))) % W;
        const y = 500 + random(`dy${i}`) * 900 + Math.sin(f * 0.05 + i) * 20;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 4, height: 4, borderRadius: 2, background: "#FFE2A6", opacity: 0.5 * random(`do${i}`) }} />;
      })}
    </AbsoluteFill>
  );
};

/* ---------- Académie militaire prussienne (évocation) ---------- */

const Facade: React.FC<{ id: string }> = ({ id }) => {
  const cols = [-20, 170, 360, 560, 750, 940, 1130];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-col`} x1="0" x2="1">
          <stop offset="0" stopColor="#D4DAE0" />
          <stop offset="0.35" stopColor="#AEB7C0" />
          <stop offset="1" stopColor="#5D6670" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8A939C" />
          <stop offset="1" stopColor="#5E666F" />
        </linearGradient>
      </defs>
      <rect x={-100} y={420} width={W + 200} height={780} fill={`url(#${id}-wall)`} filter="url(#stone)" />
      {cols.slice(0, -1).map((c, i) => (
        <g key={i}>
          {[0, 1].map((r) => (
            <g key={r}>
              <rect x={c + 56} y={540 + r * 300} width={80} height={200} fill="#1B232B" />
              <rect x={c + 56} y={540 + r * 300} width={80} height={200} fill={`rgba(255,196,120,${(i + r) % 3 === 0 ? 0.32 : 0.08})`} />
              <path d={`M ${c + 96} ${540 + r * 300} L ${c + 96} ${740 + r * 300} M ${c + 56} ${610 + r * 300} L ${c + 136} ${610 + r * 300} M ${c + 56} ${676 + r * 300} L ${c + 136} ${676 + r * 300}`} stroke="#7C8792" strokeWidth={4} />
              <rect x={c + 48} y={528 + r * 300} width={96} height={14} fill="#C3CAD1" />
              <rect x={c + 50} y={742 + r * 300} width={92} height={10} fill="#4C545D" />
            </g>
          ))}
        </g>
      ))}
      {cols.map((c, i) => (
        <g key={i}>
          <rect x={c - 34} y={470} width={68} height={720} fill={`url(#${id}-col)`} />
          {Array.from({ length: 6 }).map((_, k) => (
            <path key={k} d={`M ${c - 26 + k * 10} 480 L ${c - 26 + k * 10} 1180`} stroke="rgba(40,48,56,0.25)" strokeWidth={2} />
          ))}
          <rect x={c - 44} y={452} width={88} height={22} fill="#C7CED5" />
          <rect x={c - 46} y={1180} width={92} height={26} fill="#7A838C" />
        </g>
      ))}
      <rect x={-100} y={392} width={W + 200} height={62} fill="#B5BDC5" />
      <rect x={-100} y={380} width={W + 200} height={16} fill="#DDE3E8" />
      <path d={`M 120 380 L 540 210 L 960 380 Z`} fill="#A3ACB5" />
      <path d={`M 170 372 L 540 228 L 910 372 Z`} fill="#7E8892" />
      <path d={`M 110 382 L 540 204 L 970 382`} stroke="#E4E9ED" strokeWidth={10} fill="none" />
      <rect x={-100} y={1196} width={W + 200} height={20} fill="#9AA3AC" />
    </g>
  );
};

export const Academy: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4A535D 0%, #7C8690 40%, #9AA4AE 100%)" }} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <SceneDefs />
      <g transform={`translate(${-f * 0.6} 0)`}>
        <Facade id="fa" />
      </g>
      {/* pavés mouillés avec reflet de la façade */}
      <rect x={0} y={1216} width={W} height={704} fill="#262C33" />
      <g transform={`translate(${-f * 0.6} ${2 * 1216}) scale(1 -1)`} opacity={0.28} filter="url(#soft4)">
        <Facade id="fb" />
      </g>
      {Array.from({ length: 16 }).map((_, r) => {
        const y = 1222 + Math.pow(r, 1.55) * 15;
        const cw = 40 + r * 9;
        const off = (r % 2) * cw * 0.5 - ((f * 0.6 * (1 + r * 0.08)) % cw);
        return (
          <g key={r}>
            {Array.from({ length: Math.ceil(W / cw) + 2 }).map((_, k) => (
              <rect key={k} x={off + k * cw - cw} y={y} width={cw - 5} height={6 + r * 2.2} rx={4} fill="rgba(140,152,164,0.16)" stroke="rgba(15,18,22,0.6)" strokeWidth={2} />
            ))}
          </g>
        );
      })}
    </svg>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,26,34,0) 55%, rgba(14,18,24,0.55) 100%)" }} />
  </AbsoluteFill>
);

/* ---------- Crête au crépuscule froid ---------- */

export const ridgeY = (x: number) => 990 - 0.07 * (x - 540) + 18 * Math.sin(x * 0.006) + 8 * Math.sin(x * 0.019);

export const Ridge: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #101823 0%, #22303D 22%, #4C535E 38%, #9A4A2E 49%, #D0783E 51.5%, #3A1C16 54%, #0E0D10 60%)" }} />
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: "absolute", left: -300 + ((f * (0.4 + i * 0.15) + i * 300) % 1600) - 300, top: 560 + i * 90, width: 900, height: 50, borderRadius: "50%", background: "rgba(12,16,22,0.5)", filter: "blur(18px)" }} />
    ))}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <path d={`M 0 ${ridgeY(0) + 40} ${Array.from({ length: 28 }).map((_, i) => `L ${i * 40} ${ridgeY(i * 40) + 60 + 30 * Math.sin(i * 0.9)}`).join(" ")} L ${W} ${H} L 0 ${H} Z`} fill="#1A1517" opacity={0.6} />
      <path d={`M -20 ${ridgeY(-20)} ${Array.from({ length: 30 }).map((_, i) => `L ${i * 40} ${ridgeY(i * 40)}`).join(" ")} L ${W + 20} ${ridgeY(W + 20)} L ${W + 20} ${H} L -20 ${H} Z`} fill="#0A0A0D" />
      <path d={`M -20 ${ridgeY(-20)} ${Array.from({ length: 30 }).map((_, i) => `L ${i * 40} ${ridgeY(i * 40)}`).join(" ")}`} stroke="rgba(190,90,60,0.55)" strokeWidth={3} fill="none" />
    </svg>
  </AbsoluteFill>
);

/** Herbes hautes au premier plan (ondulent). */
export const TallGrass: React.FC<{ f: number; y: number; color?: string; count?: number; h?: number }> = ({ f, y, color = "#07070A", count = 90, h = 260 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: count }).map((_, i) => {
      const gx = random(`tg${i}`) * (W + 80) - 40;
      const gl = h * (0.5 + random(`tl${i}`) * 0.7);
      const bend = Math.sin(f * 0.06 + i * 0.7) * 16 + (random(`tb${i}`) - 0.5) * 50;
      return <path key={i} d={`M ${gx - 5} ${y} q ${bend * 0.4} ${-gl * 0.6} ${bend} ${-gl} q ${-bend * 0.5} ${gl * 0.5} ${-bend + 12} ${gl} Z`} fill={color} />;
    })}
  </svg>
);

/* ---------- Ebolowa à midi ---------- */

export const NoonStreet: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #E9C27E 0%, #F4DCA4 36%, #EFC98A 50%, #B5603A 52%, #8A3B22 75%, #4A1C0E 100%)" }} />
    <div style={{ position: "absolute", left: 640, top: 160, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,252,235,1) 0%, rgba(255,240,200,0.6) 18%, rgba(255,230,170,0) 60%)" }} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <SceneDefs />
      <defs>
        {hutGrads("hn", ["#D99A5A", "#A8602E"], ["#E2B871", "#8C6430"])}
        {hutGrads("hm", ["#C4824A", "#8C4E26"], ["#CFA060", "#7A5428"])}
      </defs>
      <g transform={`translate(${f * 0.4} 0)`}>
        <Fromager x={180} y={1000} s={0.95} fill="#3F2A18" />
        <Hut x={520} y={1000} w={240} h={150} id="hn" light={1} frame={f} />
        <Hut x={860} y={990} w={210} h={136} id="hm" light={1} frame={f} />
        <Hut x={1150} y={1000} w={240} h={150} id="hn" light={1} frame={f} />
      </g>
      <path d="M 0 1010 L 1080 1000 L 1080 1920 L 0 1920 Z" fill="#9A4428" opacity={0.6} />
      {Array.from({ length: 40 }).map((_, i) => (
        <ellipse key={i} cx={random(`nr${i}`) * W} cy={1030 + random(`ny${i}`) * 850} rx={8 + random(`nw${i}`) * 26} ry={3 + random(`nh${i}`) * 6} fill="rgba(70,24,10,0.35)" />
      ))}
    </svg>
    {/* chaleur qui tremble */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,240,200,0) 40%, rgba(255,230,180,0.12) 52%, rgba(255,240,200,0) 60%)" }} />
  </AbsoluteFill>
);

/* ---------- Lanterne tempête ---------- */

export const Lantern: React.FC<{ x: number; y: number; s: number; power: number; seed: string }> = ({ x, y, s, power, seed }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `scale(${s})` }}>
    <div style={{ position: "absolute", left: -260, top: -380, width: 520, height: 520, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,190,100,${0.5 * power}) 0%, rgba(255,140,50,${0.18 * power}) 35%, rgba(0,0,0,0) 70%)` }} />
    <svg width={240} height={330} viewBox="-120 -300 240 330" style={{ position: "absolute", left: -120, top: -300, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${seed}-tank`} x1="0" x2="1">
          <stop offset="0" stopColor="#6B4A2A" />
          <stop offset="0.4" stopColor="#B88A4E" />
          <stop offset="1" stopColor="#2E1E10" />
        </linearGradient>
        <radialGradient id={`${seed}-glass`} cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor={`rgba(255,220,150,${0.75 * power + 0.05})`} />
          <stop offset="1" stopColor={`rgba(160,90,40,${0.3 * power + 0.12})`} />
        </radialGradient>
      </defs>
      <path d="M -60 -250 Q 0 -340 60 -250" stroke="#2E1E10" strokeWidth={6} fill="none" />
      <path d="M -50 -230 L 50 -230 L 38 -250 L -38 -250 Z" fill={`url(#${seed}-tank)`} />
      <ellipse cx={0} cy={-120} rx={58} ry={96} fill={`url(#${seed}-glass)`} stroke="rgba(255,230,190,0.5)" strokeWidth={2} />
      <path d="M -28 -190 Q -40 -120 -24 -60" stroke="rgba(255,255,255,0.5)" strokeWidth={6} fill="none" strokeLinecap="round" />
      {[-40, 0, 40].map((xx) => (
        <path key={xx} d={`M ${xx} -230 Q ${xx * 1.6} -120 ${xx} -20`} stroke="#3A2614" strokeWidth={5} fill="none" />
      ))}
      <path d="M -60 -20 L 60 -20 L 70 20 L -70 20 Z" fill={`url(#${seed}-tank)`} />
      <rect x={-70} y={14} width={140} height={10} rx={3} fill="#24170C" />
      <rect x={52} y={-6} width={22} height={12} rx={3} fill="#3A2614" />
    </svg>
    {power > 0.02 ? <Flame x={0} y={-86} size={32} power={power} seed={seed} /> : null}
  </div>
);

/* ---------- Diptyque nocturne : Ebolowa | Douala ---------- */

export const NightEbolowa: React.FC<{ f: number; power: number }> = ({ f, power }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "linear-gradient(180deg, #050A08 0%, #0B1712 45%, #102016 70%, #070C09 100%)" }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <SceneDefs />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = -40 + i * 80 + random(`nt${i}`) * 40;
        const w = 26 + random(`nw${i}`) * 30;
        return <path key={i} d={`M ${x - w / 2} 1300 L ${x - w * 0.3} 200 L ${x + w * 0.3} 200 L ${x + w / 2} 1300 Z`} fill={i % 2 ? "#08110C" : "#0D1A12"} />;
      })}
      {Array.from({ length: 14 }).map((_, i) => (
        <ellipse key={i} cx={random(`fc${i}`) * 600} cy={160 + random(`fy${i}`) * 300} rx={110 + random(`fr${i}`) * 90} ry={60} fill="#06100A" />
      ))}
      {/* case */}
      <rect x={60} y={980} width={420} height={300} fill="#1E1209" filter="url(#mud)" />
      <path d="M 30 990 L 510 990 L 420 800 L 120 800 Z" fill="#160E07" />
      {Array.from({ length: 40 }).map((_, i) => (
        <path key={i} d={`M ${30 + i * 12} 990 L ${120 + i * 7.5} 800`} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
      ))}
      <rect x={220} y={1080} width={110} height={200} fill={`rgba(255,170,80,${0.55 * power + 0.05})`} />
      <rect x={220} y={1080} width={110} height={200} fill="none" stroke="#0A0603" strokeWidth={8} />
      <rect x={0} y={1280} width={W} height={640} fill="#070B08" />
      <ellipse cx={330} cy={1300} rx={260} ry={40} fill={`rgba(255,160,70,${0.22 * power})`} />
    </svg>
    <Lantern x={400} y={1300} s={0.9} power={power} seed="le" />
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: random(`ff${i}`) * 540, top: 600 + random(`fg${i}`) * 500 + Math.sin(f * 0.05 + i) * 30, width: 5, height: 5, borderRadius: 3, background: "#E9F5B0", opacity: 0.4 + 0.4 * Math.sin(f * 0.2 + i * 2), boxShadow: "0 0 8px #E9F5B0" }} />
    ))}
  </AbsoluteFill>
);

export const NightDouala: React.FC<{ f: number; power: number }> = ({ f, power }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "linear-gradient(180deg, #050A14 0%, #0C1A2C 50%, #13263A 62%, #08111C 100%)" }}>
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: random(`st${i}`) * W, top: 120 + random(`sy${i}`) * 700, width: 3, height: 3, borderRadius: 2, background: "#DDE8F5", opacity: 0.3 + 0.5 * random(`sb${i}`) * (0.7 + 0.3 * Math.sin(f * 0.1 + i)) }} />
    ))}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {/* palétuviers */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 560 + i * 100;
        return (
          <g key={i} fill="#050A10">
            <ellipse cx={x} cy={900 + (i % 2) * 30} rx={110} ry={70} />
            {Array.from({ length: 5 }).map((__, k) => (
              <path key={k} d={`M ${x - 20 + k * 10} 940 Q ${x - 60 + k * 30} 1020 ${x - 80 + k * 40} 1110`} stroke="#050A10" strokeWidth={6} fill="none" />
            ))}
          </g>
        );
      })}
      {/* maison sur pilotis à véranda */}
      <rect x={560} y={880} width={340} height={200} fill="#0A1018" />
      <path d="M 530 890 L 930 890 L 860 780 L 600 780 Z" fill="#070C12" />
      <rect x={560} y={1060} width={340} height={14} fill="#121C28" />
      {[580, 660, 740, 820, 880].map((x) => (
        <rect key={x} x={x} y={1074} width={10} height={60} fill="#070C12" />
      ))}
      <rect x={640} y={940} width={70} height={100} fill={`rgba(255,170,80,${0.5 * power + 0.05})`} />
      {/* eau */}
      <rect x={0} y={1130} width={W} height={800} fill="#07101A" />
      {Array.from({ length: 14 }).map((_, r) => {
        const y = 1150 + r * 28 + r * r * 1.5;
        let d = `M -20 ${y}`;
        for (let x = -20; x <= W + 40; x += 40) d += ` L ${x} ${y + Math.sin(x * 0.02 + f * 0.12 + r) * (3 + r * 0.6)}`;
        return <path key={r} d={d} stroke={`rgba(150,190,220,${0.08 + r * 0.012})`} strokeWidth={2 + r * 0.2} fill="none" />;
      })}
      {Array.from({ length: 10 }).map((_, k) => (
        <rect key={k} x={760 + Math.sin(f * 0.15 + k) * 14 - 30} y={1150 + k * 34} width={60 - k * 2} height={6} rx={3} fill={`rgba(255,180,90,${(0.4 - k * 0.03) * power})`} />
      ))}
      {/* pirogues */}
      {[
        { x: 590, y: 1300, l: 420 },
        { x: 560, y: 1420, l: 480 },
      ].map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y + Math.sin(f * 0.08 + i) * 4}) rotate(${i ? 4 : -3})`}>
          <path d={`M 0 0 Q ${b.l * 0.5} 46 ${b.l} 0 L ${b.l - 30} 20 Q ${b.l * 0.5} 62 30 20 Z`} fill="#0B0705" />
          <path d={`M 0 0 Q ${b.l * 0.5} 46 ${b.l} 0`} stroke="rgba(255,190,110,0.45)" strokeWidth={3} fill="none" />
          <path d={`M 40 4 L ${b.l - 40} 4`} stroke="#1C120A" strokeWidth={4} />
        </g>
      ))}
    </svg>
    <Lantern x={830} y={1062} s={0.55} power={power} seed="ld" />
  </AbsoluteFill>
);

/* ---------- Enveloppe à cachet de cire ---------- */

export const Envelope: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 0.62;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.6))" }}>
      <defs>
        <linearGradient id="env-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F4E8CF" />
          <stop offset="1" stopColor="#CDB894" />
        </linearGradient>
        <radialGradient id="wax-g" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#E07A55" />
          <stop offset="0.6" stopColor={SB.terra} />
          <stop offset="1" stopColor="#6E2414" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} rx={6} fill="url(#env-g)" />
      <path d={`M 0 ${h} L ${w * 0.5} ${h * 0.45} L ${w} ${h}`} stroke="rgba(120,90,50,0.35)" strokeWidth={3} fill="none" />
      <path d={`M 0 0 L ${w * 0.5} ${h * 0.55} L ${w} 0 Z`} fill="#E6D6B6" stroke="rgba(120,90,50,0.4)" strokeWidth={3} />
      <path d={`M 0 0 L ${w * 0.5} ${h * 0.55} L ${w} 0`} stroke="rgba(255,255,255,0.5)" strokeWidth={2} fill="none" transform="translate(0 -3)" />
      <g transform={`translate(${w * 0.5} ${h * 0.53})`}>
        <path d={Array.from({ length: 18 }).map((_, i) => { const a = (i / 18) * Math.PI * 2; const r = w * 0.085 * (1 + (random(`wx${i}`) - 0.5) * 0.18); return `${i ? "L" : "M"} ${Math.cos(a) * r} ${Math.sin(a) * r}`; }).join(" ") + " Z"} fill="url(#wax-g)" />
        <circle r={w * 0.058} fill="none" stroke="rgba(60,16,8,0.6)" strokeWidth={3} />
        <circle r={w * 0.045} fill="rgba(110,36,20,0.35)" />
        <ellipse cx={-w * 0.03} cy={-w * 0.035} rx={w * 0.025} ry={w * 0.012} fill="rgba(255,220,200,0.6)" transform={`rotate(-30 ${-w * 0.03} ${-w * 0.035})`} />
      </g>
      <rect x={0} y={0} width={w} height={h} rx={6} fill="none" stroke="rgba(90,60,30,0.4)" strokeWidth={2} />
    </svg>
  );
};

/* ---------- Main gantée (vue du dos de la main, poignet en haut) ; close : 0 ouverte → 1 refermée ---------- */

const fingerPath = (l: number, wb: number, wt: number) => `M ${-wb / 2} 0 C ${-wb / 2} ${l * 0.4} ${-wt / 2} ${l * 0.7} ${-wt / 2} ${l - wt / 2} Q 0 ${l + wt * 0.35} ${wt / 2} ${l - wt / 2} C ${wt / 2} ${l * 0.7} ${wb / 2} ${l * 0.4} ${wb / 2} 0 Z`;

export const GlovedHand: React.FC<{ close: number }> = ({ close }) => {
  const fingers = [
    { x: -70, l: 150, a: 8 },
    { x: -24, l: 178, a: 2 },
    { x: 22, l: 170, a: -2 },
    { x: 66, l: 136, a: -9 },
  ];
  return (
    <svg width={520} height={900} viewBox="-260 -430 520 900" style={{ overflow: "visible", filter: "drop-shadow(-5px 0 0 rgba(170,190,210,0.55)) drop-shadow(0 30px 40px rgba(0,0,0,0.7))" }}>
      <defs>
        <radialGradient id="glove-g" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#56677A" />
          <stop offset="0.35" stopColor="#2E3A48" />
          <stop offset="1" stopColor="#0E141B" />
        </radialGradient>
        <linearGradient id="fing-g" x1="0" x2="1">
          <stop offset="0" stopColor="#4A5A6C" />
          <stop offset="0.4" stopColor="#2A3542" />
          <stop offset="1" stopColor="#0E141B" />
        </linearGradient>
        <linearGradient id="sleeve-g" x1="0" x2="1">
          <stop offset="0" stopColor="#34414F" />
          <stop offset="0.5" stopColor="#1C2531" />
          <stop offset="1" stopColor="#0A0F15" />
        </linearGradient>
      </defs>
      {/* manche d'uniforme */}
      <path d="M -170 -430 L 170 -430 L 140 -90 L -140 -90 Z" fill="url(#sleeve-g)" />
      <path d="M -120 -400 Q -100 -250 -118 -110 M 60 -420 Q 90 -260 70 -110 M -20 -380 Q -10 -300 -30 -200" stroke="rgba(0,0,0,0.45)" strokeWidth={6} fill="none" />
      <path d="M -150 -420 Q -130 -260 -140 -100" stroke="rgba(170,190,210,0.25)" strokeWidth={4} fill="none" />
      {/* gantelet évasé */}
      <path d="M -150 -120 Q 0 -146 150 -120 L 116 10 Q 0 26 -116 10 Z" fill="url(#glove-g)" />
      <path d="M -150 -120 Q 0 -146 150 -120" stroke="rgba(200,215,230,0.55)" strokeWidth={4} fill="none" />
      <path d="M -132 -60 Q 0 -80 132 -60" stroke="rgba(200,215,230,0.3)" strokeWidth={2.5} strokeDasharray="8 7" fill="none" />
      {[-60, 30].map((x) => (
        <g key={x}>
          <circle cx={x} cy={-92} r={12} fill="#9AA6B2" />
          <circle cx={x - 4} cy={-96} r={4} fill="#F1F4F7" />
        </g>
      ))}
      {/* doigts (derrière le dos de la main) */}
      {fingers.map((fi, i) => {
        const a = fi.a * (1 - close);
        const fold = 1 - 0.6 * close;
        return (
          <g key={i} transform={`translate(${fi.x} 175) rotate(${a})`}>
            <g transform={`scale(1 ${fold})`}>
              <path d={fingerPath(fi.l, 48, 38)} fill="url(#fing-g)" />
              <path d={`M -16 ${fi.l * 0.45} Q 0 ${fi.l * 0.5} 16 ${fi.l * 0.45}`} stroke="rgba(0,0,0,0.45)" strokeWidth={3} fill="none" />
              <path d={`M -10 10 L -12 ${fi.l * 0.8}`} stroke="rgba(180,200,220,0.28)" strokeWidth={3} fill="none" />
            </g>
            <ellipse cx={0} cy={fi.l * fold - 10} rx={18} ry={10 * (1 - close * 0.5)} fill={`rgba(150,170,190,${0.25 + 0.35 * close})`} />
          </g>
        );
      })}
      {/* dos de la main */}
      <path d="M -112 -10 C -128 70 -120 150 -98 200 C -40 226 40 226 100 196 C 118 140 122 60 110 -10 Q 0 6 -112 -10 Z" fill="url(#glove-g)" />
      {[-62, -6, 46].map((x) => (
        <path key={x} d={`M ${x} 20 Q ${x + 4} 100 ${x + 8} 176`} stroke="rgba(190,205,220,0.35)" strokeWidth={2.5} strokeDasharray="7 6" fill="none" />
      ))}
      {fingers.map((fi) => (
        <ellipse key={fi.x} cx={fi.x} cy={186} rx={24} ry={12} fill="rgba(140,160,180,0.35)" />
      ))}
      {/* pouce */}
      <g transform={`translate(-104 60) rotate(${38 - 30 * close})`}>
        <path d={fingerPath(150, 54, 42)} fill="url(#fing-g)" />
        <path d="M -8 20 L -10 120" stroke="rgba(180,200,220,0.3)" strokeWidth={3} />
      </g>
    </svg>
  );
};

/* ---------- Mouchoir blanc qui flotte (bandes ombrées selon les plis) ---------- */

export const Handkerchief: React.FC<{ f: number; size: number }> = ({ f, size }) => {
  const NU = 22;
  const NV = 12;
  const ph = (u: number, v: number) => (u + v) * 3.6 - f * 0.22;
  const pt = (u: number, v: number): [number, number] => {
    const r = Math.min(1, Math.hypot(u, v) / 1.2);
    const wave = Math.sin(ph(u, v)) * 70 * r + Math.sin(u * 7 - f * 0.31 + v * 3) * 14 * r;
    const sag = u * v * 120 + v * v * 40;
    return [u * size * 0.95 + Math.cos(ph(u, v)) * 26 * r - v * 60, v * size * 0.82 + wave + sag + u * 40];
  };
  const strips = Array.from({ length: NU }).map((_, i) => {
    const u0 = i / NU;
    const u1 = (i + 1) / NU;
    const left = Array.from({ length: NV + 1 }).map((__, k) => pt(u0, k / NV));
    const right = Array.from({ length: NV + 1 }).map((__, k) => pt(u1, (NV - k) / NV));
    const d = `M ${[...left, ...right].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
    const shade = Math.cos(ph((u0 + u1) / 2, 0.5));
    const l = 222 + Math.round(32 * shade);
    return { d, fill: `rgb(${l},${l - 4},${l - 12})` };
  });
  const edge = (fixed: "u" | "v", val: number, rev = false) =>
    Array.from({ length: NU + 1 })
      .map((_, i) => {
        const t = rev ? 1 - i / NU : i / NU;
        const [x, y] = fixed === "u" ? pt(val, t) : pt(t, val);
        return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  const outline = `M ${pt(0, 0).join(" ")} ${edge("v", 0)} ${edge("u", 1)} ${edge("v", 1, true)} ${edge("u", 0, true)} Z`;
  return (
    <svg width={size * 1.3} height={size * 1.3} viewBox={`-60 -80 ${size * 1.3} ${size * 1.3}`} style={{ overflow: "visible", filter: "drop-shadow(0 30px 40px rgba(60,30,10,0.45))" }}>
      <defs>
        <linearGradient id="hk-sh" x1="0" y1="0" x2="1" y2="0.45">
          {strips.map((st, i) => (
            <stop key={i} offset={i / (strips.length - 1)} stopColor={st.fill} />
          ))}
        </linearGradient>
      </defs>
      <path d={outline} fill="url(#hk-sh)" />
      {[0.22, 0.45, 0.68, 0.88].map((u, k) => {
        const pts = Array.from({ length: NV + 1 }).map((__, i) => pt(u + Math.sin(i * 0.5 + k) * 0.02, i / NV));
        const dark = Math.cos(ph(u, 0.5)) < 0;
        return <path key={k} d={`M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")}`} stroke={dark ? "rgba(120,96,70,0.28)" : "rgba(255,255,255,0.75)"} strokeWidth={dark ? 16 : 8} fill="none" strokeLinecap="round" style={{ filter: "blur(7px)" }} />;
      })}
      <path d={outline} fill="none" stroke="rgba(170,150,125,0.75)" strokeWidth={5} />
      <path d={outline} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} transform="translate(-2 -2)" />
      <circle cx={pt(0, 0)[0]} cy={pt(0, 0)[1]} r={10} fill="#E8E2D8" />
    </svg>
  );
};


/* ---------- Colline, statue et lumières de la ville ---------- */

export const StatueHill: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "linear-gradient(180deg, #1A0F14 0%, #4A2228 22%, #B3582E 48%, #F0B260 62%, #FCE0A0 68%, #2A1610 70%, #0B0806 100%)" }}>
    <div style={{ position: "absolute", left: 540 - 420, top: 760 - 420, width: 840, height: 840, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,236,190,0.95) 0%, rgba(255,200,120,0.5) 22%, rgba(240,160,70,0) 62%)" }} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {[
        { r: 300, sp: 0.3, d: "6 22" },
        { r: 380, sp: -0.2, d: "120 40 10 40" },
      ].map((g, i) => (
        <circle key={i} cx={540} cy={640} r={g.r} fill="none" stroke="rgba(255,226,166,0.55)" strokeWidth={3} strokeDasharray={g.d} transform={`rotate(${f * g.sp} 540 640)`} />
      ))}
      <g transform="translate(0 120)">
      <path d="M -40 1340 Q 200 1120 420 1080 Q 540 1060 660 1080 Q 880 1120 1120 1340 L 1120 1920 L -40 1920 Z" fill="#0E0805" />
      <path d="M -40 1340 Q 200 1120 420 1080 Q 540 1060 660 1080 Q 880 1120 1120 1340" stroke="rgba(255,200,120,0.6)" strokeWidth={4} fill="none" />
      {/* socle */}
      <path d="M 450 1080 L 630 1080 L 610 1000 L 470 1000 Z" fill="#0A0604" />
      <rect x={480} y={968} width={120} height={34} fill="#0A0604" />
      <path d="M 450 1080 L 470 1000 L 610 1000" stroke="rgba(255,210,140,0.7)" strokeWidth={3} fill="none" />
      </g>
    </svg>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", filter: "drop-shadow(-4px -2px 0 rgba(255,214,140,0.9)) drop-shadow(0 0 14px rgba(255,190,100,0.6))" }}>
      <g transform="translate(540 1090) scale(0.66)">
        <Figure kind="statue" p={0} base="#0A0604" detail="#20140C" />
      </g>
    </svg>
    {/* lumières de la ville en contrebas */}
    {Array.from({ length: 70 }).map((_, i) => {
      const x = random(`cl${i}`) * W;
      const y = 1470 + random(`cy${i}`) * 260;
      const o = 0.5 + 0.5 * Math.sin(f * 0.15 + i * 1.7);
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: 6, height: 6, borderRadius: 3, background: i % 4 ? "#FFC870" : "#FFE9C0", opacity: 0.35 + 0.5 * o, boxShadow: "0 0 10px #FFB050" }} />;
    })}
  </AbsoluteFill>
);

/** Petit texte de mention, sur pastille sombre. */
export const Note: React.FC<{ text: string; y: number; opacity?: number; size?: number }> = ({ text, y, opacity = 1, size = 30 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", justifyContent: "center", opacity }}>
    <div style={{ background: "rgba(8,6,4,0.66)", borderRadius: 30, padding: "8px 26px", fontFamily: manrope, fontWeight: 700, fontSize: size, color: "rgba(255,244,224,0.9)", textAlign: "center" }}>{text}</div>
  </div>
);
