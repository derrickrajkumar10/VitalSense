import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Counter }    from "../components/Counter";
import { COLORS, FONTS } from "../theme";

const SCREENSHOTS = [
  "screenshots/dashboard.png",
  "screenshots/ai-insights-top.png",
  "screenshots/prediction.png",
  "screenshots/history.png",
];

export const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in from transition
  const sceneO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Logo + tagline
  const logoScale = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 16, stiffness: 100 } });
  const logoO     = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const taglineO  = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineY  = interpolate(frame, [40, 65], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const statO     = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Montage thumbnails slide up
  const thumbY = (delay: number) =>
    interpolate(frame, [delay, delay + 30], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const thumbO = (delay: number) =>
    interpolate(frame, [delay, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.ivory, opacity: sceneO }}>

      {/* Soft radial gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, rgba(99,117,90,0.08) 0%, transparent 65%)`,
      }} />

      {/* ── Logo ── */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -60%) scale(${logoScale})`,
        opacity: logoO,
        textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginBottom: 24 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span style={{ fontFamily: FONTS.display, fontSize: 52, fontWeight: 500, color: COLORS.ink, letterSpacing: "-0.03em" }}>
            VitalSense
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: taglineO,
          transform: `translateY(${taglineY}px)`,
          fontFamily: FONTS.body,
          fontSize: 20,
          color: COLORS.muted,
          letterSpacing: "0.01em",
          marginBottom: 40,
        }}>
          The operating system built for modern medicine.
        </div>

        {/* Stats row */}
        <div style={{
          opacity: statO,
          display: "flex",
          gap: 56,
          justifyContent: "center",
        }}>
          {[
            { value: 94, suffix: "%", label: "Arrhythmia detection" },
            { value: 5,  suffix: "M+", label: "Clinical records trained" },
            { value: 1,  suffix: "hr", label: "Saved per physician/day" },
          ].map(({ value, suffix, label }, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, justifyContent: "center" }}>
                <Counter from={0} to={value} startAt={60 + i * 10} durationInFrames={40} fontSize={38} color={COLORS.ink} />
                <span style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.sage }}>{suffix}</span>
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.muted, marginTop: 4, letterSpacing: "0.01em" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Montage row ── */}
      <div style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 16,
      }}>
        {SCREENSHOTS.map((src, i) => (
          <div key={i} style={{
            width: 310,
            height: 190,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(26,26,26,0.12)",
            border: "1px solid rgba(0,0,0,0.06)",
            opacity: thumbO(70 + i * 15),
            transform: `translateY(${thumbY(70 + i * 15)}px)`,
          }}>
            <img
              src={staticFile(src)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
              alt=""
            />
          </div>
        ))}
      </div>

      {/* ── Crimson bottom line ── */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 3,
        background: COLORS.rose,
        width: `${interpolate(frame, [0, 120], [0, 100], { extrapolateRight: "clamp" })}%`,
      }} />

    </AbsoluteFill>
  );
};
