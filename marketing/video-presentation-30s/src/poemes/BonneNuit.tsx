/**
 * AFROBACK · Poème de motivation « Bonne nuit » (« Tu es plus fort que tu ne crois »), 59 s, 9:16.
 * Format nouveau de la série : pas l'annonce d'un récit, un poème du soir.
 * Voix : ElevenLabs (Paul K), découpée aux respirations par recits/poeme-bonne-nuit/mix-poeme.py.
 * Sous-titres : calés mot à mot sur la transcription locale (bonne-nuit-mots.ts).
 *
 * Déroulé : 0-12,9 le feu qui résiste au vent · 12,6-25,6 le chemin, la graine devenue baobab, les petits pas
 * · 25,3-37,6 veines dorées, bâtisseurs qui tombent et se relèvent, la braise qui dort en toi
 * · 37,2-50,4 repos sous le baobab, l'œil qui se ferme, le soleil sur l'Afrique, le soleil pour toi
 * · 49,9-55,6 retour à la nuit : « Tu es plus fort que tu ne crois », « Bonne nuit » · 55,2-59 fin AFROBACK.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, FPS, W, H, cinzel, manrope } from "../theme";
import { Flame, Embers, Walker, Vig } from "../recit-kit";
import { Phone } from "../phone";
import { MOTS } from "./bonne-nuit-mots";

export const BONNE_NUIT_DUREE = 59;

/* ---------- Outils de temps (en secondes) ---------- */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (t: number, a: number, b: number) => {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
/** Opacité d'une scène : fondu d'entrée à partir de a, fondu de sortie qui se termine à b. */
const win = (t: number, a: number, b: number, f = 0.8) => sm(t, a, a + f) * (1 - sm(t, b - f, b));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeInOut = Easing.inOut(Easing.cubic);

/* ---------- Carte de l'Afrique (contour simplifié, longitude / latitude) ---------- */
const AFRICA: [number, number][] = [
  [-5.8, 35.8], [-1.5, 35.3], [3, 36.8], [10.2, 37.2], [11, 36.9], [10.2, 34.5], [10, 33.9], [11.5, 33.1], [13.2, 32.9], [15.5, 31.5],
  [19, 30.3], [20, 31.2], [20, 32.1], [22.5, 32.8], [24, 32], [27, 31.3], [29.9, 31.2], [32.3, 31.3], [32.5, 30], [34, 27.3],
  [35.5, 24], [37.2, 21], [38.5, 18], [39.7, 15.6], [42.5, 13], [43.2, 11.6], [45, 10.6], [51.3, 11.8], [50.8, 9.5], [49, 6],
  [46, 2], [45.3, 2], [42, -1], [39.7, -4], [39.3, -6.8], [40.5, -10.5], [40.6, -15], [37, -17.5], [34.8, -19.8], [35.5, -22],
  [35.5, -24], [32.6, -25.9], [31, -29.8], [28, -33], [25.6, -34], [20, -34.8], [18.4, -34.2], [17.9, -32], [16.5, -28.6], [15.2, -26.6],
  [14.5, -22.9], [11.8, -17.3], [13.4, -12.6], [13.2, -8.8], [12.3, -6], [9.5, -2], [9.4, 0.4], [9.7, 4], [8.5, 4.5], [6, 4.3],
  [3.4, 6.4], [-0.2, 5.5], [-2, 4.7], [-4, 5.3], [-7.6, 4.4], [-10.8, 6.3], [-13.2, 8.5], [-13.7, 9.5], [-15.6, 11.9], [-17.5, 14.7],
  [-16.5, 16], [-16, 18], [-17, 20.8], [-16.9, 23.5], [-12.9, 27.9], [-9.6, 30.4], [-7.6, 33.6], [-6.8, 34],
];
const MADAGASCAR: [number, number][] = [[49.3, -12], [50.4, -15.5], [49.4, -17.5], [47.7, -25], [45, -25.5], [43.7, -22], [44.3, -16.5], [47.2, -15]];
const LON0 = -17.5, LON1 = 51.3, LAT0 = 37.3, LAT1 = -34.8;
/** Projette le contour pour une carte de largeur w centrée en (cx, cy). */
const project = (pts: [number, number][], cx: number, cy: number, w: number) => {
  const h = (w * (LAT0 - LAT1)) / (LON1 - LON0);
  return pts.map(([lo, la]) => [cx - w / 2 + ((lo - LON0) / (LON1 - LON0)) * w, cy - h / 2 + ((LAT0 - la) / (LAT0 - LAT1)) * h] as [number, number]);
};
const toPath = (p: [number, number][]) => "M " + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ") + " Z";

/* ---------- Ciel, étoiles, lune, horizon, lucioles ---------- */
const STARS = Array.from({ length: 170 }).map((_, i) => ({
  x: random(`sx${i}`) * (W + 400) - 200,
  y: random(`sy${i}`) * 1500 - 100,
  r: 1 + random(`sr${i}`) * 2.6,
  ph: random(`sp${i}`) * 6.28,
  sp: 0.6 + random(`sv${i}`) * 1.6,
}));

const Sky: React.FC<{ t: number; moon?: number }> = ({ t, moon = 1 }) => {
  const rot = 22 * sm(t, 16.9, 19.4); // « timelapse » du baobab : le ciel tourne
  const drift = t * 2.2;
  const shoot = sm(t, 2.3, 3.2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #03060B 0%, #081320 45%, #10202E 72%, #1A2430 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 88%, rgba(227,162,119,0.16) 0%, rgba(0,0,0,0) 55%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${rot} 540 200) translate(${-drift} 0)`}>
          {STARS.map((s, i) => {
            const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
            return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={i % 7 === 0 ? C.goldPale : "#EAF2FF"} opacity={tw * 0.9} />;
          })}
        </g>
        {shoot > 0 && shoot < 1 ? (
          <line
            x1={160 + shoot * 420}
            y1={330 + shoot * 200}
            x2={160 + shoot * 420 - 120}
            y2={330 + shoot * 200 - 57}
            stroke="#FFF4E0"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={Math.sin(shoot * Math.PI) * 0.8}
          />
        ) : null}
        {/* Lune (croissant) */}
        <defs>
          <mask id="moonmask">
            <rect x={0} y={0} width={W} height={H} fill="black" />
            <circle cx={880} cy={330} r={54} fill="white" />
            <circle cx={904} cy={313} r={49} fill="black" />
          </mask>
          <radialGradient id="moonglow">
            <stop offset="0%" stopColor="rgba(247,217,139,0.35)" />
            <stop offset="100%" stopColor="rgba(247,217,139,0)" />
          </radialGradient>
        </defs>
        <g opacity={moon}>
          <circle cx={880} cy={330} r={190} fill="url(#moonglow)" />
          <rect x={0} y={0} width={W} height={H} fill={C.goldPale} mask="url(#moonmask)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Horizon: React.FC<{ y?: number; rim?: number }> = ({ y = 1480, rim = 0.18 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <path d={`M -20 ${y - 30} C 200 ${y - 110}, 380 ${y - 20}, 560 ${y - 70} S 900 ${y - 140}, 1100 ${y - 60} L 1100 ${H} L -20 ${H} Z`} fill="#0C1620" />
    <path d={`M -20 ${y + 30} C 240 ${y - 30}, 420 ${y + 50}, 640 ${y + 10} S 960 ${y - 20}, 1100 ${y + 20} L 1100 ${H} L -20 ${H} Z`} fill="#05080C" stroke={`rgba(240,195,107,${rim})`} strokeWidth={2} />
  </svg>
);

const FIREFLIES = Array.from({ length: 26 }).map((_, i) => ({
  x: random(`fx${i}`) * W,
  y: 900 + random(`fy${i}`) * 650,
  ph: random(`fp${i}`) * 6.28,
}));
const Fireflies: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 1 }) => (
  <AbsoluteFill style={{ opacity }}>
    {FIREFLIES.map((f, i) => {
      const x = f.x + Math.sin(t * 0.5 + f.ph) * 40;
      const y = f.y + Math.cos(t * 0.4 + f.ph * 1.3) * 30 - ((t * 6 + i * 13) % 80);
      const o = 0.25 + 0.75 * Math.max(0, Math.sin(t * 1.4 + f.ph));
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: 7, height: 7, borderRadius: 7, background: "#FFE7A6", opacity: o, boxShadow: "0 0 14px 4px rgba(255,200,100,0.55)" }} />;
    })}
  </AbsoluteFill>
);

/* ---------- Baobab (silhouette, peut pousser) ---------- */
const BRANCHES: { d: string; w: number }[] = [
  { d: "M -40 -335 Q -110 -390 -150 -430 T -230 -450", w: 24 },
  { d: "M -20 -340 Q -45 -420 -70 -470 T -100 -525", w: 20 },
  { d: "M 0 -340 Q 5 -430 10 -520", w: 18 },
  { d: "M 20 -340 Q 60 -420 85 -470 T 80 -530", w: 20 },
  { d: "M 40 -335 Q 110 -385 160 -420 T 240 -440", w: 24 },
  { d: "M -150 -430 Q -160 -470 -150 -500", w: 10 },
  { d: "M 160 -420 Q 175 -460 165 -495", w: 10 },
  { d: "M -70 -470 Q -30 -495 -20 -510", w: 8 },
];
const Baobab: React.FC<{ x: number; y: number; scale: number; grow?: number; rim?: number; fill?: string }> = ({ x, y, scale, grow = 1, rim = 0.5, fill = "#07090C" }) => {
  const trunk = clamp(grow / 0.55);
  const br = clamp((grow - 0.45) / 0.55);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: `drop-shadow(0 0 6px rgba(240,195,107,${rim}))` }}>
        <g transform={`scale(${0.25 + 0.75 * trunk} ${trunk})`}>
          <path d="M -85 0 C -112 -150, -78 -280, -50 -342 L 50 -342 C 78 -280, 112 -150, 85 0 Z" fill={fill} />
        </g>
        {br > 0
          ? BRANCHES.map((b, i) => (
              <path key={i} d={b.d} fill="none" stroke={fill} strokeWidth={b.w} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(br * 1.3 - i * 0.04)} />
            ))
          : null}
      </g>
    </svg>
  );
};

/* ---------- Silhouette humaine (bâtisseur, debout, assis) ---------- */
type Pose = "build" | "stand" | "sit";
const Figure: React.FC<{ x: number; y: number; scale: number; pose: Pose; angle?: number; fill?: string; rim?: string; opacity?: number }> = ({ x, y, scale, pose, angle = 0, fill = "#0D0805", rim = "rgba(240,160,80,0.65)", opacity = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}>
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${angle})`} style={{ filter: `drop-shadow(0 0 5px ${rim})` }} stroke={fill} strokeLinecap="round" fill={fill}>
      {pose === "sit" ? (
        <>
          <line x1={-14} y1={-70} x2={46} y2={-66} strokeWidth={20} />
          <line x1={46} y1={-66} x2={50} y2={0} strokeWidth={17} />
          <path d="M -36 -175 L 10 -175 L 6 -72 L -30 -72 Z" stroke="none" />
          <circle cx={-12} cy={-200} r={21} stroke="none" />
          <line x1={-2} y1={-165} x2={42} y2={-80} strokeWidth={12} />
        </>
      ) : (
        <>
          <line x1={-12} y1={0} x2={-7} y2={-110} strokeWidth={18} />
          <line x1={12} y1={0} x2={7} y2={-110} strokeWidth={18} />
          <path d="M -27 -202 L 27 -202 L 17 -104 L -17 -104 Z" stroke="none" />
          <circle cx={0} cy={-226} r={21} stroke="none" />
          {pose === "build" ? (
            <>
              <line x1={-24} y1={-196} x2={-32} y2={-258} strokeWidth={13} />
              <line x1={24} y1={-196} x2={32} y2={-258} strokeWidth={13} />
              <rect x={-44} y={-292} width={88} height={36} rx={10} stroke="none" />
            </>
          ) : (
            <>
              <line x1={-27} y1={-196} x2={-34} y2={-110} strokeWidth={12} />
              <line x1={27} y1={-196} x2={34} y2={-110} strokeWidth={12} />
            </>
          )}
        </>
      )}
    </g>
  </svg>
);

/** Braise dans la poitrine (cœur qui bat lentement). */
const Ember: React.FC<{ x: number; y: number; power: number; t: number }> = ({ x, y, power, t }) => {
  if (power <= 0) return null;
  const beat = 1 + 0.22 * Math.pow(Math.max(0, Math.sin((t * Math.PI * 2) / 1.3)), 6);
  const r = 26 * beat * (0.6 + 0.4 * power);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", left: -r * 5, top: -r * 5, width: r * 10, height: r * 10, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,170,70,${0.42 * power}) 0%, rgba(255,120,30,${0.14 * power}) 35%, rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%", background: "radial-gradient(circle, #FFF1C4 0%, #FFC861 40%, #FF8A2A 100%)", opacity: power, boxShadow: `0 0 ${40 * power}px rgba(255,170,70,0.9)` }} />
    </div>
  );
};

/* ---------- Texte du poème, mot à mot ---------- */
type Card = { lines: string[]; y: number; end: number; size?: number; gold?: string[]; allGold?: boolean; color?: string };
const CARDS: Card[] = [
  { lines: ["Ce soir, tu es fatigué.", "Je le sais."], y: 1080, end: 4.05, gold: ["fatigué."] },
  { lines: ["Tu as donné beaucoup,", "et reçu si peu."], y: 1080, end: 6.95 },
  { lines: ["Mais écoute-moi bien,", "enfant d'Afrique :"], y: 1080, end: 9.7, gold: ["d'Afrique :"] },
  { lines: ["aucune nuit n'a jamais", "éteint le feu."], y: 1080, end: 12.75, gold: ["feu."] },
  { lines: ["Tu n'es pas en retard.", "Tu n'es pas perdu."], y: 650, end: 16.42 },
  { lines: ["Le baobab n'a pas grandi", "en un jour."], y: 630, end: 19.32, gold: ["baobab"] },
  { lines: ["Chaque petit pas,", "même lent, même seul,"], y: 630, end: 22.42 },
  { lines: ["te rapproche du rêve", "que tu portes toujours."], y: 630, end: 25.45, gold: ["rêve"] },
  { lines: ["Dans tes veines coule", "le sang des bâtisseurs,"], y: 620, end: 28.58, gold: ["bâtisseurs,"] },
  { lines: ["de ceux qui tombaient…", "et se relevaient."], y: 630, end: 31.42, gold: ["relevaient."] },
  { lines: ["Leur courage n'est pas parti.", "Il dort en toi."], y: 630, end: 34.32, gold: ["courage"] },
  { lines: ["Il attend le matin", "pour se réveiller."], y: 630, end: 37.4, gold: ["matin"] },
  { lines: ["Alors repose-toi,", "mais ne lâche rien."], y: 620, end: 40.38, gold: ["rien."] },
  { lines: ["Ferme les yeux,", "ton rêve veille sur toi."], y: 600, end: 43.68, gold: ["rêve"] },
  { lines: ["Demain, le soleil se lève", "sur l'Afrique,"], y: 420, end: 46.58, gold: ["soleil", "l'Afrique,"] },
  { lines: ["et ce soleil-là se lève", "aussi pour toi."], y: 420, end: 49.8, gold: ["toi."] },
  { lines: ["Dors bien."], y: 860, end: 51.35, size: 84 },
  { lines: ["Tu es plus fort", "que tu ne crois."], y: 860, end: 55.45, size: 96, allGold: true },
  { lines: ["Bonne nuit."], y: 1180, end: 55.75, size: 92, color: C.ivory },
];
/** Chaque mot affiché reçoit le temps du mot prononcé correspondant (même ordre, 132 mots). */
const TIMED = (() => {
  let k = 0;
  const out = CARDS.map((c) => ({
    ...c,
    words: c.lines.map((ln) =>
      ln.split(" ").map((wd) => {
        const m = MOTS[k++];
        if (!m) throw new Error("Plus de mots affichés que de mots prononcés");
        return { w: wd, at: m[1] };
      }),
    ),
  }));
  if (k !== MOTS.length) throw new Error(`Mots affichés ${k} / prononcés ${MOTS.length}`);
  return out;
})();

const Verse: React.FC<{ t: number }> = ({ t }) => (
  <>
    {TIMED.map((c, i) => {
      const start = c.words[0][0].at - 0.2;
      if (t < start || t > c.end) return null;
      const o = 1 - sm(t, c.end - 0.45, c.end);
      const size = c.size ?? 60;
      return (
        <AbsoluteFill key={i} style={{ opacity: o }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: c.y - 230, height: 460, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(3,5,9,0.62) 0%, rgba(3,5,9,0) 100%)" }} />
          <div style={{ position: "absolute", left: 50, right: 50, top: c.y, transform: "translateY(-50%)", textAlign: "center" }}>
            {c.words.map((line, li) => (
              <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.3, lineHeight: 1.3 }}>
                {line.map((wd, wi) => {
                  const p = sm(t, wd.at - 0.06, wd.at + 0.3);
                  const gold = c.allGold || (c.gold ?? []).includes(wd.w);
                  return (
                    <span
                      key={wi}
                      style={{
                        display: "inline-block",
                        fontFamily: cinzel,
                        fontWeight: 700,
                        fontSize: size,
                        color: gold ? C.gold : c.color ?? C.ivory,
                        opacity: p,
                        transform: `translateY(${(1 - p) * 18}px)`,
                        filter: `blur(${(1 - p) * 6}px)`,
                        textShadow: gold ? "0 0 26px rgba(240,195,107,0.55), 0 4px 18px rgba(0,0,0,0.95)" : "0 4px 20px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.8)",
                      }}
                    >
                      {wd.w}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      );
    })}
  </>
);

/* ---------- Scène A · le feu qui résiste (0 → 12,9 s) ---------- */
const CONST_PTS = project(AFRICA, 540, 560, 500).filter((_, i) => i % 2 === 0);
const Constellation: React.FC<{ t: number; drawFrom: number; drawDur: number; opacity: number; pts?: [number, number][] }> = ({ t, drawFrom, drawDur, opacity, pts = CONST_PTS }) => {
  const p = sm(t, drawFrom, drawFrom + drawDur);
  const n = pts.length;
  const shown = p * n;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity }}>
      <path d={toPath(pts)} fill="none" stroke="rgba(247,217,139,0.55)" strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {pts.map(([x, y], i) =>
        i < shown ? <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3} fill={C.goldPale} opacity={0.6 + 0.4 * Math.sin(t * 2 + i)} style={{ filter: "drop-shadow(0 0 6px rgba(247,217,139,0.9))" }} /> : null,
      )}
    </svg>
  );
};

const SceneFire: React.FC<{ t: number }> = ({ t }) => {
  const push = 1 + 0.32 * easeInOut(clamp(t / 12.6));
  const wind = sm(t, 5.0, 5.7) * (1 - sm(t, 6.4, 7.4));
  const flare = sm(t, 10.0, 10.9);
  const power = clamp(0.95 - 0.5 * wind + 0.75 * flare, 0.3, 1.8);
  return (
    <AbsoluteFill>
      <Constellation t={t} drawFrom={7.3} drawDur={2.3} opacity={1 - 0.45 * sm(t, 10, 11)} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "540px 1470px" }}>
        <Horizon />
        <Baobab x={850} y={1455} scale={0.33} rim={0.25} />
        <div style={{ position: "absolute", left: 540 - 300, top: 1380, width: 600, height: 200, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(255,150,60,${0.28 * power}) 0%, rgba(0,0,0,0) 70%)` }} />
        <Figure x={430} y={1500} scale={0.5} pose="sit" rim="rgba(255,150,60,0.8)" />
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `skewX(${-wind * 10}deg)`, transformOrigin: "540px 1490px" }}>
          <Flame x={540} y={1490} size={58} power={power} seed="bn" />
        </div>
        <Embers x={540 + wind * 40} y={1440} count={22} spread={70} power={0.4 + 0.6 * flare} />
      </AbsoluteFill>
      {/* Vent */}
      {wind > 0.01 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: wind * 0.55 }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const y = 1000 + random(`wy${i}`) * 520;
            const x = ((t * 900 + random(`wx${i}`) * 1400) % 1600) - 300;
            return <line key={i} x1={x} y1={y} x2={x + 220} y2={y - 8} stroke="rgba(200,220,235,0.6)" strokeWidth={2} strokeLinecap="round" />;
          })}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Scène B · le chemin, la graine, les petits pas (12,6 → 25,6 s) ---------- */
const P0: [number, number] = [540, 1780], P1: [number, number] = [260, 1520], P2: [number, number] = [820, 1360], P3: [number, number] = [600, 1190];
const bez = (u: number): [number, number] => {
  const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
  return [a * P0[0] + b * P1[0] + c * P2[0] + d * P3[0], a * P0[1] + b * P1[1] + c * P2[1] + d * P3[1]];
};
const pathPoly = (umax: number) => {
  const L: [number, number][] = [], R: [number, number][] = [];
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * umax;
    const [x, y] = bez(u);
    const [x2, y2] = bez(Math.min(1, u + 0.01));
    const dx = x2 - x, dy = y2 - y, len = Math.hypot(dx, dy) || 1;
    const half = lerp(150, 8, u);
    L.push([x - (dy / len) * half, y + (dx / len) * half]);
    R.push([x + (dy / len) * half, y - (dx / len) * half]);
  }
  return "M " + [...L, ...R.reverse()].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ") + " Z";
};
const STEPS = Array.from({ length: 22 }).map((_, k) => 0.03 + k * 0.03);

const SceneChemin: React.FC<{ t: number }> = ({ t }) => {
  const reveal = sm(t, 12.9, 16.0);
  const dimPath = 1 - 0.75 * sm(t, 16.4, 16.9) * (1 - sm(t, 19.2, 20.0));
  const walkU = lerp(0.04, 0.56, clamp((t - 19.6) / 5.8));
  const walking = t > 19.4;
  // Baobab : pousse au premier plan, puis rejoint l'horizon près de l'étoile du rêve
  const g = easeInOut(clamp((t - 17.1) / 2.0));
  const move = easeInOut(clamp((t - 19.3) / 1.2));
  const bx = lerp(540, 780, move), by = lerp(1540, 1200, move), bs = lerp(1.05, 0.24, move);
  const seed = sm(t, 16.5, 16.9) * (1 - sm(t, 17.3, 17.8));
  const star = 0.45 + 0.55 * sm(t, 22.7, 24.2);
  const [sx, sy] = [P3[0], P3[1] - 60];
  return (
    <AbsoluteFill>
      <Horizon y={1200} rim={0.12} />
      {/* étoile du rêve */}
      <div style={{ position: "absolute", left: sx - 170, top: sy - 170, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,230,160,${0.55 * star}) 0%, rgba(240,195,107,${0.18 * star}) 30%, rgba(0,0,0,0) 70%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${sx} ${sy}) rotate(${t * 6}) scale(${0.8 + 0.4 * star})`} fill="#FFF1C4" style={{ filter: "drop-shadow(0 0 12px rgba(255,220,140,0.95))" }}>
          <path d="M 0 -46 L 7 -7 L 46 0 L 7 7 L 0 46 L -7 7 L -46 0 L -7 -7 Z" />
        </g>
      </svg>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: dimPath }}>
        <path d={pathPoly(Math.max(0.001, reveal))} fill="rgba(240,195,107,0.10)" stroke="rgba(240,195,107,0.45)" strokeWidth={2} />
        {STEPS.map((u, k) => {
          const appear = walking ? (u < walkU ? 1 : 0) : sm(reveal, u - 0.03, u + 0.02);
          if (appear <= 0) return null;
          const [x, y] = bez(u);
          const side = k % 2 === 0 ? -1 : 1;
          const sc = lerp(1, 0.25, u);
          return <ellipse key={k} cx={x + side * 22 * sc} cy={y} rx={11 * sc} ry={20 * sc} fill={C.gold} opacity={0.75 * appear} style={{ filter: "drop-shadow(0 0 8px rgba(240,195,107,0.9))" }} />;
        })}
      </svg>
      {/* graine qui germe */}
      {seed > 0.01 ? (
        <>
          <div style={{ position: "absolute", left: 540 - 90, top: 1540 - 90, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,210,120,${0.7 * seed}) 0%, rgba(0,0,0,0) 65%)` }} />
          <div style={{ position: "absolute", left: 540 - 16, top: 1540 - 11, width: 32, height: 22, borderRadius: "50%", background: C.goldPale, opacity: seed }} />
        </>
      ) : null}
      {t > 16.9 ? <Baobab x={bx} y={by} scale={bs} grow={g} rim={lerp(0.85, 0.35, move)} fill="#0A0806" /> : null}
      {walking ? (() => {
        const [x, y] = bez(walkU);
        const sc = lerp(2.4, 1.0, walkU / 0.56);
        return <Walker x={x} y={y} phase={t * 7} kind={0} scale={sc} />;
      })() : null}
    </AbsoluteFill>
  );
};

/* ---------- Scène C · veines, bâtisseurs, la braise (25,3 → 37,6 s) ---------- */
type Seg = { x1: number; y1: number; cx: number; cy: number; x2: number; y2: number; d: number };
const VEINS: Seg[] = (() => {
  const out: Seg[] = [];
  const grow = (x: number, y: number, ang: number, len: number, d: number, id: string) => {
    if (d > 6) return;
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    const bend = (random(`vb${id}`) - 0.5) * len * 0.5;
    out.push({ x1: x, y1: y, cx: (x + x2) / 2 - Math.sin(ang) * bend, cy: (y + y2) / 2 + Math.cos(ang) * bend, x2, y2, d });
    const n = random(`vn${id}`) > 0.7 ? 3 : 2;
    for (let k = 0; k < n; k++) {
      const spread = (0.35 + random(`va${id}${k}`) * 0.3) * (k - (n - 1) / 2) * 1.6;
      grow(x2, y2, ang + spread, len * (0.74 + random(`vl${id}${k}`) * 0.1), d + 1, `${id}${k}`);
    }
  };
  grow(540, 1800, -Math.PI / 2, 250, 0, "r");
  return out;
})();

const BUILDERS = [150, 330, 540, 750, 930];

const SceneSang: React.FC<{ t: number }> = ({ t }) => {
  const veinsO = win(t, 25.2, 29.4, 0.9);
  const buildO = win(t, 28.6, 32.6, 0.7);
  const toiO = sm(t, 31.7, 32.7);
  const ember = sm(t, 33.25, 33.95) + 0.25 * sm(t, 35.9, 36.6);
  const dawnLine = sm(t, 34.9, 36.4);
  return (
    <AbsoluteFill>
      {/* 1 · veines dorées */}
      {veinsO > 0 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: veinsO, filter: "drop-shadow(0 0 10px rgba(255,160,70,0.85))" }}>
          {VEINS.map((v, i) => {
            const st = 25.5 + v.d * 0.38;
            const p = sm(t, st, st + 0.55);
            if (p <= 0) return null;
            const pulse = 0.65 + 0.35 * Math.sin(t * 5 - v.d * 1.2);
            return (
              <path
                key={i}
                d={`M ${v.x1} ${v.y1} Q ${v.cx} ${v.cy} ${v.x2} ${v.y2}`}
                fill="none"
                stroke={v.d < 3 ? C.terracotta : C.gold}
                strokeWidth={Math.max(1.5, 16 * Math.pow(0.7, v.d))}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
                opacity={pulse}
              />
            );
          })}
        </svg>
      ) : null}
      {/* 2 · bâtisseurs qui tombent et se relèvent */}
      {buildO > 0 ? (
        <AbsoluteFill style={{ opacity: buildO }}>
          <div style={{ position: "absolute", left: -200, top: 1060, width: W + 400, height: 760, background: "radial-gradient(ellipse at 50% 50%, rgba(227,162,119,0.45) 0%, rgba(201,138,61,0.12) 40%, rgba(0,0,0,0) 70%)" }} />
          <div style={{ position: "absolute", left: 0, top: 1440, width: W, height: H - 1440, background: "#05070A", borderTop: "2px solid rgba(240,195,107,0.25)" }} />
          {/* mur qui monte */}
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 5 - (r % 2) }).map((__, c) => {
              const o = sm(t, 28.8 + r * 0.45 + c * 0.05, 29.1 + r * 0.45 + c * 0.05);
              const off = r % 2 ? 50 : 0;
              return <div key={`${r}-${c}`} style={{ position: "absolute", left: 300 + off + c * 98, top: 1386 - r * 54, width: 90, height: 48, borderRadius: 12, background: "#1A120B", border: "2px solid rgba(240,195,107,0.35)", opacity: o * 0.9 }} />;
            }),
          )}
          {BUILDERS.map((x, i) => {
            const fall = sm(t, 29.3 + i * 0.07, 29.7 + i * 0.07);
            const rise = easeInOut(clamp((t - (30.3 + i * 0.07)) / 0.7));
            const dir = i % 2 === 0 ? 1 : -1;
            const ang = dir * 58 * fall * (1 - rise);
            const dissolve = 1 - sm(t, 31.5 + i * 0.08, 32.2 + i * 0.08);
            return <Figure key={i} x={x} y={1440} scale={i === 2 ? 1.05 : 0.92} pose="build" angle={ang} opacity={dissolve} />;
          })}
        </AbsoluteFill>
      ) : null}
      {/* 3 · le courage passe en toi : particules → silhouette, braise dans la poitrine */}
      {t > 31.4 ? (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 0, top: 1430 - 2, width: W, height: 4, background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,214,140,${0.8 * dawnLine}) 50%, rgba(0,0,0,0) 100%)`, boxShadow: `0 0 ${40 * dawnLine}px rgba(255,190,100,${0.7 * dawnLine})` }} />
          <div style={{ position: "absolute", left: 0, top: 1440, width: W, height: H - 1440, background: "#05070A", opacity: toiO }} />
          <Figure x={540} y={1560} scale={1.55} pose="stand" opacity={toiO} rim="rgba(240,195,107,0.55)" />
          {Array.from({ length: 70 }).map((_, k) => {
            const i = k % 5;
            const r = random(`pp${k}`);
            const p = sm(t, 31.6 + r * 0.5, 32.9 + r * 0.6);
            if (p <= 0 || p >= 1) return null;
            const x0 = BUILDERS[i] + (random(`px${k}`) - 0.5) * 70, y0 = 1440 - random(`py${k}`) * 260;
            const x1 = 540, y1 = 1260;
            const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 300;
            const q = 1 - p;
            const x = q * q * x0 + 2 * q * p * cx + p * p * x1;
            const y = q * q * y0 + 2 * q * p * cy + p * p * y1;
            return <div key={k} style={{ position: "absolute", left: x - 4, top: y - 4, width: 8, height: 8, borderRadius: 8, background: "#FFD98A", opacity: Math.sin(p * Math.PI), boxShadow: "0 0 12px rgba(255,190,90,0.95)" }} />;
          })}
          <Ember x={540} y={1262} power={clamp(ember)} t={t} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Scène D1 · repos sous le baobab (37,2 → 40,8 s) ---------- */
const SceneRepos: React.FC<{ t: number }> = ({ t }) => {
  const flare = sm(t, 39.1, 39.7);
  return (
    <AbsoluteFill>
      <Horizon y={1500} />
      <Baobab x={420} y={1520} scale={1.15} rim={0.4} />
      <Figure x={690} y={1530} scale={0.95} pose="sit" rim="rgba(255,150,60,0.75)" />
      <Ember x={679} y={1395} power={0.55 + 0.45 * flare} t={t} />
      <Flame x={860} y={1530} size={42} power={0.8 + 0.6 * flare} seed="rp" />
      <Embers x={860} y={1490} count={14} spread={50} power={0.3 + 0.7 * flare} />
    </AbsoluteFill>
  );
};

/* ---------- Scène D2 · l'œil qui se ferme, le rêve qui veille (40,4 → 44 s) ---------- */
const CONST_SMALL = project(AFRICA, 540, 960, 340).filter((_, i) => i % 2 === 0);
const SceneOeil: React.FC<{ t: number }> = ({ t }) => {
  const close = easeInOut(clamp((t - 40.75) / 0.8));
  const ex = 540, ey = 1360, hw = 300, hOpen = 210;
  const upY = lerp(-hOpen, 95, close);
  const lowY = 120;
  const watch = sm(t, 41.9, 42.9);
  return (
    <AbsoluteFill>
      <Constellation t={t} drawFrom={41.9} drawDur={1.6} opacity={0.9} pts={CONST_SMALL} />
      <div style={{ position: "absolute", left: 540 - 240, top: 960 - 240, width: 480, height: 480, borderRadius: "50%", background: `radial-gradient(circle, rgba(247,217,139,${0.22 * watch}) 0%, rgba(0,0,0,0) 65%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 14px rgba(240,195,107,0.6))" }}>
        <defs>
          <clipPath id="eyeclip">
            <path d={`M ${ex - hw} ${ey} Q ${ex} ${ey + upY} ${ex + hw} ${ey} Q ${ex} ${ey + lowY} ${ex - hw} ${ey} Z`} />
          </clipPath>
          <radialGradient id="iris">
            <stop offset="0%" stopColor="#FFF1C4" />
            <stop offset="40%" stopColor="#F0C36B" />
            <stop offset="80%" stopColor="#B8741F" />
            <stop offset="100%" stopColor="#5a3408" />
          </radialGradient>
        </defs>
        <g clipPath="url(#eyeclip)">
          <rect x={ex - hw} y={ey - 250} width={hw * 2} height={500} fill="#120D08" />
          <circle cx={ex + Math.sin(t * 1.2) * 18} cy={ey + 6} r={92} fill="url(#iris)" />
          <circle cx={ex + Math.sin(t * 1.2) * 18} cy={ey + 6} r={34} fill="#0a0603" />
        </g>
        <path d={`M ${ex - hw} ${ey} Q ${ex} ${ey + lowY} ${ex + hw} ${ey}`} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" opacity={1 - close} />
        <path d={`M ${ex - hw} ${ey} Q ${ex} ${ey + upY} ${ex + hw} ${ey}`} fill="none" stroke={C.gold} strokeWidth={9} strokeLinecap="round" />
        {close > 0.9
          ? Array.from({ length: 7 }).map((_, i) => {
              const u = 0.2 + i * 0.1;
              const x = (1 - u) * (1 - u) * (ex - hw) + 2 * (1 - u) * u * ex + u * u * (ex + hw);
              const y = (1 - u) * (1 - u) * ey + 2 * (1 - u) * u * (ey + upY) + u * u * ey;
              const a = (u - 0.5) * 1.2;
              return <line key={i} x1={x} y1={y} x2={x + Math.sin(a) * 34} y2={y + Math.cos(a) * 34} stroke={C.gold} strokeWidth={6} strokeLinecap="round" opacity={(close - 0.9) * 10} />;
            })
          : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Scène D3 · le soleil sur l'Afrique (43,7 → 47 s) puis pour toi (46,6 → 50,4 s) ---------- */
const MAP_PTS = project(AFRICA, 540, 1185, 640);
const MAD_PTS = project(MADAGASCAR, 540, 1185, 640);
const SceneAube: React.FC<{ t: number }> = ({ t }) => {
  const dawn = sm(t, 43.9, 46.2);
  const sunP = easeInOut(clamp((t - 44.4) / 2.2));
  const sunY = lerp(1090, 720, sunP);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #03060B 0%, #0B1622 60%, #17202A 100%)" }} />
      <AbsoluteFill style={{ opacity: dawn, background: "linear-gradient(180deg, #1C1626 0%, #5B3527 38%, #C9773D 70%, #F0C36B 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 ${sunY}) rotate(${t * 4})`} opacity={0.35 * sunP}>
          {Array.from({ length: 18 }).map((_, i) => (
            <path key={i} d={`M -16 0 L 16 0 L 0 -760 Z`} fill="rgba(255,236,190,0.55)" transform={`rotate(${i * 20})`} />
          ))}
        </g>
        <circle cx={540} cy={sunY} r={300} fill="rgba(255,210,140,0.18)" opacity={sunP} />
        <circle cx={540} cy={sunY} r={118} fill="#FFE3A3" opacity={0.3 + 0.7 * sunP} style={{ filter: "drop-shadow(0 0 40px rgba(255,200,110,1))" }} />
        <path d={toPath(MAP_PTS)} fill="#0B0906" stroke={C.gold} strokeWidth={4} strokeOpacity={0.35 + 0.6 * sunP} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${8 + 18 * sunP}px rgba(240,195,107,0.8))` }} />
        <path d={toPath(MAD_PTS)} fill="#0B0906" stroke={C.gold} strokeWidth={3} strokeOpacity={0.35 + 0.6 * sunP} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

const ScenePourToi: React.FC<{ t: number }> = ({ t }) => {
  const p = easeInOut(clamp((t - 46.6) / 3.6));
  const z = lerp(1.55, 1.04, p);
  const fx = lerp(0.8, 0.5, p), fy = lerp(0.44, 0.5, p);
  const iw = W * z, ih = H * z;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile("img/racines.jpg")} style={{ position: "absolute", width: iw, height: ih, left: clamp(W / 2 - fx * iw, W - iw, 0), top: clamp(H / 2 - fy * ih, H - ih, 0) }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,6,10,0.55) 0%, rgba(5,6,10,0.15) 38%, rgba(0,0,0,0) 60%, rgba(5,6,10,0.35) 100%)" }} />
      <div style={{ position: "absolute", right: 40, bottom: 400, fontFamily: manrope, fontWeight: 600, fontSize: 22, color: "rgba(255,244,224,0.6)", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>Illustration AFROBACK</div>
    </AbsoluteFill>
  );
};

/* ---------- Scène E · retour à la nuit apaisée (49,9 → 55,6 s) ---------- */
const SceneNuit: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Horizon y={1500} rim={0.2} />
    <Baobab x={820} y={1490} scale={0.42} rim={0.3} />
    <Flame x={700} y={1520} size={26} power={0.8} seed="fin" />
    <Fireflies t={t} opacity={0.9} />
  </AbsoluteFill>
);

/* ---------- Fin AFROBACK (55,2 → 59 s) ---------- */
const Outro: React.FC<{ t: number }> = ({ t }) => {
  const o = t - 55.2;
  const rise = Easing.out(Easing.cubic)(clamp(o / 1.1));
  const leave = easeInOut(clamp((o - 1.75) / 0.6));
  const head = sm(o, 0.25, 0.9) * (1 - sm(o, 1.6, 2.1));
  const logo = sm(o, 1.95, 2.6);
  const url = sm(o, 2.35, 2.95);
  const tag = sm(o, 2.6, 3.2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(3,5,9,0.45)", opacity: sm(o, 0, 0.6) }} />
      {leave < 1 ? (
        <Phone pose={{ x: 540, y: lerp(2700, 1130, rise) + leave * 120, scale: 1.12, rotate: (1 - rise) * 6, opacity: 1 - leave }}>
          <Img src={staticFile("img/capture-app-p60-accueil.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Phone>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: head }}>
        <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 44, color: C.ivory, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>Nos histoires t'attendent sur</div>
        <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 92, color: C.gold, marginTop: 8, textShadow: "0 0 30px rgba(240,195,107,0.45)" }}>AFROBACK</div>
      </div>
      {logo > 0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 160 }}>
          <div style={{ opacity: logo, transform: `scale(${0.85 + 0.15 * logo})`, width: 320, height: 320, borderRadius: 160, overflow: "hidden", border: `5px solid ${C.gold}`, boxShadow: "0 0 90px rgba(240,195,107,0.5)" }}>
            <Img src={staticFile("img/logo-medaillon.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ height: 44 }} />
          <div style={{ opacity: logo, fontFamily: cinzel, fontWeight: 900, fontSize: 116, color: C.gold, textShadow: "0 0 30px rgba(240,195,107,0.4)", transform: `translateY(${(1 - logo) * 20}px)` }}>AFROBACK</div>
          <div style={{ opacity: tag, fontFamily: manrope, fontWeight: 700, fontSize: 40, color: C.textBody, marginTop: 6, letterSpacing: 2 }}>Retour aux origines</div>
          <div style={{ height: 34 }} />
          <div style={{ opacity: url, fontFamily: manrope, fontWeight: 800, fontSize: 64, color: C.ivory, transform: `translateY(${(1 - url) * 16}px)` }}>
            afroback<span style={{ color: C.gold }}>.app</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Composition ---------- */
export const BonneNuit: React.FC<{ withAudio: boolean }> = ({ withAudio }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const layers: [number, React.ReactNode][] = [
    [win(t, -1, 13.0), <SceneFire key="a" t={t} />],
    [win(t, 12.5, 25.7), <SceneChemin key="b" t={t} />],
    [win(t, 25.2, 37.7), <SceneSang key="c" t={t} />],
    [win(t, 37.1, 40.9), <SceneRepos key="d1" t={t} />],
    [win(t, 40.3, 44.2), <SceneOeil key="d2" t={t} />],
    [win(t, 43.6, 47.2), <SceneAube key="d3" t={t} />],
    [win(t, 46.4, 50.6), <ScenePourToi key="d4" t={t} />],
    [win(t, 49.8, 60, 0.9), <SceneNuit key="e" t={t} />],
    [sm(t, 55.2, 55.8), <Outro key="o" t={t} />],
  ];
  const intro = sm(t, 0, 0.9);
  const kicker = sm(t, 0.3, 1.0) * (1 - sm(t, 4.0, 4.8));
  return (
    <AbsoluteFill style={{ background: "#03060B" }}>
      <AbsoluteFill style={{ opacity: intro }}>
        <Sky t={t} moon={1 - sm(t, 55.1, 55.7)} />
        {layers.map(([o, node], i) => (o > 0.001 ? <AbsoluteFill key={i} style={{ opacity: o }}>{node}</AbsoluteFill> : null))}
        {t < 55.8 ? <Verse t={t} /> : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: 268, textAlign: "center", opacity: kicker, fontFamily: manrope, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: C.gold }}>
          UN POÈME AFROBACK
        </div>
        <Vig strength={0.7} />
      </AbsoluteFill>
      {withAudio ? <Audio src={staticFile("audio/mix-poeme-bonne-nuit.wav")} /> : null}
    </AbsoluteFill>
  );
};
