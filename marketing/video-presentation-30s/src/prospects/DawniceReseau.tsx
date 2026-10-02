// Vidéo démo de prospection (pas AFROBACK) : campagne « DAWNICE développe son réseau en France ».
// 30 s, vertical 1080 × 1920, pour Meta Ads / Reels. Brief : annonce Codeur 490026 (relevée le 2026-10-02).
// Visuels : photos produit du site dawnicefrance.com, détourées et étalonnées
// (scratchpad dawnice_traitement.py). Les arguments sont ceux du brief, rien n'est inventé.
// La carte est illustrative : aucun territoire n'est présenté comme « couvert ».
// Musique : « Rising Sun » (licence Mixkit), montée continue sur 30 s.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import carte from "./france-departements.json";

const mont = loadMontserrat("normal", { weights: ["500", "600", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;

const W = 1080;
const NAVY = "#08121C";
const NAVY2 = "#0F2233";
const ORANGE = "#F3993E";
const JAUNE = "#FFC94A";
const BLANC = "#FFFFFF";
const GRIS = "rgba(255,255,255,0.72)";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const expoOut = Easing.out(Easing.exp);
const ramp = (f: number, a: number, d: number, from: number, to: number, e = expoOut) =>
  interpolate(f, [a, a + d], [from, to], { ...clamp, easing: e });
const rise = (f: number, at: number, dist = 50): React.CSSProperties => ({
  opacity: ramp(f, at, 12, 0, 1),
  transform: `translateY(${ramp(f, at, 18, dist, 0)}px)`,
});
const src = (n: string) => staticFile(`dawnice/${n}`);

/* Dimensions des visuels traités (px) */
const DIM: Record<string, [number, number]> = {
  "batterie-21kwh-face.png": [1029, 1588],
  "batterie-21kwh-34.png": [943, 1661],
  "batterie-21kwh-34b.png": [1311, 1800],
  "batterie-murale.png": [1029, 1800],
  "batterie-murale-34.png": [1004, 1800],
  "armoire-112kwh.png": [624, 1096],
  "armoire-112kwh-ouverte.png": [620, 1096],
  "armoire-112kwh-34.png": [720, 1106],
};

/* ---------- Fond : bleu nuit, halo orange qui respire, fines lignes d'énergie ---------- */

const Fond: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY2} 55%, ${NAVY} 100%)`, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -300,
          top: 500 + Math.sin(f / 70) * 60,
          width: 1700,
          height: 1100,
          background: `radial-gradient(ellipse at center, rgba(243,153,62,0.20) 0%, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -400,
          top: -200,
          width: 1300,
          height: 900,
          background: `radial-gradient(ellipse at center, rgba(16,132,116,0.22) 0%, transparent 65%)`,
        }}
      />
      {new Array(14).fill(0).map((_, i) => {
        const y = 120 + i * 130;
        const x = ((f * (3 + random(`v${i}`) * 5) + random(`o${i}`) * 2000) % 2400) - 1200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: x,
              width: 500,
              height: 2,
              background: `linear-gradient(90deg, transparent, rgba(243,153,62,${0.12 + random(`a${i}`) * 0.18}), transparent)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Produit mis en scène : ombre, reflet sur sol brillant, halo, reflet lumineux qui balaie ---------- */

const Produit: React.FC<{
  n: string;
  h: number;
  x: number;
  y: number; // position du pied du produit
  sweepAt?: number;
  glow?: number;
  style?: React.CSSProperties;
}> = ({ n, h, x, y, sweepAt = 10, glow = 1, style }) => {
  const f = useCurrentFrame();
  const [iw, ih] = DIM[n];
  const w = (h / ih) * iw;
  const sweep = interpolate(f, [sweepAt, sweepAt + 26], [-60, 160], clamp);
  const mask: React.CSSProperties = {
    WebkitMaskImage: `url(${src(n)})`,
    maskImage: `url(${src(n)})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, ...style }}>
      {/* halo derrière */}
      <div
        style={{
          position: "absolute",
          left: -w * 0.5,
          top: h * 0.05,
          width: w * 2,
          height: h,
          background: `radial-gradient(ellipse at center, rgba(243,153,62,${0.32 * glow}) 0%, transparent 60%)`,
          filter: "blur(10px)",
        }}
      />
      {/* ombre de contact */}
      <div
        style={{
          position: "absolute",
          left: -w * 0.08,
          top: h - 26,
          width: w * 1.16,
          height: 52,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, transparent 70%)",
        }}
      />
      {/* reflet au sol */}
      <Img
        src={src(n)}
        style={{
          position: "absolute",
          left: 0,
          top: h,
          width: w,
          height: h,
          transform: "scaleY(-1)",
          opacity: 0.22,
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 35%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 35%)",
        }}
      />
      <Img src={src(n)} style={{ position: "absolute", inset: 0, width: w, height: h, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.55))" }} />
      {/* liseré chaud côté gauche (lumière d'ambiance orange) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...mask,
          background: "linear-gradient(90deg, rgba(243,153,62,0.28) 0%, transparent 22%, transparent 80%, rgba(16,132,116,0.18) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      {/* reflet lumineux qui balaie */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...mask,
          background: `linear-gradient(105deg, transparent ${sweep - 18}%, rgba(255,255,255,0.75) ${sweep}%, transparent ${sweep + 18}%)`,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

/* ---------- Texte ---------- */

const Gros: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 110,
  color = BLANC,
  style,
}) => (
  <div style={{ fontFamily: mont, fontWeight: 900, fontSize: size, color, lineHeight: 1.02, letterSpacing: -1, textTransform: "uppercase", ...style }}>
    {children}
  </div>
);

const Logo: React.FC<{ w: number; style?: React.CSSProperties }> = ({ w, style }) => (
  <Img src={src("logo-blanc.png")} style={{ width: w, height: (w / 600) * 173, ...style }} />
);

/* Transition : éclair horizontal orange */
const Eclair: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  if (f < at - 2 || f > at + 12) return null;
  const x = interpolate(f, [at - 2, at + 10], [-W, W], clamp);
  const o = interpolate(f, [at - 2, at + 2, at + 12], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: x, width: W, height: "100%", background: `linear-gradient(90deg, transparent, rgba(255,201,74,${0.55 * o}), transparent)` }} />
      <AbsoluteFill style={{ background: BLANC, opacity: o * 0.18 }} />
    </AbsoluteFill>
  );
};

/* ---------- 1. Accroche (0 – 3,2 s) ---------- */

const Accroche: React.FC = () => {
  const f = useCurrentFrame();
  const ligne = ramp(f, 4, 22, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px" }}>
      <div style={{ height: 6, width: `${ligne * 100}%`, background: `linear-gradient(90deg, ${ORANGE}, ${JAUNE})`, borderRadius: 3, boxShadow: `0 0 30px ${ORANGE}` }} />
      <div style={{ marginTop: 50, fontFamily: mont, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: ORANGE, ...rise(f, 10) }}>
        PROFESSIONNELS DU
      </div>
      <Gros size={128} style={{ marginTop: 14, ...rise(f, 16) }}>
        Photo&shy;voltaïque
      </Gros>
      <div style={{ marginTop: 60, fontFamily: mont, fontWeight: 600, fontSize: 54, color: GRIS, lineHeight: 1.3, ...rise(f, 44) }}>
        Une annonce
        <br />
        <span style={{ color: BLANC, fontWeight: 800 }}>vous concerne.</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2. La gamme (3,2 – 7,2 s) ---------- */

const Gamme: React.FC = () => {
  const f = useCurrentFrame();
  // image 2048 × 1152 : on la cadre pour que la gamme occupe toute la largeur
  const hImg = 1300;
  const wImg = (hImg / 1152) * 2048;
  const sc = interpolate(f, [0, 120], [1.18, 1.0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const px = interpolate(f, [0, 120], [40, -20], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 380, left: (W - wImg) / 2 + px, width: wImg, height: hImg, transform: `scale(${sc})`, transformOrigin: "50% 45%" }}>
        <Img src={src("gamme-complete.jpg")} style={{ width: wImg, height: hImg }} />
      </div>
      {/* fondus haut et bas vers le bleu nuit */}
      <div style={{ position: "absolute", top: 380, left: 0, width: W, height: 420, background: `linear-gradient(180deg, ${NAVY} 0%, rgba(8,18,28,0) 100%)` }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: W, height: 382, background: NAVY }} />
      <div style={{ position: "absolute", top: 1380, left: 0, width: W, height: 540, background: `linear-gradient(0deg, ${NAVY} 25%, rgba(8,18,28,0) 100%)` }} />
      {/* balayage lumineux */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(110deg, transparent ${ramp(f, 20, 40, -30, 130, Easing.inOut(Easing.cubic)) - 12}%, rgba(255,255,255,0.18) ${ramp(f, 20, 40, -30, 130, Easing.inOut(Easing.cubic))}%, transparent ${ramp(f, 20, 40, -30, 130, Easing.inOut(Easing.cubic)) + 12}%)`,
          mixBlendMode: "screen",
        }}
      />
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center" }}>
        <div style={{ opacity: ramp(f, 4, 12, 0, 1), transform: `scale(${ramp(f, 4, 18, 0.85, 1)})` }}>
          <Logo w={560} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1450, width: "100%", textAlign: "center", padding: "0 60px" }}>
        <Gros size={84} style={rise(f, 18)}>
          ouvre son réseau
        </Gros>
        <Gros size={84} color={ORANGE} style={rise(f, 26)}>
          en France
        </Gros>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 3. Les cibles (7,2 – 11 s) ---------- */

const CIBLES: [string, string, number][] = [
  ["Installateurs.", "batterie-murale.png", 760],
  ["Distributeurs.", "batterie-21kwh-34b.png", 740],
  ["Grossistes.", "armoire-112kwh.png", 780],
];

const Cibles: React.FC = () => {
  const f = useCurrentFrame();
  const pas = 38;
  const i = Math.min(2, Math.floor(f / pas));
  const lf = f - i * pas;
  const [mot, n, h] = CIBLES[i];
  return (
    <AbsoluteFill>
      <Produit
        n={n}
        h={h}
        x={W / 2 + ramp(lf, 0, 16, 300, 0)}
        y={1400}
        sweepAt={6}
        style={{ opacity: ramp(lf, 0, 8, 0, 1) }}
      />
      <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center" }}>
        {CIBLES.map(([m], k) => (
          <div
            key={m}
            style={{
              fontFamily: mont,
              fontWeight: 900,
              fontSize: 92,
              lineHeight: 1.1,
              textTransform: "uppercase",
              color: k === i ? BLANC : "rgba(255,255,255,0.18)",
              transform: `scale(${k === i ? ramp(lf, 0, 8, 1.15, 1) : 0.92})`,
              opacity: f >= k * pas ? 1 : 0,
            }}
          >
            {m}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1520, width: "100%", textAlign: "center", fontFamily: mont, fontWeight: 600, fontSize: 44, color: GRIS }}>
        {mot === "Installateurs." ? "Batteries résidentielles 5 à 21 kWh" : mot === "Distributeurs." ? "Stockage mobile 21 kWh" : "Armoires industrielles 112 kWh"}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Carte de France (départements) ---------- */

type Dep = { code: string; nom: string; d: string; cx: number; cy: number };
const DEPS = (carte as { w: number; h: number; deps: Dep[] }).deps;
const CH = (carte as { h: number }).h;

const Carte: React.FC<{ largeur: number; mode: "vague" | "scan"; t0?: number }> = ({ largeur, mode, t0 = 0 }) => {
  const f = useCurrentFrame() - t0;
  const trace = ramp(f, 0, 30, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <svg width={largeur} height={(largeur / 1000) * CH} viewBox={`0 0 1000 ${CH}`} style={{ overflow: "visible" }}>
      <defs>
        <filter id="lueur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {DEPS.map((d) => {
        let fill = "rgba(255,255,255,0.04)";
        let stroke = `rgba(255,255,255,${0.12 + 0.3 * trace})`;
        let lueur = false;
        if (mode === "vague") {
          // vague du nord vers le sud
          const at = 26 + (d.cy / CH) * 50;
          const k = ramp(f, at, 14, 0, 1);
          const pulse = Math.max(0, 1 - Math.abs(f - at - 10) / 14);
          fill = `rgba(243,153,62,${0.06 + 0.12 * k + 0.5 * pulse})`;
          stroke = `rgba(255,201,74,${0.25 + 0.5 * pulse})`;
        } else {
          // repérage : des secteurs s'allument puis s'éteignent, comme une recherche
          const r = random(`scan-${d.code}`);
          const at = 8 + r * 50;
          const on = Math.max(0, 1 - Math.abs(f - at) / 10);
          fill = `rgba(243,153,62,${0.05 + 0.55 * on})`;
          stroke = `rgba(255,201,74,${0.2 + 0.6 * on})`;
          lueur = on > 0.5;
        }
        return <path key={d.code} d={d.d} fill={fill} stroke={stroke} strokeWidth={1.4} strokeLinejoin="round" filter={lueur ? "url(#lueur)" : undefined} />;
      })}
    </svg>
  );
};

/* ---------- 4. Territoire (11 – 15 s) ---------- */

const Territoire: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center", padding: "0 70px" }}>
        <Gros size={74} style={rise(f, 2)}>
          Et si votre secteur
        </Gros>
        <Gros size={74} style={rise(f, 8)}>
          devenait votre
        </Gros>
        <Gros size={104} color={ORANGE} style={rise(f, 14)}>
          territoire ?
        </Gros>
      </div>
      <div style={{ position: "absolute", top: 700, left: 90, opacity: ramp(f, 0, 14, 0, 1), transform: `scale(${ramp(f, 0, 120, 0.94, 1.02, Easing.linear)})` }}>
        <Carte largeur={900} mode="vague" />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 5. Les avantages (15 – 24 s) ---------- */

const Icone: React.FC<{ k: number }> = ({ k }) => {
  const p = { fill: "none", stroke: ORANGE, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const icones = [
    // usine -> vous
    <g key="0"><path {...p} d="M8 54V30l14 8V30l14 8V18h16v36z" /><path {...p} d="M58 40h10m-5-5 5 5-5 5" /></g>,
    // camion
    <g key="1"><path {...p} d="M6 20h34v26H6zM40 30h12l8 8v8H40z" /><circle {...p} cx="18" cy="50" r="5" /><circle {...p} cx="50" cy="50" r="5" /></g>,
    // clé
    <g key="2"><path {...p} d="M44 10a12 12 0 0 0-11 16L12 47l5 5 21-21a12 12 0 0 0 16-11l-7 4-6-6z" /></g>,
    // poignée de main / accompagnement
    <g key="3"><circle {...p} cx="22" cy="20" r="8" /><circle {...p} cx="44" cy="20" r="8" /><path {...p} d="M8 52c0-10 6-16 14-16s14 6 14 16M30 52c0-10 6-16 14-16s14 6 14 16" /></g>,
    // cible / prospects
    <g key="4"><circle {...p} cx="32" cy="32" r="22" /><circle {...p} cx="32" cy="32" r="12" /><circle cx="32" cy="32" r="4" fill={ORANGE} /></g>,
    // épingle de carte
    <g key="5"><path {...p} d="M32 58S12 38 12 24a20 20 0 0 1 40 0c0 14-20 34-20 34z" /><circle {...p} cx="32" cy="24" r="7" /></g>,
  ];
  return <svg width={110} height={110} viewBox="0 0 64 64">{icones[k]}</svg>;
};

const AVANTAGES: [string, string, string][] = [
  ["Accès direct fabricant", "Sans intermédiaire", "batterie-murale-34.png"],
  ["Stock en France", "Livraison 24 / 48 h", "batterie-21kwh-34.png"],
  ["SAV & support technique", "En France", "armoire-112kwh-ouverte.png"],
  ["Accompagnement", "Commercial et formation", "batterie-21kwh-face.png"],
  ["Prospects transmis", "Des leads pour votre réseau", "batterie-murale.png"],
  ["Exclusivité territoriale", "Selon secteur et engagement", "armoire-112kwh-34.png"],
];
const PAS_AV = 45;

const Avantages: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(AVANTAGES.length - 1, Math.floor(f / PAS_AV));
  const lf = f - i * PAS_AV;
  const [titre, sous, n] = AVANTAGES[i];
  const h = n.startsWith("armoire") ? 820 : 740;
  return (
    <AbsoluteFill>
      <Produit
        n={n}
        h={h}
        x={W / 2 + ramp(lf, 0, 18, i % 2 ? -260 : 260, 0)}
        y={1080}
        sweepAt={8}
        style={{ opacity: ramp(lf, 0, 8, 0, 1), transform: `scale(${ramp(lf, 0, PAS_AV, 0.96, 1.03, Easing.linear)})`, transformOrigin: "50% 100%" }}
      />
      {/* carte d'avantage */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1250,
          padding: "40px 46px",
          borderRadius: 34,
          background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
          border: "1.5px solid rgba(255,255,255,0.16)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          gap: 34,
          transform: `translateY(${ramp(lf, 0, 14, 80, 0)}px)`,
          opacity: ramp(lf, 0, 10, 0, 1),
        }}
      >
        <div style={{ flexShrink: 0, width: 150, height: 150, borderRadius: 30, background: "rgba(243,153,62,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icone k={i} />
        </div>
        <div>
          <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 58, color: BLANC, lineHeight: 1.05, textTransform: "uppercase" }}>{titre}</div>
          <div style={{ marginTop: 12, fontFamily: mont, fontWeight: 600, fontSize: 40, color: JAUNE, opacity: ramp(lf, 6, 10, 0, 1) }}>{sous}</div>
        </div>
      </div>
      {/* progression */}
      <div style={{ position: "absolute", top: 1620, width: "100%", display: "flex", justifyContent: "center", gap: 16 }}>
        {AVANTAGES.map((_, k) => (
          <div key={k} style={{ width: k === i ? 60 : 16, height: 16, borderRadius: 8, background: k <= i ? ORANGE : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", fontFamily: mont, fontWeight: 800, fontSize: 36, letterSpacing: 8, color: ORANGE }}>
        PARTENAIRE DAWNICE
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 6. La question (24 – 27 s) ---------- */

const Question: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 240, left: 90, opacity: ramp(f, 0, 10, 0, 1) }}>
        <Carte largeur={900} mode="scan" />
      </div>
      <div style={{ position: "absolute", top: 1180, width: "100%", textAlign: "center" }}>
        <Gros size={64} style={{ whiteSpace: "nowrap", ...rise(f, 10) }}>
          Votre secteur est-il
        </Gros>
        <Gros size={74} color={ORANGE} style={{ whiteSpace: "nowrap", ...rise(f, 18) }}>
          encore disponible ?
        </Gros>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 7. Appel à l'action (27 – 30 s) ---------- */

const Final: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(Math.max(0, f - 30) / 4) * 0.025;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center" }}>
        <Gros size={100} style={rise(f, 0)}>
          Devenez
        </Gros>
        <Gros size={100} style={rise(f, 6)}>
          partenaire
        </Gros>
      </div>
      <div style={{ position: "absolute", top: 640, opacity: ramp(f, 12, 12, 0, 1), transform: `scale(${ramp(f, 12, 20, 0.8, 1)})` }}>
        <Logo w={760} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1050,
          padding: "34px 60px",
          borderRadius: 60,
          background: `linear-gradient(90deg, ${ORANGE}, ${JAUNE})`,
          fontFamily: mont,
          fontWeight: 900,
          fontSize: 50,
          color: NAVY,
          textTransform: "uppercase",
          boxShadow: `0 20px 60px rgba(243,153,62,0.45)`,
          transform: `scale(${f < 24 ? ramp(f, 20, 8, 0, 1) : pulse})`,
        }}
      >
        Espace pro &amp; partenaires
      </div>
      <div style={{ position: "absolute", top: 1230, fontFamily: mont, fontWeight: 700, fontSize: 52, color: BLANC, ...rise(f, 30, 20) }}>
        dawnicefrance.com
      </div>
      <div style={{ position: "absolute", bottom: 80, fontFamily: mont, fontWeight: 500, fontSize: 24, color: "rgba(255,255,255,0.4)", ...rise(f, 40, 10) }}>
        Vidéo démo · motion design Yannick NSANA MADOU
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */

const SCENES: [React.FC, number, number][] = [
  [Accroche, 0, 96],
  [Gamme, 96, 120],
  [Cibles, 216, 114],
  [Territoire, 330, 120],
  [Avantages, 450, 270],
  [Question, 720, 90],
  [Final, 810, 90],
];

export const DawniceReseau: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Fond />
    {SCENES.map(([Scene, from, dur]) => (
      <Sequence key={from} from={from} durationInFrames={dur}>
        <Scene />
      </Sequence>
    ))}
    {SCENES.slice(1).map(([, from]) => (
      <Eclair key={from} at={from} />
    ))}
    {withAudio ? (
      <Audio src={src("musique-rising-sun-mixkit.mp3")} volume={(fr) => interpolate(fr, [0, 8, 870, 900], [0, 0.9, 0.9, 0], clamp)} />
    ) : null}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
  </AbsoluteFill>
);
