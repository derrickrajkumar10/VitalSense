import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ZoomFrame }    from "../components/ZoomFrame";
import { HighlightBox } from "../components/HighlightBox";
import { CalloutLabel } from "../components/CalloutLabel";
import { Counter }      from "../components/Counter";
import { SceneTitle }   from "../components/SceneTitle";
import { Cursor }       from "../components/Cursor";
import { COLORS, FONTS } from "../theme";

export const AIInsightsBottomScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Simulated scroll downward
  const scrollY = interpolate(frame, [30, 120], [0, -140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Score counter
  const scoreO = spring({ frame: Math.max(0, frame - 60), fps, config: { damping: 14, stiffness: 80 } });

  const cursorFrames = [
    { frame: 0,   x: 960, y: 400 },
    { frame: 40,  x: 960, y: 600 },
    { frame: 80,  x: 960, y: 700 }, // scrolling gesture
    { frame: 140, x: 300, y: 500 },
    { frame: 220, x: 300, y: 440 }, // score card
    { frame: 300, x: 960, y: 440 }, // chart
    { frame: 359, x: 960, y: 440 },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.ivory, opacity: sceneO }}>

      {/* Pan upward to simulate scroll */}
      <div style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${scrollY}px)`,
      }}>
        <ZoomFrame fromScale={1.0} toScale={1.05} durationInFrames={360}>
          <img
            src={staticFile("screenshots/ai-insights-bottom.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            alt=""
          />
        </ZoomFrame>
      </div>

      {/* ── Score overlay ── */}
      {frame >= 60 && (
        <div style={{
          position: "absolute",
          left: 90,
          top: 280,
          opacity: scoreO,
          transform: `scale(${scoreO})`,
          transformOrigin: "left center",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 16,
            padding: "20px 28px",
            minWidth: 180,
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 10 }}>
              Overall Health Score
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <Counter from={0} to={78} startAt={60} durationInFrames={50} fontSize={56} color={COLORS.ink} />
              <span style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.muted }}>/100</span>
            </div>
            <div style={{
              marginTop: 8,
              height: 4,
              background: "rgba(0,0,0,0.06)",
              borderRadius: 4,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${78 * Math.min((frame - 60) / 50, 1)}%`,
                background: COLORS.sage,
                borderRadius: 4,
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Chart highlight ── */}
      <HighlightBox
        x={90} y={380} width={1740} height={280}
        appearAt={140} color={COLORS.sage}
        label="30-day trajectory"
      />

      {/* ── Trend callout ── */}
      {frame >= 160 && (
        <CalloutLabel
          x={1100} y={380}
          text="Consistent improvement"
          sub="Cardiovascular stability ↑ over 30 days"
          appearAt={160}
          accentColor={COLORS.sage}
        />
      )}

      {/* Scroll indicator */}
      {frame >= 30 && frame <= 130 && (
        <div style={{
          position: "absolute",
          right: 60,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: interpolate(frame, [30, 50, 110, 130], [0, 0.8, 0.8, 0]),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.muted }}>Scroll</span>
          <div style={{
            width: 1.5,
            height: 40,
            background: COLORS.muted,
            opacity: 0.4,
          }} />
          <div style={{
            width: 6, height: 6,
            borderRight: `1.5px solid ${COLORS.muted}`,
            borderBottom: `1.5px solid ${COLORS.muted}`,
            transform: "rotate(45deg)",
          }} />
        </div>
      )}

      <SceneTitle label="02 — AI Insights" title="78/100 health trajectory,\nexplained in plain language." appearAt={18} exitAt={320} />
      <Cursor keyframes={cursorFrames} clickAt={[]} />

    </AbsoluteFill>
  );
};
