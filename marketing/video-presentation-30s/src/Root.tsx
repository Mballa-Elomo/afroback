import React from "react";
import { Composition, Still } from "remotion";
import { Main } from "./Main";
import { NganMedza } from "./mythe/NganMedza";
import { ReineNzinga } from "./recits/ReineNzinga";
import { RubenUmNyobe } from "./recits/RubenUmNyobe";
import { MartinPaulSamba } from "./recits/MartinPaulSamba";
import { CharlesAtangana } from "./recits/CharlesAtangana";
import { MonsterQuadVillain } from "./prospects/MonsterQuadVillain";
import { MonsterQuadCforceC5 } from "./prospects/MonsterQuadCforceC5";
import { MonsterQuadCforceC5Long } from "./prospects/MonsterQuadCforceC5Long";
import { LyrraPresentation } from "./prospects/LyrraPresentation";
import { DawniceReseau } from "./prospects/DawniceReseau";
import { BoussardShort } from "./prospects/BoussardShort";
import { VisuelDistingo, VisuelSunology } from "./prospects/LeParrainVisuels";
import { LeParrainReel } from "./prospects/LeParrainReel";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AfrobackPresentation30s" component={Main} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackPresentation30sMuet" component={Main} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: false }} />
    <Composition id="AfrobackMytheNganMedza30s" component={NganMedza} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackRecitReineNzinga30s" component={ReineNzinga} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackRecitRubenUmNyobe30s" component={RubenUmNyobe} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackRecitMartinPaulSamba30s" component={MartinPaulSamba} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackRecitCharlesAtangana30s" component={CharlesAtangana} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    {/* Prospection Madou Consulting (hors AFROBACK) */}
    <Composition id="ProspectMonsterQuadVillain30s" component={MonsterQuadVillain} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ClientMonsterQuadCforceC5Reel40s" component={MonsterQuadCforceC5} durationInFrames={FPS * 40} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ClientMonsterQuadCforceC5Long108s" component={MonsterQuadCforceC5Long} durationInFrames={3240} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectLyrraPresentation30s" component={LyrraPresentation} durationInFrames={FPS * 30} fps={FPS} width={1920} height={1080} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectDawniceReseau30s" component={DawniceReseau} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectBoussardShort30s" component={BoussardShort} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectLeParrainReel30s" component={LeParrainReel} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Still id="LeParrainVisuelDistingo" component={VisuelDistingo} width={1080} height={1350} />
    <Still id="LeParrainVisuelSunology" component={VisuelSunology} width={1080} height={1350} />
  </>
);
