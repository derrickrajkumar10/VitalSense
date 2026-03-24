import { interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../theme";

export const Counter = ({
  from = 0,
  to,
  startAt = 0,
  durationInFrames = 60,
  decimals = 0,
  prefix = "",
  suffix = "",
  fontSize = 72,
  color = "#1a1a1a",
  fontFamily,
}: {
  from?: number;
  to: number;
  startAt?: number;
  durationInFrames?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startAt);

  // Ease out cubic
  const t = Math.min(elapsed / durationInFrames, 1);
  const eased = 1 - Math.pow(1 - t, 3);
  const value = from + (to - from) * eased;

  return (
    <span style={{
      fontFamily: fontFamily ?? FONTS.display,
      fontSize,
      fontWeight: 500,
      color,
      letterSpacing: "-0.03em",
      lineHeight: 1,
    }}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
};
