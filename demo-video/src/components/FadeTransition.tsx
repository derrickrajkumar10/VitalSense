import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const FadeTransition = ({
  durationInFrames,
  color = "#F5F1EA",
}: {
  durationInFrames: number;
  color?: string;
}) => {
  const frame = useCurrentFrame();
  const half  = durationInFrames / 2;

  const opacity = frame < half
    ? interpolate(frame, [0, half], [0, 1])
    : interpolate(frame, [half, durationInFrames], [1, 0]);

  return (
    <AbsoluteFill style={{ background: color, opacity, pointerEvents: "none" }} />
  );
};
