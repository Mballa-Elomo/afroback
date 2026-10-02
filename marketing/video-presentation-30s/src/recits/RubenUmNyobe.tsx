/**
 * AFROBACK · Vidéo 4 · « Le nom interdit » : Ruben Um Nyobè (30 s, 9:16).
 * Script : recits/ruben-um-nyobe/script.md · voix : recits/ruben-um-nyobe/timing.json
 * Fil : son nom, caviardé, révélé, porté de document en document, noyé dans le béton, regravé en or.
 * Aucune silhouette humaine : seul le portrait AFROBACK (heros/ruben-um-nyobe.jpg).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, H, W, cinzel, manrope, ramp, s, popScale, goldGradient } from "../theme";
import { Grain, Karaoke, Particles, PunchWord, Shake, LetterDrop } from "../fx";
import { Illu, Caption, Vig, Fog, w } from "../recit-kit";
import { Phone } from "../phone";
import { Concrete, Desk, FormDoc, Forest, InkStamp, Ledger, Mention, Microphone, Paper, RedactBar, Rings, RU, typeFont, UnionSheets, UpcCard } from "./ruben-props";

const PORTRAIT = "heros/ruben-um-nyobe.jpg";
const CAPTURE = "img/capture-app-ruben-um-nyobe.png";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FOREST_T0 = 12.9; // entrée dans la forêt (s)
const MENTION = "Documents : évocations graphiques AFROBACK";

const goldText: React.CSSProperties = {
  background: goldGradient,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/* ---------- Scènes 1 et 2 · Le nom caviardé, puis le visage (0 à 5,0 s) ---------- */

const NameBlock: React.FC<{ gold1: number; gold2: number }> = ({ gold1, gold2 }) => {
  const line = (text: string, top: number, g: number) => (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: 160, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 132, lineHeight: "160px", letterSpacing: 4 }}>
      <span style={{ position: "absolute", left: 0, right: 0, color: RU.ink, opacity: 1 - g }}>{text}</span>
      <span style={{ position: "absolute", left: 0, right: 0, ...goldText, opacity: g, filter: `drop-shadow(0 3px 0 rgba(70,40,10,0.95)) drop-shadow(0 0 2px rgba(50,28,8,0.9)) drop-shadow(0 0 ${22 * g}px rgba(240,170,60,0.6))` }}>{text}</span>
    </div>
  );
  return (
    <>
      {line("RUBEN UM", 400, gold1)}
      {line("NYOBÈ", 560, gold2)}
    </>
  );
};

const PeelBar: React.FC<{ left: number; top: number; w: number; at: number; seed: string }> = ({ left, top, w: bw, at, seed }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, at, 10, 0, 1, Easing.in(Easing.quad));
  if (p >= 1) return null;
  return (
    <div style={{ position: "absolute", left, top, width: bw, height: 140, transformOrigin: "0% 50%", transform: `translate(${p * 1300}px, ${-p * 420}px) rotate(${-p * 32}deg)`, opacity: 1 - ramp(frame, at + 6, 4, 0, 1), filter: `drop-shadow(0 ${10 + p * 40}px ${10 + p * 30}px rgba(0,0,0,0.6))` }}>
      <RedactBar w={bw} h={140} seed={seed} />
    </div>
  );
};

const S12: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 90], [1, 1.06], clamp);
  const dive = ramp(f, 86, 16, 1, 16, Easing.in(Easing.exp));
  const toPortrait = ramp(f, 94, 8, 0, 1);
  const gold1 = ramp(f, 54, 10, 0, 1);
  const gold2 = ramp(f, 63, 10, 0, 1);
  const stampP = f >= 9 ? popScale(f, 9, 5, 1.0) : 0;
  const stampScale = f < 9 ? 0 : ramp(f, 9, 4, 1.55, 1, Easing.in(Easing.quad));
  const stampFade = 1 - 0.7 * ramp(f, 66, 12, 0, 1);
  const glow = ramp(f, 88, 8, 0, 1) * (1 - toPortrait);
  // portrait
  const u = ramp(f, 94, 56, 0, 1, Easing.out(Easing.cubic));
  const zoom = interpolate(u, [0, 1], [2.1, 1.0]);
  const cx = interpolate(u, [0, 1], [0.42, 0.5]);
  const cy = interpolate(u, [0, 1], [0.45, 0.5]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {f >= 88 ? (
        <AbsoluteFill>
          <Illu src={PORTRAIT} cx={cx} cy={cy} zoom={zoom}>
            <Rings frame={f} opacity={0.55} />
          </Illu>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0) 25%,rgba(0,0,0,0) 52%,rgba(0,0,0,0.85) 78%,rgba(0,0,0,0.9) 100%)" }} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1150 }}>
            <PunchWord text="MPODOL" at={128} size={170} shine={[132, 148]} />
          </AbsoluteFill>
          <Caption text="« celui qui porte la parole des siens »" at={135} y={1345} size={48} color={C.ivory} italic />
        </AbsoluteFill>
      ) : null}
      {toPortrait < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - toPortrait }}>
          <Shake hits={[{ at: 9, amp: 16, dur: 5 }]}>
            <AbsoluteFill style={{ transform: `scale(${push * dive})`, transformOrigin: "556px 940px" }}>
              <Desk id="d1" />
              <Paper id="p1" w={940} h={1300} style={{ left: 70, top: 280 }}>
                {/* en-tête et lignes tapées, illisibles */}
                <svg width={940} height={1300} style={{ position: "absolute", inset: 0 }}>
                  <rect x={300} y={110} width={340} height={14} rx={4} fill="rgba(40,30,22,0.4)" />
                  <rect x={360} y={140} width={220} height={10} rx={4} fill="rgba(40,30,22,0.3)" />
                  <line x1={110} x2={830} y1={200} y2={200} stroke="rgba(40,30,22,0.4)" strokeWidth={2} />
                  {Array.from({ length: 7 }).map((_, i) => (
                    <rect key={i} x={110} y={880 + i * 44} width={420 + random(`l1${i}`) * 300} height={12} rx={4} fill="rgba(40,30,22,0.28)" />
                  ))}
                </svg>
                <NameBlock gold1={gold1} gold2={gold2} />
                <PeelBar left={60} top={410} w={820} at={52} seed="b1" />
                <PeelBar left={205} top={570} w={530} at={61} seed="b2" />
                {f >= 9 ? (
                  <div style={{ position: "absolute", left: 150, top: 760, width: 640, height: 190, transform: `scale(${stampScale})`, opacity: stampP > 0 ? stampFade : 0, mixBlendMode: "multiply" }}>
                    <InkStamp id="st1" w={640} h={190} lines={[{ text: "INTERDIT", size: 100 }]} rot={-9} />
                  </div>
                ) : null}
              </Paper>
              <Particles at={53} x={480} y={760} count={30} seed="pe1" />
              <Particles at={62} x={560} y={920} count={30} seed="pe2" />
              <AbsoluteFill style={{ background: `radial-gradient(circle at 556px 940px, rgba(255,214,140,${0.8 * glow}) 0%, rgba(240,195,107,${0.4 * glow}) 30%, rgba(0,0,0,0) 60%)` }} />
            </AbsoluteFill>
          </Shake>
          {f >= 30 && f < 88 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", opacity: ramp(f, 30, 8, 0, 1) * (1 - ramp(f, 80, 8, 0, 1)) }}>
              <div style={{ background: "rgba(11,8,6,0.9)", padding: "14px 40px", borderRadius: 8, fontFamily: manrope, fontWeight: 800, fontSize: 50, color: C.ivory, letterSpacing: 1 }}>
                Au Cameroun · <span style={{ color: C.gold }}>plus de 30 ans</span>
              </div>
            </div>
          ) : null}
          <Vig strength={0.55} />
        </AbsoluteFill>
      ) : null}
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 3 · Trois documents, trois vies (5,0 à 8,35 s) ---------- */

const Station: React.FC<{ x: number; children: React.ReactNode }> = ({ x, children }) => <div style={{ position: "absolute", left: x, top: 0, width: W, height: H }}>{children}</div>;

const S3: React.FC = () => {
  const f = useCurrentFrame();
  // arrêts : 0 (greffe), 1 (syndicat), 2 (UPC) ; panoramiques fouettés
  const pan = ramp(f, 18, 6, 0, 1, Easing.inOut(Easing.cubic)) + ramp(f, 51, 6, 0, 1, Easing.inOut(Easing.cubic));
  const vel = Math.abs(ramp(f, 18, 6, 0, 1, Easing.inOut(Easing.cubic)) - ramp(f - 1, 18, 6, 0, 1, Easing.inOut(Easing.cubic))) + Math.abs(ramp(f, 51, 6, 0, 1, Easing.inOut(Easing.cubic)) - ramp(f - 1, 51, 6, 0, 1, Easing.inOut(Easing.cubic)));
  const out = ramp(f, 90, 10, 0, 1, Easing.in(Easing.cubic));
  const shine = ramp(f, 62, 24, -20, 130, Easing.linear);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: vel > 0.004 ? `blur(${Math.min(14, vel * 40)}px)` : undefined }}>
        <div style={{ position: "absolute", left: -pan * W, top: 0 }}>
          <Desk id="d3" width={W * 3} lamp={[18, 20]} />
        </div>
        <Station x={0 - pan * W}>
          <div style={{ position: "absolute", left: 90, top: 470 }}>
            <Ledger write={ramp(f, 0, 30, 0.1, 0.9, Easing.linear)} />
          </div>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1230 }}>
            <PunchWord text="GREFFIER" at={2} size={124} color={C.ivory} />
          </AbsoluteFill>
          <Caption text="aux tribunaux coloniaux" at={6} y={1375} size={48} color={C.gold} />
        </Station>
        <Station x={W - pan * W}>
          <div style={{ position: "absolute", left: 180, top: 300, transform: "scale(0.98)" }}>
            <UnionSheets />
          </div>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1230 }}>
            <PunchWord text="SYNDICALISTE" at={22} size={100} color={C.ivory} />
          </AbsoluteFill>
          <Caption text="secrétaire général de l'USCC · 1947" at={25} y={1365} size={44} color={C.gold} />
        </Station>
        <Station x={W * 2 - pan * W}>
          <div style={{ position: "absolute", left: 140, top: 430 - out * 1400 }}>
            <UpcCard shine={shine} />
          </div>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1110, opacity: 1 - out }}>
            <PunchWord text="SECRÉTAIRE GÉNÉRAL" at={56} size={74} />
          </AbsoluteFill>
          <Caption text="de l'UPC · novembre 1948" at={60} y={1215} size={52} color={C.ivory} />
        </Station>
      </AbsoluteFill>
      {/* stries de lumière qui amorcent le micro */}
      <AbsoluteFill style={{ opacity: out, background: "repeating-linear-gradient(100deg, rgba(240,195,107,0) 0px, rgba(240,195,107,0) 60px, rgba(240,195,107,0.22) 70px, rgba(240,195,107,0) 82px)" }} />
      <Mention text={MENTION} y={1480} />
      <Vig strength={0.45} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 4 · New York, l'ONU (8,35 à 11,55 s) ---------- */

const WAVES = [8.35, 8.55, 9.42, 9.62, 9.95, 10.4, 10.65];
const QUOTE: { t: string; hl?: boolean }[][] = [
  [{ t: "« Nous demandons" }],
  [{ t: "l'unification immédiate" }],
  [{ t: "de notre pays et la" }],
  [{ t: "fixation d'" }, { t: "un délai pour", hl: true }],
  [{ t: "l'indépendance", hl: true }, { t: " »" }],
];
const QUOTE_LEN = QUOTE.reduce((a, l) => a + l.reduce((b, p) => b + p.t.length, 0), 0);

const Typed: React.FC<{ shown: number; hl: number }> = ({ shown, hl }) => {
  let k = 0;
  return (
    <div style={{ fontFamily: typeFont, fontSize: 64, lineHeight: "92px", color: "#17120d" }}>
      {QUOTE.map((line, li) => (
        <div key={li} style={{ whiteSpace: "pre" }}>
          {line.map((part, pi) => (
            <span key={pi} style={part.hl ? { backgroundImage: `linear-gradient(${RU.terra}, ${RU.terra})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 92%", backgroundSize: `${hl * 100}% 7px`, color: hl > 0 ? "#7a2414" : undefined } : undefined}>
              {part.t.split("").map((ch) => {
                const i = k++;
                if (i >= shown) return null;
                return (
                  <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: 0.78 + random(`q${i}`) * 0.22, transform: `translateY(${(random(`qy${i}`) - 0.5) * 3}px) rotate(${(random(`qr${i}`) - 0.5) * 2.4}deg)` }}>
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const S4: React.FC = () => {
  const f = useCurrentFrame();
  const t = 8.35 + f / 30;
  const push = interpolate(f, [0, 30], [1, 1.07], clamp);
  const paperIn = ramp(f, 26, 9, 0, 1, Easing.out(Easing.cubic));
  const shown = Math.floor(ramp(f, 32, 34, 0, QUOTE_LEN, Easing.linear));
  const lineFeed = Math.min(4, Math.floor((shown / QUOTE_LEN) * 5));
  const hl = ramp(f, 72, 12, 0, 1, Easing.out(Easing.quad));
  const out = ramp(f, 90, 6, 0, 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070a", overflow: "hidden" }}>
      {/* 4A · le micro */}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "540px 900px" }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #1a2230 0%, #0b0f16 55%, #040507 100%)" }} />
        {Array.from({ length: 26 }).map((_, i) => {
          const sz = 40 + random(`bk${i}`) * 110;
          return <div key={i} style={{ position: "absolute", left: random(`bx${i}`) * W - sz / 2, top: 160 + random(`by${i}`) * 650, width: sz, height: sz, borderRadius: sz, background: i % 3 ? "rgba(255,205,130,0.22)" : "rgba(150,180,220,0.16)", filter: "blur(6px)" }} />;
        })}
        <div style={{ position: "absolute", left: -200, top: -200, width: 900, height: 1500, background: "linear-gradient(160deg, rgba(255,214,140,0.28) 0%, rgba(255,214,140,0) 70%)", clipPath: "polygon(0 0, 35% 0, 100% 100%, 70% 100%)", filter: "blur(20px)" }} />
        {/* bord de la tribune */}
        <div style={{ position: "absolute", left: -40, right: -40, top: 1250, height: 700, background: "linear-gradient(180deg,#3b2414 0%,#1d110a 30%,#0c0705 100%)", boxShadow: "0 -6px 0 rgba(240,195,107,0.35)" }} />
        <div style={{ position: "absolute", left: 270, top: 300 }}>
          <Microphone />
        </div>
        {/* ondes sonores */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {WAVES.map((wt, i) => {
            const p = (t - wt) / 0.9;
            if (p < 0 || p > 1) return null;
            const r = 170 + p * 330;
            return (
              <g key={i} fill="none" stroke={C.goldPale} strokeWidth={6 - p * 4} opacity={(1 - p) * 0.9} style={{ filter: "drop-shadow(0 0 8px rgba(240,195,107,0.9))" }}>
                <path d={`M ${540 - r * 0.62} ${600 - r * 0.78} A ${r} ${r} 0 0 0 ${540 - r * 0.62} ${600 + r * 0.78}`} />
                <path d={`M ${540 + r * 0.62} ${600 - r * 0.78} A ${r} ${r} 0 0 1 ${540 + r * 0.62} ${600 + r * 0.78}`} />
              </g>
            );
          })}
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 1300 }}>
          <PunchWord text="ONU · NEW YORK" at={3} size={96} color={C.ivory} />
        </AbsoluteFill>
        <Caption text="17 décembre 1952" at={9} y={1420} size={54} color={C.gold} />
      </AbsoluteFill>
      {/* 4B · la citation tapée à la machine */}
      {paperIn > 0 ? (
        <AbsoluteFill style={{ transform: `translateY(${(1 - paperIn) * 1500}px)` }}>
          <Desk id="d4" lamp={[70, 30]} />
          <Paper id="p4" w={940} h={860} style={{ left: 70, top: 360 - lineFeed * 6 }}>
            <div style={{ position: "absolute", left: 50, top: 110 }}>
              <Typed shown={shown} hl={hl} />
            </div>
            <div style={{ position: "absolute", left: 70, right: 70, top: 600, height: 2, background: "rgba(60,40,20,0.35)" }} />
            <div style={{ position: "absolute", left: 70, right: 70, top: 624, fontFamily: manrope, fontWeight: 700, fontStyle: "italic", fontSize: 36, lineHeight: 1.3, color: "#4a3622", opacity: ramp(f, 62, 8, 0, 1) }}>
              Ruben Um Nyobè, devant la 4e Commission de l'ONU, 17 décembre 1952
            </div>
          </Paper>
          {/* chariot de la machine à écrire */}
          <div style={{ position: "absolute", left: -20, right: -20, top: 268, height: 120, borderRadius: 60, background: "linear-gradient(180deg,#000 0%,#3a3a3a 35%,#111 60%,#000 100%)", boxShadow: "0 18px 30px rgba(0,0,0,0.7)" }} />
          <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 10, background: "rgba(255,255,255,0.18)", borderRadius: 5 }} />
          {[20, 1000].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 262, width: 60, height: 132, borderRadius: 14, background: "linear-gradient(90deg,#555,#eee 40%,#777 70%,#333)" }} />
          ))}
          <div style={{ position: "absolute", left: 60, right: 60, top: 420, height: 12, borderRadius: 6, background: "linear-gradient(180deg,#eee,#777 60%,#333)", boxShadow: "0 4px 6px rgba(0,0,0,0.4)" }} />
          {[280, 760].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 410, width: 40, height: 32, borderRadius: 10, background: "#151515" }} />
          ))}
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: "#000", opacity: out * 0.25 }} />
      <Mention text={MENTION} y={1500} opacity={paperIn} />
      <Vig strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 5 · Dissous. La forêt (11,55 à 14,7 s) ---------- */

const tearPts = (() => {
  const pts: [number, number][] = [];
  for (let y = -40; y <= H + 40; y += 40) pts.push([540 + (random(`tr${y}`) - 0.5) * 70, y]);
  return pts;
})();
const leftClip = `polygon(-50px -50px, ${tearPts.map(([x, y]) => `${x}px ${y}px`).join(", ")}, -50px ${H + 50}px)`;
const rightClip = `polygon(${W + 50}px -50px, ${tearPts.map(([x, y]) => `${x}px ${y}px`).join(", ")}, ${W + 50}px ${H + 50}px)`;
const tearLine = `M ${tearPts.map(([x, y]) => `${x} ${y}`).join(" L ")}`;

const StampTool: React.FC<{ y: number }> = ({ y }) => (
  <svg width={600} height={700} viewBox="-300 -620 600 700" style={{ position: "absolute", left: 240, top: y - 620, overflow: "visible" }}>
    <defs>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#2a160a" />
        <stop offset="0.35" stopColor="#9a6436" />
        <stop offset="0.6" stopColor="#5c351a" />
        <stop offset="1" stopColor="#1e0f06" />
      </linearGradient>
    </defs>
    <ellipse cx={0} cy={-560} rx={95} ry={70} fill="url(#wood)" />
    <ellipse cx={-30} cy={-585} rx={30} ry={16} fill="rgba(255,225,180,0.35)" />
    <path d="M -40 -500 Q -60 -380 -50 -250 L 50 -250 Q 60 -380 40 -500 Z" fill="url(#wood)" />
    <rect x={-280} y={-250} width={560} height={180} rx={14} fill="url(#wood)" />
    <rect x={-280} y={-250} width={560} height={14} rx={6} fill="rgba(255,225,180,0.25)" />
    <rect x={-270} y={-70} width={540} height={60} rx={6} fill="#5a1c12" />
    <rect x={-270} y={-20} width={540} height={10} fill={RU.terra} />
  </svg>
);

const S5: React.FC = () => {
  const f = useCurrentFrame();
  const t = 11.55 + f / 30;
  const HIT = 19;
  const down = ramp(f, 2, HIT - 2, 0, 1, Easing.in(Easing.cubic));
  const up = ramp(f, HIT + 2, 7, 0, 1, Easing.in(Easing.quad));
  const toolY = f < HIT + 2 ? interpolate(down, [0, 1], [-200, 1060]) : interpolate(up, [0, 1], [1060, -900]);
  const tear = ramp(f, 40, 18, 0, 1, Easing.in(Easing.cubic));
  const sheet = (
    <>
      <Desk id="d5" lamp={[25, 20]} />
      <div style={{ position: "absolute", left: 140, top: 430 }}>
        <UpcCard shine={-40} dim={0.65 * ramp(f, HIT, 6, 0, 1)} />
        {f >= HIT ? (
          <div style={{ position: "absolute", left: 30, top: 70, width: 740, height: 420, mixBlendMode: "multiply", transform: `scale(${ramp(f, HIT, 3, 1.08, 1)})` }}>
            <InkStamp id="st5" w={740} h={420} lines={[{ text: "DISSOUTE", size: 104 }, { text: "13 JUILLET 1955", size: 50 }]} rot={-7} />
          </div>
        ) : null}
      </div>
      <Caption text="Les autres dirigeants partent en exil." at={26} y={1180} size={48} color={C.ivory} />
    </>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {f >= 36 ? <Forest t={t - FOREST_T0} /> : null}
      {f >= 36 ? <Fog y={1300} opacity={0.35} /> : null}
      <Shake hits={[{ at: HIT, amp: 22, dur: 6 }]}>
        {tear <= 0 ? (
          <AbsoluteFill>{sheet}</AbsoluteFill>
        ) : (
          <>
            <AbsoluteFill style={{ clipPath: leftClip, transform: `translateX(${-tear * 760}px) rotate(${-tear * 7}deg)`, transformOrigin: "0% 100%" }}>
              {sheet}
              <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
                <path d={tearLine} fill="none" stroke="#EFE4CC" strokeWidth={10} opacity={0.85} />
              </svg>
            </AbsoluteFill>
            <AbsoluteFill style={{ clipPath: rightClip, transform: `translateX(${tear * 760}px) rotate(${tear * 7}deg)`, transformOrigin: "100% 100%" }}>
              {sheet}
              <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
                <path d={tearLine} fill="none" stroke="#EFE4CC" strokeWidth={10} opacity={0.85} />
              </svg>
            </AbsoluteFill>
          </>
        )}
        {f < HIT + 16 ? (
          <>
            <div style={{ position: "absolute", left: 200, top: 690, width: 680, height: 160, borderRadius: "50%", background: "rgba(0,0,0,0.6)", filter: "blur(30px)", opacity: f < HIT ? down * 0.8 : 1 - up }} />
            <StampTool y={toolY} />
          </>
        ) : null}
      </Shake>
      {f >= 52 ? (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,0.55) 62%,rgba(0,0,0,0.55) 74%,rgba(0,0,0,0) 85%)" }} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1180 }}>
            <PunchWord text="LUI :" at={56} size={100} color={C.ivory} />
            <div style={{ height: 6 }} />
            <PunchWord text="LA FORÊT." at={60} size={124} shine={[64, 80]} />
          </AbsoluteFill>
        </>
      ) : null}
      <Mention text={MENTION} y={1480} opacity={1 - ramp(f, 40, 8, 0, 1)} />
      <Vig strength={0.55} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 6 · Trois ans de maquis (14,7 à 16,9 s) ---------- */

const DOCS = [
  { title: ["ACTE DE", "NAISSANCE"], x: 375, rot: 1, at: 33, z: 3 },
  { title: ["ACTE DE", "MARIAGE"], x: 50, rot: -13, at: 36, z: 1 },
  { title: ["CARTE", "D'IDENTITÉ"], x: 700, rot: 12, at: 39, z: 2 },
];

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const t = 14.7 + f / 30;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Forest t={t - FOREST_T0} />
      <Fog y={1300} opacity={0.35} />
      {/* feuilles qui tombent */}
      {Array.from({ length: 6 }).map((_, i) => {
        const y = -100 + ((f * (4 + i) + i * 300) % 2100);
        const x = 100 + i * 170 + Math.sin(f * 0.08 + i) * 60;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 46, height: 20, borderRadius: "50% 0", background: "linear-gradient(135deg,#6a7a2a,#2c3a12)", transform: `rotate(${f * (6 + i) + i * 40}deg)`, opacity: 0.85 }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 700px 500px at 540px 620px, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 400 }}>
        <PunchWord text="3 ANS" at={2} size={220} shine={[6, 24]} />
      </AbsoluteFill>
      <Caption text="dans la clandestinité" at={8} y={650} size={56} color={C.ivory} />
      {[...DOCS].sort((a, b) => a.z - b.z).map((d, i) => {
        const p = ramp(f, d.at, 12, 0, 1, Easing.out(Easing.back(1.2)));
        if (p <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: d.x, top: 820 + (1 - p) * 900, transform: `rotate(${d.rot * p}deg)`, filter: "drop-shadow(0 26px 30px rgba(0,0,0,0.6))" }}>
            <FormDoc id={`fd6-${i}`} title={d.title} />
          </div>
        );
      })}
      <Caption text="Il y crée une administration parallèle." at={40} y={1300} size={46} color={C.gold} />
      <Mention text={MENTION} y={1480} opacity={ramp(f, 34, 8, 0, 1)} />
      <Vig strength={0.55} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 7 · 13 septembre 1958 (16,9 à 19,4 s) ---------- */

const ColdForest: React.FC<{ t: number; cold: number }> = ({ t, cold }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: `saturate(${1 - 0.8 * cold}) brightness(${1 - 0.25 * cold})` }}>
      <Forest t={t - FOREST_T0} light={1 - cold} still={cold > 0.5} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: `rgba(60,80,105,${0.32 * cold})`, mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ background: `rgba(120,140,160,${0.12 * cold})` }} />
    <Fog y={1250} opacity={0.35 + 0.35 * cold} />
  </AbsoluteFill>
);

const SlowLetters: React.FC<{ text: string; at: number; size: number; color?: string; stagger?: number }> = ({ text, at, size, color = C.ivory, stagger = 1.6 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "center", fontFamily: cinzel, fontWeight: 900, fontSize: size, lineHeight: 1.05, color }}>
      {text.split("").map((ch, i) => {
        const st = at + i * stagger;
        const p = ramp(f, st, 10, 0, 1, Easing.out(Easing.cubic));
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: p, transform: `translateY(${(1 - p) * 24}px)`, filter: `blur(${(1 - p) * 6}px)`, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

const S7: React.FC = () => {
  const f = useCurrentFrame();
  const t = 16.9 + f / 30;
  const cold = ramp(f, 0, 9, 0, 1, Easing.out(Easing.quad));
  const fall = ramp(f, 4, 36, 0, 1, Easing.inOut(Easing.sin));
  const sides = ramp(f, 2, 14, 1, 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <ColdForest t={t} cold={cold} />
      {/* documents : deux se dissolvent dans la brume, l'acte de naissance tombe et se pose */}
      {DOCS.slice(1).map((d, i) => (
        <div key={i} style={{ position: "absolute", left: d.x, top: 820, transform: `rotate(${d.rot}deg)`, opacity: sides, filter: `saturate(${1 - cold * 0.8}) blur(${(1 - sides) * 8}px)` }}>
          <FormDoc id={`fd7-${i}`} title={d.title} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 375, top: 820 + fall * 250, transform: `perspective(1200px) rotateX(${fall * 62}deg) rotate(${1 + Math.sin(fall * Math.PI) * 14 - fall * 6}deg)`, transformOrigin: "50% 100%", filter: `saturate(${1 - cold * 0.7}) brightness(${1 - cold * 0.2}) drop-shadow(0 ${30 - fall * 22}px ${30 - fall * 18}px rgba(0,0,0,0.6))` }}>
        <FormDoc id="fd7-n" title={DOCS[0].title} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 760px 520px at 540px 560px, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
        <SlowLetters text="13 SEPTEMBRE" at={10} size={104} />
        <div style={{ height: 6 }} />
        <SlowLetters text="1958" at={26} size={170} color={C.ivory} stagger={3} />
      </AbsoluteFill>
      <Caption text="près de Boumnyébel · il a 45 ans" at={44} y={680} size={48} color="rgba(255,244,224,0.92)" />
      <Vig strength={0.65} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 8 · Sans nom, dans le béton (19,4 à 22,45 s) ---------- */

const concreteEdge = (() => {
  const pts: string[] = [];
  for (let x = -20; x <= W + 20; x += 36) pts.push(`${x}px ${random(`ce${x}`) * 26}px`);
  return `polygon(${pts.join(", ")}, ${W + 20}px ${H + 400}px, -20px ${H + 400}px)`;
})();

const SinkName: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 112, lineHeight: "130px", letterSpacing: 4 }}>
      {["RUBEN UM", "NYOBÈ"].map((line, li) => (
        <div key={li}>
          {line.split("").map((ch, i) => {
            const st = at + 8 + (li * 8 + i) * 1.4;
            const appear = ramp(f, at, 8, 0, 1);
            const g = ramp(f, st, 14, 0, 1, Easing.in(Easing.quad));
            const color = interpolateColors(g, [0, 1], [C.gold, "#6b665f"]);
            return (
              <span key={i} style={{ display: "inline-block", whiteSpace: "pre", color, opacity: appear * (1 - ramp(f, st + 8, 10, 0, 1)), transform: `translateY(${g * 14}px) scale(${1 - g * 0.06})`, filter: `blur(${g * 3}px)`, textShadow: g < 0.5 ? "0 0 22px rgba(240,195,107,0.7)" : "1px 1px 0 rgba(255,255,255,0.15)" }}>
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const engraved: React.CSSProperties = { fontFamily: cinzel, fontWeight: 900, color: "#25221e", textShadow: "-2px -2px 1px rgba(0,0,0,0.45), 2px 2px 1px rgba(255,255,255,0.3)", textAlign: "center", letterSpacing: 4 };

const S8: React.FC = () => {
  const f = useCurrentFrame();
  const t = 19.4 + f / 30;
  const rise = ramp(f, 0, 22, 0, 1, Easing.out(Easing.cubic));
  const barIn = ramp(f, 76, 7, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {rise < 1 ? <ColdForest t={t} cold={1} /> : null}
      <AbsoluteFill style={{ transform: `translateY(${(1 - rise) * (H + 60)}px)`, clipPath: concreteEdge }}>
        <Shake hits={[{ at: 78, amp: 8, dur: 4 }]}>
          <Concrete id="c8" />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 800px 700px at 540px 900px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)" }} />
          <SinkName at={14} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 420, opacity: ramp(f, 54, 8, 0, 1), ...engraved, fontSize: 96 }}>SANS NOM.</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 540, opacity: ramp(f, 60, 8, 0, 1), ...engraved, fontSize: 84 }}>SANS ÉPITAPHE.</div>
          {barIn > 0 ? (
            <div style={{ position: "absolute", left: 130 - (1 - barIn) * 1100, top: 880, width: 820, height: 150, filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.6))" }}>
              <RedactBar w={820} h={150} seed="b8" />
            </div>
          ) : null}
        </Shake>
      </AbsoluteFill>
      <Caption text="enterré anonymement, le 15 septembre 1958" at={58} y={1250} size={42} color={C.ivory} />
      <Vig strength={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 9 · Le béton se fissure d'or (22,45 à 26,2 s) ---------- */

type Seg = { x1: number; y1: number; x2: number; y2: number; d0: number; d1: number; wdt: number };
const CRACKS: Seg[] = (() => {
  const segs: Seg[] = [];
  const grow = (x: number, y: number, ang: number, d: number, depth: number, id: string) => {
    if (depth > 6 || d > 1300) return;
    const len = 70 + random(id + "l") * 110;
    const a = ang + (random(id + "a") - 0.5) * 0.9;
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    segs.push({ x1: x, y1: y, x2, y2, d0: d, d1: d + len, wdt: Math.max(1.5, 7 - depth) });
    grow(x2, y2, a, d + len, depth + 1, id + "c");
    if (random(id + "b") < 0.45) grow(x2, y2, a + (random(id + "s") < 0.5 ? -0.8 : 0.8), d + len, depth + 1, id + "d");
  };
  for (let k = 0; k < 7; k++) grow(540, 955, (k / 7) * Math.PI * 2 + 0.3, 0, 0, `k${k}`);
  return segs;
})();

const S9: React.FC = () => {
  const f = useCurrentFrame();
  const g = ramp(f, 4, 18, 0, 1300, Easing.in(Easing.quad));
  const R = ramp(f, 10, 24, 0, 1500, Easing.in(Easing.quad));
  const flash = ramp(f, 9, 5, 0, 1) * (1 - ramp(f, 16, 18, 0, 1));
  const barGone = ramp(f, 8, 8, 0, 1);
  const zoom = interpolate(f, [0, 112], [1.0, 1.12], clamp);
  const cy = interpolate(f, [0, 112], [0.5, 0.47], clamp);
  const phase2 = f >= 62;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* sous le béton : le portrait, les anneaux, le nom en or */}
      <Illu src={PORTRAIT} cx={0.5} cy={cy} zoom={zoom} dim={0.25}>
        <Rings frame={f + 150} opacity={0.6} />
      </Illu>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.25) 26%,rgba(0,0,0,0) 40%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.85) 70%,rgba(0,0,0,0.92) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, opacity: Math.min(1, Math.max(0, (R - 450) / 250)), textAlign: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 116, lineHeight: "132px", letterSpacing: 4 }}>
        {["RUBEN UM", "NYOBÈ"].map((l) => (
          <div key={l} style={{ ...goldText, backgroundImage: `linear-gradient(100deg, #C98A3D 0%, #F0C36B ${ramp(f, 20, 30, -20, 120) - 15}%, #FFF4D2 ${ramp(f, 20, 30, -20, 120)}%, #F0C36B ${ramp(f, 20, 30, -20, 120) + 15}%, #C98A3D 100%)`, WebkitBackgroundClip: "text", filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.9)) drop-shadow(0 0 18px rgba(240,195,107,0.45))" }}>
            {l}
          </div>
        ))}
      </div>
      {!phase2 ? (
        <AbsoluteFill style={{ opacity: 1 - ramp(f, 56, 6, 0, 1) }}>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1130 }}>
            <PunchWord text="1991" at={32} size={150} />
            <div style={{ height: 6 }} />
            <PunchWord text="HÉROS NATIONAL" at={36} size={66} color={C.ivory} />
          </AbsoluteFill>
          <Caption text="la loi lève l'interdiction de son nom" at={40} y={1400} size={44} color={C.gold} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 1110 }}>
            <PunchWord text="2025" at={64} size={170} shine={[68, 86]} />
          </AbsoluteFill>
          <Caption text="la France reconnaît sa responsabilité" at={69} y={1300} size={50} color={C.ivory} />
          <Caption text="dans sa mort" at={73} y={1370} size={50} color={C.ivory} />
        </AbsoluteFill>
      )}
      {/* le béton, ses fissures d'or, ses éclats */}
      {R < 1500 ? (
        <AbsoluteFill style={{ WebkitMaskImage: `radial-gradient(circle at 540px 955px, transparent ${R}px, black ${R + 140}px)`, maskImage: `radial-gradient(circle at 540px 955px, transparent ${R}px, black ${R + 140}px)` }}>
          <Concrete id="c9" />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 800px 700px at 540px 900px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 420, ...engraved, fontSize: 96 }}>SANS NOM.</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 540, ...engraved, fontSize: 84 }}>SANS ÉPITAPHE.</div>
          <div style={{ position: "absolute", left: 130, top: 880, width: 820, height: 150, opacity: 1 - barGone, transform: `scaleX(${1 - barGone * 0.3})`, filter: `blur(${barGone * 6}px)` }}>
            <RedactBar w={820} h={150} seed="b8" />
          </div>
        </AbsoluteFill>
      ) : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 1 - ramp(f, 34, 14, 0, 1) }}>
        {CRACKS.map((c, i) => {
          if (g <= c.d0) return null;
          const p = Math.min(1, (g - c.d0) / (c.d1 - c.d0));
          const x2 = c.x1 + (c.x2 - c.x1) * p;
          const y2 = c.y1 + (c.y2 - c.y1) * p;
          return (
            <g key={i}>
              <line x1={c.x1} y1={c.y1} x2={x2} y2={y2} stroke="rgba(240,170,60,0.55)" strokeWidth={c.wdt * 4} strokeLinecap="round" style={{ filter: "blur(6px)" }} />
              <line x1={c.x1} y1={c.y1} x2={x2} y2={y2} stroke="#FFE7AE" strokeWidth={c.wdt} strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
      {/* éclats de béton qui tombent */}
      {f >= 10 && f < 50
        ? Array.from({ length: 18 }).map((_, i) => {
            const a = random(`ch${i}`) * Math.PI * 2;
            const r0 = 120 + random(`cr${i}`) * 500;
            const t0 = 10 + random(`ct${i}`) * 12;
            if (f < t0) return null;
            const tt = f - t0;
            const x = 540 + Math.cos(a) * (r0 + tt * 6);
            const y = 955 + Math.sin(a) * r0 + tt * tt * 1.2;
            const sz = 40 + random(`cs${i}`) * 70;
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz * 0.8, background: "linear-gradient(135deg,#9a958c,#5d5852)", clipPath: "polygon(10% 0, 90% 15%, 100% 70%, 45% 100%, 0 60%)", transform: `rotate(${tt * (random(`cv${i}`) * 16 - 8)}deg)`, boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)" }} />;
          })
        : null}
      <Particles at={9} x={540} y={955} count={44} seed="bar9" />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 955px, rgba(255,214,140,${0.55 * flash}) 0%, rgba(240,195,107,${0.25 * flash}) 35%, rgba(0,0,0,0) 65%)` }} />
      <Vig strength={0.55} />
    </AbsoluteFill>
  );
};

/* ---------- Scène 10 · Souviens-toi de ce nom (26,2 à 30 s) ---------- */

const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 16, 0, 1, Easing.out(Easing.back(1.2)));
  const leave = ramp(frame, 42, 12, 0, 1, Easing.in(Easing.cubic));
  const pose = { x: 540, y: 1200 + (1 - rise) * 1100 + leave * 1300, scale: 1.5, rotate: (1 - rise) * 10 };
  const buttonY = 376;
  const by = pose.y + (buttonY - 422) * pose.scale;
  const pulse = frame >= 16 && frame < 46 ? ((frame - 16) % 15) / 15 : -1;
  const logoAt = 46;
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
          {pulse >= 0 ? <div style={{ position: "absolute", left: 540 - 270, top: by - 60, width: 540, height: 120, borderRadius: 60, border: `5px solid ${C.gold}`, opacity: 1 - pulse, transform: `scale(${1 + pulse * 0.3})` }} /> : null}
        </>
      ) : null}
      {frame < 44 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 270, opacity: 1 - ramp(frame, 40, 4, 0, 1) }}>
          <PunchWord text="SOUVIENS-TOI" at={2} size={104} color={C.ivory} />
          <div style={{ height: 12 }} />
          <PunchWord text="DE CE NOM" at={10} size={96} />
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
          <LetterDrop text="afroback.app" at={logoAt + 18} size={62} family={manrope} weight={800} color={C.ivory} colorFrom={{ index: 8, color: C.gold }} stagger={0.6} />
          <div style={{ height: 40 }} />
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 46, color: C.gold, opacity: ramp(frame, logoAt + 28, 8, 0, 1), textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>Écoute son histoire entière</div>
        </AbsoluteFill>
      ) : null}
      <Vig strength={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- Montage ---------- */

const SCENES = [
  { from: 0, dur: 5.0, C: S12 },
  { from: 5.0, dur: 3.35, C: S3 },
  { from: 8.35, dur: 3.2, C: S4 },
  { from: 11.55, dur: 3.15, C: S5 },
  { from: 14.7, dur: 2.2, C: S6 },
  { from: 16.9, dur: 2.5, C: S7 },
  { from: 19.4, dur: 3.05, C: S8 },
  { from: 22.45, dur: 3.75, C: S9 },
  { from: 26.2, dur: 3.8, C: S10 },
];

/** Sous-titres calés sur la voix (timing.json + pauses mesurées), seulement là où la phrase n'est pas écrite en gros. */
const SUBS = [
  { words: w([["il", 9.42], ["réclame", 9.55], ["une", 9.95], ["date", 10.12], ["pour", 10.4], ["l'indépendance.", 10.6]]), end: s(11.45) },
  { words: w([["Puis", 16.9], ["l'armée", 17.1], ["française", 17.45], ["le", 17.85], ["tue.", 17.98]]), end: s(18.6) },
  { words: w([["On", 19.4], ["l'enterre", 19.55], ["sans", 19.95], ["nom,", 20.2], ["dans", 20.72], ["le", 20.9], ["béton.", 21.0]]), end: s(21.6) },
  { words: w([["Mais", 22.45], ["son", 22.65], ["nom", 22.85], ["revient.", 23.0]]), end: s(23.55) },
];

export const RubenUmNyobe: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map(({ from, dur, C: Sc }) => (
      <Sequence key={from} from={s(from)} durationInFrames={s(from + dur) - s(from)}>
        <Sc />
      </Sequence>
    ))}
    {SUBS.map((sub, i) => (
      <Karaoke key={i} words={sub.words} end={sub.end} />
    ))}
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/mix-ruben-um-nyobe.wav")} /> : null}
  </AbsoluteFill>
);

