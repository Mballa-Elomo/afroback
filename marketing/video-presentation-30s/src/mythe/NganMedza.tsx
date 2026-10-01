/**
 * AFROBACK · Vidéo 2 · « Le mythe raconté » : Ngan Medza (30 s, 9:16).
 * Script : marketing/2026-10-01_script-motion-design-mythe-ngan-medza-30s.md
 * Visuel principal : une seule illustration (mythe-ngan-medza-beti.jpg), explorée
 * par une caméra virtuelle + éléments animés (flamme, eau, yeux, carte dorée).
 * Les briques réutilisables sont dans ../recit-kit.tsx.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, H, W, cinzel, manrope, ramp, s, popScale, goldGradient } from "../theme";
import { Diamonds, Grain, Karaoke, PunchWord, Shake } from "../fx";
import { N, ease, Night, Fog, Vig, Flame, Embers, Illu, Caption, Walker, Water, SinkLetters, Eye, OutroApp, w } from "../recit-kit";

const ILLU = "img/mythe-ngan-medza-beti.jpg";

const TORCHES = [
  { x: 0.738, y: 0.425, s: 0.03 },
  { x: 0.364, y: 0.245, s: 0.022 },
  { x: 0.342, y: 0.205, s: 0.018 },
];

const TorchOverlays: React.FC<{ S: number; weak?: number }> = ({ S, weak = 1 }) => (
  <>
    {TORCHES.map((t, i) => (
      <Flame key={i} x={t.x * S} y={t.y * S} size={t.s * S} power={i === 1 || i === 2 ? weak : 1} seed={`t${i}`} />
    ))}
  </>
);

/* ---------- Scène 1 · « Écoute. » (0 à 3 s) ---------- */

const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const fire = ramp(frame, 9, 20, 0, 1);
  const dive = ramp(frame, 74, 16, 1, 7, Easing.in(Easing.exp));
  const whiteout = ramp(frame, 80, 10, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${dive})`, transformOrigin: "540px 1080px" }}>
        <AbsoluteFill style={{ opacity: fire }}>
          <Night glow="rgba(255,150,60,0.22)" />
          <Fog y={1150} />
        </AbsoluteFill>
        {frame >= 9 ? (
          <>
            {/* manche de la torche */}
            <div style={{ position: "absolute", left: 524, top: 1080, width: 32, height: 520, borderRadius: 10, background: "linear-gradient(90deg,#3a2614,#6b4a2a,#2a1a0c)", opacity: fire }} />
            <Flame x={540} y={1100} size={210 * (0.4 + 0.6 * fire)} power={fire} seed="s1" />
            <Embers x={540} y={900} power={fire} count={26} spread={120} />
          </>
        ) : null}
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 520 }}>
          <PunchWord text="ÉCOUTE." at={12} size={170} />
        </AbsoluteFill>
        <Caption text="Légende de tradition orale beti · Cameroun" at={30} y={1560} size={34} color="rgba(255,244,224,0.75)" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#FFC861", opacity: whiteout * 0.9 }} />
      <Vig />
    </AbsoluteFill>
  );
};

/* ---------- Scène 2 · La marche vers le sud (3 à 7 s) ---------- */

const PATH_PTS: [number, number][] = [
  [560, 300],
  [470, 620],
  [610, 950],
  [500, 1280],
  [560, 1560],
];
const pathD = "M560 300 C 420 460, 420 560, 470 620 S 680 820, 610 950 S 430 1150, 500 1280 S 600 1480, 560 1560";

const along = (u: number) => {
  const segs = PATH_PTS.length - 1;
  const k = Math.min(segs - 1e-6, Math.max(0, u * segs));
  const i = Math.floor(k);
  const t = k - i;
  const [x0, y0] = PATH_PTS[i];
  const [x1, y1] = PATH_PTS[i + 1];
  return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t };
};

const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = ramp(frame, 0, 75, 0, 1, ease);
  const camY = ramp(frame, 0, 120, 120, -160, ease);
  const river = ramp(frame, 88, 14, 0, 1);
  const flood = ramp(frame, 104, 16, 0, 1, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill>
      <Night glow="rgba(240,195,107,0.08)" />
      <AbsoluteFill style={{ transform: `translateY(${camY}px)` }}>
        <Diamonds id="m2" size={110} opacity={0.05} />
        {/* boussole */}
        <div style={{ position: "absolute", left: 900, top: 170, fontFamily: cinzel, fontWeight: 900, fontSize: 40, color: "rgba(240,195,107,0.6)" }}>N ↑</div>
        <div style={{ position: "absolute", left: 640, top: 250, fontFamily: cinzel, fontWeight: 700, fontSize: 36, letterSpacing: 6, color: "rgba(240,195,107,0.8)", opacity: ramp(frame, 4, 10, 0, 1) }}>
          ADAMAOUA
        </div>
        <svg width={W} height={H + 400} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={pathD} fill="none" stroke={C.gold} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" pathLength={1000} strokeDashoffset={0} style={{ clipPath: `inset(0 0 ${(1 - draw) * 100}% 0)` }} />
          {/* fleuve en travers, en bas */}
          <path
            d={`M -50 ${1640 + Math.sin(frame * 0.2) * 6} C 300 ${1590}, 700 ${1700}, 1130 ${1630}`}
            fill="none"
            stroke="#6E8FA8"
            strokeWidth={30 + flood * 1400}
            strokeLinecap="round"
            opacity={river}
          />
        </svg>
        {Array.from({ length: 7 }).map((_, i) => {
          const u = Math.max(0, draw - i * 0.06);
          if (u <= 0.02) return null;
          const p = along(u * 0.68);
          return <Walker key={i} x={p.x + (i % 2 ? 40 : -40)} y={p.y} phase={frame * 0.5 + i} kind={i % 3} scale={1.1} />;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 1180 }}>
        <PunchWord text="LE PEUPLE BETI" at={30} size={112} color={C.ivory} />
      </AbsoluteFill>
      <Caption text="marchait vers le sud…" at={45} y={1320} size={56} color={C.gold} />
      <Vig />
    </AbsoluteFill>
  );
};

/* ---------- Scène 3 · La Sanaga (7 à 10 s) ---------- */

const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const push = ramp(frame, 0, 90, 1, 1.08, Easing.linear);
  const dark = ramp(frame, 74, 14, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shake hits={[{ at: 9, amp: 14, dur: 4 }]}>
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          <Water />
          <Fog y={900} />
        </AbsoluteFill>
        <Caption text="Devant lui :" at={0} y={640} size={50} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 740 }}>
          <PunchWord text="LA SANAGA" at={9} size={150} color={C.ivory} shine={[16, 34]} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, right: 0, top: 960 }}>
          <SinkLetters text="infranchissable" at={51} size={84} />
        </div>
      </Shake>
      <AbsoluteFill style={{ background: "#000", opacity: dark }} />
      <Vig />
    </AbsoluteFill>
  );
};

/* ---------- Scène 4 · Ngan Medza surgit (10 à 14,5 s) ---------- */

const S4: React.FC = () => {
  const frame = useCurrentFrame();
  // 4A : les yeux (0 à 45)
  if (frame < 45) {
    const open = ramp(frame, 6, 18, 0, 1, Easing.out(Easing.cubic));
    const blink = frame >= 32 && frame < 36 ? 0.1 : 1;
    const z = ramp(frame, 0, 45, 1, 1.25, Easing.linear);
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <AbsoluteFill style={{ transform: `scale(${z})` }}>
          <Fog y={1150} opacity={0.5} />
          <Eye x={350} y={880} open={open * blink} frame={frame} />
          <Eye x={730} y={880} open={open * blink} frame={frame} />
        </AbsoluteFill>
        <Vig />
      </AbsoluteFill>
    );
  }
  const f = frame - 45;
  // 4B : écailles, remontée le long du corps (45 à 90) ; 4C : dézoom (90 à 135)
  let cx: number, cy: number, zoom: number;
  if (f < 45) {
    const u = ramp(f, 0, 45, 0, 1, ease);
    cx = interpolate(u, [0, 0.5, 1], [0.6, 0.27, 0.5]);
    cy = interpolate(u, [0, 0.5, 1], [0.9, 0.55, 0.3]);
    zoom = 3.2;
  } else {
    const u = ramp(f, 45, 30, 0, 1, Easing.out(Easing.exp));
    cx = interpolate(u, [0, 1], [0.5, 0.5]);
    cy = interpolate(u, [0, 1], [0.3, 0.5]);
    zoom = interpolate(u, [0, 1], [3.2, 1.05]);
  }
  const S = H * zoom;
  const motifs = 0.5 + 0.5 * Math.sin(f * 0.3);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shake hits={[{ at: 45, amp: 16, dur: 5 }]}>
        <Illu src={ILLU} cx={cx} cy={cy} zoom={zoom}>
          <TorchOverlays S={S} />
        </Illu>
        {f < 45 ? (
          <AbsoluteFill style={{ opacity: 0.16 * motifs, mixBlendMode: "screen" }}>
            <Diamonds id="m4" size={120} opacity={1} />
          </AbsoluteFill>
        ) : null}
        <Fog y={700} opacity={0.6} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 65%,rgba(0,0,0,0.7) 100%)" }} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
          <PunchWord text="NGAN MEDZA" at={45} size={150} shine={[52, 72]} />
        </AbsoluteFill>
      </Shake>
      <Vig strength={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 5 · La traversée de nuit (14,5 à 19 s) ---------- */

const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const u = ramp(frame, 0, 120, 0, 1, ease);
  const cx = interpolate(u, [0, 0.5, 1], [0.66, 0.5, 0.36]);
  const cy = interpolate(u, [0, 0.5, 1], [0.6, 0.4, 0.24]);
  const zoom = interpolate(u, [0, 1], [1.5, 2.6]);
  // la torche de l'arrière faiblit à 18 s (image 105 de la scène)
  const weak = frame < 100 ? 1 : 1 - 0.75 * ramp(frame, 100, 25, 0, 1) + (frame >= 100 ? 0.25 * Math.max(0, Math.sin(frame * 1.7)) : 0);
  const S = H * zoom;
  const dim = ramp(frame, 100, 35, 0, 0.35);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Illu src={ILLU} cx={cx} cy={cy} zoom={zoom} dim={dim}>
        <TorchOverlays S={S} weak={weak} />
      </Illu>
      <Fog y={1300} opacity={0.8} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0) 25%,rgba(0,0,0,0) 60%,rgba(0,0,0,0.75) 100%)" }} />
      <Vig strength={0.7} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 6 · La blessure (19 à 23 s) ---------- */

const Spear: React.FC<{ p: number }> = ({ p }) => (
  <svg width={540} height={1000} viewBox="0 0 540 1000" style={{ position: "absolute", left: 0, top: 380 }}>
    <g transform={`translate(${380 - p * 140} ${-260 + p * 440}) rotate(32)`}>
      <line x1={0} y1={-420} x2={0} y2={60} stroke="#8a6a3a" strokeWidth={12} strokeLinecap="round" />
      <path d="M -26 60 L 0 200 L 26 60 Z" fill={C.gold} />
    </g>
  </svg>
);

const S6: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 45) {
    const pl = ramp(frame, 4, 10, 0, 1, Easing.in(Easing.cubic));
    const pf = ramp(frame, 22, 12, 0, 1, Easing.in(Easing.quad));
    return (
      <AbsoluteFill style={{ backgroundColor: N.night }}>
        <Shake hits={[{ at: 14, amp: 12, dur: 4 }, { at: 34, amp: 12, dur: 4 }]}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: H, background: "linear-gradient(180deg,#141d27,#0a0f14)", overflow: "hidden" }}>
            <Spear p={pl} />
          </div>
          <div style={{ position: "absolute", left: 540, top: 0, width: 540, height: H, background: "linear-gradient(180deg,#20140a,#0a0705)", overflow: "hidden" }}>
            <Flame x={270} y={500 + pf * 520} size={110} seed="s6" />
            {frame >= 34 ? <Embers x={270} y={1000} count={22} spread={200} /> : null}
          </div>
          <div style={{ position: "absolute", left: 538, top: 0, width: 4, height: H, background: goldGradient, opacity: 0.8 }} />
          <div style={{ position: "absolute", left: 0, width: 540, top: 1300, display: "flex", justifyContent: "center" }}>
            <PunchWord text="UNE LANCE ?" at={14} size={60} color={C.ivory} style={{ whiteSpace: "nowrap" }} />
          </div>
          <div style={{ position: "absolute", left: 540, width: 540, top: 1300, display: "flex", justifyContent: "center" }}>
            <PunchWord text="UNE FLAMME ?" at={34} size={60} color={C.gold} style={{ whiteSpace: "nowrap" }} />
          </div>
          <Caption text="Les récits divergent" at={20} y={1480} size={40} color="rgba(255,244,224,0.7)" italic />
        </Shake>
        <Vig />
      </AbsoluteFill>
    );
  }
  // 6B : le serpent se cabre (45 à 120)
  const f = frame - 45;
  const jolt = f < 30 ? Math.sin(f * 1.4) * (1 - f / 30) : 0;
  const rot = ramp(f, 0, 12, 0, -8, Easing.out(Easing.back(2))) + jolt * 3;
  const zoom = ramp(f, 0, 60, 1.3, 1.6);
  const black = ramp(f, 62, 4, 0, 1);
  const S = H * zoom;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shake hits={[{ at: 45, amp: 28, dur: 10 }, { at: 58, amp: 16, dur: 8 }]}>
        <Illu src={ILLU} cx={0.5} cy={0.55} zoom={zoom} rot={rot}>
          <TorchOverlays S={S} weak={0.4} />
        </Illu>
        {/* gerbe d'eau */}
        {f >= 2
          ? Array.from({ length: 70 }).map((_, i) => {
              const t = f - 2;
              const a = -Math.PI / 2 + (random(`sp${i}`) - 0.5) * 2.4;
              const v = 18 + random(`sv${i}`) * 34;
              const x = 540 + Math.cos(a) * v * t;
              const y = 1300 + Math.sin(a) * v * t + 0.9 * t * t;
              const sz = 6 + random(`ss${i}`) * 18;
              return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz * 1.4, borderRadius: sz, background: "rgba(220,235,245,0.85)", opacity: Math.max(0, 1 - t / 40) }} />;
            })
          : null}
      </Shake>
      <AbsoluteFill style={{ background: "rgba(150,40,20,0.18)", opacity: f < 20 ? 1 - f / 20 : 0 }} />
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      <Vig />
    </AbsoluteFill>
  );
};

/* ---------- Scène 7 · Un peuple, deux rives (23 à 26,5 s) ---------- */

const PEUPLES = [
  { n: "Ewondo", x: 250, y: 760, side: 0 },
  { n: "Eton", x: 760, y: 700, side: 0 },
  { n: "Manguissa", x: 520, y: 600, side: 0 },
  { n: "Bulu", x: 280, y: 1280, side: 1 },
  { n: "Bene", x: 780, y: 1330, side: 1 },
  { n: "Ntumu", x: 540, y: 1430, side: 1 },
  { n: "Mvele", x: 830, y: 860, side: 0 },
];

const S7: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Night glow="rgba(240,195,107,0.10)" />
      <Diamonds id="m7" size={110} opacity={0.04} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((k) => {
          let d = `M -20 ${1040 + k * 24}`;
          for (let x = -20; x <= W + 40; x += 30) d += ` L ${x} ${1040 + k * 24 + Math.sin(x * 0.01 + frame * 0.15 + k) * 18}`;
          return <path key={k} d={d} fill="none" stroke="#6E8FA8" strokeWidth={k === 1 ? 70 : 6} opacity={k === 1 ? 0.55 : 0.4} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 60, top: 950, fontFamily: cinzel, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: "#BFD7E6", opacity: 0.8 }}>SANAGA</div>
      {PEUPLES.map((p, i) => {
        const at = 6 + i * 6;
        const sc = popScale(frame, at, 9, 1.3);
        const o = frame < at ? 0 : ramp(frame, at, 6, 0, 1);
        return (
          <div key={p.n} style={{ position: "absolute", left: p.x, top: p.y, opacity: o }}>
            <div style={{ position: "absolute", left: -14, top: -14, width: 28, height: 28, borderRadius: 14, background: C.gold, boxShadow: `0 0 ${30 + 10 * Math.sin(frame * 0.3 + i)}px ${C.gold}`, transform: `scale(${sc})` }} />
            <div style={{ position: "absolute", left: -150, width: 300, top: 24, textAlign: "center", fontFamily: manrope, fontWeight: 800, fontSize: 40, color: C.ivory, textShadow: "0 4px 14px rgba(0,0,0,0.9)" }}>{p.n}</div>
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 260 }}>
        <PunchWord text="UN PEUPLE." at={30} size={124} color={C.ivory} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 1560 }}>
        <PunchWord text="DEUX RIVES." at={51} size={124} />
      </AbsoluteFill>
      <Vig />
    </AbsoluteFill>
  );
};

/* ---------- Scène 8 · La suite sur AFROBACK (26,5 à 30 s) ---------- */

const S8: React.FC = () => <OutroApp capture="img/capture-app-ngan-medza.jpg" buttonY={497} />;

/* ---------- Montage ---------- */

const SCENES = [
  { from: 0, dur: 3, C: S1 },
  { from: 3, dur: 4, C: S2 },
  { from: 7, dur: 3, C: S3 },
  { from: 10, dur: 4.5, C: S4 },
  { from: 14.5, dur: 4.5, C: S5 },
  { from: 19, dur: 4, C: S6 },
  { from: 23, dur: 3.5, C: S7 },
  { from: 26.5, dur: 3.5, C: S8 },
];


/** Sous-titres calés sur la voix off du griot (ElevenLabs, timing mesuré). */
const SUBS = [
  { words: w([["Il", 3.2], ["y", 3.36], ["a", 3.48], ["très", 3.59], ["longtemps…", 3.83]]), end: s(4.3) },
  { words: w([["Alors", 10.15], ["surgit…", 10.44]]), end: s(11.3) },
  { words: w([["un", 11.9], ["serpent", 12.06], ["immense,", 12.41], ["qui", 12.97], ["offrit", 13.16], ["son", 13.48], ["dos", 13.68], ["comme", 13.87], ["un", 14.15], ["pont.", 14.31]]), end: s(14.9) },
  { words: w([["De", 15.0], ["nuit,", 15.19], ["famille", 15.69], ["après", 16.11], ["famille,", 16.44], ["le", 17.08], ["peuple", 17.27], ["traversa…", 17.64]]), end: s(18.6) },
  { words: w([["…blessa", 21.19], ["le", 21.51], ["serpent.", 21.67]]), end: s(22.5) },
  { words: w([["Et", 23.1], ["depuis", 23.26], ["ce", 23.57], ["jour…", 23.72]]), end: s(24.12) },
];

export const NganMedza: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map(({ from, dur, C: Sc }) => (
      <Sequence key={from} from={s(from)} durationInFrames={s(dur)}>
        <Sc />
      </Sequence>
    ))}
    {SUBS.map((sub, i) => (
      <Karaoke key={i} words={sub.words} end={sub.end} />
    ))}
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-mythe-ngan-medza-beti.wav")} /> : null}
  </AbsoluteFill>
);
