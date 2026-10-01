/**
 * Kit visuel des vidéos « récit » AFROBACK (30 s, 9:16), extrait de la vidéo 2 (Ngan Medza).
 * Réutilisé par l'agent afroback-video : nuit, brume, flamme, braises, caméra virtuelle
 * sur une illustration, légendes, eau, yeux, marcheurs, fin « suite sur AFROBACK ».
 */
import React from "react";
import { AbsoluteFill, Easing, Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, H, W, cinzel, manrope, ramp, s, popScale } from "./theme";
import { Diamonds, LetterDrop, PunchWord } from "./fx";
import { Phone } from "./phone";

export const N = {
  night: "#0A0F14",
  night2: "#111A24",
  fog: "159,179,192",
  flame: "#FF9A3C",
};
export const ease = Easing.inOut(Easing.cubic);
/* ---------- Ambiance commune ---------- */

export const Night: React.FC<{ glow?: string }> = ({ glow = "rgba(240,160,70,0.10)" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${glow} 0%, ${N.night2} 40%, ${N.night} 80%)` }} />
);

export const Fog: React.FC<{ opacity?: number; y?: number }> = ({ opacity = 1, y = 1100 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => {
        const x = ((frame * (0.6 + i * 0.35) + i * 400) % 1800) - 500;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y - 200 + i * 170,
              width: 900,
              height: 260,
              borderRadius: "50%",
              background: `rgba(${N.fog},${0.1 + (i % 2) * 0.05})`,
              filter: "blur(60px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Vig: React.FC<{ strength?: number }> = ({ strength = 0.85 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${strength}) 100%)` }} />
);

/** Flamme animée (dessin vectoriel), ancrée par sa base. */
export const Flame: React.FC<{ x: number; y: number; size: number; power?: number; seed?: string }> = ({ x, y, size, power = 1, seed = "f" }) => {
  const frame = useCurrentFrame();
  const r0 = random(seed) * 10;
  const w1 = Math.sin(frame * 0.55 + r0) * 0.08 + Math.sin(frame * 1.3 + r0) * 0.05;
  const h = size * (0.9 + 0.12 * Math.sin(frame * 0.9 + r0)) * power;
  const wdt = size * 0.42 * (0.85 + 0.15 * power);
  const tip = (k: number) => `M ${-wdt * k} 0 C ${-wdt * k} ${-h * 0.45 * k}, ${w1 * size - wdt * 0.2 * k} ${-h * 0.6 * k}, ${w1 * size * 1.6} ${-h * k} C ${w1 * size + wdt * 0.25 * k} ${-h * 0.6 * k}, ${wdt * k} ${-h * 0.4 * k}, ${wdt * k} 0 Z`;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute",
          left: -size * 2.2,
          top: -size * 2.6,
          width: size * 4.4,
          height: size * 4.4,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,170,70,${0.45 * power}) 0%, rgba(255,120,30,${0.15 * power}) 35%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <svg width={size * 2} height={size * 2} viewBox={`${-size} ${-size * 1.6} ${size * 2} ${size * 2}`} style={{ position: "absolute", left: -size, top: -size * 1.6, overflow: "visible" }}>
        <path d={tip(1)} fill={N.flame} opacity={0.85 * Math.min(1, power + 0.2)} />
        <path d={tip(0.68)} fill="#FFC861" />
        <path d={tip(0.36)} fill="#FFF1C4" />
      </svg>
    </div>
  );
};

/** Braises qui montent d'un point. */
export const Embers: React.FC<{ x: number; y: number; count?: number; spread?: number; power?: number }> = ({ x, y, count = 18, spread = 80, power = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const life = 40 + random(`el${i}`) * 30;
        const t = (frame + random(`eo${i}`) * life) % life;
        const px = x + (random(`ex${i}`) - 0.5) * spread + Math.sin((frame + i * 9) * 0.15) * 14;
        const py = y - t * (5 + random(`ev${i}`) * 4);
        const o = (1 - t / life) * power;
        const sz = 4 + random(`es${i}`) * 6;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: sz, height: sz, borderRadius: sz, background: "#FFC861", opacity: o, boxShadow: "0 0 10px #FF9A3C" }} />;
      })}
    </>
  );
};

/** Illustration (carrée) filmée par une caméra virtuelle (cx, cy : point visé, en fraction de l'image ; zoom 1 = image de 1920 px). */
export const Illu: React.FC<{ src: string; cx: number; cy: number; zoom: number; rot?: number; children?: React.ReactNode; dim?: number }> = ({ src, cx, cy, zoom, rot = 0, children, dim = 0 }) => {
  const S = H * zoom;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: W / 2 - cx * S, top: H / 2 - cy * S, width: S, height: S, transform: `rotate(${rot}deg)`, transformOrigin: `${cx * S}px ${cy * S}px` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%" }} />
        {children}
      </div>
      {dim > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} /> : null}
    </AbsoluteFill>
  );
};

/** Torches de l'illustration (positions en fraction de l'image). */
export const Caption: React.FC<{ text: string; at: number; y: number; size?: number; color?: string; italic?: boolean }> = ({ text, at, y, size = 46, color = C.ivory, italic }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = ramp(frame, at, 8, 0, 1);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: y,
        textAlign: "center",
        fontFamily: manrope,
        fontWeight: 700,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
        textShadow: "0 4px 18px rgba(0,0,0,0.9)",
      }}
    >
      {text}
    </div>
  );
};

export const Walker: React.FC<{ x: number; y: number; phase: number; kind: number; scale?: number }> = ({ x, y, phase, kind, scale = 1 }) => {
  const sw = Math.sin(phase) * 14;
  return (
    <svg width={60} height={120} viewBox="-30 -100 60 120" style={{ position: "absolute", left: x - 30 * scale, top: y - 100 * scale, transform: `scale(${scale})`, transformOrigin: "30px 100px", overflow: "visible" }}>
      <g fill={C.gold} stroke={C.gold} strokeLinecap="round">
        <circle cx={0} cy={-78} r={8} stroke="none" />
        <path d="M-7 -68 L7 -68 L9 -30 L-9 -30 Z" stroke="none" />
        <line x1={-4} y1={-30} x2={-4 + sw * 0.6} y2={0} strokeWidth={5} />
        <line x1={4} y1={-30} x2={4 - sw * 0.6} y2={0} strokeWidth={5} />
        {kind === 0 ? <line x1={12} y1={-95} x2={12} y2={-5} strokeWidth={3} /> : null}
        {kind === 1 ? <ellipse cx={0} cy={-92} rx={13} ry={5} stroke="none" /> : null}
        {kind === 2 ? <circle cx={-9} cy={-50} r={7} stroke="none" /> : null}
      </g>
    </svg>
  );
};

/** Position le long de la polyligne simplifiée (u de 0 à 1). */
export const Water: React.FC<{ dark?: number }> = ({ dark = 0 }) => {
  const frame = useCurrentFrame();
  const rows = 16;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1d2c38 0%,#0d1820 55%,#05090c 100%)" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: rows }).map((_, r) => {
          const y = 200 + r * 110;
          const amp = 10 + r * 2.2;
          const ph = frame * (0.12 + r * 0.004) + r;
          let d = `M -20 ${y}`;
          for (let x = -20; x <= W + 40; x += 40) d += ` L ${x} ${y + Math.sin(x * 0.012 + ph) * amp + Math.sin(x * 0.031 - ph * 1.3) * amp * 0.4}`;
          return <path key={r} d={d} fill="none" stroke={`rgba(190,215,230,${0.08 + (r / rows) * 0.18})`} strokeWidth={2 + r * 0.25} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${dark})` }} />
    </AbsoluteFill>
  );
};

export const SinkLetters: React.FC<{ text: string; at: number; size: number }> = ({ text, at, size }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "center", fontFamily: cinzel, fontWeight: 700, fontSize: size, color: "#BFD7E6" }}>
      {text.split("").map((ch, i) => {
        const st = at + i * 1.2;
        const o = frame < st ? 0 : ramp(frame, st, 4, 0, 1);
        const sink = frame < st ? 0 : ramp(frame, st + 10, 30, 0, 60, Easing.in(Easing.quad));
        const bob = Math.sin((frame - st) * 0.25 + i) * 6;
        return (
          <span key={i} style={{ display: "inline-block", opacity: o * (1 - sink / 120), transform: `translateY(${sink + bob}px)`, filter: `blur(${sink / 25}px)`, textShadow: "0 6px 20px rgba(0,0,0,0.9)" }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const Eye: React.FC<{ x: number; y: number; open: number; frame: number }> = ({ x, y, open, frame }) => (
  <div style={{ position: "absolute", left: x - 110, top: y - 60, width: 220, height: 120 }}>
    <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: `radial-gradient(circle, rgba(240,195,107,${0.35 * open}) 0%, rgba(0,0,0,0) 65%)` }} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, #FFF1C4 0%, #F0C36B 35%, #B8741F 75%, #5a3408 100%)",
        transform: `scaleY(${open})`,
        boxShadow: "0 0 40px rgba(240,195,107,0.8)",
      }}
    >
      <div style={{ position: "absolute", left: 110 - 9 + Math.sin(frame * 0.08) * 6, top: 6, width: 18, height: 108, borderRadius: 9, background: "#0a0603" }} />
    </div>
  </div>
);

/**
 * Fin « la suite sur AFROBACK » (3,5 s) : téléphone avec une vraie capture de l'app,
 * bouton qui pulse, puis médaillon + AFROBACK + afroback.app.
 * capture : image 390 × 844 (×3) dans public/img ; buttonY : ordonnée du bouton à faire pulser (écran 390 × 844).
 */

export const OutroApp: React.FC<{ capture: string; buttonY: number; line1?: string; line2?: string }> = ({ capture, buttonY, line1 = "ÉCOUTE", line2 = "LA LÉGENDE ENTIÈRE" }) => {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 16, 0, 1, Easing.out(Easing.back(1.2)));
  const leave = ramp(frame, 46, 12, 0, 1, Easing.in(Easing.cubic));
  const pose = { x: 540, y: 1180 + (1 - rise) * 1100 + leave * 1300, scale: 1.55, rotate: (1 - rise) * 10 };
  const bx = pose.x + (195 - 195) * pose.scale;
  const by = pose.y + (buttonY - 422) * pose.scale;
  const pulse = frame >= 20 && frame < 50 ? ((frame - 20) % 15) / 15 : -1;
  const logoAt = 52;
  return (
    <AbsoluteFill>
      <Night glow="rgba(240,195,107,0.16)" />
      <Diamonds id="m8" size={110} opacity={0.05} />
      <Fog y={1500} opacity={0.4} />
      {leave < 1 ? (
        <>
          <Phone pose={pose}>
            <Img src={staticFile(capture)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Phone>
          {pulse >= 0 ? (
            <div style={{ position: "absolute", left: bx - 200, top: by - 50, width: 400, height: 100, borderRadius: 60, border: `5px solid ${C.gold}`, opacity: 1 - pulse, transform: `scale(${1 + pulse * 0.35})` }} />
          ) : null}
        </>
      ) : null}
      {frame < 50 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
          <PunchWord text={line1} at={6} size={100} color={C.ivory} />
          <div style={{ height: 12 }} />
          <PunchWord text={line2} at={14} size={70} />
        </AbsoluteFill>
      ) : null}
      {frame >= logoAt ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 200 }}>
          <div style={{ transform: `scale(${popScale(frame, logoAt, 10, 1.25)})`, width: 330, height: 330, borderRadius: 165, overflow: "hidden", border: `5px solid ${C.gold}`, boxShadow: "0 0 90px rgba(240,195,107,0.55)" }}>
            <Img src={staticFile("img/logo-medaillon.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ height: 50 }} />
          <LetterDrop text="AFROBACK" at={logoAt + 6} size={120} />
          <div style={{ height: 30 }} />
          <LetterDrop text="afroback.app" at={logoAt + 22} size={60} family={manrope} weight={800} color={C.ivory} colorFrom={{ index: 8, color: C.gold }} stagger={0.6} />
        </AbsoluteFill>
      ) : null}
      <Vig strength={0.6} />
    </AbsoluteFill>
  );
};


/** Sous-titres karaoké : [mot, seconde]. */
export const w = (list: [string, number][]) => list.map(([word, t]) => ({ w: word, at: s(t) }));
