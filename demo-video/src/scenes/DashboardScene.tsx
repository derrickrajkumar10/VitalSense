import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Cursor }        from "../components/Cursor";
import { ZoomFrame }     from "../components/ZoomFrame";
import { HighlightBox }  from "../components/HighlightBox";
import { CalloutLabel }  from "../components/CalloutLabel";
import { SceneTitle }    from "../components/SceneTitle";
import { COLORS, FONTS } from "../theme";

// ── Dashboard screenshot layout (1920×1080) ──────────────────────────────────
// Left sidebar: x=0–380  (patient info + vitals cards)
// Center panel: x=390–1180 (body model + ECG)
// Right panel:  x=1180–1920 (focus area + scans + ECG trace)
//
// Vitals 2×2 grid inside left sidebar (approx):
//   HR:   x=42  y=340  w=152  h=70
//   BP:   x=200 y=340  w=152  h=70
//   SpO2: x=42  y=423  w=152  h=70
//   Resp: x=200 y=423  w=152  h=70
//
// Body model center: x=390 y=70 w=790 h=800
// ECG trace (right): x=1185 y=720 w=700 h=90

export const DashboardScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Cursor path: starts idle, moves to vitals, then body model, then right panel
  const cursorFrames = [
    { frame: 0,   x: 260,  y: 600  },
    { frame: 40,  x: 118,  y: 375  }, // HR card
    { frame: 90,  x: 276,  y: 375  }, // BP card
    { frame: 140, x: 118,  y: 458  }, // SpO2
    { frame: 190, x: 276,  y: 458  }, // Resp
    { frame: 250, x: 784,  y: 450  }, // body model centre
    { frame: 320, x: 784,  y: 390  }, // hover chest area
    { frame: 400, x: 1440, y: 740  }, // ECG trace (right panel)
    { frame: 539, x: 1440, y: 740  },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.ivory, opacity: sceneO }}>

      <ZoomFrame fromScale={1.0} toScale={1.06} fromX={0} toX={-20} durationInFrames={540}>
        <img
          src={staticFile("screenshots/dashboard.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          alt=""
        />
      </ZoomFrame>

      {/* ── Vitals card highlights (left sidebar) ── */}
      <HighlightBox x={42}  y={338} width={152} height={72} appearAt={30}  color={COLORS.sage}     label="Heart Rate"       />
      <HighlightBox x={200} y={338} width={152} height={72} appearAt={55}  color={COLORS.lavender} label="Blood Pressure"   />
      <HighlightBox x={42}  y={421} width={152} height={72} appearAt={80}  color={COLORS.sage}     label="SpO₂"             />
      <HighlightBox x={200} y={421} width={152} height={72} appearAt={105} color={COLORS.sand}     label="Resp. Rate"       />

      {/* ── Body model highlight ── */}
      {frame >= 200 && (
        <HighlightBox
          x={540} y={130} width={490} height={700}
          appearAt={200} color={COLORS.rose}
          pulse
        />
      )}

      {/* ── Body model callout ── */}
      {frame >= 220 && (
        <CalloutLabel
          x={1050} y={330}
          text="Cardiovascular Focus"
          sub="Atrial ectopic activity detected"
          appearAt={220}
          accentColor={COLORS.rose}
        />
      )}

      {/* ── ECG callout (right panel) ── */}
      {frame >= 140 && (
        <CalloutLabel
          x={1188} y={690}
          text="Lead II — Continuous"
          sub="72 bpm · Normal sinus rhythm"
          appearAt={140}
          accentColor={COLORS.lavender}
        />
      )}

      {/* ── CURRENT VITALS section label highlight ── */}
      {frame >= 20 && (
        <div style={{
          position: "absolute",
          left: 38,
          top: 298,
          opacity: interpolate(frame, [20, 45], [0, 0.9], { extrapolateRight: "clamp" }),
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${COLORS.sage}30`,
          borderLeft: `3px solid ${COLORS.sage}`,
          borderRadius: "0 8px 8px 0",
          padding: "5px 12px",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: COLORS.sage,
            opacity: 0.5 + 0.5 * Math.sin((frame / 15) * Math.PI),
          }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.sage, fontWeight: 600 }}>
            LIVE
          </span>
        </div>
      )}

      <SceneTitle
        label="01 — Dashboard"
        title="Patient command centre,\nlive vitals at a glance."
        appearAt={20}
        exitAt={480}
      />

      <Cursor keyframes={cursorFrames} clickAt={[250]} />

    </AbsoluteFill>
  );
};
