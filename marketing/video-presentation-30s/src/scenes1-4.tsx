import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing } from "remotion";
import { C, W, H, cinzel, manrope, ramp, expoIn, expoOut, popScale } from "./theme";
import { Background, Flash, Grain, LetterDrop, MotifWipe, Particles, PunchWord, Shake, Shockwave, Tap, Vignette } from "./fx";
import {
  FlagPill,
  FullScreen,
  HeroScreen,
  HomeScreen,
  HOME_CARD_CENTER,
  Icon,
  LanguageScreen,
  Phone,
  PhonePose,
  PLANCHES,
  PlayerScreen,
  SHORTCUTS,
  SHORTCUT_POS,
  TAP_FR,
  TAP_READ,
  TAP_START,
  toStage,
  WatchScreen,
  img,
} from "./phone";

export const HEROES = [
  { f: "reine-nzinga", n: "NZINGA" },
  { f: "sultan-njoya", n: "NJOYA" },
  { f: "ruben-um-nyobe", n: "UM NYOBÈ" },
  { f: "manu-dibango", n: "MANU DIBANGO" },
  { f: "felix-moumie", n: "FÉLIX MOUMIÉ" },
  { f: "martin-paul-samba", n: "MARTIN PAUL SAMBA" },
  { f: "charles-atangana", n: "CHARLES ATANGANA" },
  { f: "ernest-ouandie", n: "ERNEST OUANDIÉ" },
];

const BASE: PhonePose = { x: W / 2, y: 900, scale: 1.45 };

/* =================================================================
   SCÈNE 1 · L'accroche en rafale (0,0 → 4,0 s)
   ================================================================= */
const CUTS = HEROES.map((_, i) => Math.round(i * 7.5)); // un visage tous les 0,25 s

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  // 1A · rafale de visages
  if (frame < 60) {
    let idx = 0;
    CUTS.forEach((c, i) => {
      if (frame >= c) idx = i;
    });
    const local = frame - CUTS[idx];
    const zoom = 1.3 * ramp(local, 0, 7, 1.04, 1);
    const rot = idx % 2 === 0 ? 2 : -2;
    const h = HEROES[idx];
    return (
      <AbsoluteFill style={{ backgroundColor: C.black }}>
        <Shake hits={[{ at: 0, amp: 10 }, { at: 30, amp: 8 }]}>
          <AbsoluteFill style={{ transform: `scale(${zoom}) rotate(${rot}deg)`, transformOrigin: "50% 38%" }}>
            <Img src={img(`heros/${h.f}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
          <Vignette gold />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(11,9,6,0.85) 82%)" }} />
          <div
            style={{
              position: "absolute",
              left: 80,
              right: 80,
              bottom: 440,
              textAlign: "center",
              fontFamily: cinzel,
              fontWeight: 900,
              fontSize: 90,
              lineHeight: 1.02,
              color: C.ivory,
              textShadow: "0 6px 30px rgba(0,0,0,0.9)",
              transform: `scale(${ramp(local, 0, 3, 1.15, 1)})`,
            }}
          >
            {h.n}
          </div>
        </Shake>
        <Flash at={CUTS} />
        <Grain />
      </AbsoluteFill>
    );
  }

  // 1B · titre qui percute + 1C · aspiration vers le centre
  const f = frame - 60;
  const dolly = ramp(f, 0, 45, 1, 1.08, (t) => t);
  const suck = ramp(f, 45, 15, 0, 1, expoIn);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Shake hits={[{ at: 60 }, { at: 75 }]}>
        <AbsoluteFill
          style={{
            transform: `scale(${dolly * (1 - suck)}) rotate(${suck * 90}deg)`,
            filter: `blur(${suck * 18}px)`,
          }}
        >
          <AbsoluteFill style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(4, 1fr)", opacity: 0.4 }}>
            {HEROES.map((h, i) => {
              const col = i % 2;
              const row = Math.floor(i / 2);
              const cx = (col + 0.5) * (W / 2) - W / 2;
              const cy = (row + 0.5) * (H / 4) - H / 2;
              const p = ramp(f, i, 8, 0, 1);
              return (
                <div key={h.f} style={{ overflow: "hidden", transform: `translate(${-cx * (1 - p)}px, ${-cy * (1 - p)}px) scale(${p})` }}>
                  <Img src={img(`heros/${h.f}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
                </div>
              );
            })}
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(11,9,6,0.55) 0%, rgba(11,9,6,0.9) 80%)" }} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 26 }}>
            <PunchWord text="ILS ONT ÉCRIT" at={60} size={100} color={C.ivory} />
            <PunchWord text="NOTRE" at={75} size={120} />
            <PunchWord text="HISTOIRE" at={75} size={140} shine={[84, 99]} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Shake>
      {/* point lumineux doré */}
      {suck > 0 ? (
        <div
          style={{
            position: "absolute",
            left: W / 2 - 40,
            top: H / 2 - 40,
            width: 80,
            height: 80,
            borderRadius: 40,
            background: `radial-gradient(circle, #fff 0%, ${C.gold} 40%, rgba(240,195,107,0) 70%)`,
            transform: `scale(${0.3 + suck * 1.4})`,
            opacity: suck,
          }}
        />
      ) : null}
      <Grain />
    </AbsoluteFill>
  );
};

/* =================================================================
   SCÈNE 2 · Drop sur le logo (4,0 → 6,0 s)
   ================================================================= */
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = ramp(frame, 37, 8, 0, 1, expoIn);
  const dolly = ramp(frame, 0, 37, 1, 1.05, (t) => t);

  // téléphone qui jaillit du bas (5,25 s), plongée dans l'écran (5,75 → 6,0 s)
  const pIn = ramp(frame, 38, 12, 0, 1, Easing.out(Easing.back(1.4)));
  const dive = ramp(frame, 52, 8, 0, 1, expoIn);
  const pose: PhonePose = {
    x: W / 2,
    y: interpolate(pIn, [0, 1], [2700, BASE.y]),
    scale: BASE.scale * interpolate(pIn, [0, 1], [0.8, 1]) * (1 + dive * 3),
    rotate: interpolate(pIn, [0, 1], [25, 0]),
  };
  const tagReveal = ramp(frame, 30, 6, 100, 0);

  return (
    <AbsoluteFill>
      <Background />
      <Shake hits={[{ at: 0, amp: 12, dur: 3 }, { at: 50, amp: 5 }]}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 30,
            transform: `translateY(${-exit * 1500}px) scale(${dolly})`,
          }}
        >
          <div style={{ transform: `scale(${popScale(frame, 0, 9, 1.2)})` }}>
            <Img
              src={img("img/icon.png")}
              style={{ width: 440, height: 440, borderRadius: 220, boxShadow: "0 0 90px rgba(240,195,107,0.55)" }}
            />
          </div>
          <LetterDrop text="AFROBACK" at={3} size={120} />
          <div
            style={{
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 48,
              color: C.ivory,
              clipPath: `inset(0 ${tagReveal}% 0 0)`,
              transform: `translateX(${tagReveal * 0.6}px)`,
            }}
          >
            Retour aux origines
          </div>
        </AbsoluteFill>
        {frame >= 37 ? (
          <Phone pose={pose}>
            <LanguageScreen open={false} />
          </Phone>
        ) : null}
      </Shake>
      <Shockwave at={0} />
      <Particles at={0} seed="drop1" />
      <MotifWipe at={0} />
      <Flash at={[0]} opacity={0.3} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* =================================================================
   SCÈNE 3 · Entrée dans l'app (6,0 → 10,0 s)
   ================================================================= */
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  let content: React.ReactNode = null;
  let pose: PhonePose = BASE;
  const overlays: React.ReactNode[] = [];

  if (frame < 15) {
    // 3A · langue
    pose = { ...BASE, scale: BASE.scale * ramp(frame, 0, 6, 1.9, 1) };
    content = <LanguageScreen open pressedFr={frame >= 4} />;
    const tp = toStage(pose, TAP_FR.x, TAP_FR.y);
    overlays.push(<Tap key="t" at={4} x={tp.x} y={tp.y} />);
    if (frame >= 5) {
      const p = ramp(frame, 5, 10, 0, 1);
      overlays.push(
        <div
          key="fr"
          style={{
            position: "absolute",
            left: interpolate(p, [0, 1], [tp.x, W / 2]),
            top: interpolate(p, [0, 1], [tp.y, 520]),
            transform: `translate(-50%, -50%) scale(${interpolate(p, [0, 1], [0.4, 1.6])})`,
            opacity: ramp(frame, 11, 4, 1, 0),
          }}
        >
          <FlagPill />
        </div>,
      );
    }
  } else if (frame < 30) {
    // 3B · Commencer
    content = <LanguageScreen open={false} pressedStart={frame >= 18 && frame < 23} />;
    const tp = toStage(pose, TAP_START.x, TAP_START.y);
    overlays.push(<Tap key="t" at={18} x={tp.x} y={tp.y} />);
    overlays.push(<MotifWipe key="w" at={21} dur={8} />);
  } else if (frame < 60) {
    // 3C · accueil + raccourcis qui jaillissent
    const f = frame - 30;
    pose = { ...BASE, rotateY: ramp(f, 0, 9, 20, 0) };
    const starts = [4, 8, 11, 15];
    const popping = f >= 4 && f < 28;
    content = <HomeScreen hideShortcuts={popping} />;
    if (popping) {
      const targets = [
        { x: 190, y: 560 },
        { x: 890, y: 700 },
        { x: 190, y: 1260 },
        { x: 890, y: 1400 },
      ];
      SHORTCUTS.forEach((sc, i) => {
        const o = ramp(f, starts[i], 6, 0, 1, Easing.out(Easing.back(1.6)));
        const back = ramp(f, 22, 6, 0, 1, expoIn);
        const t = o * (1 - back);
        const from = toStage(pose, SHORTCUT_POS[i].x, SHORTCUT_POS[i].y);
        const bob = Math.sin((f + i * 4) / 3) * 12 * t;
        overlays.push(
          <div
            key={sc.l}
            style={{
              position: "absolute",
              left: interpolate(t, [0, 1], [from.x, targets[i].x]),
              top: interpolate(t, [0, 1], [from.y, targets[i].y]) + bob,
              transform: `translate(-50%, -50%) scale(${interpolate(t, [0, 1], [1.45, 2.6])}) rotate(${(i % 2 ? 8 : -8) * t}deg)`,
              display: f >= starts[i] ? "flex" : "none",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                background: "linear-gradient(160deg,#3a2410,#1A130D)",
                border: `1.5px solid ${C.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 30px rgba(0,0,0,0.6), 0 0 24px rgba(240,195,107,0.35)",
              }}
            >
              <Icon name={sc.ic} size={28} />
            </div>
            <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 13, color: C.ivory, textShadow: "0 2px 8px #000" }}>{sc.l}</div>
          </div>,
        );
      });
    }
  } else {
    // 3D · Histoire du jour (push-in) + 3E · plongée dans la fiche
    const f = frame - 60;
    const push = ramp(f, 0, 10, BASE.scale, 2.8);
    const dive = ramp(f, 48, 12, 0, 1, expoIn);
    const scale = push * (1 + dive * 2.5);
    pose = { x: W / 2, y: 1130 - (HOME_CARD_CENTER.y - 422) * scale, scale };
    content = <HomeScreen pressedRead={f >= 35 && f < 40} />;
    const tp = toStage(pose, TAP_READ.x, TAP_READ.y);
    overlays.push(<Tap key="t" at={95} x={tp.x} y={tp.y} />);
    if (f < 30) {
      overlays.push(
        <AbsoluteFill key="words" style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 255, gap: 6, background: "linear-gradient(180deg, rgba(11,9,6,0.85) 0%, rgba(11,9,6,0.6) 26%, rgba(11,9,6,0) 32%)" }}>
          <PunchWord text="UNE HISTOIRE" at={60} size={96} color={C.ivory} />
          <PunchWord text="CHAQUE JOUR" at={75} size={96} />
        </AbsoluteFill>,
      );
    }
    if (dive > 0) {
      overlays.push(<AbsoluteFill key="flash" style={{ backgroundColor: C.appBg, opacity: ramp(f, 56, 4, 0, 1) }} />);
    }
  }

  // Tap et mots utilisent le temps de la scène : on ré-indexe via frame global de scène
  return (
    <AbsoluteFill>
      <Background />
      <Shake hits={[{ at: 0, amp: 6 }, { at: 60, amp: 8 }, { at: 75, amp: 8 }, { at: 120, amp: 8 }]}>
        <Phone pose={pose}>{content}</Phone>
        {overlays}
      </Shake>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* =================================================================
   SCÈNE 4 · Lis. Écoute. Regarde. (10,0 → 14,0 s)
   ================================================================= */
const CenterWord: React.FC<{ text: string; at: number }> = ({ text, at }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(11,9,6,0.7) 0%, rgba(11,9,6,0) 60%)" }} />
    <PunchWord text={text} at={at} size={text.length > 5 ? 150 : 170} />
  </AbsoluteFill>
);

const Waveform: React.FC<{ frame: number; bars?: number; w: number; h: number; vertical?: boolean }> = ({ frame, bars = 26, w, h }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: w, height: h }}>
    {Array.from({ length: bars }).map((_, i) => {
      const beat = Math.exp(-(frame % 15) / 4);
      const v = 0.2 + 0.8 * Math.abs(Math.sin(i * 1.3 + frame * 0.35)) * (0.5 + beat * 0.5);
      return <div key={i} style={{ width: 10, height: v * h, borderRadius: 5, background: C.gold }} />;
    })}
  </div>
);

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const dolly = 1 + (frame % 15) * 0.002;

  let body: React.ReactNode;
  if (frame < 15) {
    body = (
      <>
        <FullScreen zoom={dolly}>
          <HeroScreen pulse={Math.abs(Math.sin(frame / 2.4))} />
        </FullScreen>
        <CenterWord text="LIS." at={0} />
      </>
    );
  } else if (frame < 30) {
    body = (
      <>
        <FullScreen zoom={dolly}>
          <PlayerScreen beat={frame / 15} />
        </FullScreen>
        <CenterWord text="ÉCOUTE." at={15} />
      </>
    );
  } else if (frame < 45) {
    body = (
      <>
        <FullScreen zoom={dolly}>
          <WatchScreen planche={0} zoom={1.05} />
        </FullScreen>
        <CenterWord text="REGARDE." at={30} />
      </>
    );
  } else if (frame < 60) {
    // 4D · split-screen en 3 bandes
    const f = frame - 45;
    const bands = [
      { el: <Img src={img("heros/reine-nzinga.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />, word: "LIS" },
      {
        el: (
          <AbsoluteFill style={{ background: "linear-gradient(180deg,#3a1d0a,#0c0805)", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: "rotate(90deg)" }}>
              <Waveform frame={frame} bars={14} w={900} h={260} />
            </div>
          </AbsoluteFill>
        ),
        word: "ÉCOUTE",
      },
      { el: <Img src={img("img/histoires.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(0.25)" }} />, word: "REGARDE" },
    ];
    body = (
      <AbsoluteFill style={{ flexDirection: "row", background: C.black }}>
        {bands.map((b, i) => {
          const p = ramp(f, i, 6, 0, 1);
          const dir = i % 2 === 0 ? -1 : 1;
          return (
            <div
              key={b.word}
              style={{
                width: W / 3,
                height: H,
                position: "relative",
                overflow: "hidden",
                transform: `translateY(${(1 - p) * dir * H}px)`,
                borderRight: i < 2 ? `4px solid ${C.gold}` : undefined,
              }}
            >
              {b.el}
              <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(11,9,6,0.9) 80%)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center" }}>
                <PunchWord text={b.word} at={48 + i} size={54} />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  } else {
    // 4E · storyboard en rafale, dézoom jusqu'au téléphone entier
    const f = frame - 60;
    const idx = Math.min(PLANCHES.length - 1, Math.floor(f / 7.5));
    const local = f - Math.round(idx * 7.5);
    const scale = ramp(f, 0, 45, 3.1, BASE.scale, Easing.inOut(Easing.cubic));
    const pr = (3.1 - scale) / (3.1 - BASE.scale);
    const pose: PhonePose = { x: W / 2, y: interpolate(pr, [0, 1], [960 + 12 * 3.1, BASE.y]), scale };
    const whip = ramp(f, 52, 8, 0, 1, expoIn);
    const cuts = Array.from({ length: 8 }).map((_, i) => 60 + Math.round(i * 7.5));
    body = (
      <AbsoluteFill style={{ transform: `translateX(${-whip * 1600}px)`, filter: `blur(${whip * 30}px)` }}>
        <Background />
        <Phone pose={pose}>
          <WatchScreen planche={idx} zoom={ramp(local, 0, 7, 1.12, 1)} />
        </Phone>
        <Flash at={cuts} opacity={0.22} />
        <Vignette />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Shake hits={[{ at: 0 }, { at: 15 }, { at: 30 }, { at: 45, amp: 5 }]}>{body}</Shake>
      <Grain />
    </AbsoluteFill>
  );
};

export { expoOut };
