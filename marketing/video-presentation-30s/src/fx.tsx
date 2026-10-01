import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, W, H, cinzel, manrope, punchScale, ramp } from "./theme";

/* ---------- Secousse de caméra ---------- */

export type Hit = { at: number; amp?: number; dur?: number };

export const shakeOffset = (frame: number, hits: Hit[]) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const dur = h.dur ?? 2;
    const amp = h.amp ?? 8;
    if (frame >= h.at && frame < h.at + dur) {
      const k = 1 - (frame - h.at) / dur;
      x += (random(`sx${h.at}-${frame}`) * 2 - 1) * amp * k;
      y += (random(`sy${h.at}-${frame}`) * 2 - 1) * amp * k;
    }
  }
  return { x, y };
};

export const Shake: React.FC<{ hits: Hit[]; children: React.ReactNode }> = ({
  hits,
  children,
}) => {
  const frame = useCurrentFrame();
  const { x, y } = shakeOffset(frame, hits);
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Fond : brun chaud, halo, frise qui dérive ---------- */

export const Diamonds: React.FC<{ id: string; size?: number; opacity?: number; color?: string }> = ({
  id,
  size = 90,
  opacity = 0.08,
  color = C.gold,
}) => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity }}>
    <defs>
      <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
        <path
          d={`M${size / 2} 4 L${size - 4} ${size / 2} L${size / 2} ${size - 4} L4 ${size / 2} Z`}
          fill="none"
          stroke={color}
          strokeWidth={3}
        />
        <path
          d={`M${size / 2} ${size * 0.3} L${size * 0.7} ${size / 2} L${size / 2} ${size * 0.7} L${size * 0.3} ${size / 2} Z`}
          fill={color}
        />
        <path d={`M0 0 L${size / 4} ${size / 8} L0 ${size / 4}`} fill="none" stroke={color} strokeWidth={2} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>
);

export const Background: React.FC<{ tint?: string }> = ({ tint }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, ${tint ?? "#3a2410"} 0%, ${C.brown} 38%, ${C.black} 75%)`,
        }}
      />
      <AbsoluteFill style={{ transform: `translateY(${-(frame * 1.2) % 90}px)`, height: H + 90 }}>
        <Diamonds id="bgd" opacity={0.06} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ gold?: boolean }> = ({ gold }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: gold
        ? "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(120,70,10,0.35) 75%, rgba(0,0,0,0.85) 100%)"
        : "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)",
    }}
  />
);

/** Grain de film léger (bruit déterministe par image). */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 6;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
      <filter id={`grain${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
    </svg>
  );
};

/* ---------- Éclat doré (2 images, ≤ 30 %) ---------- */

export const Flash: React.FC<{ at: number[]; opacity?: number }> = ({ at, opacity = 0.28 }) => {
  const frame = useCurrentFrame();
  const on = at.some((a) => frame >= a && frame < a + 2);
  if (!on) return null;
  return <AbsoluteFill style={{ backgroundColor: C.gold, opacity, mixBlendMode: "screen" }} />;
};

/* ---------- Balayage « wipe motif » (frise africaine) ---------- */

export const MotifWipe: React.FC<{ at: number; dur?: number; angle?: number }> = ({
  at,
  dur = 8,
  angle = -30,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const p = (frame - at) / dur;
  const x = -1600 + p * 3200;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: W / 2 - 300 + x,
          top: -600,
          width: 600,
          height: H + 1200,
          transform: `rotate(${angle}deg)`,
          background: `linear-gradient(90deg, rgba(240,195,107,0) 0%, rgba(240,195,107,0.9) 30%, #F7D98B 50%, rgba(240,195,107,0.9) 70%, rgba(240,195,107,0) 100%)`,
          overflow: "hidden",
          filter: "blur(1px)",
        }}
      >
        <Diamonds id={`wipe${at}`} size={70} opacity={0.9} color={C.black} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Onde de choc + particules ---------- */

export const Shockwave: React.FC<{ at: number; x?: number; y?: number }> = ({
  at,
  x = W / 2,
  y = H / 2,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 16) return null;
  const r = ramp(frame, at, 16, 20, 1400);
  const o = ramp(frame, at, 16, 1, 0);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `${Math.max(4, 40 * o)}px solid ${C.gold}`,
        opacity: o,
        boxShadow: `0 0 80px ${C.gold}`,
      }}
    />
  );
};

export const Particles: React.FC<{ at: number; count?: number; x?: number; y?: number; seed?: string }> = ({
  at,
  count = 40,
  x = W / 2,
  y = H / 2,
  seed = "p",
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 30) return null;
  const t = frame - at;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = 25 + random(`${seed}v${i}`) * 55;
        const d = v * t * (1 - t / 60);
        const size = 6 + random(`${seed}s${i}`) * 16;
        const o = ramp(frame, at + 10, 20, 1, 0);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d - size / 2,
              top: y + Math.sin(a) * d - size / 2 + t * t * 0.4,
              width: size,
              height: size,
              transform: "rotate(45deg)",
              background: i % 3 === 0 ? C.ivory : C.gold,
              opacity: o,
              boxShadow: `0 0 12px ${C.gold}`,
            }}
          />
        );
      })}
    </>
  );
};

/* ---------- Mot qui percute ---------- */

export const PunchWord: React.FC<{
  text: string;
  at: number;
  size?: number;
  color?: string;
  shine?: [number, number];
  style?: React.CSSProperties;
}> = ({ text, at, size = 150, color = C.gold, shine, style }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const sc = punchScale(frame, at);
  const blur = frame - at < 3 ? 6 - (frame - at) * 2 : 0;
  const shinePos = shine ? ramp(frame, shine[0], shine[1] - shine[0], -60, 160) : -100;
  return (
    <div
      style={{
        fontFamily: cinzel,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: size * 0.02,
        color,
        textAlign: "center",
        transform: `scale(${sc})`,
        filter: `blur(${blur}px) drop-shadow(0 8px 30px rgba(0,0,0,0.85))`,
        position: "relative",
        ...style,
      }}
    >
      {text}
      {shine ? (
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(100deg, transparent ${shinePos - 12}%, rgba(255,255,255,0.95) ${shinePos}%, transparent ${shinePos + 12}%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {text}
        </span>
      ) : null}
    </div>
  );
};

/* ---------- Lettres qui claquent une par une ---------- */

export const LetterDrop: React.FC<{
  text: string;
  at: number;
  size: number;
  family?: string;
  weight?: number;
  color?: string;
  stagger?: number;
  colorFrom?: { index: number; color: string };
}> = ({ text, at, size, family = cinzel, weight = 900, color = C.gold, stagger = 0.75, colorFrom }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "center", fontFamily: family, fontWeight: weight, fontSize: size, lineHeight: 1.05 }}>
      {text.split("").map((ch, i) => {
        const st = at + i * stagger;
        const y = frame < st ? -140 : ramp(frame, st, 6, -140, 0, (t) => 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.12);
        const o = frame < st ? 0 : ramp(frame, st, 2, 0, 1);
        const c = colorFrom && i >= colorFrom.index ? colorFrom.color : color;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity: o,
              color: c,
              whiteSpace: "pre",
              textShadow: "0 6px 24px rgba(0,0,0,0.7)",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Doigt (cercle blanc + onde) ---------- */

export const Tap: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  if (frame < at - 5 || frame > at + 10) return null;
  const approach = ramp(frame, at - 5, 5, 1.5, 1);
  const inO = ramp(frame, at - 5, 4, 0, 0.6);
  const outO = ramp(frame, at + 4, 6, 1, 0);
  const ring = frame >= at ? ramp(frame, at, 9, 1, 2.6) : 0;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 30,
          top: y - 30,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: "white",
          opacity: inO * outO,
          transform: `scale(${frame >= at && frame < at + 3 ? 0.8 : approach})`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      />
      {ring > 0 ? (
        <div
          style={{
            position: "absolute",
            left: x - 30,
            top: y - 30,
            width: 60,
            height: 60,
            borderRadius: 30,
            border: "4px solid white",
            opacity: ramp(frame, at, 9, 0.8, 0),
            transform: `scale(${ring})`,
          }}
        />
      ) : null}
    </>
  );
};

/** Sous-titre façon karaoké : 2 à 3 mots, le mot courant passe en or. */
export const Karaoke: React.FC<{ words: { w: string; at: number }[]; end: number }> = ({ words, end }) => {
  const frame = useCurrentFrame();
  if (frame < words[0].at || frame >= end) return null;
  // regroupe par paquets de 3 mots
  const groups: { w: string; at: number }[][] = [];
  for (let i = 0; i < words.length; i += 3) groups.push(words.slice(i, i + 3));
  const g = [...groups].reverse().find((gr) => frame >= gr[0].at) ?? groups[0];
  const current = [...g].reverse().find((x) => frame >= x.at);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 420,
        textAlign: "center",
        fontFamily: manrope,
        fontWeight: 800,
        fontSize: 52,
        color: C.ivory,
        textShadow: "0 4px 14px rgba(0,0,0,0.6), 0 0 4px rgba(0,0,0,0.6)",
      }}
    >
      {g.map((x) => (
        <span key={x.w + x.at} style={{ color: x === current ? C.gold : C.ivory, marginRight: 16 }}>
          {x.w}
        </span>
      ))}
    </div>
  );
};
