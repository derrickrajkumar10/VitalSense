# VitalSense Demo Video — Remotion Project

90-second cinematic demo video for the VitalSense hackathon pitch.
**1920×1080 · 30fps · H.264**

---

## Quick Start

```bash
cd demo-video
npm install
npm start          # Opens Remotion Studio in your browser
```

---

## Drop Screenshots Here

Save the following screenshot files into **`public/screenshots/`**
(take them from your running app at `localhost:5173`):

| Filename | Page / URL | What to capture |
|---|---|---|
| `landing.png` | `/` | Full hero section with navbar |
| `dashboard.png` | `/dashboard` | Full dashboard with body model visible |
| `ai-insights-top.png` | `/insights` | Top 3 insight cards (Top Risk · Most Improved · Predictive Alert) |
| `ai-insights-bottom.png` | `/insights` | Scroll down to the 78/100 trajectory chart |
| `prediction.png` | `/predictions` | Risk Assessment with SHAP bars visible on right |
| `history.png` | `/history` | Longitudinal chart tab (1Y view) |

**Recommended tool:** Browser DevTools → `Cmd/Ctrl+Shift+P` → "Capture full size screenshot"
Set browser width to **1920px** before capturing.

---

## Add Voiceover

1. Record your VO as a single MP3 or WAV file
2. Drop it into `public/audio/voiceover.mp3`
3. In `src/Video.tsx`, uncomment the `<Audio>` tag:

```tsx
import { Audio, staticFile } from "remotion";

// Inside <AbsoluteFill>:
<Audio src={staticFile("audio/voiceover.mp3")} />
```

**Voiceover timing guide (cue to scene):**

| Scene | Time | Suggested narration |
|---|---|---|
| Landing | 0:00 – 0:12 | "Introducing VitalSense — the operating system built for modern medicine." |
| Dashboard | 0:12 – 0:30 | "A unified patient command centre. Live vitals, continuous ECG, and a 3D body map — all in one focused view." |
| AI Insights Top | 0:30 – 0:42 | "VitalSense surfaces what matters. AI-detected risk factors, improvement trends, and predictive alerts — explained in plain language." |
| AI Insights Bottom | 0:42 – 0:54 | "Track a patient's 30-day health trajectory with a single score. 78 out of 100 — with full clinical context below." |
| Prediction | 0:54 – 1:07 | "The prediction engine stratifies risk using SHAP attribution — so you know exactly which signals are driving the score." |
| History & Trends | 1:07 – 1:19 | "Twelve months of longitudinal data in one chart. Anomalies are auto-flagged so nothing slips through." |
| Export | 1:19 – 1:26 | "One click generates a structured clinical report — ready for any EMR or patient handoff." |
| Outro | 1:26 – 1:30 | "VitalSense. Clinical intelligence, beautifully refined." |

---

## Render Final Video

```bash
# Standard H.264 MP4
npm run render

# ProRes (for editing in Premiere/DaVinci)
npm run render:prores
```

Output: `out/vitalsense-demo.mp4`

---

## Project Structure

```
demo-video/
├── public/
│   └── screenshots/        ← DROP SCREENSHOTS HERE
│       └── (landing.png, dashboard.png, ...)
├── src/
│   ├── index.ts            ← Remotion entry point
│   ├── Root.tsx            ← Composition definition
│   ├── Video.tsx           ← Scene sequencer
│   ├── theme.ts            ← Colors, fonts, timing constants
│   ├── components/
│   │   ├── Cursor.tsx      ← Animated cursor with click pulse
│   │   ├── ZoomFrame.tsx   ← Ken Burns zoom/pan on screenshots
│   │   ├── SceneTitle.tsx  ← Bottom-left scene labels
│   │   ├── HighlightBox.tsx← Pulsing highlight rectangles
│   │   ├── CalloutLabel.tsx← Animated callout chips
│   │   ├── Counter.tsx     ← Animated number counter
│   │   ├── LineDraw.tsx    ← SVG path draw animation
│   │   ├── BarFill.tsx     ← Bar chart fill animation
│   │   ├── PdfModal.tsx    ← Export PDF modal popup
│   │   └── FadeTransition.tsx ← Scene cross-fades
│   └── scenes/
│       ├── LandingScene.tsx
│       ├── DashboardScene.tsx
│       ├── AIInsightsTopScene.tsx
│       ├── AIInsightsBottomScene.tsx
│       ├── PredictionScene.tsx
│       ├── HistoryScene.tsx
│       ├── ExportScene.tsx
│       └── OutroScene.tsx
└── out/                    ← Rendered video output
```

---

## Adjust Highlight Positions

If the highlight boxes don't align with your screenshots, open the relevant scene file and update the `x`, `y`, `width`, `height` props on `<HighlightBox>` components. Use the Remotion Studio's frame-by-frame scrubber to get pixel-perfect positions.

---

## Scene Timing Reference

| Scene | Start | End | Duration |
|---|---|---|---|
| Landing | 0:00 | 0:12 | 12s |
| Dashboard | 0:12 | 0:30 | 18s |
| AI Insights Top | 0:30 | 0:42 | 12s |
| AI Insights Bottom | 0:42 | 0:54 | 12s |
| Prediction | 0:54 | 1:07 | 13s |
| History & Trends | 1:07 | 1:19 | 12s |
| Export | 1:19 | 1:26 | 7s |
| Outro | 1:26 | 1:30 | 4s |

To change timing, edit `src/theme.ts` → `SCENE` object and update `TOTAL_FRAMES`.
