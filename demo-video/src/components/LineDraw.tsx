import { interpolate, useCurrentFrame } from "remotion";

export const LineDraw = ({
  d,
  width = 1920,
  height = 200,
  color = "#63755A",
  strokeWidth = 2.5,
  startAt = 0,
  durationInFrames = 90,
  pathLength = 1000,
}: {
  d: string;
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  startAt?: number;
  durationInFrames?: number;
  pathLength?: number;
}) => {
  const frame   = useCurrentFrame();
  const elapsed = Math.max(0, frame - startAt);
  const progress = interpolate(elapsed, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  // Ease in-out
  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  const drawn = eased * pathLength;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength - drawn}
      />
    </svg>
  );
};
