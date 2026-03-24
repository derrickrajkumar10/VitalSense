import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ZoomFrame }  from "../components/ZoomFrame";
import { PdfModal }   from "../components/PdfModal";
import { SceneTitle } from "../components/SceneTitle";
import { Cursor }     from "../components/Cursor";
import { COLORS }     from "../theme";

export const ExportScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneO = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // Cursor clicks "Export Data"
  const cursorFrames = [
    { frame: 0,   x: 1490, y: 180 },   // already near button (from HistoryScene)
    { frame: 30,  x: 1398, y: 167 },   // Export Data button center
    { frame: 60,  x: 1398, y: 167 },
    { frame: 90,  x: 960,  y: 540 },   // cursor retreats as modal appears
    { frame: 150, x: 840,  y: 650 },   // "Export PDF" button in modal
    { frame: 180, x: 840,  y: 650 },
    { frame: 209, x: 840,  y: 650 },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.ivory, opacity: sceneO }}>

      <ZoomFrame fromScale={1.06} toScale={1.02} durationInFrames={210}>
        <img
          src={staticFile("screenshots/history.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          alt=""
        />
      </ZoomFrame>

      {/* Export Data button highlight */}
      <div style={{
        position: "absolute",
        left: 1324,
        top: 158,
        width: 148,
        height: 44,
        border: `2px solid ${COLORS.rose}`,
        borderRadius: 10,
        background: `${COLORS.rose}14`,
        opacity: interpolate(frame, [0, 20, 40, 60], [0.9, 1, 0.6, 0], { extrapolateRight: "clamp" }),
        boxShadow: `0 0 20px ${COLORS.rose}28`,
        pointerEvents: "none",
      }} />

      {/* PDF Modal — appears after click at frame 60 */}
      {frame >= 60 && <PdfModal appearAt={60} />}

      {/* Highlight "Export PDF" inside modal at frame 150 */}
      {frame >= 150 && (
        <div style={{
          position: "absolute",
          left: "calc(50% - 280px)",
          top: "calc(50% + 90px)",
          width: 254,
          height: 46,
          border: `2px solid ${COLORS.ink}`,
          borderRadius: 10,
          opacity: interpolate(frame, [150, 170], [0, 0.8], { extrapolateRight: "clamp" }),
          boxShadow: "0 0 16px rgba(26,26,26,0.2)",
          pointerEvents: "none",
        }} />
      )}

      <SceneTitle label="05 — Export" title="One-click clinical reports,\nready for any EMR." appearAt={16} exitAt={180} />
      <Cursor keyframes={cursorFrames} clickAt={[40, 165]} />

    </AbsoluteFill>
  );
};
