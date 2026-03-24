import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export const HighlightBox = ({
  x, y, width, height,
  appearAt = 0,
  color = COLORS.rose,
  label,
  pulse = false,
}: {
  x: number; y: number; width: number; height: number;
  appearAt?: number;
  color?: string;
  label?: string;
  pulse?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - appearAt),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const pulseOpacity = pulse
    ? 0.25 + 0.15 * Math.sin((frame / 30) * Math.PI * 2)
    : 0.18;

  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {/* Fill */}
      <div style={{
        width:  width * progress,
        height: height,
        background: `${color}`,
        opacity: pulseOpacity,
        borderRadius: 8,
        transition: "width 0.1s",
      }} />
      {/* Border */}
      <div style={{
        position: "absolute",
        inset: 0,
        width,
        height,
        border: `2px solid ${color}`,
        borderRadius: 8,
        opacity: progress * 0.8,
      }} />
      {/* Label */}
      {label && (
        <div style={{
          position: "absolute",
          top: -28,
          left: 0,
          opacity: progress,
          background: color,
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "3px 10px",
          borderRadius: 4,
          whiteSpace: "nowrap",
        }}>
          {label}
        </div>
      )}
    </div>
  );
};
