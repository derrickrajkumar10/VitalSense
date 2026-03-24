import { Composition } from "remotion";
import { VitalSenseDemo } from "./Video";
import { TOTAL_FRAMES } from "./theme";

export const RemotionRoot = () => (
  <Composition
    id="VitalSenseDemo"
    component={VitalSenseDemo}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1920}
    height={1080}
  />
);
