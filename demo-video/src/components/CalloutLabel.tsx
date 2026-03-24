import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../theme";

export const CalloutLabel = ({
  x, y,
  text,
  sub,
  appearAt = 0,
  accentColor = COLORS.sage,
  direction = "right",
}: {
  x: number; y: number;
  text: string;
  sub?: string;
  appearAt?: number;
  accentColor?: string;
  direction?: "right" | "left";
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: Math.max(0, frame - appearAt),
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });

  const translateX = direction === "left" ? "-100%" : "0%";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale}) translateX(${translateX})`,
        transformOrigin: direction === "left" ? "right center" : "left center",
        pointerEvents: "none",
      }}
    >
      <div style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        border: `1.5px solid ${accentColor}40`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: "0 10px 10px 0",
        padding: "10px 16px",
        boxShadow: "0 4px 20px rgba(26,26,26,0.12)",
        minWidth: 160,
      }}>
        <div style={{
          fontFamily: FONTS.body,
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.ink,
          letterSpacing: "-0.01em",
          marginBottom: sub ? 3 : 0,
        }}>
          {text}
        </div>
        {sub && (
          <div style={{
            fontFamily: FONTS.body,
            fontSize: 11,
            color: COLORS.muted,
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};
