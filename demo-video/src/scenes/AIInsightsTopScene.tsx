import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ZoomFrame }    from "../components/ZoomFrame";
import { HighlightBox } from "../components/HighlightBox";
import { CalloutLabel } from "../components/CalloutLabel";
import { SceneTitle }   from "../components/SceneTitle";
import { Cursor }       from "../components/Cursor";
import { COLORS, FONTS } from "../theme";

// ── AI Insights Top screenshot layout (1920×1080) ─────────────────────────────
// 3 cards in a row, each ~490px wide, y≈150–370
// Card 1 (Top Risk):    x=90,  y=150, w=490, h=220
// Card 2 (Most Improved): x=590, y=150, w=490, h=220
// Card 3 (Predictive Alert): x=1090, y=150, w=490, h=220
// Below: 2-col grid cards y≈390–820

export const AIInsightsTopScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const cursorFrames = [
    { frame: 0,   x: 960, y: 800 },
    { frame: 40,  x: 335, y: 260 }, // card 1
    { frame: 100, x: 835, y: 260 }, // card 2
    { frame: 170, x: 1335, y: 260 }, // card 3
    { frame: 250, x: 335, y: 560 }, // lower grid left
    { frame: 320, x: 1100, y: 560 }, // lower grid right
    { frame: 359, x: 1100, y: 560 },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.ivory, opacity: sceneO }}>

      <ZoomFrame fromScale={1.0} toScale={1.05} fromY={0} toY={-12} durationInFrames={360}>
        <img
          src={staticFile("screenshots/ai-insights-top.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          alt=""
        />
      </ZoomFrame>

      {/* ── Top 3 cards ── */}
      <HighlightBox x={88}  y={148} width={492} height={224} appearAt={20} color={COLORS.amber}    label="Top Risk Factor"   pulse />
      <HighlightBox x={588} y={148} width={492} height={224} appearAt={55} color={COLORS.sage}     label="Most Improved"     pulse />
      <HighlightBox x={1088} y={148} width={492} height={224} appearAt={90} color={COLORS.lavender} label="Predictive Alert"  pulse />

      {/* ── Callouts per card ── */}
      {frame >= 30 && (
        <CalloutLabel
          x={88} y={384}
          text="Hypertension Exacerbation"
          sub="Evening pattern · 18:00–22:00"
          appearAt={30}
          accentColor={COLORS.amber}
        />
      )}
      {frame >= 65 && (
        <CalloutLabel
          x={588} y={384}
          text="+24% HRV improvement"
          sub="Most improved vital · 30 days"
          appearAt={65}
          accentColor={COLORS.sage}
        />
      )}
      {frame >= 100 && (
        <CalloutLabel
          x={1088} y={384}
          text="SpO₂ stabilisation expected"
          sub="Predicted within 7 days"
          appearAt={100}
          accentColor={COLORS.lavender}
        />
      )}

      {/* ── Lower grid highlights ── */}
      <HighlightBox x={88}  y={388} width={740} height={388} appearAt={180} color={COLORS.rose}     label="Correlation Detected" />
      <HighlightBox x={840} y={388} width={740} height={388} appearAt={220} color={COLORS.lavender}  label="Population Comparison" />

      <SceneTitle
        label="02 — AI Insights"
        title="AI-surfaced clinical signals,\ninstantly interpretable."
        appearAt={18}
        exitAt={320}
      />
      <Cursor keyframes={cursorFrames} />

    </AbsoluteFill>
  );
};
