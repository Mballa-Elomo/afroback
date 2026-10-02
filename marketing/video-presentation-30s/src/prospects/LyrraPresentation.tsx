// Vidéo démo de prospection (pas AFROBACK) : présentation du site lyrra.pro en motion design.
// 30 s, paysage 1920 × 1080. Charte reprise du site : fond vert très sombre, accent citron vert,
// titres Onest, texte Manrope. Tous les contenus viennent de lyrra.pro (relevé le 2026-10-01).
// Musique : « Digital Clouds » (licence Mixkit), extrait à partir de 51 s : partie calme
// jusqu'à 12 s de vidéo, puis reprise pleine énergie.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadOnest } from "@remotion/google-fonts/Onest";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";

const onest = loadOnest("normal", { weights: ["600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
const manrope = loadManrope("normal", { weights: ["500", "700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;

const W = 1920;
const H = 1080;
const BG = "#101412";
const CARD = "#161C19";
const LIME = "#C8F04D";
const LIME_D = "#8FBF1A";
const MUTED = "#C5CCC4";
const LINE = "rgba(255,255,255,0.08)";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const expoOut = Easing.out(Easing.exp);
const ramp = (f: number, a: number, d: number, from: number, to: number, e = expoOut) =>
  interpolate(f, [a, a + d], [from, to], { ...clamp, easing: e });
const pop = (f: number, at: number) => {
  if (f < at) return 0;
  if (f < at + 6) return ramp(f, at, 6, 0.6, 1.06);
  return ramp(f, at + 6, 6, 1.06, 1, Easing.out(Easing.quad));
};
/* apparition standard : fondu + montée */
const rise = (f: number, at: number, dist = 40): React.CSSProperties => ({
  opacity: ramp(f, at, 12, 0, 1),
  transform: `translateY(${ramp(f, at, 16, dist, 0)}px)`,
});

/* ---------- Éléments communs ---------- */

const Fond: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          left: 900 + Math.sin(f / 90) * 120,
          top: -300 + Math.cos(f / 110) * 80,
          background: "radial-gradient(circle, rgba(200,240,77,0.10) 0%, transparent 60%)",
        }}
      />
      {/* grille fine */}
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.5 }}>
        <defs>
          <pattern id="grille" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0 L0 0 0 80" fill="none" stroke={LINE} strokeWidth={1} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grille)" />
      </svg>
    </AbsoluteFill>
  );
};

const Logo: React.FC<{ size: number; draw?: number }> = ({ size, draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <defs>
      <linearGradient id="lyrraG" x1="12" y1="6" x2="56" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor={LIME_D} />
        <stop offset="1" stopColor={LIME} />
      </linearGradient>
    </defs>
    <path
      d="M22 14v30h30"
      stroke="url(#lyrraG)"
      strokeWidth={14}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={60}
      strokeDashoffset={60 * (1 - draw)}
    />
    <circle cx="40" cy="26" r={5.4 * Math.min(1, Math.max(0, draw * 2 - 1))} fill="url(#lyrraG)" />
  </svg>
);

const Eyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: LIME, display: "flex", alignItems: "center", gap: 14, ...style }}>
    <span style={{ width: 10, height: 10, borderRadius: 5, background: LIME }} />
    {children}
  </div>
);

const Titre: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 84, style }) => (
  <div style={{ fontFamily: onest, fontWeight: 800, fontSize: size, color: "#fff", lineHeight: 1.05, letterSpacing: -2, ...style }}>{children}</div>
);

/* Transition : volet citron vert qui balaie l'écran */
const Volet: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > at + 16) return null;
  const x = interpolate(f, [at, at + 14], [-W * 1.2, W * 1.2], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <div style={{ position: "absolute", top: 0, left: x, width: W, height: H, background: LIME, transform: "skewX(-12deg)" }} />;
};

/* ---------- 1. Accroche (0 – 3 s) ---------- */

const Accroche: React.FC = () => {
  const f = useCurrentFrame();
  const barre = ramp(f, 34, 10, 0, 1);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", ...rise(f, 2) }}>
        <Titre size={96} style={{ color: MUTED }}>Vos processus sont compliqués ?</Titre>
        <div style={{ position: "absolute", left: 0, top: "52%", height: 8, width: `${barre * 100}%`, background: LIME, borderRadius: 4 }} />
      </div>
      <div style={{ marginTop: 40, ...rise(f, 46) }}>
        <Titre size={130}>
          Rendons-les <span style={{ color: LIME }}>simples.</span>
        </Titre>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2. Logo (3 – 6 s) ---------- */

const Marque: React.FC = () => {
  const f = useCurrentFrame();
  const draw = ramp(f, 2, 22, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ transform: `scale(${pop(f, 0)})` }}>
          <Logo size={230} draw={draw} />
        </div>
        <div style={{ fontFamily: onest, fontWeight: 800, fontSize: 210, color: "#fff", letterSpacing: -6, clipPath: `inset(0 ${100 - ramp(f, 14, 18, 0, 100)}% 0 0)` }}>
          Lyrra
        </div>
      </div>
      <div style={{ marginTop: 30, fontFamily: manrope, fontWeight: 700, fontSize: 40, color: MUTED, letterSpacing: 2, ...rise(f, 34) }}>
        Conseil IT · <span style={{ color: LIME }}>Nintex K2</span> · Édition logicielle
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 3. Le site dans un navigateur (6 – 12 s) ---------- */

const SITE_H = 8222; // capture pleine page à 1440 px de large
const Navigateur: React.FC = () => {
  const f = useCurrentFrame();
  const bw = 1180;
  const bh = 740;
  const echelle = bw / 1440;
  const scroll = interpolate(f, [24, 170], [0, SITE_H * echelle - (bh - 52) - 40], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tilt = ramp(f, 0, 30, 18, 6, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, top: 300, width: 520 }}>
        <Eyebrow style={rise(f, 6)}>LYRRA.PRO</Eyebrow>
        <Titre size={76} style={{ marginTop: 24, ...rise(f, 10) }}>
          Conseil métier et logiciels, rendus <span style={{ color: LIME }}>simples.</span>
        </Titre>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 16 }}>
          {["Conseil indépendant", "K2 certifié", "4 produits publiés"].map((t, i) => (
            <div key={t} style={{ fontFamily: manrope, fontWeight: 700, fontSize: 32, color: "#fff", ...rise(f, 30 + i * 8, 20) }}>
              <span style={{ color: LIME, marginRight: 14 }}>✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 660, top: 170, perspective: 2200 }}>
        <div
          style={{
            width: bw,
            height: bh,
            borderRadius: 22,
            overflow: "hidden",
            background: "#0B0E0D",
            border: `2px solid ${LINE}`,
            boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,240,77,0.15)",
            transform: `rotateY(-${tilt}deg) translateX(${ramp(f, 0, 26, 900, 0)}px)`,
          }}
        >
          <div style={{ height: 52, background: CARD, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `1px solid ${LINE}` }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
            ))}
            <div style={{ marginLeft: 24, flex: 1, height: 30, borderRadius: 15, background: BG, color: MUTED, fontFamily: manrope, fontSize: 18, display: "flex", alignItems: "center", paddingLeft: 18 }}>
              🔒 lyrra.pro
            </div>
          </div>
          <div style={{ position: "relative", height: bh - 52, overflow: "hidden" }}>
            <Img src={staticFile("lyrra/site-desktop-full.png")} style={{ position: "absolute", width: bw, top: -scroll }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4. Expertises (12 – 17 s) ---------- */

const EXPERTISES = [
  ["Conseil informatique", "Audit SI, architecture, cadrage et pilotage jusqu'à la production."],
  ["Nintex K2", "K2 Five / Cloud : SmartObjects, SmartForms, workflows et K2 Connect."],
  ["BPM & processus", "Cartographie BPMN, ateliers métier et priorisation de la valeur."],
  ["Développement", "Applications web, APIs, low-code / no-code et intégration d'IA."],
  ["Intégrations", "Microsoft, GED / DocuWare, SAP, CRM et Flux Caster."],
  ["Accessibilité", "Conception inclusive, RGAA / WCAG."],
];

const Expertises: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: "110px 110px" }}>
      <Eyebrow style={rise(f, 0)}>NOS EXPERTISES</Eyebrow>
      <Titre size={80} style={{ marginTop: 18, ...rise(f, 4) }}>
        Du diagnostic au <span style={{ color: LIME }}>logiciel.</span>
      </Titre>
      <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }}>
        {EXPERTISES.map(([t, d], i) => {
          const at = 12 + i * 9;
          const vedette = i === 1;
          return (
            <div
              key={t}
              style={{
                height: 260,
                borderRadius: 28,
                padding: "34px 36px",
                background: vedette ? LIME : CARD,
                border: `1px solid ${vedette ? LIME : LINE}`,
                transform: `scale(${pop(f, at)})`,
                opacity: f >= at ? 1 : 0,
              }}
            >
              <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: vedette ? BG : LIME }}>
                {String(i + 1).padStart(2, "0")}/06
              </div>
              <div style={{ marginTop: 14, fontFamily: onest, fontWeight: 800, fontSize: 46, color: vedette ? BG : "#fff", letterSpacing: -1 }}>{t}</div>
              <div style={{ marginTop: 12, fontFamily: manrope, fontWeight: 500, fontSize: 25, lineHeight: 1.35, color: vedette ? "#24301A" : MUTED }}>{d}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 5. Méthode (17 – 21 s) ---------- */

const ETAPES = [
  ["Cadrer le besoin", "Ateliers métier et cartographie"],
  ["Choisir les outils", "K2, intégrations, architecture"],
  ["Construire & ajuster", "Itératif, jusqu'au réel"],
  ["Transférer", "Documentation, formation, gouvernance"],
];

const Methode: React.FC = () => {
  const f = useCurrentFrame();
  const prog = ramp(f, 12, 62, 0, 1, Easing.inOut(Easing.cubic));
  const x0 = 250;
  const x1 = W - 250;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center" }}>
        <Eyebrow style={{ justifyContent: "center", ...rise(f, 0) }}>MÉTHODE</Eyebrow>
        <Titre size={84} style={{ marginTop: 18, ...rise(f, 4) }}>
          Transformer vos processus <span style={{ color: LIME }}>sans friction</span>
        </Titre>
      </div>
      <div style={{ position: "absolute", top: 600, left: x0, width: x1 - x0, height: 6, borderRadius: 3, background: LINE }} />
      <div style={{ position: "absolute", top: 600, left: x0, width: (x1 - x0) * prog, height: 6, borderRadius: 3, background: LIME }} />
      {ETAPES.map(([t, d], i) => {
        const x = x0 + ((x1 - x0) * i) / 3;
        const atteint = prog >= i / 3 - 0.001;
        const at = 12 + (62 * i) / 3;
        return (
          <div key={t} style={{ position: "absolute", left: x - 200, top: 545, width: 400, textAlign: "center" }}>
            <div
              style={{
                margin: "0 auto",
                width: 116,
                height: 116,
                borderRadius: 58,
                background: atteint ? LIME : CARD,
                border: `3px solid ${atteint ? LIME : LINE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: onest,
                fontWeight: 800,
                fontSize: 44,
                color: atteint ? BG : MUTED,
                transform: `scale(${atteint ? pop(f, Math.round(at)) || 1 : 1})`,
                marginTop: -0,
                position: "relative",
                top: -27,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ marginTop: 10, fontFamily: onest, fontWeight: 800, fontSize: 40, color: "#fff", ...rise(f, Math.round(at) + 4, 20) }}>{t}</div>
            <div style={{ marginTop: 8, fontFamily: manrope, fontWeight: 500, fontSize: 26, color: MUTED, ...rise(f, Math.round(at) + 8, 20) }}>{d}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- 6. Logiciels (21 – 25 s) ---------- */

const PRODUITS = [
  ["LMS entreprise", "LyrraStudio", "Création 100 % no-code · inclusif, dont DYS", "lyrrastudio.com"],
  ["Vente de formations", "LyrraOne", "Éditeur pédagogique · paiements Stripe", "lyrraone.com"],
  ["Immobilier & travaux", "MonBienDemain", "Carte biens + artisans · 0 % commission", "monbiendemain.fr"],
  ["Moteur de flux", "Flux Caster", "API unifiée, pensée pour Nintex K2", "fluxcaster.com"],
];

const Logiciels: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: "120px 110px" }}>
      <div style={{ textAlign: "center" }}>
        <Eyebrow style={{ justifyContent: "center", ...rise(f, 0) }}>ÉDITIONS</Eyebrow>
        <Titre size={84} style={{ marginTop: 18, ...rise(f, 4) }}>
          Quatre logiciels <span style={{ color: LIME }}>publiés</span>
        </Titre>
      </div>
      <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 30 }}>
        {PRODUITS.map(([cat, nom, d, url], i) => {
          const at = 12 + i * 8;
          const vedette = i === 3;
          return (
            <div
              key={nom}
              style={{
                height: 470,
                borderRadius: 30,
                padding: "38px 34px",
                background: vedette ? LIME : CARD,
                border: `1px solid ${vedette ? LIME : LINE}`,
                display: "flex",
                flexDirection: "column",
                opacity: ramp(f, at, 10, 0, 1),
                transform: `translateY(${ramp(f, at, 18, 160, 0)}px)`,
              }}
            >
              <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: vedette ? "#3A4A12" : LIME }}>{cat.toUpperCase()}</div>
              <div style={{ marginTop: 18, fontFamily: onest, fontWeight: 800, fontSize: 54, color: vedette ? BG : "#fff", letterSpacing: -1.5 }}>{nom}</div>
              <div style={{ marginTop: 18, fontFamily: manrope, fontWeight: 500, fontSize: 27, lineHeight: 1.4, color: vedette ? "#24301A" : MUTED, flex: 1 }}>{d}</div>
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "12px 24px",
                  borderRadius: 30,
                  background: vedette ? BG : LIME,
                  color: vedette ? LIME : BG,
                  fontFamily: manrope,
                  fontWeight: 800,
                  fontSize: 24,
                }}
              >
                {url} ↗
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 7. Chiffres (25 – 27,5 s) ---------- */

const Chiffres: React.FC = () => {
  const f = useCurrentFrame();
  const compte = (to: number, at: number) => Math.round(ramp(f, at, 22, 0, to, Easing.out(Easing.cubic)));
  const items: [string, string][] = [
    [`${compte(20, 4)}+`, "années d'expérience"],
    [`${compte(4, 8)}`, "logiciels publiés"],
    [`${compte(9, 12)}`, "certifications"],
    ["FR", "French Tech Est"],
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 30 }}>
        {items.map(([n, l], i) => (
          <div
            key={l}
            style={{
              width: 380,
              padding: "50px 0",
              borderRadius: 30,
              background: CARD,
              border: `1px solid ${LINE}`,
              textAlign: "center",
              transform: `scale(${pop(f, 2 + i * 4)})`,
            }}
          >
            <div style={{ fontFamily: onest, fontWeight: 800, fontSize: 120, color: LIME, lineHeight: 1 }}>{n}</div>
            <div style={{ marginTop: 14, fontFamily: manrope, fontWeight: 700, fontSize: 30, color: "#fff" }}>{l}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 50,
          padding: "16px 34px",
          borderRadius: 40,
          border: `2px solid ${LIME}`,
          fontFamily: manrope,
          fontWeight: 800,
          fontSize: 30,
          color: "#fff",
          ...rise(f, 26, 20),
        }}
      >
        <span style={{ color: LIME }}>●</span> Certification Nintex K2 Connect Five — Expert, en cours de validité
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 8. Appel à l'action (27,5 – 30 s) ---------- */

const Contact: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: LIME }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, transform: `scale(${pop(f, 0)})` }}>
        <div style={{ background: BG, borderRadius: 34, padding: 10 }}>
          <Logo size={130} />
        </div>
        <div style={{ fontFamily: onest, fontWeight: 800, fontSize: 130, color: BG, letterSpacing: -4 }}>Lyrra</div>
      </div>
      <Titre size={70} style={{ marginTop: 40, color: BG, textAlign: "center", ...rise(f, 8, 30) }}>
        Un besoin métier, un process K2 ?
      </Titre>
      <div style={{ marginTop: 40, display: "flex", gap: 24, ...rise(f, 16, 30) }}>
        <div style={{ padding: "18px 40px", borderRadius: 50, background: BG, color: LIME, fontFamily: manrope, fontWeight: 800, fontSize: 40 }}>lyrra.pro ↗</div>
        <div style={{ padding: "18px 40px", borderRadius: 50, border: `3px solid ${BG}`, color: BG, fontFamily: manrope, fontWeight: 800, fontSize: 40 }}>contact@lyrra.pro</div>
      </div>
      <div style={{ position: "absolute", bottom: 34, fontFamily: manrope, fontWeight: 700, fontSize: 20, color: "rgba(16,20,18,0.55)", ...rise(f, 30, 10) }}>
        Vidéo démo · motion design Yannick NSANA MADOU
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */

const SCENES: [React.FC, number, number][] = [
  [Accroche, 0, 90],
  [Marque, 90, 90],
  [Navigateur, 180, 180],
  [Expertises, 360, 150],
  [Methode, 510, 120],
  [Logiciels, 630, 120],
  [Chiffres, 750, 75],
  [Contact, 825, 75],
];

export const LyrraPresentation: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ background: BG }}>
    <Fond />
    {SCENES.map(([Scene, from, dur]) => (
      <Sequence key={from} from={from} durationInFrames={dur}>
        <Scene />
      </Sequence>
    ))}
    {SCENES.slice(1).map(([, from]) => (
      <Volet key={from} at={from - 7} />
    ))}
    {withAudio ? (
      <Audio
        src={staticFile("lyrra/musique-digital-clouds-mixkit.mp3")}
        trimBefore={51 * 30}
        volume={(fr) => interpolate(fr, [0, 10, 865, 900], [0, 0.85, 0.85, 0], clamp)}
      />
    ) : null}
  </AbsoluteFill>
);
