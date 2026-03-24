import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ZoomFrame }    from "../components/ZoomFrame";
import { HighlightBox } from "../components/HighlightBox";
import { CalloutLabel } from "../components/CalloutLabel";
import { LineDraw }     from "../components/LineDraw";
import { SceneTitle }   from "../components/SceneTitle";
import { Cursor }       from "../components/Cursor";
import { COLORS, FONTS } from "../theme";

// ── History screenshot layout (1920×1080) ─────────────────────────────────────
// Left sidebar: x=0–420 (timeline list)
// Center/Right: x=420–1920 (longitudinal chart + header)
// Chart area: x=450 y=230 w=1420 h=560
// Chart header: x=420 y=80 w=1480 h=140
// Export Data btn: x=1324 y=156 w=148 h=44
// Add Note btn: x=1478 y=156 w=148 h=44

const HR_PATH   = "M 450 430 C 560 425 640 410 720 405 C 810 400 880 402 970 412 C 1060 422 1120 405 1200 398 C 1290 391 1380 404 1460 400 C 1530 396 1590 404 1680 408 C 1740 411 1790 406 1860 408";
const BP_PATH   = "M 450 365 C 560 362 640 355 720 350 C 810 345 880 358 970 370 C 1060 382 1120 356 1200 345 C 1290 334 1380 350 1460 348 C 1530 346 1590 354 1680 360 C 1740 364 1790 356 1860 360";
const SPO2_PATH = "M 450 490 C 560 488 640 484 720 480 C 810 476 880 478 970 483 C 1060 488 1120 480 1200 475 C 1290 470 1380 477 1460 475 C 1530 473 1590 476 1680 477 C 1740 478 1790 474 1860 476";

export const HistoryScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const cursorFrames = [
    { frame: 0,   x: 960,  y: 800  },
    { frame: 40,  x: 720,  y: 460  }, // chart centre-left
    { frame: 110, x: 970,  y: 430  }, // chart centre (anomaly marker area)
    { frame: 180, x: 1200, y: 415  }, // BP anomaly
    { frame: 250, x: 1460, y: 440  }, // right chart
    { frame: 300, x: 1398, y: 178  }, // Export Data button
    { frame: 359, x: 1398, y: 178  },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.ivory, opacity: sceneO }}>

      <ZoomFrame fromScale={1.0} toScale={1.08} fromX={0} toX={-24} fromY={0} toY={-8} durationInFrames={360}>
        <img
          src={staticFile("screenshots/history.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          alt=""
        />
      </ZoomFrame>

      {/* ── Chart area highlight ── */}
      <HighlightBox
        x={450} y={225} width={1420} height={560}
        appearAt={25} color={COLORS.sage}
        label="12-month longitudinal analysis"
      />

      {/* ── Animated line traces (emphasis layer over screenshot lines) ── */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: 0.65, pointerEvents: "none" }}>
        <LineDraw d={HR_PATH}   color={COLORS.sage}     strokeWidth={3} width={1920} height={1080} startAt={35}  durationInFrames={80} pathLength={1450} />
        <LineDraw d={BP_PATH}   color={COLORS.lavender} strokeWidth={3} width={1920} height={1080} startAt={55}  durationInFrames={80} pathLength={1450} />
        <LineDraw d={SPO2_PATH} color={COLORS.sand}     strokeWidth={2.5} width={1920} height={1080} startAt={75} durationInFrames={80} pathLength={1450} />
      </div>

      {/* ── Legend callout ── */}
      {frame >= 30 && (
        <div style={{
          position: "absolute",
          left: 455,
          top: 238,
          opacity: interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" }),
          display: "flex",
          gap: 20,
        }}>
          {[
            { color: COLORS.sage,     label: "Heart Rate" },
            { color: COLORS.lavender, label: "Blood Pressure (Sys)" },
            { color: COLORS.sand,     label: "SpO₂" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 20, height: 2.5, background: color, borderRadius: 2 }} />
              <span style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.muted }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Anomaly markers ── */}
      {frame >= 110 && (
        <CalloutLabel
          x={978} y={360}
          text="Anomaly — BP spike"
          sub="MAR 15 · +12% elevation detected"
          appearAt={110}
          accentColor={COLORS.rose}
        />
      )}
      {frame >= 190 && (
        <CalloutLabel
          x={1010} y={440}
          text="SpO₂ low event"
          sub="JUL 08 · correlated stress index ↑"
          appearAt={190}
          accentColor={COLORS.amber}
          direction="left"
        />
      )}

      {/* ── Export Data button highlight ── */}
      {frame >= 290 && (
        <div style={{
          position: "absolute",
          left: 1318,
          top: 152,
          width: 160,
          height: 48,
          border: `2px solid ${COLORS.rose}`,
          borderRadius: 10,
          background: `${COLORS.rose}14`,
          opacity: interpolate(frame, [290, 320], [0, 0.92], { extrapolateRight: "clamp" }),
          boxShadow: `0 0 24px ${COLORS.rose}30`,
          pointerEvents: "none",
        }} />
      )}

      <SceneTitle
        label="04 — History & Trends"
        title="Longitudinal analysis,\n12 months in one view."
        appearAt={18}
        exitAt={320}
      />
      <Cursor keyframes={cursorFrames} clickAt={[320]} />

    </AbsoluteFill>
  );
};
