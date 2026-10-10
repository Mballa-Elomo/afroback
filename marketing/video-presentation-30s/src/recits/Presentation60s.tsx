/**
 * AFROBACK · Présentation de l'app (60 s, 9:16) · « Tu connais… ? » / le livre aux pages blanches.
 * Script : recits/presentation-app-60s/script.md · Voix : timing.json (départs réels).
 * À NE PUBLIER QU'UNE FOIS L'APP EN LIGNE SUR LES DEUX STORES (badges officiels à la fin).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, cinzel, manrope, ramp, s, popScale } from "../theme";
import { Diamonds, Grain, Karaoke, LetterDrop, MotifWipe, Particles, PunchWord, Shake, Shockwave, Tap } from "../fx";
import { Phone, PhonePose } from "../phone";
import { Embers, Fog, Illu, Vig, w } from "../recit-kit";
import { Rings } from "./ruben-props";

const G = { page: "#D9D6CF", page2: "#C9C6BF", ink: "#4A4844", grey: "#8C8A86", paper: "#EDEAE3", inkDark: "#2E2416", deep: "#8E5F17", terra: "#A9482A" };
const cap = (n: string) => `img/capture-app-${n}.png`;

/* ---------- Éléments communs ---------- */

const Desk: React.FC<{ warm?: boolean }> = ({ warm }) => (
  <AbsoluteFill style={{ background: warm ? "radial-gradient(circle at 50% 45%, #2a1d10 0%, #120c07 60%, #070504 100%)" : "radial-gradient(circle at 50% 40%, #3a3936 0%, #1d1c1a 60%, #0d0d0c 100%)" }} />
);

const GoldBg: React.FC<{ id: string }> = ({ id }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(240,195,107,0.18) 0%, #1A130D 45%, #0B0906 85%)" }} />
    <Diamonds id={id} size={110} opacity={0.05} />
  </AbsoluteFill>
);

/** Page de manuel gris, lignes floues illisibles. */
const GreyPage: React.FC<{ w: number; h: number; x: number; y: number; rot?: number; seed: string; lines?: boolean; children?: React.ReactNode; color?: string }> = ({ w: pw, h, x, y, rot = 0, seed, lines = true, children, color = G.page }) => (
  <div style={{ position: "absolute", left: x - pw / 2, top: y - h / 2, width: pw, height: h, transform: `rotate(${rot}deg)`, background: color, borderRadius: 6, boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 0 120px rgba(0,0,0,0.12)", overflow: "hidden" }}>
    {lines ? (
      <svg width={pw} height={h} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: Math.floor((h - 160) / 46) }).map((_, i) => (
          <rect key={i} x={70} y={90 + i * 46} width={(pw - 140) * (0.55 + random(`${seed}${i}`) * 0.45)} height={11} rx={5} fill="rgba(60,58,54,0.22)" />
        ))}
      </svg>
    ) : null}
    {children}
  </div>
);

/** Pictogrammes génériques au trait (aucun portrait, aucune archive). */
const Picto: React.FC<{ kind: "bicorne" | "crown" | "columns" | "ship"; size: number; color?: string }> = ({ kind, size, color = G.ink }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
    {kind === "bicorne" ? <path d="M8 62 C 25 30, 75 30, 92 62 C 70 54, 30 54, 8 62 Z M38 44 L50 30 L62 44" /> : null}
    {kind === "crown" ? <path d="M15 72 L10 32 L32 52 L50 22 L68 52 L90 32 L85 72 Z M15 82 L85 82" /> : null}
    {kind === "columns" ? <path d="M12 30 L50 12 L88 30 Z M20 36 L20 80 M38 36 L38 80 M62 36 L62 80 M80 36 L80 80 M10 86 L90 86" /> : null}
    {kind === "ship" ? <path d="M12 66 L88 66 L76 82 L24 82 Z M50 66 L50 14 M50 18 L78 52 L50 52 M50 22 L26 52 L50 52" /> : null}
  </svg>
);

const Check: React.FC<{ at: number; size?: number; color?: string }> = ({ at, size = 90, color = G.ink }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, 8, 0, 1);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity: f < at ? 0 : 1 }}>
      <path d="M18 52 L42 76 L84 26" fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={110} strokeDashoffset={110 * (1 - p)} />
    </svg>
  );
};

const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", flexDirection: "column", alignItems: "center", ...style }}>{children}</div>
);

const Line: React.FC<{ text: string; at: number; size?: number; color?: string; weight?: number; family?: string; dark?: boolean }> = ({ text, at, size = 46, color = C.ivory, weight = 800, family = manrope, dark }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ramp(f, at, 8, 0, 1);
  return (
    <div style={{ fontFamily: family, fontWeight: weight, fontSize: size, color, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, textAlign: "center", lineHeight: 1.2, textShadow: dark ? "none" : "0 4px 18px rgba(0,0,0,0.9)" }}>{text}</div>
  );
};

/** Portrait AFROBACK cadré dans un rectangle (image carrée). */
const Framed: React.FC<{ src: string; x: number; y: number; size: number; zoom?: number; fx?: number; fy?: number; border?: string; style?: React.CSSProperties }> = ({ src, x, y, size, zoom = 1, fx = 0.5, fy = 0.4, border = C.gold, style }) => (
  <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, overflow: "hidden", borderRadius: 10, border: `5px solid ${border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.55)", ...style }}>
    <Img src={staticFile(src)} style={{ width: size * zoom, height: size * zoom, position: "absolute", left: size / 2 - fx * size * zoom, top: size / 2 - fy * size * zoom }} />
  </div>
);

const Shot: React.FC<{ pose: PhonePose; src: string; children?: React.ReactNode; zIndex?: number }> = ({ pose, src, children, zIndex }) => (
  <Phone pose={pose} zIndex={zIndex}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    {children}
  </Phone>
);

const Label: React.FC<{ text: string; at?: number; size?: number }> = ({ text, at = 1, size = 84 }) => (
  <Center y={262}>
    <PunchWord text={text} at={at} size={size} />
  </Center>
);

const POSE: PhonePose = { x: 540, y: 960, scale: 1.3 };
/** Point de l'écran (390 × 844) → cadre vidéo. */
const st = (p: PhonePose, sx: number, sy: number) => ({ x: p.x + (sx - 195) * p.scale, y: p.y + (sy - 422) * p.scale });

const Pulse: React.FC<{ at: number; x: number; y: number; w2?: number; h2?: number }> = ({ at, x, y, w2 = 300, h2 = 90 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = ((f - at) % 15) / 15;
  return <div style={{ position: "absolute", left: x - w2 / 2, top: y - h2 / 2, width: w2, height: h2, borderRadius: h2, border: `5px solid ${C.gold}`, opacity: 1 - k, transform: `scale(${1 + k * 0.35})` }} />;
};

/* ---------- Scènes (temps locaux en secondes) ---------- */

/** 1 · « Tu connais Napoléon ? » (0 → 1,45) */
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = ramp(f, 0, 40, 1, 1.08);
  const corner = ramp(f, s(1.15), 10, 0, 1);
  return (
    <AbsoluteFill>
      <Shake hits={[{ at: s(0.55), amp: 10, dur: 3 }]}>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          <Desk />
          <GreyPage w={960} h={1420} x={540} y={930} rot={-3} seed="p1">
            <div style={{ position: "absolute", left: 380, top: 120 }}>
              <Picto kind="bicorne" size={200} />
            </div>
            <div style={{ position: "absolute", right: 0, bottom: 0, width: 260 * corner, height: 260 * corner, background: "linear-gradient(135deg, rgba(0,0,0,0) 50%, #F0C36B 50%, #F7D98B 100%)", boxShadow: "0 0 60px rgba(240,195,107,0.8)" }} />
          </GreyPage>
          <Center y={700}>
            <div style={{ background: "rgba(217,214,207,0.92)", padding: "20px 40px", borderRadius: 12 }}>
              <PunchWord text="TU CONNAIS" at={s(0.15)} size={92} color={G.ink} style={{ filter: "none" }} />
            </div>
            <div style={{ height: 20 }} />
            <div style={{ background: "rgba(217,214,207,0.92)", padding: "16px 34px", borderRadius: 12 }}>
              <PunchWord text="NAPOLÉON ?" at={s(0.55)} size={128} color={G.inkDark} style={{ filter: "none" }} />
            </div>
            <div style={{ height: 10 }} />
            <Check at={s(0.95)} size={120} />
          </Center>
        </AbsoluteFill>
      </Shake>
    </AbsoluteFill>
  );
};

/** 2 · « Mais tu connais Ruben Um Nyobè ? » (1,45 → 3,9) */
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const tear = ramp(f, 2, 14, 0, 1, Easing.in(Easing.cubic));
  const u = ramp(f, 0, 70, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Illu src="heros/ruben-um-nyobe.jpg" cx={0.42} cy={interpolate(u, [0, 1], [0.36, 0.42])} zoom={interpolate(u, [0, 1], [1.3, 1.1])}>
        <Rings frame={f} opacity={0.5} />
      </Illu>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.88) 74%,rgba(0,0,0,0.92) 100%)" }} />
      <Center y={300}>
        <Line text="MAIS TU CONNAIS…" at={1} size={58} />
      </Center>
      <Center y={1170}>
        <LetterDrop text="RUBEN UM" at={s(0.85)} size={124} stagger={0.6} />
        <LetterDrop text="NYOBÈ ?" at={s(1.25)} size={124} stagger={0.6} />
      </Center>
      {tear < 1 ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: 0, background: G.page, clipPath: "polygon(0 0, 100% 0, 100% 38%, 0 66%)", transform: `translate(${-tear * 300}px, ${-tear * 1400}px) rotate(${-tear * 8}deg)` }} />
          <div style={{ position: "absolute", inset: 0, background: G.page2, clipPath: "polygon(0 66%, 100% 38%, 100% 100%, 0 100%)", transform: `translate(${tear * 300}px, ${tear * 1400}px) rotate(${tear * 8}deg)` }} />
        </AbsoluteFill>
      ) : null}
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/** Moitié haute grise / moitié basse dorée. */
const Split: React.FC<{ top: React.ReactNode; bottom: React.ReactNode; crumple: number; line: number }> = ({ top, bottom, crumple, line }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden" }}>{bottom}</div>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, overflow: "hidden", transform: `scaleY(${1 - crumple})`, transformOrigin: "50% 0%", opacity: 1 - crumple * 0.6, filter: `blur(${crumple * 8}px)` }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${G.page2}, ${G.page})` }} />
      <GreyPage w={1080} h={960} x={540} y={480} seed="sp" color="rgba(0,0,0,0)" />
      {top}
    </div>
    <div style={{ position: "absolute", left: 0, top: 955, width: 1080 * line, height: 10, background: C.gold, boxShadow: "0 0 30px rgba(240,195,107,0.9)" }} />
  </AbsoluteFill>
);

const BottomPortrait: React.FC<{ src: string; f: number; cy?: number }> = ({ src, f, cy = 0.36 }) => {
  const rise = ramp(f, 0, 12, 1, 0, Easing.out(Easing.back(1.3)));
  const zoom = ramp(f, 0, 90, 1.05, 0.98);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${rise * 500}px)` }}>
      <div style={{ position: "absolute", left: 540 - (1080 * zoom) / 2, top: 170 - cy * 1080 * zoom, width: 1080 * zoom, height: 1080 * zoom }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 22%,rgba(0,0,0,0.88) 40%,rgba(0,0,0,0.95) 100%)" }} />
    </div>
  );
};

/** 3A · Louis XIV / Nzinga (3,9 → 6,9) */
const S3A: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Split
      line={ramp(f, 0, 9, 0, 1)}
      crumple={ramp(f, s(2.75), 7, 0, 1, Easing.in(Easing.quad))}
      top={
        <Center y={330}>
          <Picto kind="crown" size={170} />
          <div style={{ height: 20 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <PunchWord text="LOUIS XIV ?" at={2} size={104} color={G.inkDark} style={{ filter: "none" }} />
            <Check at={s(0.85)} size={100} />
          </div>
        </Center>
      }
      bottom={
        <>
          <BottomPortrait src="heros/reine-nzinga.jpg" f={f - s(0.15)} cy={0.3} />
          <Center y={330}>
            <PunchWord text="LA REINE" at={s(1.15)} size={80} />
            <PunchWord text="NZINGA ?" at={s(1.35)} size={108} shine={[s(1.6), s(2.2)]} />
            <div style={{ height: 14 }} />
            <Line text="Ndongo et Matamba · Angola · XVIIᵉ siècle" at={s(1.6)} size={32} weight={700} color="rgba(255,244,224,0.8)" />
          </Center>
        </>
      }
    />
  );
};

/** 3B · Alphabet latin / Njoya (6,9 → 10,4) */
const S3B: React.FC = () => {
  const f = useCurrentFrame();
  const end = ramp(f, s(3.05), 10, 0, 1);
  const meds = ["heros/ruben-um-nyobe.jpg", "heros/reine-nzinga.jpg", "heros/sultan-njoya.jpg"];
  return (
    <AbsoluteFill>
      <Split
        line={1}
        crumple={ramp(f, s(2.9), 7, 0, 1, Easing.in(Easing.quad))}
        top={
          <Center y={300}>
            <LetterDrop text="A B C" at={1} size={190} family={manrope} weight={800} color={G.inkDark} stagger={3} />
            <div style={{ height: 30 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 64, color: G.ink, opacity: ramp(f, 12, 8, 0, 1) }}>L'ALPHABET LATIN ?</div>
              <Check at={s(0.95)} size={86} />
            </div>
          </Center>
        }
        bottom={
          <>
            <BottomPortrait src="heros/sultan-njoya.jpg" f={f - s(0.15)} cy={0.42} />
            <Center y={330}>
              <PunchWord text="L'ÉCRITURE DU" at={s(1.35)} size={72} />
              <PunchWord text="ROI NJOYA ?" at={s(1.6)} size={104} shine={[s(1.9), s(2.5)]} />
              <div style={{ height: 14 }} />
              <Line text="A ka u ku · inventée par Njoya, de 1896 à 1918" at={s(1.9)} size={32} weight={700} color="rgba(255,244,224,0.8)" />
            </Center>
          </>
        }
      />
      {end > 0 ? (
        <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${end})` }}>
          {meds.map((m, i) => (
            <div key={m} style={{ position: "absolute", left: 540 + (i - 1) * 290 - 120, top: 840, width: 240, height: 240, borderRadius: 120, overflow: "hidden", border: `5px solid ${C.gold}`, transform: `scale(${popScale(f, s(3.1) + i * 2, 8, 1.15)})` }}>
              <Img src={staticFile(m)} style={{ width: "100%", height: "100%" }} />
            </div>
          ))}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** 4 · « On nous a raconté l'histoire des autres » (10,4 → 12,8) */
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const stop = s(2.2);
  const flipping = f < stop;
  const period = 5;
  const k = flipping ? (f % period) / period : 0;
  const n = Math.floor(f / period);
  const kinds = ["bicorne", "columns", "crown", "ship"] as const;
  const drift = ramp(f, 0, 72, 0, 1, Easing.linear);
  const meds = ["heros/ruben-um-nyobe.jpg", "heros/reine-nzinga.jpg", "heros/sultan-njoya.jpg"];
  return (
    <AbsoluteFill style={{ transform: `translateX(${-30 + drift * 60}px) rotate(${-1 + drift * 2}deg)` }}>
      <Desk />
      <GreyPage w={820} h={900} x={540} y={740} seed={flipping ? `fl${n}` : "blank"} lines={flipping}>
        {flipping ? (
          <div style={{ position: "absolute", left: 300, top: 100, opacity: 0.8 }}>
            <Picto kind={kinds[n % 4]} size={220} />
          </div>
        ) : null}
      </GreyPage>
      {flipping ? (
        <div style={{ position: "absolute", left: 540, top: 290, width: 410, height: 900, transformOrigin: "0% 50%", transform: `perspective(2000px) rotateY(${-k * 180}deg)`, background: G.page2, boxShadow: "0 10px 40px rgba(0,0,0,0.4)", opacity: k < 0.95 ? 1 : 0 }} />
      ) : null}
      {meds.map((m, i) => (
        <div key={m} style={{ position: "absolute", left: 540 + (i - 1) * 290 - 90 + Math.sin(f * 0.08 + i * 2) * 40, top: 360 + Math.cos(f * 0.07 + i) * 30, width: 180, height: 180, borderRadius: 90, overflow: "hidden", border: `4px solid ${C.gold}`, opacity: 0.85 - drift * 0.4, boxShadow: "0 0 40px rgba(240,195,107,0.5)" }}>
          <Img src={staticFile(m)} style={{ width: "100%", height: "100%" }} />
        </div>
      ))}
      <Center y={1240}>
        <Line text="On nous a raconté" at={3} size={50} />
        <div style={{ height: 10 }} />
        <PunchWord text="L'HISTOIRE" at={s(1.0)} size={96} color={G.page} />
        <PunchWord text="DES AUTRES" at={s(1.3)} size={96} color={G.page} />
      </Center>
      <Vig strength={0.55} />
    </AbsoluteFill>
  );
};

const Paper: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: G.paper }} />
    <div style={{ position: "absolute", left: 537, top: 0, width: 6, height: 1920, background: "linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0.14), rgba(0,0,0,0.04))" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(30,20,10,0.55) 100%)" }} />
  </AbsoluteFill>
);

/** Image posée sur la page blanche puis aspirée en poussière dorée. */
const Vanish: React.FC<{ src: string; word: string; from: number; to: number; fy?: number }> = ({ src, word, from, to, fy = 0.4 }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const inP = ramp(f, from, 6, 0, 1, Easing.out(Easing.back(1.4)));
  const out = ramp(f, to - 10, 10, 0, 1, Easing.in(Easing.quad));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `translateY(${-out * 120}px)`, filter: `blur(${out * 10}px) saturate(${1 - out})` }}>
        <Framed src={src} x={540} y={760} size={560} zoom={1.05} fy={fy} style={{ transform: `scale(${inP})` }} />
      </div>
      <Embers x={540} y={760 - out * 200} count={out > 0 ? 26 : 0} spread={500} power={out} />
      <Center y={1110}>
        <div style={{ opacity: 1 - out }}>
          <PunchWord text={word} at={from + 2} size={104} color={G.deep} style={{ filter: "none" }} />
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/** 5 · Nos héros, nos légendes, nos traditions ? Silence. (12,8 → 17,1) */
const S5: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper />
      <Vanish src="heros/manu-dibango.jpg" word="NOS HÉROS" from={0} to={s(0.95)} fy={0.42} />
      <Vanish src="img/mythe-ngan-medza-beti.jpg" word="NOS LÉGENDES" from={s(0.95)} to={s(2.0)} fy={0.5} />
      <Vanish src="img/nguon.jpg" word="NOS TRADITIONS" from={s(2.0)} to={s(3.15)} fy={0.5} />
      {f >= s(3.35) ? (
        <Center y={900}>
          <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 76, color: G.grey, letterSpacing: 6 }}>SILENCE.</div>
        </Center>
      ) : null}
    </AbsoluteFill>
  );
};

/** 6 · Le nom interdit (17,1 → 20,1) */
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const fade = ramp(f, 3, 40, 0, 1, Easing.inOut(Easing.cubic));
  const name = "RUBEN UM NYOBÈ";
  const black = ramp(f, s(2.45), 8, 0, 1);
  const dot = f >= s(2.6) ? 1 + 0.3 * Math.sin((f - s(2.6)) * 0.6) : 0;
  return (
    <AbsoluteFill>
      <Paper />
      {f < s(1.6) ? (
        <>
          <div style={{ opacity: 1 - fade, filter: `grayscale(${fade}) blur(${fade * 3}px)` }}>
            <Framed src="heros/ruben-um-nyobe.jpg" x={540} y={760} size={560} fy={0.42} border={`rgba(240,195,107,${1 - fade})`} />
          </div>
          <Center y={1110}>
            <div style={{ display: "flex", fontFamily: cinzel, fontWeight: 900, fontSize: 84, whiteSpace: "pre" }}>
              {name.split("").map((ch, i) => {
                const o = 1 - ramp(f, 10 + i * 2.2, 6, 0, 1);
                return (
                  <span key={i} style={{ color: G.deep, opacity: o }}>
                    {ch}
                  </span>
                );
              })}
            </div>
          </Center>
        </>
      ) : null}
      {f >= s(1.5) ? (
        <Center y={700}>
          <Line text="Au Cameroun, son nom fut interdit" at={s(1.5)} size={50} color={G.inkDark} dark />
          <div style={{ height: 30 }} />
          <PunchWord text="PLUS DE" at={s(1.7)} size={90} color={G.terra} style={{ filter: "none" }} />
          <PunchWord text="30 ANS" at={s(1.85)} size={170} color={G.terra} style={{ filter: "none" }} />
          <div style={{ height: 24 }} />
          <Line text="jusqu'à la loi de 1991" at={s(2.05)} size={40} weight={700} color={G.ink} dark />
        </Center>
      ) : null}
      {black > 0 ? <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${black})` }} /> : null}
      {dot > 0 ? <div style={{ position: "absolute", left: 540 - 22, top: 960 - 22, width: 44, height: 44, borderRadius: 22, background: C.goldPale, transform: `scale(${dot})`, boxShadow: "0 0 50px 20px rgba(240,195,107,0.7)" }} /> : null}
    </AbsoluteFill>
  );
};

/** 7 · RELANCE 1 · AFROBACK (20,1 → 23,45) */
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const fill = ramp(f, s(1.1), 36, 0, 1400, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill>
      <Shake hits={[{ at: 0, amp: 14, dur: 4 }]}>
        <AbsoluteFill style={{ backgroundColor: "#0B0906" }} />
        <AbsoluteFill style={{ clipPath: `circle(${fill}px at 50% 42%)`, background: "radial-gradient(circle at 50% 42%, #5a3d14 0%, #2a1c0c 55%, #120c06 100%)" }}>
          <Diamonds id="s7" size={120} opacity={0.22} />
        </AbsoluteFill>
        <Shockwave at={0} x={540} y={800} />
        <Particles at={0} x={540} y={800} count={44} seed="s7p" />
        <Center y={600}>
          <div style={{ transform: `scale(${popScale(f, 0, 10, 1.18)})`, width: 380, height: 380, borderRadius: 190, overflow: "hidden", border: `6px solid ${C.gold}`, boxShadow: "0 0 110px rgba(240,195,107,0.7)" }}>
            <Img src={staticFile("img/logo-medaillon.jpg")} style={{ width: "100%", height: "100%" }} />
          </div>
          <div style={{ height: 50 }} />
          <LetterDrop text="AFROBACK" at={4} size={124} />
          <div style={{ height: 40 }} />
          <Line text="Retour aux origines" at={s(1.7)} size={56} />
        </Center>
      </Shake>
      <MotifWipe at={s(3.1)} dur={8} />
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/** 8 · Héros (23,45 → 26,7) */
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const rise = ramp(f, 0, 14, 0, 1, Easing.out(Easing.back(1.2)));
  const pose: PhonePose = { ...POSE, y: POSE.y + (1 - rise) * 900, rotateY: (1 - rise) * 18 };
  const scroll = ramp(f, s(0.8), 14, 0, 1, Easing.inOut(Easing.cubic));
  const toFiche = ramp(f, s(1.85), 8, 0, 1);
  const push = ramp(f, s(1.85), 40, 1, 1.12);
  const tap = st(pose, 287, 140);
  return (
    <AbsoluteFill>
      <GoldBg id="s8" />
      <Label text="LES HÉROS" />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "540px 900px" }}>
        <Shot pose={pose} src={cap("p60-heros")}>
          <Img src={staticFile(cap("p60-heros"))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translateY(${-scroll * 844}px)` }} />
          <Img src={staticFile(cap("p60-heros-2"))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translateY(${(1 - scroll) * 844}px)` }} />
          <Img src={staticFile(cap("ruben-um-nyobe"))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: toFiche }} />
        </Shot>
        <Tap at={s(1.65)} x={tap.x} y={tap.y} />
      </div>
      <Vig strength={0.45} />
    </AbsoluteFill>
  );
};

/** Onde sonore dorée (barres). */
const Wave: React.FC<{ at: number; y: number }> = ({ at, y }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const o = ramp(f, at, 6, 0, 1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y - 80, height: 160, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", opacity: o }}>
      {Array.from({ length: 22 }).map((_, i) => {
        const side = i < 11 ? i : 21 - i;
        const hgt = 20 + Math.abs(Math.sin((f - at) * 0.45 + i * 1.3)) * (40 + side * 8);
        return <div key={i} style={{ width: 12, height: hgt, borderRadius: 6, background: C.gold, boxShadow: "0 0 14px rgba(240,195,107,0.7)", visibility: i >= 5 && i <= 16 ? "hidden" : "visible" }} />;
      })}
    </div>
  );
};

/** 9 · Lis / Écoute (26,7 → 30,0) */
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const page = ramp(f, s(1.25), 9, 0, 1, Easing.inOut(Easing.cubic));
  const toListen = ramp(f, s(2.2), 6, 0, 1);
  const next = st(POSE, 300, 748);
  const listen = st(POSE, 100, 636);
  return (
    <AbsoluteFill>
      <GoldBg id="s9" />
      {f < s(2.3) ? <Label text="LIS." at={1} size={110} /> : <Label text="ÉCOUTE." at={s(2.3)} size={110} />}
      <Shot pose={POSE} src={cap("p60-recit-1")}>
        <Img src={staticFile(cap("p60-recit-1"))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translateX(${-page * 390}px)` }} />
        <Img src={staticFile(cap("p60-recit-2"))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translateX(${(1 - page) * 390}px)` }} />
        <Img src={staticFile(cap("p60-fiche-nzinga"))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: toListen }} />
      </Shot>
      <Tap at={s(1.1)} x={next.x} y={next.y} />
      <Pulse at={s(2.4)} x={listen.x} y={listen.y} w2={250} h2={90} />
      <Wave at={s(2.4)} y={listen.y} />
      <Vig strength={0.45} />
    </AbsoluteFill>
  );
};

/** 10 · Mythes (30,0 → 34,5) */
const S10: React.FC = () => {
  const f = useCurrentFrame();
  const dive = ramp(f, s(1.35), 10, 0, 1, Easing.in(Easing.cubic));
  const a = s(1.7);
  const b = s(3.2);
  const u = ramp(f, a, b - a, 0, 1, Easing.inOut(Easing.cubic));
  const v = ramp(f, b, s(4.5) - b, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {f < a ? (
        <AbsoluteFill>
          <GoldBg id="s10" />
          <Label text="LES MYTHES" />
          <Shot pose={{ ...POSE, scale: POSE.scale * (1 + dive * 2.2), opacity: 1 - dive }} src={cap("p60-mythes")} />
        </AbsoluteFill>
      ) : f < b ? (
        <AbsoluteFill>
          <Illu src="img/mythe-ngan-medza-beti.jpg" cx={interpolate(u, [0, 1], [0.38, 0.6])} cy={interpolate(u, [0, 1], [0.42, 0.5])} zoom={interpolate(u, [0, 1], [1.35, 1.12])} />
          <Fog y={1300} opacity={0.6} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,0.8) 80%)" }} />
          <Center y={1180}>
            <PunchWord text="NGAN MEDZA" at={s(2.3)} size={120} shine={[s(2.5), s(3.0)]} />
            <Line text="le serpent qui porta un peuple" at={s(2.45)} size={40} weight={700} />
          </Center>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <Illu src="img/mythe-sao-geants-kotoko.jpg" cx={0.5} cy={interpolate(v, [0, 1], [0.45, 0.42])} zoom={interpolate(v, [0, 1], [1.2, 1.35])} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,0.85) 80%)" }} />
          <Center y={1220}>
            <PunchWord text="LES GÉANTS SAO" at={s(3.35)} size={104} />
          </Center>
        </AbsoluteFill>
      )}
      {f >= a ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1478, textAlign: "center", fontFamily: manrope, fontWeight: 700, fontSize: 28, color: "rgba(255,244,224,0.75)" }}>Légendes de tradition orale · illustrations AFROBACK</div>
      ) : null}
      {f >= a ? <MotifWipe at={a} dur={7} /> : null}
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

const Burst: React.FC<{ src: string; word: string; from: number; to: number; cx?: number; cy?: number }> = ({ src, word, from, to, cx = 0.5, cy = 0.5 }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const u = ramp(f, from, to - from, 0, 1, Easing.linear);
  return (
    <AbsoluteFill>
      <Illu src={src} cx={cx} cy={cy} zoom={1.02 + u * 0.12} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.85) 82%)" }} />
      <Center y={1290}>
        <PunchWord text={word} at={from + 1} size={word.length > 10 ? 92 : 112} />
      </Center>
    </AbsoluteFill>
  );
};

/** 11 · Découverte (34,5 → 39,75) */
const S11: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = s(0.8), t2 = s(1.8), t3 = s(2.6), t4 = s(3.45), end = s(5.25);
  const shrink = ramp(f, s(4.8), 12, 0, 1, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {f < t1 ? (
        <AbsoluteFill>
          <GoldBg id="s11" />
          <Label text="LA DÉCOUVERTE" size={76} />
          <Shot pose={POSE} src={cap("p60-decouverte")} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ transform: `scale(${1 - shrink * 0.25})`, opacity: 1 - shrink * 0.7 }}>
        <Burst src="img/ebolowa.jpg" word="VILLAGES" from={t1} to={t2} />
        <Burst src="img/palais-royal-foumban.jpg" word="PALAIS" from={t2} to={t3} />
        <Burst src="img/nguon.jpg" word="RITES" from={t3} to={t4} />
        <Burst src="img/trone-mandu-yenu.jpg" word="OBJETS SACRÉS" from={t4} to={end} cy={0.55} />
      </AbsoluteFill>
      {[t1, t2, t3, t4].map((t) => (
        <MotifWipe key={t} at={t - 3} dur={7} />
      ))}
      <Vig strength={0.45} />
    </AbsoluteFill>
  );
};

/** 12 · RELANCE 2 · « Tout est là. » (39,75 → 41,75) */
const S12: React.FC = () => {
  const f = useCurrentFrame();
  const tiles = [
    { src: cap("p60-heros"), x: 250, y: 680, r: -6 },
    { src: cap("p60-recit-1"), x: 830, y: 680, r: 5 },
    { src: cap("p60-mythes"), x: 230, y: 1010, r: 4 },
    { src: cap("p60-decouverte"), x: 850, y: 1010, r: -5 },
    { src: cap("p60-fiche-nzinga"), x: 330, y: 1300, r: -3 },
    { src: cap("p60-commentaires"), x: 750, y: 1300, r: 6 },
  ];
  const conv = ramp(f, s(1.15), 14, 0, 1, Easing.in(Easing.cubic));
  const ph = ramp(f, s(1.1), 10, 0, 1, Easing.out(Easing.back(1.3)));
  return (
    <AbsoluteFill>
      <Shake hits={[{ at: 0, amp: 12, dur: 3 }]}>
        <GoldBg id="s12" />
        {f >= s(1.1) ? <Shot pose={{ x: 540, y: 960, scale: 1.05 * ph }} src={cap("p60-accueil")} /> : null}
        {tiles.map((t, i) => {
          const inP = ramp(f, i * 1.5, 8, 0, 1, Easing.out(Easing.back(1.4)));
          const fromX = t.x < 540 ? -500 : 1580;
          const x = interpolate(inP, [0, 1], [fromX, t.x]) * (1 - conv) + 540 * conv;
          const y = t.y * (1 - conv) + 960 * conv;
          const sc = 0.5 * (1 - conv * 0.7);
          return (
            <div key={i} style={{ position: "absolute", left: x - 195 * sc, top: y - 422 * sc, width: 390 * sc, height: 844 * sc, transform: `rotate(${t.r * (1 - conv)}deg)`, borderRadius: 26 * sc, overflow: "hidden", border: `${4}px solid ${C.gold}`, opacity: 1 - conv, boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
              <Img src={staticFile(t.src)} style={{ width: "100%", height: "100%" }} />
            </div>
          );
        })}
        {f >= s(1.5) ? <Shockwave at={s(1.5)} x={540} y={960} /> : null}
      </Shake>
      <Center y={262}>
        <PunchWord text="TOUT EST LÀ." at={1} size={116} color={C.ivory} />
      </Center>
      <Center y={1440}>
        <Line text="Dans ta poche." at={s(0.85)} size={58} color={C.gold} />
      </Center>
      <Vig strength={0.45} />
    </AbsoluteFill>
  );
};

/** 13 · Communauté (41,75 → 46,2) */
const S13: React.FC = () => {
  const f = useCurrentFrame();
  const phase = f < s(1.9) ? 0 : f < s(3.1) ? 1 : 2;
  const src = phase === 0 ? cap("p60-fiche-nzinga") : phase === 1 ? cap("p60-commentaires") : cap("p60-communaute");
  const like = st(POSE, 48, 504);
  const heart = f >= s(1.5) ? popScale(f, s(1.5), 8, 1.4) : 0;
  const pub = st(POSE, 310, 733);
  return (
    <AbsoluteFill>
      <GoldBg id="s13" />
      <Label text="LA COMMUNAUTÉ" size={76} />
      <Shot pose={POSE} src={src} />
      {phase === 0 && heart > 0 ? (
        <svg width={150} height={150} viewBox="0 0 100 100" style={{ position: "absolute", left: like.x - 75, top: like.y - 170 - ramp(f, s(1.5), 15, 0, 60), transform: `scale(${heart})`, opacity: 1 - ramp(f, s(1.75), 6, 0, 1) }}>
          <path d="M50 86 C 20 64, 6 46, 14 28 C 22 12, 42 14, 50 30 C 58 14, 78 12, 86 28 C 94 46, 80 64, 50 86 Z" fill={C.gold} stroke={C.ivory} strokeWidth={3} />
        </svg>
      ) : null}
      {phase === 1 ? (
        <svg width={170} height={150} viewBox="0 0 100 90" style={{ position: "absolute", left: 830, top: 1020, transform: `scale(${popScale(f, s(2.0), 8, 1.3)})` }}>
          <path d="M10 10 H90 V62 H40 L22 80 V62 H10 Z" fill={C.gold} stroke={C.ivory} strokeWidth={3} strokeLinejoin="round" />
        </svg>
      ) : null}
      {phase === 2 ? (
        <>
          <Pulse at={s(3.2)} x={pub.x} y={pub.y} w2={200} h2={80} />
          {[0, 1, 2].map((i) => {
            const t = ramp(f, s(3.15) + i * 4, 18, 0, 1, Easing.out(Easing.cubic));
            return (
              <svg key={i} width={90} height={90} viewBox="0 0 100 100" style={{ position: "absolute", left: 760 + t * 260, top: 900 - i * 90 - t * 120, opacity: (1 - t) * (t > 0 ? 1 : 0) }}>
                <path d="M15 85 L85 50 L15 15 L28 50 Z" fill={C.gold} />
              </svg>
            );
          })}
        </>
      ) : null}
      <Vig strength={0.45} />
    </AbsoluteFill>
  );
};

/** 14 · Transmets à tes enfants (46,2 → 49,5) · illustration AFROBACK (pas de faux écran). */
const S14: React.FC = () => {
  const f = useCurrentFrame();
  const z = ramp(f, 0, 100, 1.04, 1.14, Easing.linear);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "45% 60%" }}>
        <Img src={staticFile("img/transmettre.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.25) 30%,rgba(0,0,0,0) 55%,rgba(0,0,0,0.75) 80%)" }} />
      <Center y={270}>
        <PunchWord text="TRANSMETS" at={s(0.2)} size={118} />
        <div style={{ height: 6 }} />
        <Line text="à tes enfants" at={s(0.8)} size={58} />
        <div style={{ height: 14 }} />
        <Line text="Illustration AFROBACK" at={s(0.8)} size={26} weight={700} color="rgba(255,244,224,0.7)" />
      </Center>
      <Embers x={540} y={1250} count={14} spread={700} power={0.6} />
      <Vig strength={0.4} />
    </AbsoluteFill>
  );
};

/** 15 · Gratuit pour commencer (49,5 → 51,35) */
const S15: React.FC = () => {
  const f = useCurrentFrame();
  const rise = ramp(f, 0, 10, 0, 1, Easing.out(Easing.back(1.2)));
  return (
    <AbsoluteFill>
      <GoldBg id="s15" />
      <Shot pose={{ x: 540, y: 1060 + (1 - rise) * 700, scale: 1.1 }} src="img/splash.jpg" />
      <Center y={262}>
        <PunchWord text="GRATUIT" at={s(0.1)} size={132} shine={[s(0.4), s(1.0)]} />
        <div style={{ height: 6 }} />
        <Line text="pour commencer" at={s(0.55)} size={56} />
      </Center>
      <MotifWipe at={s(0.9)} dur={9} />
      <Vig strength={0.45} />
    </AbsoluteFill>
  );
};

/** 16 · Promo finale (51,35 → 60,0) : badges officiels Apple et Google, non modifiés (fondu + glissement seulement). */
const S16: React.FC = () => {
  const f = useCurrentFrame();
  const rise = ramp(f, 0, 14, 0, 1, Easing.out(Easing.back(1.1)));
  const swap = ramp(f, s(4.25), 10, 0, 1);
  const badge = (at: number) => ({ opacity: ramp(f, at, 8, 0, 1, Easing.out(Easing.quad)), transform: `translateY(${(1 - ramp(f, at, 8, 0, 1)) * 30}px)` });
  const BH = 116;
  return (
    <AbsoluteFill>
      <GoldBg id="s16" />
      <Fog y={1600} opacity={0.3} />
      {swap < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - swap }}>
          <Shot pose={{ x: 540, y: 640 + (1 - rise) * 1200, scale: 0.86 }} src={cap("p60-accueil")} />
          <Center y={1030}>
            <PunchWord text="TÉLÉCHARGE" at={s(0.1)} size={86} color={C.ivory} />
            <div style={{ height: 8 }} />
            <PunchWord text="AFROBACK" at={s(0.6)} size={120} shine={[s(0.9), s(1.5)]} />
          </Center>
        </AbsoluteFill>
      ) : null}
      {f >= s(4.3) ? (
        <Center y={400}>
          <div style={{ transform: `scale(${popScale(f, s(4.3), 10, 1.2)})`, width: 360, height: 360, borderRadius: 180, overflow: "hidden", border: `6px solid ${C.gold}`, boxShadow: "0 0 100px rgba(240,195,107,0.6)" }}>
            <Img src={staticFile("img/logo-medaillon.jpg")} style={{ width: "100%", height: "100%" }} />
          </div>
          <div style={{ height: 40 }} />
          <LetterDrop text="AFROBACK" at={s(4.45)} size={112} />
          <div style={{ height: 22 }} />
          <Line text="Retour aux origines" at={s(4.9)} size={46} weight={700} />
          <div style={{ height: 50 }} />
          <LetterDrop text="afroback.app" at={s(5.2)} size={64} family={manrope} weight={800} color={C.ivory} colorFrom={{ index: 8, color: C.gold }} stagger={0.6} />
        </Center>
      ) : null}
      {/* Badges officiels (fichiers Apple / Google tels quels) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", alignItems: "center", gap: 40 }}>
        <div style={badge(s(1.35))}>
          <Img src={staticFile("badges/app-store-fr.svg")} style={{ height: BH, width: (BH * 126.50751) / 40, display: "block" }} />
        </div>
        <div style={badge(s(1.5))}>
          {/* le PNG officiel Google contient une marge transparente (29 px sur 250 en haut et en bas) : on l'agrandit pour que le badge visible ait la même hauteur que celui d'Apple */}
          <Img src={staticFile("badges/google-play-fr.png")} style={{ height: (BH * 250) / 192, width: (BH * 250 * 646) / (192 * 250), margin: `${-(BH * 29) / 192}px 0`, display: "block" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1452, textAlign: "center", fontFamily: manrope, fontWeight: 500, fontSize: 21, lineHeight: 1.35, color: "rgba(255,244,224,0.55)", opacity: ramp(f, s(1.7), 8, 0, 1) }}>
        Apple, le logo Apple et App Store sont des marques d'Apple Inc. Google Play et le logo Google Play sont des marques de Google LLC.
      </div>
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */

const SCENES: { from: number; dur: number; C: React.FC }[] = [
  { from: 0, dur: 1.45, C: S1 },
  { from: 1.45, dur: 2.45, C: S2 },
  { from: 3.9, dur: 3.0, C: S3A },
  { from: 6.9, dur: 3.5, C: S3B },
  { from: 10.4, dur: 2.4, C: S4 },
  { from: 12.8, dur: 4.3, C: S5 },
  { from: 17.1, dur: 3.0, C: S6 },
  { from: 20.1, dur: 3.35, C: S7 },
  { from: 23.45, dur: 3.25, C: S8 },
  { from: 26.7, dur: 3.3, C: S9 },
  { from: 30.0, dur: 4.5, C: S10 },
  { from: 34.5, dur: 5.25, C: S11 },
  { from: 39.75, dur: 2.0, C: S12 },
  { from: 41.75, dur: 4.45, C: S13 },
  { from: 46.2, dur: 3.3, C: S14 },
  { from: 49.5, dur: 1.85, C: S15 },
  { from: 51.35, dur: 8.65, C: S16 },
];

/** Sous-titres karaoké (timing.json), seulement pour les phrases qui ne sont pas écrites en gros. */
const SUBS = [
  { words: w([["Nos", 23.5], ["héros", 23.71], ["africains,", 24.0], ["racontés", 24.66], ["comme", 25.07], ["le", 25.36], ["ferait", 25.53], ["un", 25.86], ["griot.", 26.02]]), end: s(26.65) },
  { words: w([["Lis", 26.75], ["leur", 26.95], ["histoire,", 27.18], ["chapitre", 27.77], ["après", 28.17], ["chapitre.", 28.45]]), end: s(29.0) },
  { words: w([["Entre", 30.1], ["dans", 30.44], ["nos", 30.74], ["mythes", 30.99]]), end: s(31.65) },
  { words: w([["Découvre", 34.6], ["nos", 35.09]]), end: s(35.3) },
  { words: w([["Rejoins", 41.8], ["la", 42.22], ["communauté", 42.41], ["aime,", 43.3], ["commente,", 43.82], ["partage", 44.52], ["avec", 44.94], ["les", 45.22], ["tiens.", 45.46]]), end: s(46.15) },
  { words: w([["dans", 47.94], ["leur", 48.19], ["propre", 48.44], ["espace.", 48.77]]), end: s(49.45) },
];

export const Presentation60s: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
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
    {withAudio ? <Audio src={staticFile("audio/mix-presentation-app-60s.wav")} /> : null}
  </AbsoluteFill>
);
