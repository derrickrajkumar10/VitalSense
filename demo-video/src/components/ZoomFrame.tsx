import { interpolate, useCurrentFrame } from "remotion";
import React from "react";

export const ZoomFrame = ({
  children,
  fromScale = 1,
  toScale = 1.06,
  fromX = 0,
  toX = -16,
  fromY = 0,
  toY = -8,
  durationInFrames,
  startAt = 0,
}: {
  children: React.ReactNode;
  fromScale?: number;
  toScale?: number;
  fromX?: number;
  toX?: number;
  fromY?: number;
  toY?: number;
  durationInFrames: number;
  startAt?: number;
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startAt);

  const scale = interpolate(elapsed, [0, durationInFrames], [fromScale, toScale], {
    extrapolateRight: "clamp",
  });
  const x = interpolate(elapsed, [0, durationInFrames], [fromX, toX], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(elapsed, [0, durationInFrames], [fromY, toY], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        transformOrigin: "center center",
        transform: `scale(${scale}) translate(${x}px, ${y}px)`,
      }}
    >
      {children}
    </div>
  );
};
