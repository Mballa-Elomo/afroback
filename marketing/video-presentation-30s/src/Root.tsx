import React from "react";
import { Composition, Still } from "remotion";
import { Main } from "./Main";
import { NganMedza } from "./mythe/NganMedza";
import { ReineNzinga } from "./recits/ReineNzinga";
import { RubenUmNyobe } from "./recits/RubenUmNyobe";
import { MartinPaulSamba } from "./recits/MartinPaulSamba";
import { CharlesAtangana } from "./recits/CharlesAtangana";
import { Presentation60s } from "./recits/Presentation60s";
import { TutorielInscription30s } from "./recits/TutorielInscription30s";
import { PaulBiya, BIYA_DUREE } from "./recits/PaulBiya";
import { PaulBiyaV2, BIYA_V2_DUREE } from "./recits/PaulBiyaV2";
import { BonneNuit, BONNE_NUIT_DUREE } from "./poemes/BonneNuit";
import { MonsterQuadVillain } from "./prospects/MonsterQuadVillain";
import { MonsterQuadCforceC5 } from "./prospects/MonsterQuadCforceC5";
import { MonsterQuadCforceC5Long } from "./prospects/MonsterQuadCforceC5Long";
import { LyrraPresentation } from "./prospects/LyrraPresentation";
import { DawniceReseau } from "./prospects/DawniceReseau";
import { BoussardShort } from "./prospects/BoussardShort";
import { VisuelDistingo, VisuelSunology } from "./prospects/LeParrainVisuels";
import { LeParrainReel } from "./prospects/LeParrainReel";
import { AurionKiroo, AurionKiroo30 } from "./prospects/AurionKiroo";
import { ComeupCouverture, ComeupInclus, ComeupMethode, ComeupOffres, ComeupProcess, CW, CH } from "./comeup/ComeupVisuels";
import { AppCouverture, AppInclus, AppOffres, AppProcess } from "./comeup/ComeupAppVisuels";
import { NganMedzaTeaser, NGAN_TEASER_FR_DUREE } from "./teasers/NganMedza";
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
    <Composition id="AfrobackRecitPaulBiya30s" component={PaulBiya} durationInFrames={FPS * BIYA_DUREE} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackRecitPaulBiyaV2" component={PaulBiyaV2} durationInFrames={FPS * BIYA_V2_DUREE} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackPresentation60s" component={Presentation60s} durationInFrames={FPS * 60} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackTutorielInscription30s" component={TutorielInscription30s} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="AfrobackPoemeBonneNuit59s" component={BonneNuit} durationInFrames={FPS * BONNE_NUIT_DUREE} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    {/* Teasers (mode teaser) : FR paysage d'abord ; FR vertical et EN après validation de Yannick */}
    <Composition id="AfrobackTeaserNganMedzaFrPaysage" component={NganMedzaTeaser} durationInFrames={NGAN_TEASER_FR_DUREE} fps={FPS} width={1920} height={1080} defaultProps={{ lang: "fr" as const, format: "paysage" as const, withAudio: true }} />
    <Composition id="AfrobackTeaserNganMedzaFrVertical" component={NganMedzaTeaser} durationInFrames={NGAN_TEASER_FR_DUREE} fps={FPS} width={1080} height={1920} defaultProps={{ lang: "fr" as const, format: "vertical" as const, withAudio: true }} />
    {/* Prospection Madou Consulting (hors AFROBACK) */}
    <Composition id="ProspectMonsterQuadVillain30s" component={MonsterQuadVillain} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ClientMonsterQuadCforceC5Reel40s" component={MonsterQuadCforceC5} durationInFrames={FPS * 40} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ClientMonsterQuadCforceC5Long108s" component={MonsterQuadCforceC5Long} durationInFrames={3240} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectLyrraPresentation30s" component={LyrraPresentation} durationInFrames={FPS * 30} fps={FPS} width={1920} height={1080} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectDawniceReseau30s" component={DawniceReseau} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectBoussardShort30s" component={BoussardShort} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectLeParrainReel30s" component={LeParrainReel} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectKirooAurionReel59s" component={AurionKiroo} durationInFrames={FPS * 59} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Composition id="ProspectKirooAurionReel30s" component={AurionKiroo30} durationInFrames={FPS * 30} fps={FPS} width={W} height={H} defaultProps={{ withAudio: true }} />
    <Still id="LeParrainVisuelDistingo" component={VisuelDistingo} width={1080} height={1350} />
    <Still id="LeParrainVisuelSunology" component={VisuelSunology} width={1080} height={1350} />
    <Still id="ComeupCouverture" component={ComeupCouverture} width={CW} height={CH} />
    <Still id="ComeupInclus" component={ComeupInclus} width={CW} height={CH} />
    <Still id="ComeupMethode" component={ComeupMethode} width={CW} height={CH} />
    <Still id="ComeupOffres" component={ComeupOffres} width={CW} height={CH} />
    <Still id="ComeupProcess" component={ComeupProcess} width={CW} height={CH} />
    <Still id="ComeupAppCouverture" component={AppCouverture} width={CW} height={CH} />
    <Still id="ComeupAppOffres" component={AppOffres} width={CW} height={CH} />
    <Still id="ComeupAppInclus" component={AppInclus} width={CW} height={CH} />
    <Still id="ComeupAppProcess" component={AppProcess} width={CW} height={CH} />
  </>
);
