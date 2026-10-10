/**
 * AFROBACK · Vidéo 8 · « Les faits sur la natte » : Paul Biya (31 s, 9:16), récit en mode « Mémoire ».
 * Script : recits/paul-biya/script.md · voix : recits/paul-biya/timing.json (voix préparées, atempo 1,04)
 * Neutralité : aucune personne réelle représentée, aucun chiffre contesté, aucune citation,
 * toutes les fiches identiques en forme, taille et couleur, aucune lumière de gloire.
 * La fin (fiche de l'app) est isolée dans biya-fin.tsx pour être remplacée par la vraie capture.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, cinzel, manrope, ramp, s } from "../theme";
import { Grain, Karaoke, LetterDrop } from "../fx";
import { Vig, w } from "../recit-kit";
import { B, ConstitutionBook, Diplomas, Ephemeride, FactCard, Folders, Hand, MapCard, Mat, NameCard, objShadow, Odometer, Pen, Soutane } from "./biya-props";
import { OutroBiya } from "./biya-fin";

export const BIYA_DUREE = 31;
const T_WORLD = 3.2; // la natte apparaît
const T_OUTRO = 27.4; // fin
const ease = Easing.inOut(Easing.cubic);

/* ---------- Texte d'écran ---------- */
const Txt: React.FC<{ text: React.ReactNode; from: number; to: number; y: number; size: number; font?: "c" | "m"; color?: string; band?: boolean; weight?: number }> = ({ text, from, to, y, size, font = "c", color = C.ivory, band, weight }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f >= s(to)) return null;
  const o = Math.min(ramp(f, s(from), 8, 0, 1), ramp(f, s(to) - 6, 6, 1, 0));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - ramp(f, s(from), 10, 0, 1)) * 24}px)` }}>
      <div
        style={{
          fontFamily: font === "c" ? cinzel : manrope,
          fontWeight: weight ?? (font === "c" ? 900 : 700),
          fontSize: size,
          lineHeight: 1.18,
          color,
          textAlign: "center",
          letterSpacing: font === "c" ? size * 0.02 : 0,
          textShadow: "0 4px 22px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.8)",
          background: band ? "rgba(8,6,4,0.62)" : undefined,
          padding: band ? "10px 22px" : undefined,
          borderRadius: band ? 10 : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------- Scène 1 · Le compteur d'années (0 à 3,45 s) ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= s(3.45)) return null;
  const value = f < s(0.2) ? 1982 : interpolate(f, [s(0.2), s(1.6)], [1982, 2026], { extrapolateRight: "clamp", easing: ease });
  const push = interpolate(f, [0, s(3.1)], [1, 1.05], { extrapolateRight: "clamp" });
  const tilt = ramp(f, s(3.05), 12, 0, 1, Easing.in(Easing.cubic));
  const second = ramp(f, s(1.6), 10, 0, 1);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #241A11 0%, #0E0A07 55%, #050403 100%)" }}>
      <AbsoluteFill style={{ transform: `perspective(1600px) scale(${push}) rotateX(${tilt * 72}deg)`, opacity: 1 - tilt, transformOrigin: "50% 60%" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 470 }}>
          <LetterDrop text="NÉ APRÈS 1982 ?" at={3} size={80} color={C.ivory} stagger={0.6} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 835, display: "flex", justifyContent: "center" }}>
          <Odometer value={value} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontFamily: manrope, fontWeight: 700, fontSize: 38, color: "rgba(243,234,219,0.72)", letterSpacing: 6 }}>CAMEROUN</div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 1215, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 64, lineHeight: 1.25, color: C.ivory, opacity: second, transform: `translateY(${(1 - second) * 30}px)`, textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
          TU N'AS CONNU QU'<span style={{ color: B.bronzeLight }}>UN</span>
          <br />
          <span style={{ color: B.bronzeLight }}>SEUL</span> PRÉSIDENT.
        </div>
      </AbsoluteFill>
      <Vig strength={0.7} />
    </AbsoluteFill>
  );
};

/* ---------- La natte et ses objets (monde) ---------- */

const CARD_Y0 = 1420;
const CARD_STEP = 262;
const CARDS: { at: number; year: string; text: string; rot: number }[] = [
  { at: 17.4, year: "1984", text: "Tentative de coup d'État", rot: -1.4 },
  { at: 18.4, year: "1987-1994", text: "Crise : salaires réduits, franc CFA dévalué", rot: 1 },
  { at: 19.06, year: "1990", text: "Retour du multipartisme", rot: -0.8 },
  { at: 20.45, year: "2002 · Bakassi", text: "La Cour internationale de justice reconnaît la souveraineté du Cameroun", rot: 1.1 },
  { at: 21.3, year: "2008", text: "La limite du nombre de mandats est supprimée", rot: -1 },
  { at: 22.07, year: "2014 · 2017", text: "Boko Haram au nord, conflit armé dans les régions anglophones", rot: 0.8 },
  { at: 22.98, year: "1992 · 2018 · 2025", text: "Élections : résultats officiels contestés par l'opposition", rot: -1.1 },
];
const cardY = (k: number) => CARD_Y0 + k * CARD_STEP;

type Key = [number, number, number, number]; // t, fx, fy, zoom
const KEYS: Key[] = (() => {
  const k: Key[] = [
    [T_WORLD, 540, 250, 1.0],
    [5.6, 540, 250, 1.0],
    [6.15, 120, 600, 1.25],
    [7.95, 120, 600, 1.3],
    [8.4, 490, 660, 1.05],
    [10.95, 490, 660, 1.08],
    [11.45, 940, 640, 1.0],
    [13.45, 940, 640, 1.02],
    [13.9, 535, 1100, 0.95],
    [16.95, 535, 1105, 0.97],
  ];
  CARDS.forEach((c, i) => {
    const prev = k[k.length - 1];
    if (i > 0) k.push([c.at - 0.05, prev[1], prev[2], prev[3]]);
    k.push([c.at + 0.4, 540, cardY(i) - 110, 1.0]);
  });
  const last = k[k.length - 1];
  k.push([24.55, last[1], last[2], last[3]]);
  k.push([25.35, 630, 1640, 0.6]);
  k.push([T_OUTRO, 630, 1640, 0.585]);
  return k;
})();

const cam = (t: number) => {
  if (t <= KEYS[0][0]) return KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (t <= b[0]) {
      const u = ease((t - a[0]) / Math.max(0.001, b[0] - a[0]));
      return [t, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u] as Key;
    }
  }
  return KEYS[KEYS.length - 1];
};

/** Objet posé sur la natte : il glisse depuis le bas, poussé par l'ombre d'une main qui se retire. */
const Placed: React.FC<{ x: number; y: number; at: number; rot?: number; h: number; children: React.ReactNode }> = ({ x, y, at, rot = 0, h, children }) => {
  const f = useCurrentFrame();
  if (f < s(at)) return null;
  const p = ramp(f, s(at), 12, 0, 1, Easing.out(Easing.cubic));
  const back = ramp(f, s(at) + 12, 12, 0, 1, Easing.in(Easing.quad));
  const dy = (1 - p) * 220;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      {back < 1 ? (
        <div style={{ position: "absolute", left: -150, top: h / 2 - 90 + dy + back * 260, opacity: (1 - back) * 0.55, filter: "blur(9px)" }}>
          <Hand />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, top: dy, transform: `translate(-50%, -50%) rotate(${rot}deg)`, opacity: Math.min(1, p * 3), filter: objShadow }}>{children}</div>
    </div>
  );
};

const World: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t < T_WORLD - 0.05 || t >= T_OUTRO + 0.25) return null;
  const [, fx, fy, z] = cam(t);
  const fadeIn = ramp(f, s(T_WORLD), 8, 0, 1);
  const fadeOut = ramp(f, s(T_OUTRO) - 3, 9, 1, 0);
  const dot = ramp(f, s(6.36), 10, 0, 1);
  const tear = ramp(f, s(14.65), 12, 0, 1, Easing.inOut(Easing.quad));
  const folders = [11.3, 11.75, 12.2].map((a) => ramp(f, s(a), 9, 0, 1, Easing.out(Easing.cubic)));
  const flicker = 0.92 + 0.05 * Math.sin(f * 0.37) + 0.03 * Math.sin(f * 1.13);
  const verdictDim = Math.max(ramp(f, s(24.75), 10, 0, 0.3), ramp(f, s(26.1), 10, 0.3, 0.62) * (f >= s(26.1) ? 1 : 0));
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut), background: "#120C08" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 40%, #2A1D12 0%, #140E09 60%, #0A0705 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: "0 0", transform: `translate(${540 - fx * z}px, ${960 - fy * z}px) scale(${z})` }}>
        <Mat />
        <Placed x={540} y={250} at={3.45} h={300}>
          <NameCard />
        </Placed>
        <Placed x={120} y={600} at={5.85} rot={-4} h={330}>
          <MapCard dot={dot} />
        </Placed>
        <Placed x={490} y={520} at={8.15} rot={3} h={300}>
          <Soutane />
        </Placed>
        <Placed x={490} y={800} at={9.2} rot={-2} h={200}>
          <Diplomas />
        </Placed>
        <Placed x={940} y={640} at={11.3} h={560}>
          <div style={{ position: "relative" }}>
            <Folders shown={folders} />
            {f >= s(12.6) ? (
              <div style={{ position: "absolute", left: 120, top: 470, transform: `rotate(-24deg) translateY(${(1 - ramp(f, s(12.6), 10, 0, 1)) * 120}px)`, opacity: ramp(f, s(12.6), 6, 0, 1) }}>
                <Pen />
              </div>
            ) : null}
          </div>
        </Placed>
        <Placed x={330} y={1100} at={13.7} rot={-2} h={330}>
          <Ephemeride tear={tear} />
        </Placed>
        <Placed x={740} y={1100} at={14.84} rot={4} h={400}>
          <ConstitutionBook />
        </Placed>
        {CARDS.map((c, i) => (
          <Placed key={i} x={540} y={cardY(i)} at={c.at} rot={c.rot} h={232}>
            <FactCard year={c.year} text={c.text} />
          </Placed>
        ))}
      </div>
      {/* lampe à huile hors champ, à gauche : lumière basse et latérale, jamais de halo */}
      <AbsoluteFill style={{ pointerEvents: "none", opacity: flicker, background: "radial-gradient(ellipse 70% 55% at 18% 46%, rgba(255,186,110,0.17) 0%, rgba(255,160,80,0.06) 45%, rgba(0,0,0,0) 70%)" }} />
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 85% 65% at 42% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)" }} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${verdictDim})` }} />
      <Vig strength={0.75} />
    </AbsoluteFill>
  );
};

/** Mains du griot (silhouettes génériques), posées au bord de la natte pendant la question. */
const GriotHands: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(4.3) || f >= s(5.9)) return null;
  const up = ramp(f, s(4.3), 12, 0, 1, Easing.out(Easing.cubic));
  const down = ramp(f, s(5.45), 12, 0, 1, Easing.in(Easing.cubic));
  const y = 1330 + (1 - up) * 420 + down * 420;
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: y, opacity: 0.88, filter: "blur(1.5px)" }}>
        <Hand />
      </div>
      <div style={{ position: "absolute", left: 630, top: y + 10, opacity: 0.88, filter: "blur(1.5px)" }}>
        <Hand flip />
      </div>
    </>
  );
};

/** Ombre en haut de l'écran : garde lisibles le bandeau et les titres posés au-dessus des objets. */
const TopShade: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(3.6) || f >= s(24.75)) return null;
  const o = Math.min(ramp(f, s(3.6), 10, 0, 1), ramp(f, s(24.75) - 8, 8, 1, 0));
  // titres de 6,1 à 17 s : ombre profonde jusqu'à y 700 ; ailleurs (nom, fiches) : jusqu'à y 430
  const deep = f >= s(6.0) && f < s(17.1) ? Math.min(ramp(f, s(6.0), 8, 0, 1), ramp(f, s(17.1) - 8, 8, 1, 0)) : 0;
  const end = 430 + deep * 300;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o, background: `linear-gradient(180deg, rgba(6,4,3,0.88) 0px, rgba(6,4,3,0.82) ${end - 160}px, rgba(6,4,3,0) ${end + 40}px)` }} />
  );
};

/** Bandeau permanent « Récit Mémoire » (haut de zone sûre). */
const MemoireBanner: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(3.6) || f >= s(24.6)) return null;
  const o = Math.min(ramp(f, s(3.6), 10, 0, 1), ramp(f, s(24.6) - 8, 8, 1, 0));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 22px", borderRadius: 30, background: "rgba(8,6,4,0.62)", border: "1.5px solid rgba(168,135,90,0.45)", fontFamily: manrope, fontWeight: 700, fontSize: 32, color: "rgba(243,234,219,0.85)" }}>
        Récit Mémoire · les faits, et d'où ils viennent
      </div>
    </div>
  );
};

const Overlays: React.FC = () => (
  <>
    {/* S2 · la question */}
    <Txt text={<>QUE SAIS-TU VRAIMENT<br />DE SON HISTOIRE ?</>} from={4.1} to={5.75} y={440} size={62} />
    {/* S3 · 1933 */}
    <Txt text="13 FÉVRIER 1933" from={6.15} to={8.05} y={430} size={80} color={B.bronzeLight} />
    <Txt text="Mvomeka'a · pays bulu, Sud du Cameroun" from={6.45} to={8.05} y={1265} size={40} font="m" band />
    <Txt text="territoire alors sous mandat français" from={6.8} to={8.05} y={1350} size={36} font="m" color="rgba(243,234,219,0.85)" />
    <Txt text="Objets et documents : évocations graphiques AFROBACK" from={6.2} to={8.05} y={1478} size={30} font="m" color="rgba(243,234,219,0.72)" weight={500} />
    {/* S4 · séminaire, puis Paris */}
    <Txt text="SÉMINAIRE" from={8.3} to={9.25} y={400} size={96} />
    <Txt text="Édéa, puis Akono · 1948-1954" from={8.4} to={9.25} y={530} size={40} font="m" />
    <Txt text="PARIS" from={9.3} to={11.05} y={400} size={96} />
    <Txt text="droit, Sciences Po, IHEOM · 1956-1963" from={9.4} to={11.05} y={530} size={40} font="m" />
    {/* S5 · de bureau en bureau */}
    <Txt text="DE BUREAU EN BUREAU" from={11.45} to={12.55} y={430} size={64} />
    <Txt text="30 JUIN 1975" from={12.6} to={13.5} y={360} size={84} color={B.bronzeLight} />
    <Txt text="PREMIER MINISTRE" from={12.65} to={13.5} y={465} size={76} />
    <Txt text="nommé par Ahmadou Ahidjo" from={12.75} to={13.5} y={570} size={38} font="m" />
    {/* S6 · novembre 1982 */}
    <Txt text="AHMADOU AHIDJO" from={13.9} to={14.85} y={400} size={64} />
    <Txt text="annonce sa démission · 4 novembre 1982" from={13.95} to={14.85} y={490} size={40} font="m" />
    <Txt text="PRÉSIDENT" from={14.95} to={16.95} y={380} size={96} />
    <Txt text={<>6 novembre 1982<br />successeur prévu par la Constitution</>} from={15.1} to={16.95} y={505} size={40} font="m" />
    {/* S9 · deux lectures, puis le verdict */}
    <Txt text={<>Pour les uns : <b style={{ fontWeight: 800 }}>le garant de la paix et de l'unité.</b></>} from={24.75} to={26.25} y={330} size={44} font="m" weight={500} band />
    <Txt text={<>Pour les autres : <b style={{ fontWeight: 800 }}>un pouvoir qui ne s'est jamais renouvelé.</b></>} from={24.75} to={26.25} y={1360} size={44} font="m" weight={500} band />
    <Txt text={<>L'HISTOIRE<br />N'A PAS ENCORE RENDU<br />SON VERDICT.</>} from={26.15} to={T_OUTRO + 0.1} y={760} size={64} />
  </>
);

/** Sous-titres karaoké, seulement là où la phrase n'est pas écrite en grand (répliques 4 et 5). */
const SUBS = [
  { words: w([["Séminariste,", 8.15], ["puis", 8.96], ["étudiant", 9.23], ["en", 9.67], ["droit", 9.85], ["à", 10.17], ["Paris.", 10.3]]), end: s(10.95) },
  { words: w([["Haut", 11.25], ["fonctionnaire,", 11.46], ["puis", 12.17], ["Premier", 12.39], ["ministre.", 12.71]]), end: s(13.35) },
];

export const PaulBiya: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    <Hook />
    <GriotHands />
    <TopShade />
    <MemoireBanner />
    <Overlays />
    {SUBS.map((sub, i) => (
      <Karaoke key={i} words={sub.words} end={sub.end} />
    ))}
    <Sequence from={s(T_OUTRO)} durationInFrames={s(BIYA_DUREE) - s(T_OUTRO)}>
      <OutroBiya />
    </Sequence>
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-paul-biya.wav")} /> : null}
  </AbsoluteFill>
);
