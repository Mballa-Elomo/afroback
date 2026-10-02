/**
 * AFROBACK · Vidéo 3 · « Celle qu'on ne plie pas » : Reine Nzinga (30 s, 9:16).
 * Script : recits/reine-nzinga/script.md · voix : recits/reine-nzinga/timing.json
 * Visuel principal : le portrait AFROBACK (heros/reine-nzinga.jpg) + scènes graphiques en traits dorés
 * (fil qui se tord, carte de la côte, théâtre d'ombres du face-à-face, compteur d'années).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, H, W, cinzel, manrope, ramp, s, popScale } from "../theme";
import { Diamonds, Grain, Karaoke, Particles, PunchWord, Shake } from "../fx";
import { ease, Embers, Illu, Caption, Vig, OutroApp, w } from "../recit-kit";

const PORTRAIT = "heros/reine-nzinga.jpg";
const R = {
  black: "#0B0806",
  terra: "#C2583A",
  terraLight: "#E3A277",
  velvet: "#6E1F24",
  sky: "#D8913E",
};

const Warm: React.FC<{ glow?: string }> = ({ glow = "rgba(216,145,62,0.16)" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${glow} 0%, #170E09 45%, ${R.black} 85%)` }} />
);

/* ---------- Scène 1 · Le nom qui se tord (0 à 2,4 s) ---------- */

const ropePath = (progress: number, frame: number, strand: number) => {
  const turns = 3 * Math.PI * 2;
  const n = 220;
  const last = Math.max(2, Math.floor(n * progress));
  let d = "";
  for (let i = 0; i < last; i++) {
    const th = (i / n) * turns;
    const r = 260 - (i / n) * 230;
    const off = strand * 9 * Math.sin(th * 5 + frame * 0.35);
    const x = 540 + (r + off) * Math.cos(th);
    const y = 820 + (r + off) * Math.sin(th);
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
};

const TwistLetters: React.FC<{ text: string; at: number; size: number; straight: number }> = ({ text, at, size, straight }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "center", fontFamily: cinzel, fontWeight: 900, fontSize: size, lineHeight: 1, color: C.gold }}>
      {text.split("").map((ch, i) => {
        const st = at + i * 2;
        const o = frame < st ? 0 : ramp(frame, st, 5, 0, 1);
        const sign = i % 2 ? 1 : -1;
        const twist = (1 - straight) * sign * (28 + 6 * Math.sin(frame * 0.3 + i));
        return (
          <span key={i} style={{ display: "inline-block", opacity: o, transform: `rotate(${twist}deg) skewX(${twist * 0.5}deg) translateY(${(1 - straight) * sign * 18}px)`, textShadow: "0 8px 30px rgba(0,0,0,0.85), 0 0 40px rgba(240,195,107,0.35)" }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = ramp(frame, 0, 30, 0.12, 1, ease);
  const coil = ramp(frame, 34, 12, 1, 0, Easing.in(Easing.cubic));
  const straight = ramp(frame, 56, 6, 0, 1, Easing.out(Easing.back(2)));
  const dive = ramp(frame, 62, 10, 1, 9, Easing.in(Easing.exp));
  const fade = ramp(frame, 66, 6, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${dive})`, transformOrigin: "540px 870px" }}>
        <Warm glow="rgba(240,195,107,0.10)" />
        <AbsoluteFill style={{ opacity: coil, transform: `rotate(${frame * 2.5}deg) scale(${0.6 + 0.4 * coil})`, transformOrigin: "540px 820px" }}>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 14px rgba(240,195,107,0.7))" }}>
            <path d={ropePath(draw, frame, 1)} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
            <path d={ropePath(draw, frame, -1)} fill="none" stroke={C.goldPale} strokeWidth={5} strokeLinecap="round" />
          </svg>
        </AbsoluteFill>
        <Embers x={540} y={900} count={20} spread={300} power={0.7} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 740 }}>
          <div style={{ transform: `scale(${frame >= 56 ? popScale(frame, 56, 8, 1.12) : 1})` }}>
            <TwistLetters text="NJINGA" at={38} size={190} straight={straight} />
          </div>
        </AbsoluteFill>
        <Caption text="« tordre, enrouler »" at={50} y={985} size={52} color={C.ivory} italic />
        <Caption text="Reine de Ndongo et de Matamba · Angola · XVIIe siècle" at={16} y={1420} size={32} color="rgba(255,244,224,0.75)" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#2a1708", opacity: fade }} />
      <Vig />
    </AbsoluteFill>
  );
};

/* ---------- Scène 2 · Jamais pliée (2,4 à 4,2 s) ---------- */

const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const u = ramp(frame, 0, 50, 0, 1, ease);
  const cx = interpolate(u, [0, 1], [0.6, 0.55]);
  const cy = interpolate(u, [0, 1], [0.19, 0.37]);
  const zoom = interpolate(u, [0, 1], [3.2, 2.2]);
  const shine = ramp(frame, 0, 26, -30, 130, Easing.linear);
  const out = ramp(frame, 46, 8, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shake hits={[{ at: 13, amp: 10, dur: 4 }, { at: 34, amp: 16, dur: 5 }]}>
        <AbsoluteFill style={{ transform: `translateX(${-out * 260}px)` }}>
          <Illu src={PORTRAIT} cx={cx} cy={cy} zoom={zoom} />
          <AbsoluteFill style={{ background: `linear-gradient(110deg, transparent ${shine - 15}%, rgba(255,230,170,0.28) ${shine}%, transparent ${shine + 15}%)`, mixBlendMode: "screen" }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 55%,rgba(0,0,0,0.75) 100%)" }} />
        </AbsoluteFill>
        <Embers x={540} y={1300} count={14} spread={700} power={0.6} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 1130 }}>
          <PunchWord text="JAMAIS" at={12} size={150} />
          <div style={{ height: 14 }} />
          <PunchWord text="PLIÉE." at={33} size={150} color={C.ivory} />
        </AbsoluteFill>
      </Shake>
      <AbsoluteFill style={{ background: R.black, opacity: out }} />
      <Vig strength={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 3 · Luanda, 1621 (4,2 à 7,4 s) ---------- */

const coastD = "M 360 180 C 330 360, 300 520, 318 700 S 300 900, 340 1060 S 390 1400, 420 1700";
const kwanzaD = "M 330 830 C 430 800, 480 900, 580 880 S 720 780, 800 860 S 930 960, 1100 900";
const routeD = "M 790 760 C 650 700, 480 820, 330 740";

const Ship: React.FC<{ x: number; y: number; frame: number; k: number }> = ({ x, y, frame, k }) => {
  const bob = Math.sin(frame * 0.12 + k) * 6;
  const rock = Math.sin(frame * 0.1 + k) * 3;
  return (
    <svg width={140} height={140} viewBox="-70 -110 140 140" style={{ position: "absolute", left: x - 70, top: y - 110 + bob, transform: `rotate(${rock}deg)`, overflow: "visible" }}>
      <g fill="none" stroke={C.ivory} strokeWidth={4} strokeLinejoin="round" opacity={0.85}>
        <path d="M -55 0 L 55 0 L 40 22 L -42 22 Z" fill="rgba(255,244,224,0.15)" />
        <line x1={0} y1={0} x2={0} y2={-100} />
        <path d="M 4 -92 L 42 -86 L 40 -50 L 4 -54 Z" fill="rgba(255,244,224,0.25)" />
        <path d="M 4 -46 L 46 -40 L 44 -8 L 4 -10 Z" fill="rgba(255,244,224,0.25)" />
        <path d="M -4 -80 L -36 -60 L -4 -40 Z" fill="rgba(255,244,224,0.2)" />
      </g>
    </svg>
  );
};

const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const coast = ramp(frame, 0, 14, 0.35, 1, ease);
  const river = ramp(frame, 3, 18, 0, 1, ease);
  const route = ramp(frame, 22, 26, 0, 1, ease);
  const z = ramp(frame, 50, 46, 1, 1.45, ease);
  const toWall = ramp(frame, 84, 12, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: R.black }}>
      <Warm glow="rgba(216,145,62,0.12)" />
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "330px 760px" }}>
        <Diamonds id="m3" size={110} opacity={0.04} />
        {/* océan */}
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(60,90,110,0.28) 0%, rgba(60,90,110,0.08) 30%, rgba(0,0,0,0) 34%)" }} />
        <div style={{ position: "absolute", left: 50, top: 1020, fontFamily: cinzel, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: "rgba(191,215,230,0.7)", transform: "rotate(-90deg)", transformOrigin: "0 0" }}>OCÉAN ATLANTIQUE</div>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path d={coastD} fill="none" stroke={C.gold} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - coast} strokeLinecap="round" />
          <path d={kwanzaD} fill="none" stroke="#7FA3BC" strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - river} strokeLinecap="round" />
          <path d={routeD} fill="none" stroke={C.goldPale} strokeWidth={7} strokeDasharray="3 20" strokeLinecap="round" style={{ clipPath: `inset(0 0 0 ${(1 - route) * 100}%)` }} />
        </svg>
        <div style={{ position: "absolute", left: 640, top: 930, fontFamily: cinzel, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: "rgba(191,215,230,0.85)", opacity: river }}>KWANZA</div>
        <div style={{ position: "absolute", left: 700, top: 680, fontFamily: cinzel, fontWeight: 900, fontSize: 44, letterSpacing: 8, color: C.gold, opacity: ramp(frame, 6, 10, 0, 1) }}>NDONGO</div>
        <div style={{ position: "absolute", left: 790 - 14, top: 760 - 14, width: 28, height: 28, borderRadius: 14, background: C.gold, opacity: ramp(frame, 6, 10, 0, 1) }} />
        {/* Luanda + fort */}
        <div style={{ position: "absolute", left: 330 - 16, top: 740 - 16, width: 32, height: 32, borderRadius: 16, background: C.ivory, boxShadow: `0 0 ${24 + 10 * Math.sin(frame * 0.3)}px ${C.gold}`, opacity: ramp(frame, 40, 8, 0, 1) }} />
        <svg width={120} height={90} viewBox="0 0 120 90" style={{ position: "absolute", left: 360, top: 640, opacity: ramp(frame, 52, 10, 0, 1) }}>
          <path d="M5 85 L5 35 L20 35 L20 25 L32 25 L32 35 L50 35 L50 15 L70 15 L70 35 L88 35 L88 25 L100 25 L100 35 L115 35 L115 85 Z" fill="rgba(255,244,224,0.12)" stroke={C.ivory} strokeWidth={3} />
        </svg>
        <div style={{ position: "absolute", left: 390, top: 590, fontFamily: cinzel, fontWeight: 900, fontSize: 36, letterSpacing: 6, color: C.ivory, opacity: ramp(frame, 40, 8, 0, 1) }}>LUANDA</div>
        {frame >= 44 ? (
          <>
            <Ship x={170} y={560} frame={frame} k={0} />
            <Ship x={200} y={900} frame={frame} k={2} />
            <Ship x={110} y={1180} frame={frame} k={4} />
          </>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,0.75) 70%,rgba(0,0,0,0.75) 85%,rgba(0,0,0,0) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 1190 }}>
        <PunchWord text="LUANDA · 1621" at={30} size={104} color={C.ivory} shine={[36, 56]} />
      </AbsoluteFill>
      <Caption text="négocier la paix avec les Portugais" at={42} y={1330} size={44} color={C.gold} />
      <AbsoluteFill style={{ background: "#B8662A", opacity: toWall }} />
      <Vig />
    </AbsoluteFill>
  );
};

/* ---------- Théâtre d'ombres : la salle (scènes 4 et 5) ---------- */

const FLOOR = 1380;

const SIL = "#140904";

/** Officiel portugais assis, de profil vers la gauche (origine : sol sous l'avant du siège ; œil à -615). Chapeau à plume, fraise, cape, chaise sculptée. */
const Official: React.FC<{ color?: string }> = ({ color = SIL }) => (
  <g fill={color}>
    {/* chaise à haut dossier */}
    <path d="M 58 -300 L 64 -730 Q 80 -800 100 -730 L 106 -300 Z" />
    <circle cx={82} cy={-805} r={15} />
    <rect x={-92} y={-318} width={200} height={26} rx={6} />
    <path d="M -86 -292 Q -66 -210 -88 -130 Q -66 -60 -86 0 L -66 0 Q -54 -60 -72 -130 Q -50 -210 -68 -292 Z" />
    <rect x={86} y={-292} width={16} height={292} />
    {/* jambes et bottes */}
    <path d="M 52 -300 L -98 -312 Q -116 -334 -98 -356 L 44 -366 Z" />
    <path d="M -114 -344 Q -128 -200 -118 -34 L -158 -24 Q -168 -6 -156 0 L -78 0 L -84 -40 Q -78 -200 -72 -336 Z" />
    {/* buste, cape, bras */}
    <path d="M 62 -330 Q 78 -452 42 -560 L -22 -566 Q -48 -452 -32 -340 Z" />
    <path d="M 46 -560 Q 128 -452 122 -300 L 58 -300 Z" />
    <path d="M 22 -540 Q -8 -452 -62 -402 L -50 -386 Q 6 -430 42 -520 Z" />
    <circle cx={-66} cy={-392} r={15} />
    {/* fraise */}
    {[-40, -24, -8, 8, 24, 40, 54].map((x) => (
      <circle key={x} cx={x} cy={-566} r={13} />
    ))}
    {/* tête, nez, barbe */}
    <circle cx={4} cy={-614} r={38} />
    <path d="M -30 -628 L -48 -606 L -30 -598 Z" />
    <path d="M -28 -594 Q -22 -556 8 -578 Z" />
    {/* chapeau à larges bords et plume */}
    <ellipse cx={6} cy={-650} rx={92} ry={12} />
    <path d="M -36 -652 Q -32 -708 10 -712 Q 48 -708 48 -652 Z" />
    <path d="M 42 -694 Q 116 -728 128 -650 Q 96 -694 46 -678 Z" />
  </g>
);

/** Njinga assise, de profil vers la gauche (avant symétrie) : couronne haute à plume, bijoux d'or, robe et étole. Œil à -614. */
const Queen: React.FC = () => (
  <g>
    <g fill={SIL}>
      <path d="M 62 -300 L -112 -312 Q -150 -320 -152 -282 L -146 -70 Q -120 -56 -92 -70 L -96 -276 L 58 -270 Z" />
      <path d="M -150 -74 L -176 -50 L -170 -40 L -100 -48 L -96 -70 Z" />
      <path d="M 52 -330 Q 62 -452 32 -556 L -16 -562 Q -42 -452 -26 -336 Z" />
      <path d="M 36 -556 Q 114 -482 146 -246 Q 124 -236 102 -258 Q 82 -420 26 -520 Z" />
      <path d="M 22 -530 Q -40 -472 -116 -468 L -116 -452 Q -40 -450 32 -498 Z" />
      <circle cx={-122} cy={-460} r={14} />
      <rect x={-9} y={-592} width={22} height={38} />
      <circle cx={0} cy={-614} r={36} />
      <path d="M -32 -626 L -46 -606 L -30 -600 Z" />
      <path d="M -40 -642 L -44 -724 Q -22 -742 0 -734 Q 22 -742 44 -724 L 40 -642 Z" />
      {[-34, -12, 12, 34].map((x) => (
        <path key={x} d={`M ${x - 9} -730 L ${x} -756 L ${x + 9} -730 Z`} />
      ))}
      <path d="M 6 -740 Q 34 -812 78 -800 Q 44 -780 22 -738 Z" />
    </g>
    {/* bijoux d'or sur la silhouette */}
    <g fill={C.gold}>
      {[-30, -15, 0, 15, 30].map((x, i) => (
        <circle key={x} cx={x} cy={-690 + (i % 2) * 8} r={6} />
      ))}
      {[-14, -6, 2, 10, 18].map((x, i) => (
        <circle key={x} cx={x} cy={-552 - Math.abs(i - 2) * 4} r={5} />
      ))}
      <circle cx={-130} cy={-462} r={4} />
    </g>
  </g>
);

/** Servante à genoux et sur les mains, digne, tête baissée, vers la gauche (avant symétrie). Dos à -300. */
const Servant: React.FC = () => (
  <g fill={SIL}>
    <path d="M 112 -250 Q 102 -312 22 -316 L -112 -306 Q -152 -300 -152 -260 L -142 -230 Q -20 -220 102 -214 Z" />
    <path d="M 62 -240 Q 92 -150 142 -100 L 172 -110 Q 132 -170 112 -250 Z" />
    <path d="M 72 -240 L 112 -20 L 72 -14 L 42 -230 Z" />
    <path d="M 72 -30 L 222 -18 L 222 0 L 72 0 Z" />
    <path d="M -122 -282 L -127 0 L -97 0 L -97 -272 Z" />
    <circle cx={-178} cy={-250} r={32} />
    <path d="M -206 -268 Q -178 -314 -146 -274 Z" />
  </g>
);

const Carpet: React.FC<{ light: number }> = ({ light }) => (
  <g>
    <path d={`M 120 ${FLOOR + 10} L 470 ${FLOOR + 10} L 520 ${FLOOR + 70} L 70 ${FLOOR + 70} Z`} fill={R.terra} stroke={C.gold} strokeWidth={4} opacity={0.75 + 0.25 * light} />
    {Array.from({ length: 6 }).map((_, i) => (
      <path key={i} d={`M ${140 + i * 60} ${FLOOR + 40} l 22 -18 l 22 18 l -22 18 Z`} fill={C.gold} opacity={0.9} />
    ))}
  </g>
);

/** Écran de théâtre d'ombres rétroéclairé (lampe à huile qui vacille) + sol + officiels portugais. */
const Hall: React.FC<{ frame: number; spot: number; children?: React.ReactNode }> = ({ frame, spot, children }) => {
  const flick = 0.92 + 0.05 * Math.sin(frame * 0.7) + 0.03 * Math.sin(frame * 1.9);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -900,
          top: -600,
          width: W + 1800,
          height: H + 1200,
          background: `radial-gradient(ellipse 1000px 1250px at ${900 + 560}px ${600 + 860}px, rgba(255,214,140,${flick}) 0%, #E39A4A 30%, #A9561F 58%, #4a1d0c 82%, #1a0904 100%)`,
        }}
      />
      {/* grain de toile */}
      <div style={{ position: "absolute", left: -900, top: -600, width: W + 1800, height: H + 1200, opacity: 0.08, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 7px), repeating-linear-gradient(90deg, rgba(0,0,0,0.4) 0 2px, transparent 2px 9px)" }} />
      {/* faisceau sur le tapis */}
      <div style={{ position: "absolute", left: 30, top: 200, width: 540, height: FLOOR - 120, background: `linear-gradient(180deg, rgba(255,240,200,0) 0%, rgba(255,240,200,${0.35 * spot}) 100%)`, clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)" }} />
      <svg width={W + 400} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "blur(0.6px)" }}>
        <rect x={-900} y={FLOOR} width={W + 2000} height={700} fill={SIL} />
        <Carpet light={spot} />
        <g transform={`translate(1010 ${FLOOR}) scale(0.84)`}>
          <Official />
        </g>
        <g transform={`translate(895 ${FLOOR}) scale(0.92)`}>
          <Official />
        </g>
        <g transform={`translate(780 ${FLOOR})`}>
          <Official />
        </g>
        {children}
      </svg>
    </>
  );
};

const scallops = (y0: number, depth: number, n: number, w: number) =>
  Array.from({ length: n }).map((_, i) => `Q ${(i + 0.5) * w} ${y0 + depth} ${(i + 1) * w} ${y0}`).join(" ");

/** Cadre de théâtre en espace écran : lambrequin de velours rouge en haut, coulisses sombres sur les côtés. */
const Proscenium: React.FC = () => (
  <>
    <svg width={W} height={340} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="velv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a080b" />
          <stop offset="1" stopColor={R.velvet} />
        </linearGradient>
      </defs>
      <path d={`M 0 0 L 0 230 ${scallops(230, 100, 9, 120)} L ${W} 0 Z`} fill="url(#velv)" />
      <path d={`M 0 230 ${scallops(230, 100, 9, 120)}`} fill="none" stroke={C.gold} strokeWidth={5} />
    </svg>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,4,2,0.85) 0%, rgba(10,4,2,0) 9%, rgba(10,4,2,0) 91%, rgba(10,4,2,0.85) 100%)" }} />
  </>
);

const LegendTag: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center", opacity: ramp(frame, 0, 8, 0, 1) }}>
      <div style={{ background: "rgba(0,0,0,0.55)", border: `2px solid rgba(240,195,107,0.5)`, borderRadius: 40, padding: "12px 34px", textAlign: "center" }}>
        <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 34, letterSpacing: 10, color: C.gold }}>LÉGENDE</div>
        <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 28, color: "rgba(255,244,224,0.85)" }}>récit recueilli des décennies plus tard</div>
      </div>
    </div>
  );
};

/** Caméra 2D : (px, py) = point du décor amené au centre de l'écran. */
const cam = (px: number, py: number, z: number) => `translate(${540 - px * z}px, ${960 - py * z}px) scale(${z})`;

/* ---------- Scène 4 · Des sièges, un tapis (7,4 à 11,4 s) ---------- */

const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const u = ramp(frame, 50, 26, 0, 1, ease);
  const px = interpolate(u, [0, 1], [820, 330]);
  const py = interpolate(ramp(frame, 0, 50, 0, 1, ease), [0, 1], [900, 880]);
  const z = 1.2;
  const spot = ramp(frame, 60, 20, 0, 1);
  const out = ramp(frame, 110, 10, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: cam(px, py, z), transformOrigin: "0 0" }}>
        <Hall frame={frame} spot={spot} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.35) 25%,rgba(0,0,0,0) 40%)" }} />
      <Proscenium />
      {frame < 64 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 385, opacity: ramp(frame, 58, 6, 1, 0) }}>
          <PunchWord text="POUR EUX :" at={24} size={84} color={C.ivory} />
          <div style={{ height: 10 }} />
          <PunchWord text="DES SIÈGES." at={30} size={84} color={C.ivory} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 385 }}>
          <PunchWord text="POUR ELLE :" at={66} size={84} />
          <div style={{ height: 10 }} />
          <PunchWord text="UN TAPIS." at={80} size={84} />
        </AbsoluteFill>
      )}
      <LegendTag />
      <AbsoluteFill style={{ background: "#000", opacity: out * 0.5 }} />
      <Vig strength={0.7} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 5 · D'égale à égal (11,4 à 15,75 s) ---------- */

const NJ_X = 300;
const GOV_X = 780;
const EYE_Y = FLOOR - 615;

const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const kneel = ramp(frame, 4, 24, 0, 1, ease);
  const sit = ramp(frame, 28, 26, 0, 1, Easing.out(Easing.cubic));
  const line = ramp(frame, 66, 22, 0, 1, ease);
  const z = interpolate(ramp(frame, 0, 112, 0, 1, Easing.linear), [0, 1], [0.95, 1.02]);
  const toPortrait = ramp(frame, 110, 12, 0, 1);
  const glow = 0.6 + 0.4 * Math.sin(frame * 0.4);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: cam(540, 990, z), transformOrigin: "0 0" }}>
        <Hall frame={frame} spot={1}>
          <g transform={`translate(${NJ_X + 60} ${FLOOR - (1 - kneel) * 120})`} opacity={kneel}>
            <g transform="scale(-1 1)">
              <Servant />
            </g>
          </g>
          <g transform={`translate(${NJ_X} ${FLOOR - (1 - sit) * 260})`} opacity={sit}>
            <g transform="scale(-1 1)">
              <Queen />
            </g>
          </g>
          {line > 0 ? (
            <g>
              <line x1={NJ_X + 30} y1={EYE_Y} x2={NJ_X + 30 + (GOV_X - NJ_X - 60) * line} y2={EYE_Y} stroke={C.goldPale} strokeWidth={6} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 12px #F0C36B)" }} />
              <circle cx={NJ_X + 30} cy={EYE_Y} r={12 * glow} fill={C.ivory} />
              {line >= 1 ? <circle cx={GOV_X - 30} cy={EYE_Y} r={12 * glow} fill={C.ivory} /> : null}
            </g>
          ) : null}
        </Hall>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.35) 25%,rgba(0,0,0,0) 40%)" }} />
      <Proscenium />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 385 }}>
        <PunchWord text="D'ÉGALE" at={95} size={104} shine={[100, 118]} />
        <div style={{ height: 8 }} />
        <PunchWord text="À ÉGAL" at={99} size={104} shine={[104, 122]} />
      </AbsoluteFill>
      <LegendTag />
      {/* 5C : raccord sur le regard du portrait */}
      <AbsoluteFill style={{ opacity: toPortrait }}>
        <Illu src={PORTRAIT} cx={0.55} cy={0.37} zoom={2.4} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 958, height: 5, background: C.goldPale, opacity: 0.7 * (1 - ramp(frame, 120, 10, 0, 1)), boxShadow: "0 0 16px #F0C36B" }} />
        <Vig strength={0.6} />
      </AbsoluteFill>
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 6 · La paix, puis la couronne (15,75 à 18,9 s) ---------- */

const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const u = ramp(frame, 0, 44, 0, 1, Easing.linear);
  const v = ramp(frame, 44, 26, 0, 1, Easing.inOut(Easing.cubic));
  const zoom = interpolate(v, [0, 1], [interpolate(u, [0, 1], [1.12, 1.22]), 2.5]);
  const cx = interpolate(v, [0, 1], [0.55, 0.58]);
  const cy = interpolate(v, [0, 1], [0.52, 0.22]);
  const shine = ramp(frame, 66, 18, -30, 130, Easing.linear);
  const dark = ramp(frame, 95, 6, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shake hits={[{ at: 72, amp: 18, dur: 6 }]}>
        <Illu src={PORTRAIT} cx={cx} cy={cy} zoom={zoom} />
        <AbsoluteFill style={{ background: `linear-gradient(115deg, transparent ${shine - 12}%, rgba(255,235,180,0.35) ${shine}%, transparent ${shine + 12}%)`, mixBlendMode: "screen" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.8) 100%)" }} />
        {frame < 46 ? (
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1250, opacity: ramp(frame, 40, 6, 1, 0) }}>
            <PunchWord text="LA PAIX · 1622" at={26} size={86} color={C.ivory} />
          </AbsoluteFill>
        ) : null}
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 1130 }}>
          <PunchWord text="REINE" at={72} size={180} shine={[76, 92]} />
          <div style={{ height: 6 }} />
          <PunchWord text="1624" at={76} size={110} color={C.ivory} />
        </AbsoluteFill>
        <Particles at={72} x={540} y={1220} count={36} seed="reine" />
      </Shake>
      <AbsoluteFill style={{ background: "#000", opacity: dark }} />
      <Vig strength={0.55} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 7 · Le compteur (18,9 à 22,35 s) ---------- */

const MILESTONES = [
  { y: 1626, t: "1626 · GUERRE" },
  { y: 1631, t: "1631 · MATAMBA" },
  { y: 1656, t: "1656 · TRAITÉ DE PAIX" },
];

const S7: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ramp(frame, 4, 86, 0, 1, Easing.inOut(Easing.quad));
  const year = Math.round(1624 + p * (1663 - 1624));
  const ended = year >= 1663;
  return (
    <AbsoluteFill style={{ backgroundColor: R.black }}>
      <Illu src={PORTRAIT} cx={0.55} cy={0.5} zoom={interpolate(frame, [0, 103], [1.08, 1.18])} dim={0.62} />
      <AbsoluteFill style={{ opacity: 0.08, transform: `translateY(${-frame * 0.8}px)` }}>
        <Diamonds id="m7" size={120} opacity={1} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
        <PunchWord text="PLUS DE 40 ANS" at={4} size={76} color={C.ivory} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 230, lineHeight: 1, color: C.gold, textShadow: "0 10px 40px rgba(0,0,0,0.9)", transform: `scale(${ended ? popScale(frame, 90, 8, 1.12) || 1 : 1})` }}>
        {year}
      </div>
      {/* frise */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 790, height: 4, background: "rgba(240,195,107,0.3)" }} />
      <div style={{ position: "absolute", left: 90, width: 900 * p, top: 790, height: 4, background: C.gold, boxShadow: "0 0 14px #F0C36B" }} />
      {MILESTONES.map((m, i) => {
        const at = 4 + ((m.y - 1624) / 39) * 86;
        const shown = year >= m.y;
        return (
          <React.Fragment key={m.t}>
            <div style={{ position: "absolute", left: 90 + ((m.y - 1624) / 39) * 900 - 10, top: 782, width: 20, height: 20, transform: "rotate(45deg)", background: shown ? R.terraLight : "rgba(240,195,107,0.3)" }} />
            {shown ? (
              <div style={{ position: "absolute", left: 0, right: 0, top: 880 + i * 92, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 56, letterSpacing: 2, color: R.terraLight, textShadow: "0 6px 20px rgba(0,0,0,0.9)", transform: `scale(${popScale(frame, Math.ceil(at), 8, 1.2) || 1})` }}>
                {m.t}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      <Caption text="Matamba garde sa souveraineté" at={84} y={1190} size={44} color={C.ivory} italic />
      <Vig strength={0.7} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 8 · Pas une statue lisse (22,35 à 26 s) ---------- */

const S8: React.FC = () => {
  const frame = useCurrentFrame();
  const shade = ramp(frame, 6, 40, 0, 1, ease);
  const rot = ramp(frame, 40, 70, 0, 2, Easing.inOut(Easing.quad));
  const z = interpolate(frame, [0, 110], [1.55, 1.7]);
  const appear = ramp(frame, 0, 8, 0, 1);
  const out = ramp(frame, 100, 10, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity: appear }}>
        <Illu src={PORTRAIT} cx={0.55} cy={0.42} zoom={z} rot={rot} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(270deg, rgba(0,0,0,${0.9 * shade}) 0%, rgba(0,0,0,${0.85 * shade}) ${46 * shade}%, rgba(0,0,0,0) ${46 * shade + 22}%)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.8) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 320 }}>
        <PunchWord text="PAS UNE" at={7} size={92} color={C.ivory} />
        <div style={{ height: 8 }} />
        <PunchWord text="STATUE LISSE." at={14} size={88} color={C.ivory} />
      </AbsoluteFill>
      {frame >= 44 ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 1090, padding: "30px 36px", borderRadius: 28, background: "rgba(10,6,4,0.72)", border: "2px solid rgba(227,162,119,0.55)", textAlign: "center", opacity: ramp(frame, 44, 8, 0, 1), transform: `translateY(${(1 - ramp(frame, 44, 8, 0, 1)) * 30}px)` }}>
          <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 50, color: C.ivory }}>Résistante et diplomate…</div>
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 54, color: "#FFD9BF", marginTop: 10, opacity: ramp(frame, 60, 8, 0, 1) }}>elle a aussi pris part à la traite.</div>
          <div style={{ height: 5, margin: "14px auto 0", background: R.terraLight, width: `${ramp(frame, 64, 14, 0, 80)}%`, borderRadius: 3 }} />
        </div>
      ) : null}
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
      <Vig strength={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 9 · Son histoire entière sur AFROBACK (26 à 30 s) ---------- */

const S9: React.FC = () => <OutroApp capture="img/capture-app-reine-nzinga.jpg" buttonY={566} line1="ÉCOUTE" line2="SON HISTOIRE ENTIÈRE" />;

/* ---------- Montage ---------- */

const SCENES = [
  { from: 0, dur: 2.4, C: S1 },
  { from: 2.4, dur: 1.8, C: S2 },
  { from: 4.2, dur: 3.2, C: S3 },
  { from: 7.4, dur: 4.0, C: S4 },
  { from: 11.4, dur: 4.35, C: S5 },
  { from: 15.75, dur: 3.35, C: S6 },
  { from: 19.1, dur: 3.25, C: S7 },
  { from: 22.35, dur: 3.65, C: S8 },
  { from: 26.0, dur: 4.0, C: S9 },
];

/** Sous-titres calés sur la voix (timing.json), seulement pour les phrases non affichées en gros. */
const SUBS = [
  { words: w([["Elle", 11.5], ["s'assit,", 11.77], ["dit-on,", 12.39], ["sur", 12.97], ["le", 13.2], ["dos", 13.37], ["d'une", 13.6], ["servante.", 13.91]]), end: s(14.55) },
  { words: w([["par", 20.34], ["les", 20.57], ["armes", 20.79], ["et", 21.11], ["par", 21.28], ["la", 21.51], ["ruse.", 21.69]]), end: s(22.3) },
  { words: w([["Une", 23.78], ["reine,", 23.99], ["avec", 24.5], ["ses", 24.76], ["ombres.", 24.97]]), end: s(25.8) },
];

export const ReineNzinga: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map(({ from, dur, C: Sc }) => (
      <Sequence key={from} from={s(from)} durationInFrames={s(from + dur) - s(from)}>
        <Sc />
      </Sequence>
    ))}
    {SUBS.map((sub, i) => (
      <Karaoke key={i} words={sub.words} end={sub.end} />
    ))}
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-reine-nzinga.wav")} /> : null}
  </AbsoluteFill>
);
