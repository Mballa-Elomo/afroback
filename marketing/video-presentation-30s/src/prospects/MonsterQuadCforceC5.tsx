// Essai client MonsterQuad (SARL Faivre), pas AFROBACK : Reel Facebook 40 s, 1080 × 1920,
// CFMOTO CFORCE C5, monté à partir des rushes filmés par MonsterQuad le 2026-09-29.
// V2 : motion design complet (typo cinétique, vidéo dans le texte, transitions avec flou de
// mouvement, glitch, cartes en verre dépoli, compteurs, tampons, bruitages synthétisés).
// Plans : scripts/extraire-monsterquad-c5.sh → public/monsterquad/cforce-c5/.
// Bruitages : scripts/sfx-synthese.py → public/monsterquad/sfx/ (synthèse, libres de droits).
// Musique : « Protesting Robot », Michael Ramir C. (licence Mixkit), 141,5 BPM :
// montée 0-8,57 s, drop à 8,57 s (image 257), pause à 22,4 s (672), second drop à 29,14 s (874).
// Données produit : fiche monsterquad.fr du CFORCE C5 relevée le 2026-10-02.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";

export const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const manrope = loadManrope("normal", { weights: ["600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const W = 1080;
export const H = 1920;
export const RED = "#E71800";
export const GREEN = "#8DC63F";
export const INK = "#0D0E11";
export const PLATE = "#272D31";

// Grille musicale (images, 30 i/s)
const BEAT = 12.72;
const DROP1 = 257;
const PAUSE = 672;
const DROP2 = 874;
const FIN = 1200;
export const T = 7; // durée des transitions qui se chevauchent

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const expoOut = Easing.out(Easing.exp);
export const ramp = (f: number, a: number, d: number, from: number, to: number, e = expoOut) =>
  interpolate(f, [a, a + d], [from, to], { ...clamp, easing: e });
export const popIn = (f: number, at: number) => {
  if (f < at) return 0;
  if (f < at + 5) return ramp(f, at, 5, 0, 1.2);
  return ramp(f, at + 5, 7, 1.2, 1, Easing.out(Easing.quad));
};
export const secousse = (f: number, coups: number[], amp = 16, dur = 8) => {
  let x = 0;
  let y = 0;
  for (const c of coups) {
    if (f >= c && f < c + dur) {
      const k = 1 - (f - c) / dur;
      x += (random(`sx${c}-${f}`) * 2 - 1) * amp * k;
      y += (random(`sy${c}-${f}`) * 2 - 1) * amp * k;
    }
  }
  return `translate(${x}px, ${y}px)`;
};
export const ombre = "drop-shadow(0 8px 28px rgba(0,0,0,0.65)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))";
export const video = (src: string) => staticFile(`monsterquad/cforce-c5/${src}.mp4`);

/* =========================================================================================
   Briques visuelles
   ========================================================================================= */

/** Filtre SVG de flou directionnel (flou de mouvement horizontal ou vertical). */
export const FiltreFlou: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id={id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${x} ${y}`} edgeMode="duplicate" />
      </filter>
    </defs>
  </svg>
);

export type Entree = "coupe" | "whipG" | "whipD" | "zoom" | "glitch" | "haut" | "fondu";

/** Plan vidéo avec transition d'entrée (la séquence précédente reste dessous pendant T images). */
export const Plan: React.FC<{
  uid: string;
  src: string;
  dur: number;
  entree?: Entree;
  zoom?: [number, number];
  sombre?: number;
  origine?: string;
}> = ({ uid, src, dur, entree = "coupe", zoom = [1.04, 1.14], sombre = 0, origine = "50% 50%" }) => {
  const f = useCurrentFrame();
  const p = ramp(f, 0, T, 0, 1, Easing.out(Easing.cubic));
  const kb = interpolate(f, [0, dur], zoom, clamp);
  let tx = 0;
  let ty = 0;
  let sc = 1;
  let bx = 0;
  let by = 0;
  let op = 1;
  if (entree === "whipG") {
    tx = (1 - p) * W * 1.05;
    bx = (1 - p) * 110;
  } else if (entree === "whipD") {
    tx = -(1 - p) * W * 1.05;
    bx = (1 - p) * 110;
  } else if (entree === "haut") {
    ty = (1 - p) * H;
    by = (1 - p) * 140;
  } else if (entree === "zoom") {
    sc = 1 + (1 - p) * 0.9;
    bx = (1 - p) * 30;
    by = bx;
  } else if (entree === "fondu") {
    op = ramp(f, 0, 14, 0, 1, Easing.inOut(Easing.quad));
  }
  const id = `flou-${uid}`;
  const flou = bx + by > 0.4;
  const styleVideo: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
  const glitchActif = entree === "glitch" && f < 9;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: op }}>
      {flou ? <FiltreFlou id={id} x={bx} y={by} /> : null}
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${sc * kb})`,
          transformOrigin: origine,
          filter: flou ? `url(#${id})` : undefined,
          background: INK,
        }}
      >
        {glitchActif ? (
          <Glitch src={src} f={f} />
        ) : (
          <OffthreadVideo src={video(src)} muted style={styleVideo} />
        )}
      </AbsoluteFill>
      {sombre > 0 ? <AbsoluteFill style={{ background: `rgba(8,9,12,${sombre})` }} /> : null}
    </AbsoluteFill>
  );
};

/** Glitch d'entrée : tranches horizontales décalées + aberration chromatique. */
const Glitch: React.FC<{ src: string; f: number }> = ({ src, f }) => {
  const k = 1 - f / 9;
  const tranches = 7;
  return (
    <AbsoluteFill>
      {new Array(tranches).fill(0).map((_, i) => {
        const haut = (i / tranches) * 100;
        const bas = 100 - ((i + 1) / tranches) * 100;
        const dx = (random(`g${src}${i}${Math.floor(f / 2)}`) * 2 - 1) * 140 * k;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${haut}% 0 ${bas}% 0)`, transform: `translateX(${dx}px)` }}>
            <OffthreadVideo src={video(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ background: `rgba(255,0,60,${0.25 * k})`, mixBlendMode: "screen", transform: `translateX(${18 * k}px)` }} />
      <AbsoluteFill style={{ background: `rgba(0,220,255,${0.2 * k})`, mixBlendMode: "screen", transform: `translateX(${-18 * k}px)` }} />
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{ at?: number; dur?: number; max?: number; couleur?: string }> = ({ at = 0, dur = 6, max = 0.7, couleur = "#fff" }) => {
  const f = useCurrentFrame();
  const o = f < at ? 0 : interpolate(f, [at, at + dur], [max, 0], clamp);
  return <AbsoluteFill style={{ background: couleur, opacity: o, pointerEvents: "none" }} />;
};

/** Fuite de lumière chaude qui traverse l'image (fondu en mode « screen »). */
export const Fuite: React.FC<{ at: number; dur?: number; teinte?: string; sens?: 1 | -1 }> = ({ at, dur = 26, teinte = "255,110,30", sens = 1 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  const p = (f - at) / dur;
  const o = Math.sin(p * Math.PI);
  const x = sens > 0 ? -30 + p * 160 : 130 - p * 160;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: o * 0.85,
        background: `radial-gradient(ellipse 55% 40% at ${x}% 35%, rgba(${teinte},0.9), rgba(${teinte},0.25) 45%, transparent 70%),
          radial-gradient(ellipse 30% 25% at ${x + 20}% 70%, rgba(255,40,10,0.6), transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
};

/** Grain de pellicule animé. */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.1, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 37} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Dégradé de lisibilité : bande sombre au centre de la zone sûre Reels. */
export const Voile: React.FC<{ force?: number; haut?: number }> = ({ force = 0.6, haut = 0.35 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(0,0,0,${haut}) 0%, rgba(0,0,0,${force * 0.6}) 16%, rgba(0,0,0,${force}) 34%, rgba(0,0,0,${force}) 64%, transparent 84%)`,
    }}
  />
);

/** Bandes cinéma. */
export const Bandes: React.FC<{ at: number; h?: number }> = ({ at, h = 130 }) => {
  const f = useCurrentFrame();
  const v = ramp(f, at, 14, 0, h, Easing.out(Easing.cubic));
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: v, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: v, background: "#000" }} />
    </>
  );
};

/** Coins de visée (HUD) qui se referment sur la zone sûre. */
export const Visee: React.FC<{ at?: number; couleur?: string }> = ({ at = 0, couleur = "#fff" }) => {
  const f = useCurrentFrame();
  const o = ramp(f, at, 10, 90, 0);
  const op = ramp(f, at, 6, 0, 0.9);
  const cadre = { x1: 50, y1: 250, x2: W - 50, y2: 1300 };
  const L = 70;
  const coins: [number, number, number, number][] = [
    [cadre.x1 - o, cadre.y1 - o, 1, 1],
    [cadre.x2 + o, cadre.y1 - o, -1, 1],
    [cadre.x1 - o, cadre.y2 + o, 1, -1],
    [cadre.x2 + o, cadre.y2 + o, -1, -1],
  ];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>
      {coins.map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + sy * L} L${x} ${y} L${x + sx * L} ${y}`} stroke={couleur} strokeWidth={5} fill="none" />
      ))}
    </svg>
  );
};

/* =========================================================================================
   Typographie cinétique
   ========================================================================================= */

/** Rend « texte *accent* » avec le mot entre astérisques en couleur d'accent. */
const Accentue: React.FC<{ texte: string; accent: string }> = ({ texte, accent }) => (
  <>
    {texte.split("*").map((m, i) => (
      <span key={i} style={{ color: i % 2 ? accent : undefined }}>
        {m}
      </span>
    ))}
  </>
);

/** Lignes qui montent derrière un masque, avec inclinaison qui se redresse. */
export const Lignes: React.FC<{
  lignes: string[];
  at: number;
  taille: number;
  couleur?: string;
  accent?: string;
  ecart?: number;
  align?: "center" | "left";
  police?: string;
  graisse?: number;
  espacement?: number;
  interligne?: number;
}> = ({ lignes, at, taille, couleur = "#fff", accent = GREEN, ecart = 4, align = "center", police = anton, graisse = 400, espacement = 1, interligne = 1.02 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ textAlign: align, filter: ombre }}>
      {lignes.map((l, i) => {
        const p = ramp(f, at + i * ecart, 12, 0, 1, Easing.out(Easing.cubic));
        return (
          // marge haute dans le masque pour ne pas couper les accents des capitales (Ê, É, À)
          <div key={i} style={{ overflow: "hidden", paddingTop: taille * 0.22, marginTop: -taille * 0.22, paddingBottom: taille * 0.06 }}>
            <div
              style={{
                fontFamily: police,
                fontWeight: graisse,
                fontSize: taille,
                lineHeight: interligne,
                letterSpacing: espacement,
                color: couleur,
                transform: `translateY(${(1 - p) * 115}%) skewY(${(1 - p) * 8}deg)`,
                transformOrigin: "0% 100%",
              }}
            >
              <Accentue texte={l} accent={accent} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Mot qui s'écrase à l'écran : impact, aberration chromatique, échos en contour. */
export const Slam: React.FC<{ texte: string; at: number; taille: number; couleur?: string; top: number }> = ({ texte, at, taille, couleur = "#fff", top }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = ramp(f, at, 6, 1.75, 1, Easing.out(Easing.quad));
  const rgb = ramp(f, at, 6, 16, 0);
  const base: React.CSSProperties = { fontFamily: anton, fontSize: taille, lineHeight: 1, letterSpacing: 3, whiteSpace: "nowrap" };
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: `scale(${s})` }}>
        {[1, 2, 3].map((k) => (
          <div
            key={k}
            style={{
              ...base,
              position: "absolute",
              inset: 0,
              color: "transparent",
              WebkitTextStroke: `3px ${couleur}`,
              transform: `scale(${1 + ramp(f, at + k, 18, 0, 0.16 * k, Easing.out(Easing.quad))})`,
              opacity: ramp(f, at + k, 18, 0.7, 0, Easing.linear),
            }}
          >
            {texte}
          </div>
        ))}
        {rgb > 0.5 ? (
          <>
            <div style={{ ...base, position: "absolute", inset: 0, color: "rgba(255,0,60,0.8)", transform: `translateX(${rgb}px)`, mixBlendMode: "screen" }}>{texte}</div>
            <div style={{ ...base, position: "absolute", inset: 0, color: "rgba(0,220,255,0.8)", transform: `translateX(${-rgb}px)`, mixBlendMode: "screen" }}>{texte}</div>
          </>
        ) : null}
        <div style={{ ...base, position: "relative", color: couleur, filter: ombre }}>{texte}</div>
      </div>
    </div>
  );
};

/** Reflet lumineux qui balaie un texte. */
export const Brillant: React.FC<{ texte: string; at: number; style: React.CSSProperties; base?: string }> = ({ texte, at, style, base = "#ffffff" }) => {
  const f = useCurrentFrame();
  const pos = ramp(f, at, 22, 120, -20, Easing.inOut(Easing.cubic));
  return (
    <span
      style={{
        ...style,
        backgroundImage: `linear-gradient(105deg, ${base} 0%, ${base} 42%, #fff7d6 48%, #ffffff 50%, #fff7d6 52%, ${base} 58%, ${base} 100%)`,
        backgroundSize: "300% 100%",
        backgroundPosition: `${pos}% 0`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {texte}
    </span>
  );
};

/** Texte qui se « décode » (caractères aléatoires puis valeur finale). */
export const Decode: React.FC<{ texte: string; at: number }> = ({ texte, at }) => {
  const f = useCurrentFrame();
  const signes = "0123456789#%&@$";
  return (
    <>
      {texte.split("").map((c, i) => {
        const fixe = f >= at + 4 + i * 1.5;
        if (fixe || c === " " || c === "," || c === ".") return <span key={i}>{c}</span>;
        return <span key={i}>{signes[Math.floor(random(`d${texte}${i}${f}`) * signes.length)]}</span>;
      })}
    </>
  );
};

const nombre = (v: number, dec = 0) => v.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/\s/g, " ");

/** Compteur qui défile jusqu'à sa valeur. */
export const Compteur: React.FC<{ valeur: number; at: number; dec?: number; dur?: number }> = ({ valeur, at, dec = 0, dur = 22 }) => {
  const f = useCurrentFrame();
  const v = ramp(f, at, dur, 0, valeur, Easing.out(Easing.cubic));
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{nombre(dec ? Math.round(v * 10) / 10 : Math.round(v), dec)}</span>;
};

/** Chiffre « machine à sous » avec flou de mouvement vertical. */
export const Rouleau: React.FC<{ chiffre: number; at: number; taille: number; uid: string }> = ({ chiffre, at, taille, uid }) => {
  const f = useCurrentFrame();
  const cible = 20 + chiffre;
  const position = (x: number) => interpolate(x, [at, at + 30], [0, cible], { ...clamp, easing: Easing.out(Easing.back(1.25)) });
  const pos = position(f);
  const vitesse = Math.abs(pos - position(f - 1));
  const h = taille * 1.05;
  const id = `rl-${uid}`;
  return (
    <span style={{ display: "inline-block", height: h, overflow: "hidden", verticalAlign: "top" }}>
      <FiltreFlou id={id} x={0} y={Math.min(30, vitesse * 9)} />
      <span style={{ display: "block", transform: `translateY(${-pos * h}px)`, filter: vitesse > 0.05 ? `url(#${id})` : undefined }}>
        {new Array(30).fill(0).map((_, i) => (
          <span key={i} style={{ display: "block", height: h, lineHeight: `${h}px` }}>
            {i % 10}
          </span>
        ))}
      </span>
    </span>
  );
};

/* =========================================================================================
   1. Accroche (0 – 8,57 s) : question + rafale de plans, montée jusqu'au drop
   ========================================================================================= */

const Triptyque: React.FC = () => {
  const f = useCurrentFrame();
  const srcs = ["03-amortisseur", "04-badge-c5", "05-passage-ar"];
  const gap = 10;
  const lw = (W - 2 * gap) / 3;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {srcs.map((s, i) => {
        const at = i * 13;
        const p = ramp(f, at, 9, 0, 1, Easing.out(Easing.cubic));
        const dir = i % 2 ? -1 : 1;
        const id = `tri-${i}`;
        const by = (1 - p) * 120;
        if (f < at) return null;
        return (
          <div
            key={s}
            style={{
              position: "absolute",
              top: 0,
              left: i * (lw + gap),
              width: lw,
              height: H,
              overflow: "hidden",
              transform: `translateY(${(1 - p) * H * dir}px)`,
            }}
          >
            <FiltreFlou id={id} x={0} y={by} />
            <div style={{ width: "100%", height: "100%", filter: by > 0.4 ? `url(#${id})` : undefined, transform: `scale(${interpolate(f, [at, 75], [1.25, 1.05], clamp)})` }}>
              <OffthreadVideo src={video(s)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        );
      })}
      {[1, 2].map((k) => (
        <div key={k} style={{ position: "absolute", top: 0, bottom: 0, left: k * (lw + gap) - gap, width: gap, background: GREEN, opacity: ramp(f, k * 13, 6, 0, 1) }} />
      ))}
    </AbsoluteFill>
  );
};

const Accroche: React.FC = () => {
  const f = useCurrentFrame();
  // montée finale : léger zoom croissant avant le drop
  const tension = interpolate(f, [205, DROP1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ transform: `${secousse(f, [79, 105, 130, 155, 178, 231], 14, 7)} scale(${1 + tension * 0.06})` }}>
      <Sequence durationInFrames={53}>
        <Plan uid="a1" src="01-phares-on" dur={53} zoom={[1.0, 1.14]} />
      </Sequence>
      <Sequence from={53 - T} durationInFrames={51 + T}>
        <Plan uid="a2" src="02-feux-ar-led" dur={58} entree="whipG" />
      </Sequence>
      <Sequence from={104} durationInFrames={64}>
        <Triptyque />
      </Sequence>
      <Sequence from={168 - T} durationInFrames={38 + T}>
        <Plan uid="a4" src="06-calandre" dur={45} entree="zoom" zoom={[1.05, 1.25]} />
      </Sequence>
      <Sequence from={206 - T} durationInFrames={25 + T}>
        <Plan uid="a5" src="07-appel-phares" dur={32} entree="glitch" />
      </Sequence>
      <Sequence from={231 - T} durationInFrames={26 + T}>
        <Plan uid="a6" src="08-travelling-showroom" dur={33} entree="whipD" zoom={[1.0, 1.45]} />
      </Sequence>
      <Voile force={0.5} haut={0.2} />

      {/* Textes */}
      <Sequence durationInFrames={53}>
        <div style={{ position: "absolute", top: 640, left: 0, right: 0 }}>
          <Lignes lignes={["VOUS CHERCHEZ"]} at={4} taille={60} police={manrope} graisse={800} espacement={10} couleur={GREEN} />
          <Lignes lignes={["UN QUAD"]} at={10} taille={240} />
        </div>
      </Sequence>
      <Sequence from={53} durationInFrames={51}>
        <div style={{ position: "absolute", top: 560, left: 0, right: 0 }}>
          <Lignes lignes={["QUI FAIT"]} at={1} taille={170} />
        </div>
        <Slam texte="TOUT ?" at={26} taille={300} couleur={RED} top={770} />
      </Sequence>
      <Sequence from={104} durationInFrames={26}>
        <Slam texte="PUISSANT." at={1} taille={190} top={830} />
      </Sequence>
      <Sequence from={130} durationInFrames={25}>
        <Slam texte="ROBUSTE." at={0} taille={190} top={830} />
      </Sequence>
      <Sequence from={155} durationInFrames={13}>
        <Slam texte="ÉQUIPÉ." at={0} taille={190} couleur={GREEN} top={830} />
      </Sequence>
      <Sequence from={168} durationInFrames={38}>
        <div style={{ position: "absolute", top: 640, left: 0, right: 0 }}>
          <Lignes lignes={["HOMOLOGUÉ"]} at={2} taille={130} />
        </div>
        <Slam texte="ROUTE." at={10} taille={260} couleur={GREEN} top={800} />
      </Sequence>
      <Sequence from={206} durationInFrames={25}>
        <div style={{ position: "absolute", top: 700, left: 0, right: 0 }}>
          <Lignes lignes={["ET IL VOUS"]} at={1} taille={170} />
        </div>
      </Sequence>
      <Sequence from={231} durationInFrames={26}>
        <Slam texte="ATTEND." at={0} taille={270} couleur={RED} top={700} />
        <div style={{ position: "absolute", top: 1010, left: 0, right: 0, opacity: ramp(f - 231, 6, 6, 0, 1) }}>
          <div
            style={{
              textAlign: "center",
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 54,
              color: "#fff",
              letterSpacing: interpolate(f, [237, 257], [40, 8], clamp),
              filter: ombre,
            }}
          >
            CHEZ MONSTERQUAD
          </div>
        </div>
      </Sequence>
      {/* stroboscope avant le drop */}
      {[244, 248, 251, 254].map((at) => (
        <Flash key={at} at={at} dur={2} max={0.35} />
      ))}
      {[53, 168, 231].map((at) => (
        <Flash key={at} at={at} dur={5} max={0.35} />
      ))}
      <Fuite at={0} dur={40} />
      <Fuite at={160} dur={30} sens={-1} />
    </AbsoluteFill>
  );
};

/* =========================================================================================
   2. Révélation au drop (8,57 – 11,97 s) : vidéo dans le « C5 », zoom à travers les lettres
   ========================================================================================= */

export const DUREE_REV = 102;

export const Revelation: React.FC = () => {
  const f = useCurrentFrame();
  const ouverture = interpolate(f, [18, 32], [1, 18], { ...clamp, easing: Easing.in(Easing.cubic) });
  const entree = ramp(f, 0, 10, 1.3, 1, Easing.out(Easing.quad));
  const plein = ramp(f, 24, 6, 0, 1, Easing.linear);
  const styleVideo: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
  const fill = ramp(f, 44, 14, 0, 100, Easing.inOut(Easing.cubic));
  const titre: React.CSSProperties = { fontFamily: anton, fontSize: 196, lineHeight: 1.02, letterSpacing: 2 };
  const puces = [
    { t: "498,6 CC", at: 62 },
    { t: "39 CV", at: 68 },
    { t: "T3b", at: 74 },
  ];
  return (
    <AbsoluteFill style={{ background: INK, transform: secousse(f, [0, 32], 26, 12) }}>
      <AbsoluteFill style={{ opacity: plein }}>
        <Plan uid="rv" src="09-hero-facade" dur={DUREE_REV} zoom={[1.12, 1.0]} origine="50% 70%" />
        <Voile force={0.55} haut={0.15} />
      </AbsoluteFill>
      {f < 32 ? (
        <AbsoluteFill style={{ transform: `scale(${entree * ouverture})`, transformOrigin: "50% 50%" }}>
          <svg width={W} height={H} style={{ position: "absolute" }}>
            <defs>
              <clipPath id="clip-c5">
                <text x={W / 2} y={1235} textAnchor="middle" fontFamily={anton} fontSize={780}>
                  C5
                </text>
              </clipPath>
            </defs>
          </svg>
          <AbsoluteFill style={{ clipPath: "url(#clip-c5)" }}>
            <OffthreadVideo src={video("09-hero-facade")} muted style={styleVideo} />
          </AbsoluteFill>
          <svg width={W} height={H} style={{ position: "absolute" }}>
            <text
              x={W / 2}
              y={1235}
              textAnchor="middle"
              fontFamily={anton}
              fontSize={780}
              fill="none"
              stroke={RED}
              strokeWidth={7}
              strokeDasharray={4200}
              strokeDashoffset={ramp(f, 0, 16, 4200, 0, Easing.out(Easing.cubic))}
            >
              C5
            </text>
          </svg>
          <div
            style={{
              position: "absolute",
              top: 470,
              width: "100%",
              textAlign: "center",
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 46,
              letterSpacing: 20,
              color: "#fff",
              opacity: ramp(f, 4, 6, 0, 1),
            }}
          >
            LE NOUVEAU
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Titre */}
      {f >= 32 ? (
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center" }}>
          <div
            style={{
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 50,
              color: GREEN,
              letterSpacing: interpolate(f, [34, 56], [60, 18], { ...clamp, easing: expoOut }),
              opacity: ramp(f, 34, 8, 0, 1),
              filter: ombre,
            }}
          >
            CFMOTO
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 30, marginTop: 6 }}>
            <div style={{ position: "relative", transform: `translateX(${ramp(f, 36, 14, -700, 0)}px)` }}>
              <div style={{ ...titre, color: "transparent", WebkitTextStroke: "4px #fff", filter: ombre }}>CFORCE</div>
              <div style={{ ...titre, position: "absolute", inset: 0, color: "#fff", clipPath: `inset(0 ${100 - fill}% 0 0)` }}>CFORCE</div>
            </div>
            <div style={{ position: "relative", transform: `scale(${popIn(f, 50)})` }}>
              {[1, 2].map((k) => (
                <div
                  key={k}
                  style={{
                    ...titre,
                    position: "absolute",
                    inset: 0,
                    color: "transparent",
                    WebkitTextStroke: `3px ${RED}`,
                    transform: `scale(${1 + ramp(f, 51 + k, 16, 0, 0.25 * k)})`,
                    opacity: ramp(f, 51 + k, 16, 0.8, 0, Easing.linear),
                  }}
                >
                  C5
                </div>
              ))}
              <div style={{ ...titre, color: RED, filter: ombre }}>C5</div>
            </div>
          </div>
          <div style={{ marginTop: 34, display: "flex", justifyContent: "center", gap: 20 }}>
            {puces.map((p) => (
              <div
                key={p.t}
                style={{
                  fontFamily: anton,
                  fontSize: 60,
                  color: INK,
                  background: "#fff",
                  padding: "6px 28px",
                  borderRadius: 10,
                  transform: `scale(${popIn(f, p.at)})`,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
                }}
              >
                <Decode texte={p.t} at={p.at} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <Bandes at={34} h={120} />
      <Flash dur={8} max={1} />
      <Flash at={30} dur={8} max={0.8} />
      <Fuite at={30} dur={34} />
    </AbsoluteFill>
  );
};

/* =========================================================================================
   3. Équipements (11,97 – 22,4 s) : bénéfice d'abord, chiffre ensuite
   ========================================================================================= */

export type Widget = "rayons" | "barre" | "puces" | "double" | "ecran" | "batterie";
type Atout = {
  src: string;
  titre: string[];
  valeur?: number;
  dec?: number;
  unite: string;
  avant?: string;
  grand?: string;
  detail: string;
  widget: Widget;
  entree: Entree;
};

const ATOUTS: Atout[] = [
  { src: "10-led-av", titre: ["VOYEZ", "PLUS *LOIN.*"], avant: "+ de", valeur: 20000, unite: "cd", detail: "Feux Full LED Dot Matrix", widget: "rayons", entree: "zoom" },
  { src: "11-treuil", titre: ["RIEN NE VOUS", "*ARRÊTE.*"], valeur: 1130, unite: "kg", detail: "Treuil de série, câble nylon", widget: "barre", entree: "whipG" },
  { src: "12-attelage", titre: ["TRACTEZ", "*SANS FORCER.*"], grand: "ATTELAGE", unite: "", detail: "Complet, prêt à atteler", widget: "puces", entree: "glitch" },
  { src: "13-suspension", titre: ["IL ABSORBE", "*TOUT.*"], valeur: 235, unite: "mm", detail: "Débattement AR · doubles triangles", widget: "double", entree: "whipD" },
  { src: "14-ecran-lcd", titre: ["TOUT SOUS", "LES *YEUX.*"], valeur: 5.9, dec: 1, unite: "\"", detail: "Tableau de bord LCD", widget: "ecran", entree: "haut" },
  { src: "15-usb", titre: ["TOUJOURS", "*CHARGÉ.*"], valeur: 18, unite: "W", detail: "USB-C + USB-A + prise 12V", widget: "batterie", entree: "zoom" },
];
const DEBUT_ATOUTS = DROP1 + DUREE_REV; // 359
const PAS = 51; // 4 temps

export const WidgetAnime: React.FC<{ type: Widget }> = ({ type }) => {
  const f = useCurrentFrame();
  const a = 12;
  if (type === "rayons") {
    return (
      <svg width={240} height={240} viewBox="-120 -120 240 240">
        <g transform={`rotate(${f * 1.5})`}>
          {new Array(16).fill(0).map((_, i) => {
            const l = ramp(f, a + i * 0.6, 14, 0, i % 2 ? 70 : 100);
            const ang = (i / 16) * Math.PI * 2;
            return (
              <line key={i} x1={Math.cos(ang) * 40} y1={Math.sin(ang) * 40} x2={Math.cos(ang) * (40 + l)} y2={Math.sin(ang) * (40 + l)} stroke="#fff7d6" strokeWidth={7} strokeLinecap="round" />
            );
          })}
        </g>
        <circle r={ramp(f, a, 10, 0, 30)} fill="#fff" style={{ filter: "drop-shadow(0 0 22px #fff7d6)" }} />
      </svg>
    );
  }
  if (type === "barre") {
    const p = ramp(f, a, 24, 0, 1, Easing.out(Easing.cubic));
    return (
      <div style={{ width: 250 }}>
        <div style={{ height: 30, borderRadius: 16, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
          <div style={{ width: `${p * 100}%`, height: "100%", background: `linear-gradient(90deg, ${GREEN}, #d6ff8f)`, boxShadow: `0 0 24px ${GREEN}` }} />
        </div>
        <div style={{ marginTop: 12, textAlign: "center", whiteSpace: "nowrap", fontFamily: manrope, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: "rgba(255,255,255,0.8)" }}>
          FORCE DE TRACTION
        </div>
      </div>
    );
  }
  if (type === "puces") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        {["BOULE D'ATTELAGE", "PRISE REMORQUE", "CROCHET AVANT"].map((t, i) => (
          <div
            key={t}
            style={{
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 28,
              color: INK,
              background: i === 0 ? GREEN : "#fff",
              padding: "8px 18px",
              borderRadius: 999,
              transform: `scale(${popIn(f, a + i * 5)})`,
              transformOrigin: "0% 50%",
            }}
          >
            ✓ {t}
          </div>
        ))}
      </div>
    );
  }
  if (type === "double") {
    const barre = (label: string, v: number, i: number) => {
      const h = ramp(f, a + i * 4, 20, 0, (v / 235) * 190, Easing.out(Easing.back(1.4)));
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 240 }}>
          <div style={{ fontFamily: anton, fontSize: 36, color: "#fff" }}>{Math.round((h / 190) * 235)}</div>
          <div style={{ width: 64, height: h, borderRadius: 10, background: i ? RED : "#fff", boxShadow: i ? `0 0 26px ${RED}` : undefined }} />
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 26, color: "rgba(255,255,255,0.8)", marginTop: 8 }}>{label}</div>
        </div>
      );
    };
    return (
      <div style={{ display: "flex", gap: 40 }}>
        {barre("AV", 210, 0)}
        {barre("AR", 235, 1)}
      </div>
    );
  }
  if (type === "ecran") {
    const d = ramp(f, a, 18, 0, 1, Easing.out(Easing.cubic));
    return (
      <svg width={250} height={190} viewBox="0 0 250 190">
        <rect x={10} y={20} width={230} height={150} rx={16} fill="rgba(255,255,255,0.08)" stroke="#fff" strokeWidth={5} strokeDasharray={760} strokeDashoffset={760 * (1 - ramp(f, a - 4, 14, 0, 1))} />
        <line x1={30} y1={150} x2={30 + 190 * d} y2={150 - 110 * d} stroke={GREEN} strokeWidth={6} strokeLinecap="round" />
        <circle cx={30} cy={150} r={9} fill={GREEN} />
        <circle cx={30 + 190 * d} cy={150 - 110 * d} r={9} fill={GREEN} />
      </svg>
    );
  }
  // batterie
  const seg = Math.floor(ramp(f, a, 22, 0, 4.99, Easing.linear));
  return (
    <svg width={250} height={150} viewBox="0 0 250 150">
      <rect x={8} y={20} width={210} height={110} rx={18} fill="none" stroke="#fff" strokeWidth={7} />
      <rect x={222} y={55} width={18} height={40} rx={6} fill="#fff" />
      {new Array(4).fill(0).map((_, i) => (
        <rect key={i} x={24 + i * 48} y={36} width={40} height={78} rx={8} fill={i < seg ? GREEN : "rgba(255,255,255,0.12)"} />
      ))}
      <path d="M128 30 L98 80 L122 80 L110 122 L150 66 L124 66 Z" fill="#fff" opacity={seg >= 4 ? 1 : 0.6} />
    </svg>
  );
};

const CarteAtout: React.FC<{ a: Atout; i: number }> = ({ a, i }) => {
  const f = useCurrentFrame();
  const entree = ramp(f, 6, 12, 0, 1, Easing.out(Easing.cubic));
  return (
    <>
      {/* titre bénéfice */}
      <div style={{ position: "absolute", top: 330, left: 70, right: 70 }}>
        <div style={{ fontFamily: anton, fontSize: 52, color: GREEN, opacity: ramp(f, 0, 6, 0, 1), filter: ombre, marginBottom: 6 }}>
          {String(i + 1).padStart(2, "0")}
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 34 }}> / 06</span>
        </div>
        <Lignes lignes={a.titre} at={1} taille={150} align="left" ecart={4} interligne={0.98} />
      </div>
      {/* carte verre dépoli */}
      <div
        style={{
          position: "absolute",
          top: 900,
          left: 60,
          right: 60,
          padding: "30px 36px",
          borderRadius: 30,
          background: "rgba(16,18,22,0.42)",
          backdropFilter: "blur(22px) saturate(1.4)",
          WebkitBackdropFilter: "blur(22px) saturate(1.4)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: entree,
          transform: `translateY(${(1 - entree) * 80}px) scale(${0.94 + entree * 0.06})`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: RED }} />
        <div style={{ paddingLeft: 10 }}>
          {a.avant ? <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,0.75)" }}>{a.avant}</div> : null}
          <div style={{ fontFamily: anton, fontSize: a.grand ? 116 : 150, color: "#fff", lineHeight: 1 }}>
            {a.valeur !== undefined ? <Compteur valeur={a.valeur} at={8} dec={a.dec} /> : a.grand}
            <span style={{ color: GREEN, fontSize: 76, marginLeft: 8 }}>{a.unite}</span>
          </div>
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 32, color: "rgba(255,255,255,0.88)", marginTop: 10, maxWidth: 520 }}>{a.detail}</div>
        </div>
        <WidgetAnime type={a.widget} />
      </div>
    </>
  );
};

const Atouts: React.FC = () => {
  const f = useCurrentFrame();
  const n = ATOUTS.length;
  return (
    <AbsoluteFill>
      {ATOUTS.map((a, i) => {
        const debut = i * PAS - (i > 0 ? T : 0);
        const longueur = i === n - 1 ? PAUSE - DEBUT_ATOUTS - i * PAS + T : PAS + (i > 0 ? T : 0);
        const decal = i > 0 ? T : 0;
        return (
          <Sequence key={a.src} from={debut} durationInFrames={longueur}>
            <Plan uid={`at${i}`} src={a.src} dur={longueur} entree={a.entree} zoom={[1.02, 1.12]} />
            <Voile force={0.55} haut={0.55} />
            <Sequence from={decal}>
              <CarteAtout a={a} i={i} />
              <Visee />
              <Flash dur={5} max={0.4} />
            </Sequence>
          </Sequence>
        );
      })}
      {/* progression */}
      <div style={{ position: "absolute", top: 270, left: 70, right: 70, display: "flex", gap: 10 }}>
        {ATOUTS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 8, borderRadius: 6, background: "rgba(255,255,255,0.28)", overflow: "hidden" }}>
            <div style={{ width: `${interpolate(f, [i * PAS, (i + 1) * PAS], [0, 100], clamp)}%`, height: "100%", background: GREEN }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* =========================================================================================
   4. Usages (22,4 – 26,3 s, pause musicale) : ambiance cinéma
   ========================================================================================= */

const DEBUT_USAGES = PAUSE - T;

const Usages: React.FC = () => {
  return (
    <AbsoluteFill>
      <Plan uid="us" src="16-cliente" dur={125} entree="fondu" zoom={[1.0, 1.08]} />
      <Voile force={0.62} haut={0.3} />
      <div style={{ position: "absolute", top: 520, left: 80, right: 80 }}>
        <Lignes lignes={["LE MATIN *AU CHAMP.*"]} at={12} taille={92} align="left" />
        <Lignes lignes={["L'APRÈS-MIDI *EN FORÊT.*"]} at={40} taille={92} align="left" />
        <Lignes lignes={["LE WEEK-END *EN BALADE.*"]} at={68} taille={92} align="left" />
      </div>
      <Slam texte="UN SEUL QUAD." at={96} taille={150} couleur={GREEN} top={960} />
      <Bandes at={0} h={150} />
      <Fuite at={0} dur={50} teinte="255,150,60" />
    </AbsoluteFill>
  );
};

/* =========================================================================================
   5. Tampons (26,3 – 29,14 s) : homologation et garantie
   ========================================================================================= */

export const Tampon: React.FC<{ uid: string; src: string; lignes: [string, string]; sous: string; frappe: number }> = ({ uid, src, lignes, sous, frappe }) => {
  const f = useCurrentFrame();
  const s = f < frappe ? 0 : ramp(f, frappe, 6, 2.8, 1, Easing.in(Easing.quad));
  const rot = ramp(f, frappe, 6, -16, -5, Easing.in(Easing.quad));
  return (
    <AbsoluteFill style={{ transform: secousse(f, [frappe + 6], 22, 9) }}>
      <Plan uid={uid} src={src} dur={42 + T} entree="whipG" sombre={0.25} />
      <Voile force={0.5} />
      {/* poussière à l'impact */}
      {new Array(26).fill(0).map((_, i) => {
        const t = (f - frappe - 6) / 18;
        if (t < 0 || t > 1) return null;
        const ang = random(`pa${uid}${i}`) * Math.PI * 2;
        const d = (180 + random(`pd${uid}${i}`) * 380) * Math.sqrt(t);
        const taille = 10 + random(`ps${uid}${i}`) * 14;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: W / 2 + Math.cos(ang) * d * 1.4,
              top: 880 + Math.sin(ang) * d * 0.7,
              width: taille,
              height: taille,
              borderRadius: "50%",
              background: i % 3 ? "rgba(255,255,255,0.8)" : GREEN,
              opacity: 1 - t,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", top: 660, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            border: `10px solid ${GREEN}`,
            borderRadius: 18,
            padding: "14px 48px 22px",
            background: "rgba(13,14,17,0.55)",
            textAlign: "center",
            transform: `scale(${s}) rotate(${rot}deg)`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontFamily: anton, fontSize: 96, color: "#fff", lineHeight: 1.05 }}>{lignes[0]}</div>
          <div style={{ fontFamily: anton, fontSize: 170, color: GREEN, lineHeight: 1 }}>{lignes[1]}</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1110, left: 0, right: 0 }}>
        <Lignes lignes={[sous]} at={frappe + 10} taille={44} police={manrope} graisse={800} />
      </div>
      <Flash at={frappe + 6} dur={6} max={0.5} />
    </AbsoluteFill>
  );
};

/* =========================================================================================
   6. Prix (29,14 – 34,5 s) : second drop
   ========================================================================================= */

export const Prix: React.FC = () => {
  const f = useCurrentFrame();
  const taille = 290;
  const style: React.CSSProperties = { fontFamily: anton, fontSize: taille, color: "#fff", lineHeight: 1.05 };
  return (
    <AbsoluteFill style={{ transform: secousse(f, [0], 30, 12) }}>
      <Plan uid="px" src="19-prix-orbite" dur={161} entree="zoom" zoom={[1.06, 1.18]} sombre={0.4} />
      <Voile force={0.5} />
      <div style={{ position: "absolute", top: 470, left: 0, right: 0 }}>
        <Lignes lignes={["TOUT ÇA POUR"]} at={3} taille={96} />
      </div>
      <div style={{ position: "absolute", top: 600, left: 0, right: 0, display: "flex", justifyContent: "center", filter: ombre }}>
        <div style={{ ...style, display: "flex" }}>
          <Rouleau chiffre={5} at={6} taille={taille} uid="p1" />
          <span style={{ width: 50 }} />
          <Rouleau chiffre={2} at={10} taille={taille} uid="p2" />
          <Rouleau chiffre={9} at={14} taille={taille} uid="p3" />
          <Rouleau chiffre={9} at={18} taille={taille} uid="p4" />
          <span style={{ marginLeft: 26, transform: `scale(${popIn(f, 40)})`, display: "inline-block", color: GREEN }}>€</span>
        </div>
      </div>
      {/* reflet sur le prix */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: 0,
          right: 0,
          height: taille * 1.05,
          background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)`,
          backgroundSize: "300% 100%",
          backgroundPosition: `${ramp(f, 50, 24, 120, -20, Easing.inOut(Easing.cubic))}% 0`,
          mixBlendMode: "overlay",
        }}
      />
      <div style={{ position: "absolute", top: 920, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ background: RED, color: "#fff", fontFamily: anton, fontSize: 60, padding: "2px 30px", transform: `scale(${popIn(f, 44)}) rotate(-3deg)` }}>TTC</div>
      </div>
      <div style={{ position: "absolute", top: 1040, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: manrope, fontWeight: 800, fontSize: 46, color: "#fff", filter: ombre, opacity: ramp(f, 58, 8, 0, 1) }}>PAYEZ EN</span>
        {["4X", "10X", "12X"].map((t, i) => (
          <span
            key={t}
            style={{
              fontFamily: anton,
              fontSize: 64,
              color: INK,
              background: GREEN,
              borderRadius: 12,
              padding: "0 22px",
              transform: `scale(${popIn(f, 62 + i * 6)})`,
              display: "inline-block",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1160, left: 0, right: 0 }}>
        <Lignes lignes={["ou étude de financement sur demande"]} at={86} taille={38} police={manrope} graisse={600} couleur="rgba(255,255,255,0.9)" />
      </div>
      <Flash dur={9} max={1} />
      <Fuite at={4} dur={40} />
    </AbsoluteFill>
  );
};

/* =========================================================================================
   7. Appel à l'action (34,5 – 40 s)
   ========================================================================================= */

export const Appel: React.FC = () => {
  const f = useCurrentFrame() - T;
  const sonne = f > 40 ? Math.sin(f * 1.6) * 14 * (Math.floor((f - 40) / 15) % 2 === 0 ? 1 : 0) : 0;
  const onde = (k: number) => {
    if (f < 40) return null;
    const t = ((f - 40 + k * 15) % 30) / 30;
    return (
      <div
        key={k}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          border: `5px solid ${GREEN}`,
          transform: `scale(${1 + t * 0.35}, ${1 + t * 0.9})`,
          opacity: 0.8 * (1 - t),
        }}
      />
    );
  };
  return (
    <AbsoluteFill>
      <Plan uid="cta" src="20-cta-facade" dur={171} entree="whipG" zoom={[1.0, 1.08]} origine="50% 25%" />
      <Voile force={0.68} haut={0.05} />
      <Sequence from={T}>
        <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center" }}>
          <Lignes lignes={["VENEZ"]} at={2} taille={120} />
          <div style={{ transform: `scale(${ramp(f, 10, 8, 1.5, 1, Easing.out(Easing.quad))})`, opacity: ramp(f, 10, 4, 0, 1), filter: ombre }}>
            <Brillant texte="L'ESSAYER" at={22} base="#ffffff" style={{ fontFamily: anton, fontSize: 210, lineHeight: 1 }} />
          </div>
          <div style={{ marginTop: 18 }}>
            <Lignes lignes={["Essai & devis : appelez l'équipe"]} at={26} taille={44} police={manrope} graisse={800} />
          </div>
        </div>
      </Sequence>
      <div style={{ position: "absolute", top: 985, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${popIn(f, 32)})` }}>
          {[0, 1].map((k) => onde(k))}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 22,
              background: GREEN,
              color: INK,
              padding: "16px 46px",
              borderRadius: 999,
              boxShadow: "0 20px 60px rgba(141,198,63,0.5)",
            }}
          >
            <svg width="66" height="66" viewBox="0 0 24 24" fill={INK} style={{ transform: `rotate(${sonne}deg)` }}>
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
            </svg>
            <span style={{ fontFamily: anton, fontSize: 94, letterSpacing: 2 }}>03 72 79 00 10</span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1150,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          opacity: ramp(f, 48, 8, 0, 1),
          transform: `translateY(${ramp(f, 48, 12, 30, 0)}px)`,
        }}
      >
        <div style={{ background: PLATE, padding: "12px 18px", borderRadius: 14 }}>
          <Img src={staticFile("monsterquad/logo.png")} style={{ width: 280, height: (280 / 340) * 100, display: "block" }} />
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ fontFamily: anton, fontSize: 72, color: "#fff", filter: ombre }}>MONSTERQUAD.FR</span>
          <div style={{ position: "absolute", left: 0, bottom: -4, height: 6, background: RED, width: `${ramp(f, 56, 14, 0, 100)}%` }} />
        </div>
      </div>
      <Flash at={T} dur={6} max={0.5} />
      <Fuite at={T} dur={36} sens={-1} />
    </AbsoluteFill>
  );
};

/* =========================================================================================
   Bruitages
   ========================================================================================= */

type Sfx = { s: string; at: number; v: number };
const SFX: Sfx[] = [
  // accroche
  { s: "whoosh", at: 48, v: 0.55 },
  { s: "impact", at: 79, v: 0.6 },
  { s: "whoosh-court", at: 102, v: 0.5 },
  { s: "whoosh-court", at: 115, v: 0.45 },
  { s: "whoosh-court", at: 128, v: 0.45 },
  { s: "impact", at: 105, v: 0.45 },
  { s: "impact", at: 130, v: 0.45 },
  { s: "impact", at: 155, v: 0.5 },
  { s: "whoosh", at: 162, v: 0.5 },
  { s: "impact", at: 178, v: 0.55 },
  { s: "glitch", at: 199, v: 0.5 },
  { s: "whoosh", at: 225, v: 0.5 },
  { s: "impact", at: 231, v: 0.55 },
  { s: "riser", at: DROP1 - 60, v: 0.6 },
  // drop
  { s: "impact", at: DROP1, v: 0.9 },
  { s: "sub-drop", at: DROP1, v: 0.9 },
  { s: "whoosh", at: DROP1 + 22, v: 0.6 },
  { s: "impact", at: DROP1 + 50, v: 0.5 },
  // équipements
  ...ATOUTS.map((a, i) => ({ s: a.entree === "glitch" ? "glitch" : "whoosh-court", at: DEBUT_ATOUTS + i * PAS - 5, v: 0.5 })),
  // usages, tampons
  { s: "whoosh", at: DEBUT_USAGES - 4, v: 0.35 },
  { s: "whoosh-court", at: 790 - 5, v: 0.45 },
  { s: "tampon", at: 790 + 9, v: 0.75 },
  { s: "whoosh-court", at: 832 - 5, v: 0.45 },
  { s: "tampon", at: 832 + 9, v: 0.75 },
  // prix
  { s: "impact", at: DROP2, v: 0.9 },
  { s: "sub-drop", at: DROP2, v: 0.8 },
  { s: "tic", at: DROP2 + 40, v: 0.5 },
  { s: "tic", at: DROP2 + 44, v: 0.5 },
  { s: "tic", at: DROP2 + 62, v: 0.4 },
  { s: "tic", at: DROP2 + 68, v: 0.4 },
  { s: "tic", at: DROP2 + 74, v: 0.4 },
  // appel
  { s: "whoosh", at: 1035 - 6, v: 0.55 },
  { s: "impact", at: 1035 + 10, v: 0.5 },
];

/* =========================================================================================
   Montage
   ========================================================================================= */

/** Pulsation sur les temps forts après les drops. */
const pulsation = (f: number) => {
  const zones: [number, number][] = [
    [DROP1, PAUSE],
    [DROP2, FIN - 20],
  ];
  for (const [a, b] of zones) {
    if (f >= a && f < b) {
      const k = ((f - a) % (BEAT * 2)) / 6;
      return 1 + Math.max(0, 1 - k) * 0.018;
    }
  }
  return 1;
};

export const MonsterQuadCforceC5: React.FC<{ withAudio: boolean }> = ({ withAudio }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ transform: `scale(${pulsation(f)})` }}>
        <Sequence durationInFrames={DROP1}>
          <Accroche />
        </Sequence>
        <Sequence from={DROP1} durationInFrames={DUREE_REV}>
          <Revelation />
        </Sequence>
        <Sequence from={DEBUT_ATOUTS} durationInFrames={PAUSE - DEBUT_ATOUTS}>
          <Atouts />
        </Sequence>
        <Sequence from={DEBUT_USAGES} durationInFrames={790 - DEBUT_USAGES}>
          <Usages />
        </Sequence>
        <Sequence from={790 - T} durationInFrames={42 + T}>
          <Tampon uid="t1" src="17-t3b-arriere" lignes={["HOMOLOGUÉ", "ROUTE"]} sous="T3b · carte grise 13,76 € HT" frappe={T + 4} />
        </Sequence>
        <Sequence from={832 - T} durationInFrames={42 + T}>
          <Tampon uid="t2" src="18-garantie-profil" lignes={["GARANTIE", "5 ANS"]} sous="Dans le réseau CFMOTO France" frappe={T + 4} />
        </Sequence>
        <Sequence from={DROP2} durationInFrames={1035 - DROP2}>
          <Prix />
        </Sequence>
        <Sequence from={1035 - T} durationInFrames={FIN - 1035 + T}>
          <Appel />
        </Sequence>
      </AbsoluteFill>
      <Grain />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
      {withAudio ? (
        <>
          <Audio
            src={staticFile("monsterquad/musique-protesting-robot-mixkit.mp3")}
            volume={(fr) => interpolate(fr, [0, 3, FIN - 30, FIN], [0, 0.8, 0.8, 0], clamp)}
          />
          {SFX.map((x, i) => (
            <Sequence key={i} from={x.at} durationInFrames={60}>
              <Audio src={staticFile(`monsterquad/sfx/${x.s}.wav`)} volume={x.v} />
            </Sequence>
          ))}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
