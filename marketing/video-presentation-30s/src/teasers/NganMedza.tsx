/**
 * AFROBACK · Teaser « Ngan Medza, le serpent de la traversée » (41,5 s).
 * Brief : teasers/mythe-ngan-medza-beti/brief-montage.md (minutage), script-fr.md (cadrages, vigilance).
 * Une seule composition paramétrée : lang (fr | en) et format (paysage | vertical).
 * Images : extraits de la vidéo longue du mythe (déjà recadrés sans le logo, public/teasers/...)
 * et 3 images AFROBACK animées (caméra lente, brume, reflets). Aucune silhouette dessinée.
 * Version livrée d'abord : FR paysage. Les textes EN et le recadrage vertical seront
 * finalisés après validation (voix EN, fenêtres 9:16).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, cinzel, manrope, punchScale, ramp } from "../theme";
import { Embers } from "../recit-kit";

export type TeaserProps = { lang: "fr" | "en"; format: "paysage" | "vertical"; withAudio?: boolean };

export const NGAN_TEASER_FR_DUREE = 1245; // 41,5 s à 30 i/s

const DIR = "teasers/mythe-ngan-medza-beti";
const f = (sec: number) => Math.round(sec * 30);
const ease = Easing.inOut(Easing.cubic);

/* ---------- Textes ---------- */

const TXT = {
  fr: {
    mention: "Légende de tradition orale beti · Cameroun",
    ecoute: "ÉCOUTE.",
    yom: "LE YOM",
    sanaga: "la Sanaga",
    sansPont: "Sans pont. Sans gué.",
    peuple: "TOUT UN PEUPLE",
    appel: "Ils appelèrent…",
    repondit: "QUELQUE CHOSE RÉPONDIT.",
    tronc: "UN TRONC.",
    rive: "d'une rive à l'autre",
    pasTronc: "CE N'ÉTAIT PAS UN TRONC.",
    loi: "UNE LOI",
    loiTexte: "Rien qui pique. Rien qui blesse.",
    nuit: "PUIS VINT LA NUIT.",
    question: "Que s'est-il passé cette nuit-là ?",
    titre: "NGAN MEDZA",
    accroche: "La légende que les anciens refusent d'oublier",
    bouton: "Écoute-la",
    mentionFin: "Légende de tradition orale beti",
    audio: "audio/teaser-mythe-ngan-medza-beti-fr.wav",
  },
};

/** Sous-titres karaoké (mots et temps de timing-fr.json), seulement pour ce qui n'est pas déjà affiché en gros. */
const SUBS_FR: { words: [string, number][]; end: number }[] = [
  { words: [["Écoute,", 0.3], ["enfant", 0.88], ["de", 1.24], ["la", 1.42], ["forêt.", 1.6]], end: 2.5 },
  { words: [["Devant", 2.85], ["eux,", 3.3]], end: 3.95 },
  { words: [["Avec", 7.15], ["eux,", 7.42], ["les", 7.88], ["vieillards,", 8.1], ["les", 8.87], ["enfants,", 9.1]], end: 9.95 },
  { words: [["Famille", 24.85], ["après", 25.34], ["famille,", 25.71], ["ils", 26.47], ["passèrent.", 26.74]], end: 27.55 },
  { words: [["Cette", 30.1], ["nuit-là,", 30.45], ["un", 31.15], ["peuple", 31.35], ["fut", 31.75], ["changé", 32.0], ["à", 32.4], ["jamais.", 32.55]], end: 33.6 },
];

/* ---------- Caméra virtuelle sur une image ou un extrait ---------- */

type Cam = { cx: number; cy: number; zoom: number };

/** Affiche un média (iw × ih) en « cover », caméra visant (cx, cy) en fraction du média, sans jamais montrer de bord. */
const Camera: React.FC<{ iw: number; ih: number; cam: Cam; children: (w: number, h: number) => React.ReactNode; filter?: string; bw?: number; bh?: number }> = ({ iw, ih, cam, children, filter, bw, bh }) => {
  const cfg = useVideoConfig();
  const W = bw ?? cfg.width;
  const H = bh ?? cfg.height;
  const sc = Math.max(W / iw, H / ih) * cam.zoom;
  const w = iw * sc;
  const h = ih * sc;
  const left = Math.min(0, Math.max(W - w, W / 2 - cam.cx * w));
  const top = Math.min(0, Math.max(H - h, H / 2 - cam.cy * h));
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter }}>
      <div style={{ position: "absolute", left, top, width: w, height: h }}>{children(w, h)}</div>
    </AbsoluteFill>
  );
};

const lerpCam = (frame: number, dur: number, a: Cam, b: Cam, easing = ease): Cam => {
  const t = interpolate(frame, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
  return { cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, zoom: a.zoom + (b.zoom - a.zoom) * t };
};

/** Extrait de la vidéo source (1920 × 1080, déjà recadré sans le logo). */
const Clip: React.FC<{ name: string; dur: number; from: Cam; to: Cam; filter?: string; fadeIn?: number; fadeOut?: number }> = ({ name, dur, from, to, filter, fadeIn = 0, fadeOut = 0 }) => {
  const frame = useCurrentFrame();
  const cam = lerpCam(frame, dur, from, to, Easing.linear);
  const black = Math.max(fadeIn ? ramp(frame, 0, fadeIn, 1, 0, Easing.linear) : 0, fadeOut ? ramp(frame, dur - fadeOut, fadeOut, 0, 1, Easing.linear) : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera iw={1920} ih={1080} cam={cam} filter={filter}>
        {(w, h) => <OffthreadVideo src={staticFile(`${DIR}/${name}.mp4`)} muted style={{ width: w, height: h }} />}
      </Camera>
      {black > 0 ? <AbsoluteFill style={{ background: "#000", opacity: black }} /> : null}
    </AbsoluteFill>
  );
};

/* ---------- Ambiance ---------- */

const Fog: React.FC<{ y: number; opacity?: number; speed?: number }> = ({ y, opacity = 1, speed = 1 }) => {
  const frame = useCurrentFrame();
  const { width: W } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const span = W + 1400;
        const x = ((frame * (0.5 + i * 0.3) * speed + i * 520) % span) - 900;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y - 160 + i * 90,
              width: 1000,
              height: 240,
              borderRadius: "50%",
              background: `rgba(190,205,215,${0.07 + (i % 2) * 0.05})`,
              filter: "blur(60px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Vig: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)` }} />
);

/** Scintillement de l'eau : reflets fins qui s'allument et dérivent (en coordonnées de l'image). */
const Shimmer: React.FC<{ w: number; h: number; x0: number; x1: number; y0: number; y1: number; count?: number; color?: string; seed: string }> = ({ w, h, x0, x1, y0, y1, count = 40, color = "255,215,150", seed }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const rx = random(`${seed}x${i}`);
        const ry = random(`${seed}y${i}`);
        const ph = random(`${seed}p${i}`) * 6.28;
        const x = (x0 + (x1 - x0) * rx) * w + Math.sin(frame * 0.03 + ph) * 18 + frame * 0.25;
        const y = (y0 + (y1 - y0) * ry) * h;
        const o = Math.max(0, Math.sin(frame * (0.08 + rx * 0.06) + ph)) * 0.75;
        const len = 30 + random(`${seed}l${i}`) * 70;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: len,
              height: 3,
              borderRadius: 3,
              background: `rgba(${color},${o})`,
              boxShadow: `0 0 8px rgba(${color},${o})`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
};

/* ---------- Typographie ---------- */

const Punch: React.FC<{ text: string; at: number; size: number; color?: string; until?: number; style?: React.CSSProperties }> = ({ text, at, size, color = C.gold, until, style }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = until ? ramp(frame, until - 8, 8, 1, 0, Easing.linear) : 1;
  if (out <= 0) return null;
  const sc = punchScale(frame, at);
  const blur = frame - at < 3 ? 6 - (frame - at) * 2 : 0;
  return (
    <div
      style={{
        fontFamily: cinzel,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: size * 0.03,
        color,
        textAlign: "center",
        opacity: out,
        transform: `scale(${sc})`,
        filter: `blur(${blur}px) drop-shadow(0 6px 26px rgba(0,0,0,0.95))`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

const Line: React.FC<{ text: string; at: number; size: number; color?: string; until?: number; italic?: boolean; family?: string; weight?: number; style?: React.CSSProperties }> = ({ text, at, size, color = C.ivory, until, italic, family = manrope, weight = 700, style }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = ramp(frame, at, 10, 0, 1);
  const out = until ? ramp(frame, until - 8, 8, 1, 0, Easing.linear) : 1;
  return (
    <div
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        color,
        textAlign: "center",
        opacity: p * out,
        transform: `translateY(${(1 - p) * 24}px)`,
        textShadow: "0 3px 16px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Lettres qui s'enfoncent lentement (comme dans l'eau), après un temps de lecture. */
const Sink: React.FC<{ text: string; at: number; size: number; hold: number }> = ({ text, at, size, hold }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "center", fontFamily: cinzel, fontWeight: 900, fontSize: size, color: "#D5E6F0", letterSpacing: size * 0.02 }}>
      {text.split("").map((ch, i) => {
        const st = at + i * 1.0;
        const o = frame < st ? 0 : ramp(frame, st, 5, 0, 1);
        const sink = ramp(frame, st + hold, 26, 0, 40, Easing.in(Easing.quad));
        const bob = frame < st ? 0 : Math.sin((frame - st) * 0.2 + i) * 3;
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: o * (1 - sink / 60), transform: `translateY(${sink + bob}px)`, filter: `blur(${sink / 20}px)`, textShadow: "0 6px 22px rgba(0,0,0,0.95)" }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

const Subtitle: React.FC<{ words: [string, number][]; end: number; bottom: number; size: number }> = ({ words, end, bottom, size }) => {
  const frame = useCurrentFrame();
  const start = f(words[0][1]);
  if (frame < start || frame >= f(end)) return null;
  const o = Math.min(ramp(frame, start, 5, 0, 1), ramp(frame, f(end) - 5, 5, 1, 0, Easing.linear));
  let cur = 0;
  words.forEach(([, t], i) => {
    if (frame >= f(t)) cur = i;
  });
  return (
    <div style={{ position: "absolute", left: 80, right: 80, bottom, textAlign: "center", fontFamily: manrope, fontWeight: 800, fontSize: size, opacity: o, textShadow: "0 3px 12px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)" }}>
      {words.map(([wd], i) => (
        <span key={i} style={{ display: "inline-block", whiteSpace: "nowrap", color: i === cur ? C.gold : C.ivory, marginRight: size * 0.3 }}>
          {wd}
        </span>
      ))}
    </div>
  );
};

const Center: React.FC<{ top: number; children: React.ReactNode; left?: number; right?: number }> = ({ top, children, left = 0, right = 0 }) => (
  <div style={{ position: "absolute", top, left, right, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
);

/* ---------- Plans (paysage 1920 × 1080) ---------- */

const T = TXT.fr;
const NIGHT = "brightness(1.05) contrast(1.05)";

// 1A · 0,0 à 2,6 · fleuve sous la lune
const P1A: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c1a" dur={78} from={{ cx: 0.5, cy: 0.5, zoom: 1.0 }} to={{ cx: 0.5, cy: 0.55, zoom: 1.07 }} fadeIn={8} filter={NIGHT} />
    <Fog y={760} opacity={0.8} />
    <Vig />
    <Center top={330}>
      <Punch text={T.ecoute} at={9} size={150} />
    </Center>
  </AbsoluteFill>
);

// 1B · 2,6 à 4,6 · la foule sur la rive
const P1B: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c1b" dur={60} from={{ cx: 0.47, cy: 0.5, zoom: 1.08 }} to={{ cx: 0.53, cy: 0.5, zoom: 1.08 }} filter={NIGHT} />
    <Vig />
  </AbsoluteFill>
);

// 1C · 4,6 à 7,0 · l'eau noire qui s'agite
const P1C: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c1c" dur={72} from={{ cx: 0.5, cy: 0.6, zoom: 1.0 }} to={{ cx: 0.5, cy: 0.62, zoom: 1.08 }} fadeOut={3} filter={NIGHT} />
    <Fog y={820} opacity={0.6} />
    <Vig />
  </AbsoluteFill>
);

// Titre « LE YOM » (4,0 à 7,0), à cheval sur 1B et 1C
const TitreYom: React.FC = () => (
  <AbsoluteFill>
    <Center top={300}>
      <Punch text={T.yom} at={0} size={170} color={C.ivory} until={87} />
      <div style={{ height: 14 }} />
      <Line text={T.sanaga} at={6} size={40} color={C.terracotta} italic until={87} />
      <div style={{ height: 40 }} />
      <Line text={T.sansPont} at={30} size={58} color={C.gold} until={87} />
    </Center>
  </AbsoluteFill>
);

// 2A · 7,0 à 9,0 · la marche au coucher du soleil
const P2A: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c2a" dur={60} from={{ cx: 0.5, cy: 0.5, zoom: 1.04 }} to={{ cx: 0.5, cy: 0.52, zoom: 1.1 }} fadeIn={4} filter="brightness(0.9) saturate(0.95)" />
    <Vig />
  </AbsoluteFill>
);

// 2B · 9,0 à 11,3 · procession de torches dans la forêt
const P2B: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c2b" dur={69} from={{ cx: 0.44, cy: 0.5, zoom: 1.12 }} to={{ cx: 0.56, cy: 0.5, zoom: 1.12 }} filter={NIGHT} />
    <Vig />
    <Center top={420}>
      <Punch text={T.peuple} at={30} size={130} color={C.gold} />
    </Center>
  </AbsoluteFill>
);

// 3A · 11,3 à 13,4 · l'ancien lève les bras
const P3A: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c3a" dur={63} from={{ cx: 0.62, cy: 0.45, zoom: 1.0 }} to={{ cx: 0.62, cy: 0.42, zoom: 1.1 }} filter={NIGHT} />
    <Vig />
    <div style={{ position: "absolute", left: 120, top: 140, width: 760 }}>
      <Line text={T.appel} at={6} size={72} color={C.ivory} family={cinzel} weight={700} italic style={{ textAlign: "left" }} />
    </div>
  </AbsoluteFill>
);

// 3B · 13,4 à 14,6 · cercles sur l'eau
const P3B: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c3b" dur={36} from={{ cx: 0.5, cy: 0.6, zoom: 1.05 }} to={{ cx: 0.5, cy: 0.62, zoom: 1.1 }} filter={NIGHT} />
    <Vig />
  </AbsoluteFill>
);

// 3C · 14,6 à 15,7 · la foule saisie (puis fondu enchaîné vers 4A)
const P3C: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c3c" dur={38} from={{ cx: 0.5, cy: 0.5, zoom: 1.04 }} to={{ cx: 0.5, cy: 0.48, zoom: 1.1 }} filter={NIGHT} />
    <Vig />
  </AbsoluteFill>
);

// Titre « QUELQUE CHOSE RÉPONDIT. » (13,5 à 15,2)
const TitreRepondit: React.FC = () => (
  <AbsoluteFill>
    <Center top={430} left={80} right={80}>
      <Punch text={T.repondit} at={0} size={92} color={C.ivory} until={51} />
    </Center>
  </AbsoluteFill>
);

// 4A · 15,7 à 18,6 · IMG-1, le peuple face au tronc (entre en fondu enchaîné à 15,43)
const P4A: React.FC = () => {
  const frame = useCurrentFrame();
  const inO = ramp(frame, 0, 8, 0, 1, Easing.linear);
  const cam = lerpCam(frame, 95, { cx: 0.5, cy: 0.5, zoom: 1.0 }, { cx: 0.45, cy: 0.38, zoom: 1.14 });
  return (
    <AbsoluteFill style={{ opacity: inO }}>
      <Camera iw={1672} ih={941} cam={cam} filter="brightness(0.88) contrast(1.06) saturate(0.92)">
        {(w, h) => (
          <>
            <Img src={staticFile(`${DIR}/img-1.png`)} style={{ width: w, height: h }} />
            <Shimmer w={w} h={h} x0={0.18} x1={0.95} y0={0.46} y1={0.66} count={46} seed="t1" />
          </>
        )}
      </Camera>
      <Fog y={300} opacity={0.75} speed={0.6} />
      <Vig strength={0.7} />
      <Center top={70}>
        <Punch text={T.tronc} at={8} size={140} color={C.gold} />
        <div style={{ height: 6 }} />
        <Line text={T.rive} at={53} size={52} color={C.ivory} italic />
      </Center>
    </AbsoluteFill>
  );
};

// 4B · 18,6 à 21,0 · la tête du serpent affleure, œil doré
const P4B: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.25 + 0.15 * Math.sin(frame * 0.15);
  return (
    <AbsoluteFill>
      <Clip name="c4b" dur={72} from={{ cx: 0.4, cy: 0.62, zoom: 1.02 }} to={{ cx: 0.28, cy: 0.74, zoom: 1.3 }} filter="brightness(1.15) contrast(1.08)" />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 26% 80%, rgba(240,180,80,${glow * 0.35}) 0%, rgba(0,0,0,0) 22%)`, mixBlendMode: "screen" }} />
      <Vig strength={0.7} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 210 }}>
        <Sink text={T.pasTronc} at={12} size={92} hold={42} />
      </div>
    </AbsoluteFill>
  );
};

// 5 · 21,0 à 24,6 · IMG-2, la lance tenue par le bout arrondi
const P5: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = lerpCam(frame, 108, { cx: 0.4, cy: 0.85, zoom: 1.55 }, { cx: 0.4, cy: 0.15, zoom: 1.55 });
  const glint = ramp(frame, 62, 34, -0.2, 1.2, Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill>
      <Camera iw={1672} ih={940} cam={cam} filter="brightness(0.9) contrast(1.05) saturate(0.95)">
        {(w, h) => (
          <>
            <Img src={staticFile(`${DIR}/img-2.png`)} style={{ width: w, height: h }} />
            {/* reflet doré qui glisse sur le fer de la lance */}
            <div
              style={{
                position: "absolute",
                left: 0.49 * w,
                top: (0.02 + 0.2 * (1 - glint)) * h,
                width: 0.06 * w,
                height: 0.07 * h,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,236,190,0.85) 0%, rgba(255,200,110,0.35) 40%, rgba(0,0,0,0) 70%)",
                mixBlendMode: "screen",
                opacity: glint > 0 && glint < 1 ? Math.sin(glint * Math.PI) : 0,
              }}
            />
            <Shimmer w={w} h={h} x0={0.5} x1={1.0} y0={0.55} y1={0.75} count={30} seed="t2" />
          </>
        )}
      </Camera>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 65%)" }} />
      <Vig strength={0.6} />
      <div style={{ position: "absolute", left: 60, top: 330, width: 820, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Punch text={T.loi} at={2} size={150} color={C.gold} />
        <div style={{ height: 30 }} />
        <Line text={T.loiTexte} at={33} size={54} color={C.ivory} style={{ whiteSpace: "nowrap" }} />
      </div>
    </AbsoluteFill>
  );
};

// 6A · 24,6 à 27,6 · IMG-3, familles en file sur le tronc (or → bleu)
const P6A: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = lerpCam(frame, 90, { cx: 0.3, cy: 0.55, zoom: 1.28 }, { cx: 0.7, cy: 0.55, zoom: 1.28 }, Easing.linear);
  const blue = ramp(frame, 0, 90, 0, 1, Easing.linear);
  return (
    <AbsoluteFill>
      <Camera iw={1672} ih={941} cam={cam} filter={`brightness(${0.92 - blue * 0.3}) saturate(${1 - blue * 0.35})`}>
        {(w, h) => (
          <>
            <Img src={staticFile(`${DIR}/img-3.png`)} style={{ width: w, height: h }} />
            <Shimmer w={w} h={h} x0={0.0} x1={1.0} y0={0.88} y1={0.98} count={30} seed="t3" />
          </>
        )}
      </Camera>
      <AbsoluteFill style={{ background: "#1B3550", opacity: blue * 0.45, mixBlendMode: "multiply" }} />
      <Fog y={820} opacity={0.4 + blue * 0.3} speed={0.5} />
      <Vig strength={0.7} />
    </AbsoluteFill>
  );
};

// 6B · 27,6 à 29,0 · la traversée de nuit, femme à la torche
const P6B: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c6b" dur={42} from={{ cx: 0.4, cy: 0.5, zoom: 1.05 }} to={{ cx: 0.4, cy: 0.5, zoom: 1.08 }} filter="brightness(0.95) saturate(0.9)" />
    <Vig strength={0.8} />
  </AbsoluteFill>
);

// 6C · 29,0 à 30,6 · porteur de torche en fin de file, plus sombre
const P6C: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c6c" dur={48} from={{ cx: 0.45, cy: 0.5, zoom: 1.05 }} to={{ cx: 0.42, cy: 0.48, zoom: 1.1 }} filter="brightness(0.85) saturate(0.82)" />
    <AbsoluteFill style={{ background: "#0E2238", opacity: 0.25, mixBlendMode: "multiply" }} />
    <Vig strength={0.85} />
  </AbsoluteFill>
);

// Titre « PUIS VINT LA NUIT. » (27,8 à 29,8)
const TitreNuit: React.FC = () => (
  <AbsoluteFill>
    <Center top={180}>
      <Punch text={T.nuit} at={0} size={120} color={C.ivory} until={60} />
    </Center>
  </AbsoluteFill>
);

// 7 · 30,6 à 34,0 · l'ancien raconte devant le feu (ralenti)
const P7: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c7" dur={102} from={{ cx: 0.5, cy: 0.5, zoom: 1.0 }} to={{ cx: 0.52, cy: 0.45, zoom: 1.08 }} fadeOut={8} filter="brightness(1.0) contrast(1.05)" />
    <Embers x={1080} y={860} count={22} spread={160} power={0.8} />
    <Vig strength={0.7} />
    <Center top={110}>
      <Line text={T.question} at={12} size={74} color={C.gold} family={cinzel} weight={700} until={100} />
    </Center>
  </AbsoluteFill>
);

// 8 · 34,0 à 41,5 · carte de fin
const P8: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W } = useVideoConfig();
  const zoom = ramp(frame, 0, 225, 1.0, 1.1, Easing.linear);
  const inO = ramp(frame, 0, 10, 0, 1, Easing.linear);
  const out = ramp(frame, 204, 21, 0, 1, Easing.linear);
  const btnAt = f(38.8) - f(34.0);
  const pulse = frame >= btnAt + 10 ? 1 + 0.04 * Math.sin((frame - btnAt - 10) * 0.18) : 1;
  const btnIn = popScaleSoft(frame, btnAt);
  const logoAt = f(36.8) - f(34.0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity: inO }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          <Img src={staticFile(`${DIR}/fin.jpg`)} style={{ position: "absolute", width: W, height: W, top: (1080 - W) / 2 + 120, left: 0, filter: "blur(7px) brightness(0.32) saturate(0.85)" }} />
        </AbsoluteFill>
        <Fog y={860} opacity={0.6} speed={0.5} />
        <Embers x={960} y={1060} count={26} spread={1400} power={0.55} />
        <Vig strength={0.8} />
        <Center top={210}>
          <Punch text={T.titre} at={6} size={180} color={C.gold} />
          <div style={{ height: 26 }} />
          <Line text={T.accroche} at={f(35.7) - f(34.0)} size={52} color={C.ivory} family={cinzel} weight={700} />
          <div style={{ height: 70 }} />
          <div
            style={{
              opacity: frame >= btnAt ? 1 : 0,
              transform: `scale(${btnIn * pulse})`,
              padding: "22px 70px",
              borderRadius: 60,
              background: "linear-gradient(180deg, #F7D98B 0%, #F0C36B 50%, #C98A3D 100%)",
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 46,
              color: "#1A130D",
              boxShadow: "0 0 50px rgba(240,195,107,0.45)",
            }}
          >
            {T.bouton}
          </div>
        </Center>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, display: "flex", flexDirection: "column", alignItems: "center", opacity: ramp(frame, logoAt, 15, 0, 1) }}>
          <Img src={staticFile("img/afroback-logo.png")} style={{ width: 92, height: 92 }} />
          <div style={{ height: 10 }} />
          <div style={{ fontFamily: manrope, fontWeight: 600, fontSize: 24, color: "rgba(255,244,224,0.7)", letterSpacing: 1 }}>{T.mentionFin}</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

const popScaleSoft = (frame: number, at: number) => {
  if (frame < at) return 0;
  if (frame < at + 6) return ramp(frame, at, 6, 0.6, 1.08, Easing.out(Easing.quad));
  return ramp(frame, at + 6, 6, 1.08, 1, Easing.out(Easing.quad));
};

/** Mention « légende » en bas (0,3 à 7,0 s). */
const Mention: React.FC = () => {
  const frame = useCurrentFrame();
  const o = Math.min(ramp(frame, 0, 12, 0, 1), ramp(frame, 191, 10, 1, 0, Easing.linear));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center", fontFamily: manrope, fontWeight: 600, fontSize: 26, letterSpacing: 1, color: "rgba(255,244,224,0.78)", opacity: o, textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
      {T.mention}
    </div>
  );
};

/* ---------- Montage ---------- */

const PLANS: { from: number; dur: number; C: React.FC }[] = [
  { from: 0, dur: 78, C: P1A },
  { from: 78, dur: 60, C: P1B },
  { from: 138, dur: 72, C: P1C },
  { from: 210, dur: 60, C: P2A },
  { from: 270, dur: 69, C: P2B },
  { from: 339, dur: 63, C: P3A },
  { from: 402, dur: 36, C: P3B },
  { from: 438, dur: 38, C: P3C },
  { from: 463, dur: 95, C: P4A },
  { from: 558, dur: 72, C: P4B },
  { from: 630, dur: 108, C: P5 },
  { from: 738, dur: 90, C: P6A },
  { from: 828, dur: 42, C: P6B },
  { from: 870, dur: 48, C: P6C },
  { from: 918, dur: 102, C: P7 },
  { from: 1020, dur: 225, C: P8 },
];

const TITRES: { from: number; dur: number; C: React.FC }[] = [
  { from: 9, dur: 201, C: Mention },
  { from: 120, dur: 90, C: TitreYom },
  { from: 405, dur: 51, C: TitreRepondit },
  { from: 834, dur: 60, C: TitreNuit },
];

/* ---------- Plans verticaux (1080 × 1920) ----------
 * Textes et carte de fin entre y = 600 et y = 1500 (zones sûres TikTok / Reels).
 * Extraits SRC : fenêtre 9:16 dans l'extrait déjà recadré (sans logo), centre x en fraction.
 * Images 16:9 : fenêtre 4:5 (agrandissement x 1,43 seulement) sur un fond flouté de la même image ;
 * procession : image de galerie 02.jpg (4:5) en plein cadre.
 */

const VTOP = 285; // fenêtre 4:5 de 1080 × 1350, centrée verticalement
const VH = 1350;

/** Image 16:9 en vertical : fond flouté plein cadre + fenêtre 4:5 nette aux bords fondus. */
const VImage: React.FC<{ src: string; iw: number; ih: number; cam: Cam; filter: string; children?: (w: number, h: number) => React.ReactNode }> = ({ src, iw, ih, cam, filter, children }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Camera iw={iw} ih={ih} cam={{ cx: cam.cx, cy: 0.5, zoom: 1 }} filter="blur(28px) brightness(0.45) saturate(0.9)">
      {(w, h) => <Img src={staticFile(src)} style={{ width: w, height: h }} />}
    </Camera>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: VTOP,
        width: 1080,
        height: VH,
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 9%, #000 91%, transparent 100%)",
        maskImage: "linear-gradient(180deg, transparent 0%, #000 9%, #000 91%, transparent 100%)",
      }}
    >
      <Camera iw={iw} ih={ih} cam={cam} filter={filter} bw={1080} bh={VH}>
        {(w, h) => (
          <>
            <Img src={staticFile(src)} style={{ width: w, height: h }} />
            {children ? children(w, h) : null}
          </>
        )}
      </Camera>
    </div>
  </AbsoluteFill>
);

const V1A: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c1a" dur={78} from={{ cx: 0.55, cy: 0.5, zoom: 1.0 }} to={{ cx: 0.55, cy: 0.55, zoom: 1.07 }} fadeIn={8} filter={NIGHT} />
    <Fog y={1250} opacity={0.8} />
    <Vig />
    <Center top={700}>
      <Punch text={T.ecoute} at={9} size={170} />
    </Center>
  </AbsoluteFill>
);

const V1B: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c1b" dur={60} from={{ cx: 0.37, cy: 0.5, zoom: 1.05 }} to={{ cx: 0.43, cy: 0.5, zoom: 1.05 }} filter={NIGHT} />
    <Vig />
  </AbsoluteFill>
);

const V1C: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c1c" dur={72} from={{ cx: 0.5, cy: 0.6, zoom: 1.0 }} to={{ cx: 0.5, cy: 0.62, zoom: 1.08 }} fadeOut={3} filter={NIGHT} />
    <Fog y={1300} opacity={0.6} />
    <Vig />
  </AbsoluteFill>
);

const VTitreYom: React.FC = () => (
  <AbsoluteFill>
    <Center top={720}>
      <Punch text={T.yom} at={0} size={170} color={C.ivory} until={87} />
      <div style={{ height: 14 }} />
      <Line text={T.sanaga} at={6} size={44} color={C.terracotta} italic until={87} />
      <div style={{ height: 44 }} />
      <Line text={T.sansPont} at={30} size={64} color={C.gold} until={87} />
    </Center>
  </AbsoluteFill>
);

const V2A: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c2a" dur={60} from={{ cx: 0.33, cy: 0.5, zoom: 1.0 }} to={{ cx: 0.35, cy: 0.52, zoom: 1.06 }} fadeIn={4} filter="brightness(0.9) saturate(0.95)" />
    <Vig />
  </AbsoluteFill>
);

const V2B: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c2b" dur={69} from={{ cx: 0.34, cy: 0.5, zoom: 1.05 }} to={{ cx: 0.46, cy: 0.5, zoom: 1.05 }} filter={NIGHT} />
    <Vig />
    <Center top={800}>
      <Punch text={"TOUT UN\nPEUPLE"} at={30} size={140} color={C.gold} style={{ whiteSpace: "pre-line" }} />
    </Center>
  </AbsoluteFill>
);

const V3A: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c3a" dur={63} from={{ cx: 0.64, cy: 0.45, zoom: 1.0 }} to={{ cx: 0.64, cy: 0.42, zoom: 1.08 }} filter={NIGHT} />
    <Vig />
    <Center top={640}>
      <Line text={T.appel} at={6} size={80} color={C.ivory} family={cinzel} weight={700} italic />
    </Center>
  </AbsoluteFill>
);

const V3B: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c3b" dur={36} from={{ cx: 0.5, cy: 0.6, zoom: 1.0 }} to={{ cx: 0.5, cy: 0.62, zoom: 1.05 }} filter={NIGHT} />
    <Vig />
  </AbsoluteFill>
);

const V3C: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c3c" dur={38} from={{ cx: 0.45, cy: 0.5, zoom: 1.0 }} to={{ cx: 0.45, cy: 0.48, zoom: 1.06 }} filter={NIGHT} />
    <Vig />
  </AbsoluteFill>
);

const VTitreRepondit: React.FC = () => (
  <AbsoluteFill>
    <Center top={820} left={60} right={60}>
      <Punch text={"QUELQUE CHOSE\nRÉPONDIT."} at={0} size={84} color={C.ivory} until={51} style={{ whiteSpace: "pre-line" }} />
    </Center>
  </AbsoluteFill>
);

const V4A: React.FC = () => {
  const frame = useCurrentFrame();
  const inO = ramp(frame, 0, 8, 0, 1, Easing.linear);
  const cam = lerpCam(frame, 95, { cx: 0.47, cy: 0.5, zoom: 1.0 }, { cx: 0.45, cy: 0.42, zoom: 1.1 });
  return (
    <AbsoluteFill style={{ opacity: inO }}>
      {/* pas de reflets animés ici : sur cette image ils passaient sur le tronc et les personnages */}
      <VImage src={`${DIR}/img-1.png`} iw={1672} ih={941} cam={cam} filter="brightness(0.88) contrast(1.06) saturate(0.92)" />
      <Fog y={600} opacity={0.6} speed={0.6} />
      <Vig strength={0.6} />
      <Center top={640}>
        <Punch text={T.tronc} at={8} size={118} color={C.gold} />
        <div style={{ height: 10 }} />
        <Line text={T.rive} at={53} size={56} color={C.ivory} italic />
      </Center>
    </AbsoluteFill>
  );
};

const V4B: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.25 + 0.15 * Math.sin(frame * 0.15);
  return (
    <AbsoluteFill>
      <Clip name="c4b" dur={72} from={{ cx: 0.3, cy: 0.62, zoom: 1.0 }} to={{ cx: 0.24, cy: 0.78, zoom: 1.2 }} filter="brightness(1.15) contrast(1.08)" />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 45% 82%, rgba(240,180,80,${glow * 0.35}) 0%, rgba(0,0,0,0) 30%)`, mixBlendMode: "screen" }} />
      <Vig strength={0.7} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 720 }}>
        <Sink text="CE N'ÉTAIT PAS" at={12} size={100} hold={44} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 850 }}>
        <Sink text="UN TRONC." at={26} size={100} hold={34} />
      </div>
    </AbsoluteFill>
  );
};

const V5: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = lerpCam(frame, 108, { cx: 0.4, cy: 0.9, zoom: 1.25 }, { cx: 0.4, cy: 0.1, zoom: 1.25 });
  const glint = ramp(frame, 62, 34, -0.2, 1.2, Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill>
      <VImage src={`${DIR}/img-2.png`} iw={1672} ih={940} cam={cam} filter="brightness(0.9) contrast(1.05) saturate(0.95)">
        {(w, h) => (
          <>
            <div
              style={{
                position: "absolute",
                left: 0.49 * w,
                top: (0.02 + 0.2 * (1 - glint)) * h,
                width: 0.06 * w,
                height: 0.07 * h,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,236,190,0.85) 0%, rgba(255,200,110,0.35) 40%, rgba(0,0,0,0) 70%)",
                mixBlendMode: "screen",
                opacity: glint > 0 && glint < 1 ? Math.sin(glint * Math.PI) : 0,
              }}
            />
            <Shimmer w={w} h={h} x0={0.5} x1={1.0} y0={0.55} y1={0.75} count={30} seed="t2" />
          </>
        )}
      </VImage>
      <Vig strength={0.55} />
      <Center top={620}>
        <Punch text={T.loi} at={2} size={150} color={C.gold} />
      </Center>
      <Center top={1330} left={40} right={40}>
        <Line text={T.loiTexte} at={33} size={54} color={C.ivory} />
      </Center>
    </AbsoluteFill>
  );
};

const V6A: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = lerpCam(frame, 90, { cx: 0.42, cy: 0.5, zoom: 1.0 }, { cx: 0.5, cy: 0.5, zoom: 1.08 }, Easing.linear);
  const blue = ramp(frame, 0, 90, 0, 1, Easing.linear);
  return (
    <AbsoluteFill>
      <Camera iw={1122} ih={1402} cam={cam} filter={`brightness(${0.92 - blue * 0.3}) saturate(${1 - blue * 0.35})`}>
        {(w, h) => (
          <>
            <Img src={staticFile(`${DIR}/galerie-02.jpg`)} style={{ width: w, height: h }} />
            <Shimmer w={w} h={h} x0={0.55} x1={1.0} y0={0.6} y1={0.92} count={24} seed="t3" />
          </>
        )}
      </Camera>
      <AbsoluteFill style={{ background: "#1B3550", opacity: blue * 0.45, mixBlendMode: "multiply" }} />
      <Fog y={1300} opacity={0.4 + blue * 0.3} speed={0.5} />
      <Vig strength={0.7} />
    </AbsoluteFill>
  );
};

const V6B: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c6b" dur={42} from={{ cx: 0.3, cy: 0.5, zoom: 1.0 }} to={{ cx: 0.3, cy: 0.5, zoom: 1.04 }} filter="brightness(0.95) saturate(0.9)" />
    <Vig strength={0.8} />
  </AbsoluteFill>
);

const V6C: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c6c" dur={48} from={{ cx: 0.27, cy: 0.5, zoom: 1.0 }} to={{ cx: 0.29, cy: 0.48, zoom: 1.05 }} filter="brightness(0.85) saturate(0.82)" />
    <AbsoluteFill style={{ background: "#0E2238", opacity: 0.25, mixBlendMode: "multiply" }} />
    <Vig strength={0.85} />
  </AbsoluteFill>
);

const VTitreNuit: React.FC = () => (
  <AbsoluteFill>
    <Center top={700}>
      <Punch text={"PUIS VINT\nLA NUIT."} at={0} size={130} color={C.ivory} until={60} style={{ whiteSpace: "pre-line" }} />
    </Center>
  </AbsoluteFill>
);

const V7: React.FC = () => (
  <AbsoluteFill>
    <Clip name="c7" dur={102} from={{ cx: 0.55, cy: 0.5, zoom: 1.0 }} to={{ cx: 0.55, cy: 0.47, zoom: 1.06 }} fadeOut={8} filter="brightness(1.0) contrast(1.05)" />
    <Embers x={560} y={1500} count={22} spread={200} power={0.8} />
    <Vig strength={0.7} />
    <Center top={830} left={60} right={60}>
      <Line text={"Que s'est-il passé\ncette nuit-là ?"} at={12} size={74} color={C.gold} family={cinzel} weight={700} until={100} style={{ whiteSpace: "pre-line" }} />
    </Center>
  </AbsoluteFill>
);

const V8: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = ramp(frame, 0, 225, 1.0, 1.1, Easing.linear);
  const inO = ramp(frame, 0, 10, 0, 1, Easing.linear);
  const out = ramp(frame, 204, 21, 0, 1, Easing.linear);
  const btnAt = f(38.8) - f(34.0);
  const pulse = frame >= btnAt + 10 ? 1 + 0.04 * Math.sin((frame - btnAt - 10) * 0.18) : 1;
  const btnIn = popScaleSoft(frame, btnAt);
  const logoAt = f(36.8) - f(34.0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity: inO }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          <Img src={staticFile(`${DIR}/fin.jpg`)} style={{ position: "absolute", width: 1920, height: 1920, top: 0, left: -420, filter: "blur(7px) brightness(0.32) saturate(0.85)" }} />
        </AbsoluteFill>
        <Fog y={1350} opacity={0.6} speed={0.5} />
        <Embers x={540} y={1700} count={26} spread={900} power={0.55} />
        <Vig strength={0.8} />
        <Center top={680} left={40} right={40}>
          <Punch text={T.titre} at={6} size={100} color={C.gold} />
          <div style={{ height: 30 }} />
          <div style={{ maxWidth: 860 }}>
            <Line text={T.accroche} at={f(35.7) - f(34.0)} size={52} color={C.ivory} family={cinzel} weight={700} />
          </div>
          <div style={{ height: 60 }} />
          <div
            style={{
              opacity: frame >= btnAt ? 1 : 0,
              transform: `scale(${btnIn * pulse})`,
              padding: "24px 76px",
              borderRadius: 64,
              background: "linear-gradient(180deg, #F7D98B 0%, #F0C36B 50%, #C98A3D 100%)",
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 52,
              color: "#1A130D",
              boxShadow: "0 0 50px rgba(240,195,107,0.45)",
            }}
          >
            {T.bouton}
          </div>
        </Center>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", flexDirection: "column", alignItems: "center", opacity: ramp(frame, logoAt, 15, 0, 1) }}>
          <Img src={staticFile("img/afroback-logo.png")} style={{ width: 100, height: 100 }} />
          <div style={{ height: 12 }} />
          <div style={{ fontFamily: manrope, fontWeight: 600, fontSize: 28, color: "rgba(255,244,224,0.72)", letterSpacing: 1 }}>{T.mentionFin}</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

const VMention: React.FC = () => {
  const frame = useCurrentFrame();
  const o = Math.min(ramp(frame, 0, 12, 0, 1), ramp(frame, 191, 10, 1, 0, Easing.linear));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1452, textAlign: "center", fontFamily: manrope, fontWeight: 600, fontSize: 30, letterSpacing: 1, color: "rgba(255,244,224,0.8)", opacity: o, textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
      {T.mention}
    </div>
  );
};

const PLANS_V: { from: number; dur: number; C: React.FC }[] = [
  { from: 0, dur: 78, C: V1A },
  { from: 78, dur: 60, C: V1B },
  { from: 138, dur: 72, C: V1C },
  { from: 210, dur: 60, C: V2A },
  { from: 270, dur: 69, C: V2B },
  { from: 339, dur: 63, C: V3A },
  { from: 402, dur: 36, C: V3B },
  { from: 438, dur: 38, C: V3C },
  { from: 463, dur: 95, C: V4A },
  { from: 558, dur: 72, C: V4B },
  { from: 630, dur: 108, C: V5 },
  { from: 738, dur: 90, C: V6A },
  { from: 828, dur: 42, C: V6B },
  { from: 870, dur: 48, C: V6C },
  { from: 918, dur: 102, C: V7 },
  { from: 1020, dur: 225, C: V8 },
];

const TITRES_V: { from: number; dur: number; C: React.FC }[] = [
  { from: 9, dur: 201, C: VMention },
  { from: 120, dur: 90, C: VTitreYom },
  { from: 405, dur: 51, C: VTitreRepondit },
  { from: 834, dur: 60, C: VTitreNuit },
];

export const NganMedzaTeaser: React.FC<TeaserProps> = ({ format, withAudio = true }) => {
  const V = format === "vertical";
  const plans = V ? PLANS_V : PLANS;
  const titres = V ? TITRES_V : TITRES;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {plans.map(({ from, dur, C: Pl }) => (
        <Sequence key={`p${from}`} from={from} durationInFrames={dur}>
          <Pl />
        </Sequence>
      ))}
      {titres.map(({ from, dur, C: Ti }) => (
        <Sequence key={`t${from}`} from={from} durationInFrames={dur}>
          <Ti />
        </Sequence>
      ))}
      {SUBS_FR.map((sub, i) => (
        <Subtitle key={i} words={sub.words} end={sub.end} bottom={V ? 500 : 110} size={V ? 50 : 46} />
      ))}
      {withAudio ? <Audio src={staticFile(TXT.fr.audio)} /> : null}
    </AbsoluteFill>
  );
};
