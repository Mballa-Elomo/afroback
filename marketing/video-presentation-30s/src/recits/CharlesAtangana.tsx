/**
 * AFROBACK · Vidéo 6 · « La balance » : Charles Atangana (30 s, 9:16).
 * Script : recits/charles-atangana/script.md · voix : recits/charles-atangana/timing.json
 * Fil : une balance de laiton reçoit les faits des deux côtés (pierres, œuf / livre, route)
 * et ne se fixe jamais. Aucun plateau n'est étiqueté moralement.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, W, cinzel, manrope, ramp, s, popScale } from "../theme";
import { Grain, LetterDrop, PunchWord, Shake } from "../fx";
import { Embers, Illu, Vig } from "../recit-kit";
import { Phone } from "../phone";
import { AT, Balance, CoinRain, ForestTrail, InkTitle, OpenBook, PanItem, RoadHills, SandStage, Slate, TentDawn } from "./atangana-props";

const PORTRAIT = "heros/charles-atangana.jpg";
const CAPTURE = "img/capture-app-charles-atangana.png";
const EVOC = "évocation graphique AFROBACK";

/* ---------- Physique de la balance (temps global, secondes) ---------- */

const spring = (t: number, t0: number, k = 3.0, w = 9) => (t < t0 ? 0 : 1 - Math.exp(-k * (t - t0)) * Math.cos(w * (t - t0)));

const LEFT: PanItem[] = [
  { kind: "stone", at: 11.6, dx: -70, size: 30, seed: "a", rot: 40 },
  { kind: "stone", at: 11.85, dx: 0, size: 34, seed: "b", rot: -30 },
  { kind: "stone", at: 12.0, dx: 70, size: 30, seed: "c", rot: 20 },
  { kind: "stone", at: 12.3, dx: -36, dy: -40, size: 28, seed: "d", rot: -50 },
  { kind: "stone", at: 12.55, dx: 36, dy: -42, size: 28, seed: "e", rot: 35 },
  { kind: "stone", at: 12.8, dx: 0, dy: -78, size: 26, seed: "f", rot: -20 },
  { kind: "egg", at: 22.2, dx: 96, dy: -6, size: 26 },
];
const RIGHT: PanItem[] = [
  { kind: "book", at: 17.25, dx: -10, size: 190, rot: 25 },
  { kind: "road", at: 21.95, dx: 0, dy: -56, size: 170 },
];
const DROPS: { at: number; d: number }[] = [
  ...LEFT.filter((i) => i.kind === "stone").map((i) => ({ at: i.at, d: -2 })),
  { at: 17.25, d: 8 },
  { at: 21.95, d: 8 },
  { at: 22.2, d: -4 },
];

const balanceAngle = (t: number) => {
  let a = 0;
  if (t > 2.9) a += 7 * Math.exp(-1.6 * (t - 2.9)) * Math.sin(5 * (t - 2.9));
  if (t > 4.0) a += 2.5 * Math.exp(-5 * (t - 4.0)) * Math.sin(18 * (t - 4.0));
  for (const d of DROPS) a += d.d * spring(t, d.at);
  if (t > 23.3) a += 6.5 * Math.min(1, (t - 23.3) / 0.6) * Math.sin(2.3 * (t - 23.3));
  return a;
};

/* ---------- Textes ---------- */

/** Bandeau sombre (lisible sur tout fond). */
const Band: React.FC<{ text: React.ReactNode; y: number; at: number; out?: number; size?: number; color?: string; f: number; weight?: number }> = ({ text, y, at, out = 99999, size = 44, color = AT.ivory, f, weight = 800 }) => {
  if (f < at || f >= out + 6) return null;
  const o = ramp(f, at, 7, 0, 1) * (1 - ramp(f, out, 6, 0, 1));
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: y, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - ramp(f, at, 8, 0, 1)) * 24}px)` }}>
      <div style={{ background: "rgba(14,9,5,0.8)", borderRadius: 12, padding: "10px 28px", fontFamily: manrope, fontWeight: weight, fontSize: size, color, textAlign: "center", lineHeight: 1.25 }}>{text}</div>
    </div>
  );
};

const Note: React.FC<{ text: string; y: number; f: number; at?: number }> = ({ text, y, f, at = 0 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", justifyContent: "center", opacity: ramp(f, at, 8, 0, 1) }}>
    <div style={{ background: "rgba(14,9,5,0.66)", borderRadius: 30, padding: "7px 24px", fontFamily: manrope, fontWeight: 700, fontSize: 30, color: "rgba(255,244,224,0.92)" }}>{text}</div>
  </div>
);

const Col: React.FC<{ top: number; children: React.ReactNode; o?: number }> = ({ top, children, o = 1 }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: top, opacity: o }}>{children}</AbsoluteFill>
);

/** Sous-titre karaoké sur bandeau sombre (lisible sur fonds clairs), paquets de 3 mots. */
const Sub: React.FC<{ words: [string, number][]; end: number; base: number }> = ({ words, end, base }) => {
  const f = useCurrentFrame();
  const t = base + f / 30;
  if (t < words[0][1] || t >= end) return null;
  const groups: [string, number][][] = [];
  for (let i = 0; i < words.length; i += 3) groups.push(words.slice(i, i + 3));
  const g = [...groups].reverse().find((gr) => t >= gr[0][1]) ?? groups[0];
  const cur = [...g].reverse().find((x) => t >= x[1]);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1440, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(14,9,5,0.82)", borderRadius: 14, padding: "8px 26px", fontFamily: manrope, fontWeight: 800, fontSize: 50, color: AT.ivory }}>
        {g.map((x, i) => (
          <span key={i} style={{ color: x === cur ? C.gold : AT.ivory, marginRight: i < g.length - 1 ? 14 : 0 }}>
            {x[0]}
          </span>
        ))}
      </div>
    </div>
  );
};

const DarkTop: React.FC<{ to?: number; o?: number }> = ({ to = 660, o = 0.7 }) => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: to, background: `linear-gradient(180deg, rgba(10,6,3,${o}) 0%, rgba(10,6,3,${o * 0.75}) 55%, rgba(10,6,3,0) 100%)` }} />;
const DarkBottom: React.FC<{ from?: number; o?: number }> = ({ from = 1000, o = 0.85 }) => <div style={{ position: "absolute", left: 0, right: 0, top: from, bottom: 0, background: `linear-gradient(180deg, rgba(10,6,3,0) 0%, rgba(10,6,3,${o * 0.85}) 40%, rgba(10,6,3,${o}) 100%)` }} />;

/** Reflet qui balaie un disque de l'illustration (positions en % de l'image). */
const Glint: React.FC<{ x: number; y: number; d: number; p: number }> = ({ x, y, d, p }) => (
  <div style={{ position: "absolute", left: `${x - d / 2}%`, top: `${y - d / 2}%`, width: `${d}%`, height: `${d}%`, borderRadius: "50%", overflow: "hidden", mixBlendMode: "screen" }}>
    <div style={{ position: "absolute", left: `${-120 + p * 260}%`, top: "-50%", width: "60%", height: "200%", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,250,230,0.9) 50%, rgba(255,255,255,0) 100%)", transform: "rotate(25deg)" }} />
  </div>
);

const Motes: React.FC<{ f: number; n?: number }> = ({ f, n = 30 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: (random(`m${i}`) * W + f * (0.5 + random(`mv${i}`))) % W, top: 200 + ((random(`my${i}`) * 1500 - f * 0.6 + 1500) % 1500), width: 6, height: 6, borderRadius: 3, background: "#FFF1C4", opacity: 0.3 + 0.5 * random(`mo${i}`), boxShadow: "0 0 10px #FFD58A" }} />
    ))}
  </>
);

/* ---------- Scène 1 · Au service de deux puissances (0 à 2,4 s) ---------- */

const S1: React.FC = () => {
  const f = useCurrentFrame();
  const out = ramp(f, 14, 52, 0, 1, Easing.inOut(Easing.cubic));
  const zoom = interpolate(out, [0, 1], [1.32, 1.05]);
  const cx = interpolate(out, [0, 1], [0.6, 0.48]);
  const cy = interpolate(out, [0, 1], [0.56, 0.5]);
  const glint = ramp(f, 2, 18, 0, 1, Easing.inOut(Easing.quad));
  const glint2 = ramp(f, 12, 18, 0, 1, Easing.inOut(Easing.quad));
  const toStage = ramp(f, 66, 6, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shake hits={[{ at: 0, amp: 9, dur: 5 }]}>
        <AbsoluteFill style={{ filter: "brightness(1.25) contrast(1.03) saturate(1.12)" }}>
          <Illu src={PORTRAIT} cx={cx} cy={cy} zoom={zoom}>
            <Glint x={56} y={94.5} d={8} p={glint} />
            <Glint x={36.3} y={81.7} d={4} p={glint2} />
          </Illu>
        </AbsoluteFill>
        {/* lumière chaude de fin d'après-midi */}
        <AbsoluteFill style={{ background: "radial-gradient(circle at 15% 10%, rgba(255,214,140,0.55) 0%, rgba(255,190,110,0.2) 40%, rgba(0,0,0,0) 60%)", mixBlendMode: "screen" }} />
        <Motes f={f} n={26} />
      </Shake>
      <DarkTop to={720} o={0.5} />
      <Col top={290}>
        <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 92, lineHeight: 1, color: AT.ivory, letterSpacing: 2, textShadow: "0 6px 26px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.6)" }}>AU SERVICE DE</div>
        <div style={{ height: 22 }} />
        <PunchWord text="DEUX PUISSANCES" at={21} size={84} />
        <div style={{ height: 10 }} />
        <PunchWord text="COLONIALES" at={33} size={112} />
      </Col>
      <Band text="l'Allemagne, puis la France" y={1440} at={42} f={f} size={44} />
      <Note text="portrait : illustration AFROBACK" y={1360} f={f} at={42} />
      <AbsoluteFill style={{ background: `rgba(246,232,200,${toStage})` }} />
      <Vig strength={0.35} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 2 · La balance (2,4 à 4,85 s) ---------- */

const S2: React.FC = () => {
  const f = useCurrentFrame();
  const t = 2.4 + f / 30;
  const drop = ramp(f, 0, 10, 0, 1, Easing.in(Easing.quad));
  const settle = f > 10 ? -18 * Math.exp(-0.35 * (f - 10)) * Math.abs(Math.sin((f - 10) * 0.6)) : 0;
  const y = interpolate(drop, [0, 1], [-900, 800]) + settle;
  const dive = ramp(f, 64, 10, 1, 6, Easing.in(Easing.cubic));
  const fadeOut = ramp(f, 69, 5, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#F6E8C8" }}>
      <AbsoluteFill style={{ transform: `scale(${dive})`, transformOrigin: "217px 1130px", opacity: 1 }}>
        <SandStage f={f} />
        <Balance t={t} x={540} y={y} scale={0.95} angle={balanceAngle(t)} medallion={staticFile(PORTRAIT)} medalGlow={ramp(f, 14, 20, 0, 0.8)} />
        <Col top={270} o={1 - ramp(f, 60, 5, 0, 1)}>
          <LetterDrop text="CHARLES" at={9} size={118} color={AT.ink} stagger={0.7} />
          <LetterDrop text="ATANGANA" at={13} size={118} color={AT.ink} stagger={0.7} />
        </Col>
        <Band text="chef supérieur des Ewondo et des Bane" y={530} at={20} out={60} f={f} size={40} color={C.gold} />
        <Band text={<>sa mémoire <span style={{ color: C.gold }}>divise encore</span> le Cameroun</>} y={1440} at={33} out={60} f={f} size={46} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(201,148,90,${fadeOut})` }} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 3 · Ntsama devient Charles (4,85 à 7,35 s) ---------- */

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const T = (sec: number) => s(sec - 4.85);
  const w1 = ramp(f, T(4.95), T(5.6) - T(4.95), 0, 1, Easing.linear);
  const wipe = ramp(f, T(5.62), 8, 0, 1, Easing.inOut(Easing.quad));
  const w2 = ramp(f, T(5.9), 16, 0, 1, Easing.linear);
  const w3 = ramp(f, T(6.5), 10, 0, 1, Easing.linear);
  const fromGrey = 1 - ramp(f, 0, 5, 0, 1);
  const toCoins = ramp(f, 69, 6, 0, 1);
  const push = 1 + f * 0.0012;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Slate
          f={f}
          wipe={wipe}
          words={[
            { text: "Ntsama", x: 540, y: 1010, size: 170, write: w1, erase: wipe },
            { text: "Charles", x: 540, y: 960, size: 170, write: w2 },
            { text: "Karl", x: 540, y: 1150, size: 96, write: w3 },
          ]}
        />
      </AbsoluteFill>
      <Col top={300}>
        <PunchWord text="v. 1880 · MVOLYÉ" at={2} size={76} color={AT.ivory} style={{ textShadow: "0 4px 18px rgba(0,0,0,0.9)" }} />
      </Col>
      <Band text="onzième de douze enfants · orphelin de père vers six ans" y={430} at={6} out={T(5.9)} f={f} size={32} />
      <Band text={<>mission catholique de Kribi · <span style={{ color: C.gold }}>premier Ewondo baptisé</span></>} y={430} at={T(5.95)} f={f} size={33} />
      <Note text="les sources hésitent sur l'année de naissance" y={1360} f={f} at={10} />
      <AbsoluteFill style={{ background: `rgba(201,148,90,${fromGrey})` }} />
      {/* la poussière de craie devient lumière dorée */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 900px, rgba(255,236,180,${0.9 * toCoins}) 0%, rgba(232,196,128,${0.95 * toCoins}) 60%)` }} />
      <Vig strength={0.4} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 4 · L'impôt (7,35 à 9,85 s) ---------- */

const S4: React.FC = () => {
  const f = useCurrentFrame();
  const HIT = s(8.0 - 7.35);
  const fromGold = 1 - ramp(f, 0, 8, 0, 1);
  const slide = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `translateX(${-slide * 1100}px)` }}>
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #FBEBC6 0%, #EBCB8E 45%, #C9944E 100%)" }} />
        <Motes f={f} n={24} />
        <Shake hits={[{ at: HIT + 2, amp: 7, dur: 4 }]}>
          <CoinRain f={f} hit={HIT} />
        </Shake>
        <Col top={290}>
          <InkTitle text="L'IMPÔT" size={150} f={f} at={2} />
        </Col>
        <Band text={<><span style={{ color: C.gold }}>1902</span> · représentant des Allemands auprès des Ewondo</>} y={470} at={3} f={f} size={32} />
        <Band text="recensement et collecte de l'impôt" y={1215} at={HIT + 8} f={f} size={40} />
        <Band text={<>233 chefs collecteurs · <span style={{ color: C.gold }}>5 % de commission</span></>} y={1290} at={HIT + 14} f={f} size={40} />
        <Band text="« un système qui pressure ses propres frères »" y={1365} at={HIT + 24} f={f} size={34} color="#F0A884" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(246,226,180,${fromGold})` }} />
      <Vig strength={0.35} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 5 · Bras droit de Dominik, puis le complot (9,85 à 13,15 s) ---------- */

const S5: React.FC = () => {
  const f = useCurrentFrame();
  const t = 9.85 + f / 30;
  const STONES = s(11.2 - 9.85);
  const slideIn = 0;
  const fromGold = 1 - ramp(f, 0, 6, 0, 1);
  const toBal = ramp(f, STONES - 4, 6, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {toBal < 1 ? (
        <AbsoluteFill style={{ transform: `translateX(${slideIn * 1100}px) scale(${1.04 + f * 0.001})` }}>
          <TentDawn f={f} />
          <DarkTop to={720} o={0.6} />
          <Col top={290}>
            <PunchWord text="1904 – 1910" at={4} size={92} color={AT.ivory} />
          </Col>
          <Band text={<>bras droit du commandant <span style={{ color: C.gold }}>Hans Dominik</span></>} y={410} at={8} f={f} size={42} />
          <Band text="même tente, même table" y={490} at={14} f={f} size={40} color={C.gold} />
          <Band text={<><span style={{ color: C.gold }}>1907</span> · un complot pour l'empoisonner</>} y={1250} at={s(10.35 - 9.85)} f={f} size={38} />
          <Band text="il prévient les Allemands" y={1325} at={s(10.6 - 9.85)} f={f} size={38} color={C.gold} />
          <Note text={EVOC} y={575} f={f} at={10} />
        </AbsoluteFill>
      ) : null}
      {toBal > 0 ? (
        <AbsoluteFill style={{ opacity: toBal }}>
          <SandStage f={f} />
          <Shake hits={LEFT.filter((i) => i.kind === "stone").map((i) => ({ at: s(i.at - 9.85), amp: 5, dur: 3 }))}>
            <Balance t={t} x={540} y={820} scale={0.95} angle={balanceAngle(t)} left={LEFT} right={RIGHT} medallion={staticFile(PORTRAIT)} />
          </Shake>
          <Col top={270}>
            <InkTitle text="SIX CONSPIRATEURS" size={76} f={f} at={s(11.4 - 9.85)} />
            <div style={{ height: 8 }} />
            <InkTitle text="EXÉCUTÉS" size={104} f={f} at={s(11.9 - 9.85)} color={AT.earth} />
          </Col>
          <Band text={<>membres de la sous-lignée Mvog Ada<br />des hommes de son propre peuple</>} y={500} at={s(12.2 - 9.85)} f={f} size={34} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: `rgba(246,226,180,${fromGold})` }} />
      <Vig strength={0.4} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 6 · Le titre inventé (13,15 à 15,65 s) ---------- */

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const fromSand = 1 - ramp(f, 0, 7, 0, 1);
  const back = ramp(f, s(14.4 - 13.15), 26, 0, 1, Easing.inOut(Easing.cubic));
  const zoom = interpolate(back, [0, 1], [4.0 + f * 0.006, 1.7]);
  const cx = interpolate(back, [0, 1], [0.38, 0.45]);
  const cy = interpolate(back, [0, 1], [0.175, 0.3]);
  const burn = ramp(f, 3, 16, 0, 1);
  const toBook = ramp(f, 68, 7, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ filter: "brightness(1.12) saturate(1.1)" }}>
        <Illu src={PORTRAIT} cx={cx} cy={cy} zoom={zoom}>
          {/* l'insigne s'embrase */}
          <div style={{ position: "absolute", left: "30%", top: "8.5%", width: "16%", height: "16%", borderRadius: "50%", background: `radial-gradient(circle, rgba(255,240,190,${0.75 * burn}) 0%, rgba(255,200,110,${0.45 * burn}) 30%, rgba(255,170,60,0) 70%)`, mixBlendMode: "screen" }} />
          <div style={{ position: "absolute", left: "26%", top: "4.5%", width: "24%", height: "24%", borderRadius: "50%", background: `repeating-conic-gradient(from ${f * 1.4}deg, rgba(255,230,160,${0.32 * burn}) 0deg 4deg, rgba(255,230,160,0) 4deg 18deg)`, WebkitMaskImage: "radial-gradient(circle, black 18%, transparent 68%)", maskImage: "radial-gradient(circle, black 18%, transparent 68%)", mixBlendMode: "screen" }} />
          <Glint x={38} y={16.5} d={7} p={ramp(f, 6, 16, 0, 1)} />
        </Illu>
      </AbsoluteFill>
      {back < 0.3 ? <Embers x={540} y={960} count={22} spread={200} power={burn} /> : null}
      <DarkBottom from={920} o={0.88} />
      <Col top={1060}>
        <PunchWord text="CHEF SUPÉRIEUR" at={2} size={92} />
        <div style={{ height: 12 }} />
        <PunchWord text="des Ewondo et des Bane" at={8} size={58} color={AT.ivory} />
      </Col>
      <Band text={<><span style={{ color: C.gold }}>1911</span> · un titre créé par les Allemands</>} y={1260} at={s(13.9 - 13.15)} f={f} size={40} />
      <Band text="ces peuples n'avaient pas de chef suprême" y={1335} at={s(14.4 - 13.15)} f={f} size={36} />
      <Band text="il inquiète Martin Paul Samba, chez les Bulu voisins" y={1410} at={s(14.9 - 13.15)} f={f} size={34} color={C.gold} />
      <AbsoluteFill style={{ background: `rgba(246,232,200,${fromSand})` }} />
      <AbsoluteFill style={{ background: `rgba(250,240,215,${toBook})` }} />
      <Vig strength={0.45} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 7 · Les contes recueillis (15,65 à 17,95 s) ---------- */

const S7: React.FC = () => {
  const f = useCurrentFrame();
  const t = 15.65 + f / 30;
  const fromLight = 1 - ramp(f, 0, 6, 0, 1);
  const open = ramp(f, s(16.0 - 15.65), 14, 0, 1, Easing.inOut(Easing.cubic));
  const toBal = ramp(f, s(16.75 - 15.65), 6, 0, 1);
  const lift = ramp(f, s(16.6 - 15.65), 8, 0, 1400, Easing.in(Easing.cubic));
  const toForest = ramp(f, 62, 7, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {toBal < 1 ? (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #FFF6E2 0%, #F1DDB2 55%, #D2AE72 100%)" }} />
          <OpenBook f={f} open={open} lift={lift} />
          {/* les lignes montent en poussière dorée */}
          {open > 0.6
            ? Array.from({ length: 40 }).map((_, i) => {
                const st = 14 + (i % 13) * 1.2;
                const p = Math.max(0, f - st);
                if (p <= 0) return null;
                return <div key={i} style={{ position: "absolute", left: 330 + random(`bp${i}`) * 440 + Math.sin(p * 0.2 + i) * 20, top: 700 + (i % 13) * 52 - p * 14 - lift, width: 7, height: 7, borderRadius: 4, background: "#FFE6A8", opacity: Math.max(0, 1 - p / 30), boxShadow: "0 0 10px #F0C36B" }} />;
              })
            : null}
        </AbsoluteFill>
      ) : null}
      {toBal > 0 ? (
        <AbsoluteFill style={{ opacity: toBal }}>
          <SandStage f={f} />
          <Balance t={t} x={540} y={820} scale={0.95} angle={balanceAngle(t)} left={LEFT} right={RIGHT} medallion={staticFile(PORTRAIT)} />
        </AbsoluteFill>
      ) : null}
      <Col top={270}>
        <InkTitle text="JAUNDE-TEXTE" size={104} f={f} at={s(15.9 - 15.65)} />
      </Col>
      <Band text="récits, contes et proverbes beti" y={410} at={s(16.0 - 15.65)} f={f} size={42} color={C.gold} />
      <Band text="Hambourg · il enseigne la langue ewondo" y={485} at={s(16.3 - 15.65)} f={f} size={36} />
      <Band text={<><span style={{ color: C.gold }}>1913</span> · reçu par le Kaiser Guillaume II et par le pape Pie X</>} y={1300} at={s(17.3 - 15.65)} f={f} size={34} />
      <AbsoluteFill style={{ background: `rgba(250,240,215,${fromLight})` }} />
      <AbsoluteFill style={{ background: `rgba(60,80,40,${toForest})` }} />
      <Vig strength={0.35} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 8 · La fuite (17,95 à 20,45 s) ---------- */

const S8: React.FC = () => {
  const f = useCurrentFrame();
  const HIT = s(20.0 - 17.95);
  const fromGreen = 1 - ramp(f, 0, 7, 0, 1);
  const toRoad = ramp(f, 68, 7, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + f * 0.0015})` }}>
        <ForestTrail f={f} density={ramp(f, 20, 40, 0, 1, Easing.linear)} />
      </AbsoluteFill>
      <DarkTop to={700} o={0.55} />
      <Col top={290}>
        <PunchWord text="1916 · LA FUITE" at={3} size={88} color={AT.ivory} />
      </Col>
      <Band text="avec l'armée allemande, jusqu'en Guinée espagnole" y={410} at={9} f={f} size={36} />
      {f >= HIT - 2 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 900 }}>
          <div style={{ background: "rgba(14,9,5,0.72)", borderRadius: 18, padding: "16px 40px", display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${popScale(f, HIT - 2, 8, 1.08)})` }}>
            <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 100, color: C.gold, lineHeight: 1.05 }}>14 000 à 20 000</div>
            <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 66, color: AT.ivory, lineHeight: 1.1 }}>PERSONNES</div>
            <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 32, color: "rgba(255,244,224,0.9)", marginTop: 8 }}>et 72 chefs ewondo et bane · estimation des archives</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Band text="par choix ? par contrainte ? aucune source ne peut le dire" y={1300} at={HIT + 8} f={f} size={33} color={C.gold} />
      <Note text={EVOC} y={1380} f={f} at={6} />
      <AbsoluteFill style={{ background: `rgba(60,80,40,${fromGreen})` }} />
      <AbsoluteFill style={{ background: `rgba(220,160,110,${toRoad * 0.7})` }} />
      <Vig strength={0.4} />
    </AbsoluteFill>
  );
};

/* ---------- Scènes 9 et 10 · Sous la France, puis la balance qui ne se fixe pas (20,45 à 26,27 s) ---------- */

const S910: React.FC = () => {
  const f = useCurrentFrame();
  const T = (sec: number) => s(sec - 20.45);
  const t = 20.45 + f / 30;
  const fromOchre = 1 - ramp(f, 0, 7, 0, 1);
  const draw = ramp(f, 2, T(21.3) - 2, 0, 1, Easing.out(Easing.cubic));
  const shrink = ramp(f, T(21.25), 9, 0, 1, Easing.in(Easing.cubic));
  const balIn = ramp(f, T(21.2), 8, 0, 1);
  // pivot de la balance de fin et position du plateau droit
  const BX = 540;
  const BY = 860;
  const BS = 0.85;
  const quoteO = ramp(f, T(22.25), 7, 0, 1) * (1 - ramp(f, T(24.15), 6, 0, 1));
  const end = ramp(f, T(26.45), 5, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {balIn > 0 ? (
        <AbsoluteFill style={{ opacity: balIn }}>
          <SandStage f={f} />
          <Balance t={t} x={BX} y={BY} scale={BS} angle={balanceAngle(t)} left={LEFT} right={RIGHT} medallion={staticFile(PORTRAIT)} medalGlow={ramp(f, T(25.7), 12, 0, 0.9)} />
        </AbsoluteFill>
      ) : null}
      {shrink < 1 ? (
        <AbsoluteFill style={{ transform: `scale(${1 - shrink * 0.88})`, transformOrigin: `${BX + 340 * BS}px ${BY - 300}px`, opacity: 1 - shrink * 0.6, borderRadius: shrink * 60, overflow: "hidden" }}>
          <RoadHills f={f} draw={draw} />
          <DarkTop to={640} o={0.5} />
          <Band text={<><span style={{ color: C.gold }}>1920</span> · il revient, au service de la France</>} y={290} at={2} f={f} size={40} />
          <Col top={390}>
            <PunchWord text="ROUTES · ÉCOLES" at={T(21.3)} size={76} color={AT.ivory} />
            <div style={{ height: 8 }} />
            <PunchWord text="DISPENSAIRES" at={T(21.45)} size={76} color={AT.ivory} />
          </Col>
          <Note text="financements allemands puis français · évocation graphique" y={1350} f={f} at={6} />
        </AbsoluteFill>
      ) : null}
      {/* la plainte des Bane (citation attestée) */}
      {quoteO > 0 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 260, opacity: quoteO }}>
          <div style={{ width: 980, background: "rgba(14,9,5,0.84)", borderRadius: 18, padding: "22px 30px", textAlign: "center" }}>
            <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 52, lineHeight: 1.22, color: AT.ivory }}>
              « Nous travaillons toujours
              <br />
              et c'est <span style={{ color: C.gold }}>Atangana</span>
              <br />
              qui reçoit l'argent. »
            </div>
            <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 32, color: "#F0A884", marginTop: 12 }}>plainte des Bane, 1924 · archives coloniales</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* ni s'incliner, ni juger d'un bloc : comprendre */}
      <Col top={280}>
        <InkTitle text="NI S'INCLINER" size={88} f={f} at={T(24.2)} />
        <div style={{ height: 10 }} />
        <InkTitle text="NI JUGER D'UN BLOC" size={80} f={f} at={T(24.45)} />
        <div style={{ height: 24 }} />
        {f >= T(25.72) ? (
          <div style={{ transform: `scale(${popScale(f, T(25.72), 10, 1.12)})`, fontFamily: cinzel, fontWeight: 900, fontSize: 120, color: C.gold, textShadow: "0 0 10px rgba(110,70,20,0.9), 0 4px 26px rgba(90,50,10,0.75)" }}>COMPRENDRE</div>
        ) : null}
      </Col>
      {[
        { x: 275, txt: ["COLLABORATEUR ?"], c: AT.earth },
        { x: 805, txt: ["BÂTISSEUR", "PRAGMATIQUE ?"], c: "#6A4410" },
      ].map((l, i) => (
        <div key={i} style={{ position: "absolute", left: l.x - 255, width: 510, top: 1230, textAlign: "center", opacity: ramp(f, T(24.3) + i * 3, 7, 0, 1) * (1 - ramp(f, T(25.6), 6, 0, 1)) }}>
          {l.txt.map((x) => (
            <div key={x} style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 42, lineHeight: 1.08, color: l.c, whiteSpace: "nowrap", textShadow: "0 0 6px rgba(255,248,226,1), 0 0 14px rgba(255,246,220,0.95), 0 0 26px rgba(255,246,220,0.9)" }}>
              {x}
            </div>
          ))}
        </div>
      ))}
      <Band text="les historiens ne tranchent pas d'une seule voix" y={1440} at={T(24.35)} f={f} size={36} />
      <AbsoluteFill style={{ background: `rgba(220,160,110,${fromOchre * 0.7})` }} />
      <AbsoluteFill style={{ background: `rgba(11,8,6,${end})` }} />
      <Vig strength={0.35} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 11 · Son histoire entière (26,27 à 30 s) ---------- */

const S11: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 14, 0, 1, Easing.out(Easing.back(1.2)));
  const leave = ramp(frame, 36, 11, 0, 1, Easing.in(Easing.cubic));
  const pose = { x: 540, y: 1200 + (1 - rise) * 1100 + leave * 1300, scale: 1.5, rotate: (1 - rise) * 10 };
  const buttonY = 376;
  const by = pose.y + (buttonY - 422) * pose.scale;
  const pulse = frame >= 12 && frame < 40 ? ((frame - 12) % 14) / 14 : -1;
  const logoAt = 42; // 28,0 s : attaque de la musique
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(240,195,107,0.18) 0%, #170E09 45%, #0B0806 85%)" }}>
      {leave < 1 ? (
        <>
          <Phone pose={pose}>
            <Img src={staticFile(CAPTURE)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Phone>
          {pulse >= 0 ? <div style={{ position: "absolute", left: 540 - 300, top: by - 60, width: 600, height: 120, borderRadius: 60, border: `5px solid ${C.gold}`, opacity: 1 - pulse, transform: `scale(${1 + pulse * 0.3})` }} /> : null}
        </>
      ) : null}
      {frame < 42 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 270, opacity: 1 - ramp(frame, 38, 4, 0, 1) }}>
          <PunchWord text="SON HISTOIRE" at={2} size={96} color={AT.ivory} />
          <div style={{ height: 12 }} />
          <PunchWord text="ENTIÈRE" at={6} size={104} />
        </AbsoluteFill>
      ) : null}
      {frame >= logoAt ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 220 }}>
          <div style={{ transform: `scale(${popScale(frame, logoAt, 10, 1.25)})`, width: 320, height: 320, borderRadius: 160, overflow: "hidden", border: `5px solid ${C.gold}`, boxShadow: "0 0 90px rgba(240,195,107,0.55)" }}>
            <Img src={staticFile("img/logo-medaillon.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ height: 44 }} />
          <LetterDrop text="AFROBACK" at={logoAt + 5} size={120} />
          <div style={{ height: 26 }} />
          <LetterDrop text="afroback.app" at={logoAt + 16} size={62} family={manrope} weight={800} color={C.ivory} colorFrom={{ index: 8, color: C.gold }} stagger={0.6} />
          <div style={{ height: 40 }} />
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 46, color: C.gold, opacity: ramp(frame, logoAt + 24, 8, 0, 1), textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>Son histoire entière sur AFROBACK</div>
        </AbsoluteFill>
      ) : null}
      <Vig strength={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */

const SCENES = [
  { from: 0, dur: 2.4, C: S1 },
  { from: 2.4, dur: 2.45, C: S2 },
  { from: 4.85, dur: 2.5, C: S3 },
  { from: 7.35, dur: 2.5, C: S4 },
  { from: 9.85, dur: 3.3, C: S5 },
  { from: 13.15, dur: 2.5, C: S6 },
  { from: 15.65, dur: 2.3, C: S7 },
  { from: 17.95, dur: 2.5, C: S8 },
  { from: 20.45, dur: 6.15, C: S910 },
  { from: 26.6, dur: 3.4, C: S11 },
];

/** Sous-titres calés sur la voix (timing.json), seulement là où la phrase n'est pas écrite en gros. */
const SUBS: { words: [string, number][]; end: number }[] = [
  { words: [["L'impôt", 7.4], ["allemand", 7.7], ["passe", 8.04], ["par", 8.28], ["ses", 8.44], ["mains.", 8.61]], end: 9.6 },
  { words: [["Il", 9.9], ["dénonce", 10.08], ["un", 10.49], ["complot :", 10.67], ["six", 11.39], ["des", 11.61], ["siens", 11.84], ["exécutés.", 12.16]], end: 13.0 },
  { words: [["Il", 15.7], ["recueille", 15.84], ["les", 16.24], ["contes", 16.42], ["beti.", 16.71]], end: 17.3 },
  { words: [["Puis", 18.0], ["il", 18.21], ["fuit", 18.35], ["avec", 18.57], ["les", 18.78], ["Allemands.", 18.96]], end: 19.7 },
  { words: [["Sous", 20.5], ["la", 20.72], ["France :", 20.86], ["des", 21.41], ["routes…", 21.59], ["et", 22.06], ["une", 22.2], ["plainte.", 22.39]], end: 23.1 },
];

export const CharlesAtangana: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map(({ from, dur, C: Sc }) => (
      <Sequence key={from} from={s(from)} durationInFrames={s(from + dur) - s(from)}>
        <Sc />
      </Sequence>
    ))}
    {SUBS.map((sub, i) => (
      <Sub key={i} words={sub.words} end={sub.end} base={0} />
    ))}
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-charles-atangana.wav")} /> : null}
  </AbsoluteFill>
);

