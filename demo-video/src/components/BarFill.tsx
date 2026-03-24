import { interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../theme";

export const BarFill = ({
  label,
  value,
  maxValue = 100,
  color = "#8B1A1A",
  startAt = 0,
  durationInFrames = 45,
  barHeight = 8,
  showValue = true,
  width = 320,
}: {
  label?: string;
  value: number;
  maxValue?: number;
  color?: string;
  startAt?: number;
  durationInFrames?: number;
  barHeight?: number;
  showValue?: boolean;
  width?: number;
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startAt);
  const t = Math.min(elapsed / durationInFrames, 1);
  // Ease out expo
  const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const fillPercent = (value / maxValue) * 100 * eased;

  return (
    <div style={{ width, marginBottom: 12 }}>
      {label && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontFamily: FONTS.body,
          fontSize: 12,
          color: "#6b6b6b",
        }}>
          <span>{label}</span>
          {showValue && (
            <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
              {Math.round(value * eased)}%
            </span>
          )}
        </div>
      )}
      <div style={{
        width: "100%",
        height: barHeight,
        background: "rgba(0,0,0,0.07)",
        borderRadius: barHeight / 2,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${fillPercent}%`,
          background: color,
          borderRadius: barHeight / 2,
          transition: "none",
        }} />
      </div>
    </div>
  );
};
