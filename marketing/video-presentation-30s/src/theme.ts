import { Easing, interpolate } from "remotion";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Secondes → images (tempo 120 BPM : 1 temps = 0,5 s = 15 images). */
export const s = (sec: number) => Math.round(sec * FPS);

export const C = {
  black: "#0B0906",
  brown: "#1A130D",
  gold: "#F0C36B",
  goldPale: "#F7D98B",
  goldDeep: "#C98A3D",
  ivory: "#FFF4E0",
  terracotta: "#E3A277",
  appBg: "#0F0B08",
  textBody: "#D6C6B2",
  muted: "#8C7B67",
  border: "rgba(240, 195, 107, 0.16)",
  cardBg: "rgba(240, 195, 107, 0.06)",
  surface: "#1A130D",
};

export const cinzel = loadCinzel("normal", {
  weights: ["700", "900"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
export const manrope = loadManrope("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

export const expoOut = Easing.out(Easing.exp);
export const expoIn = Easing.in(Easing.exp);
export const backOut = Easing.out(Easing.back(1.8));

/** Interpolation bornée avec rampe « expo out » par défaut. */
export const ramp = (
  frame: number,
  start: number,
  dur: number,
  from: number,
  to: number,
  easing: (t: number) => number = expoOut,
) =>
  interpolate(frame, [start, start + dur], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Impact typographique : 140 % → 100 % en 4 images. */
export const punchScale = (frame: number, at: number) =>
  frame < at ? 0 : ramp(frame, at, 4, 1.4, 1, Easing.out(Easing.quad));

/** Rebond 0 → 120 % → 100 %. */
export const popScale = (frame: number, at: number, dur = 9, over = 1.2) => {
  if (frame < at) return 0;
  const half = Math.round(dur * 0.55);
  if (frame < at + half) return ramp(frame, at, half, 0, over);
  return ramp(frame, at + half, dur - half, over, 1, Easing.out(Easing.quad));
};

export const goldGradient = `linear-gradient(180deg, ${C.goldPale} 0%, ${C.gold} 45%, ${C.goldDeep} 100%)`;
