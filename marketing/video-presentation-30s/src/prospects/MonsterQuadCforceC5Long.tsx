// Essai client MonsterQuad (SARL Faivre), pas AFROBACK : version longue 1 min 48, 1080 × 1920,
// présentation détaillée du CFMOTO CFORCE C5 en 6 chapitres (calqués sur la fiche monsterquad.fr).
// Réutilise les briques de la version courte (MonsterQuadCforceC5.tsx).
// Plans : scripts/extraire-monsterquad-c5.sh (plans « L » + plans communs).
// Musique : « Protesting Robot », Michael Ramir C. (licence Mixkit), morceau entier (110 s) :
// intro 0-8,57 s · drop 8,57 s (257) · pause 22,4 s (672) · drop 29,14 s (874) · variation 36,7 s (1101)
// · relance 42,85 s (1286) · montée 63,5 s (1905) · pic 67,8 s (2034) · outro 104,8 s (3144) · fin 108 s.
// Données produit : fiche monsterquad.fr du CFORCE C5 relevée le 2026-10-02 (fiche technique complète).
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  anton,
  Appel,
  Bandes,
  clamp,
  Compteur,
  DUREE_REV,
  Entree,
  Flash,
  Fuite,
  Grain,
  GREEN,
  H,
  INK,
  Lignes,
  manrope,
  ombre,
  Plan,
  popIn,
  Prix,
  ramp,
  RED,
  Revelation,
  secousse,
  Slam,
  T,
  Tampon,
  Visee,
  Voile,
  W,
  Widget,
  WidgetAnime,
} from "./MonsterQuadCforceC5";

const BEAT = 12.72;
const DROP1 = 257;
const PAUSE = 672;
const DROP2 = 874;
const VARIATION = 1101;
const RELANCE = 1286;
const MONTEE = 1905;
const PIC = 2034;
const FIN = 3240;

const CHAPITRES = [
  { num: "01", nom: "PUISSANCE", debut: PAUSE },
  { num: "02", nom: "TRANSMISSION", debut: VARIATION },
  { num: "03", nom: "CHÂSSIS", debut: RELANCE },
  { num: "04", nom: "ÉCLAIRAGE & CONNECTIVITÉ", debut: 1596 },
  { num: "05", nom: "CHARGE UTILE", debut: MONTEE },
  { num: "06", nom: "SÉCURITÉ", debut: 2340 },
];
const FIN_CHAPITRES = 2650;

/* =========================================================================================
   Widgets supplémentaires
   ========================================================================================= */

type WidgetLong = Widget | "comptetours" | "lettres" | "disque" | "cadenas" | "pneu" | "racks";

const WidgetLongAnime: React.FC<{ type: WidgetLong }> = ({ type }) => {
  const f = useCurrentFrame();
  const a = 12;
  if (type === "comptetours") {
    // compte-tours 0-9 (×1000 tr/min), zone rouge à partir de 7,5, aiguille jusqu'à 7 500
    const ang = (v: number) => -210 + (v / 9) * 240;
    const pol = (v: number, r: number) => {
      const t = (ang(v) * Math.PI) / 180;
      return [Math.cos(t) * r, Math.sin(t) * r];
    };
    const arc = (v1: number, v2: number, r: number) => {
      const [x1, y1] = pol(v1, r);
      const [x2, y2] = pol(v2, r);
      return `M${x1} ${y1} A${r} ${r} 0 ${v2 - v1 > 4.5 ? 1 : 0} 1 ${x2} ${y2}`;
    };
    const v = ramp(f, a, 26, 0, 7.5, Easing.out(Easing.back(1.1)));
    const [nx, ny] = pol(v, 108);
    return (
      <svg width={300} height={250} viewBox="-150 -140 300 250">
        <path d={arc(0, 9, 120)} stroke="rgba(255,255,255,0.2)" strokeWidth={14} fill="none" />
        <path d={arc(0, Math.min(v, 7.5), 120)} stroke={GREEN} strokeWidth={14} fill="none" />
        <path d={arc(7.5, 9, 120)} stroke={RED} strokeWidth={14} fill="none" />
        {new Array(10).fill(0).map((_, i) => {
          const [x1, y1] = pol(i, 96);
          const [x2, y2] = pol(i, 82);
          const [tx, ty] = pol(i, 66);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={4} />
              <text x={tx} y={ty + 8} textAnchor="middle" fill="#fff" fontFamily={manrope} fontWeight={800} fontSize={22}>
                {i}
              </text>
            </g>
          );
        })}
        <line x1={0} y1={0} x2={nx} y2={ny} stroke={RED} strokeWidth={7} strokeLinecap="round" />
        <circle r={14} fill="#fff" />
        <text y={70} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontFamily={manrope} fontWeight={800} fontSize={22}>
          × 1000 tr/min
        </text>
      </svg>
    );
  }
  if (type === "lettres") {
    const actif = Math.floor(ramp(f, a, 34, 0, 4.99, Easing.linear));
    return (
      <div style={{ display: "flex", gap: 16 }}>
        {["L", "H", "N", "R", "P"].map((l, i) => (
          <div
            key={l}
            style={{
              width: 120,
              height: 140,
              borderRadius: 18,
              border: `5px solid ${i === actif ? GREEN : "rgba(255,255,255,0.55)"}`,
              background: i === actif ? GREEN : "rgba(255,255,255,0.06)",
              color: i === actif ? INK : "#fff",
              fontFamily: anton,
              fontSize: 90,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${i === actif ? 1.1 : popIn(f, a - 8 + i * 2)})`,
              boxShadow: i === actif ? `0 0 34px ${GREEN}` : undefined,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    );
  }
  if (type === "disque") {
    // disque qui tourne puis s'arrête quand l'étrier serre
    const tourne = interpolate(f, [0, 34], [0, 520], { ...clamp, easing: Easing.out(Easing.cubic) });
    const serre = ramp(f, 22, 8, 0, 1, Easing.out(Easing.back(2)));
    return (
      <svg width={300} height={260} viewBox="-150 -130 300 260">
        <g transform={`rotate(${tourne})`}>
          <circle r={110} fill="none" stroke="#c9ced3" strokeWidth={36} />
          <circle r={56} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={4} />
          {new Array(12).fill(0).map((_, i) => {
            const t = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(t) * 110} cy={Math.sin(t) * 110} r={6} fill={INK} />;
          })}
          {new Array(5).fill(0).map((_, i) => {
            const t = (i / 5) * Math.PI * 2;
            return <circle key={`b${i}`} cx={Math.cos(t) * 32} cy={Math.sin(t) * 32} r={7} fill="#fff" />;
          })}
        </g>
        <rect x={70 + (1 - serre) * 30} y={-60} width={70} height={120} rx={16} fill={RED} style={{ filter: `drop-shadow(0 0 ${serre * 20}px ${RED})` }} />
      </svg>
    );
  }
  if (type === "cadenas") {
    const ferme = ramp(f, a + 6, 8, 0, 1, Easing.out(Easing.back(2.5)));
    return (
      <svg width={240} height={260} viewBox="-120 -140 240 260">
        <path d="M-55 -10 L-55 -60 A55 55 0 0 1 55 -60 L55 -10" fill="none" stroke="#fff" strokeWidth={20} transform={`translate(0 ${(1 - ferme) * -45})`} />
        <rect x={-85} y={-15} width={170} height={130} rx={22} fill={ferme > 0.95 ? GREEN : "#fff"} style={{ filter: ferme > 0.95 ? `drop-shadow(0 0 26px ${GREEN})` : undefined }} />
        <circle cy={40} r={16} fill={INK} />
        <rect x={-6} y={44} width={12} height={36} rx={5} fill={INK} />
      </svg>
    );
  }
  if (type === "pneu") {
    const d = ramp(f, a, 18, 0, 1, Easing.out(Easing.cubic));
    const rot = f * 3;
    return (
      <svg width={300} height={260} viewBox="-150 -130 300 260">
        <g transform={`rotate(${rot})`}>
          <circle r={100} fill="none" stroke="#2b2f33" strokeWidth={44} />
          {new Array(18).fill(0).map((_, i) => {
            const t = (i / 18) * Math.PI * 2;
            return <rect key={i} x={-9} y={-124} width={18} height={18} rx={3} fill="#3c4247" transform={`rotate(${(t * 180) / Math.PI})`} />;
          })}
          <circle r={62} fill="#1a1d20" stroke="#5b6166" strokeWidth={6} />
        </g>
        <line x1={-122 * d} y1={0} x2={122 * d} y2={0} stroke={GREEN} strokeWidth={6} />
        <circle cx={-122 * d} r={8} fill={GREEN} />
        <circle cx={122 * d} r={8} fill={GREEN} />
        <rect x={-48} y={-26} width={96} height={52} rx={10} fill={GREEN} opacity={d} />
        <text y={16} textAnchor="middle" fontFamily={anton} fontSize={44} fill={INK} opacity={d}>
          25"
        </text>
      </svg>
    );
  }
  if (type === "racks") {
    const barre = (label: string, v: number, i: number) => {
      const h = ramp(f, a + i * 5, 20, 0, (v / 80) * 170, Easing.out(Easing.back(1.4)));
      return (
        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 250 }}>
          <div style={{ fontFamily: anton, fontSize: 40, color: "#fff" }}>{Math.round((h / 170) * 80)} kg</div>
          <div style={{ width: 80, height: h, borderRadius: 12, background: i ? GREEN : "#fff", boxShadow: i ? `0 0 26px ${GREEN}` : undefined }} />
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 26, color: "rgba(255,255,255,0.85)", marginTop: 8 }}>{label}</div>
        </div>
      );
    };
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 50 }}>
        {barre("AVANT", 40, 0)}
        {barre("ARRIÈRE", 80, 1)}
        <div
          style={{
            alignSelf: "center",
            fontFamily: anton,
            fontSize: 70,
            color: INK,
            background: GREEN,
            padding: "4px 22px",
            borderRadius: 12,
            transform: `scale(${popIn(f, a + 22)}) rotate(-4deg)`,
          }}
        >
          +33 %
        </div>
      </div>
    );
  }
  return <WidgetAnime type={type} />;
};

/* =========================================================================================
   Gabarits de scène
   ========================================================================================= */

/** Bandeau de progression des chapitres (haut de la zone sûre). */
const BarreChapitres: React.FC = () => {
  const f = useCurrentFrame();
  if (f < PAUSE || f >= FIN_CHAPITRES) return null;
  const idx = CHAPITRES.filter((c) => f >= c.debut).length - 1;
  const c = CHAPITRES[idx];
  const op = ramp(f, PAUSE, 10, 0, 1) * (1 - ramp(f, FIN_CHAPITRES - 10, 10, 0, 1));
  return (
    <div style={{ position: "absolute", top: 262, left: 70, right: 70, opacity: op }}>
      <div style={{ display: "flex", gap: 8 }}>
        {CHAPITRES.map((k, i) => {
          const fin = i < CHAPITRES.length - 1 ? CHAPITRES[i + 1].debut : FIN_CHAPITRES;
          return (
            <div key={k.num} style={{ flex: 1, height: 8, borderRadius: 5, background: "rgba(255,255,255,0.28)", overflow: "hidden" }}>
              <div style={{ width: `${interpolate(f, [k.debut, fin], [0, 100], clamp)}%`, height: "100%", background: GREEN }} />
            </div>
          );
        })}
      </div>
      <div key={c.num} style={{ marginTop: 12, fontFamily: manrope, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: "#fff", filter: ombre, opacity: ramp(f - c.debut, 0, 10, 0, 1) }}>
        <span style={{ color: GREEN }}>{c.num}</span> · {c.nom}
      </div>
    </div>
  );
};

/** Carte de chapitre : grand numéro qui se dessine, titre, sous-titre. */
const Chapitre: React.FC<{ num: string; titre: string[]; sous: string; src: string; dur: number; entree: Entree; ample?: boolean }> = ({
  num,
  titre,
  sous,
  src,
  dur,
  entree,
  ample = false,
}) => {
  const f = useCurrentFrame() - T;
  const trace = ramp(f, 0, ample ? 30 : 16, 2600, 0, Easing.out(Easing.cubic));
  const rempli = ramp(f, ample ? 24 : 12, 10, 0, 1);
  return (
    <AbsoluteFill>
      <Plan uid={`ch${num}`} src={src} dur={dur + T} entree={entree} zoom={ample ? [1.0, 1.1] : [1.06, 1.16]} sombre={0.35} />
      <Voile force={0.6} haut={0.4} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text
          x={80}
          y={760}
          fontFamily={anton}
          fontSize={460}
          fill={`rgba(141,198,63,${rempli * 0.9})`}
          stroke={GREEN}
          strokeWidth={5}
          strokeDasharray={2600}
          strokeDashoffset={trace}
        >
          {num}
        </text>
      </svg>
      <div style={{ position: "absolute", top: 800, left: 80, right: 80 }}>
        <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 34, letterSpacing: 10, color: "rgba(255,255,255,0.8)", opacity: ramp(f, 4, 8, 0, 1), filter: ombre }}>
          CHAPITRE {num}
        </div>
        <Lignes lignes={titre} at={ample ? 14 : 6} taille={titre.some((l) => l.length > 10) ? 118 : 160} align="left" ecart={4} />
        <div style={{ height: 8, background: RED, width: `${ramp(f, ample ? 22 : 12, 14, 0, 60)}%`, margin: "16px 0 18px" }} />
        <Lignes lignes={[sous]} at={ample ? 28 : 16} taille={44} police={manrope} graisse={800} align="left" />
      </div>
      {ample ? <Bandes at={0} h={120} /> : null}
      <Flash at={T} dur={6} max={ample ? 0.25 : 0.5} />
    </AbsoluteFill>
  );
};

/** Scène « fiche technique » : étiquette, grande valeur animée, détail, widget dans une carte en verre. */
type Spec = {
  src: string;
  etiquette: string;
  valeur?: number;
  dec?: number;
  unite?: string;
  avant?: string;
  grand?: string;
  detail: string;
  widget?: WidgetLong;
  entree: Entree;
};

const ScenePlan: React.FC<{ s: Spec; dur: number; uid: string; split?: string }> = ({ s, dur, uid, split }) => {
  const f = useCurrentFrame() - T;
  const tailleGrand = s.grand ? Math.min(230, 960 / (s.grand.length * 0.5)) : 250;
  return (
    <AbsoluteFill>
      {split ? (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H / 2, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -H / 4, left: 0, width: W, height: H }}>
              <Plan uid={`${uid}a`} src={s.src} dur={dur + T} entree="whipG" />
            </div>
          </div>
          <div style={{ position: "absolute", top: H / 2, left: 0, width: W, height: H / 2, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -H / 4, left: 0, width: W, height: H }}>
              <Plan uid={`${uid}b`} src={split} dur={dur + T} entree="whipD" />
            </div>
          </div>
          <div style={{ position: "absolute", top: H / 2 - 5, left: 0, right: 0, height: 10, background: GREEN, transform: `scaleX(${ramp(f, 2, 12, 0, 1)})` }} />
        </>
      ) : (
        <Plan uid={uid} src={s.src} dur={dur + T} entree={s.entree} zoom={[1.03, 1.13]} />
      )}
      <Voile force={0.6} haut={0.55} />
      <Sequence from={T}>
        <div style={{ position: "absolute", top: 350, left: 70, right: 70 }}>
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: GREEN, opacity: ramp(f, 0, 6, 0, 1), filter: ombre }}>{s.etiquette}</div>
          <div style={{ fontFamily: anton, color: "#fff", lineHeight: 1.02, filter: ombre, transform: `translateY(${ramp(f, 0, 10, 60, 0)}px)`, opacity: ramp(f, 0, 6, 0, 1) }}>
            {s.avant ? <span style={{ fontSize: 80, marginRight: 14 }}>{s.avant}</span> : null}
            {s.valeur !== undefined ? (
              <span style={{ fontSize: 250 }}>
                <Compteur valeur={s.valeur} at={2} dec={s.dec} dur={20} />
              </span>
            ) : (
              <span style={{ fontSize: tailleGrand }}>{s.grand}</span>
            )}
            {s.unite ? <span style={{ fontSize: 110, color: GREEN, marginLeft: 12 }}>{s.unite}</span> : null}
          </div>
          <div style={{ height: 8, background: RED, width: `${ramp(f, 6, 12, 0, 34)}%`, margin: "10px 0 20px" }} />
          <Lignes lignes={[s.detail]} at={8} taille={44} police={manrope} graisse={800} align="left" interligne={1.25} />
        </div>
        {s.widget ? (
          <div
            style={{
              position: "absolute",
              top: 905,
              left: 60,
              right: 60,
              height: 330,
              borderRadius: 30,
              background: "rgba(16,18,22,0.42)",
              backdropFilter: "blur(22px) saturate(1.4)",
              WebkitBackdropFilter: "blur(22px) saturate(1.4)",
              border: "1.5px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: ramp(f, 6, 10, 0, 1),
              transform: `translateY(${ramp(f, 6, 12, 70, 0)}px)`,
            }}
          >
            <div style={{ transform: `scale(${["comptetours", "pneu", "disque", "cadenas", "rayons", "ecran", "batterie"].includes(s.widget) ? 1.25 : 1})` }}>
              <WidgetLongAnime type={s.widget} />
            </div>
          </div>
        ) : null}
        <Visee />
        <Flash dur={5} max={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* =========================================================================================
   Scènes propres à la version longue
   ========================================================================================= */

const ACCROCHE: { src: string; from: number; dur: number; entree: Entree }[] = [
  { src: "01-phares-on", from: 0, dur: 64, entree: "coupe" },
  { src: "L02-feux-ar-led", from: 64, dur: 64, entree: "whipG" },
  { src: "04-badge-c5", from: 128, dur: 64, entree: "zoom" },
  { src: "08-travelling-showroom", from: 192, dur: 65, entree: "glitch" },
];

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const tension = interpolate(f, [192, DROP1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ transform: `${secousse(f, [82, 146], 14, 7)} scale(${1 + tension * 0.07})` }}>
      {ACCROCHE.map((c, i) => (
        <Sequence key={c.src} from={c.from - (i ? T : 0)} durationInFrames={c.dur + (i ? T : 0)}>
          <Plan uid={`in${i}`} src={c.src} dur={c.dur + T} entree={c.entree} zoom={i === 3 ? [1.0, 1.45] : [1.02, 1.14]} />
        </Sequence>
      ))}
      <Voile force={0.5} haut={0.25} />
      <Sequence durationInFrames={64}>
        <div style={{ position: "absolute", top: 620, left: 0, right: 0 }}>
          <Lignes lignes={["CFMOTO"]} at={6} taille={56} police={manrope} graisse={800} espacement={22} couleur={GREEN} />
          <div style={{ height: 40 }} />
          <Lignes lignes={["NOUVELLE", "GÉNÉRATION"]} at={12} taille={170} ecart={5} />
        </div>
      </Sequence>
      <Sequence from={64} durationInFrames={64}>
        <div style={{ position: "absolute", top: 640, left: 0, right: 0 }}>
          <Lignes lignes={["MOINS DE"]} at={2} taille={140} />
        </div>
        <Slam texte="SUPERFLU." at={18} taille={200} top={820} />
      </Sequence>
      <Sequence from={128} durationInFrames={64}>
        <div style={{ position: "absolute", top: 640, left: 0, right: 0 }}>
          <Lignes lignes={["PLUS DE"]} at={2} taille={140} />
        </div>
        <Slam texte="CARACTÈRE." at={18} taille={190} couleur={GREEN} top={820} />
      </Sequence>
      <Sequence from={192} durationInFrames={65}>
        <div style={{ position: "absolute", top: 700, left: 0, right: 0 }}>
          <Lignes lignes={["DÉCOUVREZ-LE"]} at={4} taille={150} />
          <div
            style={{
              textAlign: "center",
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 58,
              color: GREEN,
              letterSpacing: interpolate(f, [206, DROP1], [46, 10], clamp),
              opacity: ramp(f - 192, 14, 8, 0, 1),
              filter: ombre,
            }}
          >
            EN DÉTAIL
          </div>
        </div>
      </Sequence>
      {[240, 245, 249, 252, 255].map((at) => (
        <Flash key={at} at={at} dur={2} max={0.35} />
      ))}
      <Fuite at={0} dur={50} />
      <Fuite at={128} dur={36} sens={-1} />
    </AbsoluteFill>
  );
};

const Apercu: React.FC = () => {
  const f = useCurrentFrame() - T;
  const tuiles = [
    { v: "498,6 cc", l: "Cylindrée" },
    { v: "39 CV", l: "Puissance" },
    { v: "373 kg", l: "En ordre de marche" },
    { v: "T3b", l: "Homologation" },
  ];
  return (
    <AbsoluteFill>
      <Plan uid="ap" src="L05-orbite" dur={161 + T} entree="zoom" zoom={[1.0, 1.08]} />
      <Voile force={0.5} haut={0.55} />
      <Sequence from={T}>
        <div style={{ position: "absolute", top: 330, left: 70, right: 70 }}>
          <Lignes lignes={["LE QUAD UTILITAIRE", "*NOUVELLE GÉNÉRATION*"]} at={2} taille={104} align="left" ecart={5} />
        </div>
        <div style={{ position: "absolute", top: 880, left: 60, right: 60, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {tuiles.map((t, i) => (
            <div
              key={t.v}
              style={{
                padding: "22px 26px",
                borderRadius: 24,
                background: "rgba(16,18,22,0.45)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1.5px solid rgba(255,255,255,0.22)",
                transform: `scale(${popIn(f, 14 + i * Math.round(BEAT))})`,
              }}
            >
              <div style={{ fontFamily: anton, fontSize: 86, color: i === 3 ? GREEN : "#fff", lineHeight: 1 }}>{t.v}</div>
              <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 28, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>{t.l}</div>
            </div>
          ))}
        </div>
        <Flash dur={6} max={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Sommaire: React.FC = () => {
  const f = useCurrentFrame() - T;
  return (
    <AbsoluteFill>
      <Plan uid="so" src="L06-showroom" dur={152 + T} entree="whipG" zoom={[1.0, 1.1]} sombre={0.5} />
      <Voile force={0.45} haut={0.5} />
      <Sequence from={T}>
        <div style={{ position: "absolute", top: 330, left: 80, right: 80 }}>
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 40, letterSpacing: 14, color: GREEN, opacity: ramp(f, 0, 8, 0, 1), filter: ombre }}>AU PROGRAMME</div>
          <div style={{ marginTop: 18 }}>
            {CHAPITRES.map((c, i) => {
              const at = 8 + i * 9;
              const p = ramp(f, at, 12, 0, 1, Easing.out(Easing.cubic));
              return (
                <div key={c.num} style={{ overflow: "hidden", padding: "6px 0" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 26, transform: `translateX(${(1 - p) * -700}px)`, opacity: p, filter: ombre }}>
                    <span style={{ fontFamily: anton, fontSize: 66, color: GREEN, width: 90 }}>{c.num}</span>
                    <span style={{ fontFamily: anton, fontSize: c.nom.length > 14 ? 56 : 76, color: "#fff" }}>{c.nom}</span>
                  </div>
                  <div style={{ height: 2, background: "rgba(255,255,255,0.25)", width: `${p * 100}%`, marginTop: 6 }} />
                </div>
              );
            })}
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Dimensions : cotes animées sur le plan de profil. */
const Dimensions: React.FC = () => {
  const f = useCurrentFrame() - T;
  const dec = -130; // le plan est remonté pour garder les cotes dans la zone sûre
  const L = ramp(f, 10, 18, 0, 1, Easing.out(Easing.cubic));
  const Hh = ramp(f, 22, 18, 0, 1, Easing.out(Easing.cubic));
  const yBas = 1270 + dec;
  const yHaut = 470 + dec;
  const puces = ["373 KG", "BRAQUAGE 2,8 M", "EMPATTEMENT 1 290 MM"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: dec, left: 0, width: W, height: H }}>
        <Plan uid="dim" src="L35-profil" dur={100 + T} entree="whipD" zoom={[1.0, 1.03]} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 30%, transparent 55%, rgba(0,0,0,0.75) 72%, #000 100%)" }} />
      <Sequence from={T}>
        <div style={{ position: "absolute", top: 300, left: 70, right: 70 }}>
          <Lignes lignes={["COMPACT ET *MANIABLE.*"]} at={0} taille={104} align="left" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
            {puces.map((p, i) => (
              <div
                key={p}
                style={{
                  fontFamily: manrope,
                  fontWeight: 800,
                  fontSize: 28,
                  color: i === 0 ? INK : "#fff",
                  background: i === 0 ? GREEN : "rgba(16,18,22,0.6)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  padding: "8px 18px",
                  borderRadius: 999,
                  transform: `scale(${popIn(f, 40 + i * 6)})`,
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {/* longueur */}
          <line x1={30} y1={yBas + 40} x2={30 + 900 * L} y2={yBas + 40} stroke={GREEN} strokeWidth={6} />
          <line x1={30} y1={yBas + 18} x2={30} y2={yBas + 62} stroke={GREEN} strokeWidth={6} opacity={L > 0 ? 1 : 0} />
          <line x1={930} y1={yBas + 18} x2={930} y2={yBas + 62} stroke={GREEN} strokeWidth={6} opacity={L > 0.98 ? 1 : 0} />
          <text x={480} y={yBas + 110} textAnchor="middle" fontFamily={anton} fontSize={64} fill="#fff" opacity={L}>
            2 165 mm
          </text>
          {/* hauteur */}
          <line x1={1000} y1={yBas} x2={1000} y2={yBas - (yBas - yHaut) * Hh} stroke={GREEN} strokeWidth={6} />
          <line x1={978} y1={yBas} x2={1022} y2={yBas} stroke={GREEN} strokeWidth={6} opacity={Hh > 0 ? 1 : 0} />
          <line x1={978} y1={yHaut} x2={1022} y2={yHaut} stroke={GREEN} strokeWidth={6} opacity={Hh > 0.98 ? 1 : 0} />
          <text x={960} y={(yBas + yHaut) / 2} textAnchor="middle" fontFamily={anton} fontSize={56} fill="#fff" opacity={Hh} transform={`rotate(-90 960 ${(yBas + yHaut) / 2})`}>
            1 265 mm
          </text>
        </svg>
        <Flash dur={5} max={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Pour: React.FC = () => {
  const f = useCurrentFrame() - T;
  const usages = ["EXPLOITATION AGRICOLE", "FORÊT", "CHASSE", "RANDONNÉE"];
  return (
    <AbsoluteFill>
      <Plan uid="pour" src="L36-chien" dur={120 + T} entree="fondu" zoom={[1.0, 1.08]} />
      <Voile force={0.55} haut={0.45} />
      <Sequence from={T}>
        <div style={{ position: "absolute", top: 360, left: 80, right: 80 }}>
          <Lignes lignes={["CONÇU POUR", "*LES PROS*"]} at={4} taille={120} align="left" ecart={4} />
          <div style={{ height: 24 }} />
          <Lignes lignes={["ET LES PARTICULIERS", "*EXIGEANTS.*"]} at={30} taille={92} align="left" ecart={4} />
        </div>
        <div style={{ position: "absolute", top: 1040, left: 70, right: 70, display: "flex", flexWrap: "wrap", gap: 14 }}>
          {usages.map((u, i) => (
            <div
              key={u}
              style={{
                fontFamily: manrope,
                fontWeight: 800,
                fontSize: 32,
                color: "#fff",
                background: "rgba(16,18,22,0.55)",
                border: `2px solid ${GREEN}`,
                padding: "10px 22px",
                borderRadius: 999,
                transform: `scale(${popIn(f, 60 + i * 8)})`,
              }}
            >
              {u}
            </div>
          ))}
        </div>
      </Sequence>
      <Bandes at={0} h={110} />
      <Fuite at={0} dur={46} teinte="255,150,60" />
    </AbsoluteFill>
  );
};

/* =========================================================================================
   Chronologie
   ========================================================================================= */

type Bloc = { from: number; dur: number; spec?: Spec; split?: string; chapitre?: { num: string; titre: string[]; sous: string; src: string; entree: Entree; ample?: boolean } };

const BLOCS: Bloc[] = [
  // 01 PUISSANCE
  { from: PAUSE, dur: DROP2 - PAUSE, chapitre: { num: "01", titre: ["PUISSANCE"], sous: "Moteur 192R nouvelle génération", src: "L07-moteur-ralenti", entree: "fondu", ample: true } },
  { from: DROP2, dur: 57, spec: { src: "L08-cylindree", etiquette: "CYLINDRÉE", valeur: 498.6, dec: 1, unite: "cc", detail: "Monocylindre 4 temps, 4 soupapes DOHC", entree: "zoom" } },
  { from: 931, dur: 57, spec: { src: "L09-puissance", etiquette: "PUISSANCE", valeur: 39, unite: "CV", detail: "À 7 500 tr/min, réponse vive et contrôlable", widget: "comptetours", entree: "whipG" } },
  { from: 988, dur: 57, spec: { src: "L10-couple", etiquette: "COUPLE", valeur: 43.5, dec: 1, unite: "N.m", detail: "À 5 000 tr/min · moteur 9,2 kg plus léger que la génération précédente", entree: "whipD" } },
  { from: 1045, dur: VARIATION - 1045, spec: { src: "L11-reservoir", etiquette: "RÉSERVOIR", valeur: 17, unite: "L", detail: "Injection EFI Bosch · démarreur électrique", entree: "haut" } },
  // 02 TRANSMISSION
  { from: VARIATION, dur: 60, chapitre: { num: "02", titre: ["TRANSMISSION"], sous: "CVT haute efficacité", src: "L12-guidon", entree: "whipG" } },
  { from: 1161, dur: 63, spec: { src: "L13-selecteur", etiquette: "BOÎTE AUTOMATIQUE", grand: "CVT", detail: "Sélecteur L / H / N / R / P · embrayage CVTech", widget: "lettres", entree: "zoom" } },
  { from: 1224, dur: RELANCE - 1224, spec: { src: "L14-cardan", etiquette: "CROISIÈRE BASSE VITESSE", avant: "≈", valeur: 7, unite: "km/h", detail: "Transmission par arbre et cardan, conçue pour durer", entree: "glitch" } },
  // 03 CHÂSSIS
  { from: RELANCE, dur: 60, chapitre: { num: "03", titre: ["CHÂSSIS"], sous: "Encaisse les pires irrégularités", src: "L15-ch3", entree: "zoom" } },
  { from: 1346, dur: 84, spec: { src: "L16-amortisseur", etiquette: "DÉBATTEMENT ARRIÈRE", valeur: 235, unite: "mm", detail: "Suspensions indépendantes doubles triangles · 210 mm à l'avant", widget: "double", entree: "whipG" } },
  { from: 1430, dur: 84, spec: { src: "L17-pneu", etiquette: "PNEUS TOUT-TERRAIN", valeur: 25, unite: "\"", detail: "AV 25 x 8-12 · AR 25 x 10-12 · jantes acier", widget: "pneu", entree: "whipD" } },
  { from: 1514, dur: 1596 - 1514, spec: { src: "L18-freins", etiquette: "FREINAGE", grand: "DOUBLE DISQUE", detail: "Hydraulique + disque central arrière, décélération maîtrisée", widget: "disque", entree: "haut" } },
  // 04 ÉCLAIRAGE & CONNECTIVITÉ
  { from: 1596, dur: 60, chapitre: { num: "04", titre: ["ÉCLAIRAGE &", "CONNECTIVITÉ"], sous: "Voir et être vu, rester connecté", src: "L19-ch4", entree: "glitch" } },
  { from: 1656, dur: 90, split: "L21-led-ar", spec: { src: "L20-led-av", etiquette: "FULL LED DOT MATRIX", avant: "+ de", valeur: 20000, unite: "cd", detail: "Position, croisement / route et recul", entree: "whipG" } },
  { from: 1746, dur: 80, spec: { src: "L22-ecran", etiquette: "TABLEAU DE BORD", valeur: 5.9, dec: 1, unite: "\" LCD", detail: "Toutes les infos d'un coup d'œil", widget: "ecran", entree: "zoom" } },
  { from: 1826, dur: MONTEE - 1826, spec: { src: "L23-usb", etiquette: "USB-C + USB-A + 12V", valeur: 18, unite: "W", detail: "Restez connecté pendant toutes vos sorties", widget: "batterie", entree: "whipD" } },
  // 05 CHARGE UTILE
  { from: MONTEE, dur: PIC - MONTEE, chapitre: { num: "05", titre: ["CHARGE UTILE"], sous: "Capacité de charge renforcée", src: "L24-ch5", entree: "fondu", ample: true } },
  { from: PIC, dur: 76, spec: { src: "L25-racks", etiquette: "PORTE-BAGAGE ARRIÈRE", valeur: 80, unite: "kg", detail: "40 kg à l'avant · acier structurel 2 mm · +33 % vs génération précédente", widget: "racks", entree: "zoom" } },
  { from: 2110, dur: 76, spec: { src: "L26-molle", etiquette: "FIXATION RAPIDE", grand: "CF-CONNECT", detail: "+ points d'ancrage MOLLE : chargement sécurisé et modulable", entree: "whipG" } },
  { from: 2186, dur: 76, spec: { src: "L27-treuil", etiquette: "TREUIL DE SÉRIE", valeur: 1130, unite: "kg", detail: "Câble nylon · crochet avant haute résistance", widget: "barre", entree: "whipD" } },
  { from: 2262, dur: 2340 - 2262, spec: { src: "L28-attelage", etiquette: "REMORQUAGE", grand: "ATTELAGE", detail: "Boule d'attelage + prise remorque", widget: "puces", entree: "glitch" } },
  // 06 SÉCURITÉ
  { from: 2340, dur: 60, chapitre: { num: "06", titre: ["SÉCURITÉ &", "SÉRÉNITÉ"], sous: "Les détails qui rassurent", src: "L29-ch6", entree: "zoom" } },
  { from: 2400, dur: 83, spec: { src: "L30-blocage", etiquette: "BLOCAGE DE SÉLECTEUR", grand: "ANTI-VOL", detail: "Et stationnement sécurisé en pente", widget: "cadenas", entree: "whipG" } },
  { from: 2483, dur: 83, spec: { src: "L31-repose-pieds", etiquette: "REPOSE-PIEDS", grand: "ANTIDÉRAPANTS", detail: "Maintien sécurisé même sur sol gras ou boueux", entree: "haut" } },
  { from: 2566, dur: 2650 - 2566, spec: { src: "L32-bouchon", etiquette: "BOUCHON DE CARBURANT", grand: "VERROUILLABLE", detail: "Votre plein reste protégé", entree: "whipD" } },
];

/* =========================================================================================
   Bruitages
   ========================================================================================= */

type Sfx = { s: string; at: number; v: number };
const sfxBlocs: Sfx[] = BLOCS.flatMap((b, i) => {
  const out: Sfx[] = [];
  const entree = b.spec?.entree ?? b.chapitre?.entree;
  if (i > 0 && entree !== "fondu") out.push({ s: entree === "glitch" ? "glitch" : "whoosh-court", at: b.from - 5, v: 0.45 });
  if (b.chapitre && !b.chapitre.ample) out.push({ s: "impact", at: b.from + 2, v: 0.45 });
  if (b.spec?.widget === "cadenas") out.push({ s: "tampon", at: b.from + 18, v: 0.45 });
  if (b.spec?.widget === "disque") out.push({ s: "tampon", at: b.from + 22, v: 0.35 });
  return out;
});

const SFX: Sfx[] = [
  { s: "whoosh", at: 60, v: 0.5 },
  { s: "impact", at: 82, v: 0.5 },
  { s: "whoosh", at: 124, v: 0.5 },
  { s: "impact", at: 146, v: 0.55 },
  { s: "glitch", at: 186, v: 0.5 },
  { s: "riser", at: DROP1 - 60, v: 0.6 },
  { s: "impact", at: DROP1, v: 0.9 },
  { s: "sub-drop", at: DROP1, v: 0.9 },
  { s: "whoosh", at: DROP1 + 22, v: 0.6 },
  { s: "impact", at: DROP1 + 50, v: 0.5 },
  { s: "whoosh-court", at: 359 - 5, v: 0.5 },
  ...[0, 1, 2, 3].map((i) => ({ s: "tic", at: 359 + 14 + i * Math.round(BEAT), v: 0.45 })),
  { s: "whoosh", at: 520 - 5, v: 0.5 },
  { s: "whoosh", at: PAUSE - 4, v: 0.3 },
  { s: "impact", at: DROP2, v: 0.85 },
  { s: "sub-drop", at: DROP2, v: 0.7 },
  ...sfxBlocs.filter((x) => x.at !== DROP2 - 5),
  { s: "whoosh-court", at: 2650 - 5, v: 0.45 },
  { s: "tampon", at: 2650 + 9, v: 0.7 },
  { s: "whoosh-court", at: 2695 - 5, v: 0.45 },
  { s: "tampon", at: 2695 + 9, v: 0.7 },
  { s: "whoosh", at: 2740 - 5, v: 0.5 },
  { s: "whoosh", at: 2840 - 5, v: 0.35 },
  { s: "impact", at: 2960, v: 0.8 },
  { s: "sub-drop", at: 2960, v: 0.6 },
  { s: "whoosh", at: 3090 - 6, v: 0.55 },
  { s: "impact", at: 3090 + 10, v: 0.5 },
];

/* =========================================================================================
   Montage
   ========================================================================================= */

const pulsation = (f: number) => {
  const zones: [number, number][] = [
    [DROP1, PAUSE],
    [DROP2, VARIATION],
    [RELANCE, MONTEE],
    [PIC, 3120],
  ];
  for (const [a, b] of zones) {
    if (f >= a && f < b) {
      const k = ((f - a) % (BEAT * 2)) / 6;
      return 1 + Math.max(0, 1 - k) * 0.015;
    }
  }
  return 1;
};

export const MonsterQuadCforceC5Long: React.FC<{ withAudio: boolean }> = ({ withAudio }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ transform: `scale(${pulsation(f)})` }}>
        <Sequence durationInFrames={DROP1}>
          <Intro />
        </Sequence>
        <Sequence from={DROP1} durationInFrames={DUREE_REV}>
          <Revelation />
        </Sequence>
        <Sequence from={359 - T} durationInFrames={161 + T}>
          <Apercu />
        </Sequence>
        <Sequence from={520 - T} durationInFrames={152 + T}>
          <Sommaire />
        </Sequence>
        {BLOCS.map((b, i) => (
          <Sequence key={i} from={b.from - T} durationInFrames={b.dur + T}>
            {b.chapitre ? (
              <Chapitre {...b.chapitre} dur={b.dur} />
            ) : b.spec ? (
              <AbsoluteFill style={{ transform: b.from === DROP2 ? secousse(f - b.from, [0], 26, 10) : undefined }}>
                <ScenePlan s={b.spec} dur={b.dur} uid={`b${i}`} split={b.split} />
              </AbsoluteFill>
            ) : null}
          </Sequence>
        ))}
        <Sequence from={2650 - T} durationInFrames={45 + T}>
          <Tampon uid="t1" src="17-t3b-arriere" lignes={["HOMOLOGUÉ", "T3b"]} sous="Carte grise 13,76 € HT · TVA récupérable pour les pros" frappe={T + 4} />
        </Sequence>
        <Sequence from={2695 - T} durationInFrames={45 + T}>
          <Tampon uid="t2" src="18-garantie-profil" lignes={["GARANTIE", "5 ANS"]} sous="Dans le réseau CFMOTO France" frappe={T + 4} />
        </Sequence>
        <Sequence from={2740 - T} durationInFrames={100 + T}>
          <Dimensions />
        </Sequence>
        <Sequence from={2840 - T} durationInFrames={120 + T}>
          <Pour />
        </Sequence>
        <Sequence from={2960} durationInFrames={130}>
          <Prix />
        </Sequence>
        <Sequence from={3090 - T} durationInFrames={FIN - 3090 + T}>
          <Appel />
        </Sequence>
        <BarreChapitres />
      </AbsoluteFill>
      <Grain />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
      {withAudio ? (
        <>
          <Audio
            src={staticFile("monsterquad/musique-protesting-robot-mixkit.mp3")}
            volume={(fr) => interpolate(fr, [0, 3, FIN - 24, FIN], [0, 0.8, 0.8, 0], clamp)}
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
