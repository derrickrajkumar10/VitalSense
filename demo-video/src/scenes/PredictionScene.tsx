import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ZoomFrame }    from "../components/ZoomFrame";
import { HighlightBox } from "../components/HighlightBox";
import { CalloutLabel } from "../components/CalloutLabel";
import { BarFill }      from "../components/BarFill";
import { Counter }      from "../components/Counter";
import { SceneTitle }   from "../components/SceneTitle";
import { Cursor }       from "../components/Cursor";
import { COLORS, FONTS } from "../theme";

// ── Prediction screenshot layout (1920×1080) ─────────────────────────────────
// Left sidebar: x=0–285
// Center: x=285–1180 (risk score gauge + condition probability bars)
// Right panel: x=1185–1920 (SHAP factor attribution + clinical synthesis)
//
// SHAP panel right: x=1185, y=90, w=700, h=420
// Composite risk (center top): x=285 y=60 w=900 h=260
// Condition bars: x=285 y=295 w=900 h=520

export const PredictionScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const cursorFrames = [
    { frame: 0,   x: 960, y: 500 },
    { frame: 50,  x: 730, y: 160 }, // risk score gauge
    { frame: 110, x: 1440, y: 200 }, // SHAP panel
    { frame: 180, x: 1440, y: 340 },
    { frame: 250, x: 560,  y: 380 }, // condition bars
    { frame: 330, x: 1050, y: 380 },
    { frame: 389, x: 960,  y: 540 },
  ];

  const shapO = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.ivory, opacity: sceneO }}>

      <ZoomFrame fromScale={1.0} toScale={1.06} fromX={0} toX={10} durationInFrames={390}>
        <img
          src={staticFile("screenshots/prediction.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          alt=""
        />
      </ZoomFrame>

      {/* ── Composite risk gauge highlight ── */}
      <HighlightBox x={410} y={60} width={380} height={260} appearAt={30} color={COLORS.rose} label="Composite Risk Score" />

      {/* ── Risk score counter overlay ── */}
      {frame >= 50 && (
        <div style={{
          position: "absolute",
          left: 420,
          top: 80,
          opacity: spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 14, stiffness: 90 } }),
        }}>
          <div style={{
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 14,
            padding: "14px 22px",
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 6 }}>
              Composite Risk
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <Counter from={0} to={78} startAt={50} durationInFrames={45} fontSize={44} color={COLORS.rose} />
              <span style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.muted }}>/100</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SHAP factor panel highlight ── */}
      <HighlightBox x={1185} y={88} width={700} height={430} appearAt={40} color={COLORS.lavender} label="SHAP Attribution" />

      {/* ── Animated SHAP bars overlay ── */}
      {frame >= 60 && (
        <div style={{
          position: "absolute",
          left: 1200,
          top: 148,
          opacity: shapO,
          transform: `translateY(${interpolate(shapO, [0, 1], [16, 0])}px)`,
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 14 }}>
            Factor Attribution
          </div>
          <BarFill label="HR Variability"   value={72} color={COLORS.roseLight}      startAt={60}  durationInFrames={36} width={280} />
          <BarFill label="Heart Rate"       value={55} color={COLORS.amber}           startAt={76}  durationInFrames={36} width={280} />
          <BarFill label="Stress Index"     value={40} color={COLORS.lavenderLight}   startAt={92}  durationInFrames={36} width={280} />
          <BarFill label="Blood Pressure"   value={35} color={COLORS.lavender}        startAt={108} durationInFrames={36} width={280} />
          <BarFill label="SpO₂ Level"       value={22} color={COLORS.sageLight}       startAt={124} durationInFrames={36} width={280} />
        </div>
      )}

      {/* ── Condition bars ── */}
      <HighlightBox x={285}  y={295} width={430} height={104} appearAt={160} color={COLORS.rose}   label="Arrhythmia · 78%" />
      <HighlightBox x={725}  y={295} width={430} height={104} appearAt={190} color={COLORS.amber}  label="Hypertension · 62%" />
      <HighlightBox x={285}  y={407} width={430} height={104} appearAt={220} color={COLORS.muted}  label="Tachycardia · 45%" />

      {/* ── Clinical synthesis callout ── */}
      {frame >= 210 && (
        <CalloutLabel
          x={1188} y={545}
          text="Sympathetic dominance"
          sub="AI clinical synthesis — mild irregular rhythm"
          appearAt={210}
          accentColor={COLORS.rose}
        />
      )}

      <SceneTitle
        label="03 — Prediction Analysis"
        title="Risk stratification,\nexplained by SHAP attribution."
        appearAt={18}
        exitAt={350}
      />
      <Cursor keyframes={cursorFrames} />

    </AbsoluteFill>
  );
};
