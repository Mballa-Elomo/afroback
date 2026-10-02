/**
 * AFROBACK · Vidéo 5 · « Changer de camp » : Martin Paul Samba (30 s, 9:16).
 * Script : recits/martin-paul-samba/script.md · voix : recits/martin-paul-samba/timing.json
 * Fil : une couture de lumière sépare le froid (l'empire, l'uniforme) du chaud (les siens) ;
 * plaques typographiques qui pivotent ; boutons de la tunique qui sautent en 1902.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, W, H, cinzel, manrope, ramp, s, popScale } from "../theme";
import { Grain, Karaoke, LetterDrop, PunchWord, Shake } from "../fx";
import { Caption, Illu, Vig, w } from "../recit-kit";
import { Phone } from "../phone";
import {
  Academy,
  BuluVillage,
  Envelope,
  FigureLayer,
  FlipPlaque,
  GlovedHand,
  Graded,
  Handkerchief,
  Lantern,
  NightDouala,
  NightEbolowa,
  NoonStreet,
  Note,
  PlaqueText,
  Ridge,
  ridgeY,
  SB,
  Seam,
  SplitGrade,
  StatueHill,
  TallGrass,
  TunicButton,
  FigKind,
} from "./samba-props";

const PORTRAIT = "heros/martin-paul-samba.jpg";
const CAPTURE = "img/capture-app-martin-paul-samba.png";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MENTION = "Décors et silhouettes : évocations graphiques AFROBACK";
const COLD_RIM = "rgba(205,220,235,0.85)";
const WARM_RIM = "rgba(255,196,120,0.95)";

/** Anneaux dorés calés sur le halo du portrait (coordonnées de l'image 1024). */
const Rings: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.55 }) => (
  <svg viewBox="0 0 1024 1024" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "screen", opacity }}>
    {[
      { r: 330, dash: "4 18", sp: 0.35, w: 3 },
      { r: 405, dash: "120 40 10 40", sp: -0.22, w: 2.5 },
      { r: 468, dash: "2 10", sp: 0.15, w: 4 },
    ].map((g, i) => (
      <circle key={i} cx={512} cy={430} r={g.r} fill="none" stroke={C.goldPale} strokeWidth={g.w} strokeDasharray={g.dash} transform={`rotate(${frame * g.sp} 512 430)`} style={{ filter: "drop-shadow(0 0 6px rgba(240,195,107,0.9))" }} />
    ))}
  </svg>
);

/** Texte Manrope sur bandeau sombre (lisible sur n'importe quel fond). */
const Band: React.FC<{ text: React.ReactNode; y: number; at: number; out?: number; size?: number; color?: string; f: number; weight?: number }> = ({ text, y, at, out = 99999, size = 46, color = C.ivory, f, weight = 800 }) => {
  if (f < at || f >= out + 6) return null;
  const o = ramp(f, at, 7, 0, 1) * (1 - ramp(f, out, 6, 0, 1));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - ramp(f, at, 8, 0, 1)) * 24}px)` }}>
      <div style={{ background: "rgba(8,6,4,0.72)", borderRadius: 10, padding: "10px 30px", fontFamily: manrope, fontWeight: weight, fontSize: size, color, textAlign: "center", lineHeight: 1.25 }}>{text}</div>
    </div>
  );
};

const Fade: React.FC<{ f: number; at: number; out?: number; children: React.ReactNode; d?: number }> = ({ f, at, out = 99999, children, d = 6 }) => {
  if (f < at || f >= out + d) return null;
  return <AbsoluteFill style={{ opacity: ramp(f, at, d, 0, 1) * (1 - ramp(f, out, d, 0, 1)) }}>{children}</AbsoluteFill>;
};

const DarkTop: React.FC<{ to?: number; o?: number }> = ({ to = 620, o = 0.8 }) => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: to, background: `linear-gradient(180deg, rgba(8,6,4,${o}) 0%, rgba(8,6,4,${o * 0.8}) 55%, rgba(8,6,4,0) 100%)` }} />;
const DarkBottom: React.FC<{ from?: number; o?: number }> = ({ from = 1000, o = 0.9 }) => <div style={{ position: "absolute", left: 0, right: 0, top: from, bottom: 0, background: `linear-gradient(180deg, rgba(8,6,4,0) 0%, rgba(8,6,4,${o * 0.85}) 40%, rgba(8,6,4,${o}) 100%)` }} />;

/* ---------- Scènes 1 et 2 · L'uniforme, puis le retournement (0 à 4,45 s) ---------- */

const S12: React.FC = () => {
  const f = useCurrentFrame();
  const out = ramp(f, 24, 26, 0, 1, Easing.inOut(Easing.cubic));
  const zoom = f < 24 ? interpolate(f, [0, 24], [4.4, 4.0]) : interpolate(out, [0, 1], [4.0, 1.35]) * (1 + 0.11 * ramp(f, 50, 70, 0, 1, Easing.linear));
  const cx = interpolate(out, [0, 1], [0.488, 0.5]);
  const cy = interpolate(out, [0, 1], [0.835, 0.47]);
  // couture : apparaît à 2,1 s à droite, avance lentement puis balaie tout
  const seamX = f < 63 ? W + 10 : f < 108 ? interpolate(f, [63, 108], [1070, 620], { ...clamp, easing: Easing.inOut(Easing.quad) }) : interpolate(f, [108, 128], [620, -10], { ...clamp, easing: Easing.in(Easing.cubic) });
  const glint = ramp(f, 2, 18, 0, 1, Easing.inOut(Easing.quad));
  const dive = ramp(f, 122, 12, 1, 7, Easing.in(Easing.exp));
  const glow = ramp(f, 124, 10, 0, 1);
  const portrait = (warm: boolean) => (
    <Illu src={PORTRAIT} cx={cx} cy={cy} zoom={zoom}>
      {/* reflet qui glisse sur le bouton du haut */}
      <div style={{ position: "absolute", left: "46.9%", top: "75.8%", width: "4.1%", height: "4.1%", borderRadius: "50%", overflow: "hidden", mixBlendMode: "screen" }}>
        <div style={{ position: "absolute", left: `${-120 + glint * 260}%`, top: "-50%", width: "60%", height: "200%", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)", transform: "rotate(25deg)" }} />
      </div>
      {warm ? <Rings frame={f} opacity={0.5 * ramp(f, 70, 30, 0, 1)} /> : null}
    </Illu>
  );
  const plaqueIn = f >= 66 ? popScale(f, 66, 9, 1.08) : 0;
  const angle = ramp(f, 94, 18, 0, 180, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Shake hits={[{ at: 0, amp: 10, dur: 5 }]}>
        <AbsoluteFill style={{ transform: `scale(${dive})`, transformOrigin: "540px 1300px" }}>
          <SplitGrade x={seamX} warmSide="right" render={() => portrait(seamX < W)} frame={f} />
          <DarkBottom from={1000} o={0.85} />
          {f >= 30 && f < 66 ? (
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 1150, opacity: 1 - ramp(f, 56, 8, 0, 1), transform: `translateY(${-ramp(f, 56, 8, 0, 60)}px)` }}>
              <PunchWord text="L'UNIFORME" at={30} size={124} color={SB.coldWhite} />
              <div style={{ height: 10 }} />
              <PunchWord text="ALLEMAND" at={36} size={124} color={SB.coldWhite} />
            </AbsoluteFill>
          ) : null}
          <Band text="Kamerun · colonie allemande" y={1440} at={40} out={56} f={f} size={42} color={SB.steel} />
          {f >= 66 ? (
            <FlipPlaque
              x={540}
              y={1300}
              w={960}
              h={340}
              angle={angle}
              scale={plaqueIn}
              frontTone="steel"
              backTone="gold"
              front={<PlaqueText tone="steel" lines={[{ t: "PUIS IL S'EST", size: 66 }, { t: "RETOURNÉ", size: 128 }]} />}
              back={<PlaqueText tone="gold" lines={[{ t: "RETOURNÉ", size: 128 }, { t: "CONTRE EUX", size: 76 }]} />}
            />
          ) : null}
        </AbsoluteFill>
      </Shake>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 1300px, rgba(255,226,166,${0.95 * glow}) 0%, rgba(240,170,80,${0.85 * glow}) 35%, rgba(120,60,20,${0.9 * glow}) 100%)` }} />
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scènes 3 et 4 · Mebenga m'Ebono, puis l'Allemagne en fait Martin-Paul Samba (4,45 à 11,1 s) ---------- */

const S34: React.FC = () => {
  const f = useCurrentFrame();
  const T = (sec: number) => s(sec - 4.45);
  const glowOut = 1 - ramp(f, 0, 10, 0, 1);
  const push = interpolate(f, [0, T(7.7)], [1, 1.14], clamp);
  const seamX = interpolate(f, [T(6.65), T(7.6)], [-10, W + 10], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const academyIn = ramp(f, T(7.55), 12, 0, 1, Easing.inOut(Easing.quad));
  const plaqueIn = f >= T(4.75) ? popScale(f, T(4.75), 10, 1.08) : 0;
  const angle = ramp(f, T(9.5), 18, 0, 180, Easing.inOut(Easing.cubic));
  const ta = f - T(7.55);
  const march = (speed: number, x0: number) => x0 + ta * speed;
  const p = ta * 0.21;
  const front: { kind: FigKind; x: number; y: number; s: number; p: number }[] = [0, 1, 2, 3, 4, 5].map((i) => ({ kind: "cadet", x: march(4.2, -720 + i * 270), y: 1640, s: 0.92, p }));
  const hero = front.splice(3, 1)[0];
  const back = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ kind: "cadet" as FigKind, x: march(2.6, -420 + i * 200), y: 1400, s: 0.6, p: p + 0.0, base: "#2A333D", detail: "#46515D" }));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {academyIn < 1 ? <SplitGrade x={seamX} warmSide="right" render={() => <BuluVillage f={f} push={push} />} frame={f} /> : null}
      {academyIn > 0 ? (
        <AbsoluteFill style={{ opacity: academyIn, transform: `scale(${1.06 - 0.06 * academyIn})` }}>
          <Graded cold={0.35}>
            <Academy f={ta} />
          </Graded>
          <FigureLayer figs={back} rim="rgba(200,215,230,0.5)" blur={1} />
          <FigureLayer figs={front} rim={COLD_RIM} />
          <FigureLayer figs={[hero]} rim={WARM_RIM} glow="rgba(255,170,80,0.55)" />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,14,20,0.55) 0%, rgba(10,14,20,0) 40%)" }} />
        </AbsoluteFill>
      ) : null}
      {/* plaque du nom */}
      {f >= T(4.75) ? (
        <FlipPlaque
          x={540}
          y={560}
          w={960}
          h={330}
          angle={angle}
          scale={plaqueIn}
          frontTone="gold"
          backTone="steel"
          front={<PlaqueText tone="gold" lines={[{ t: "MEBENGA", size: 124 }, { t: "M'EBONO", size: 124 }]} />}
          back={<PlaqueText tone="steel" lines={[{ t: "MARTIN-PAUL", size: 112 }, { t: "SAMBA", size: 124 }]} />}
        />
      ) : null}
      <Band text="son nom de naissance" y={770} at={T(5.0)} out={T(6.6)} f={f} size={46} />
      <Band text={<>pays bulu · près d'Ebolowa · <span style={{ color: C.gold }}>v. 1874-1875</span></>} y={858} at={T(5.4)} out={T(6.6)} f={f} size={38} color={SB.ivory} />
      <Band text={<><span style={{ color: SB.coldWhite }}>1891</span> · formé soldat en Allemagne</>} y={770} at={T(6.75)} out={T(8.0)} f={f} size={44} color={SB.steel} />
      <Band text={<><span style={{ color: SB.coldWhite }}>1894</span> · il revient officier au Kamerun</>} y={770} at={T(8.1)} out={T(9.5)} f={f} size={44} color={SB.steel} />
      <Band text="son nom de baptême, reçu en Allemagne" y={770} at={T(9.95)} f={f} size={42} color={SB.steel} />
      <Note text={MENTION} y={1480} opacity={ramp(f, 12, 8, 0, 1)} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 1000px, rgba(255,226,166,${0.95 * glowOut}) 0%, rgba(240,170,80,${0.85 * glowOut}) 35%, rgba(120,60,20,${0.9 * glowOut}) 100%)` }} />
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 5 · La vérité entière (11,1 à 13,75 s) ---------- */

const S5: React.FC = () => {
  const f = useCurrentFrame();
  const kinds: FigKind[] = ["colonial", "colonial", "porter", "colonial", "porterF", "colonial", "porter", "colonial", "colonial", "porter", "colonial", "porterF", "colonial", "colonial"];
  const figs = kinds.map((k, i) => {
    const x = 1300 - i * 128 + (random(`cj${i}`) - 0.5) * 24 - f * 2.6;
    return { kind: k, x, y: ridgeY(x) + 6, s: 0.32, p: f * 0.2 + i * 0.6, flip: true };
  });
  const pan = interpolate(f, [0, 80], [0, -40]);
  const under = ramp(f, 46, 14, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `translateX(${pan}px) scale(1.05)` }}>
        <Ridge f={f} />
        <FigureLayer figs={figs} rim="rgba(230,120,80,0.9)" rimDx={0} />
        <TallGrass f={f} y={1030} color="#0A0A0D" count={80} h={80} />
        <TallGrass f={f} y={1960} color="#050507" count={60} h={300} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 290 }}>
        <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 60, letterSpacing: 10, color: SB.terra, opacity: ramp(f, 2, 8, 0, 1), textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>LA VÉRITÉ ENTIÈRE</div>
        <div style={{ width: 360 * ramp(f, 6, 12, 0, 1), height: 3, background: SB.terra, marginTop: 14, boxShadow: "0 0 10px rgba(194,88,58,0.8)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 450 }}>
        <PunchWord text="1894 – 1902" at={5} size={118} color={SB.coldWhite} />
      </AbsoluteFill>
      <Caption text="au service des expéditions" at={18} y={1060} size={48} color={SB.ivory} />
      <Caption text="de Hans Dominik" at={23} y={1123} size={48} color={SB.ivory} />
      {f >= 40 ? (
        <div style={{ position: "absolute", left: 40, right: 40, top: 1205, textAlign: "center", opacity: ramp(f, 40, 8, 0, 1) }}>
          <span style={{ fontFamily: manrope, fontWeight: 800, fontSize: 44, color: "#E3866A", textShadow: "0 4px 18px rgba(0,0,0,0.95)", backgroundImage: `linear-gradient(${SB.terra}, ${SB.terra})`, backgroundSize: `${under * 100}% 4px`, backgroundPosition: "0 100%", backgroundRepeat: "no-repeat", paddingBottom: 6 }}>contre d'autres communautés camerounaises</span>
        </div>
      ) : null}
      <Note text={MENTION} y={1480} />
      <Vig strength={0.55} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 6 · Les boutons sautent, puis les siens (13,75 à 16,5 s) ---------- */

const BtnOverlay: React.FC<{ f: number; at: number; cx: number; cy: number; dir: number; size: number }> = ({ f, at, cx, cy, dir, size }) => {
  const t = Math.max(0, f - at);
  const gone = f >= at;
  const x = gone ? dir * t * 1.6 : 0;
  const y = gone ? -t * 1.2 + t * t * 0.45 : 0;
  const rot = gone ? dir * t * 38 : 0;
  return (
    <>
      {/* tissu de la tunique sous le bouton */}
      <div style={{ position: "absolute", left: `${cx - 3.6}%`, top: `${cy - 3.6}%`, width: "7.2%", height: "7.2%", borderRadius: "50%", background: "radial-gradient(circle, #0B0F13 0%, #0A0E12 48%, rgba(10,14,18,0) 70%)" }} />
      {gone ? (
        <div style={{ position: "absolute", left: `${cx - 0.35}%`, top: `${cy - 0.2}%`, width: "0.7%", height: "0.4%", borderRadius: "50%", background: "radial-gradient(circle, rgba(60,50,40,0.7) 0%, rgba(0,0,0,0) 70%)" }} />
      ) : null}
      <div style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, width: 0, height: 0, transform: `translate(${x}%, ${y}%)` }}>
        <div style={{ position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size, transform: `translate(${x * 14}px, ${y * 14}px) rotate(${rot}deg)`, filter: gone && t < 6 ? "blur(3px)" : undefined }}>
          <TunicButton size={size} glint={ramp(f, 0, 20, 0, 1)} />
        </div>
      </div>
    </>
  );
};

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const POP = 8; // 14,0 s
  const seamX = f < POP ? -10 : interpolate(f, [POP, POP + 10], [-10, W + 10], { ...clamp, easing: Easing.out(Easing.cubic) });
  const zoom = 3.4 + f * 0.005;
  const tunic = (warm: boolean) => (
    <Illu src={PORTRAIT} cx={0.492} cy={0.812} zoom={zoom}>
      <BtnOverlay f={f} at={POP} cx={48.8} cy={77.8} dir={-1} size={H * zoom * 0.04} />
      <BtnOverlay f={f} at={POP + 3} cx={49.0} cy={90.6} dir={1} size={H * zoom * 0.04} />
      <div style={{ position: "absolute", inset: 0, background: warm ? "radial-gradient(circle at 30% 60%, rgba(255,190,120,0.16) 0%, rgba(0,0,0,0) 45%)" : "radial-gradient(circle at 30% 60%, rgba(190,210,230,0.14) 0%, rgba(0,0,0,0) 45%)" }} />
    </Illu>
  );
  const toStreet = ramp(f, 37, 6, 0, 1);
  const ts = f - 37;
  const porters: { kind: FigKind; x: number; y: number; s: number; p: number; flip: boolean }[] = (["porter", "porterF", "porter", "porterF"] as FigKind[]).map((k, i) => ({ kind: k, x: 360 + i * 300 - ts * 2.4, y: 1600 - (i % 2) * 30, s: 0.95 - (i % 2) * 0.06, p: ts * 0.16 + i * 1.3, flip: true }));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {toStreet < 1 ? (
        <AbsoluteFill>
          <Shake hits={[{ at: POP, amp: 14, dur: 6 }, { at: POP + 3, amp: 10, dur: 5 }]}>
            <SplitGrade x={seamX} warmSide="left" render={() => tunic(seamX > 0)} frame={f} />
          </Shake>
          <DarkTop to={640} o={0.7} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 290 }}>
            <PunchWord text="1902" at={POP + 1} size={124} />
            <div style={{ height: 14 }} />
            <PunchWord text="IL QUITTE L'ARMÉE" at={POP + 6} size={68} color={SB.ivory} />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      {toStreet > 0 ? (
        <AbsoluteFill style={{ opacity: toStreet }}>
          <NoonStreet f={ts} />
          {porters.map((pp, i) => (
            <div key={i} style={{ position: "absolute", left: pp.x - 90, top: pp.y - 16, width: 200, height: 34, borderRadius: "50%", background: "rgba(40,12,4,0.55)", filter: "blur(6px)" }} />
          ))}
          <FigureLayer figs={porters} rim="rgba(255,236,190,0.95)" rimDx={4} />
          <DarkTop to={600} o={0.62} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 290 }}>
            <PunchWord text="TRAVAIL FORCÉ" at={41} size={100} color="#E3866A" />
          </AbsoluteFill>
          <Caption text="châtiments · réquisitions" at={47} y={425} size={48} color={SB.ivory} />
          <Note text={MENTION} y={1480} />
        </AbsoluteFill>
      ) : null}
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 7 · Deux chefs, deux villes, un secret (16,5 à 18,95 s) ---------- */

const S7: React.FC = () => {
  const f = useCurrentFrame();
  const power = 0.85 + 0.15 * Math.sin(f * 0.32);
  const dusk = 1 - ramp(f, 0, 9, 0, 1);
  const link = ramp(f, 12, 14, 0, 1, Easing.inOut(Easing.quad));
  const pathD = "M 400 1210 C 470 1120 520 1100 540 1060 C 600 960 760 1000 830 1000";
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ clipPath: "inset(0 540px 0 0)" }}>
        <NightEbolowa f={f} power={power} />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(0 0 0 540px)" }}>
        <NightDouala f={f} power={power} />
      </AbsoluteFill>
      <Seam x={540} frame={f} o={0.8} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={pathD} stroke="rgba(255,214,140,0.95)" strokeWidth={5} fill="none" strokeDasharray="1400" strokeDashoffset={1400 * (1 - link)} style={{ filter: "drop-shadow(0 0 10px rgba(255,180,90,0.9))" }} />
        <path d={pathD} stroke="rgba(255,240,200,0.9)" strokeWidth={2} fill="none" strokeDasharray="10 30" strokeDashoffset={-f * 4} opacity={link} />
      </svg>
      <DarkTop to={980} o={0.55} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 290 }}>
        <PunchWord text="1910 · CHEF BULU" at={2} size={64} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 560 }}>
        <PunchWord text="UN SOULÈVEMENT" at={12} size={84} />
        <div style={{ height: 8 }} />
        <PunchWord text="SE PRÉPARE" at={17} size={84} />
      </AbsoluteFill>
      <Caption text="en secret · armes françaises, appui britannique" at={26} y={790} size={36} color={SB.ivory} />
      {[
        { x: 270, name: "EBOLOWA", who: ["Samba"] },
        { x: 810, name: "DOUALA", who: ["Rudolf Duala", "Manga Bell"] },
      ].map((l, i) => (
        <div key={i} style={{ position: "absolute", left: l.x - 260, width: 520, top: 1305, textAlign: "center", opacity: ramp(f, 6 + i * 3, 8, 0, 1) }}>
          <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 52, color: SB.ivory, letterSpacing: 4, textShadow: "0 4px 18px rgba(0,0,0,0.95)" }}>{l.name}</div>
          {l.who.map((t) => (
            <div key={t} style={{ fontFamily: manrope, fontWeight: 800, fontSize: 34, color: C.gold, textShadow: "0 4px 14px rgba(0,0,0,0.95)" }}>
              {t}
            </div>
          ))}
        </div>
      ))}
      <Note text={MENTION} y={1480} />
      <AbsoluteFill style={{ background: `rgba(120,50,20,${0.5 * dusk})` }} />
      <Vig strength={0.55} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 8 · La lettre, puis la lanterne (18,95 à 23,0 s) ---------- */

const S8: React.FC = () => {
  const f = useCurrentFrame();
  const fly = ramp(f, 0, 24, 0, 1, Easing.out(Easing.cubic));
  const ex = interpolate(fly, [0, 1], [-200, 240]);
  const ey = interpolate(fly, [0, 1], [180, 700]);
  const er = interpolate(fly, [0, 1], [-24, -5]);
  const handIn = ramp(f, 21, 9, 0, 1, Easing.out(Easing.cubic));
  const close = ramp(f, 28, 8, 0, 1, Easing.inOut(Easing.quad));
  const lift = ramp(f, 42, 12, 0, 1, Easing.inOut(Easing.cubic));
  const seamX = interpolate(f, [27, 37], [-10, W + 10], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const LANT = 80;
  const lf = f - LANT;
  const flamePower = lf < 13 ? 1 : lf < 21 ? Math.max(0, 1 - (lf - 13) / 8) * (0.6 + 0.4 * Math.sin(lf * 2.3)) : 0;
  const smoke = lf >= 18 ? lf - 18 : -1;
  const whiten = ramp(f, 108, 14, 0, 1);
  const letterScene = (warm: boolean) => (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: warm ? "radial-gradient(circle at 25% 80%, #4A2410 0%, #1E0F07 45%, #0A0603 100%)" : "radial-gradient(circle at 50% 40%, #2A3A4E 0%, #141E2A 50%, #080C12 100%)" }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`bk${i}`) * W - 60, top: random(`bky${i}`) * 1400 + 100, width: 120 + random(`bks${i}`) * 140, height: 120 + random(`bks${i}`) * 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,170,80,0.25) 0%, rgba(255,170,80,0) 70%)", filter: "blur(6px)" }} />
      ))}
      <Lantern x={130} y={1640} s={1.1} power={1} seed="l8" />
      <div style={{ position: "absolute", left: ex, top: ey - lift * 420, transform: `rotate(${er}deg)` }}>
        <Envelope w={600} />
      </div>
      {handIn > 0 ? (
        <div style={{ position: "absolute", left: 540 - 260, top: -1010 + handIn * 1180 - lift * 420, transform: "rotate(-4deg)" }}>
          <GlovedHand close={close} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {f < LANT ? (
        <AbsoluteFill>
          <Shake hits={[{ at: 30, amp: 12, dur: 6 }]}>
            <SplitGrade x={seamX} warmSide="left" render={() => letterScene(seamX > 0 && f < 37)} frame={f} />
          </Shake>
          <DarkBottom from={1050} o={0.8} />
          <Fade f={f} at={4} out={26}>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 1230 }}>
              <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 64, color: C.gold, textShadow: "0 4px 18px rgba(0,0,0,0.95)" }}>ÉTÉ 1914 · UNE LETTRE</div>
              <div style={{ height: 14 }} />
              <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 44, color: SB.ivory, textShadow: "0 4px 18px rgba(0,0,0,0.95)" }}>aux forces françaises de Brazzaville</div>
            </AbsoluteFill>
          </Fade>
          <Fade f={f} at={30} out={46} d={4}>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 1220 }}>
              <PunchWord text="INTERCEPTÉE" at={30} size={110} color={SB.coldWhite} />
            </AbsoluteFill>
          </Fade>
          <Fade f={f} at={50}>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 1060 }}>
              <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 104, color: SB.coldWhite, transform: `scale(${popScale(f, 50, 8, 1.1)})`, textShadow: "0 6px 26px rgba(0,0,0,0.9)" }}>
                1<span style={{ fontSize: 50, verticalAlign: "super" }}>ER</span> AOÛT 1914
              </div>
            </AbsoluteFill>
            <Caption text="arrêté · inculpé de haute trahison" at={56} y={1200} size={46} color={SB.steel} />
          </Fade>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 760px, rgba(90,44,18,${0.9 * (0.3 + 0.7 * flamePower)}) 0%, #120A06 45%, #050302 100%)` }}>
          <Lantern x={540} y={1000} s={2.0} power={flamePower} seed="l9" />
          {smoke >= 0
            ? Array.from({ length: 9 }).map((_, i) => {
                const t = smoke - i * 2.2;
                if (t < 0) return null;
                const grow = 1 + whiten * 1.6;
                return <div key={i} style={{ position: "absolute", left: 540 + Math.sin(t * 0.18 + i) * (20 + t * 1.5) - (20 + t * 2) * grow, top: 790 - t * 9, width: (40 + t * 4) * grow, height: (40 + t * 4) * grow, borderRadius: "50%", background: `rgba(${200 + 48 * whiten},${195 + 28 * whiten},${190 - 22 * whiten},${Math.max(0, 0.28 - t * 0.006 + whiten * 0.2)})`, filter: "blur(22px)" }} />;
              })
            : null}
          <DarkBottom from={1050} o={0.7} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1110 }}>
            <LetterDrop text="8 AOÛT 1914" at={2} size={108} color={SB.ivory} stagger={0.7} />
          </AbsoluteFill>
          <Caption text="Ebolowa · exécuté par un peloton allemand" at={10} y={1250} size={40} color="rgba(243,233,216,0.92)" />
          <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 700px, rgba(248,223,168,${0.85 * ramp(f, 110, 12, 0, 1)}) 0%, rgba(201,138,61,${0.8 * ramp(f, 110, 12, 0, 1)}) 70%)` }} />
        </AbsoluteFill>
      )}
      <Vig strength={0.55} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 9 · La légende du mouchoir blanc (23,0 à 25,9 s) ---------- */

const LegendTag: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 280, opacity: ramp(f, 0, 8, 0, 1) }}>
    <div style={{ border: `3px double ${C.gold}`, outline: `1px solid rgba(240,195,107,0.5)`, outlineOffset: 6, padding: "6px 40px", background: "rgba(11,8,6,0.78)", fontFamily: cinzel, fontWeight: 900, fontSize: 64, letterSpacing: 10, color: C.gold }}>LÉGENDE</div>
    <div style={{ marginTop: 22, background: "rgba(11,8,6,0.66)", borderRadius: 8, padding: "6px 22px", fontFamily: manrope, fontWeight: 700, fontSize: 38, color: SB.ivory }}>transmise à Ebolowa, de bouche à oreille</div>
  </AbsoluteFill>
);

const S9: React.FC = () => {
  const f = useCurrentFrame();
  const fromSmoke = 1 - ramp(f, 0, 10, 0, 1);
  const rise = ramp(f, 0, 20, 0, 1, Easing.out(Easing.cubic));
  const sweep = ramp(f, 36, 12, 0, 1, Easing.inOut(Easing.cubic));
  const hx = interpolate(sweep, [0, 1], [540 - 300, -1400]);
  const hs = interpolate(sweep, [0, 1], [1, 3.2]);
  const zoom = interpolate(f, [36, 87], [1.42, 1.56], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {sweep > 0 ? (
        <AbsoluteFill>
          <Illu src={PORTRAIT} cx={0.5} cy={0.43} zoom={zoom}>
            <Rings frame={f + 200} opacity={0.6} />
          </Illu>
          <DarkBottom from={900} o={0.92} />
        </AbsoluteFill>
      ) : null}
      {sweep < 1 ? (
        <AbsoluteFill style={{ clipPath: sweep > 0 ? `inset(0 0 0 ${0}px)` : undefined, opacity: 1 - ramp(f, 40, 8, 0, 1) }}>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, #5A3020 0%, #C27440 30%, #F2C27A 55%, #F8DFA8 70%, #C98A3D 100%)" }} />
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: (random(`hd${i}`) * W + f * 1.2) % W, top: 300 + random(`hy${i}`) * 1300 - f * 0.8, width: 5, height: 5, borderRadius: 3, background: "#FFF1C4", opacity: 0.6 * random(`ho${i}`), boxShadow: "0 0 8px #FFD58A" }} />
          ))}
        </AbsoluteFill>
      ) : null}
      {sweep < 1 ? (
        <div style={{ position: "absolute", left: hx, top: interpolate(rise, [0, 1], [1600, 560]) - sweep * 200, transform: `scale(${hs}) rotate(${-6 + Math.sin(f * 0.1) * 3}deg)`, transformOrigin: "0 0" }}>
          <Handkerchief f={f} size={560} />
        </div>
      ) : null}
      {f < 40 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 1270, opacity: 1 - ramp(f, 34, 6, 0, 1) }}>
          <PunchWord text="SANS BANDEAU." at={17} size={104} color={SB.ivory} style={{ textShadow: "0 6px 26px rgba(60,20,4,0.9)" }} />
        </AbsoluteFill>
      ) : null}
      {f >= 44 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 1090, opacity: ramp(f, 44, 8, 0, 1) }}>
          <div style={{ width: 940, textAlign: "center", fontFamily: cinzel, fontWeight: 700, fontSize: 60, lineHeight: 1.25, color: SB.ivory, transform: "skewX(-8deg)", textShadow: "0 6px 24px rgba(0,0,0,0.95)" }}>
            <div style={{ whiteSpace: "nowrap" }}>« … tuez-moi, mais vous</div>
            <div style={{ whiteSpace: "nowrap" }}>
              n'aurez jamais <span style={{ color: C.gold }}>le Cameroun</span>. »
            </div>
          </div>
          <div style={{ marginTop: 26, background: "rgba(11,8,6,0.75)", borderRadius: 8, padding: "8px 22px", fontFamily: manrope, fontWeight: 700, fontSize: 32, color: "rgba(243,233,216,0.92)" }}>selon la légende · aucune archive ne la garantit mot pour mot</div>
        </AbsoluteFill>
      ) : null}
      <LegendTag f={f} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 700px, rgba(248,223,168,${0.85 * fromSmoke}) 0%, rgba(201,138,61,${0.8 * fromSmoke}) 70%)` }} />
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 10 · Il a choisi les siens, puis l'app (25,9 à 30 s) ---------- */

const S10a: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: ramp(f, 0, 6, 0, 1) }}>
      <AbsoluteFill style={{ transform: `scale(${1.08 - f * 0.002})` }}>
        <StatueHill f={f} />
      </AbsoluteFill>
      <DarkTop to={640} o={0.55} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
        <PunchWord text="IL A CHOISI" at={4} size={100} color={SB.ivory} />
        <div style={{ height: 10 }} />
        <PunchWord text="LES SIENS" at={10} size={110} />
      </AbsoluteFill>
      <Note text="Ebolowa · sa statue veille sur la ville (évocation)" y={1480} opacity={ramp(f, 8, 8, 0, 1)} />
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

const S10b: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 14, 0, 1, Easing.out(Easing.back(1.2)));
  const leave = ramp(frame, 36, 11, 0, 1, Easing.in(Easing.cubic));
  const pose = { x: 540, y: 1200 + (1 - rise) * 1100 + leave * 1300, scale: 1.5, rotate: (1 - rise) * 10 };
  const buttonY = 377;
  const by = pose.y + (buttonY - 422) * pose.scale;
  const pulse = frame >= 12 && frame < 40 ? ((frame - 12) % 14) / 14 : -1;
  const logoAt = 40;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(240,195,107,0.16) 0%, #170E09 45%, #0B0806 85%)" }}>
      <div style={{ position: "absolute", left: W / 2 - 900, top: 960 - 900, width: 1800, height: 1800 }}>
        <Rings frame={frame + 300} opacity={0.22} />
      </div>
      {leave < 1 ? (
        <>
          <Phone pose={pose}>
            <Img src={staticFile(CAPTURE)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Phone>
          {pulse >= 0 ? <div style={{ position: "absolute", left: 540 - 290, top: by - 60, width: 580, height: 120, borderRadius: 60, border: `5px solid ${C.gold}`, opacity: 1 - pulse, transform: `scale(${1 + pulse * 0.3})` }} /> : null}
        </>
      ) : null}
      {frame < 40 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 270, opacity: 1 - ramp(frame, 36, 4, 0, 1) }}>
          <PunchWord text="SON HISTOIRE" at={2} size={96} color={SB.ivory} />
          <div style={{ height: 12 }} />
          <PunchWord text="ENTIÈRE" at={8} size={104} />
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
  { from: 0, dur: 4.45, C: S12 },
  { from: 4.45, dur: 6.65, C: S34 },
  { from: 11.1, dur: 2.65, C: S5 },
  { from: 13.75, dur: 2.75, C: S6 },
  { from: 16.5, dur: 2.45, C: S7 },
  { from: 18.95, dur: 4.05, C: S8 },
  { from: 23.0, dur: 2.9, C: S9 },
  { from: 25.9, dur: 1.2, C: S10a },
  { from: 27.1, dur: 2.9, C: S10b },
];

/** Sous-titres calés sur la voix (timing.json + pauses mesurées), seulement là où la phrase n'est pas écrite en gros. */
const SUBS = [
  { words: w([["Huit", 11.15], ["ans,", 11.42], ["il", 11.87], ["accompagne", 12.04], ["les", 12.58], ["expéditions", 12.8], ["allemandes.", 13.39]]), end: s(14.1) },
  { words: w([["À", 14.3], ["Ebolowa,", 14.42], ["il", 14.98], ["voit", 15.14], ["souffrir", 15.38], ["les", 15.78], ["siens.", 15.98]]), end: s(16.45) },
  { words: w([["Une", 20.6], ["semaine", 20.75], ["après,", 21.1], ["on", 21.76], ["l'exécute.", 21.9]]), end: s(22.45) },
];

export const MartinPaulSamba: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map(({ from, dur, C: Sc }) => (
      <Sequence key={from} from={s(from)} durationInFrames={s(from + dur) - s(from)}>
        <Sc />
      </Sequence>
    ))}
    <AbsoluteFill style={{ transform: "translateY(-80px)" }}>
      {SUBS.map((sub, i) => (
        <Karaoke key={i} words={sub.words} end={sub.end} />
      ))}
    </AbsoluteFill>
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-martin-paul-samba.wav")} /> : null}
  </AbsoluteFill>
);
