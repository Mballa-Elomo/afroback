// Vidéo démo de prospection (pas AFROBACK) : Segway Villain SX10 Deluxe pour MonsterQuad.fr.
// 30 s, 1080 × 1920. Tout est animé à partir des 4 photos produit du site (détourées),
// pour montrer qu'on peut faire une vidéo de chaque fiche produit sans tournage.
// Musique : « Rought and Ready », Ahjay Stelino (licence Mixkit). Montée 0-11 s, drop à 11 s.
// Données produit : fiche monsterquad.fr relevée le 2026-10-01.
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
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
const manrope = loadManrope("normal", { weights: ["600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;

const W = 1080;
const RED = "#E71800";
const GREEN = "#8DC63F";
const INK = "#0D0E11";
const PLATE = "#272D31"; // fond du logo MonsterQuad

const img = (n: string) => staticFile(`monsterquad/villain-${n}-detoure.png`);
// Dimensions des détourages (px) pour placer les points focaux.
const DIM: Record<string, [number, number]> = {
  "548801": [1566, 988],
  "548802": [1582, 994],
  "548803": [1430, 742],
  "548804": [1538, 798],
};

const expoOut = Easing.out(Easing.exp);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number, from: number, to: number, e = expoOut) =>
  interpolate(f, [a, a + d], [from, to], { ...clamp, easing: e });
const punch = (f: number, at: number) => (f < at ? 0 : ramp(f, at, 5, 1.45, 1, Easing.out(Easing.quad)));

/* ---------- Fond commun ---------- */

const Fond: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 45% at 50% 42%, rgba(231,24,0,0.28), transparent 70%)`,
        }}
      />
      {/* bandes diagonales qui défilent */}
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.07 }}>
        <defs>
          <pattern id="stripes" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform={`rotate(-30) translate(${(f * 4) % 120} 0)`}>
            <rect width="40" height="120" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stripes)" />
      </svg>
    </AbsoluteFill>
  );
};

/* Lignes de vitesse horizontales */
const Vitesse: React.FC<{ intensite?: number; seed: string }> = ({ intensite = 1, seed }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: intensite }}>
      {new Array(26).fill(0).map((_, i) => {
        const y = random(`${seed}y${i}`) * 1920;
        const len = 200 + random(`${seed}l${i}`) * 500;
        const speed = 60 + random(`${seed}s${i}`) * 80;
        const x = W + 600 - ((f * speed + random(`${seed}o${i}`) * 3000) % (W + 1400));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: len,
              height: 3 + random(`${seed}h${i}`) * 4,
              background: i % 5 === 0 ? RED : "rgba(255,255,255,0.55)",
              borderRadius: 4,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* Flash blanc */
const Flash: React.FC<{ at: number; dur?: number; max?: number }> = ({ at, dur = 8, max = 0.85 }) => {
  const f = useCurrentFrame();
  const o = f < at ? 0 : interpolate(f, [at, at + dur], [max, 0], clamp);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/* Secousse */
const shake = (f: number, hits: number[], amp = 14, dur = 6) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    if (f >= h && f < h + dur) {
      const k = 1 - (f - h) / dur;
      x += (random(`x${h}${f}`) * 2 - 1) * amp * k;
      y += (random(`y${h}${f}`) * 2 - 1) * amp * k;
    }
  }
  return `translate(${x}px, ${y}px)`;
};

/* Ombre au sol sous le véhicule */
const Ombre: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 0.75 }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - 40,
      width: w,
      height: 80,
      borderRadius: "50%",
      background: `radial-gradient(ellipse at center, rgba(0,0,0,${o}) 0%, transparent 70%)`,
    }}
  />
);

/* ---------- Scène 1 : accroche chiffrée (0 – 3 s) ---------- */

const Accroche: React.FC = () => {
  const f = useCurrentFrame();
  const lignes = [
    { t: "1000 CC", at: 6 },
    { t: "105 CH", at: 34 },
    { t: "4X4", at: 60 },
  ];
  return (
    <AbsoluteFill style={{ transform: shake(f, lignes.map((l) => l.at)) }}>
      {lignes.map((l, i) => {
        const vis = f >= l.at;
        const s = punch(f, l.at);
        return (
          <div
            key={l.t}
            style={{
              position: "absolute",
              top: 470 + i * 330,
              width: "100%",
              textAlign: "center",
              opacity: vis ? 1 : 0,
              transform: `scale(${s})`,
            }}
          >
            <span style={{ fontFamily: anton, fontSize: 290, color: i === 2 ? RED : "#fff", letterSpacing: 6, lineHeight: 1 }}>{l.t}</span>
          </div>
        );
      })}
      {lignes.map((l) => (
        <Flash key={l.at} at={l.at} dur={6} max={0.5} />
      ))}
      <div
        style={{
          position: "absolute",
          bottom: 260,
          width: "100%",
          textAlign: "center",
          fontFamily: manrope,
          fontWeight: 800,
          fontSize: 44,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: 10,
          opacity: ramp(f, 66, 12, 0, 1),
        }}
      >
        UNE SEULE MACHINE
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scène 2 : révélation (3 – 7 s) ---------- */

const Revelation: React.FC = () => {
  const f = useCurrentFrame();
  const [iw, ih] = DIM["548802"];
  const dispW = 1260;
  const dispH = (dispW / iw) * ih;
  const x = ramp(f, 0, 22, 1200, 0);
  const blur = ramp(f, 0, 18, 18, 0);
  const sc = ramp(f, 0, 120, 1.0, 1.08, Easing.linear);
  const bande = ramp(f, 4, 16, 0, 1);
  return (
    <AbsoluteFill>
      <Vitesse seed="rev" intensite={ramp(f, 10, 30, 1, 0.25)} />
      {/* bande rouge inclinée */}
      <div
        style={{
          position: "absolute",
          left: -200,
          top: 900,
          width: 1500 * bande,
          height: 360,
          background: RED,
          transform: "skewY(-8deg)",
          boxShadow: "0 30px 80px rgba(231,24,0,0.4)",
        }}
      />
      <Ombre x={W / 2 + x} y={1400} w={1100} />
      <Img
        src={img("548802")}
        style={{
          position: "absolute",
          width: dispW,
          height: dispH,
          left: (W - dispW) / 2 + x,
          top: 1430 - dispH,
          filter: `blur(${blur}px) drop-shadow(0 30px 40px rgba(0,0,0,0.6))`,
          transform: `scale(${sc})`,
          transformOrigin: "50% 100%",
        }}
      />
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center" }}>
        <div
          style={{
            fontFamily: manrope,
            fontWeight: 800,
            fontSize: 46,
            letterSpacing: 14,
            color: GREEN,
            opacity: ramp(f, 18, 10, 0, 1),
          }}
        >
          SEGWAY
        </div>
        <div
          style={{
            fontFamily: anton,
            fontSize: 210,
            color: "#fff",
            lineHeight: 1.05,
            transform: `translateY(${ramp(f, 22, 14, 60, 0)}px)`,
            opacity: ramp(f, 22, 10, 0, 1),
          }}
        >
          VILLAIN
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "6px 34px",
            background: "#fff",
            color: INK,
            fontFamily: anton,
            fontSize: 72,
            letterSpacing: 4,
            transform: `scaleX(${ramp(f, 34, 12, 0, 1)})`,
          }}
        >
          SX10 DELUXE
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1540,
          width: "100%",
          textAlign: "center",
          fontFamily: manrope,
          fontWeight: 600,
          fontSize: 46,
          color: "rgba(255,255,255,0.85)",
          opacity: ramp(f, 50, 14, 0, 1),
          transform: `translateY(${ramp(f, 50, 14, 30, 0)}px)`,
        }}
      >
        Explorez un nouveau monde
        <br />
        <span style={{ color: GREEN, fontWeight: 800 }}>tout-terrain.</span>
      </div>
      <Flash at={0} dur={10} max={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 3 : vue de profil qui traverse (7 – 11 s) ---------- */

const Traversee: React.FC = () => {
  const f = useCurrentFrame();
  const [iw, ih] = DIM["548804"];
  const dispW = 1150;
  const dispH = (dispW / iw) * ih;
  // entre par la gauche, ralentit au centre, glisse légèrement
  const x = interpolate(f, [0, 26, 120], [-1300, -10, 60], { ...clamp, easing: Easing.out(Easing.cubic) });
  const bob = Math.sin(f * 0.9) * 3;
  return (
    <AbsoluteFill>
      <Vitesse seed="trav" intensite={0.9} />
      {/* sol */}
      <div style={{ position: "absolute", top: 1460, left: 0, width: "100%", height: 4, background: "rgba(255,255,255,0.12)" }} />
      <Ombre x={W / 2 + x} y={1460} w={1000} />
      <Img
        src={img("548804")}
        style={{
          position: "absolute",
          width: dispW,
          height: dispH,
          left: (W - dispW) / 2 + x,
          top: 1472 - dispH + bob,
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
        }}
      />
      {/* poussière derrière les roues */}
      {new Array(18).fill(0).map((_, i) => {
        const t = (f - 10 - i * 2) / 30;
        if (t < 0 || t > 1.4) return null;
        const px = W / 2 + x - 520 - t * 260 - random(`d${i}`) * 80;
        const py = 1430 - t * 120 * random(`e${i}`);
        const r = 30 + t * 90;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - r,
              top: py - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: "rgba(190,160,130,0.25)",
              opacity: Math.max(0, 1 - t),
              filter: "blur(10px)",
            }}
          />
        );
      })}
      <div style={{ position: "absolute", top: 380, left: 80, right: 80 }}>
        <div
          style={{
            fontFamily: anton,
            fontSize: 150,
            color: "#fff",
            lineHeight: 1,
            transform: `translateX(${ramp(f, 20, 14, -900, 0)}px)`,
          }}
        >
          4X4 À LA
        </div>
        <div
          style={{
            fontFamily: anton,
            fontSize: 150,
            color: RED,
            lineHeight: 1.05,
            transform: `translateX(${ramp(f, 26, 14, -900, 0)}px)`,
          }}
        >
          DEMANDE
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: manrope,
            fontWeight: 600,
            fontSize: 44,
            color: "rgba(255,255,255,0.85)",
            opacity: ramp(f, 44, 14, 0, 1),
            borderLeft: `8px solid ${GREEN}`,
            paddingLeft: 24,
          }}
        >
          Différentiels avant et arrière
          <br />
          avec blocage
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scène 4 : les équipements, zooms dans la photo (11 – 19 s) ---------- */

type Atout = { titre: string; sous?: string; photo: string; fx: number; fy: number; zoom: number };

// fx / fy = point focal en fraction de l'image détourée ; zoom = largeur affichée / 1080.
const ATOUTS: Atout[] = [
  { titre: "MOTEUR 1000 CC", sous: "Bicylindre 4 temps · 105 ch · 98 N.m", photo: "548804", fx: 0.25, fy: 0.6, zoom: 1.7 },
  { titre: "DIRECTION ASSISTÉE", sous: "Multi-modes", photo: "548802", fx: 0.5, fy: 0.5, zoom: 1.05 },
  { titre: "AMORTISSEURS À GAZ", sous: "Réglables", photo: "548804", fx: 0.25, fy: 0.62, zoom: 2.3 },
  { titre: "JANTES ALU 14\"", sous: "+ Beadlock", photo: "548802", fx: 0.52, fy: 0.78, zoom: 2.2 },
  { titre: "FEUX LED", photo: "548802", fx: 0.36, fy: 0.47, zoom: 2.4 },
  { titre: "TREUIL 2 T", photo: "548802", fx: 0.22, fy: 0.68, zoom: 2.4 },
  { titre: "SIÈGES BAQUETS", sous: "Harnais 4 points", photo: "548802", fx: 0.72, fy: 0.3, zoom: 2.0 },
  { titre: "ÉCRAN CENTRAL 10\"", sous: "Tableau de bord digital · Caméra de recul", photo: "548802", fx: 0.5, fy: 0.45, zoom: 1.25 },
];
const PAS = 30; // 1 s par équipement

const Atouts: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(ATOUTS.length - 1, Math.floor(f / PAS));
  const lf = f - i * PAS;
  const a = ATOUTS[i];
  const [iw, ih] = DIM[a.photo];
  const dispW = W * a.zoom * ramp(lf, 0, PAS, 1.12, 1, Easing.out(Easing.cubic));
  const dispH = (dispW / iw) * ih;
  const cx = W / 2;
  const cy = 820;
  const left = cx - a.fx * dispW + ramp(lf, 0, PAS, 30, -30, Easing.linear);
  const top = cy - a.fy * dispH;
  return (
    <AbsoluteFill style={{ transform: shake(f, ATOUTS.map((_, k) => k * PAS), 10, 5) }}>
      <Img
        src={img(a.photo)}
        style={{
          position: "absolute",
          width: dispW,
          height: dispH,
          left,
          top,
          filter: `blur(${ramp(lf, 0, 6, 10, 0)}px)`,
        }}
      />
      {/* cadre de visée */}
      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[
          [cx - 300, cy - 300, 1, 1],
          [cx + 300, cy - 300, -1, 1],
          [cx - 300, cy + 300, 1, -1],
          [cx + 300, cy + 300, -1, -1],
        ].map(([x, y, sx, sy], k) => {
          const o = ramp(lf, 2, 8, 80, 0);
          const X = x - sx * o;
          const Y = y - sy * o;
          return <path key={k} d={`M${X} ${Y + sy * 70} L${X} ${Y} L${X + sx * 70} ${Y}`} stroke={RED} strokeWidth={8} fill="none" />;
        })}
      </svg>
      {/* bandeau texte */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300 }}>
        <div
          style={{
            margin: "0 60px",
            padding: "30px 40px",
            background: "rgba(13,14,17,0.92)",
            borderLeft: `14px solid ${RED}`,
            transform: `translateX(${ramp(lf, 0, 10, -1100, 0)}px)`,
          }}
        >
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 34, color: GREEN, letterSpacing: 6 }}>
            {String(i + 1).padStart(2, "0")} / {String(ATOUTS.length).padStart(2, "0")}
          </div>
          <div style={{ fontFamily: anton, fontSize: 104, color: "#fff", lineHeight: 1.1 }}>{a.titre}</div>
          {a.sous ? (
            <div style={{ fontFamily: manrope, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.8)", opacity: ramp(lf, 6, 8, 0, 1) }}>
              {a.sous}
            </div>
          ) : null}
        </div>
      </div>
      <Flash at={0} dur={5} max={0.9} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 5 : deux coloris (19 – 23 s) ---------- */

const Coloris: React.FC = () => {
  const f = useCurrentFrame();
  const bloc = (n: string, label: string, accent: string, top: number, dir: number, at: number) => {
    const [iw, ih] = DIM[n];
    const dispW = 920;
    const dispH = (dispW / iw) * ih;
    return (
      <div style={{ position: "absolute", top, left: 0, width: W, height: 760 }}>
        <Ombre x={W / 2 + ramp(f, at, 18, dir * 1200, 0)} y={600} w={820} />
        <Img
          src={img(n)}
          style={{
            position: "absolute",
            width: dispW,
            height: dispH,
            left: (W - dispW) / 2 + ramp(f, at, 18, dir * 1200, 0),
            top: 610 - dispH,
            filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 640,
            width: "100%",
            textAlign: "center",
            fontFamily: anton,
            fontSize: 70,
            color: "#fff",
            opacity: ramp(f, at + 14, 10, 0, 1),
          }}
        >
          <span style={{ borderBottom: `8px solid ${accent}`, paddingBottom: 4 }}>{label}</span>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          textAlign: "center",
          fontFamily: anton,
          fontSize: 120,
          color: "#fff",
          transform: `scale(${punch(f, 0)})`,
        }}
      >
        2 COLORIS
      </div>
      {bloc("548801", "FULL BLACK", "#fff", 330, 1, 4)}
      {bloc("548802", "BLACK / GREEN", GREEN, 1080, -1, 14)}
      <Flash at={0} dur={6} max={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 6 : prix et financement (23 – 27 s) ---------- */

const Prix: React.FC = () => {
  const f = useCurrentFrame();
  const [iw, ih] = DIM["548803"];
  const dispW = 980;
  const dispH = (dispW / iw) * ih;
  const montant = Math.round(ramp(f, 8, 26, 0, 18990, Easing.out(Easing.cubic)));
  const txt = montant.toLocaleString("fr-FR").replace(/ | /g, " ");
  return (
    <AbsoluteFill>
      <Ombre x={W / 2} y={760} w={860} />
      <Img
        src={img("548803")}
        style={{
          position: "absolute",
          width: dispW,
          height: dispH,
          left: (W - dispW) / 2 + ramp(f, 0, 120, 30, -30, Easing.linear),
          top: 770 - dispH,
          opacity: ramp(f, 0, 10, 0, 1),
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
        }}
      />
      <div style={{ position: "absolute", top: 860, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: "rgba(255,255,255,0.7)" }}>
          À PARTIR DE
        </div>
        <div style={{ fontFamily: anton, fontSize: 230, color: "#fff", lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
          {txt} €
        </div>
        <div
          style={{
            display: "inline-block",
            background: RED,
            color: "#fff",
            fontFamily: anton,
            fontSize: 56,
            padding: "4px 30px",
            transform: `scale(${popIn(f, 36)})`,
          }}
        >
          TTC · EN STOCK
        </div>
        <div
          style={{
            marginTop: 70,
            fontFamily: manrope,
            fontWeight: 800,
            fontSize: 52,
            color: "#fff",
            opacity: ramp(f, 56, 12, 0, 1),
            transform: `translateY(${ramp(f, 56, 12, 40, 0)}px)`,
          }}
        >
          Financement possible
        </div>
        <div
          style={{
            fontFamily: manrope,
            fontWeight: 600,
            fontSize: 40,
            color: GREEN,
            opacity: ramp(f, 64, 12, 0, 1),
          }}
        >
          avec notre partenaire Sofinco
        </div>
      </div>
    </AbsoluteFill>
  );
};

const popIn = (f: number, at: number) => {
  if (f < at) return 0;
  if (f < at + 5) return ramp(f, at, 5, 0, 1.2);
  return ramp(f, at + 5, 5, 1.2, 1, Easing.out(Easing.quad));
};

/* ---------- Scène 7 : signature (27 – 30 s) ---------- */

const Signature: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          background: PLATE,
          padding: "40px 50px",
          borderRadius: 28,
          transform: `scale(${popIn(f, 2)})`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <Img src={staticFile("monsterquad/logo.png")} style={{ width: 760, height: (760 / 340) * 100, display: "block" }} />
      </div>
      <div
        style={{
          marginTop: 70,
          fontFamily: anton,
          fontSize: 110,
          color: "#fff",
          opacity: ramp(f, 14, 10, 0, 1),
          transform: `translateY(${ramp(f, 14, 12, 40, 0)}px)`,
        }}
      >
        MONSTERQUAD.FR
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: manrope,
          fontWeight: 600,
          fontSize: 40,
          color: "rgba(255,255,255,0.75)",
          opacity: ramp(f, 22, 10, 0, 1),
        }}
      >
        Quads · SSV · Motos électriques · Pièces
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 90,
          fontFamily: manrope,
          fontWeight: 600,
          fontSize: 26,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: 2,
          opacity: ramp(f, 30, 10, 0, 1),
        }}
      >
        Vidéo démo · motion design Yannick NSANA MADOU
      </div>
      <Flash at={0} dur={8} max={0.7} />
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */

export const MonsterQuadVillain: React.FC<{ withAudio: boolean }> = ({ withAudio }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Fond />
      <Sequence durationInFrames={90}>
        <Accroche />
      </Sequence>
      <Sequence from={90} durationInFrames={120}>
        <Revelation />
      </Sequence>
      <Sequence from={210} durationInFrames={120}>
        <Traversee />
      </Sequence>
      <Sequence from={330} durationInFrames={240}>
        <Atouts />
      </Sequence>
      <Sequence from={570} durationInFrames={120}>
        <Coloris />
      </Sequence>
      <Sequence from={690} durationInFrames={120}>
        <Prix />
      </Sequence>
      <Sequence from={810} durationInFrames={90}>
        <Signature />
      </Sequence>
      {withAudio ? (
        <Audio
          src={staticFile("monsterquad/musique-rought-and-ready-mixkit.mp3")}
          volume={(fr) => interpolate(fr, [0, 6, 870, 900], [0, 0.9, 0.9, 0], clamp)}
        />
      ) : null}
      {/* vignettage */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)", opacity: f >= 0 ? 1 : 0 }} />
    </AbsoluteFill>
  );
};
