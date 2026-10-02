// Vidéo démo de prospection : Reel 30 s de présentation de leparrain.com (candidature community manager).
// Vertical 1080 × 1920. Charte du site (fond clair, bleu nuit, dégradé bleu-violet, Sora + Outfit).
// Textes et chiffres repris du site et des fiches (relevés le 2026-10-02), vouvoiement.
// Musique : « Motivating Mornings » (licence Mixkit), extrait à partir de 47 s.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { sora, outfit, NUIT, ARDOISE, BLEU, VIOLET, VERT, DEGRADE, Grain } from "./LeParrainVisuels";

const W = 1080;
const H = 1920;
const FOND = "#F4F7FF";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const expoOut = Easing.out(Easing.exp);
const ramp = (f: number, a: number, d: number, from: number, to: number, e = expoOut) =>
  interpolate(f, [a, a + d], [from, to], { ...clamp, easing: e });
const rise = (f: number, at: number, dist = 50): React.CSSProperties => ({
  opacity: ramp(f, at, 12, 0, 1),
  transform: `translateY(${ramp(f, at, 18, dist, 0)}px)`,
});
const pop = (f: number, at: number) => {
  if (f < at) return 0;
  if (f < at + 6) return ramp(f, at, 6, 0.6, 1.06);
  return ramp(f, at + 6, 6, 1.06, 1, Easing.out(Easing.quad));
};
const Degrade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: DEGRADE, WebkitBackgroundClip: "text", color: "transparent" }}>{children}</span>
);

/* ---------- Fond : clair, halos bleu et violet qui dérivent ---------- */
const Fond: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: FOND, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1200, height: 1200, left: -500 + Math.sin(f / 80) * 80, top: -300, background: "radial-gradient(circle, rgba(60,131,246,0.20) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", width: 1200, height: 1200, right: -500, top: 1000 + Math.cos(f / 90) * 80, background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 60%)" }} />
      <Grain id="gr" opacite={0.08} />
    </AbsoluteFill>
  );
};

/* ---------- 1. Accroche (0 – 2,5 s) ---------- */
const Accroche: React.FC = () => {
  const f = useCurrentFrame();
  const barre = ramp(f, 38, 10, 0, 1);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 80px" }}>
      <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 100, color: NUIT, lineHeight: 1.05, letterSpacing: -3, ...rise(f, 2) }}>
        Vous payez encore
      </div>
      <div style={{ position: "relative", marginTop: 10, ...rise(f, 10) }}>
        <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 130, color: NUIT, letterSpacing: -4 }}>plein tarif ?</div>
        <div style={{ position: "absolute", left: 0, top: "52%", height: 14, width: `${barre * 100}%`, background: "#E5484D", borderRadius: 7, transform: "rotate(-3deg)" }} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2. Marque (2,5 – 5,5 s) ---------- */
const Marque: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <Img src={staticFile("leparrain/logo.png")} style={{ width: 560, height: (560 / 400) * 142, transform: `scale(${pop(f, 0)})` }} />
      <div style={{ marginTop: 60, fontFamily: sora, fontWeight: 800, fontSize: 104, color: NUIT, lineHeight: 1.05, letterSpacing: -3, ...rise(f, 12) }}>
        Le <Degrade>parrainage</Degrade>
        <br />
        commence ici.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 3. Le site dans un téléphone (5,5 – 11,5 s) ---------- */
const Telephone: React.FC = () => {
  const f = useCurrentFrame();
  const pw = 600;
  const ph = 1220;
  const ecranW = pw - 36;
  const ech = ecranW / 780;
  const scroll = interpolate(f, [20, 70, 95, 150, 170], [0, 1900, 1900, 3900, 3900], { ...clamp, easing: Easing.inOut(Easing.cubic) }) * ech;
  const stats: [string, string][] = [
    ["1 258", "programmes référencés"],
    ["100 %", "offres datées"],
    ["Chaque jour", "mises à jour"],
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 60, top: 300, width: pw, height: ph, borderRadius: 70, background: "#0E1424", padding: 18, boxSizing: "border-box", boxShadow: "0 60px 120px rgba(27,41,75,0.35)", transform: `translateY(${ramp(f, 0, 20, 900, 0)}px) rotate(-3deg)` }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 54, overflow: "hidden", background: "#fff" }}>
          <Img src={staticFile("leparrain/site-mobile-scroll.jpg")} style={{ position: "absolute", width: ecranW, top: -scroll }} />
          <div style={{ position: "absolute", top: 14, left: "50%", marginLeft: -70, width: 140, height: 36, borderRadius: 18, background: "#0E1424" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 600, top: 520, width: 440, display: "flex", flexDirection: "column", gap: 30 }}>
        {stats.map(([n, l], i) => (
          <div key={l} style={{ background: "#fff", borderRadius: 28, padding: "26px 30px", boxShadow: "0 20px 50px rgba(27,41,75,0.15)", transform: `scale(${pop(f, 30 + i * 22)})`, transformOrigin: "left center" }}>
            <div style={{ fontFamily: sora, fontWeight: 800, fontSize: i === 2 ? 50 : 72, lineHeight: 1 }}>
              <Degrade>{n}</Degrade>
            </div>
            <div style={{ marginTop: 8, fontFamily: outfit, fontWeight: 600, fontSize: 30, color: ARDOISE }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", fontFamily: sora, fontWeight: 800, fontSize: 64, color: NUIT, letterSpacing: -2, ...rise(f, 6) }}>
        Tous les parrainages, <Degrade>au même endroit</Degrade>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4. Trois offres (11,5 – 18,5 s) ---------- */
const OFFRES = [
  { marque: "Distingo Bank", cat: "Épargne", vous: "80 €", parrain: "80 €", note: "Jusqu'au 30 octobre · prime filleul sous condition d'encours" },
  { marque: "Chronodrive", cat: "Courses", vous: "10 €", parrain: "10 €", note: "Dès 30 € de première commande" },
  { marque: "Sunology", cat: "Solaire", vous: "10 %", parrain: "", note: "Exclusivité Le Parrain · 10 % au lieu de 7 %" },
];
const Offres: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", fontFamily: sora, fontWeight: 800, fontSize: 76, color: NUIT, letterSpacing: -2, ...rise(f, 0) }}>
        Des offres <Degrade>vérifiées</Degrade>
      </div>
      {OFFRES.map((o, i) => {
        const at = 12 + i * 34;
        return (
          <div
            key={o.marque}
            style={{
              position: "absolute",
              top: 380 + i * 430,
              left: 70,
              right: 70,
              height: 380,
              borderRadius: 36,
              background: "#fff",
              border: "2px solid rgba(60,131,246,0.15)",
              boxShadow: "0 30px 70px rgba(27,41,75,0.14)",
              padding: "36px 44px",
              boxSizing: "border-box",
              opacity: ramp(f, at, 10, 0, 1),
              transform: `translateX(${ramp(f, at, 18, i % 2 ? -1100 : 1100, 0)}px) rotate(${i % 2 ? 1.2 : -1.2}deg)`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 56, color: NUIT }}>{o.marque}</div>
              <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 28, color: BLEU, background: "rgba(60,131,246,0.1)", padding: "8px 20px", borderRadius: 30 }}>{o.cat}</div>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 30 }}>
              <div style={{ flex: 1, background: "rgba(4,119,86,0.08)", borderRadius: 22, padding: "18px 24px" }}>
                <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 28, color: VERT }}>Pour vous</div>
                <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 72, color: VERT, lineHeight: 1.1 }}>{o.vous}</div>
              </div>
              {o.parrain ? (
                <div style={{ flex: 1, background: "rgba(60,131,246,0.08)", borderRadius: 22, padding: "18px 24px" }}>
                  <div style={{ fontFamily: outfit, fontWeight: 600, fontSize: 28, color: BLEU }}>Le parrain</div>
                  <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 72, color: BLEU, lineHeight: 1.1 }}>{o.parrain}</div>
                </div>
              ) : (
                <div style={{ flex: 1, borderRadius: 22, padding: "18px 24px", background: DEGRADE, color: "#fff", display: "flex", alignItems: "center", fontFamily: sora, fontWeight: 800, fontSize: 40, lineHeight: 1.15 }}>
                  Offre
                  <br />
                  boostée
                </div>
              )}
            </div>
            <div style={{ marginTop: 20, fontFamily: outfit, fontWeight: 500, fontSize: 27, color: ARDOISE }}>{o.note}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- 5. Comment ça marche (18,5 – 24,5 s) ---------- */
const ETAPES = [
  ["Choisissez votre programme", "Banque, énergie, courses, shopping…"],
  ["Utilisez le lien ou le code", "Au moment indiqué par la marque"],
  ["Vérifiez vos avantages", "Conditions et date d'attribution"],
];
const Etapes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 220, width: "100%", textAlign: "center", fontFamily: sora, fontWeight: 800, fontSize: 84, color: NUIT, letterSpacing: -2, lineHeight: 1.05, ...rise(f, 0) }}>
        <Degrade>3 étapes</Degrade>
        <br />
        simples
      </div>
      {ETAPES.map(([t, d], i) => {
        const at = 14 + i * 36;
        return (
          <div key={t} style={{ position: "absolute", top: 560 + i * 360, left: 90, right: 90, display: "flex", alignItems: "center", gap: 40, ...rise(f, at, 60) }}>
            <div style={{ flexShrink: 0, width: 170, height: 170, borderRadius: 44, background: DEGRADE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sora, fontWeight: 800, fontSize: 80, color: "#fff", boxShadow: "0 20px 50px rgba(60,131,246,0.35)", transform: `scale(${pop(f, at)})` }}>
              0{i + 1}
            </div>
            <div>
              <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 50, color: NUIT, lineHeight: 1.1 }}>{t}</div>
              <div style={{ marginTop: 10, fontFamily: outfit, fontWeight: 500, fontSize: 34, color: ARDOISE }}>{d}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- 6. Confiance (24,5 – 27,8 s) ---------- */
const Confiance: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["Liens officiels", "Montants sourcés", "100 % gratuit"];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        {items.map((t, i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 30, background: "#fff", borderRadius: 60, padding: "28px 50px 28px 30px", boxShadow: "0 20px 50px rgba(27,41,75,0.12)", ...rise(f, 4 + i * 12, 40) }}>
            <svg width={80} height={80} viewBox="0 0 80 80">
              <circle cx={40} cy={40} r={36} fill="rgba(4,119,86,0.12)" />
              <path d="M24 41 L35 52 L57 29" fill="none" stroke={VERT} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - ramp(f, 10 + i * 12, 14, 0, 1))} />
            </svg>
            <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 60, color: NUIT }}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 60, width: 860, textAlign: "center", fontFamily: outfit, fontWeight: 500, fontSize: 36, color: ARDOISE, ...rise(f, 46, 20) }}>
        Montants relevés sur la page officielle de chaque programme.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 7. Fin (27,8 – 30 s) ---------- */
const Fin: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: `linear-gradient(160deg, ${NUIT} 0%, #2A3E78 100%)` }}>
      <div style={{ background: "#fff", borderRadius: 40, padding: "30px 46px", transform: `scale(${pop(f, 0)})` }}>
        <Img src={staticFile("leparrain/logo.png")} style={{ width: 480, height: (480 / 400) * 142 }} />
      </div>
      <div style={{ marginTop: 56, padding: "26px 60px", borderRadius: 60, background: DEGRADE, fontFamily: sora, fontWeight: 800, fontSize: 64, color: "#fff", ...rise(f, 10, 30), boxShadow: `0 20px 60px rgba(139,92,246,0.45)` }}>
        leparrain.com
      </div>
      <div style={{ marginTop: 30, fontFamily: outfit, fontWeight: 600, fontSize: 36, color: "rgba(255,255,255,0.8)", ...rise(f, 18, 20) }}>
        Le parrainage commence ici.
      </div>
      <div style={{ position: "absolute", bottom: 60, fontFamily: outfit, fontWeight: 500, fontSize: 22, color: "rgba(255,255,255,0.4)" }}>Vidéo démo · Yannick NSANA MADOU</div>
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */
const SCENES: [React.FC, number, number][] = [
  [Accroche, 0, 75],
  [Marque, 75, 90],
  [Telephone, 165, 180],
  [Offres, 345, 210],
  [Etapes, 555, 180],
  [Confiance, 735, 100],
  [Fin, 835, 65],
];

/* transition : rideau au dégradé de marque */
const Rideau: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  if (f < at - 8 || f > at + 8) return null;
  const y = interpolate(f, [at - 8, at + 8], [H, -H], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <div style={{ position: "absolute", left: 0, top: y, width: W, height: H, background: `linear-gradient(180deg, ${BLEU}, ${VIOLET})` }} />;
};

export const LeParrainReel: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill>
    <Fond />
    {SCENES.map(([S, from, dur]) => (
      <Sequence key={from} from={from} durationInFrames={dur}>
        <S />
      </Sequence>
    ))}
    {SCENES.slice(1).map(([, from]) => (
      <Rideau key={from} at={from} />
    ))}
    {withAudio ? (
      <Audio src={staticFile("leparrain/musique-motivating-mornings-mixkit.mp3")} trimBefore={47 * 30} volume={(fr) => interpolate(fr, [0, 6, 870, 900], [0, 0.8, 0.8, 0], clamp)} />
    ) : null}
  </AbsoluteFill>
);
