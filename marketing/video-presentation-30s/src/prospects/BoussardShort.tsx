// Vidéo démo de prospection (pas AFROBACK) : Short vertical de 30 s tiré de la vidéo YouTube
// d'Édouard Boussard « Je joue contre le n°2 français en simple au pickleball » (r283ZgdGDME).
// Brief : annonce Codeur 490535 (montage YouTube long terme, incrustation des scores demandée).
// Tous les faits viennent de sa vidéo : DUPR 4.342 / 5.049, classements 73 / 2, score 0-11,
// citations exactes (sous-titres corrigés à partir de la transcription automatique).
// Musique : « Sports Highlights » (licence Mixkit). Les rallyes sont muets (le son d'origine est son commentaire).
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";

const mont = loadMontserrat("normal", { weights: ["600", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

const W = 1080;
const H = 1920;
const LIME = "#D7F542";
const NAVY = "#0B1530";
const BLEU = "#1E4FD8";
const ROUGE = "#FF3B4E";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const expoOut = Easing.out(Easing.exp);
const ramp = (f: number, a: number, d: number, from: number, to: number, e = expoOut) =>
  interpolate(f, [a, a + d], [from, to], { ...clamp, easing: e });
const pop = (f: number, at: number) => {
  if (f < at) return 0;
  if (f < at + 5) return ramp(f, at, 5, 0.5, 1.12);
  return ramp(f, at + 5, 5, 1.12, 1, Easing.out(Easing.quad));
};
const v = (n: string) => staticFile(`boussard/${n}.mp4`);

/* ---------- Sous-titres mot à mot ---------- */

type Mot = { t: number; w: string; fort?: boolean }; // t en secondes depuis le début du clip

const SousTitres: React.FC<{ mots: Mot[]; parGroupe?: number; top?: number }> = ({ mots, parGroupe = 3, top = 1380 }) => {
  const f = useCurrentFrame();
  const s = f / 30;
  // groupes de N mots maximum, coupés aussi après un point
  const groupes: number[][] = [];
  let cur: number[] = [];
  mots.forEach((m, i) => {
    cur.push(i);
    if (cur.length >= parGroupe || /[.!?]$/.test(m.w)) {
      groupes.push(cur);
      cur = [];
    }
  });
  if (cur.length) groupes.push(cur);
  let idx = -1;
  mots.forEach((m, i) => {
    if (s >= m.t) idx = i;
  });
  if (idx < 0) return null;
  const groupe = groupes.find((g) => g.includes(idx))!;
  const debut = mots[groupe[0]].t * 30;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 40,
        right: 40,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: 34,
        transform: `scale(${ramp(f, debut, 6, 0.85, 1)})`,
      }}
    >
      {groupe.map((i) => {
        const m = mots[i];
        const actif = i === idx;
        return (
          <span
            key={i}
            style={{
              fontFamily: mont,
              fontWeight: 900,
              fontSize: 78,
              lineHeight: 1.15,
              textTransform: "uppercase",
              color: actif || m.fort ? LIME : "#fff",
              WebkitTextStroke: "3px #000",
              paintOrder: "stroke",
              textShadow: "0 6px 18px rgba(0,0,0,0.7)",
              display: "inline-block",
              transform: `scale(${actif ? 1.04 : 1})`,
            }}
          >
            {m.w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Facecam recadrée en vertical ---------- */

const Facecam: React.FC<{ n: string; cx?: number; zoom?: number; haut?: number }> = ({ n, cx = 0.45, zoom = 1, haut }) => {
  const f = useCurrentFrame();
  const h = H * zoom * ramp(f, 0, 180, 1, 1.06, Easing.linear);
  const w = (h * 16) / 9;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <OffthreadVideo src={v(n)} style={{ position: "absolute", height: h, width: w, left: W / 2 - cx * w, top: haut === undefined ? (H - h) / 2 : 420 - haut * h }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 28%, transparent 62%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------- 1. Accroche (0 – 3,9 s) ---------- */

const MOTS_ACCROCHE: Mot[] = [
  { t: 0.09, w: "On" }, { t: 0.21, w: "a" }, { t: 0.49, w: "le" },
  { t: 0.69, w: "numéro" }, { t: 1.05, w: "2", fort: true }, { t: 1.21, w: "français" },
  { t: 1.53, w: "Nicolas" }, { t: 1.89, w: "Ebran" }, { t: 2.21, w: "qui" },
  { t: 2.37, w: "vient" }, { t: 2.57, w: "participer" }, { t: 3.05, w: "à" },
  { t: 3.21, w: "cette" }, { t: 3.33, w: "inauguration" },
];

const Accroche: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Facecam n="hook" zoom={1.3} cx={0.46} haut={0.175} />
      <div style={{ position: "absolute", top: 100, left: 60, right: 60, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: LIME,
            color: NAVY,
            fontFamily: mont,
            fontWeight: 900,
            fontSize: 74,
            lineHeight: 1.1,
            padding: "18px 30px",
            borderRadius: 18,
            textTransform: "uppercase",
            transform: `rotate(-2deg) scale(${pop(f, 2)})`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          }}
        >
          J'ai affronté le
          <br />
          n°2 français
        </div>
      </div>
      <SousTitres mots={MOTS_ACCROCHE} />
    </AbsoluteFill>
  );
};

/* ---------- 2. Face-à-face DUPR (3,9 – 6,9 s) ---------- */

const Joueur: React.FC<{ nom: string; prenom: string; dupr: string; rang: string; couleur: string; at: number; droite?: boolean }> = ({
  nom,
  prenom,
  dupr,
  rang,
  couleur,
  at,
  droite,
}) => {
  const f = useCurrentFrame();
  const x = ramp(f, at, 14, droite ? 700 : -700, 0);
  const val = parseFloat(dupr) * ramp(f, at + 6, 24, 0.6, 1, Easing.out(Easing.cubic));
  return (
    <div
      style={{
        width: 900,
        padding: "34px 44px",
        borderRadius: 30,
        background: `linear-gradient(135deg, ${couleur}, ${NAVY})`,
        boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: droite ? "row-reverse" : "row",
        textAlign: droite ? "right" : "left",
      }}
    >
      <div>
        <div style={{ fontFamily: mont, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.8)" }}>{prenom}</div>
        <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 70, color: "#fff", lineHeight: 1 }}>{nom}</div>
        <div style={{ marginTop: 14, fontFamily: mont, fontWeight: 800, fontSize: 34, color: LIME }}>{rang}</div>
      </div>
      <div>
        <div style={{ fontFamily: mont, fontWeight: 800, fontSize: 30, color: "rgba(255,255,255,0.7)", letterSpacing: 4 }}>DUPR</div>
        <div style={{ fontFamily: anton, fontSize: 130, color: "#fff", lineHeight: 1 }}>{val.toFixed(3)}</div>
      </div>
    </div>
  );
};

const FaceAFace: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo src={v("fond")} muted style={{ position: "absolute", height: H, width: (H * 16) / 9, left: -800, filter: "blur(22px) brightness(0.45)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 }}>
        <Joueur prenom="Édouard" nom="BOUSSARD" dupr="4.342" rang="N°73 FRANÇAIS" couleur="#2B3A55" at={0} />
        <div style={{ fontFamily: anton, fontSize: 160, color: LIME, transform: `scale(${pop(f, 12)})`, textShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>VS</div>
        <Joueur prenom="Nicolas" nom="EBRAN" dupr="5.049" rang="N°2 FRANÇAIS" couleur={BLEU} at={8} droite />
        <div style={{ marginTop: 30, fontFamily: mont, fontWeight: 800, fontSize: 36, color: "rgba(255,255,255,0.85)", textAlign: "center", opacity: ramp(f, 30, 12, 0, 1) }}>
          Match amical · 11 points · rally scoring
          <br />
          <span style={{ color: LIME }}>Smash Zone Le Mans</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 3. Rallyes avec tableau de score animé ---------- */

const Score: React.FC<{ avant: number; apres: number; at: number; nicolasServe?: boolean }> = ({ avant, apres, at }) => {
  const f = useCurrentFrame();
  const n = f >= at ? apres : avant;
  const flash = f >= at ? Math.max(0, 1 - (f - at) / 14) : 0;
  const ligne = (nom: string, pts: number, actif: boolean) => (
    <div style={{ display: "flex", alignItems: "center", height: 70, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
      <div style={{ flex: 1, paddingLeft: 26, fontFamily: mont, fontWeight: 800, fontSize: 38, color: "#fff" }}>{nom}</div>
      <div
        style={{
          width: 110,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: anton,
          fontSize: 54,
          color: actif ? NAVY : "#fff",
          background: actif ? `rgba(215,245,66,${0.75 + 0.25 * flash})` : "rgba(255,255,255,0.08)",
          transform: actif && flash > 0 ? `scale(${1 + flash * 0.25})` : undefined,
        }}
      >
        {pts}
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", top: 470, left: 60, width: 520, borderRadius: 18, overflow: "hidden", background: "rgba(11,21,48,0.92)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
      <div style={{ background: BLEU, padding: "8px 26px", fontFamily: mont, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: "#fff" }}>SIMPLE HOMME 5.0 · 11 PTS</div>
      {ligne("ÉDOUARD", 0, false)}
      {ligne("NICOLAS", n, true)}
      {flash > 0 ? (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 4, background: LIME }} />
      ) : null}
    </div>
  );
};

const Rallye: React.FC<{
  n: string;
  dur: number;
  avant: number;
  apres: number;
  label: string;
  trimBefore?: number;
  rate?: number;
  replay?: boolean;
}> = ({ n, dur, avant, apres, label, trimBefore = 0, rate = 1, replay }) => {
  const f = useCurrentFrame();
  // la vidéo source (1920 × 1080) : on masque les 110 px du haut (son propre tableau de score)
  const sc = 0.66 * ramp(f, 0, dur, 1, replay ? 1.35 : 1.08, Easing.inOut(Easing.quad));
  const vw = 1920 * sc;
  const vh = 1080 * sc;
  const bandTop = 700;
  const bandH = (1080 - 110) * 0.66;
  const focusY = replay ? 0.62 : 0.5;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo src={v(n)} muted trimBefore={trimBefore} playbackRate={rate} style={{ position: "absolute", height: H, width: (H * 16) / 9, left: -700, filter: "blur(26px) brightness(0.4) saturate(1.2)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: bandTop, left: 0, width: W, height: bandH, overflow: "hidden", boxShadow: "0 0 0 4px rgba(215,245,66,0.9), 0 30px 80px rgba(0,0,0,0.6)" }}>
        <OffthreadVideo
          src={v(n)}
          muted
          trimBefore={trimBefore}
          playbackRate={rate}
          style={{ position: "absolute", width: vw, height: vh, left: (W - vw) / 2 + (replay ? -120 * (sc / 0.66 - 1) * 3 : 0), top: bandH * focusY - vh * (110 / 1080 + (1 - 110 / 1080) * focusY) }}
        />
        {replay ? (
          <>
            <AbsoluteFill style={{ boxShadow: "inset 0 0 160px rgba(0,0,0,0.8)" }} />
            <div style={{ position: "absolute", top: 20, right: 24, fontFamily: mont, fontWeight: 900, fontSize: 34, color: "#fff", background: ROUGE, padding: "6px 18px", borderRadius: 8, letterSpacing: 3 }}>
              ● REPLAY ×0,5
            </div>
          </>
        ) : null}
      </div>
      <Score avant={avant} apres={apres} at={replay ? 0 : dur - 9} />
      <div style={{ position: "absolute", top: bandTop + bandH + 70, width: "100%", textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: mont,
            fontWeight: 900,
            fontSize: 70,
            color: "#fff",
            textTransform: "uppercase",
            WebkitTextStroke: "3px #000",
            paintOrder: "stroke",
            transform: `scale(${pop(f, 4)})`,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: mont, fontWeight: 900, fontSize: 52, color: LIME, textTransform: "uppercase", textShadow: "0 6px 20px rgba(0,0,0,0.6)" }}>
        Édouard vs n°2 français
      </div>
      {/* flash de coupe */}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 4], [0.5, 0], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/* Grand score final sur le dernier rallye */
const ScoreFinal: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(11,21,48,${ramp(f, 0, 8, 0, 0.7)})` }}>
      <div style={{ fontFamily: anton, fontSize: 300, color: "#fff", transform: `scale(${pop(f, 0)})`, textShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        0 <span style={{ color: LIME }}>–</span> 11
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4. Débrief (citation) ---------- */

const MOTS_DEBRIEF: Mot[] = [
  { t: 0.18, w: "malgré" }, { t: 0.5, w: "la" }, { t: 0.66, w: "défaite" },
  { t: 1.06, w: "en" }, { t: 1.18, w: "ayant" }, { t: 1.46, w: "pas" },
  { t: 1.58, w: "marqué" }, { t: 1.98, w: "un" },
  { t: 2.14, w: "seul" }, { t: 2.34, w: "point." }, { t: 2.58, w: "Faut" },
  { t: 2.74, w: "jamais" }, { t: 2.98, w: "oublier" }, { t: 3.26, w: "que" },
  { t: 3.38, w: "c'est" }, { t: 3.54, w: "dans" }, { t: 3.66, w: "les" },
  { t: 3.78, w: "défaites", fort: true }, { t: 4.1, w: "qu'on" }, { t: 4.26, w: "apprend" },
  { t: 4.5, w: "le" }, { t: 4.58, w: "plus", fort: true }, { t: 4.86, w: "pas" },
  { t: 4.98, w: "dans" }, { t: 5.1, w: "les" }, { t: 5.22, w: "victoires." },
];

const Debrief: React.FC = () => (
  <AbsoluteFill>
    <Facecam n="debrief" cx={0.44} zoom={1.05} />
    <SousTitres mots={MOTS_DEBRIEF} parGroupe={3} />
  </AbsoluteFill>
);

/* ---------- 5. Fin ---------- */

const Fin: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, #16265A 0%, ${NAVY} 70%)`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: mont, fontWeight: 800, fontSize: 46, color: "rgba(255,255,255,0.8)", letterSpacing: 6, ...{ opacity: ramp(f, 0, 8, 0, 1) } }}>OBJECTIF</div>
      <div style={{ fontFamily: anton, fontSize: 280, color: LIME, lineHeight: 1, transform: `scale(${pop(f, 2)})` }}>5.0</div>
      <div style={{ marginTop: 30, padding: "18px 40px", borderRadius: 50, background: ROUGE, fontFamily: mont, fontWeight: 900, fontSize: 44, color: "#fff", transform: `scale(${pop(f, 12)})` }}>
        ▶ ABONNE-TOI
      </div>
      <div style={{ marginTop: 26, fontFamily: mont, fontWeight: 800, fontSize: 38, color: "#fff", opacity: ramp(f, 18, 10, 0, 1) }}>@edouardboussardpickleball</div>
      <div style={{ position: "absolute", bottom: 70, fontFamily: mont, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,0.4)" }}>Montage démo · Yannick NSANA MADOU</div>
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */

// [début, durée] en images (30 i/s)
const T = {
  accroche: [0, 117],
  faceAFace: [117, 90],
  pt01: [207, 66],
  pt03: [273, 75],
  pt05: [348, 81],
  replay: [429, 78],
  pt08: [507, 81],
  pt11: [588, 75],
  debrief: [663, 176],
  fin: [839, 61],
} as const;

export const BoussardShort: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Sequence from={T.accroche[0]} durationInFrames={T.accroche[1]}>
      <Accroche />
    </Sequence>
    <Sequence from={T.faceAFace[0]} durationInFrames={T.faceAFace[1]}>
      <FaceAFace />
    </Sequence>
    <Sequence from={T.pt01[0]} durationInFrames={T.pt01[1]}>
      <Rallye n="pt01" dur={66} avant={0} apres={1} label="C'est parti !" />
    </Sequence>
    <Sequence from={T.pt03[0]} durationInFrames={T.pt03[1]}>
      <Rallye n="pt03" dur={75} avant={2} apres={3} label="Passing du désespoir" />
    </Sequence>
    <Sequence from={T.pt05[0]} durationInFrames={T.pt05[1]}>
      <Rallye n="pt05" dur={81} avant={4} apres={5} label="Il bouche l'angle" />
    </Sequence>
    <Sequence from={T.replay[0]} durationInFrames={T.replay[1]}>
      <Rallye n="pt05" dur={78} avant={5} apres={5} label="Tout donné 😅" trimBefore={42} rate={0.5} replay />
    </Sequence>
    <Sequence from={T.pt08[0]} durationInFrames={T.pt08[1]}>
      <Rallye n="pt08" dur={81} avant={7} apres={8} label="Remise sur la ligne !" />
    </Sequence>
    <Sequence from={T.pt11[0]} durationInFrames={T.pt11[1]}>
      <Rallye n="pt11" dur={75} avant={10} apres={11} label="Balle de match" />
    </Sequence>
    <Sequence from={T.pt11[0] + 58} durationInFrames={T.pt11[1] - 58}>
      <ScoreFinal />
    </Sequence>
    <Sequence from={T.debrief[0]} durationInFrames={T.debrief[1]}>
      <Debrief />
    </Sequence>
    <Sequence from={T.fin[0]} durationInFrames={T.fin[1]}>
      <Fin />
    </Sequence>
    {withAudio ? (
      <Audio
        src={staticFile("boussard/musique-sports-highlights-mixkit.mp3")}
        trimBefore={46 * 30}
        volume={(fr) =>
          interpolate(
            fr,
            [0, 6, 112, 122, 655, 668, 835, 845, 880, 900],
            [0.18, 0.18, 0.18, 0.75, 0.75, 0.16, 0.16, 0.75, 0.75, 0],
            clamp,
          )
        }
      />
    ) : null}
  </AbsoluteFill>
);
