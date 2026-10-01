import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { s } from "./theme";
import { Karaoke } from "./fx";
import { Scene1, Scene2, Scene3, Scene4 } from "./scenes1-4";
import { Scene5, Scene6, Scene7, Scene8 } from "./scenes5-8";

/** Découpage calé sur la carte du rythme (§2 du script). */
const SCENES = [
  { from: 0, dur: 4, C: Scene1 },
  { from: 4, dur: 2, C: Scene2 },
  { from: 6, dur: 4, C: Scene3 },
  { from: 10, dur: 4, C: Scene4 },
  { from: 14, dur: 4, C: Scene5 },
  { from: 18, dur: 4, C: Scene6 },
  { from: 22, dur: 4, C: Scene7 },
  { from: 26, dur: 4, C: Scene8 },
];

const w = (list: [string, number][]) => list.map(([word, t]) => ({ w: word, at: s(t) }));

/** Sous-titres des phrases de voix off qui ne sont pas déjà des mots qui percutent. */
const SUBS = [
  { words: w([["Chaque", 7.0], ["jour,", 7.3]]), end: s(8.0) },
  { words: w([["…tout", 16.0], ["le", 16.25], ["Cameroun !", 16.45]]), end: s(17.0) },
  { words: w([["Fais", 20.0], ["découvrir", 20.2], ["nos", 20.6], ["héros", 20.8], ["à", 21.1], ["tes", 21.25], ["proches.", 21.4]]), end: s(22.0) },
  { words: w([["Débloque", 23.0], ["tout", 23.35], ["avec", 24.0], ["Mobile", 24.2], ["Money !", 24.45]]), end: s(25.0) },
];

export const Main: React.FC<{ withAudio: boolean }> = ({ withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: "#0B0906" }}>
    {SCENES.map(({ from, dur, C }) => (
      <Sequence key={from} from={s(from)} durationInFrames={s(dur)}>
        <C />
      </Sequence>
    ))}
    {SUBS.map((sub, i) => (
      <Karaoke key={i} words={sub.words} end={sub.end} />
    ))}
    {withAudio ? <Audio src={staticFile("audio/piste-guide-120bpm.wav")} /> : null}
  </AbsoluteFill>
);
