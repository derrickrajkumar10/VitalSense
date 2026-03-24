import { AbsoluteFill, Sequence } from "remotion";
import { SCENE } from "./theme";
import { LandingScene }         from "./scenes/LandingScene";
import { DashboardScene }       from "./scenes/DashboardScene";
import { AIInsightsTopScene }   from "./scenes/AIInsightsTopScene";
import { AIInsightsBottomScene } from "./scenes/AIInsightsBottomScene";
import { PredictionScene }      from "./scenes/PredictionScene";
import { HistoryScene }         from "./scenes/HistoryScene";
import { ExportScene }          from "./scenes/ExportScene";
import { OutroScene }           from "./scenes/OutroScene";
import { FadeTransition }       from "./components/FadeTransition";

export const VitalSenseDemo = () => (
  <AbsoluteFill style={{ background: "#F5F1EA" }}>

    <Sequence from={SCENE.landing.from}    durationInFrames={SCENE.landing.duration}>
      <LandingScene />
    </Sequence>

    <Sequence from={SCENE.dashboard.from}  durationInFrames={SCENE.dashboard.duration}>
      <DashboardScene />
    </Sequence>

    <Sequence from={SCENE.aiTop.from}      durationInFrames={SCENE.aiTop.duration}>
      <AIInsightsTopScene />
    </Sequence>

    <Sequence from={SCENE.aiBottom.from}   durationInFrames={SCENE.aiBottom.duration}>
      <AIInsightsBottomScene />
    </Sequence>

    <Sequence from={SCENE.prediction.from} durationInFrames={SCENE.prediction.duration}>
      <PredictionScene />
    </Sequence>

    <Sequence from={SCENE.history.from}    durationInFrames={SCENE.history.duration}>
      <HistoryScene />
    </Sequence>

    <Sequence from={SCENE.export.from}     durationInFrames={SCENE.export.duration}>
      <ExportScene />
    </Sequence>

    <Sequence from={SCENE.outro.from}      durationInFrames={SCENE.outro.duration}>
      <OutroScene />
    </Sequence>

    {/* Cross-fade overlay between scenes */}
    {[
      SCENE.landing.from + SCENE.landing.duration - 15,
      SCENE.dashboard.from + SCENE.dashboard.duration - 15,
      SCENE.aiTop.from + SCENE.aiTop.duration - 15,
      SCENE.aiBottom.from + SCENE.aiBottom.duration - 15,
      SCENE.prediction.from + SCENE.prediction.duration - 15,
      SCENE.history.from + SCENE.history.duration - 15,
      SCENE.export.from + SCENE.export.duration - 15,
    ].map((at) => (
      <Sequence key={at} from={at} durationInFrames={30}>
        <FadeTransition durationInFrames={30} color="#F5F1EA" />
      </Sequence>
    ))}

  </AbsoluteFill>
);
