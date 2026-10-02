/**
 * Accessoires dessinés de la vidéo « La balance » (Charles Atangana) :
 * balance de laiton à deux plateaux (objets qui tombent, physique simple), pierres, œuf, livre,
 * motte de latérite ; ardoise et craie ; pièces ; tente de campagne à l'aube ; livre de cuir qui s'ouvre ;
 * sous-bois et empreintes dans la terre rouge ; route de latérite, école, dispensaire, église.
 */
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { W, H, cinzel, manrope } from "../theme";

export const AT = {
  brass: "#C9A25A",
  brassLight: "#FFE6A8",
  brassDark: "#6B4E1F",
  brassDeep: "#3E2C10",
  ivory: "#F3E9D8",
  sand: "#E7D3AE",
  terra: "#C2583A",
  earth: "#8A3B22",
  ink: "#0B0806",
  olive: "#3E4A2C",
  gold: "#F0C36B",
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/* ---------- Fond clair de la balance ---------- */

export const SandStage: React.FC<{ f: number; dim?: number }> = ({ f, dim = 0 }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #F6E8C8 0%, #EED8AA 38%, #E2C48E 62%, #C99E62 63%, #D9B47C 75%, #B98A52 100%)" }} />
    {/* grand rai de lumière depuis le haut à gauche */}
    <div style={{ position: "absolute", left: -300, top: -200, width: 900, height: 2600, transform: "rotate(-24deg)", background: "linear-gradient(90deg, rgba(255,250,230,0) 0%, rgba(255,250,230,0.45) 50%, rgba(255,250,230,0) 100%)", filter: "blur(30px)" }} />
    {/* motifs géométriques dorés discrets (frise) */}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.16 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 96 - 20} 1205)`}>
          <path d="M 0 0 L 48 -28 L 96 0 L 48 28 Z" fill="none" stroke="#8C6430" strokeWidth={3} />
          <path d="M 24 0 L 48 -14 L 72 0 L 48 14 Z" fill="#8C6430" />
        </g>
      ))}
    </svg>
    {/* poussière dorée en suspension */}
    {Array.from({ length: 34 }).map((_, i) => {
      const x = (random(`sd${i}`) * W + f * (0.4 + random(`sv${i}`) * 0.8)) % W;
      const y = 200 + ((random(`sy${i}`) * 1400 - f * (0.3 + random(`sw${i}`) * 0.6) + 1400) % 1400);
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: 5, height: 5, borderRadius: 3, background: "#FFF6D8", opacity: 0.35 + 0.5 * random(`so${i}`), boxShadow: "0 0 8px #FFD58A" }} />;
    })}
    {dim > 0 ? <AbsoluteFill style={{ background: `rgba(20,12,4,${dim})` }} /> : null}
  </AbsoluteFill>
);

/* ---------- Objets des plateaux (dessinés autour de leur point d'appui, en bas au centre) ---------- */

export const StoneSvg: React.FC<{ r: number; seed: string }> = ({ r, seed }) => {
  const n = 9;
  const pts = Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.82 + random(`${seed}${i}`) * 0.3);
    return [Math.cos(a) * rr * 1.15, -r * 0.85 + Math.sin(a) * rr * 0.85];
  });
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z";
  return (
    <g>
      <ellipse cx={0} cy={2} rx={r * 1.2} ry={r * 0.22} fill="rgba(30,18,6,0.45)" />
      <path d={d} fill={`url(#at-stone)`} stroke="#141414" strokeWidth={2} strokeLinejoin="round" />
      <ellipse cx={-r * 0.35} cy={-r * 1.15} rx={r * 0.38} ry={r * 0.18} fill="rgba(255,255,255,0.18)" />
    </g>
  );
};

export const EggSvg: React.FC<{ r: number }> = ({ r }) => (
  <g>
    <ellipse cx={0} cy={2} rx={r * 0.9} ry={r * 0.2} fill="rgba(40,24,8,0.45)" />
    <path d={`M 0 ${-r * 2.3} C ${r * 0.95} ${-r * 2.3} ${r * 1.0} ${-r * 0.2} 0 0 C ${-r * 1.0} ${-r * 0.2} ${-r * 0.95} ${-r * 2.3} 0 ${-r * 2.3} Z`} fill="url(#at-egg)" stroke="#BFA88A" strokeWidth={1.5} />
    <ellipse cx={-r * 0.32} cy={-r * 1.55} rx={r * 0.18} ry={r * 0.4} fill="rgba(255,255,255,0.6)" />
  </g>
);

export const BookSvg: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 0.3;
  return (
    <g>
      <ellipse cx={0} cy={2} rx={w * 0.55} ry={w * 0.06} fill="rgba(30,18,6,0.45)" />
      {/* tranche des pages */}
      <rect x={-w / 2 + 6} y={-h + 8} width={w - 12} height={h - 14} fill="#F1E4C6" />
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={-w / 2 + 8} x2={w / 2 - 8} y1={-h + 12 + i * ((h - 18) / 6)} y2={-h + 12 + i * ((h - 18) / 6)} stroke="#CDBB98" strokeWidth={1} />
      ))}
      {/* couvertures cuir */}
      <rect x={-w / 2} y={-h} width={w} height={10} rx={3} fill="url(#at-leather)" />
      <rect x={-w / 2} y={-8} width={w} height={8} rx={3} fill="#4A2412" />
      <rect x={-w / 2} y={-h} width={14} height={h} rx={4} fill="url(#at-leather)" />
      {[0.25, 0.5, 0.75].map((k) => (
        <rect key={k} x={-w / 2 - 1} y={-h + h * k - 3} width={16} height={6} rx={2} fill="#2E140A" />
      ))}
      <rect x={w / 2 - 12} y={-h * 0.62} width={14} height={h * 0.3} rx={3} fill="url(#at-brass)" />
    </g>
  );
};

/** Motte de latérite avec un bout de route gravé (la route qui tombe dans le plateau). */
export const RoadSlabSvg: React.FC<{ w: number }> = ({ w }) => {
  const h = w * 0.34;
  return (
    <g>
      <ellipse cx={0} cy={2} rx={w * 0.55} ry={w * 0.07} fill="rgba(30,18,6,0.45)" />
      <path d={`M ${-w / 2} 0 L ${-w / 2} ${-h * 0.55} L ${-w * 0.3} ${-h} L ${w / 2} ${-h} L ${w / 2} ${-h * 0.45} L ${w * 0.3} 0 Z`} fill="#8A3B22" />
      <path d={`M ${-w / 2} ${-h * 0.55} L ${-w * 0.3} ${-h} L ${w / 2} ${-h} L ${w * 0.3} ${-h * 0.55} Z`} fill="#C2683E" />
      <path d={`M ${-w * 0.42} ${-h * 0.6} L ${-w * 0.22} ${-h * 0.96} L ${w * 0.1} ${-h * 0.96} L ${-w * 0.05} ${-h * 0.6} Z`} fill="#D89A62" opacity={0.85} />
      <path d={`M ${w * 0.3} 0 L ${w / 2} ${-h * 0.45} L ${w / 2} ${-h} L ${w * 0.3} ${-h * 0.55} Z`} fill="#5E2614" />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle key={i} cx={(random(`rs${i}`) - 0.5) * w * 0.8} cy={-h * 0.2 - random(`rt${i}`) * h * 0.25} r={2 + random(`rr${i}`) * 3} fill="rgba(50,16,6,0.6)" />
      ))}
    </g>
  );
};

export type PanItem = { kind: "stone" | "egg" | "book" | "road"; at: number; dx: number; dy?: number; size: number; seed?: string; rot?: number };

const FALL = 0.42;

const ItemSvg: React.FC<{ it: PanItem }> = ({ it }) =>
  it.kind === "stone" ? <StoneSvg r={it.size} seed={it.seed ?? "s"} /> : it.kind === "egg" ? <EggSvg r={it.size} /> : it.kind === "book" ? <BookSvg w={it.size} /> : <RoadSlabSvg w={it.size} />;

const PanItems: React.FC<{ items: PanItem[]; t: number }> = ({ items, t }) => (
  <>
    {items.map((it, i) => {
      if (t < it.at - FALL) return null;
      const p = clamp01((t - (it.at - FALL)) / FALL);
      const yFall = -620 * (1 - p * p);
      const after = t - it.at;
      const bounce = after > 0 ? -14 * Math.exp(-9 * after) * Math.abs(Math.sin(after * 22)) : 0;
      const rot = (it.rot ?? 0) * (1 - p) + (after > 0 ? 0 : 0);
      const puff = after > 0 && after < 0.5 ? after / 0.5 : -1;
      return (
        <g key={i} transform={`translate(${it.dx} ${(it.dy ?? 0) + yFall + bounce})`} opacity={clamp01(p * 3)}>
          <g transform={`rotate(${rot})`}>
            <ItemSvg it={it} />
          </g>
          {puff >= 0
            ? [-1, 1].map((sgn) => (
                <circle key={sgn} cx={sgn * (20 + puff * 70)} cy={-10 - puff * 20} r={10 + puff * 26} fill={`rgba(235,215,175,${0.55 * (1 - puff)})`} />
              ))
            : null}
        </g>
      );
    })}
  </>
);

/* ---------- La balance de laiton ---------- */

export const BEAM = 340;
export const CHAIN = 330;
export const PAN_RX = 150;

export const BalanceDefs: React.FC = () => (
  <defs>
    <linearGradient id="at-brass" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#FFF0C0" />
      <stop offset="0.25" stopColor="#E6C072" />
      <stop offset="0.6" stopColor="#B08640" />
      <stop offset="1" stopColor="#5E431A" />
    </linearGradient>
    <linearGradient id="at-brass-h" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor="#5E431A" />
      <stop offset="0.3" stopColor="#E6C072" />
      <stop offset="0.45" stopColor="#FFF0C0" />
      <stop offset="0.7" stopColor="#B08640" />
      <stop offset="1" stopColor="#4A3412" />
    </linearGradient>
    <radialGradient id="at-dish" cx="0.4" cy="0.25" r="0.9">
      <stop offset="0" stopColor="#FFF0C0" />
      <stop offset="0.35" stopColor="#D9B062" />
      <stop offset="0.8" stopColor="#8A6428" />
      <stop offset="1" stopColor="#4A3412" />
    </radialGradient>
    <radialGradient id="at-dish-in" cx="0.5" cy="0.6" r="0.7">
      <stop offset="0" stopColor="#B88E48" />
      <stop offset="1" stopColor="#6B4E1F" />
    </radialGradient>
    <radialGradient id="at-stone" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#6A6866" />
      <stop offset="0.5" stopColor="#3A3836" />
      <stop offset="1" stopColor="#141312" />
    </radialGradient>
    <radialGradient id="at-egg" cx="0.35" cy="0.3" r="0.85">
      <stop offset="0" stopColor="#FFFDF6" />
      <stop offset="0.6" stopColor="#F1E4CC" />
      <stop offset="1" stopColor="#C9B290" />
    </radialGradient>
    <linearGradient id="at-leather" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stopColor="#8A4A26" />
      <stop offset="0.5" stopColor="#6A3418" />
      <stop offset="1" stopColor="#3A1A0A" />
    </linearGradient>
    <clipPath id="at-medal">
      <circle cx={0} cy={0} r={78} />
    </clipPath>
    <filter id="at-blur8">
      <feGaussianBlur stdDeviation="8" />
    </filter>
  </defs>
);

const Chain: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A3412" strokeWidth={9} strokeDasharray="14 6" strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E6C072" strokeWidth={4} strokeDasharray="10 10" strokeLinecap="round" />
  </g>
);

const Pan: React.FC<{ x: number; y: number; items: PanItem[]; t: number; hook: [number, number] }> = ({ x, y, items, t, hook }) => (
  <g>
    {/* chaînes arrière puis plateau */}
    <Chain x1={hook[0]} y1={hook[1]} x2={x - PAN_RX * 0.55} y2={y - 8} />
    <Chain x1={hook[0]} y1={hook[1]} x2={x + PAN_RX * 0.55} y2={y - 8} />
    {/* ombre du plateau sur le décor */}
    <ellipse cx={x + 30} cy={y + 120} rx={PAN_RX * 0.9} ry={22} fill="rgba(70,40,10,0.18)" filter="url(#at-blur8)" />
    {/* coupe */}
    <path d={`M ${x - PAN_RX} ${y} Q ${x - PAN_RX * 0.8} ${y + 70} ${x} ${y + 74} Q ${x + PAN_RX * 0.8} ${y + 70} ${x + PAN_RX} ${y} Z`} fill="url(#at-dish)" />
    <ellipse cx={x} cy={y} rx={PAN_RX} ry={26} fill="url(#at-dish-in)" stroke="#FFE6A8" strokeWidth={3} />
    <path d={`M ${x - PAN_RX * 0.7} ${y + 30} Q ${x - PAN_RX * 0.3} ${y + 58} ${x + PAN_RX * 0.1} ${y + 60}`} stroke="rgba(255,250,230,0.55)" strokeWidth={6} fill="none" strokeLinecap="round" />
    <g transform={`translate(${x} ${y + 8})`}>
      <PanItems items={items} t={t} />
    </g>
    {/* lèvre avant du plateau, devant les objets */}
    <path d={`M ${x - PAN_RX} ${y} Q ${x} ${y + 34} ${x + PAN_RX} ${y}`} stroke="#B08640" strokeWidth={5} fill="none" />
    {/* chaîne avant */}
    <Chain x1={hook[0]} y1={hook[1]} x2={x} y2={y + 18} />
  </g>
);

/**
 * Balance complète, pivot en (x, y), angle en degrés (positif = plateau droit qui descend).
 * Les objets tombent à leur instant `at` (temps global t, en secondes).
 */
export const Balance: React.FC<{
  t: number;
  x: number;
  y: number;
  scale: number;
  angle: number;
  left?: PanItem[];
  right?: PanItem[];
  medallion?: string;
  medalGlow?: number;
}> = ({ t, x, y, scale, angle, left = [], right = [], medallion, medalGlow = 0 }) => {
  const a = (angle * Math.PI) / 180;
  const ex = BEAM * Math.cos(a);
  const ey = BEAM * Math.sin(a);
  const L: [number, number] = [-ex, -ey];
  const R: [number, number] = [ex, ey];
  const shine = ((angle + 12) / 24) * 100;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <BalanceDefs />
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {/* ombre au sol */}
        <ellipse cx={40} cy={655} rx={330} ry={40} fill="rgba(70,40,10,0.35)" filter="url(#at-blur8)" />
        {/* socle à gradins */}
        <path d="M -200 640 L 200 640 L 175 600 L -175 600 Z" fill="url(#at-brass-h)" />
        <ellipse cx={0} cy={600} rx={175} ry={22} fill="#E6C072" />
        <path d="M -120 600 L 120 600 L 100 560 L -100 560 Z" fill="url(#at-brass-h)" />
        <ellipse cx={0} cy={560} rx={100} ry={14} fill="#F2D490" />
        {/* colonne tournée */}
        <rect x={-22} y={60} width={44} height={500} fill="url(#at-brass-h)" />
        {[120, 260, 400, 520].map((yy) => (
          <g key={yy}>
            <ellipse cx={0} cy={yy} rx={36} ry={12} fill="url(#at-brass-h)" />
            <ellipse cx={0} cy={yy - 4} rx={36} ry={6} fill="#FFE6A8" opacity={0.6} />
          </g>
        ))}
        <ellipse cx={0} cy={330} rx={44} ry={60} fill="url(#at-brass-h)" />
        {/* plateaux (suspendus, toujours verticaux) */}
        <Pan x={L[0]} y={L[1] + CHAIN} items={left} t={t} hook={L} />
        <Pan x={R[0]} y={R[1] + CHAIN} items={right} t={t} hook={R} />
        {/* fléau */}
        <g transform={`rotate(${angle})`}>
          <path d={`M ${-BEAM - 10} -6 Q 0 -30 ${BEAM + 10} -6 L ${BEAM + 10} 8 Q 0 26 ${-BEAM - 10} 8 Z`} fill="url(#at-brass)" stroke="#4A3412" strokeWidth={2} />
          {Array.from({ length: 13 }).map((_, i) => {
            const xx = -BEAM + 40 + i * ((BEAM * 2 - 80) / 12);
            return <path key={i} d={`M ${xx - 9} 0 L ${xx} -7 L ${xx + 9} 0 L ${xx} 7 Z`} fill="#6B4E1F" opacity={0.75} />;
          })}
          <rect x={-BEAM} y={-10} width={BEAM * 2} height={6} fill={`url(#at-shine)`} opacity={0.9} />
          <defs>
            <linearGradient id="at-shine" x1="0" x2="1">
              <stop offset={`${Math.max(0, shine - 12)}%`} stopColor="rgba(255,255,255,0)" />
              <stop offset={`${shine}%`} stopColor="rgba(255,255,255,0.95)" />
              <stop offset={`${Math.min(100, shine + 12)}%`} stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {[-1, 1].map((sg) => (
            <g key={sg}>
              <circle cx={sg * (BEAM + 14)} cy={1} r={16} fill="url(#at-brass)" stroke="#4A3412" strokeWidth={2} />
              <circle cx={sg * (BEAM + 10)} cy={-4} r={5} fill="#FFF6D8" />
            </g>
          ))}
        </g>
        {/* pivot : rosace + médaillon */}
        <circle cx={0} cy={0} r={98} fill="url(#at-brass)" stroke="#4A3412" strokeWidth={3} />
        {Array.from({ length: 24 }).map((_, i) => {
          const aa = (i / 24) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(aa) * 88} cy={Math.sin(aa) * 88} r={4} fill="#6B4E1F" />;
        })}
        {medallion ? (
          <g>
            <image href={medallion} x={-120} y={-108} width={260} height={260} clipPath="url(#at-medal)" />
            <circle cx={0} cy={0} r={78} fill="none" stroke="#FFE6A8" strokeWidth={4} />
            {medalGlow > 0 ? <circle cx={0} cy={0} r={92} fill="none" stroke={`rgba(255,220,140,${medalGlow})`} strokeWidth={10} filter="url(#at-blur8)" /> : null}
          </g>
        ) : (
          <circle cx={0} cy={0} r={60} fill="url(#at-dish)" />
        )}
        {/* fleuron au sommet */}
        <path d="M 0 -170 Q 22 -130 14 -100 L -14 -100 Q -22 -130 0 -170 Z" fill="url(#at-brass-h)" />
        <circle cx={0} cy={-176} r={12} fill="url(#at-brass)" />
      </g>
    </svg>
  );
};

/* ---------- Ardoise et craie ---------- */

export const ChalkDefs: React.FC = () => (
  <defs>
    <filter id="at-chalk" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.1 1.55" result="m" />
      <feComposite in="SourceGraphic" in2="m" operator="in" />
    </filter>
    <filter id="at-wood" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.12" numOctaves={3} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0.55 0" result="c" />
      <feComposite in="c" in2="SourceGraphic" operator="in" result="m" />
      <feBlend in="m" in2="SourceGraphic" mode="multiply" />
    </filter>
    <filter id="at-slate" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={2} seed={11} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.6  0 0 0 0 0.65  0 0 0 0 0.7  0 0 0 0.12 0" result="c" />
      <feComposite in="c" in2="SourceGraphic" operator="in" result="m" />
      <feBlend in="m" in2="SourceGraphic" mode="screen" />
    </filter>
    <linearGradient id="at-woodg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stopColor="#D9A866" />
      <stop offset="0.5" stopColor="#B57E42" />
      <stop offset="1" stopColor="#8A5A2A" />
    </linearGradient>
  </defs>
);

/** Ardoise d'écolier sur une table au soleil ; `words` = mots à la craie avec leur progression d'écriture (0 à 1) et leur effacement. */
export const Slate: React.FC<{
  f: number;
  words: { text: string; x: number; y: number; size: number; write: number; erase?: number }[];
  wipe: number; // 0 à 1 : passage du chiffon
}> = ({ f, words, wipe }) => {
  const SX = 90;
  const SY = 640;
  const SW_ = 900;
  const SH_ = 640;
  const writing = words.find((w) => w.write > 0 && w.write < 1);
  const wipeX = SX - 260 + wipe * (SW_ + 520);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* table de bois clair au soleil */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #E8C48C 0%, #D9A866 50%, #B9864E 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <ChalkDefs />
        <rect x={0} y={0} width={W} height={H} fill="url(#at-woodg)" filter="url(#at-wood)" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={0} x2={W} y1={i * 230 + 40} y2={i * 230 + 60} stroke="rgba(90,50,20,0.28)" strokeWidth={3} />
        ))}
        {/* ombre de la fenêtre (croisillons) */}
        <g opacity={0.22} transform="skewX(-18)">
          <rect x={420} y={200} width={760} height={1500} fill="#FFF6DC" />
          <rect x={780} y={200} width={26} height={1500} fill="#5A3414" />
          <rect x={420} y={900} width={760} height={26} fill="#5A3414" />
        </g>
        {/* ombre portée de l'ardoise */}
        <rect x={SX + 26} y={SY + 34} width={SW_} height={SH_} rx={18} fill="rgba(60,30,10,0.45)" style={{ filter: "blur(14px)" }} />
        {/* cadre de bois */}
        <rect x={SX} y={SY} width={SW_} height={SH_} rx={18} fill="url(#at-woodg)" filter="url(#at-wood)" />
        <rect x={SX + 6} y={SY + 6} width={SW_ - 12} height={10} rx={5} fill="rgba(255,240,210,0.5)" />
        {[
          [SX + 22, SY + 22],
          [SX + SW_ - 22, SY + 22],
          [SX + 22, SY + SH_ - 22],
          [SX + SW_ - 22, SY + SH_ - 22],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={7} fill="#6A4220" />
        ))}
        {/* surface d'ardoise */}
        <rect x={SX + 44} y={SY + 44} width={SW_ - 88} height={SH_ - 88} rx={6} fill="#353C43" />
        <rect x={SX + 44} y={SY + 44} width={SW_ - 88} height={SH_ - 88} rx={6} fill="#353C43" filter="url(#at-slate)" />
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse key={i} cx={SX + 140 + random(`sm${i}`) * 620} cy={SY + 120 + random(`sn${i}`) * 400} rx={120 + random(`so${i}`) * 120} ry={30 + random(`sp${i}`) * 40} fill="rgba(220,225,230,0.05)" style={{ filter: "blur(10px)" }} />
        ))}
        <rect x={SX + 44} y={SY + 44} width={SW_ - 88} height={18} fill="rgba(0,0,0,0.25)" />
        {/* mots à la craie */}
        {words.map((w, i) => {
          if (w.write <= 0) return null;
          const er = w.erase ?? 0;
          return (
            <g key={i} opacity={1 - er * 0.92}>
              <clipPath id={`at-cw${i}`}>
                <rect x={w.x - (w.text.length * w.size * 0.3) - 30} y={w.y - w.size * 1.1} width={(w.text.length * w.size * 0.6 + 60) * w.write} height={w.size * 1.5} />
              </clipPath>
              <text x={w.x} y={w.y} textAnchor="middle" fontFamily={manrope} fontWeight={800} fontStyle="italic" fontSize={w.size} fill="#F4F1E8" filter="url(#at-chalk)" clipPath={`url(#at-cw${i})`} style={{ letterSpacing: 2 }} transform={`skewX(-10) translate(${w.y * 0.176} 0)`}>
                {w.text}
              </text>
            </g>
          );
        })}
        {/* voile de craie laissé par le chiffon */}
        {wipe > 0 ? <rect x={SX + 60} y={SY + 120} width={Math.min(SW_ - 120, (wipeX - SX - 60))} height={260} rx={120} fill="rgba(230,232,236,0.12)" style={{ filter: "blur(18px)" }} /> : null}
      </svg>
      {/* bâton de craie qui suit l'écriture */}
      {writing ? (
        <div style={{ position: "absolute", left: writing.x + (writing.write - 0.5) * writing.text.length * writing.size * 0.6, top: writing.y - writing.size * 0.6 + Math.sin(f * 1.6) * 10, width: 120, height: 30, borderRadius: 14, background: "linear-gradient(180deg, #FFFFFF 0%, #ECE8DE 60%, #BDB6A8 100%)", transform: "rotate(-35deg)", transformOrigin: "0 50%", boxShadow: "6px 10px 14px rgba(0,0,0,0.45)" }} />
      ) : null}
      {/* chiffon */}
      {wipe > 0 && wipe < 1 ? (
        <svg width={420} height={320} viewBox="-210 -160 420 320" style={{ position: "absolute", left: wipeX - 210, top: 760 + Math.sin(wipe * 9) * 30, overflow: "visible" }}>
          <ellipse cx={20} cy={40} rx={190} ry={110} fill="rgba(0,0,0,0.35)" style={{ filter: "blur(14px)" }} />
          <path d="M -170 -60 C -120 -140 60 -150 150 -90 C 210 -40 190 60 140 100 C 60 150 -100 140 -160 80 C -200 30 -200 -20 -170 -60 Z" fill="#C9B79A" />
          <path d="M -130 -40 C -60 -90 40 -80 110 -50" stroke="#A8957A" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M -140 30 C -60 0 40 10 130 40" stroke="#A8957A" strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M -90 90 C -20 60 60 70 110 90" stroke="#E6D8BE" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M -120 -20 C -50 -60 50 -55 120 -20" stroke="#E6D8BE" strokeWidth={6} fill="none" strokeLinecap="round" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Pièces ---------- */

export const Coin: React.FC<{ r: number; tilt: number; id: string }> = ({ r, tilt, id }) => {
  const ry = r * Math.max(0.08, Math.abs(tilt));
  return (
    <g>
      <ellipse cx={0} cy={9} rx={r} ry={ry} fill="#5E431A" />
      <rect x={-r} y={0} width={r * 2} height={9} fill="#8A6428" />
      <rect x={-r} y={0} width={r * 2} height={9} fill="none" stroke="#4A3412" strokeWidth={1} strokeDasharray="2 3" />
      <ellipse cx={0} cy={0} rx={r} ry={ry} fill={`url(#${id})`} stroke="#6B4E1F" strokeWidth={2} />
      <ellipse cx={0} cy={0} rx={r * 0.78} ry={ry * 0.78} fill="none" stroke="rgba(110,78,30,0.6)" strokeWidth={2} />
      <ellipse cx={-r * 0.3} cy={-ry * 0.3} rx={r * 0.35} ry={ry * 0.25} fill="rgba(255,255,255,0.45)" />
    </g>
  );
};

export const CoinDefs: React.FC = () => (
  <defs>
    <radialGradient id="at-coin" cx="0.35" cy="0.3" r="0.9">
      <stop offset="0" stopColor="#FFF4CC" />
      <stop offset="0.45" stopColor="#E3BC68" />
      <stop offset="1" stopColor="#8A6428" />
    </radialGradient>
    <radialGradient id="at-coin2" cx="0.35" cy="0.3" r="0.9">
      <stop offset="0" stopColor="#FFFFFF" />
      <stop offset="0.45" stopColor="#CFCBC2" />
      <stop offset="1" stopColor="#7C786E" />
    </radialGradient>
  </defs>
);

/** Points de lumière qui convergent puis pluie de pièces qui s'empilent (f local ; hit = image du coup). */
export const CoinRain: React.FC<{ f: number; hit: number }> = ({ f, hit }) => {
  const stacks = [
    { x: 300, n: 7 },
    { x: 420, n: 11 },
    { x: 540, n: 14 },
    { x: 660, n: 10 },
    { x: 780, n: 6 },
  ];
  const baseY = 1150;
  const coins: React.ReactNode[] = [];
  stacks.forEach((st, si) => {
    for (let k = 0; k < st.n; k++) {
      const land = hit + 2 + k * 2.2 + si * 1.3;
      const fallStart = land - 10;
      if (f < fallStart) continue;
      const p = clamp01((f - fallStart) / 10);
      const y = baseY - k * 12 - (1 - p * p) * 1300;
      const tilt = p < 1 ? Math.cos((f - fallStart) * 0.7 + k) : 0.32;
      const x = st.x + (k % 2 ? 3 : -3) + (p < 1 ? Math.sin(k + si) * 40 * (1 - p) : 0);
      const flash = f >= land && f < land + 5 ? 1 - (f - land) / 5 : 0;
      coins.push(
        <g key={`${si}-${k}`} transform={`translate(${x} ${y})`}>
          <Coin r={52} tilt={tilt} id={(si + k) % 4 === 0 ? "at-coin2" : "at-coin"} />
          {flash > 0 ? <circle cx={-14} cy={-6} r={10 + 30 * (1 - flash)} fill={`rgba(255,250,220,${0.8 * flash})`} /> : null}
        </g>,
      );
    }
  });
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <CoinDefs />
      {/* ombre sous les piles */}
      <ellipse cx={540} cy={baseY + 24} rx={330} ry={34} fill="rgba(80,40,10,0.35)" style={{ filter: "blur(10px)" }} />
      {/* traînées de lumière (les chefs collecteurs) qui convergent */}
      {f < hit + 6
        ? Array.from({ length: 36 }).map((_, i) => {
            const ang = random(`cl${i}`) * Math.PI * 2;
            const R0 = 900 + random(`cr${i}`) * 300;
            const p = clamp01((f - random(`cd${i}`) * 6) / (hit - 2));
            const r1 = R0 * (1 - p);
            const r2 = Math.min(R0, r1 + 140);
            const cx = 540;
            const cy = 820;
            return (
              <line key={i} x1={cx + Math.cos(ang) * r1} y1={cy + Math.sin(ang) * r1} x2={cx + Math.cos(ang) * r2} y2={cy + Math.sin(ang) * r2} stroke="rgba(255,236,170,0.9)" strokeWidth={6} strokeLinecap="round" opacity={f > hit ? 1 - (f - hit) / 6 : 1} style={{ filter: "drop-shadow(0 0 8px #FFD58A)" }} />
            );
          })
        : null}
      {coins}
    </svg>
  );
};

/* ---------- Tente de campagne à l'aube ---------- */

export const TentDawn: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #F2D9A8 0%, #F6C98A 30%, #F0B070 48%, #C98A50 56%, #8C6A3A 62%, #6E5228 100%)" }} />
    <div style={{ position: "absolute", left: 640, top: 760, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,252,235,1) 0%, rgba(255,236,190,0.7) 20%, rgba(255,220,160,0) 62%)" }} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="at-canvas" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F4E6C8" />
          <stop offset="0.6" stopColor="#D9C29A" />
          <stop offset="1" stopColor="#A88E64" />
        </linearGradient>
        <linearGradient id="at-canvas-side" x1="0" x2="1">
          <stop offset="0" stopColor="#C9B08A" />
          <stop offset="1" stopColor="#8C7350" />
        </linearGradient>
        <radialGradient id="at-tent-in" cx="0.5" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#FFE2A6" />
          <stop offset="0.6" stopColor="#E8A85A" />
          <stop offset="1" stopColor="#7A4A20" />
        </radialGradient>
      </defs>
      {/* lisière lointaine */}
      <path d={`M 0 1020 ${Array.from({ length: 28 }).map((_, i) => `Q ${i * 40 + 20} ${970 - 40 * random(`tl${i}`)} ${i * 40 + 40} ${1010 - 10 * random(`tk${i}`)}`).join(" ")} L 1080 1100 L 0 1100 Z`} fill="#6E5A3A" opacity={0.55} />
      <rect x={0} y={1060} width={W} height={900} fill="#7A6236" />
      <rect x={0} y={1060} width={W} height={60} fill="rgba(255,220,160,0.25)" />
      {/* ombre de la tente au sol (le soleil est derrière à droite) */}
      <path d="M 120 1430 L 820 1430 L 600 1540 L -60 1540 Z" fill="rgba(40,24,8,0.45)" style={{ filter: "blur(6px)" }} />
      {/* toit latéral */}
      <path d="M 170 1430 L 470 860 L 900 900 L 900 1400 Z" fill="url(#at-canvas-side)" />
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={i} x1={250 + i * 140} y1={1420 - i * 6} x2={520 + i * 95} y2={870 + i * 8} stroke="rgba(90,70,40,0.4)" strokeWidth={3} />
      ))}
      {/* façade */}
      <path d="M 170 1430 L 470 860 L 770 1430 Z" fill="url(#at-canvas)" stroke="#8C7350" strokeWidth={4} />
      {/* ouverture éclairée */}
      <path d="M 330 1430 L 470 1060 L 610 1430 Z" fill="url(#at-tent-in)" />
      {/* pans relevés */}
      <path d="M 330 1430 L 470 1060 L 300 1300 Z" fill="#E9D6B0" stroke="#A88E64" strokeWidth={3} />
      <path d="M 610 1430 L 470 1060 L 650 1300 Z" fill="#D2B98E" stroke="#A88E64" strokeWidth={3} />
      {/* table pliante et deux chaises, à contre-jour doux */}
      <g fill="#3A2412">
        <rect x={400} y={1330} width={140} height={12} rx={3} />
        <path d="M 415 1342 L 470 1430 L 476 1430 L 421 1342 Z" />
        <path d="M 525 1342 L 470 1430 L 464 1430 L 519 1342 Z" />
        {/* chaise gauche */}
        <rect x={352} y={1312} width={8} height={70} />
        <rect x={352} y={1368} width={44} height={8} />
        <path d="M 356 1376 L 392 1430 L 398 1430 L 362 1376 Z" />
        <path d="M 392 1376 L 356 1430 L 350 1430 L 386 1376 Z" />
        {/* chaise droite */}
        <rect x={580} y={1312} width={8} height={70} />
        <rect x={544} y={1368} width={44} height={8} />
        <path d="M 548 1376 L 584 1430 L 590 1430 L 554 1376 Z" />
        <path d="M 584 1376 L 548 1430 L 542 1430 L 578 1376 Z" />
        {/* deux tasses */}
        <rect x={428} y={1314} width={18} height={16} rx={3} />
        <rect x={494} y={1314} width={18} height={16} rx={3} />
      </g>
      {/* mât, cordes, piquets */}
      <rect x={466} y={830} width={8} height={40} fill="#5A3A1A" />
      {[
        [470, 860, 40, 1500],
        [470, 860, 960, 1480],
        [770, 1430, 960, 1480],
        [170, 1430, 40, 1500],
      ].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5A4426" strokeWidth={3} />
          <rect x={x2 - 5} y={y2 - 24} width={10} height={30} fill="#4A2E14" transform={`rotate(${i % 2 ? 14 : -14} ${x2} ${y2})`} />
        </g>
      ))}
      {/* coutures de la façade */}
      <line x1={470} y1={860} x2={470} y2={1060} stroke="#A88E64" strokeWidth={3} strokeDasharray="10 8" />
      <line x1={250} y1={1280} x2={690} y2={1280} stroke="rgba(140,115,80,0.5)" strokeWidth={3} strokeDasharray="10 8" />
    </svg>
    {/* poussière dorée */}
    {Array.from({ length: 26 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: (random(`td${i}`) * W + f * 0.9) % W, top: 700 + random(`ty${i}`) * 800 - f * 0.4, width: 5, height: 5, borderRadius: 3, background: "#FFF1C4", opacity: 0.6 * random(`to${i}`), boxShadow: "0 0 8px #FFD58A" }} />
    ))}
  </AbsoluteFill>
);

/* ---------- Livre de cuir qui s'ouvre ---------- */

export const OpenBook: React.FC<{ f: number; open: number; lift: number }> = ({ f, open, lift }) => {
  const BW = 640;
  const BH = 820;
  const cx = 540;
  const cy = 980;
  const coverScale = Math.cos(open * Math.PI); // 1 fermé, -1 ouvert à plat à gauche
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <BalanceDefs />
      <defs>
        <filter id="at-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves={3} seed={5} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0 0.02  0 0 0 0.45 0" result="c" />
          <feComposite in="c" in2="SourceGraphic" operator="in" result="m" />
          <feBlend in="m" in2="SourceGraphic" mode="multiply" />
        </filter>
        <linearGradient id="at-page" x1="0" x2="1">
          <stop offset="0" stopColor="#E9DAB8" />
          <stop offset="0.12" stopColor="#FBF3E0" />
          <stop offset="1" stopColor="#F3E6C8" />
        </linearGradient>
        <linearGradient id="at-pageL" x1="1" x2="0">
          <stop offset="0" stopColor="#E0CFA8" />
          <stop offset="0.12" stopColor="#FBF3E0" />
          <stop offset="1" stopColor="#F3E6C8" />
        </linearGradient>
      </defs>
      <g transform={`translate(0 ${-lift})`}>
        {/* ombre */}
        <ellipse cx={cx + 30} cy={cy + BH / 2 + 30} rx={(BW / 2) * (1 + open)} ry={40} fill="rgba(60,30,10,0.35)" style={{ filter: "blur(12px)" }} />
        {/* couverture arrière + bloc de pages (droite) */}
        <rect x={cx - BW / 2 + 0} y={cy - BH / 2} width={BW} height={BH} rx={14} fill="url(#at-leather)" filter="url(#at-grain)" />
        <rect x={cx - BW / 2 + 16} y={cy - BH / 2 + 14} width={BW - 34} height={BH - 28} rx={4} fill="url(#at-page)" />
        {/* lignes manuscrites (tracés illisibles) de la page de droite */}
        {open > 0.55
          ? Array.from({ length: 13 }).map((_, i) => {
              const yy = cy - BH / 2 + 90 + i * 52;
              const len = 380 + random(`bl${i}`) * 140;
              const rise = clamp01((f - 14 - i * 1.2) / 30);
              return (
                <path
                  key={i}
                  d={`M ${cx - BW / 2 + 70} ${yy} ${Array.from({ length: 14 }).map((_, k) => `q 8 ${k % 2 ? -14 : 12} ${len / 14} 0`).join(" ")}`}
                  stroke="#4A3018"
                  strokeWidth={4}
                  fill="none"
                  strokeLinecap="round"
                  opacity={(1 - rise * 0.75) * clamp01((open - 0.55) * 4)}
                />
              );
            })
          : null}
        {/* couverture avant qui pivote autour du dos (à gauche) */}
        <g transform={`translate(${cx - BW / 2} 0) scale(${coverScale} 1) translate(${-(cx - BW / 2)} 0)`}>
          {coverScale > 0 ? (
            <g>
              <rect x={cx - BW / 2} y={cy - BH / 2} width={BW} height={BH} rx={14} fill="url(#at-leather)" filter="url(#at-grain)" />
              <rect x={cx - BW / 2 + 40} y={cy - BH / 2 + 40} width={BW - 80} height={BH - 80} rx={8} fill="none" stroke="#C9A25A" strokeWidth={4} />
              <rect x={cx - BW / 2 + 54} y={cy - BH / 2 + 54} width={BW - 108} height={BH - 108} rx={6} fill="none" stroke="rgba(201,162,90,0.5)" strokeWidth={2} />
              {[0.2, 0.4, 0.6, 0.8].map((k) => (
                <rect key={k} x={cx - BW / 2 - 4} y={cy - BH / 2 + BH * k - 6} width={34} height={12} rx={4} fill="#2E140A" />
              ))}
              <rect x={cx + BW / 2 - 30} y={cy - 40} width={46} height={80} rx={8} fill="url(#at-brass)" stroke="#4A3412" strokeWidth={2} />
            </g>
          ) : (
            <g>
              <rect x={cx - BW / 2} y={cy - BH / 2} width={BW} height={BH} rx={14} fill="url(#at-leather)" />
              <rect x={cx - BW / 2 + 14} y={cy - BH / 2 + 14} width={BW - 30} height={BH - 28} rx={4} fill="url(#at-pageL)" />
              {open > 0.7
                ? Array.from({ length: 13 }).map((_, i) => {
                    const yy = cy - BH / 2 + 90 + i * 52;
                    const len = 360 + random(`br${i}`) * 140;
                    return <path key={i} d={`M ${cx - BW / 2 + 70} ${yy} ${Array.from({ length: 14 }).map((_, k) => `q 8 ${k % 2 ? 12 : -14} ${len / 14} 0`).join(" ")}`} stroke="#4A3018" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />;
                  })
                : null}
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

/* ---------- Sous-bois et empreintes dans la terre rouge ---------- */

const Foot: React.FC<{ kind: number; s: number; left: boolean }> = ({ kind, s, left }) => (
  <g transform={`scale(${left ? -s : s} ${s})`}>
    {kind === 0 ? (
      <g>
        {/* pied nu */}
        <path d="M 0 -60 C 22 -60 26 -30 22 -5 C 18 20 26 40 12 58 C 0 70 -16 62 -18 44 C -22 20 -24 -40 0 -60 Z" fill="#5A1E0C" />
        <path d="M 2 -54 C 18 -52 20 -28 16 -6" stroke="rgba(255,200,160,0.55)" strokeWidth={3} fill="none" />
        {[-14, -4, 6, 14, 20].map((x, i) => (
          <ellipse key={i} cx={x} cy={-72 + Math.abs(i - 1) * 3} rx={5 - i * 0.4} ry={6} fill="#5A1E0C" />
        ))}
      </g>
    ) : (
      <g>
        {/* semelle */}
        <path d="M 0 -78 C 24 -78 28 -40 22 -10 C 18 16 24 46 10 68 C 0 80 -16 74 -18 54 C -22 20 -26 -70 0 -78 Z" fill="#561C0B" />
        {kind === 2 ? Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={(i % 2 ? 8 : -8)} cy={-60 + i * 13} r={2.6} fill="#2E0E04" />) : <path d="M -14 -20 L 16 -20" stroke="#3A1206" strokeWidth={4} />}
        <path d="M 4 -72 C 20 -70 22 -40 18 -12" stroke="rgba(255,200,160,0.5)" strokeWidth={3} fill="none" />
      </g>
    )}
  </g>
);

export const ForestTrail: React.FC<{ f: number; density: number }> = ({ f, density }) => {
  const HOR = 760;
  const prints: React.ReactNode[] = [];
  const N = Math.floor(24 + density * 56);
  for (let i = 0; i < N; i++) {
    const z0 = random(`fz${i}`);
    const appear = i < 30 ? i * 0.9 : 26 + (i - 30) * 0.18;
    if (f < appear) continue;
    let z = (z0 + f * 0.006) % 1; // 0 loin, 1 près
    const y = HOR + 40 + Math.pow(z, 1.6) * 1200;
    const pathHalf = 70 + Math.pow(z, 1.6) * 520;
    const x = 540 + (random(`fx${i}`) - 0.5) * 2 * pathHalf * 0.85 + Math.sin(y * 0.004) * 60;
    const sc = 0.35 + Math.pow(z, 1.6) * 1.5;
    const o = clamp01((f - appear) / 4) * clamp01(z * 6);
    prints.push(
      <g key={i} transform={`translate(${x} ${y}) rotate(${(random(`fr${i}`) - 0.5) * 16}) scale(1 0.42)`} opacity={o * 0.9}>
        <Foot kind={i % 3} s={sc} left={i % 2 === 0} />
      </g>,
    );
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #CFD8A0 0%, #A9B878 25%, #6F8848 42%, #3E5A2A 60%, #2A3E1C 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="at-trunk" x1="0" x2="1">
            <stop offset="0" stopColor="#2A2416" />
            <stop offset="0.45" stopColor="#6A5A3A" />
            <stop offset="1" stopColor="#1E1A10" />
          </linearGradient>
          <linearGradient id="at-ray" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(255,248,200,0.75)" />
            <stop offset="1" stopColor="rgba(255,248,200,0)" />
          </linearGradient>
          <linearGradient id="at-mud" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#B0603A" />
            <stop offset="0.5" stopColor="#9A4426" />
            <stop offset="1" stopColor="#7A2E16" />
          </linearGradient>
        </defs>
        {/* troncs lointains */}
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 40 + i * 125 + (random(`tf${i}`) - 0.5) * 50;
          const w = 26 + random(`tw${i}`) * 20;
          return <rect key={i} x={x} y={0} width={w} height={HOR + 60} fill="rgba(70,80,50,0.55)" />;
        })}
        {/* rais de soleil */}
        {[180, 470, 760].map((x, i) => (
          <polygon key={i} points={`${x},0 ${x + 90},0 ${x + 330 + Math.sin(f * 0.05 + i) * 20},1500 ${x + 120},1500`} fill="url(#at-ray)" opacity={0.55 + 0.15 * Math.sin(f * 0.07 + i * 2)} style={{ mixBlendMode: "screen" }} />
        ))}
        {/* piste de terre rouge en perspective */}
        <path d={`M ${540 - 60} ${HOR + 40} L ${540 + 60} ${HOR + 40} L ${W + 260} ${H} L ${-260} ${H} Z`} fill="url(#at-mud)" />
        {Array.from({ length: 40 }).map((_, i) => {
          const yy = HOR + 60 + random(`my${i}`) * 1100;
          const half = 70 + ((yy - HOR) / 1200) * 520;
          return <ellipse key={i} cx={540 + (random(`mx${i}`) - 0.5) * half * 1.6} cy={yy} rx={6 + random(`mw${i}`) * ((yy - HOR) / 30)} ry={2 + random(`mh${i}`) * ((yy - HOR) / 120)} fill="rgba(255,190,140,0.18)" />;
        })}
        {prints}
        {/* grands troncs à contreforts au premier plan */}
        {[
          { x: 40, w: 150 },
          { x: 930, w: 170 },
        ].map((t, i) => (
          <g key={i}>
            <rect x={t.x - t.w / 2} y={-20} width={t.w} height={1500} fill="url(#at-trunk)" />
            <path d={`M ${t.x - t.w / 2} 1300 Q ${t.x - t.w * 1.4} 1480 ${t.x - t.w * 1.6} 1560 L ${t.x + t.w * 1.4} 1560 Q ${t.x + t.w * 1.2} 1480 ${t.x + t.w / 2} 1300 Z`} fill="#2A2416" />
            <path d={`M ${t.x - 10} 1380 Q ${t.x - t.w * 0.7} 1500 ${t.x - t.w * 0.8} 1560`} stroke="rgba(150,130,90,0.5)" strokeWidth={6} fill="none" />
          </g>
        ))}
        {/* fougères */}
        {Array.from({ length: 10 }).map((_, i) => {
          const bx = i < 5 ? 40 + i * 70 : 760 + (i - 5) * 70;
          const by = 1560 + (i % 2) * 40;
          const sway = Math.sin(f * 0.08 + i) * 6;
          return (
            <g key={i} transform={`translate(${bx} ${by}) rotate(${(i < 5 ? 20 : -20) + sway})`}>
              <path d="M 0 0 Q 10 -160 0 -300" stroke="#2E4A1C" strokeWidth={6} fill="none" />
              {Array.from({ length: 10 }).map((_, k) => (
                <g key={k}>
                  <path d={`M ${2} ${-30 - k * 26} q 40 -10 ${70 - k * 5} 6`} stroke="#3E6A26" strokeWidth={10} fill="none" strokeLinecap="round" />
                  <path d={`M ${-2} ${-30 - k * 26} q -40 -10 ${-(70 - k * 5)} 6`} stroke="#355C20" strokeWidth={10} fill="none" strokeLinecap="round" />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {/* brume claire */}
      <div style={{ position: "absolute", left: -200, top: HOR - 160, width: 1500, height: 320, background: "radial-gradient(ellipse, rgba(240,245,220,0.55) 0%, rgba(240,245,220,0) 70%)" }} />
    </AbsoluteFill>
  );
};

/* ---------- Route de latérite, école, dispensaire, église ---------- */

export const RoadHills: React.FC<{ f: number; draw: number }> = ({ f, draw }) => {
  const HOR = 900;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #CFE3EA 0%, #F2E6C4 38%, #F6DDA8 46%)" }} />
      <div style={{ position: "absolute", left: 120, top: 380, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,252,235,1) 0%, rgba(255,240,200,0.5) 22%, rgba(255,230,170,0) 62%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="at-hill1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#9DB070" />
            <stop offset="1" stopColor="#6A8A40" />
          </linearGradient>
          <linearGradient id="at-hill2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7E9A4A" />
            <stop offset="1" stopColor="#4E7028" />
          </linearGradient>
          <linearGradient id="at-road" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#D88A56" />
            <stop offset="1" stopColor="#A84A26" />
          </linearGradient>
          <clipPath id="at-roadclip">
            <rect x={0} y={H - draw * (H - HOR + 40)} width={W} height={H} />
          </clipPath>
        </defs>
        <path d={`M 0 ${HOR - 40} Q 200 ${HOR - 130} 420 ${HOR - 60} T 820 ${HOR - 90} T 1080 ${HOR - 50} L 1080 ${H} L 0 ${H} Z`} fill="#B9C68E" opacity={0.8} />
        {/* bâtiments au bout de la route */}
        <g transform={`translate(0 ${(1 - clamp01(draw * 1.6 - 0.4)) * 60})`} opacity={clamp01(draw * 1.6 - 0.4)}>
          {/* école : murs crépis, toit de tôle, cloche */}
          <g transform="translate(330 870)">
            <rect x={-110} y={-90} width={220} height={90} fill="#EFE2C6" />
            <rect x={-110} y={-90} width={220} height={90} fill="none" stroke="#B9A47E" strokeWidth={3} />
            <path d="M -130 -88 L 0 -150 L 130 -88 Z" fill="#9AA3A8" />
            {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={-120 + i * 26} y1={-90} x2={-10 + i * 2} y2={-146} stroke="#7A8388" strokeWidth={2} />)}
            {[-70, -20, 30, 80].map((x) => <rect key={x} x={x - 14} y={-70} width={26} height={34} fill="#5A4026" />)}
            <rect x={140} y={-150} width={6} height={150} fill="#4A3418" />
            <path d="M 132 -150 L 154 -150 L 150 -128 L 136 -128 Z" fill="url(#at-brass)" />
          </g>
          {/* dispensaire à véranda */}
          <g transform="translate(720 880)">
            <rect x={-120} y={-80} width={240} height={80} fill="#F4EBD6" />
            <path d="M -140 -78 L 140 -78 L 120 -112 L -120 -112 Z" fill="#B85A34" />
            <rect x={-140} y={-82} width={280} height={8} fill="#8A3B22" />
            {[-120, -60, 0, 60, 120].map((x) => <rect key={x} x={x - 4} y={-76} width={8} height={76} fill="#7A5A3A" />)}
            <rect x={-30} y={-60} width={34} height={60} fill="#6A4A2A" />
          </g>
          {/* église à petit clocher */}
          <g transform="translate(540 850)">
            <rect x={-60} y={-100} width={120} height={100} fill="#EAD9B6" />
            <path d="M -74 -98 L 0 -150 L 74 -98 Z" fill="#8A3B22" />
            <rect x={-18} y={-210} width={36} height={70} fill="#EAD9B6" />
            <path d="M -24 -208 L 0 -250 L 24 -208 Z" fill="#8A3B22" />
            <rect x={-2} y={-280} width={4} height={30} fill="#4A3418" />
            <rect x={-10} y={-270} width={20} height={4} fill="#4A3418" />
            <path d="M -16 0 L -16 -44 Q 0 -60 16 -44 L 16 0 Z" fill="#5A4026" />
          </g>
        </g>
        <path d={`M 0 ${HOR} Q 300 ${HOR - 60} 540 ${HOR + 10} T 1080 ${HOR - 10} L 1080 ${H} L 0 ${H} Z`} fill="url(#at-hill1)" />
        <path d={`M 0 ${HOR + 200} Q 260 ${HOR + 120} 560 ${HOR + 230} T 1080 ${HOR + 190} L 1080 ${H} L 0 ${H} Z`} fill="url(#at-hill2)" />
        {/* route qui se dessine en perspective */}
        <g clipPath="url(#at-roadclip)">
          <path d={`M 520 ${HOR + 10} C 560 ${HOR + 200} 380 ${HOR + 420} 420 ${HOR + 640} C 450 ${HOR + 820} 620 ${HOR + 900} 700 ${H} L 160 ${H} C 120 ${HOR + 880} 300 ${HOR + 780} 330 ${HOR + 620} C 350 ${HOR + 420} 520 ${HOR + 220} 500 ${HOR + 10} Z`} fill="url(#at-road)" />
          <path d={`M 510 ${HOR + 20} C 540 ${HOR + 210} 380 ${HOR + 420} 390 ${HOR + 630} C 400 ${HOR + 800} 520 ${HOR + 900} 560 ${H}`} stroke="rgba(110,40,16,0.5)" strokeWidth={10} fill="none" />
          <path d={`M 512 ${HOR + 20} C 520 ${HOR + 210} 340 ${HOR + 420} 350 ${HOR + 630} C 340 ${HOR + 800} 330 ${HOR + 900} 300 ${H}`} stroke="rgba(110,40,16,0.4)" strokeWidth={8} fill="none" />
          <path d={`M 500 ${HOR + 10} C 520 ${HOR + 220} 350 ${HOR + 420} 330 ${HOR + 620} C 300 ${HOR + 780} 120 ${HOR + 880} 160 ${H}`} stroke="#6A8A40" strokeWidth={14} fill="none" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Texte Cinzel sombre avec liseré clair (pour fonds clairs). */
export const InkTitle: React.FC<{ text: string; size: number; color?: string; f: number; at: number; glow?: string }> = ({ text, size, color = AT.ink, f, at, glow = "rgba(255,246,220,0.95)" }) => {
  if (f < at) return null;
  const k = Math.min(1, (f - at) / 4);
  const sc = 1.35 - 0.35 * (1 - Math.pow(1 - k, 2));
  return (
    <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: size, lineHeight: 1.02, color, letterSpacing: size * 0.02, textAlign: "center", transform: `scale(${sc})`, opacity: Math.min(1, (f - at) / 2), textShadow: `0 0 6px ${glow}, 0 0 18px ${glow}, 0 4px 20px rgba(255,240,200,0.8)` }}>{text}</div>
  );
};
