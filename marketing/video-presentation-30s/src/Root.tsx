import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { NganMedza } from "./mythe/NganMedza";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AfrobackPresentation30s" component={Main} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackPresentation30sMuet" component={Main} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: false }} />
    <Composition id="AfrobackMytheNganMedza30s" component={NganMedza} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
  </>
);
