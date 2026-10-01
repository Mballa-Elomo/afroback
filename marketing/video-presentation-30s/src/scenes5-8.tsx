import React from "react";
import { AbsoluteFill, Img, interpolate, random, useCurrentFrame, Easing } from "remotion";
import { C, W, H, cinzel, manrope, ramp, expoIn, popScale, goldGradient } from "./theme";
import { Background, Flash, Grain, LetterDrop, MotifWipe, Particles, PunchWord, Shake, Shockwave, Tap, Vignette } from "./fx";
import {
  ContentCard,
  CraftTexture,
  DecouverteScreen,
  GoldButton,
  HeroScreen,
  Icon,
  MarketScreen,
  MythScreen,
  Phone,
  PhonePose,
  PlanCard,
  PreviewCard,
  SuccessScreen,
  SUCCESS_CHECK,
  toStage,
  WhatsAppScreen,
  img,
} from "./phone";
import { HEROES } from "./scenes1-4";

const BASE: PhonePose = { x: W / 2, y: 900, scale: 1.45 };
const back = Easing.out(Easing.back(1.6));

const TopWords: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 270 }) => (
  <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: top, gap: 10, pointerEvents: "none" }}>
    {children}
  </AbsoluteFill>
);

/* =================================================================
   SCÈNE 5 · Mythes et patrimoine (14,0 → 18,0 s)
   ================================================================= */
const Mist: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -300 + ((frame * (3 + i) + i * 400) % 1600) - 200,
            top: 500 + i * 420,
            width: 900,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(110,140,190,0.22) 0%, rgba(110,140,190,0) 70%)",
            filter: "blur(30px)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const GRID_IMGS = [
  ["img/palais-royal-foumban.jpg", "Palais royal"],
  ["img/nguon.jpg", "Le Nguon"],
  ["img/trone-mandu-yenu.jpg", "Trône Mandu Yenu"],
  ["img/ebolowa.jpg", "Ebolowa"],
  ["img/fon-chef-traditionnel-bamoun.jpg", "Le Fon"],
  ["img/mythe-sao-geants-kotoko.jpg", "Les Sao"],
];

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < 60) {
    // 5A · la carte du mythe jaillit · 5B · retournement + éventail
    const out = ramp(frame, 0, 9, 0, 1, back);
    const phoneOut = ramp(frame, 30, 7, 0, 1, expoIn);
    const pose: PhonePose = { x: 300 - phoneOut * 800, y: 1010, scale: 1.2, rotateY: 25 };
    const flip = ramp(frame, 30, 8, 0, 180, Easing.inOut(Easing.cubic));
    const cardX = interpolate(out, [0, 1], [300, 640]) + ramp(frame, 30, 8, 0, -100);
    const cardScale = interpolate(out, [0, 1], [0.3, 1]);
    const fans = [
      { src: "img/nguon.jpg", t: "Le Nguon", at: 34, rot: -16, dx: -260 },
      { src: "img/trone-mandu-yenu.jpg", t: "Trône Mandu Yenu", at: 38, rot: 14, dx: 260 },
      { src: "img/ebolowa.jpg", t: "Ebolowa", at: 41, rot: -4, dx: 0 },
    ];
    return (
      <AbsoluteFill>
        <Background tint="#1a2638" />
        <Mist />
        <Shake hits={[{ at: 0, amp: 10 }, { at: 30, amp: 10 }]}>
          <Phone pose={pose}>
            <MythScreen />
          </Phone>
          {fans.map((c) => {
            const p = ramp(frame, c.at, 6, 0, 1, back);
            if (frame < c.at) return null;
            return (
              <div
                key={c.t}
                style={{
                  position: "absolute",
                  left: 540 - 210 + c.dx * p,
                  top: 1060 - 280 - 60 * p,
                  transform: `rotate(${c.rot * p}deg) scale(${0.6 + 0.4 * p})`,
                  opacity: p * 0.9,
                }}
              >
                <ContentCard src={c.src} title={c.t} w={420} h={560} />
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: cardX - 290,
              top: 1060 - 390,
              width: 580,
              height: 780,
              transform: `perspective(2000px) scale(${cardScale}) rotateY(${-8 * out + flip}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
              <ContentCard src="img/mythe-ngan-medza-beti.jpg" title="Ngan Medza" sub="Le serpent qui porta un peuple sur son dos" w={580} h={780} tag="Mythe" />
            </div>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <ContentCard src="img/palais-royal-foumban.jpg" title="Palais royal de Foumban" w={580} h={780} tag="Patrimoine" />
            </div>
          </div>
          <TopWords>
            {frame < 30 ? <PunchWord text="MYTHES" at={0} size={130} color={C.ivory} /> : <PunchWord text="PATRIMOINE" at={30} size={110} />}
          </TopWords>
        </Shake>
        <Vignette />
        <Grain />
      </AbsoluteFill>
    );
  }

  if (frame < 90) {
    // 5C · Découverte, les filtres défilent et jaillissent
    const f = frame - 60;
    const shift = ramp(f, 2, 20, 0, 150, Easing.inOut(Easing.cubic));
    const active = f < 6 ? 0 : f < 13 ? 1 : f < 20 ? 2 : 3;
    const pose: PhonePose = { ...BASE, x: 560 - shift * 0.25 };
    const chips = [
      { l: "Village", at: 4, x: 230, y: 560 },
      { l: "Coutume", at: 11, x: 850, y: 760 },
      { l: "Objet", at: 18, x: 230, y: 960 },
    ];
    return (
      <AbsoluteFill>
        <Background />
        <Shake hits={[{ at: 60, amp: 6 }]}>
          <Phone pose={pose}>
            <DecouverteScreen filterShift={shift} activeFilter={active} />
          </Phone>
          {chips.map((c) => {
            if (f < c.at) return null;
            const p = ramp(f, c.at, 6, 0, 1, back);
            const from = toStage(pose, 200, 235);
            return (
              <div
                key={c.l}
                style={{
                  position: "absolute",
                  left: interpolate(p, [0, 1], [from.x, c.x]),
                  top: interpolate(p, [0, 1], [from.y, c.y]),
                  transform: `translate(-50%,-50%) scale(${interpolate(p, [0, 1], [0.5, 1])}) rotate(${(c.x < 540 ? -6 : 6) * p}deg)`,
                  padding: "22px 44px",
                  borderRadius: 999,
                  background: goldGradient,
                  fontFamily: manrope,
                  fontWeight: 800,
                  fontSize: 52,
                  color: "#1a1109",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(240,195,107,0.4)",
                }}
              >
                {c.l}
              </div>
            );
          })}
        </Shake>
        <Vignette />
        <Grain />
      </AbsoluteFill>
    );
  }

  // 5D · mosaïque patrimoine : 2 mélanges puis explosion
  const f = frame - 90;
  const perms = [
    [0, 1, 2, 3, 4, 5],
    [4, 0, 5, 1, 3, 2],
    [2, 5, 3, 4, 0, 1],
  ];
  const slotPos = (k: number) => ({ x: k % 2 === 0 ? 300 : 780, y: 470 + Math.floor(k / 2) * 500 });
  const m1 = ramp(f, 3, 6, 0, 1, Easing.inOut(Easing.cubic));
  const m2 = ramp(f, 13, 6, 0, 1, Easing.inOut(Easing.cubic));
  const boom = ramp(f, 22, 8, 0, 1, expoIn);
  return (
    <AbsoluteFill>
      <Background />
      <Shake hits={[{ at: 93, amp: 6 }, { at: 103, amp: 6 }, { at: 112, amp: 14, dur: 3 }]}>
        {GRID_IMGS.map(([src, t], i) => {
          const a = slotPos(perms[0].indexOf(i));
          const b = slotPos(perms[1].indexOf(i));
          const c = slotPos(perms[2].indexOf(i));
          let x = interpolate(m1, [0, 1], [a.x, b.x]);
          let y = interpolate(m1, [0, 1], [a.y, b.y]);
          x = interpolate(m2, [0, 1], [x, c.x]);
          y = interpolate(m2, [0, 1], [y, c.y]);
          const dx = x - W / 2;
          const dy = y - 960;
          x += dx * boom * 3;
          y += dy * boom * 3;
          const lift = Math.sin(m1 * Math.PI) + Math.sin(m2 * Math.PI);
          return (
            <div
              key={t}
              style={{
                position: "absolute",
                left: x - 220,
                top: y - 230,
                transform: `scale(${1 + lift * 0.08}) rotate(${(random(`r${i}`) - 0.5) * 60 * boom + lift * (i % 2 ? 4 : -4)}deg)`,
                zIndex: Math.round(lift * 10),
              }}
            >
              <ContentCard src={src} title={t} w={440} h={460} />
            </div>
          );
        })}
      </Shake>
      <Flash at={[112]} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* =================================================================
   SCÈNE 6 · Communauté : aime, commente, partage (18,0 → 22,0 s)
   ================================================================= */
const ActionBtn: React.FC<{ ic: string; l: string; on?: boolean; pop?: number }> = ({ ic, l, on, pop = 1 }) => (
  <div
    style={{
      flex: 1,
      height: 120,
      borderRadius: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      fontFamily: manrope,
      fontWeight: 800,
      fontSize: 38,
      color: on ? "#1a1109" : C.gold,
      background: on ? goldGradient : "rgba(240,195,107,0.07)",
      border: `2px solid ${on ? C.gold : "rgba(240,195,107,0.3)"}`,
      transform: `scale(${pop})`,
      boxShadow: on ? "0 0 50px rgba(240,195,107,0.6)" : undefined,
    }}
  >
    <Icon name={ic} size={46} color={on ? "#1a1109" : C.gold} fill={on && ic === "like"} /> {l}
  </div>
);

const PostCard: React.FC<{ liked: boolean; likePop: number; sharePop?: number }> = ({ liked, likePop, sharePop = 1 }) => (
  <div style={{ width: 940, borderRadius: 44, overflow: "hidden", background: C.surface, border: "2px solid rgba(240,195,107,0.25)", boxShadow: "0 40px 90px rgba(0,0,0,0.7)" }}>
    <div style={{ height: 560, position: "relative" }}>
      <Img src={img("heros/reine-nzinga.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(26,19,13,0.95))" }} />
      <div style={{ position: "absolute", left: 40, bottom: 24, fontFamily: cinzel, fontWeight: 900, fontSize: 64, color: "#F7E7C8" }}>Reine Nzinga</div>
    </div>
    <div style={{ display: "flex", gap: 18, padding: 28 }}>
      <ActionBtn ic="like" l="J'aime" on={liked} pop={likePop} />
      <ActionBtn ic="comment" l="Commenter" />
      <ActionBtn ic="share" l="Partager" pop={sharePop} />
    </div>
  </div>
);

const Bubble: React.FC<{ who: string; text: string; reply?: boolean; p: number }> = ({ who, text, reply, p }) => (
  <div
    style={{
      display: "flex",
      gap: 20,
      marginLeft: reply ? 130 : 0,
      opacity: p,
      transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})`,
      transformOrigin: "left center",
    }}
  >
    <div style={{ width: 120, height: 120, borderRadius: 60, background: reply ? "linear-gradient(135deg,#E3A277,#A0522D)" : goldGradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: cinzel, fontWeight: 900, fontSize: 54, color: "#1a1109", flexShrink: 0 }}>
      {who[0]}
    </div>
    <div style={{ background: "#2a1f16", borderRadius: 40, padding: "28px 40px", maxWidth: 760, border: "2px solid rgba(240,195,107,0.2)" }}>
      <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 40, color: C.gold }}>{who}</div>
      <div style={{ fontFamily: manrope, fontWeight: 600, fontSize: 52, color: C.ivory, marginTop: 6, lineHeight: 1.25 }}>{text}</div>
    </div>
  </div>
);

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < 60) {
    const liked = frame >= 3;
    const likePop = frame >= 3 ? popScale(frame, 3, 6, 1.18) : 1;
    const sharePop = frame >= 33 ? popScale(frame, 33, 6, 1.12) : 1;
    const likePos = { x: 70 + 28 + 140, y: 1400 };
    const lineUp = ramp(frame, 48, 6, 0, 1, back);
    return (
      <AbsoluteFill>
        <Background />
        <Shake hits={[{ at: 540 - 540 }, { at: 15 }, { at: 30 }]}>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 560 }}>
            {frame >= 15 && frame < 30 ? (
              <div style={{ width: 960, display: "flex", flexDirection: "column", gap: 50, paddingTop: 120 }}>
                <Bubble who="YannickSteve" text="très belle histoire" p={ramp(frame, 16, 4, 0, 1, back)} />
                {frame >= 20 ? <Bubble who="Afroback" text="J'aime cette histoire" reply p={ramp(frame, 20, 4, 0, 1, back)} /> : null}
              </div>
            ) : (
              <PostCard liked={liked} likePop={likePop} sharePop={sharePop} />
            )}
          </AbsoluteFill>
          {frame < 15 ? <Tap at={3} x={likePos.x} y={likePos.y} /> : null}
          {frame >= 30 ? <Tap at={33} x={W - 238} y={1400} /> : null}
          {/* gerbe de pouces dorés */}
          {frame >= 3 && frame < 15
            ? Array.from({ length: 10 }).map((_, i) => {
                const a = -Math.PI / 2 + (random(`th${i}`) - 0.5) * 2.2;
                const t = frame - 3;
                const d = t * (28 + random(`tv${i}`) * 20);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: likePos.x + Math.cos(a) * d - 30,
                      top: likePos.y + Math.sin(a) * d + t * t * 1.5 - 30,
                      opacity: ramp(frame, 9, 6, 1, 0),
                      transform: `rotate(${(random(`tr${i}`) - 0.5) * 60}deg) scale(${0.8 + random(`ts${i}`) * 0.8})`,
                    }}
                  >
                    <Icon name="like" size={60} color={C.gold} fill />
                  </div>
                );
              })
            : null}
          <TopWords top={300}>
            {frame < 15 ? <PunchWord text="AIME." at={0} size={150} /> : null}
            {frame >= 15 && frame < 30 ? <PunchWord text="COMMENTE." at={15} size={120} /> : null}
            {frame >= 30 ? <PunchWord text="PARTAGE." at={30} size={130} /> : null}
          </TopWords>
          {frame >= 48 ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 1470,
                textAlign: "center",
                fontFamily: cinzel,
                fontWeight: 900,
                fontSize: 50,
                color: C.gold,
                opacity: lineUp,
                transform: `translateY(${(1 - lineUp) * 80}px)`,
                textShadow: "0 4px 18px #000",
              }}
            >
              AIME · COMMENTE · PARTAGE
            </div>
          ) : null}
        </Shake>
        <Vignette />
        <Grain />
      </AbsoluteFill>
    );
  }

  // 6D · le partage arrive sur WhatsApp
  const f = frame - 60;
  const orbit = ramp(f, 0, 45, 12, -10, Easing.inOut(Easing.sin));
  const p2 = ramp(f, 0, 10, 0, 1, back);
  const phone1: PhonePose = { x: 330 - (1 - p2) * 0, y: 960, scale: 1.1, rotateY: 18 + orbit };
  const phone2: PhonePose = { x: interpolate(p2, [0, 1], [1500, 720]), y: 1000, scale: 1.2, rotate: interpolate(p2, [0, 1], [15, 0]), rotateY: -12 + orbit };
  const prev = ramp(f, 30, 9, 0, 1, back);
  const from = toStage(phone2, 245, 400);
  const slide = ramp(f, 52, 8, 0, 1, expoIn);
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ transform: `translateY(${-slide * H}px)`, filter: `blur(${slide * 24}px)` }}>
        <Shake hits={[{ at: 75, amp: 6 }, { at: 90, amp: 10 }]}>
          <Phone pose={phone1}>
            <HeroScreen />
          </Phone>
          <Phone pose={phone2}>
            <WhatsAppScreen showMsg={f >= 15} hidePreview={f >= 30} />
          </Phone>
          {f >= 30 ? (
            <div
              style={{
                position: "absolute",
                left: interpolate(prev, [0, 1], [from.x, 540]),
                top: interpolate(prev, [0, 1], [from.y, 1000]),
                transform: `translate(-50%,-50%) scale(${interpolate(prev, [0, 1], [0.45, 1.25])}) rotate(${-4 * prev}deg)`,
              }}
            >
              <PreviewCard />
            </div>
          ) : null}
        </Shake>
      </AbsoluteFill>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* =================================================================
   SCÈNE 7 · Marché et abonnement (22,0 → 26,0 s)
   ================================================================= */
const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")}`;

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const riser = ramp(frame, 0, 105, 0, 1, (t) => t * t);

  let body: React.ReactNode;
  if (frame < 30) {
    // 7A · Marché, textures d'artisanat qui défilent
    const words = ["SOUTIENS", "NOS", "ARTISANS"];
    body = (
      <>
        <AbsoluteFill style={{ filter: "blur(8px) brightness(0.45)", overflow: "hidden" }}>
          {[0, 1, 2, 3].map((r) => (
            <div key={r} style={{ position: "absolute", top: r * 480, left: -((frame * 40 * (r % 2 ? 1 : -1) + 2000) % 1200) - 200, display: "flex", gap: 20 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <CraftTexture key={i} kind={(i + r) % 4} style={{ width: 420, height: 460, borderRadius: 30 }} />
              ))}
            </div>
          ))}
        </AbsoluteFill>
        <Phone pose={{ x: W / 2, y: 1030, scale: 1.12 }}>
          <MarketScreen />
        </Phone>
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 250 }}>
          <div style={{ display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center", width: 1000 }}>
            {words.map((w, i) => {
              const at = Math.round(i * 1.8);
              const y = ramp(frame, at, 6, -300, 0, back);
              return (
                <span
                  key={w}
                  style={{
                    fontFamily: cinzel,
                    fontWeight: 900,
                    fontSize: 92,
                    color: i === 2 ? C.gold : C.ivory,
                    transform: `translateY(${y}px)`,
                    opacity: frame >= at ? 1 : 0,
                    textShadow: "0 8px 30px rgba(0,0,0,0.9)",
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      </>
    );
  } else if (frame < 60) {
    // 7B · les forfaits jaillissent, compteur 0 → 1 500
    const c1 = popScale(frame, 30, 8, 1.1);
    const c2 = popScale(frame, 38, 8, 1.1);
    const count = ramp(frame, 31, 12, 0, 1500, Easing.out(Easing.cubic));
    body = (
      <>
        <Phone pose={{ ...BASE, scale: 1.2, y: 1000, opacity: 0.35 }}>
          <MarketScreen />
        </Phone>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 40 }}>
          <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 96, color: C.gold, textShadow: "0 8px 30px rgba(0,0,0,0.9)", transform: `scale(${ramp(frame, 30, 4, 1.3, 1)})` }}>
            {fcfa(count)} FCFA <span style={{ fontSize: 56, color: C.ivory }}>/ mois</span>
          </div>
          <div style={{ transform: `scale(${c1})` }}>
            <PlanCard name="Racines" price="1 500 FCFA/mois" desc="Tous les héros, mythes et lieux · narrations et vidéos" highlight pressed={frame >= 45 && frame < 50} />
          </div>
          <div style={{ transform: `scale(${c2})` }}>
            <PlanCard name="Héritage" price="3 000 FCFA/mois" desc="Tout Racines · -10 % au Marché · badge premium" />
          </div>
        </AbsoluteFill>
        <Tap at={45} x={540} y={1015} />
      </>
    );
  } else if (frame < 90) {
    // 7C · Mobile Money
    const u = ramp(frame, 64, 6, 0, 1);
    const b1 = popScale(frame, 60, 7, 1.15);
    const b2 = popScale(frame, 67, 7, 1.15);
    const badge = (bg: string, fg: string, label: string, s: number, rot: number) => (
      <div
        style={{
          width: 820,
          height: 210,
          borderRadius: 50,
          background: bg,
          color: fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: manrope,
          fontWeight: 800,
          fontSize: 92,
          transform: `scale(${s}) rotate(${rot}deg)`,
          boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
        }}
      >
        {label}
      </div>
    );
    body = (
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 280, gap: 60 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PunchWord text="MOBILE MONEY" at={60} size={100} />
          <div style={{ width: 860 * u, height: 10, borderRadius: 5, background: C.gold, marginTop: 18, boxShadow: `0 0 20px ${C.gold}` }} />
        </div>
        {badge("#FFCC00", "#111", "MTN MoMo", b1, -3)}
        {badge("#FF7900", "#fff", "Orange Money", b2, 3)}
      </AbsoluteFill>
    );
  } else {
    // 7D · validation, la coche remplit l'écran d'or
    const scale = ramp(frame, 90, 15, 1.45, 34, expoIn);
    const pose: PhonePose = { x: W / 2 - (SUCCESS_CHECK.x - 195) * scale, y: 960 - (SUCCESS_CHECK.y - 422) * scale, scale };
    body = (
      <>
        <Phone pose={pose}>
          <SuccessScreen />
        </Phone>
        <AbsoluteFill style={{ backgroundColor: C.gold, opacity: ramp(frame, 100, 5, 0, 1) }} />
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: ramp(frame, 111, 2, 0, 1) }} />
      </>
    );
  }

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(240,195,107,${0.25 * riser}) 0%, rgba(240,195,107,0) 60%)` }} />
      <Shake hits={[{ at: 0 }, { at: 30 }, { at: 38, amp: 5 }, { at: 60, amp: 12 }, { at: 67, amp: 12 }, { at: 90 }]}>{body}</Shake>
      <MotifWipe at={62} />
      {frame < 100 ? <Vignette /> : null}
      <Grain />
    </AbsoluteFill>
  );
};

/* =================================================================
   SCÈNE 8 · Signature finale (26,0 → 30,0 s)
   ================================================================= */
const MOSAIC = [
  ...HEROES.map((h) => `heros/${h.f}.jpg`),
  "img/mythe-ngan-medza-beti.jpg",
  "img/mythe-sao-geants-kotoko.jpg",
  "img/mythe-nchare-yen-bamoun.jpg",
  "img/palais-royal-foumban.jpg",
];

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const dolly = ramp(frame, 0, 120, 1, 1.04, (t) => t);
  const logoScale = frame < 9 ? ramp(frame, 0, 5, 1.3, 0.96) + (frame >= 5 ? ramp(frame, 5, 4, 0, 0.04) : 0) : 1;
  const shine = ramp(frame, 18, 14, -40, 140);
  const tag = ramp(frame, 30, 7, 1, 0);
  const tickerIn = ramp(frame, 60, 6, 0, 1);
  const pillars = "HÉROS · MYTHES · DÉCOUVERTE · COMMUNAUTÉ · MARCHÉ · ";

  return (
    <AbsoluteFill>
      <Background />
      {/* mosaïque des héros et des mythes qui défile vers le haut */}
      <AbsoluteFill style={{ opacity: 0.2, filter: "blur(3px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: -((frame * 16) % 1440), width: W, display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[...MOSAIC, ...MOSAIC, ...MOSAIC].slice(0, 30).map((src, i) => (
            <Img key={i} src={img(src)} style={{ width: 360, height: 360, objectFit: "cover" }} />
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(11,9,6,0.3) 0%, rgba(11,9,6,0.92) 70%)" }} />
      <Shake hits={[{ at: 0, amp: 14, dur: 3 }, { at: 60, amp: 6 }]}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 300, transform: `scale(${dolly})` }}>
          <div style={{ transform: `scale(${logoScale})` }}>
            <Img src={img("img/icon.png")} style={{ width: 400, height: 400, borderRadius: 200, boxShadow: "0 0 100px rgba(240,195,107,0.6)" }} />
          </div>
          <div style={{ position: "relative", marginTop: 34 }}>
            <LetterDrop text="AFROBACK" at={2} size={124} />
            {frame >= 18 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "center",
                  fontFamily: cinzel,
                  fontWeight: 900,
                  fontSize: 124,
                  lineHeight: 1.05,
                  background: `linear-gradient(100deg, transparent ${shine - 10}%, rgba(255,255,255,0.95) ${shine}%, transparent ${shine + 10}%)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                AFROBACK
              </div>
            ) : null}
          </div>
          <div
            style={{
              fontFamily: manrope,
              fontWeight: 800,
              fontSize: 50,
              color: C.ivory,
              marginTop: 18,
              opacity: 1 - tag,
              transform: `translateY(${tag * 80}px)`,
            }}
          >
            Retour aux origines
          </div>
          <div style={{ marginTop: 60, transform: `scale(${popScale(frame, 60, 9, 1.15)})` }}>
            <GoldButton label="Commence gratuitement" style={{ width: 700, height: 120, fontSize: 46, borderRadius: 60 }} />
          </div>
          <div style={{ marginTop: 40 }}>
            <LetterDrop text="afroback.app" at={75} size={64} family={manrope} weight={800} color={C.ivory} colorFrom={{ index: 8, color: C.gold }} />
          </div>
        </AbsoluteFill>
      </Shake>
      {/* bandeau des 5 piliers */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1462,
          height: 76,
          overflow: "hidden",
          borderTop: `2px solid rgba(240,195,107,0.4)`,
          borderBottom: `2px solid rgba(240,195,107,0.4)`,
          background: "rgba(11,9,6,0.7)",
          opacity: tickerIn,
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            fontFamily: cinzel,
            fontWeight: 700,
            fontSize: 40,
            lineHeight: "76px",
            color: C.gold,
            transform: `translateX(${-((frame - 60) * 10)}px)`,
          }}
        >
          {pillars.repeat(4)}
        </div>
      </div>
      <Shockwave at={0} y={500} />
      <Particles at={0} y={500} seed="final" />
      <Flash at={[0]} opacity={0.3} />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
