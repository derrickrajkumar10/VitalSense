import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../theme";

export const SceneTitle = ({
  label,
  title,
  appearAt = 0,
  exitAt,
}: {
  label: string;
  title: string;
  appearAt?: number;
  exitAt?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const end = exitAt ?? durationInFrames - 20;

  const inProgress  = spring({ frame: Math.max(0, frame - appearAt), fps, config: { damping: 16, stiffness: 120 } });
  const outProgress = frame > end ? interpolate(frame, [end, end + 20], [0, 1], { extrapolateRight: "clamp" }) : 0;

  const opacity = inProgress * (1 - outProgress);
  const y       = interpolate(inProgress, [0, 1], [24, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 64,
        left: 80,
        opacity,
        transform: `translateY(${y}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(245,241,234,0.92)",
          backdropFilter: "blur(12px)",
          border: `1px solid rgba(0,0,0,0.07)`,
          borderRadius: 40,
          padding: "10px 20px",
          marginBottom: 14,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.rose }} />
        <span style={{
          fontFamily: FONTS.mono,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: COLORS.muted,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: FONTS.display,
        fontSize: 36,
        fontWeight: 500,
        color: COLORS.ink,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        textShadow: "0 2px 16px rgba(245,241,234,0.8)",
      }}>
        {title.split("\\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
};
