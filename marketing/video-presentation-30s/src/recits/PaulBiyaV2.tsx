/**
 * AFROBACK · Paul Biya v2 · « La frise d'or » (31 s, 9:16), récit en mode « Mémoire ».
 * Même voix et même mix que la v1 (public/audio/mix-paul-biya.wav, recits/paul-biya/timing.json).
 *
 * DA : identité du site AFROBACK (encre #070504, or en dégradé brillant, motif losange, grain de film,
 * cartes « verre » à liseré doré, Cinzel + Manrope). Fil conducteur : une FRISE DORÉE en haut de l'écran,
 * de 1933 à 2026, sur laquelle avance un médaillon du portrait. Le portrait (décision de Yannick) est
 * révélé par un masque en losange, s'envole dans la frise, revient en arche en 1982, puis au centre
 * pour les deux lectures. Le portrait n'est jamais animé (pas de bouche, pas de visage qui bouge) :
 * seulement cadré, masqué, zoomé.
 * Fond factuel identique à la v1 : aucun chiffre contesté, aucune citation, « élections contestées » affiché.
 * Images tierces : voir recits/paul-biya/credits.md.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cinzel, manrope, s } from "../theme";
import { Grain } from "../fx";
import { Vig } from "../recit-kit";
import { Diplomas, Ephemeride, Soutane } from "./biya-props";
import { OutroBiya } from "./biya-fin";

export const BIYA_V2_DUREE = 31;
const PORTRAIT = "heros/paul-biya.png";
const T_OUTRO = 27.4;

/* ---------- Identité du site (site-web/web/src/app/globals.css) ---------- */
const S = {
  ink: "#070504",
  ink2: "#0d0906",
  surface: "#16100b",
  surface2: "#21170f",
  gold: "#f0c36b",
  goldPale: "#f7d98b",
  goldSoft: "#c99a5b",
  goldDeep: "#b9792f",
  ivory: "#fff4e0",
  heading: "#f7e7c8",
  body: "#cdbda8",
  muted: "#8c7b67",
  terra: "#e3a277",
};
const GOLD_GRAD = "linear-gradient(100deg, #b9792f 0%, #f7d98b 28%, #fff4e0 42%, #f0c36b 58%, #b9792f 100%)";

const easeIO = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);
/** rampe en secondes */
const R = (f: number, at: number, dur: number, from: number, to: number, e: (t: number) => number = easeOut) =>
  interpolate(f, [at * 30, (at + dur) * 30], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const inWin = (f: number, a: number, b: number) => f >= a * 30 && f < b * 30;

/** Texte doré brillant du site (.text-gold-gradient.is-animated). */
const goldText = (f: number): React.CSSProperties => ({
  background: GOLD_GRAD,
  backgroundSize: "220% 100%",
  backgroundPosition: `${200 - ((f / 30 / 6) * 200) % 200}% 0`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

/* ---------- Fond : encre, motif losange du site, poussière d'or ---------- */
const Losanges: React.FC<{ opacity?: number; drift?: number }> = ({ opacity = 0.07, drift = 0.25 }) => {
  const f = useCurrentFrame();
  const off = (f * drift) % 64;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <pattern id="los-v2" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${off})`}>
          <g fill="none" stroke={S.gold} strokeWidth="1.2">
            <path d="M32 4 60 32 32 60 4 32Z" />
            <path d="M32 18 46 32 32 46 18 32Z" />
          </g>
          <circle cx="32" cy="32" r="2.5" fill={S.gold} />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill="url(#los-v2)" />
    </svg>
  );
};

const Dust: React.FC<{ count?: number; power?: number }> = ({ count = 26, power = 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const life = 160 + random(`dl${i}`) * 140;
        const t = (f + random(`do${i}`) * life) % life;
        const x = random(`dx${i}`) * 1080 + Math.sin((f + i * 30) * 0.02) * 30;
        const y = 1700 - (t / life) * 1500;
        const o = Math.sin((t / life) * Math.PI) * 0.55 * power;
        const sz = 2 + random(`ds${i}`) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: sz, background: S.goldPale, opacity: o, boxShadow: `0 0 ${sz * 3}px ${S.gold}` }} />;
      })}
    </>
  );
};

const Bg: React.FC<{ glowY?: number; pattern?: number }> = ({ glowY = 50, pattern = 0.07 }) => (
  <AbsoluteFill style={{ background: S.ink }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at 50% ${glowY}%, rgba(201,154,91,0.16) 0%, rgba(33,23,15,0.6) 40%, rgba(7,5,4,0) 75%)` }} />
    <Losanges opacity={pattern} />
    <Dust />
  </AbsoluteFill>
);

/* ---------- Typographie cinétique ---------- */
type LineProps = { text: React.ReactNode; at: number; out?: number; y: number; size: number; font?: "c" | "m"; gold?: boolean; color?: string; weight?: number; align?: "center" | "left"; x?: number; spacing?: number };
/** Ligne qui monte derrière un masque (entrée), puis repart vers le haut (sortie). */
const Line: React.FC<LineProps> = ({ text, at, out = 999, y, size, font = "c", gold, color = S.ivory, weight, align = "center", x = 60, spacing }) => {
  const f = useCurrentFrame();
  if (f < at * 30 || f >= out * 30 + 9) return null;
  const inY = R(f, at, 0.42, 110, 0, Easing.out(Easing.exp));
  const outY = R(f, out, 0.3, 0, -115, Easing.in(Easing.cubic));
  return (
    <div style={{ position: "absolute", left: x, right: align === "center" ? x : 40, top: y, textAlign: align, overflow: "hidden", paddingBottom: size * 0.12 }}>
      <div
        style={{
          transform: `translateY(${inY + outY}%)`,
          fontFamily: font === "c" ? cinzel : manrope,
          fontWeight: weight ?? (font === "c" ? 900 : 700),
          fontSize: size,
          lineHeight: 1.12,
          letterSpacing: spacing ?? (font === "c" ? size * 0.03 : 0),
          ...(gold ? goldText(f) : { color }),
          filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.85))",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Lettres qui arrivent une à une (rotation 3D légère), en or brillant. */
const Letters: React.FC<{ text: string; at: number; out?: number; y: number; size: number; gold?: boolean; color?: string; stagger?: number }> = ({ text, at, out = 999, y, size, gold = true, color = S.ivory, stagger = 1.6 }) => {
  const f = useCurrentFrame();
  if (f < at * 30 || f >= out * 30 + 8) return null;
  const o = 1 - R(f, out, 0.25, 0, 1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: o, perspective: 900 }}>
      {text.split("").map((ch, i) => {
        const st = at * 30 + i * stagger;
        const p = interpolate(f, [st, st + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", fontFamily: cinzel, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: size * 0.03, opacity: p, transform: `translateY(${(1 - p) * 60}px) rotateX(${(1 - p) * 80}deg)`, ...(gold ? goldText(f) : { color }), filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.85))" }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Mot géant en contour doré qui défile (texture typographique de fond). */
const OutlineMarquee: React.FC<{ text: string; y: number; size: number; speed: number; from: number; to: number; opacity?: number }> = ({ text, y, size, speed, from, to, opacity = 0.22 }) => {
  const f = useCurrentFrame();
  if (!inWin(f, from, to)) return null;
  const o = Math.min(R(f, from, 0.3, 0, 1), 1 - R(f, to - 0.3, 0.3, 0, 1)) * opacity;
  const x = (f - from * 30) * speed;
  return (
    <div style={{ position: "absolute", left: speed < 0 ? 200 + x : -1600 + x, top: y, whiteSpace: "nowrap", fontFamily: cinzel, fontWeight: 900, fontSize: size, color: "transparent", WebkitTextStroke: `2px ${S.gold}`, opacity: o, letterSpacing: size * 0.04 }}>
      {`${text} · ${text} · ${text}`}
    </div>
  );
};

/** Balayage de lumière dorée diagonal (transition). */
const Sweep: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  if (!inWin(f, at, at + 0.5)) return null;
  const p = R(f, at, 0.5, -0.4, 1.4, easeIO);
  return <AbsoluteFill style={{ pointerEvents: "none", background: `linear-gradient(115deg, rgba(0,0,0,0) ${p * 100 - 18}%, rgba(247,217,139,0.26) ${p * 100}%, rgba(0,0,0,0) ${p * 100 + 18}%)` }} />;
};

/** Carte « verre » du site (liseré doré lumineux). */
const Glass: React.FC<{ w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, children, style }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 26,
      background: `linear-gradient(160deg, ${S.surface2} 0%, ${S.surface} 60%, ${S.ink2} 100%)`,
      boxShadow: "0 0 0 1.5px rgba(240,195,107,0.55), 0 18px 50px -8px rgba(240,195,107,0.30), 0 30px 80px rgba(0,0,0,0.7)",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const Credit: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const f = useCurrentFrame();
  if (!inWin(f, from, to)) return null;
  return (
    <div style={{ position: "absolute", right: 22, top: 1180, transformOrigin: "100% 0%", transform: "rotate(-90deg) translateX(100%)", fontFamily: manrope, fontWeight: 600, fontSize: 22, color: "rgba(205,189,168,0.62)", whiteSpace: "nowrap", opacity: Math.min(R(f, from, 0.3, 0, 1), 1 - R(f, to - 0.3, 0.3, 0, 1)) }}>
      {text}
    </div>
  );
};

/* ---------- Portrait (jamais animé : cadrage, masque et zoom seulement) ---------- */
/** cx, cy : point visé dans l'image (fraction) ; zoom 1 = image de 1920 px. */
const PortraitIn: React.FC<{ w: number; h: number; cx: number; cy: number; zoom: number }> = ({ w, h, cx, cy, zoom }) => {
  const size = 1920 * zoom;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img src={staticFile(PORTRAIT)} style={{ position: "absolute", left: w / 2 - cx * size, top: h / 2 - cy * size, width: size, height: size }} />
    </div>
  );
};

/* ---------- La frise d'or (fil conducteur) ---------- */
const FRISE_Y = 440;
const X0 = 110;
const X1 = 970;
const yx = (yr: number) => X0 + ((yr - 1930) / (2026 - 1930)) * (X1 - X0);
const STEPS: [number, number][] = [
  [5.85, 1933], [8.15, 1948], [9.23, 1956], [11.25, 1962], [11.6, 1968], [11.9, 1970], [12.4, 1975], [13.65, 1982],
  [17.4, 1984], [18.4, 1987], [19.06, 1990], [20.45, 2002], [21.3, 2008], [22.07, 2014], [22.98, 2025], [24.75, 2026],
];
const yearAt = (t: number) => {
  let i = -1;
  for (let k = 0; k < STEPS.length; k++) if (t >= STEPS[k][0]) i = k;
  if (i <= 0) return 1933;
  const prev = STEPS[i - 1][1];
  const u = Math.min(1, (t - STEPS[i][0]) / 0.45);
  return prev + (STEPS[i][1] - prev) * easeIO(u);
};
const yearLabel = (t: number) => {
  let i = -1;
  for (let k = 0; k < STEPS.length; k++) if (t >= STEPS[k][0]) i = k;
  if (i <= 0) return 1933;
  return t - STEPS[i][0] < 0.22 ? STEPS[i - 1][1] : STEPS[i][1];
};
const FRISE_IN = 5.7;
const FRISE_OUT = 27.3;

const Frise: React.FC = () => {
  const f = useCurrentFrame();
  if (!inWin(f, FRISE_IN, FRISE_OUT)) return null;
  const t = f / 30;
  const draw = R(f, FRISE_IN, 0.5, 0, 1, easeIO);
  const o = 1 - R(f, FRISE_OUT - 0.3, 0.3, 0, 1);
  const yr = yearAt(t);
  const mx = yx(yr);
  const med = R(f, 5.9, 0.25, 0, 1, Easing.out(Easing.back(1.6)));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      {/* bandeau Mémoire */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center", opacity: R(f, FRISE_IN + 0.2, 0.4, 0, 1) }}>
        <div style={{ padding: "7px 20px", borderRadius: 30, background: "rgba(7,5,4,0.7)", border: "1.5px solid rgba(240,195,107,0.4)", fontFamily: manrope, fontWeight: 700, fontSize: 30, color: S.body }}>
          <span style={{ color: S.gold, fontFamily: cinzel, fontWeight: 900, letterSpacing: 2 }}>MÉMOIRE</span> · les faits, et d'où ils viennent
        </div>
      </div>
      {/* ligne */}
      <div style={{ position: "absolute", left: X0, top: FRISE_Y - 1, width: (X1 - X0) * draw, height: 2, background: "rgba(240,195,107,0.28)" }} />
      <div style={{ position: "absolute", left: X0, top: FRISE_Y - 2, width: Math.max(0, mx - X0) * draw, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${S.goldDeep}, ${S.gold})`, boxShadow: "0 0 14px rgba(240,195,107,0.6)" }} />
      {/* repères déjà franchis */}
      {STEPS.map(([, y], i) =>
        y <= yr + 0.01 ? <div key={i} style={{ position: "absolute", left: yx(y) - 5, top: FRISE_Y - 5, width: 10, height: 10, borderRadius: 5, background: S.goldPale, boxShadow: "0 0 8px rgba(240,195,107,0.8)" }} /> : null,
      )}
      <div style={{ position: "absolute", left: X0 - 40, top: FRISE_Y + 16, width: 80, textAlign: "center", fontFamily: manrope, fontWeight: 700, fontSize: 24, color: S.muted, opacity: draw }}>1933</div>
      <div style={{ position: "absolute", left: X1 - 40, top: FRISE_Y + 16, width: 80, textAlign: "center", fontFamily: manrope, fontWeight: 700, fontSize: 24, color: S.muted, opacity: draw }}>2026</div>
      {/* médaillon du portrait */}
      {med > 0 ? (
        <>
          <div style={{ position: "absolute", left: mx - 46, top: FRISE_Y - 46, width: 92, height: 92, borderRadius: 46, overflow: "hidden", transform: `scale(${med})`, border: `3px solid ${S.gold}`, boxShadow: "0 0 24px rgba(240,195,107,0.55), 0 8px 20px rgba(0,0,0,0.8)", background: S.ink }}>
            <Img src={staticFile(PORTRAIT)} style={{ position: "absolute", left: -60, top: -38, width: 200, height: 200 }} />
          </div>
          <div style={{ position: "absolute", left: mx - 80, top: FRISE_Y - 96, width: 160, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 36, opacity: med, ...goldText(f), filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.9))" }}>
            {yearLabel(t)}
          </div>
        </>
      ) : null}
    </div>
  );
};

/* ---------- Scène 1 · Né après 1982 ? (0 à 3,55 s) ---------- */
const DigitRoll: React.FC<{ value: number; size: number }> = ({ value, size }) => {
  const f = useCurrentFrame();
  const h = size * 1.08;
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {[3, 2, 1, 0].map((p) => {
        const pow = Math.pow(10, p);
        const base = Math.floor(value / pow) % 10;
        const frac = p === 0 ? value - Math.floor(value) : Math.max(0, (value % pow) - (pow - 1));
        const pos = base + frac;
        return (
          <div key={p} style={{ position: "relative", width: size * 0.68, height: h, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: -pos * h }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
                <div key={i} style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: cinzel, fontWeight: 900, fontSize: size, ...goldText(f + p * 20) }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= 3.6 * 30) return null;
  const value = interpolate(f, [1.2 * 30, 2.35 * 30], [1982, 2026], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeIO });
  const push = interpolate(f, [0, 3.5 * 30], [1, 1.06]);
  const ring = R(f, 2.35, 0.6, 0, 1);
  return (
    <AbsoluteFill>
      <Bg glowY={48} pattern={0.08} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Line text="NÉ APRÈS 1982 ?" at={0.05} out={3.0} y={560} size={70} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 720 }}>
          <DigitRoll value={value} size={300} />
        </div>
        {/* anneau qui se ferme quand le compteur arrive en 2026 */}
        {ring > 0 ? <div style={{ position: "absolute", left: 540 - 470, top: 885 - 8, width: 940, height: 16, borderRadius: 8, background: `linear-gradient(90deg, rgba(240,195,107,0) 0%, rgba(240,195,107,0.75) 50%, rgba(240,195,107,0) 100%)`, transform: `scaleX(${ring})`, opacity: 0.35 * (1 - R(f, 3.0, 0.4, 0, 1)) }} /> : null}
        <Line text="CAMEROUN" at={0.5} out={3.0} y={1070} size={36} font="m" color={S.body} spacing={14} />
        <Line text={<>TU N'AS CONNU QU'<span style={{ color: S.gold }}>UN</span></>} at={2.05} out={3.05} y={1190} size={64} />
        <Line text={<><span style={{ color: S.gold }}>SEUL</span> PRÉSIDENT.</>} at={2.18} out={3.1} y={1280} size={64} />
      </AbsoluteFill>
      <Vig strength={0.7} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 2 · Le portrait, révélé par un losange (3,1 à 6,0 s) ---------- */
const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  if (!inWin(f, 3.1, 6.0)) return null;
  const d = R(f, 3.1, 0.5, 0, 2000, Easing.inOut(Easing.quad));
  const outline = 1 - R(f, 3.45, 0.3, 0, 1);
  const zoom = interpolate(f, [3.1 * 30, 5.5 * 30], [1.16, 1.02], { extrapolateRight: "clamp" });
  // envol vers la frise (5,45 à 5,95 s) : le visage file dans le médaillon de 1933
  const fly = R(f, 5.45, 0.5, 0, 1, Easing.inOut(Easing.cubic));
  const faceX = 540;
  const faceY = 806;
  const tx = (yx(1933) - faceX) * fly;
  const ty = (FRISE_Y - faceY) * fly;
  const sc = 1 - fly * 0.898;
  const rad = 451 * sc + (1600 - 451) * sc * (1 - Math.min(1, fly * 4));
  const cxC = faceX + tx;
  const cyC = faceY + ty;
  const textOut = 1 - R(f, 5.3, 0.25, 0, 1);
  const LY = 700;
  const poly = `polygon(540px ${LY - d}px, ${540 + d}px ${LY}px, 540px ${LY + d}px, ${540 - d}px ${LY}px)`;
  return (
    <AbsoluteFill style={{ opacity: 1 - R(f, 5.88, 0.1, 0, 1) }}>
      <AbsoluteFill style={{ clipPath: fly > 0 ? `circle(${rad}px at ${cxC}px ${cyC}px)` : poly }}>
        <AbsoluteFill style={{ background: S.ink }} />
        <AbsoluteFill style={{ transformOrigin: `${faceX}px ${faceY}px`, transform: `translate(${tx}px, ${ty}px) scale(${sc})` }}>
          <PortraitIn w={1080} h={1920} cx={0.53} cy={0.5} zoom={zoom} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,5,4,0.15) 0%, rgba(7,5,4,0) 30%, rgba(7,5,4,0.55) 52%, rgba(7,5,4,0.95) 66%, #070504 100%)", opacity: 1 - fly }} />
        </AbsoluteFill>
      </AbsoluteFill>
      {outline > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: outline }}>
          <polygon points={`540,${LY - d} ${540 + d},${LY} 540,${LY + d} ${540 - d},${LY}`} fill="none" stroke={S.gold} strokeWidth="6" style={{ filter: "drop-shadow(0 0 12px rgba(240,195,107,0.9))" }} />
        </svg>
      ) : null}
      <div style={{ opacity: textOut }}>
        <Letters text="PAUL BIYA" at={3.55} y={1130} size={150} stagger={1.4} />
        <Line text="président du Cameroun depuis le 6 novembre 1982" at={3.95} y={1305} size={38} font="m" color={S.body} />
        <Line text="QUE SAIS-TU VRAIMENT" at={4.15} y={1385} size={52} />
        <Line text="DE SON HISTOIRE ?" at={4.3} y={1450} size={52} gold />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scène 3 · 1933, Mvomeka'a (5,85 à 8,1 s) ---------- */
const S1933: React.FC = () => {
  const f = useCurrentFrame();
  if (!inWin(f, 5.8, 8.2)) return null;
  const o = Math.min(R(f, 5.8, 0.2, 0, 1), 1 - R(f, 8.0, 0.2, 0, 1));
  // Afrique (zoom vers le Cameroun) puis carte du Cameroun
  const z = R(f, 5.85, 0.75, 1, 7.5, Easing.in(Easing.cubic));
  const afrO = 1 - R(f, 6.35, 0.25, 0, 1);
  const camO = R(f, 6.35, 0.25, 0, 1);
  const camS = R(f, 6.35, 0.55, 1.5, 1, Easing.out(Easing.cubic));
  const AW = 1000;
  const AH = AW * (1783 / 1536);
  const CW = 700;
  const CH = CW * (2767 / 1920);
  const camLeft = 330;
  const camTop = 470;
  const pulse = ((f - 6.9 * 30) % 36) / 36;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Bg glowY={60} />
      {afrO > 0 ? (
        <div style={{ position: "absolute", left: 540 - AW * 0.4225, top: 960 - AH * 0.454, width: AW, height: AH, transformOrigin: `${AW * 0.4225}px ${AH * 0.454}px`, transform: `scale(${z})`, opacity: afrO }}>
          <Img src={staticFile("img/biya/afrique-or.png")} style={{ width: AW, height: AH }} />
        </div>
      ) : null}
      {camO > 0 ? (
        <div style={{ position: "absolute", left: camLeft, top: camTop, width: CW, height: CH, opacity: camO, transformOrigin: `${CW * 0.4}px ${CH * 0.887}px`, transform: `scale(${camS})`, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.8))" }}>
          <Img src={staticFile("img/biya/cameroun-sud-or.png")} style={{ width: CW, height: CH }} />
          {f > 6.9 * 30 ? (
            <div style={{ position: "absolute", left: CW * 0.4 - 60, top: CH * 0.887 - 60, width: 120, height: 120, borderRadius: 60, border: `4px solid ${S.goldPale}`, opacity: 1 - pulse, transform: `scale(${0.4 + pulse * 1.4})` }} />
          ) : null}
        </div>
      ) : null}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,5,4,0) 62%, rgba(7,5,4,0.85) 74%, rgba(7,5,4,0.9) 100%)" }} />
      <Line text="13 FÉVRIER" at={6.0} out={7.95} y={540} size={50} align="left" x={70} />
      <Line text="1933" at={6.1} out={7.95} y={600} size={200} gold align="left" x={64} />
      <Line text="MVOMEKA'A" at={6.4} out={7.95} y={1390} size={72} gold />
      <Line text="pays bulu · Sud du Cameroun" at={6.55} out={7.95} y={1478} size={36} font="m" color={S.body} />
      <Credit text="Cartes : Wikimedia Commons · Alvaro1984 18 (domaine public) · Profoss / NordNordWest (CC BY-SA 3.0)" from={5.9} to={8.0} />
      <Line text="territoire alors sous mandat français" at={6.75} out={7.95} y={1230} size={34} font="m" color={S.heading} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 4 · Séminaire, puis Paris (8,05 à 11,15 s) ---------- */
const SEtudes: React.FC = () => {
  const f = useCurrentFrame();
  if (!inWin(f, 8.0, 11.2)) return null;
  const o = Math.min(R(f, 8.0, 0.2, 0, 1), 1 - R(f, 11.0, 0.2, 0, 1));
  const flip = f < 9.2 * 30 ? R(f, 9.05, 0.15, 0, 90, Easing.in(Easing.quad)) : R(f, 9.2, 0.2, -90, 0, Easing.out(Easing.quad));
  const enter = R(f, 8.05, 0.45, 1, 0, Easing.out(Easing.exp));
  const paris = f >= 9.2 * 30;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Bg glowY={45} />
      <OutlineMarquee text="SÉMINAIRE" y={560} size={200} speed={-5} from={8.0} to={9.25} />
      <OutlineMarquee text="PARIS" y={560} size={220} speed={5} from={9.15} to={11.2} />
      <div style={{ position: "absolute", left: 540 - 340, top: 640, perspective: 1600 }}>
        <div style={{ transform: `translateY(${enter * 900}px) rotateY(${flip}deg)` }}>
          <Glass w={680} h={520}>
            <Losanges opacity={0.05} drift={0} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {paris ? (
                <div style={{ transform: "scale(1.45)" }}>
                  <Diplomas />
                </div>
              ) : (
                <div style={{ transform: "scale(1.2)" }}>
                  <Soutane />
                </div>
              )}
            </div>
          </Glass>
        </div>
      </div>
      <Line text="SÉMINAIRE" at={8.2} out={9.05} y={1210} size={100} gold />
      <Line text="Édéa, puis Akono · 1948-1954" at={8.35} out={9.05} y={1345} size={40} font="m" color={S.heading} />
      <Line text="PARIS" at={9.3} out={10.95} y={1210} size={110} gold />
      <Line text="droit · Sciences Po · IHEOM" at={9.45} out={10.95} y={1345} size={40} font="m" color={S.heading} />
      <Line text="1956-1963" at={9.6} out={10.95} y={1410} size={44} color={S.goldSoft} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 5 · L'escalier des bureaux (11,15 à 13,55 s) ---------- */
const STAIRS = [
  { at: 11.2, year: "1962", text: "chargé de mission à la présidence" },
  { at: 11.6, year: "1968", text: "secrétaire général de la présidence" },
  { at: 11.9, year: "1970", text: "ministre d'État" },
];
const SBureaux: React.FC = () => {
  const f = useCurrentFrame();
  if (!inWin(f, 11.1, 13.6)) return null;
  const o = Math.min(R(f, 11.1, 0.2, 0, 1), 1 - R(f, 13.4, 0.2, 0, 1));
  const climb = R(f, 12.3, 0.5, 0, 1, easeIO);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Bg glowY={70} />
      <OutlineMarquee text="HAUTE ADMINISTRATION" y={1560 - 300} size={150} speed={-4} from={11.1} to={13.6} opacity={0.12} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${climb * 140}px) scale(${1 - climb * 0.12})`, transformOrigin: "50% 100%" }}>
        {STAIRS.map((st, k) => {
          const p = R(f, st.at, 0.4, 0, 1, Easing.out(Easing.back(1.1)));
          if (p <= 0) return null;
          return (
            <div key={k} style={{ position: "absolute", left: 60 + k * 150, top: 1180 - k * 200 + (1 - p) * 300, opacity: Math.min(1, p * 2) }}>
              <Glass w={600} h={175}>
                <div style={{ position: "absolute", left: 0, top: 0, width: 600, height: 5, background: GOLD_GRAD }} />
                <div style={{ position: "absolute", left: 30, top: 24, fontFamily: cinzel, fontWeight: 900, fontSize: 52, ...goldText(f) }}>{st.year}</div>
                <div style={{ position: "absolute", left: 30, right: 24, top: 92, fontFamily: manrope, fontWeight: 700, fontSize: 36, lineHeight: 1.15, color: S.heading }}>{st.text}</div>
              </Glass>
            </div>
          );
        })}
      </div>
      <Line text="30 JUIN 1975" at={12.4} out={13.4} y={540} size={64} color={S.heading} />
      <Line text="PREMIER MINISTRE" at={12.5} out={13.4} y={625} size={84} gold />
      <Line text="nommé par Ahmadou Ahidjo" at={12.7} out={13.4} y={735} size={38} font="m" color={S.body} />
      {f < 12.35 * 30 ? <Line text="HAUT FONCTIONNAIRE" at={11.15} out={12.2} y={560} size={70} gold /> : null}
    </AbsoluteFill>
  );
};

/* ---------- Scène 6 · Novembre 1982 (13,55 à 17,05 s) ---------- */
const S1982: React.FC = () => {
  const f = useCurrentFrame();
  if (!inWin(f, 13.5, 17.45)) return null;
  const o = Math.min(R(f, 13.5, 0.2, 0, 1), 1 - R(f, 17.2, 0.2, 0, 1));
  const tear = R(f, 14.55, 0.35, 0, 1, Easing.inOut(Easing.quad));
  const calO = 1 - R(f, 14.85, 0.25, 0, 1);
  const calIn = R(f, 13.55, 0.45, 1, 0, Easing.out(Easing.exp));
  // « CONSTITUTION » en tracking (14,8 à 15,7 s)
  const track = R(f, 14.8, 0.9, 0.22, 0.02, Easing.out(Easing.cubic));
  const conO = inWin(f, 14.8, 15.75) ? Math.min(R(f, 14.8, 0.15, 0, 1), 1 - R(f, 15.5, 0.25, 0, 1)) : 0;
  // arche du portrait (15,45 s)
  const arch = R(f, 15.45, 0.6, 0, 1, Easing.out(Easing.cubic));
  const AWd = 560;
  const AHt = 690;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Bg glowY={55} />
      {calO > 0 ? (
        <div style={{ position: "absolute", left: 540 - 210, top: 560 + calIn * 900, transform: "scale(1.4)", transformOrigin: "50% 0%", opacity: calO, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.8))" }}>
          <Ephemeride tear={tear} />
        </div>
      ) : null}
      <Line text="AHMADOU AHIDJO" at={13.7} out={14.75} y={1120} size={66} />
      <Line text="annonce sa démission" at={13.85} out={14.75} y={1215} size={42} font="m" color={S.heading} />
      <Line text="4 NOVEMBRE 1982" at={13.95} out={14.75} y={1285} size={48} gold />
      {conO > 0 ? (
        <div style={{ position: "absolute", left: -200, right: -200, top: 860, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 104, letterSpacing: `${track}em`, opacity: conO, ...goldText(f), filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.9))" }}>
          CONSTITUTION
        </div>
      ) : null}
      {arch > 0 ? (
        <div style={{ position: "absolute", left: 540 - AWd / 2, top: 520, width: AWd, height: AHt, borderRadius: `${AWd / 2}px ${AWd / 2}px 22px 22px`, overflow: "hidden", clipPath: `inset(${(1 - arch) * 100}% 0 0 0)`, boxShadow: "0 0 0 3px rgba(240,195,107,0.7), 0 30px 80px rgba(0,0,0,0.8)" }}>
          <PortraitIn w={AWd} h={AHt} cx={0.53} cy={0.47} zoom={0.44 + (1 - arch) * 0.04} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,5,4,0) 70%, rgba(7,5,4,0.7) 100%)" }} />
        </div>
      ) : null}
      <Line text="6 NOVEMBRE 1982" at={15.55} out={17.1} y={1235} size={48} color={S.heading} />
      <Line text="PRÉSIDENT" at={15.65} out={17.1} y={1300} size={110} gold />
      <Line text="successeur prévu par la Constitution" at={15.8} out={17.1} y={1438} size={38} font="m" color={S.body} />
    </AbsoluteFill>
  );
};

/* ---------- Scènes 7 et 8 · La pile de fiches (17 à 24,75 s) ---------- */
const CARDS = [
  { at: 17.4, year: "1984", text: "Tentative de coup d'État" },
  { at: 18.4, year: "1987-1994", text: "Crise : salaires réduits, franc CFA dévalué" },
  { at: 19.06, year: "1990", text: "Retour du multipartisme" },
  { at: 20.45, year: "2002 · BAKASSI", text: "La Cour internationale de justice reconnaît la souveraineté du Cameroun" },
  { at: 21.3, year: "2008", text: "La limite du nombre de mandats est supprimée" },
  { at: 22.07, year: "2014 · 2017", text: "Boko Haram au nord, conflit armé dans les régions anglophones" },
  { at: 22.98, year: "1992 · 2018 · 2025", text: "Élections : résultats officiels contestés par l'opposition" },
];
const CARD_H = 236;
const CARD_GAP = 26;
const NEWEST_TOP = 1230;

const SFiches: React.FC = () => {
  const f = useCurrentFrame();
  if (!inWin(f, 17.15, 24.85)) return null;
  const t = f / 30;
  const o = Math.min(R(f, 17.15, 0.25, 0, 1), 1 - R(f, 24.6, 0.25, 0, 1));
  // progression continue de la pile : n = nombre de fiches arrivées (lissé)
  let n = 0;
  CARDS.forEach((c) => (n += R(f, c.at, 0.4, 0, 1, easeIO)));
  const bak = inWin(f, 20.3, 21.9) ? Math.min(R(f, 20.3, 0.3, 0, 1), 1 - R(f, 21.55, 0.35, 0, 1)) : 0;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Bg glowY={70} />
      {bak > 0 ? (
        <AbsoluteFill style={{ opacity: bak }}>
          <Img src={staticFile("img/biya/bakassi-or.jpg")} style={{ position: "absolute", left: -140, top: 380, width: 1360, height: 1360 * (2234 / 1920), objectFit: "cover", transform: `scale(${1 + (t - 20.3) * 0.04})`, opacity: 0.55 }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, #070504 18%, rgba(7,5,4,0.25) 40%, rgba(7,5,4,0.35) 70%, #070504 92%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 170, color: "transparent", WebkitTextStroke: `2.5px ${S.goldPale}`, letterSpacing: 10, opacity: 0.7 }}>BAKASSI</div>
          <Credit text="Image radar : DLR · Wikimedia Commons · CC BY 3.0" from={20.3} to={21.9} />
        </AbsoluteFill>
      ) : null}
      {CARDS.map((c, i) => {
        const arrive = R(f, c.at, 0.42, 0, 1, Easing.out(Easing.cubic));
        if (arrive <= 0) return null;
        const above = n - (i + 1); // fiches arrivées après celle-ci
        const top = NEWEST_TOP - Math.max(0, above) * (CARD_H + CARD_GAP);
        const fadeTop = interpolate(top, [430, 600], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const dim = Math.max(0, Math.min(1, above));
        return (
          <div key={i} style={{ position: "absolute", left: 80 + (1 - arrive) * 1000, top, opacity: fadeTop * (1 - dim * 0.35), transform: `scale(${1 - dim * 0.04})`, transformOrigin: "50% 50%" }}>
            <Glass w={920} h={CARD_H}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: GOLD_GRAD }} />
              <div style={{ position: "absolute", left: 40, top: 26, fontFamily: cinzel, fontWeight: 900, fontSize: 56, lineHeight: 1.05, letterSpacing: 2, ...goldText(f) }}>{c.year}</div>
              <div style={{ position: "absolute", left: 40, right: 34, top: 100, fontFamily: manrope, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: S.heading }}>{c.text}</div>
            </Glass>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Scène 9 · Deux lectures, et le verdict (24,7 à 27,45 s) ---------- */
const SVerdict: React.FC = () => {
  const f = useCurrentFrame();
  if (!inWin(f, 24.6, 27.5)) return null;
  const o = Math.min(R(f, 24.6, 0.25, 0, 1), 1 - R(f, 27.3, 0.15, 0, 1));
  const d = R(f, 24.65, 0.55, 0, 380, Easing.out(Easing.cubic));
  const dim = R(f, 26.05, 0.35, 0.15, 0.68);
  const cy = 940;
  const poly = `polygon(540px ${cy - d}px, ${540 + d}px ${cy}px, 540px ${cy + d}px, ${540 - d}px ${cy}px)`;
  const band = (text: React.ReactNode, y: number, at: number) => {
    const p = R(f, at, 0.4, 0, 1);
    const out = R(f, 26.0, 0.3, 0, 1);
    return (
      <div style={{ position: "absolute", left: 50, right: 50, top: y, display: "flex", justifyContent: "center", opacity: p * (1 - out * 0.75), transform: `translateY(${(1 - p) * 20}px)` }}>
        <div style={{ padding: "14px 26px", borderRadius: 18, background: "rgba(7,5,4,0.78)", boxShadow: "0 0 0 1.5px rgba(240,195,107,0.4)", fontFamily: manrope, fontWeight: 600, fontSize: 42, lineHeight: 1.25, color: S.heading, textAlign: "center" }}>{text}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Bg glowY={50} pattern={0.09} />
      <AbsoluteFill style={{ clipPath: poly }}>
        <PortraitIn w={1080} h={1920} cx={0.53} cy={0.37} zoom={0.62} />
        <AbsoluteFill style={{ background: `rgba(7,5,4,${dim})` }} />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`540,${cy - d} ${540 + d},${cy} 540,${cy + d} ${540 - d},${cy}`} fill="none" stroke={S.gold} strokeWidth="4" opacity={0.85} />
      </svg>
      {band(<>Pour les uns : <b style={{ fontWeight: 800, color: S.ivory }}>le garant de la paix et de l'unité.</b></>, 520, 24.75)}
      {band(<>Pour les autres : <b style={{ fontWeight: 800, color: S.ivory }}>un pouvoir qui ne s'est jamais renouvelé.</b></>, 1340, 24.75)}
      <Line text="L'HISTOIRE" at={26.1} y={760} size={68} />
      <Line text="N'A PAS ENCORE RENDU" at={26.22} y={850} size={64} />
      <Line text="SON VERDICT." at={26.34} y={940} size={84} gold />
    </AbsoluteFill>
  );
};

export const PaulBiyaV2: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: S.ink }}>
    <SVerdict />
    <SFiches />
    <S1982 />
    <SBureaux />
    <SEtudes />
    <S1933 />
    <Hook />
    <Reveal />
    <Frise />
    <Sweep at={7.95} />
    <Sweep at={11.0} />
    <Sweep at={13.4} />
    <Sweep at={17.1} />
    <Sweep at={24.5} />
    <Sequence from={s(T_OUTRO)} durationInFrames={s(BIYA_V2_DUREE) - s(T_OUTRO)}>
      <OutroBiya portrait={PORTRAIT} warm />
    </Sequence>
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-paul-biya.wav")} /> : null}
  </AbsoluteFill>
);
