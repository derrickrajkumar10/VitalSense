import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Cursor }       from "../components/Cursor";
import { ZoomFrame }    from "../components/ZoomFrame";
import { COLORS, FONTS } from "../theme";

export const LandingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hero fade in
  const heroOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  // Badge appear
  const badgeScale = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 14, stiffness: 120 } });

  // Headline appear
  const h1Y = interpolate(Math.min(frame, 120), [30, 60], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h1O = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CTA buttons appear
  const ctaO = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Cursor moves to "View Demo" button (centered ~960, 500)
  const cursorFrames = [
    { frame: 0,   x: 400,  y: 700 },
    { frame: 90,  x: 960,  y: 700 },
    { frame: 180, x: 1060, y: 510 }, // View Demo button position
    { frame: 270, x: 1060, y: 510 },
    { frame: 359, x: 1060, y: 510 },
  ];

  // Dashboard card emerging from bottom
  const cardY = interpolate(frame, [200, 280], [120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardO = interpolate(frame, [200, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.ivory, overflow: "hidden" }}>

      <ZoomFrame fromScale={1} toScale={1.04} durationInFrames={360}>
        {/* Background screenshot */}
        <img
          src={staticFile("screenshots/landing.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          alt=""
        />

        {/* Ivory overlay for breathing room */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(245,241,234,0) 0%, rgba(245,241,234,0.12) 100%)",
        }} />
      </ZoomFrame>

      {/* ── If screenshot not available yet: fallback hero ── */}
      <AbsoluteFill style={{ opacity: 0 }}>
        {/* Fallback invisible — screenshot takes priority */}
      </AbsoluteFill>

      {/* ── Subtle vignette ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(245,241,234,0.3) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Highlight on "View Demo" button ── */}
      {frame >= 200 && (
        <div style={{
          position: "absolute",
          left: 972,
          top: 492,
          width: 168,
          height: 48,
          border: `2px solid ${COLORS.rose}`,
          borderRadius: 12,
          opacity: interpolate(frame, [200, 240], [0, 0.9], { extrapolateRight: "clamp" }),
          background: `${COLORS.rose}18`,
          pointerEvents: "none",
          boxShadow: `0 0 20px ${COLORS.rose}30`,
        }} />
      )}

      {/* ── Scene caption ── */}
      <div style={{
        position: "absolute",
        bottom: 72,
        left: 80,
        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(245,241,234,0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: 40,
          padding: "8px 18px",
          marginBottom: 10,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.rose }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.muted }}>
            Product Overview
          </span>
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 34, fontWeight: 500, color: COLORS.ink, letterSpacing: "-0.02em" }}>
          Clinical intelligence,<br />beautifully refined.
        </div>
      </div>

      {/* ── Cursor ── */}
      <Cursor keyframes={cursorFrames} clickAt={[250]} />

    </AbsoluteFill>
  );
};
