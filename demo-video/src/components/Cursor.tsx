import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type CursorKeyframe = { frame: number; x: number; y: number };

export const Cursor = ({
  keyframes,
  clickAt = [],
  size = 28,
}: {
  keyframes: CursorKeyframe[];
  clickAt?: number[];
  size?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Interpolate position across keyframes
  const frames = keyframes.map((k) => k.frame);
  const xs     = keyframes.map((k) => k.x);
  const ys     = keyframes.map((k) => k.y);

  const x = interpolate(frame, frames, xs, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, frames, ys, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Click pulse: detect nearest click event
  const nearestClick = clickAt.reduce<number | null>((best, cf) => {
    const dist = frame - cf;
    if (dist >= 0 && dist < 20) return dist;
    if (best !== null && dist >= 0 && dist < best) return dist;
    return best;
  }, null);

  const clickScale = nearestClick !== null
    ? spring({ frame: nearestClick, fps, config: { damping: 8, stiffness: 300, mass: 0.5 } })
    : 1;
  const ringOpacity = nearestClick !== null
    ? interpolate(nearestClick, [0, 18], [0.8, 0], { extrapolateRight: "clamp" })
    : 0;
  const ringScale = nearestClick !== null
    ? interpolate(nearestClick, [0, 18], [1, 2.6], { extrapolateRight: "clamp" })
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        pointerEvents: "none",
        zIndex: 999,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Click ring */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          border: `2px solid rgba(139,26,26,${ringOpacity})`,
          transform: `scale(${ringScale})`,
          pointerEvents: "none",
        }}
      />
      {/* Cursor SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ transform: `scale(${clickScale})`, display: "block" }}
      >
        <path
          d="M5 3L19 12L12 13L8 21L5 3Z"
          fill="rgba(26,26,26,0.92)"
          stroke="white"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
