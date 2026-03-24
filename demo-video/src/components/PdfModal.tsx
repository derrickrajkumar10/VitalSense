import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../theme";

export const PdfModal = ({ appearAt = 0 }: { appearAt?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - appearAt);
  const scale   = spring({ frame: elapsed, fps, config: { damping: 16, stiffness: 140, mass: 0.8 } });
  const opacity = interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Backdrop
  const backdropOpacity = interpolate(elapsed, [0, 12], [0, 0.4], { extrapolateRight: "clamp" });

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#1a1a1a",
        opacity: backdropOpacity,
        pointerEvents: "none",
      }} />

      {/* Modal */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        width: 560,
        background: "#FFFFFF",
        borderRadius: 20,
        boxShadow: "0 32px 80px rgba(26,26,26,0.25), 0 8px 24px rgba(26,26,26,0.1)",
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        {/* Header */}
        <div style={{
          background: COLORS.ivory,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <div style={{
            width: 40, height: 40,
            background: COLORS.rose,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 500, color: COLORS.ink }}>
              Clinical Report Export
            </div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
              Eleanor Vance — MRN 849-291-B
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
          {[
            { label: "12-Month Longitudinal Summary", check: true },
            { label: "AI Risk Assessment (SHAP)", check: true },
            { label: "Vital Trends & Anomalies", check: true },
            { label: "Physician Notes", check: false },
          ].map(({ label, check }, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderBottom: i < 3 ? "1px solid rgba(0,0,0,0.05)" : "none",
              fontFamily: FONTS.body,
              fontSize: 14,
              color: check ? COLORS.ink : COLORS.muted,
            }}>
              <div style={{
                width: 20, height: 20,
                borderRadius: 5,
                background: check ? COLORS.sage : "rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {check && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {label}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          gap: 12,
        }}>
          <div style={{
            flex: 1,
            background: COLORS.ink,
            color: "#fff",
            borderRadius: 10,
            padding: "12px 0",
            textAlign: "center",
            fontFamily: FONTS.body,
            fontSize: 13,
            fontWeight: 600,
          }}>
            Export PDF
          </div>
          <div style={{
            flex: 1,
            background: COLORS.ivory,
            color: COLORS.muted,
            borderRadius: 10,
            padding: "12px 0",
            textAlign: "center",
            fontFamily: FONTS.body,
            fontSize: 13,
          }}>
            Cancel
          </div>
        </div>
      </div>
    </>
  );
};
