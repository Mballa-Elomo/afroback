/**
 * Démo de prospection Kiro'o Games · « Le jour du couronnement » : AURION (59 s, 9:16).
 * Script : recits/aurion-kiroo/script.md · voix : C:\Users\Yannico\Downloads\ORION\Voix off (10 répliques)
 * Mixage : recits/aurion-kiroo/config-audio.json → public/audio/mix-aurion-kiroo-59s.wav
 * Musique : Baobab Oath (1) à partir de 121,3 s (silence du morceau à 27,0 s, gros impact à 30,75 s).
 * Illustrations : © Kiro'o Games (fournies par Yannick, public/img/aurion/).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, W, cinzel, manrope, ramp, s, popScale } from "../theme";
import { Grain, Karaoke, PunchWord, LetterDrop, shakeOffset, Hit } from "../fx";
import { Fog, w } from "../recit-kit";

/* ---------- Palette ---------- */
const K = {
  noir: "#0A0706",
  rouge: "#C8281E",
  rougeVif: "#FF3B2E",
  or: "#F0C36B",
  braise: "#FF7A2A",
  ivoire: "#FFF4E0",
};

/* ---------- Images ---------- */
type Im = { src: string; w: number; h: number };
const IMG: Record<string, Im> = {
  A: { src: "img/aurion/a-couronnement-2x.jpg", w: 720, h: 1019 },
  B: { src: "img/aurion/b-duo-flammes-2x.jpg", w: 764, h: 1080 },
  C: { src: "img/aurion/c-comic-2x.jpg", w: 700, h: 1000 },
  D: { src: "img/aurion/d-enzo-armure-2x.jpg", w: 1215, h: 812 },
  E: { src: "img/aurion/e-couple-3d-2x.jpg", w: 500, h: 301 },
  F: { src: "img/aurion/f-saut-aura-2x.jpg", w: 554, h: 554 },
};
const CUT: Record<string, string> = {
  B: "img/aurion/b-duo-flammes-detoure.png",
  C: "img/aurion/c-comic-detoure.png",
  D: "img/aurion/d-enzo-armure-detoure.png",
};
const USE_CUTOUTS = false;

const lerp = (u: number, a: number, b: number) => a + (b - a) * u;
const io = Easing.inOut(Easing.cubic);
const snap = Easing.out(Easing.exp);

/** Filtres SVG partagés (séparation RVB, flou directionnel). */
const Defs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="chR" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="chG" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="chB" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
      </filter>
    </defs>
  </svg>
);

/**
 * Caméra virtuelle sur une image de proportions quelconques.
 * cx, cy : point visé (fraction de l'image) ; z = 1 : l'image couvre juste l'écran.
 * Les enfants sont dessinés dans le repère de l'image (SVG viewBox en pixels d'origine).
 */
const Pic: React.FC<{
  im: Im;
  cx: number;
  cy: number;
  z?: number;
  rot?: number;
  dx?: number;
  dy?: number;
  filter?: string;
  src?: string;
  clamp?: boolean;
  children?: React.ReactNode;
}> = ({ im, cx, cy, z = 1, rot = 0, dx = 0, dy = 0, filter, src, clamp = true, children }) => {
  const cover = Math.max(W / im.w, H / im.h);
  const dw = im.w * cover * z;
  const dh = im.h * cover * z;
  let left = W / 2 - cx * dw + dx;
  let top = H / 2 - cy * dh + dy;
  if (clamp) {
    left = Math.min(0, Math.max(W - dw, left));
    top = Math.min(0, Math.max(H - dh, top));
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left, top, width: dw, height: dh, transform: `rotate(${rot}deg)`, transformOrigin: `${W / 2 - left}px ${H / 2 - top}px`, filter }}>
        <Img src={staticFile(src ?? im.src)} style={{ width: "100%", height: "100%", display: "block" }} />
        {children ? (
          <svg viewBox={`0 0 ${im.w} ${im.h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {children}
          </svg>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Plan en couches (parallaxe 2,5D) : fond flou qui bouge peu, personnages détourés qui bougent plus,
 * braises devant et derrière. px : décalage horizontal de la caméra (en px) qui pilote la parallaxe.
 */
const Layered: React.FC<{ k: "B" | "C" | "D"; cx: number; cy: number; z: number; px?: number; py?: number; rot?: number; filter?: string; children?: React.ReactNode }> = ({
  k,
  cx,
  cy,
  z,
  px = 0,
  py = 0,
  rot = 0,
  filter,
  children,
}) => {
  const im = IMG[k];
  return (
    <AbsoluteFill>
      <Pic im={im} cx={cx} cy={cy} z={z * 1.06} dx={px * 0.35} dy={py * 0.35} rot={rot} filter={`${USE_CUTOUTS ? "blur(5px) brightness(0.8)" : ""} ${filter ?? ""}`}>
        {children}
      </Pic>
      {USE_CUTOUTS ? <Pic im={im} src={CUT[k]} cx={cx} cy={cy} z={z} dx={px} dy={py} rot={rot} filter={`drop-shadow(0 20px 40px rgba(0,0,0,0.55)) ${filter ?? ""}`} /> : null}
    </AbsoluteFill>
  );
};

/** Particules en profondeur : depth < 1 = loin (petites, nettes, lentes), > 1 = près (grosses, floues, rapides). */
const Motes: React.FC<{ n?: number; depth: number; seed: string; color?: string; glow?: string; px?: number; rise?: number; opacity?: number; spin?: number }> = ({
  n = 26,
  depth,
  seed,
  color = "#FFC861",
  glow = "#FF7A2A",
  px = 0,
  rise = 1,
  opacity = 1,
  spin = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {Array.from({ length: n }).map((_, i) => {
        const r = (k: string) => random(`${seed}${k}${i}`);
        const speed = (1.5 + r("v") * 3) * depth * rise;
        const y0 = r("y") * (H + 300);
        const y = ((y0 - frame * speed) % (H + 300) + (H + 300)) % (H + 300) - 150;
        const x0 = r("x") * (W + 200) - 100;
        const sway = Math.sin(frame * 0.05 + i) * 30 * depth + spin * Math.sin(frame * 0.08 + i * 2) * 60;
        const x = ((x0 + px * depth + sway) % (W + 200) + (W + 200)) % (W + 200) - 100;
        const size = (3 + r("s") * 5) * depth * (depth > 1 ? 1.6 : 1);
        const blur = depth > 1.2 ? (depth - 1) * 4 : 0;
        const flick = 0.55 + 0.45 * Math.sin(frame * (0.2 + r("f") * 0.3) + i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: size,
              background: color,
              opacity: flick,
              filter: blur ? `blur(${blur}px)` : undefined,
              boxShadow: `0 0 ${8 * depth}px ${glow}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Séparation RVB (aura rouge / glitch). amt en px ; slices : décalage de bandes horizontales. */
const Glitch: React.FC<{ amt: number; slices?: number; seed?: string; children: React.ReactNode }> = ({ amt, slices = 0, seed = "g", children }) => {
  const frame = useCurrentFrame();
  if (amt < 0.5 && slices < 0.5) return <>{children}</>;
  const layer = (f: string, x: number) => (
    <AbsoluteFill style={{ filter: `url(#${f})`, transform: `translateX(${x}px)`, mixBlendMode: "screen" }}>{children}</AbsoluteFill>
  );
  const rgb = (
    <AbsoluteFill style={{ backgroundColor: "#000", isolation: "isolate" }}>
      {layer("chR", -amt)}
      {layer("chG", 0)}
      {layer("chB", amt)}
    </AbsoluteFill>
  );
  if (slices < 0.5) return rgb;
  const bands = 7;
  return (
    <AbsoluteFill>
      {Array.from({ length: bands }).map((_, i) => {
        const t0 = (i / bands) * 100;
        const off = (random(`${seed}${i}-${Math.floor(frame / 2)}`) - 0.5) * 2 * slices;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${t0}% 0 ${100 - t0 - 100 / bands}% 0)`, transform: `translateX(${off}px)` }}>
            {rgb}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** Éclat lumineux (une seule montée, décroissance rapide). */
const FlashAt: React.FC<{ at: number; dur?: number; max?: number; color?: string }> = ({ at, dur = 9, max = 0.8, color = "#FFF1D0" }) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame > at + dur) return null;
  const o = frame < at ? ramp(frame, at - 2, 2, 0, max, Easing.linear) : ramp(frame, at, dur, max, 0, Easing.out(Easing.quad));
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

/** Onde de choc circulaire. */
const Ring: React.FC<{ at: number; x?: number; y?: number; color?: string; dur?: number }> = ({ at, x = W / 2, y = H / 2, color = K.or, dur = 18 }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const r = ramp(frame, at, dur, 30, 1500);
  const o = ramp(frame, at, dur, 1, 0);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `${Math.max(3, 34 * o)}px solid ${color}`,
        opacity: o,
        boxShadow: `0 0 90px ${color}, inset 0 0 60px ${color}`,
      }}
    />
  );
};

/** Éclats (fragments) projetés depuis un point. */
const Shards: React.FC<{ at: number; x?: number; y?: number; n?: number; seed?: string; color?: string; power?: number }> = ({
  at,
  x = W / 2,
  y = H / 2,
  n = 40,
  seed = "sh",
  color = K.or,
  power = 1,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 40) return null;
  const t = frame - at;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = (20 + random(`${seed}v${i}`) * 50) * power;
        const d = v * t * (1 - t / 80);
        const sz = 6 + random(`${seed}s${i}`) * 22;
        const o = ramp(frame, at + 12, 26, 1, 0);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d - sz / 2,
              top: y + Math.sin(a) * d - sz / 2 + t * t * 0.35,
              width: sz,
              height: sz * 0.5,
              transform: `rotate(${a * 57 + t * 20}deg)`,
              clipPath: "polygon(0 50%, 40% 0, 100% 30%, 70% 100%)",
              background: i % 3 === 0 ? K.ivoire : color,
              opacity: o,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

/** Rayons de lumière qui tournent (derrière un titre ou une aura). */
const Rays: React.FC<{ x?: number; y?: number; color?: string; o?: number; n?: number; spin?: number }> = ({ x = W / 2, y = H / 2, color = "240,195,107", o = 1, n = 14, spin = 0.4 }) => {
  const frame = useCurrentFrame();
  const stops: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360;
    stops.push(`rgba(${color},0) ${a}deg`, `rgba(${color},0.55) ${a + 360 / n / 4}deg`, `rgba(${color},0) ${a + 360 / n / 2}deg`);
  }
  return (
    <div
      style={{
        position: "absolute",
        left: x - 1400,
        top: y - 1400,
        width: 2800,
        height: 2800,
        borderRadius: "50%",
        background: `conic-gradient(from ${frame * spin}deg, ${stops.join(",")})`,
        WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0) 60%)",
        maskImage: "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0) 60%)",
        opacity: o,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

/** Vignette et voiles. */
const Vig: React.FC<{ k?: number; color?: string }> = ({ k = 0.85, color = "0,0,0" }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at center, rgba(${color},0) 45%, rgba(${color},${k}) 100%)` }} />
);
const Veil: React.FC<{ top?: number; bottom?: number }> = ({ top = 0.55, bottom = 0.7 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `linear-gradient(180deg, rgba(0,0,0,${top}) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 62%, rgba(0,0,0,${bottom}) 100%)` }} />
);

/** Voile sombre en haut (masque le logo anglais de l'affiche A, lisibilité des titres). */
const TopShade: React.FC<{ k?: number; h?: number }> = ({ k = 0.92, h = 760 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: h, pointerEvents: "none", background: `linear-gradient(180deg, rgba(0,0,0,${k}) 0%, rgba(0,0,0,${k * 0.85}) 45%, rgba(0,0,0,0) 100%)` }} />
);

/** Petite ligne de texte (Manrope ou Cinzel) qui monte. */
const Line: React.FC<{ text: string; at: number; y: number; size?: number; color?: string; font?: "m" | "c"; weight?: number; spacing?: number; out?: number }> = ({
  text,
  at,
  y,
  size = 48,
  color = K.ivoire,
  font = "m",
  weight = 800,
  spacing = 0,
  out,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = ramp(frame, at, 9, 0, 1);
  const q = out !== undefined ? ramp(frame, out, 6, 1, 0) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: y,
        textAlign: "center",
        fontFamily: font === "m" ? manrope : cinzel,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: spacing,
        lineHeight: 1.15,
        color,
        opacity: p * q,
        transform: `translateY(${(1 - p) * 34}px)`,
        filter: `blur(${(1 - p) * 6}px)`,
        textShadow: "0 4px 22px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.8)",
      }}
    >
      {text}
    </div>
  );
};

/** Titre qui claque avec traînée de glitch rouge pendant quelques images. */
const Slam: React.FC<{ text: string; at: number; y: number; size: number; color?: string; shine?: [number, number]; ghost?: string }> = ({ text, at, y, size, color = K.or, shine, ghost = K.rouge }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const g = frame - at < 6 ? (6 - (frame - at)) * 4 : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative" }}>
        {g > 0 ? (
          <>
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${-g}px)`, opacity: 0.7 }}>
              <PunchWord text={text} at={at} size={size} color={ghost} style={{ whiteSpace: "nowrap" }} />
            </div>
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${g}px)`, opacity: 0.5 }}>
              <PunchWord text={text} at={at} size={size} color="#4FD8FF" style={{ whiteSpace: "nowrap" }} />
            </div>
          </>
        ) : null}
        <PunchWord text={text} at={at} size={size} color={color} shine={shine} style={{ whiteSpace: "nowrap" }} />
      </div>
    </div>
  );
};

/* ---------- Transitions (entrée / sortie d'un plan) ---------- */
type T = "cut" | "whipL" | "whipR" | "whipU" | "whipD" | "zoom" | "fade";
const TN = 7;

const Tr: React.FC<{ id: string; dur: number; tin?: T; tout?: T; children: React.ReactNode }> = ({ id, dur, tin = "cut", tout = "cut", children }) => {
  const f = useCurrentFrame();
  let x = 0,
    y = 0,
    sc = 1,
    bx = 0,
    by = 0,
    op = 1;
  if (tin !== "cut" && f < TN) {
    const p = ramp(f, 0, TN, 1, 0, Easing.out(Easing.cubic));
    if (tin === "whipL") (x = p * W * 0.3), (sc = 1 + p * 0.6), (bx = p * 70);
    if (tin === "whipR") (x = -p * W * 0.3), (sc = 1 + p * 0.6), (bx = p * 70);
    if (tin === "whipU") (y = p * H * 0.3), (sc = 1 + p * 0.6), (by = p * 70);
    if (tin === "whipD") (y = -p * H * 0.3), (sc = 1 + p * 0.6), (by = p * 70);
    if (tin === "zoom") (sc = 1 + p * 0.5), (bx = by = p * 20);
    if (tin === "fade") op = 1 - p;
  }
  if (tout !== "cut" && f >= dur - TN) {
    const p = ramp(f, dur - TN, TN, 0, 1, Easing.in(Easing.cubic));
    if (tout === "whipL") (x = -p * W * 0.3), (sc = 1 + p * 0.6), (bx = p * 70);
    if (tout === "whipR") (x = p * W * 0.3), (sc = 1 + p * 0.6), (bx = p * 70);
    if (tout === "whipU") (y = -p * H * 0.3), (sc = 1 + p * 0.6), (by = p * 70);
    if (tout === "whipD") (y = p * H * 0.3), (sc = 1 + p * 0.6), (by = p * 70);
    if (tout === "zoom") (sc = 1 + p * 2.5), (bx = by = p * 24);
    if (tout === "fade") op = 1 - p;
  }
  const fid = `mb-${id}`;
  const blur = bx > 0.5 || by > 0.5;
  return (
    <AbsoluteFill style={{ opacity: op, transform: `translate(${x}px, ${y}px) scale(${sc})`, filter: blur ? `url(#${fid})` : undefined, backgroundColor: "#000" }}>
      {blur ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={`${bx} ${by}`} />
          </filter>
        </svg>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

const Shaken: React.FC<{ hits: Hit[]; children: React.ReactNode; zoomPunch?: boolean }> = ({ hits, children }) => {
  const frame = useCurrentFrame();
  const { x, y } = shakeOffset(frame, hits);
  const r = x * 0.04;
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${1 + (Math.abs(x) + Math.abs(y)) / 1400})` }}>{children}</AbsoluteFill>;
};

/* =====================================================================
   SCÈNES (temps vidéo en secondes ; dans chaque scène, frame = image locale)
   ===================================================================== */

/* ---------- S1 · « Écoute. » (0 à 3,0 s) ---------- */
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const at = s(1.25);
  const lit = ramp(frame, at - 3, 14, 0.12, 1);
  const pre = frame < at ? 0.12 + 0.08 * Math.max(0, Math.sin(frame * 0.35)) : lit;
  const z = frame < at ? lerp(frame / at, 2.6, 2.45) : ramp(frame, at, 50, 2.3, 2.05, snap);
  const glitch = (frame >= 10 && frame < 13) || (frame >= 22 && frame < 24) ? 14 : frame >= at && frame < at + 5 ? 22 - (frame - at) * 4 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shaken hits={[{ at, amp: 22, dur: 9 }]}>
        <Glitch amt={glitch} slices={glitch > 15 ? 40 : 0} seed="s1">
          <Pic im={IMG.A} cx={0.507} cy={0.37} z={z} rot={ramp(frame, 0, 90, -2, 1, io)} filter={`brightness(${pre}) contrast(1.1) saturate(1.15)`} />
        </Glitch>
        {/* lueur rouge du joyau */}
        <div
          style={{
            position: "absolute",
            left: W / 2 - 260,
            top: H / 2 - 260,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,60,40,${0.55 * (frame < at ? 0.4 + 0.4 * Math.sin(frame * 0.35) : 0.5)}) 0%, rgba(200,40,30,0.15) 40%, rgba(0,0,0,0) 70%)`,
            mixBlendMode: "screen",
          }}
        />
        <Rays y={H / 2} color="255,90,60" o={frame < at ? 0 : ramp(frame, at, 20, 0.9, 0.35)} spin={0.6} />
        <Motes depth={0.5} seed="s1a" n={20} opacity={lit} />
        <Motes depth={1.6} seed="s1b" n={8} opacity={lit} />
        <Veil top={0.6} bottom={0.8} />
        <TopShade k={0.97} h={900} />
        <Slam text="ÉCOUTE." at={at} y={400} size={170} shine={[at + 8, at + 30]} />
        <Line text="Univers du jeu Aurion · Kiro'o Games" at={s(1.6)} y={1455} size={34} weight={700} color="rgba(255,244,224,0.8)" />
      </Shaken>
      <FlashAt at={at} dur={8} max={0.45} color="#FF6A4A" />
      <Vig k={0.8} />
    </AbsoluteFill>
  );
};

/* ---------- S2 · Le jour du couronnement (3,0 à 7,25 s) ---------- */
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  // 3,0 → 5,0 : plan large qui descend des mains vers le visage ; 5,0 → 7,25 : remonte vers la couronne, poussée
  const u1 = ramp(frame, 0, 60, 0, 1, io);
  const u2 = ramp(frame, 60, 67, 0, 1, io);
  const cy = frame < 60 ? lerp(u1, 0.42, 0.6) : lerp(u2, 0.6, 0.4);
  const z = frame < 60 ? lerp(u1, 1.25, 1.12) : lerp(u2, 1.12, 1.38);
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.25);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shaken hits={[{ at: 0, amp: 10, dur: 6 }, { at: 60, amp: 6, dur: 5 }]}>
        <Pic im={IMG.A} cx={0.5} cy={cy} z={z} filter={`brightness(${0.85 * pulse + 0.05}) saturate(1.1) contrast(1.08)`} />
        {/* rai de lumière vertical */}
        <div style={{ position: "absolute", left: W / 2 - 260, top: 0, width: 520, height: H, background: `linear-gradient(90deg, rgba(255,240,210,0) 0%, rgba(255,240,210,${0.18 * pulse}) 50%, rgba(255,240,210,0) 100%)`, mixBlendMode: "screen" }} />
        <Motes depth={0.4} seed="s2a" n={30} color="#FFF1C4" glow="#F0C36B" rise={0.5} />
        <Motes depth={1.8} seed="s2b" n={8} color="#FFE2A0" rise={0.6} />
        <Veil top={0.75} bottom={0.92} />
        <TopShade k={0.88} h={820} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 300 }}>
          <LetterDrop text="LE JOUR DU" at={s(0.35)} size={74} color={K.ivoire} stagger={0.6} />
          <div style={{ height: 14 }} />
          <LetterDrop text="COURONNEMENT" at={s(0.6)} size={104} color={K.or} stagger={0.7} />
        </div>
        {frame >= s(0.92) ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", gap: 22, alignItems: "center", opacity: ramp(frame, s(0.92), 8, 0, 1), transform: `scale(${popScale(frame, s(0.92), 9, 1.15)})` }}>
            <div style={{ width: 90, height: 3, background: K.or }} />
            <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 64, letterSpacing: 18, color: K.ivoire, textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>ZAMA</div>
            <div style={{ width: 90, height: 3, background: K.or }} />
          </div>
        ) : null}
      </Shaken>
      <Vig k={0.75} />
    </AbsoluteFill>
  );
};

/* ---------- S3 · Enzo et Erine (7,25 à 11,75 s) ---------- */
const S3: React.FC = () => {
  const frame = useCurrentFrame();
  // 7,25-8,55 Enzo ; 8,55-8,95 panoramique fouetté vers Erine ; 10,75 recul sur le duo
  const tPan = s(1.3);
  const tBack = s(3.5);
  let cx: number, cy: number, z: number;
  let px = 0;
  if (frame < tPan) {
    const u = ramp(frame, 0, tPan, 0, 1, Easing.linear);
    cx = 0.79;
    cy = 0.3;
    z = lerp(u, 1.7, 1.85);
    px = lerp(u, 30, -30);
  } else if (frame < tBack) {
    const u = ramp(frame, tPan, 12, 0, 1, Easing.inOut(Easing.exp));
    const v = ramp(frame, tPan + 12, tBack - tPan - 12, 0, 1, Easing.linear);
    cx = lerp(u, 0.79, 0.27);
    cy = lerp(u, 0.3, 0.44);
    z = lerp(u, 1.85, 1.7) + v * 0.12;
    px = lerp(u, -30, 60) - v * 40;
  } else {
    const u = ramp(frame, tBack, 16, 0, 1, snap);
    cx = lerp(u, 0.27, 0.52);
    cy = lerp(u, 0.44, 0.42);
    z = lerp(u, 1.82, 1.08) + ramp(frame, tBack + 16, 30, 0, 0.05, Easing.linear);
    px = lerp(u, 20, 0) - (frame - tBack) * 0.8;
  }
  const panBlur = frame >= tPan && frame < tPan + 12 ? Math.sin(((frame - tPan) / 12) * Math.PI) * 40 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shaken hits={[{ at: tBack, amp: 16, dur: 8 }]}>
        <Motes depth={0.35} seed="s3far" n={30} px={px} />
        <AbsoluteFill style={{ filter: panBlur ? `blur(${panBlur / 4}px)` : undefined }}>
          <Layered k="B" cx={cx} cy={cy} z={z} px={px} filter="saturate(1.12) contrast(1.05)" />
        </AbsoluteFill>
        <Motes depth={1} seed="s3mid" n={22} px={px * 1.4} />
        <Motes depth={2.2} seed="s3near" n={9} px={px * 2.4} rise={1.4} />
        <Veil top={0.55} bottom={0.75} />
        {/* ENZO KORI-ODAN, à gauche du visage */}
        {frame < tPan + 6 ? (
          <AbsoluteFill style={{ opacity: frame < tPan ? 1 : ramp(frame, tPan, 6, 1, 0) }}>
            <Slam text="ENZO" at={s(0.2)} y={1080} size={150} color={K.or} shine={[s(0.4), s(1.1)]} />
            <Line text="KORI-ODAN" at={s(0.55)} y={1250} size={74} font="c" weight={900} spacing={10} color={K.ivoire} />
          </AbsoluteFill>
        ) : null}
        {frame >= tPan && frame < tBack + 4 ? (
          <AbsoluteFill style={{ opacity: frame < tBack ? 1 : ramp(frame, tBack, 4, 1, 0) }}>
            <Line text="et sa fiancée" at={tPan + 4} y={1270} size={50} color="rgba(255,244,224,0.9)" />
            <Slam text="ERINE" at={s(2.43)} y={1345} size={150} color={K.braise} ghost="#FFD36B" shine={[s(2.6), s(3.3)]} />
          </AbsoluteFill>
        ) : null}
      </Shaken>
      <FlashAt at={tBack} dur={7} max={0.3} color="#FF9A3C" />
      <Vig k={0.7} />
    </AbsoluteFill>
  );
};

/* ---------- S4 · Quelques instants avant… (11,75 à 15,25 s) ---------- */
const CRACK = "M 205 330 L 268 352 L 300 338 L 336 371 L 362 360 L 391 395 L 432 384 L 470 418 L 522 404";
const CRACK2 = "M 362 360 L 356 410 L 372 446 M 432 384 L 446 352 L 470 340";
const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const D = s(3.5);
  const u = ramp(frame, 0, D, 0, 1, Easing.linear);
  const sat = lerp(u, 0.9, 0.25);
  const z = lerp(u, 1.95, 2.25);
  const cy = lerp(u, 0.4, 0.37);
  const crackP = ramp(frame, s(2.65), s(0.75), 0, 1, Easing.in(Easing.quad));
  const tremor = frame > s(2.65) ? (random(`tr${frame}`) - 0.5) * 6 * crackP : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tremor}px, ${tremor * 0.6}px)` }}>
        <Pic im={IMG.A} cx={0.5} cy={cy} z={z} filter={`saturate(${sat}) brightness(${lerp(u, 1, 0.8)}) contrast(1.15)`}>
          {crackP > 0 ? (
            <>
              <path d={CRACK} fill="none" stroke="#FF3B2E" strokeWidth={7} strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - crackP * 100} style={{ filter: "blur(3px)" }} opacity={0.9} />
              <path d={CRACK} fill="none" stroke="#FFF1C4" strokeWidth={2.4} strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - crackP * 100} />
              <path d={CRACK2} fill="none" stroke="#FFD36B" strokeWidth={1.6} pathLength={100} strokeDasharray="100" strokeDashoffset={100 - Math.max(0, crackP * 1.6 - 0.6) * 100} />
            </>
          ) : null}
        </Pic>
        {/* poussière au ralenti */}
        <Motes depth={0.6} seed="s4" n={26} color="#E8DCC8" glow="#998" rise={0.15} spin={0.5} opacity={0.8} />
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(0,0,0,0) ${lerp(u, 55, 25)}%, rgba(0,0,0,0.92) ${lerp(u, 95, 70)}%)` }} />
        <TopShade k={0.98} h={920} />
        <Line text="Mais…" at={s(0.25)} y={360} size={86} font="c" weight={900} color={K.ivoire} />
        <Line text="quelques instants avant le couronnement" at={s(0.75)} y={480} size={52} color="rgba(255,244,224,0.92)" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(200,40,30,1)", opacity: crackP * 0.18, mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};

/* ---------- S5 · Trahison (15,25 à 19,75 s) ---------- */
const ShatterLines: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 16) return null;
  const o = ramp(frame, at, 16, 1, 0);
  const lines = Array.from({ length: 9 }).map((_, i) => {
    const a = (i / 9) * Math.PI * 2 + random(`sl${i}`) * 0.5;
    let d = `M ${W / 2} ${H * 0.45}`;
    let x = W / 2,
      y = H * 0.45;
    for (let k = 0; k < 6; k++) {
      const step = 140 + random(`sl${i}${k}`) * 120;
      const aa = a + (random(`sa${i}${k}`) - 0.5) * 0.7;
      x += Math.cos(aa) * step;
      y += Math.sin(aa) * step;
      d += ` L ${x} ${y}`;
    }
    return d;
  });
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {lines.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#FF3B2E" strokeWidth={10} fill="none" style={{ filter: "blur(5px)" }} />
          <path d={d} stroke="#FFF1E0" strokeWidth={3} fill="none" />
        </g>
      ))}
    </svg>
  );
};

const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const f2 = s(1.35); // 16,6 s : plan plus large, la couronne bascule
  const f3 = s(2.75); // 18,0 s : le visage dans l'ombre
  const red = "grayscale(1) contrast(1.35) brightness(1.05)";
  let pic: React.ReactNode;
  if (frame < f2) {
    pic = <Pic im={IMG.A} cx={0.5} cy={0.37} z={ramp(frame, 0, f2, 2.5, 2.2, snap)} rot={ramp(frame, 0, 10, 0, -6, snap)} filter={red} />;
  } else if (frame < f3) {
    const u = ramp(frame, f2, f3 - f2, 0, 1, Easing.in(Easing.quad));
    pic = <Pic im={IMG.A} cx={0.5} cy={lerp(u, 0.45, 0.4)} z={lerp(u, 1.75, 1.95)} rot={lerp(u, 3, 13)} dy={u * 200} clamp={false} filter={red} />;
  } else {
    const u = ramp(frame, f3, s(1.75), 0, 1, Easing.linear);
    pic = <Pic im={IMG.A} cx={0.5} cy={0.74} z={lerp(u, 1.7, 1.85)} filter={`${red} brightness(0.75)`} />;
  }
  const g0 = frame < 8 ? 30 - frame * 3 : 0;
  const tick = (frame >= f2 && frame < f2 + 4) || (frame >= f3 && frame < f3 + 4) || (frame >= s(1.6) && frame < s(1.6) + 2) ? 18 : 0;
  const amt = Math.max(g0, tick, 4 + 3 * Math.sin(frame * 0.9));
  return (
    <AbsoluteFill style={{ backgroundColor: "#100000" }}>
      <Shaken hits={[{ at: 0, amp: 40, dur: 14 }, { at: f2, amp: 18, dur: 8 }, { at: f3, amp: 14, dur: 6 }]}>
        <Glitch amt={amt} slices={g0 > 10 || tick ? 60 : 0} seed="s5">
          {pic}
        </Glitch>
        <AbsoluteFill style={{ background: "#FF2418", mixBlendMode: "multiply" }} />
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,120,60,0.25) 0%, rgba(0,0,0,0) 60%)", mixBlendMode: "screen" }} />
        <Motes depth={1.3} seed="s5" n={20} color="#FF5A3C" glow="#C8281E" rise={-0.6} />
        <Veil top={0.6} bottom={0.75} />
        <TopShade k={0.85} h={640} />
        <Slam text="TRAHISON !" at={1} y={330} size={138} color={K.rougeVif} ghost="#FFE0C0" />
        <Line text="Le frère d'Erine" at={s(0.8)} y={1120} size={70} font="c" weight={900} color={K.ivoire} />
        {frame >= s(1.55) ? <Slam text="S'EMPARE" at={s(1.55)} y={1225} size={96} color={K.or} /> : null}
        {frame >= s(1.95) ? <Slam text="DU TRÔNE" at={s(1.95)} y={1340} size={96} color={K.or} shine={[s(2.2), s(3)]} /> : null}
      </Shaken>
      <ShatterLines at={0} />
      <FlashAt at={0} dur={10} max={0.7} color="#FFD7C8" />
      <Vig k={0.9} color="40,0,0" />
    </AbsoluteFill>
  );
};

/* ---------- S6 · Chassé de son palais (19,75 à 27,0 s) ---------- */
const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const tStairs = s(5.25); // 25,0 s : gros plan sur l'escalier
  const cold = "saturate(0.55) brightness(0.82) contrast(1.1) hue-rotate(-8deg)";
  const fadeOut = ramp(frame, s(6.55), s(0.7), 0, 1, Easing.in(Easing.quad));
  let layer: React.ReactNode;
  if (frame < tStairs) {
    const u = ramp(frame, s(3.5), s(1.75), 0, 1, io);
    const cx = lerp(u, 0.3, 0.12);
    const cy = lerp(u, 0.5, 0.72);
    const z = lerp(ramp(frame, 0, s(3.5), 0, 1, Easing.linear), 1.0, 1.06) + ramp(frame, s(1.8), 8, 0, 0.1, snap) + u * 0.12;
    const px = lerp(ramp(frame, 0, s(3.5), 0, 1, Easing.linear), 40, -40) + u * 140;
    layer = <Layered k="D" cx={cx} cy={cy} z={z} px={px} filter={cold} />;
  } else {
    const u = ramp(frame, tStairs, s(2), 0, 1, Easing.linear);
    layer = <Pic im={IMG.D} cx={0.07} cy={lerp(u, 0.66, 0.9)} z={ramp(frame, tStairs, 10, 1.75, 1.45, snap) + u * 0.15} rot={lerp(u, -2, 2)} filter={`${cold} brightness(0.75)`} />;
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shaken hits={[{ at: s(1.8), amp: 26, dur: 9 }, { at: tStairs, amp: 6, dur: 4 }]}>
        {layer}
        <AbsoluteFill style={{ background: "rgba(40,60,80,0.25)", mixBlendMode: "multiply" }} />
        <Fog y={1150} opacity={0.5 + ramp(frame, s(3.5), s(3), 0, 0.5)} />
        <Fog y={500} opacity={ramp(frame, s(4), s(3), 0, 0.6)} />
        <Motes depth={0.5} seed="s6" n={18} color="#BFD7E6" glow="#6E8FA8" rise={-0.3} opacity={0.6} />
        <Veil top={0.6} bottom={0.7} />
        {frame < s(4.6) ? (
          <AbsoluteFill style={{ opacity: ramp(frame, s(4.2), s(0.4), 1, 0) }}>
            <Line text="Enzo est…" at={s(1.25)} y={360} size={54} color="rgba(255,244,224,0.9)" />
            <Slam text="CHASSÉ" at={s(1.8)} y={440} size={150} color={K.ivoire} ghost={K.rouge} />
            <Line text="de son propre palais" at={s(2.3)} y={620} size={60} font="c" weight={700} color={K.or} />
          </AbsoluteFill>
        ) : null}
        {frame >= tStairs ? <Slam text="L'EXIL" at={tStairs + 2} y={700} size={150} color="#BFD7E6" ghost={K.rouge} /> : null}
      </Shaken>
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
      <Vig k={0.85} />
    </AbsoluteFill>
  );
};

/* ---------- S7 · L'Aurion (27,0 à 34,75 s) ---------- */
const S7: React.FC = () => {
  const frame = useCurrentFrame();
  const tSoft = s(1.75); // 28,75 : la musique repart, doucement
  const tHit = s(3.75); // 30,75 : impact
  const pre = frame < tHit;
  // révélation progressive avant l'impact
  const reveal = pre ? ramp(frame, tSoft - 6, tHit - tSoft + 6, 0.05, 0.85, Easing.out(Easing.quad)) : 1;
  const zPre = lerp(ramp(frame, 0, tHit, 0, 1, Easing.in(Easing.cubic)), 1.0, 1.45);
  const zPost = ramp(frame, tHit, 14, 1.55, 1.05, snap) + ramp(frame, tHit + 14, s(4) - 14, 0, 0.2, Easing.linear);
  const z = pre ? zPre : zPost;
  const rot = pre ? 0 : Math.sin((frame - tHit) * 0.06) * 3;
  const vib = pre && frame > tSoft ? (random(`vb${frame}`) - 0.5) * 10 * ramp(frame, tSoft, tHit - tSoft, 0, 1) : 0;
  const amt = pre ? (frame > tSoft ? ramp(frame, tSoft, tHit - tSoft, 0, 10) : 0) : Math.max(0, 26 - (frame - tHit) * 2.5) + 3 + 2 * Math.sin(frame * 0.6);
  const size = 1300 * z;
  const cx = 0.43;
  const cy = 0.48;
  const aura = pre ? reveal * 0.6 : 0.75 + 0.25 * Math.sin((frame - tHit) * 0.3);
  // yeux de la créature dans le noir avant la révélation
  const eyes = frame < tSoft + 20 ? ramp(frame, 8, 30, 0, 1) * (frame > tSoft ? ramp(frame, tSoft, 20, 1, 0) : 1) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#050208" }}>
      <Shaken hits={[{ at: tHit, amp: 46, dur: 16 }, { at: tHit + 18, amp: 12, dur: 6 }]}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, rgba(200,40,30,${0.45 * aura}) 0%, rgba(90,20,60,${0.35 * aura}) 30%, rgba(5,2,8,1) 68%)` }} />
        <Rays y={H * 0.46} color="255,70,50" o={pre ? reveal * 0.5 : 0.9 + 0.1 * Math.sin(frame * 0.4)} spin={pre ? 0.6 : 1.6} n={18} />
        {!pre ? <Rays y={H * 0.46} color="255,200,120" o={ramp(frame, tHit, 30, 0.9, 0.3)} spin={-1} n={10} /> : null}
        {frame < tSoft - 6 ? null : <Glitch amt={amt} slices={!pre && frame < tHit + 6 ? 70 : 0} seed="s7">
          <AbsoluteFill style={{ transform: `translate(${vib}px, ${vib * 0.5}px) rotate(${rot}deg)` }}>
            <div
              style={{
                position: "absolute",
                left: W / 2 - cx * size,
                top: H * 0.46 - cy * size,
                width: size,
                height: size,
                WebkitMaskImage: "radial-gradient(circle at 45% 48%, rgba(0,0,0,1) 42%, rgba(0,0,0,0) 70%)",
                maskImage: "radial-gradient(circle at 45% 48%, rgba(0,0,0,1) 42%, rgba(0,0,0,0) 70%)",
                filter: `brightness(${reveal}) saturate(1.2) contrast(1.15) drop-shadow(0 0 40px rgba(255,60,40,${aura * 0.9}))`,
              }}
            >
              <Img src={staticFile(IMG.F.src)} style={{ width: "100%", height: "100%" }} />
            </div>
          </AbsoluteFill>
        </Glitch>}
        {/* teinte rouge Aurion par-dessus l'aura violette de l'image */}
        <AbsoluteFill style={{ background: "rgba(220,40,30,1)", mixBlendMode: "color", opacity: pre ? 0.12 : 0.28 }} />
        {eyes > 0 ? (
          <>
            {[0, 1].map((i) => (
              <div key={i} style={{ position: "absolute", left: 640 + i * 120, top: 420 + i * 10, width: 70, height: 26, borderRadius: "50%", background: "#FF3B2E", opacity: eyes * (0.7 + 0.3 * Math.sin(frame * 0.4)), boxShadow: "0 0 40px 10px rgba(255,59,46,0.8)", transform: `rotate(${i ? -12 : 12}deg)` }} />
            ))}
          </>
        ) : null}
        {/* particules aspirées vers le personnage avant l'impact, projetées après */}
        {pre ? <Motes depth={0.9} seed="s7in" n={40} color="#FF6A4A" glow="#C8281E" rise={-1.5} spin={1} opacity={reveal} /> : <Motes depth={1.2} seed="s7out" n={36} color="#FFD36B" glow="#FF3B2E" rise={2.2} spin={0.6} />}
        <Shards at={tHit} x={W / 2} y={H * 0.46} n={60} seed="s7" color={K.or} power={1.3} />
        <Ring at={tHit} y={H * 0.46} color={K.rougeVif} />
        <Ring at={tHit + 5} y={H * 0.46} color={K.or} dur={22} />
        <Veil top={0.55} bottom={0.65} />
        <Slam text="L'AURION" at={tHit} y={300} size={168} color={K.or} ghost={K.rougeVif} shine={[tHit + 10, tHit + 40]} />
        <Line text="la force des ancêtres" at={s(4.52)} y={1300} size={66} font="c" weight={900} color={K.ivoire} />
      </Shaken>
      <FlashAt at={tHit} dur={12} max={0.85} color="#FFE7C0" />
      <Vig k={0.8} />
    </AbsoluteFill>
  );
};

/* ---------- S8 · Des alliés, d'autres nations (34,75 à 40,75 s) ---------- */
const SpeedLines: React.FC<{ o: number; seed: string }> = ({ o, seed }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "screen" }}>
      {Array.from({ length: 34 }).map((_, i) => {
        const a = random(`${seed}${i}`) * Math.PI * 2;
        const ph = (frame * 0.12 + random(`${seed}p${i}`)) % 1;
        const r0 = 520 + ph * 500;
        const r1 = r0 + 160 + random(`${seed}l${i}`) * 260;
        return (
          <line key={i} x1={W / 2 + Math.cos(a) * r0} y1={H / 2 + Math.sin(a) * r0} x2={W / 2 + Math.cos(a) * r1} y2={H / 2 + Math.sin(a) * r1} stroke="#FFF4E0" strokeWidth={3 + random(`${seed}w${i}`) * 5} opacity={1 - ph} />
        );
      })}
    </svg>
  );
};

const S8: React.FC = () => {
  const frame = useCurrentFrame();
  const tE = s(2.5); // 37,25 : plan 3D du couple
  if (frame < tE) {
    // bas (Erine) → haut (Enzo en saut), panoramique vertical fouetté à 36,0 s
    const tUp = s(1.05);
    const u = ramp(frame, tUp, 12, 0, 1, Easing.inOut(Easing.exp));
    const v = ramp(frame, 0, tE, 0, 1, Easing.linear);
    const cx = lerp(u, 0.33, 0.66);
    const cy = lerp(u, 0.64, 0.3);
    const z = 1.32 + v * 0.1;
    const py = lerp(u, 50, -60);
    const blurY = frame >= tUp && frame < tUp + 12 ? Math.sin(((frame - tUp) / 12) * Math.PI) * 14 : 0;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Shaken hits={[{ at: tUp + 10, amp: 14, dur: 6 }]}>
          <AbsoluteFill style={{ filter: blurY ? `blur(${blurY}px)` : undefined }}>
            <Layered k="C" cx={cx} cy={cy} z={z} py={py} px={lerp(v, 20, -20)} filter="saturate(1.15) contrast(1.06)" />
          </AbsoluteFill>
          <SpeedLines o={0.35 + 0.25 * u} seed="s8" />
          <Veil top={0.5} bottom={0.7} />
        </Shaken>
        <FlashAt at={0} dur={8} max={0.55} color="#FFE7C0" />
        <Vig k={0.6} />
      </AbsoluteFill>
    );
  }
  // plan E (basse définition) en bande cinéma, fond flou de la même image
  const f = frame - tE;
  const u = ramp(f, 0, s(3.5), 0, 1, Easing.linear);
  const bandH = 820;
  const bandC = 980;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${1.25 + u * 0.08}) translateX(${u * 40}px)` }}>
        <Img src={staticFile(IMG.E.src)} style={{ position: "absolute", left: -900, top: 0, width: 2880, height: H, objectFit: "cover", filter: "blur(28px) brightness(0.55) saturate(1.3)" }} />
      </AbsoluteFill>
      <Motes depth={0.45} seed="s8far" n={26} color="#FFE8B0" glow="#F0C36B" px={-u * 120} rise={0.3} />
      <div style={{ position: "absolute", left: 0, top: bandC - bandH / 2, width: W, height: bandH, overflow: "hidden", boxShadow: "0 0 80px rgba(0,0,0,0.9)", transform: `scaleY(${ramp(f, 0, 8, 0.2, 1, snap)})` }}>
        <Img src={staticFile(IMG.E.src)} style={{ position: "absolute", left: lerp(u, -120, -260), top: -30, width: 1500, height: 900, objectFit: "cover", filter: "saturate(1.15) contrast(1.05)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35))" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: bandC - bandH / 2 - 4, width: W * ramp(f, 2, 14, 0, 1, snap), height: 4, background: K.or }} />
      <div style={{ position: "absolute", right: 0, top: bandC + bandH / 2, width: W * ramp(f, 2, 14, 0, 1, snap), height: 4, background: K.or }} />
      <Motes depth={2} seed="s8near" n={8} color="#FFE8B0" glow="#F0C36B" px={-u * 300} rise={0.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300 }}>
        <Slam text="D'AUTRES" at={3} y={0} size={98} color={K.ivoire} />
        <Slam text="NATIONS" at={s(0.4)} y={108} size={124} color={K.or} shine={[s(0.6), s(1.5)]} />
      </div>
      <Vig k={0.7} />
    </AbsoluteFill>
  );
};

/* ---------- S9 · Son trône (40,75 à 43,0 s) + montage rythmé (43,0 à 46,75 s) ---------- */
const S9: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = s(1.1); // 41,85
  const z = frame < hit ? lerp(ramp(frame, 0, hit, 0, 1, Easing.in(Easing.cubic)), 1.55, 2.05) : ramp(frame, hit, 10, 1.6, 1.45, snap);
  const cx = frame < hit ? 0.8 : 0.72;
  const cy = frame < hit ? 0.29 : 0.33;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shaken hits={[{ at: hit, amp: 30, dur: 10 }]}>
        <Glitch amt={frame >= hit && frame < hit + 6 ? 20 - (frame - hit) * 3 : 0} slices={frame >= hit && frame < hit + 4 ? 50 : 0} seed="s9">
          <Layered k="B" cx={cx} cy={cy} z={z} px={frame < hit ? -frame * 1.2 : 30 - (frame - hit) * 1.5} filter="saturate(1.2) contrast(1.1)" />
        </Glitch>
        <Motes depth={1.4} seed="s9" n={24} rise={1.8} />
        <Veil top={0.55} bottom={0.75} />
        <Line text="Pour reprendre…" at={2} y={330} size={58} color={K.ivoire} />
        <Slam text="SON TRÔNE." at={hit} y={1180} size={128} color={K.or} ghost={K.rougeVif} shine={[hit + 6, hit + 30]} />
      </Shaken>
      <FlashAt at={hit} dur={8} max={0.4} color="#FFB060" />
      <Vig k={0.7} />
    </AbsoluteFill>
  );
};

type Beat = { k: keyof typeof IMG; cx: number; cy: number; z0: number; z1: number; rot?: number; dir: number; red?: boolean };
const BEATS: Beat[] = [
  { k: "F", cx: 0.42, cy: 0.42, z0: 1.15, z1: 1.3, dir: 1, red: true },
  { k: "C", cx: 0.68, cy: 0.3, z0: 1.5, z1: 1.35, dir: -1 },
  { k: "D", cx: 0.42, cy: 0.35, z0: 1.15, z1: 1.3, dir: 1 },
  { k: "B", cx: 0.25, cy: 0.42, z0: 1.7, z1: 1.55, dir: -1 },
  { k: "C", cx: 0.3, cy: 0.66, z0: 1.3, z1: 1.45, dir: 1 },
  { k: "F", cx: 0.66, cy: 0.25, z0: 1.35, z1: 1.2, dir: -1, red: true },
  { k: "D", cx: 0.9, cy: 0.45, z0: 1.1, z1: 1.25, dir: 1 },
  { k: "B", cx: 0.62, cy: 0.4, z0: 1.1, z1: 1.2, dir: -1 },
];
const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const L = 15; // une image par temps (0,5 s)
  const i = Math.min(BEATS.length - 1, Math.floor(frame / L));
  const b = BEATS[i];
  const f = frame - i * L;
  const z = ramp(f, 0, L, b.z0, b.z1, Easing.out(Easing.cubic));
  const slide = ramp(f, 0, 5, 160 * b.dir, 0, snap);
  const g = f < 3 ? 22 - f * 6 : 0;
  const im = IMG[b.k];
  const isF = b.k === "F";
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shaken hits={[{ at: i * L, amp: 14, dur: 4 }]}>
        <Glitch amt={g} slices={f < 2 ? 50 : 0} seed={`m${i}`}>
          <AbsoluteFill style={{ transform: `translateX(${slide}px)` }}>
            <Pic im={im} cx={b.cx} cy={b.cy} z={isF ? z * 1 : z} filter={`${b.red ? "saturate(1.3) contrast(1.15)" : "saturate(1.15)"} ${f < 2 ? "brightness(1.5)" : ""}`} />
          </AbsoluteFill>
        </Glitch>
        {b.red ? <AbsoluteFill style={{ background: "rgba(220,40,30,1)", mixBlendMode: "color", opacity: 0.3 }} /> : null}
        <Motes depth={1.5} seed="mt" n={16} rise={2.5} />
      </Shaken>
      <Vig k={0.75} />
    </AbsoluteFill>
  );
};

/* ---------- S10 · Carte de fin (46,75 à 59,0 s) ---------- */
const S10: React.FC<{ logoAt?: number; infoAt?: number; endAt?: number; step?: number }> = ({ logoAt = 2.0, infoAt = 3.5, endAt = 11.55, step = 12 }) => {
  const frame = useCurrentFrame();
  const tLogo = s(logoAt); // « Aurion » → le logo claque
  const tInfo = s(infoAt);
  // fond : diaporama lent et sombre (B puis D puis C)
  const bgList: { k: "B" | "D" | "F"; cx: number; cy: number }[] = [
    { k: "B", cx: 0.5, cy: 0.42 },
    { k: "D", cx: 0.35, cy: 0.5 },
    { k: "F", cx: 0.42, cy: 0.45 },
  ];
  const seg = s(4);
  const bi = Math.min(bgList.length - 1, Math.floor(frame / seg));
  const bf = frame - bi * seg;
  const bg = bgList[bi];
  const bgFade = bi > 0 ? ramp(bf, 0, 12, 0, 1, Easing.linear) : 1;
  const prev = bi > 0 ? bgList[bi - 1] : null;
  const dim = frame < tLogo ? 0.75 : 0.42;
  const end = ramp(frame, s(endAt), s(0.4), 0, 1, Easing.in(Easing.quad));
  const logoS = popScale(frame, tLogo, 12, 1.25);
  const breathe = 1 + 0.015 * Math.sin((frame - tLogo) * 0.12);
  const shine = ((frame - tLogo) % 75) / 75;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shaken hits={[{ at: 0, amp: 16, dur: 8 }, { at: tLogo, amp: 34, dur: 12 }]}>
        {prev && bgFade < 1 ? <Pic im={IMG[prev.k]} cx={prev.cx} cy={prev.cy} z={1.14 + 0.04} filter={`brightness(${dim}) blur(2px)`} /> : null}
        <AbsoluteFill style={{ opacity: bgFade }}>
          <Pic im={IMG[bg.k]} cx={bg.cx} cy={bg.cy} z={1.1 + ramp(bf, 0, seg, 0, 0.06, Easing.linear)} filter={`brightness(${dim}) ${frame >= tLogo ? "blur(2px)" : ""} saturate(1.1)`} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(200,40,30,0.25) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.75) 100%)" }} />
        <Motes depth={0.5} seed="s10a" n={30} />
        <Motes depth={1.8} seed="s10b" n={10} rise={1.3} />
        {/* « À toi de vivre la légende » */}
        {frame < tLogo + 4 ? (
          <AbsoluteFill style={{ opacity: frame < tLogo ? 1 : ramp(frame, tLogo, 4, 1, 0) }}>
            <Line text="À TOI DE VIVRE" at={4} y={700} size={78} font="c" weight={900} color={K.ivoire} spacing={4} />
            <Slam text="LA LÉGENDE" at={s(0.95)} y={810} size={112} color={K.or} ghost={K.rougeVif} />
            <Line text="Joue à…" at={s(1.6)} y={1000} size={60} color={K.ivoire} />
          </AbsoluteFill>
        ) : null}
        {frame >= tLogo ? (
          <>
            <Rays y={560} color="255,80,50" o={ramp(frame, tLogo, 20, 0.9, 0.35)} spin={0.5} n={16} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center", transform: `scale(${logoS * breathe})` }}>
              <div style={{ position: "relative", width: 880, height: 376 }}>
                <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,80,40,0.45) 0%, rgba(0,0,0,0) 65%)" }} />
                <Img src={staticFile("img/aurion/logo-4x.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 0 30px rgba(255,90,40,0.8)) contrast(1.1) saturate(1.15)" }} />
                {/* reflet qui balaie le logo */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    WebkitMaskImage: `url(${staticFile("img/aurion/logo-4x.png")})`,
                    maskImage: `url(${staticFile("img/aurion/logo-4x.png")})`,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    background: `linear-gradient(105deg, rgba(255,255,255,0) ${shine * 160 - 30}%, rgba(255,250,230,0.4) ${shine * 160 - 18}%, rgba(255,255,255,0) ${shine * 160 - 6}%)`,
                    mixBlendMode: "screen",
                  }}
                />
              </div>
            </div>
            <Line text="L'Héritage des Kori-Odan" at={tLogo + 10} y={760} size={58} font="c" weight={700} color={K.ivoire} />
          </>
        ) : null}
        {frame >= tInfo ? (
          <>
            <div style={{ position: "absolute", left: 300, right: 300, top: 870, height: 3, background: K.or, transform: `scaleX(${ramp(frame, tInfo, 14, 0, 1)})` }} />
            <Line text="aurionthegame.com" at={tInfo + Math.round(step / 3)} y={930} size={72} color={K.or} />
            <Line text="PC (Steam) · Xbox One · Xbox Series X|S" at={tInfo + Math.round(step * 4 / 3)} y={1050} size={40} weight={700} />
            <Line text="Kiro'o Games · Yaoundé, Cameroun" at={tInfo + Math.round(step * 7 / 3)} y={1150} size={44} font="c" weight={700} color={K.ivoire} />
            <Line text="Illustrations © Kiro'o Games" at={tInfo + Math.round(step * 10 / 3)} y={1420} size={30} weight={500} color="rgba(255,244,224,0.55)" />
          </>
        ) : null}
        <Ring at={tLogo} y={560} color={K.rougeVif} />
        <Shards at={tLogo} x={W / 2} y={560} n={44} seed="s10" color={K.braise} />
      </Shaken>
      <FlashAt at={0} dur={8} max={0.35} color="#FFB060" />
      <FlashAt at={tLogo} dur={10} max={0.6} color="#FFE7C0" />
      <Vig k={0.7} />
      <AbsoluteFill style={{ background: "#000", opacity: end }} />
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */
const SCENES: { id: string; from: number; to: number; C: React.FC; tin?: T; tout?: T }[] = [
  { id: "s1", from: 0, to: 3.0, C: S1, tout: "zoom" },
  { id: "s2", from: 3.0, to: 7.25, C: S2, tin: "zoom", tout: "whipL" },
  { id: "s3", from: 7.25, to: 11.75, C: S3, tin: "whipL", tout: "zoom" },
  { id: "s4", from: 11.75, to: 15.25, C: S4, tin: "zoom" },
  { id: "s5", from: 15.25, to: 19.75, C: S5, tout: "whipL" },
  { id: "s6", from: 19.75, to: 27.0, C: S6, tin: "whipL" },
  { id: "s7", from: 27.0, to: 34.75, C: S7, tout: "zoom" },
  { id: "s8", from: 34.75, to: 40.75, C: S8, tout: "whipU" },
  { id: "s9", from: 40.75, to: 43.0, C: S9, tin: "whipU" },
  { id: "mt", from: 43.0, to: 46.75, C: Montage },
  { id: "s10", from: 46.75, to: 59.0, C: S10 },
];

/** Sous-titres karaoké (phrases qui ne sont pas déjà écrites en gros). */
const SUBS = [
  { words: w([["un", 4.42], ["prince", 4.54], ["allait", 5.02], ["être", 5.24], ["couronné.", 5.44]]), end: s(6.4) },
  { words: w([["Alors", 29.9], ["il", 30.08], ["invoque…", 30.32]]), end: s(30.75) },
  { words: w([["Avec", 35.0], ["Erine,", 35.16], ["il", 36.08], ["part", 36.2], ["chercher", 36.4], ["des", 36.76], ["alliés…", 37.0]]), end: s(37.25) },
];

export const AurionKiroo: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Defs />
    {SCENES.map(({ id, from, to, C: Sc, tin, tout }) => {
      const dur = s(to) - s(from);
      return (
        <Sequence key={id} from={s(from)} durationInFrames={dur}>
          <Tr id={id} dur={dur} tin={tin} tout={tout}>
            <Sc />
          </Tr>
        </Sequence>
      );
    })}
    {SUBS.map((sub, i) => (
      <Karaoke key={i} words={sub.words} end={sub.end} />
    ))}
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-aurion-kiroo-59s.wav")} /> : null}
  </AbsoluteFill>
);


/* =====================================================================
   VERSION 30 s (v2) : mêmes scènes, fenêtres resserrées sur la voix.
   skip = secondes sautées au début de la scène (sa propre chronologie),
   la musique part de 134,95 s (gros impact du morceau à 17,1 s = « l'Aurion »).
   Coupé : montage rapide, L'EXIL, silence long, recul sur le duo, carte de fin longue.
   ===================================================================== */
const S10Court: React.FC = () => <S10 logoAt={1.95} infoAt={2.55} endAt={4.55} step={6} />;

const SCENES30: { id: string; from: number; to: number; skip?: number; C: React.FC; tin?: T; tout?: T }[] = [
  { id: "c1", from: 0, to: 1.2, skip: 0.85, C: S1, tout: "zoom" },
  { id: "c2", from: 1.2, to: 4.3, C: S2, tin: "zoom", tout: "whipL" },
  { id: "c3", from: 4.3, to: 7.2, C: S3, tin: "whipL", tout: "zoom" },
  { id: "c4", from: 7.2, to: 10.5, skip: 0.2, C: S4, tin: "zoom" },
  { id: "c5", from: 10.5, to: 13.3, C: S5, tout: "whipL" },
  { id: "c6", from: 13.3, to: 15.9, skip: 1.0, C: S6, tin: "whipL", tout: "zoom" },
  { id: "c7", from: 15.9, to: 19.35, skip: 2.55, C: S7, tout: "zoom" },
  { id: "c8", from: 19.35, to: 23.25, skip: 0.1, C: S8, tout: "whipU" },
  { id: "c9", from: 23.25, to: 25.05, C: S9, tin: "whipU" },
  { id: "c10", from: 25.05, to: 30.0, C: S10Court },
];

const SUBS30 = [
  { words: w([["un", 2.62], ["prince", 2.74], ["allait", 3.22], ["être", 3.44], ["couronné.", 3.64]]), end: s(4.25) },
  { words: w([["Alors", 16.25], ["il", 16.43], ["invoque…", 16.67]]), end: s(17.1) },
  { words: w([["Avec", 19.5], ["Erine,", 19.66], ["il", 20.58], ["part", 20.7], ["chercher", 20.9], ["des", 21.26], ["alliés…", 21.5]]), end: s(21.75) },
];

export const AurionKiroo30: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Defs />
    {SCENES30.map(({ id, from, to, skip = 0, C: Sc, tin, tout }) => {
      const dur = s(to) - s(from);
      return (
        <Sequence key={id} from={s(from)} durationInFrames={dur}>
          <Tr id={id} dur={dur} tin={tin} tout={tout}>
            <Sequence from={-s(skip)}>
              <Sc />
            </Sequence>
          </Tr>
        </Sequence>
      );
    })}
    {SUBS30.map((sub, i) => (
      <Karaoke key={i} words={sub.words} end={sub.end} />
    ))}
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-aurion-kiroo-30s.wav")} /> : null}
  </AbsoluteFill>
);
