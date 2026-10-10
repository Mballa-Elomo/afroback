/**
 * AFROBACK · Tutoriel « How to sign up for AFROBACK » (30 s, 9:16, ANGLAIS).
 * Script : recits/tutoriel-inscription-30s/script.md · état : etat.md
 * À NE PUBLIER QU'UNE FOIS L'APP EN LIGNE SUR LES DEUX STORES (badges officiels à la fin).
 *
 * Angle « le chemin des 5 pas dorés » : barre de progression en 5 médaillons, un téléphone
 * qui ne montre QUE de vraies captures de l'app en English (les miennes : capture-app-insc-en-01…15 ;
 * celles de Yannick : capture-app-insc-en-y-*, données personnelles floutées), un doigt doré
 * posé sur les vraies coordonnées des boutons et une caméra qui s'approche du champ en cours.
 * Aucun écran redessiné. Temps en secondes absolues (voix : timing.json).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, cinzel, manrope, ramp, s, popScale, FPS } from "../theme";
import { Diamonds, Grain, LetterDrop, Particles, PunchWord } from "../fx";
import { Vig, Fog } from "../recit-kit";
import { Phone, SW, SH, toStage, type PhonePose } from "../phone";

const cap = (n: string) => staticFile(`img/capture-app-insc-en-${n}.png`);
const sec = (f: number) => f / FPS;
const inOut = Easing.inOut(Easing.cubic);

/* ---------- Données du montage ---------- */

/** Écrans montrés dans le téléphone (début en s). null = noir (fondu de l'app entre logo et carrousel). */
const SCREENS: [number, string | null][] = [
  [0, "01-splash-fr"],
  [2.62, "02-menu"],
  [3.42, "03-splash-en"],
  [5.05, null],
  [5.45, "04-carrousel"],
  [6.35, "05-welcome"],
  [8.05, "06-form"],
  [8.95, "07-name"],
  [9.75, "08-email"],
  [10.55, "09-phone"],
  [11.6, "10-password"],
  [12.75, "11-tick"],
  [14.05, "12-code0"],
  [15.0, "13a-code1"],
  [15.25, "13-code2"],
  [15.5, "13b-code3"],
  [15.75, "13c-code4"],
  [16.0, "14-code5"],
  [16.25, "15-code6"],
  [16.95, "y-profile"],
  [20.45, "y-usage"],
  [21.9, "y-ready"],
];

/** Caméra : [temps, zoom, point visé x, y dans l'écran 390 × 844]. */
const CAM: [number, number, number, number][] = [
  [0, 1, 195, 422],
  [2.2, 1, 195, 422],
  [2.55, 1.8, 285, 150],
  [3.55, 1.8, 285, 150],
  [4.1, 1, 195, 422],
  [6.45, 1, 195, 422],
  [7.9, 1.07, 195, 470],
  [8.05, 1, 195, 422],
  [8.45, 1.75, 195, 255],
  [9.45, 1.75, 195, 255],
  [9.75, 1.75, 195, 300],
  [10.25, 1.75, 195, 300],
  [10.55, 1.75, 195, 390],
  [11.2, 1.75, 195, 390],
  [11.5, 1.75, 195, 525],
  [12.4, 1.75, 195, 525],
  [12.65, 1.75, 195, 615],
  [13.3, 1.75, 195, 615],
  [13.6, 1, 195, 422],
  [14.55, 1, 195, 422],
  [14.95, 1.7, 195, 215],
  [16.7, 1.7, 195, 215],
  [17.05, 1, 195, 422],
  [17.5, 1.35, 195, 450],
  [19.6, 1.35, 195, 450],
  [19.85, 1, 195, 422],
  [20.5, 1, 195, 422],
  [20.75, 1.5, 195, 235],
  [21.25, 1.5, 195, 235],
  [21.45, 1, 195, 422],
  [21.95, 1, 195, 422],
  [22.25, 1.4, 195, 390],
];

/** Touchers du doigt : [temps, x, y] dans l'écran 390 × 844 (positions mesurées sur l'app). */
const TAPS: [number, number, number][] = [
  [2.5, 301, 28], // menu de langue
  [3.3, 261, 160], // English
  [4.6, 195, 794], // Get started
  [6.1, 36, 794], // Skip
  [7.4, 195, 717], // Create my account
  [8.6, 210, 221], // First name
  [9.4, 210, 289], // Email address
  [10.2, 233, 421], // Phone number
  [11.35, 195, 489], // Password
  [12.6, 34, 600], // case à cocher
  [13.75, 195, 684], // Create my account
  [14.8, 44, 248], // première case du code
  [18.3, 195, 535], // Username
  [19.95, 195, 808], // Continue
  [20.9, 195, 213], // Discover my roots
  [21.55, 195, 808], // Continue
];

/** Titres d'étape : [début, fin, numéro de pas allumé, titre, consigne]. */
const STEPS: [number, number, number, string, string][] = [
  [1.9, 5.5, 1, "1 · CHOOSE ENGLISH", "Language menu, top right · then “Get started”"],
  [5.5, 8.05, 2, "2 · CREATE YOUR ACCOUNT", "Skip the intro · tap “Create my account”"],
  [8.05, 11.2, 3, "3 · FILL IN THE FORM", "First name · Email · Phone number"],
  [11.2, 14.05, 3, "3 · FILL IN THE FORM", "A strong password · tick the box"],
  [14.05, 16.95, 4, "4 · ENTER THE CODE", "6-digit code sent to your email"],
  [16.95, 20.45, 5, "5 · PICK A USERNAME", "Photo or avatar: optional"],
  [20.45, 21.9, 6, "ONE LAST CHOICE", "Tell AfroBack what fits you"],
  [21.9, 22.85, 6, "DONE!", "Your account is ready"],
];

/* ---------- Outils ---------- */

const camAt = (t: number) => {
  let i = 0;
  while (i < CAM.length - 1 && t >= CAM[i + 1][0]) i++;
  const a = CAM[i];
  const b = CAM[Math.min(i + 1, CAM.length - 1)];
  if (a === b || t <= a[0]) return { z: a[1], fx: a[2], fy: a[3] };
  const u = inOut(Math.min(1, (t - a[0]) / (b[0] - a[0])));
  return { z: a[1] + (b[1] - a[1]) * u, fx: a[2] + (b[2] - a[2]) * u, fy: a[3] + (b[3] - a[3]) * u };
};

const BASE = 1.08;
const poseAt = (t: number, rise: number, extra: Partial<PhonePose> = {}): PhonePose => {
  const { z, fx, fy } = camAt(t);
  const scale = BASE * z;
  return { x: 540 - (fx - SW / 2) * scale, y: 1045 - (fy - SH / 2) * scale + rise, scale, ...extra };
};

/** Positions des 5 médaillons dans la barre de progression. */
const BAR_Y = 300;
const barX = (i: number) => 540 + (i - 2) * 132;
/** Positions sur le chemin de l'accroche. */
const PATH = [
  [540, 1440],
  [690, 1270],
  [540, 1100],
  [390, 930],
  [540, 760],
];

/* ---------- Petits composants ---------- */

const Medallion: React.FC<{ x: number; y: number; size: number; n: number; lit: number; pulse?: number }> = ({ x, y, size, n, lit, pulse = 0 }) => (
  <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `rotate(45deg) scale(${0.72 + pulse * 0.08})`,
        borderRadius: size * 0.12,
        border: `${Math.max(3, size * 0.06)}px solid ${C.gold}`,
        background: lit > 0 ? `rgba(240,195,107,${0.25 + lit * 0.75})` : "rgba(11,9,6,0.9)",
        boxShadow: lit > 0 ? `0 0 ${30 * lit}px rgba(240,195,107,${0.6 * lit})` : "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: cinzel,
        fontWeight: 900,
        fontSize: size * 0.42,
        color: lit > 0.5 ? C.black : C.gold,
      }}
    >
      {n}
    </div>
  </div>
);

/** Écran du téléphone : capture courante en fondu (4 images) sur la précédente. */
const ScreenStack: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  let i = 0;
  while (i < SCREENS.length - 1 && t >= SCREENS[i + 1][0]) i++;
  const cur = SCREENS[i];
  const prev = i > 0 ? SCREENS[i - 1] : null;
  const isBlackIn = cur[1] === null;
  const o = ramp(f, s(cur[0]), isBlackIn ? 6 : 4, 0, 1, Easing.out(Easing.quad));
  const layer = (n: string | null, op: number) =>
    n ? <Img src={cap(n)} style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, opacity: op }} /> : <div style={{ position: "absolute", inset: 0, background: "#0B0906", opacity: op }} />;
  return (
    <>
      {prev ? layer(prev[1], 1) : null}
      {layer(cur[1], prev ? o : 1)}
    </>
  );
};

/** Doigt doré : approche, pression, onde. */
const Finger: React.FC<{ t: number; rise: number }> = ({ t, rise }) => (
  <>
    {TAPS.map(([t0, x, y], k) => {
      if (t < t0 - 0.35 || t > t0 + 0.5) return null;
      const p = toStage(poseAt(t, rise), x, y);
      const appear = interpolate(t, [t0 - 0.35, t0 - 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const leave = interpolate(t, [t0 + 0.25, t0 + 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const press = t >= t0 && t < t0 + 0.12 ? 0.82 : 1;
      const ring = interpolate(t, [t0, t0 + 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const off = (1 - appear) * 60;
      return (
        <React.Fragment key={k}>
          {t >= t0 ? (
            <div
              style={{
                position: "absolute",
                left: p.x - 40 - ring * 70,
                top: p.y - 40 - ring * 70,
                width: 80 + ring * 140,
                height: 80 + ring * 140,
                borderRadius: "50%",
                border: `5px solid rgba(247,217,139,${0.9 * (1 - ring)})`,
              }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              left: p.x - 34 + off,
              top: p.y - 34 + off,
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,244,224,0.95) 0%, rgba(247,217,139,0.85) 45%, rgba(240,195,107,0.35) 75%, rgba(240,195,107,0) 100%)",
              boxShadow: "0 0 30px rgba(240,195,107,0.8)",
              transform: `scale(${press})`,
              opacity: appear * leave,
            }}
          />
        </React.Fragment>
      );
    })}
  </>
);

const Header: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const st = STEPS.find(([a, b]) => t >= a && t < b);
  if (!st) return null;
  const [a, , , title, sub] = st;
  // le titre ne rejoue son entrée que s'il change
  const prev = STEPS[STEPS.indexOf(st) - 1];
  const sameTitle = prev && prev[3] === title && prev[1] === a;
  const tin = sameTitle ? 1 : ramp(f, s(a), 8, 0, 1);
  const sin = ramp(f, s(a) + 4, 8, 0, 1);
  const done = title === "DONE!";
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 362 + (1 - tin) * 24,
          textAlign: "center",
          fontFamily: cinzel,
          fontWeight: 900,
          fontSize: done ? 76 : 56,
          lineHeight: 1.1,
          color: C.gold,
          opacity: tin,
          letterSpacing: 1,
          textShadow: "0 6px 24px rgba(0,0,0,0.85)",
          transform: done ? `scale(${popScale(f, s(a), 9, 1.15)})` : undefined,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          left: 50,
          right: 50,
          top: done ? 462 : 446,
          textAlign: "center",
          fontFamily: manrope,
          fontWeight: 700,
          fontSize: 36,
          color: C.ivory,
          opacity: sin,
          textShadow: "0 4px 14px rgba(0,0,0,0.8)",
        }}
      >
        {sub}
      </div>
    </>
  );
};

/* ---------- Partie téléphone (0 → 22,85 s) ---------- */

const PhonePart: React.FC = () => {
  const f = useCurrentFrame();
  const t = sec(f);
  const rise = interpolate(t, [1.25, 1.9], [1100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.05)) });
  const out = interpolate(t, [22.55, 22.85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pose = poseAt(t, rise, { opacity: out });

  // Accroche (0 → 1,9 s)
  const toBar = ramp(f, s(1.25), 16, 0, 1, inOut);
  const hookTitle = 1 - ramp(f, s(1.45), 10, 0, 1);
  const stepLit = STEPS.find(([a, b]) => t >= a && t < b)?.[2] ?? 0;
  const allLit = ramp(f, s(20.45), 6, 0, 1);

  // Chemin doré de l'accroche
  const pathDraw = ramp(f, 1, 18, 0, 1, Easing.out(Easing.quad));
  const pathD = `M${PATH.map((p) => p.join(" ")).join(" L")}`;

  return (
    <AbsoluteFill>
      {/* chemin (accroche) */}
      {t < 1.9 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - toBar }}>
          <path d={pathD} fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round" strokeDasharray={2000} strokeDashoffset={2000 * (1 - pathDraw)} opacity={0.75} />
        </svg>
      ) : null}

      {/* téléphone */}
      {t >= 1.2 && t < 22.85 ? (
        <Phone pose={pose}>
          <ScreenStack t={t} f={f} />
        </Phone>
      ) : null}
      {t >= 1.9 && t < 22.85 ? <Finger t={t} rise={rise} /> : null}

      {/* voile haut et bas : le téléphone zoomé passe dessous */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 640, background: "linear-gradient(180deg, rgba(11,9,6,1) 0%, rgba(11,9,6,0.96) 78%, rgba(11,9,6,0) 100%)", opacity: t < 1.9 ? 0 : 1 }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "linear-gradient(0deg, rgba(11,9,6,0.95) 0%, rgba(11,9,6,0) 100%)" }} />

      {/* enveloppe (pictogramme, pas une fausse boîte mail) */}
      {t >= 14.05 && t < 14.65 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - ramp(f, s(14.4), 6, 0, 1) }}>
          <div style={{ transform: `scale(${popScale(f, s(14.05), 9, 1.15)})`, padding: 34, borderRadius: 40, background: "rgba(11,9,6,0.88)", border: `3px solid ${C.gold}`, boxShadow: "0 0 60px rgba(240,195,107,0.45)" }}>
            <svg width={180} height={130} viewBox="0 0 180 130">
              <rect x={6} y={6} width={168} height={118} rx={14} fill="none" stroke={C.gold} strokeWidth={8} />
              <path d="M10 14 L90 76 L170 14" fill="none" stroke={C.goldPale} strokeWidth={8} strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : null}

      {/* mention de floutage sur la capture de profil de Yannick */}
      {t >= 16.95 && t < 20.45 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: manrope, fontWeight: 600, fontSize: 26, color: "rgba(255,244,224,0.6)", opacity: ramp(f, s(17.2), 8, 0, 1) }}>
          Real app screen · personal details blurred
        </div>
      ) : null}

      {/* titres d'étape */}
      <Header t={t} f={f} />

      {/* médaillons : chemin (accroche) → barre de progression */}
      {t < 22.85
        ? [0, 1, 2, 3, 4].map((i) => {
            const on = ramp(f, 2 + i * 3.6, 5, 0, 1);
            const x = PATH[i][0] + (barX(i) - PATH[i][0]) * toBar;
            const y = PATH[i][1] + (BAR_Y - PATH[i][1]) * toBar;
            const size = 104 + (62 - 104) * toBar;
            const litNow = t < 1.9 ? 0.15 : Math.max(stepLit > i ? (stepLit === i + 1 ? ramp(f, s(STEPS.find((x2) => x2[2] === i + 1)?.[0] ?? 0), 6, 0.2, 1) : 1) : 0, allLit);
            const pulse = stepLit === i + 1 ? 0.5 + 0.5 * Math.sin(f / 5) : 0;
            return (
              <div key={i} style={{ opacity: on * out }}>
                {i < 4 && t >= 1.9 ? (
                  <div style={{ position: "absolute", left: barX(i) + 31, top: BAR_Y - 2, width: 132 - 62, height: 4, background: stepLit > i + 1 || allLit > 0.5 ? C.gold : "rgba(240,195,107,0.3)" }} />
                ) : null}
                <Medallion x={x} y={y} size={size} n={i + 1} lit={litNow} pulse={pulse} />
              </div>
            );
          })
        : null}

      {/* titre de l'accroche */}
      {t < 1.9 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: hookTitle }}>
          <PunchWord text="SIGN UP" at={6} size={118} color={C.ivory} />
          <div style={{ height: 14 }} />
          <PunchWord text="FOR AFROBACK" at={14} size={86} shine={[22, 40]} />
          <div style={{ height: 26 }} />
          <div style={{ transform: `scale(${popScale(f, 28, 9, 1.2)})`, padding: "10px 34px", borderRadius: 60, border: `4px solid ${C.gold}`, fontFamily: cinzel, fontWeight: 900, fontSize: 48, color: C.gold, background: "rgba(11,9,6,0.8)" }}>
            5 STEPS
          </div>
        </div>
      ) : null}
      {f < 20 ? <Particles at={14} count={26} x={540} y={470} seed="hook" /> : null}
    </AbsoluteFill>
  );
};

/* ---------- Scène « Welcome to the family » (22,85 → 26,0 s) ---------- */

const Row: React.FC<{ at: number; title: string; label: string; children?: React.ReactNode }> = ({ at, title, label, children }) => {
  const f = useCurrentFrame();
  const o = ramp(f, at, 8, 0, 1);
  return (
    <div style={{ opacity: o, transform: `translateY(${(1 - o) * 40}px)`, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 34 }}>
      <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 38, color: C.gold, textShadow: "0 4px 14px rgba(0,0,0,0.9)" }}>{title}</div>
      {children ? <div style={{ marginTop: 12 }}>{children}</div> : null}
      <div style={{ marginTop: 10, fontFamily: manrope, fontWeight: 700, fontSize: 34, color: C.ivory, textShadow: "0 4px 14px rgba(0,0,0,0.9)" }}>{label}</div>
    </div>
  );
};

const WelcomePart: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = s(22.85);
  const fin = ramp(f, t0, 8, 0, 1);
  const fout = 1 - ramp(f, s(25.88), 4, 0, 1);
  if (f < t0 || f >= s(26.0)) return null;
  const z = interpolate(f, [t0, s(26)], [1.05, 1.13]);
  return (
    <AbsoluteFill style={{ opacity: fin * fout }}>
      <Img src={staticFile("img/bienvenue.jpg")} style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover", transform: `scale(${z})`, filter: "brightness(0.42)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,9,6,0.85) 0%, rgba(11,9,6,0.35) 40%, rgba(11,9,6,0.75) 100%)" }} />
      <div style={{ position: "absolute", left: 50, right: 50, top: 290, textAlign: "center" }}>
        <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 62, lineHeight: 1.15, color: C.ivory, textShadow: "0 6px 24px rgba(0,0,0,0.9)", opacity: ramp(f, t0 + 2, 8, 0, 1) }}>
          Welcome to the great
          <br />
          <span style={{ color: C.gold }}>AfroBack family</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Row at={s(23.3)} title="Protect your account" label="Optional: “Later” is fine">
          <div style={{ width: 600, height: 205, borderRadius: 26, overflow: "hidden", border: `2px solid ${C.border}` }}>
            <Img src={cap("y-protect")} style={{ width: 600, height: (600 * 1688) / 780, marginTop: -(1420 * 600) / 780 }} />
          </div>
        </Row>
        <Row at={s(23.85)} title="Choose your plan" label="Free to start: “Start for free”">
          <Img src={cap("y-plan-free")} style={{ width: 600, height: (600 * 295) / 720, display: "block", borderRadius: 20 }} />
        </Row>
        <Row at={s(24.4)} title="Welcome to AfroBack!" label="Tap “Explore AfroBack”" />
      </div>
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Fin (26,0 → 30,0 s) : badges officiels anglais, non modifiés ---------- */

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = s(26.0);
  if (f < t0) return null;
  const k = f - t0;
  const badge = (at: number) => ({ opacity: ramp(k, at, 8, 0, 1, Easing.out(Easing.quad)), transform: `translateY(${(1 - ramp(k, at, 8, 0, 1)) * 30}px)` });
  const BH = 108;
  return (
    <AbsoluteFill style={{ opacity: ramp(k, 0, 5, 0, 1) }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(240,195,107,0.20) 0%, ${C.black} 62%)` }} />
      <Diamonds id="outro-tuto" opacity={0.05} />
      <Fog y={1500} opacity={0.25} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${popScale(k, 2, 10, 1.15)})`, width: 210, height: 210, borderRadius: 105, overflow: "hidden", border: `5px solid ${C.gold}`, boxShadow: "0 0 80px rgba(240,195,107,0.55)" }}>
          <Img src={staticFile("img/logo-medaillon.jpg")} style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ height: 36 }} />
        <PunchWord text="DOWNLOAD" at={t0 + 3} size={78} color={C.ivory} />
        <div style={{ height: 6 }} />
        <LetterDrop text="AFROBACK" at={t0 + 10} size={124} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, display: "flex", justifyContent: "center", alignItems: "center", gap: 36 }}>
        <div style={badge(s(1.1))}>
          <Img src={staticFile("badges/app-store-en.svg")} style={{ height: BH, width: (BH * 119.66407) / 40, display: "block" }} />
        </div>
        <div style={badge(s(1.25))}>
          {/* PNG officiel Google : zone visible 41 → 209 px sur 250 (marge transparente) ; agrandi pour une hauteur visible égale au badge Apple */}
          <Img src={staticFile("badges/google-play-en.png")} style={{ height: (BH * 250) / 168, width: (BH * 646) / 168, margin: `${-(BH * 41) / 168}px`, display: "block" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <LetterDrop text="afroback.app" at={t0 + s(1.7)} size={64} family={manrope} weight={800} color={C.ivory} colorFrom={{ index: 8, color: C.gold }} stagger={0.6} />
        <div style={{ height: 18 }} />
        <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 40, color: "rgba(255,244,224,0.75)", opacity: ramp(k, s(2.1), 8, 0, 1) }}>Back to our roots</div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1440, textAlign: "center", fontFamily: manrope, fontWeight: 500, fontSize: 21, lineHeight: 1.35, color: "rgba(255,244,224,0.55)", opacity: ramp(k, s(1.5), 8, 0, 1) }}>
        Apple, the Apple logo and App Store are trademarks of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.
      </div>
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */

export const TutorielInscription30s: React.FC<{ withAudio: boolean }> = ({ withAudio }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(240,195,107,0.12) 0%, ${C.black} 70%)` }} />
      <Diamonds id="bg-tuto" opacity={0.035} />
      <PhonePart />
      <WelcomePart />
      <Outro />
      <Grain />
      {withAudio ? <Audio src={staticFile("audio/mix-tutoriel-inscription-30s-en.wav")} /> : null}
    </AbsoluteFill>
  );
};
