# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check (tsc -b) then bundle for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

There is no test runner configured in this project.

## Architecture

**VitalSense** is a clinical AI platform for vital signs monitoring, built as a React 19 SPA with Vite + TypeScript.

### Routing

React Router v7 wraps all routes in `App.tsx`. `AnimatePresence` from Framer Motion handles page transition animations. Routes map to page components in `src/pages/`:

- `/` → LandingPage (marketing/public)
- `/dashboard` → DashboardPage
- `/vitals` → VitalInputPage
- `/predictions` → PredictionsPage
- `/insights` → AIInsightsPage
- `/history` → PatientHistoryPage
- `/chat` → ClinicalChatPage
- `/reports` → ClinicalReportsPage
- `/login`, `/signup` → Auth pages
- `*` → inline NotFound component (in App.tsx)

### Global State

`src/context/VitalsContext.tsx` provides `VitalsProvider` (wrap in `main.tsx`) and the `useVitals()` hook. It stores `submittedVitals: SubmittedVitals | null` and exposes `submitVitals(raw: Record<string, string>)` which parses BP strings (`"135/85"` → `bp_sys`/`bp_dia`) and converts all fields to numbers.

`src/lib/predictionEngine.ts` exports `computePrediction(vitals | null)` returning `{ riskScore, conditions, shapValues, topCondition }`. It is a pure rule-based engine — no API calls, safe to call in render.

### Data Flow

1. User fills `VitalInputPage` → `submitVitals(values)` → stored in `VitalsContext`
2. `PredictionsPage` reads `submittedVitals` → `computePrediction()` → renders live gauge/bars
3. `AIInsightsPage` reads `submittedVitals` → `computePrediction()` → drives health score + top condition
4. `ClinicalChatPage` uses the Anthropic API (`claude-sonnet-4-20250514`) with a hardcoded clinical system prompt for Eleanor Vance patient context

### Animation Stack

The project uses **two animation systems** — choose the right one per use case:

- **Framer Motion** (`framer-motion`) — Page transitions (`PageTransition.tsx`), component mount/unmount, declarative spring animations. Shared variants are in `src/lib/animations.ts` (`pageVariants`, `containerVariants`, `itemVariants`, `cardVariants`). **Cubic bezier ease arrays must be typed as `[number, number, number, number]`** — use the `EASE` constant pattern from animations.ts, not inline `number[]` literals, to avoid TS2322.
- **GSAP** (`gsap`, `@gsap/react`) — Imperative, timeline-based animations. Presets are in `src/lib/animations.ts` (`fadeUp`, `staggerFadeUp`, `scaleIn`, `slideInLeft`, etc.).
- **Lenis** (`lenis`) — Smooth scroll, initialized in `src/lib/smoothScroll.ts`.

### Design System (Tailwind)

All custom tokens are in `tailwind.config.js`. Key rules:

- **Backgrounds** use `ivory` (#F5F1EA), `cream` (#FAF7F2), or `paper` (#FFFFFF) — never dark backgrounds.
- **Text** uses `ink.main` (#2C2926), `ink.muted`, `ink.soft`.
- **Accent colors**: `sage`, `lavender`, `rose`, `sand`, `amber` — each has `light`, `main`, `dark` variants.
- **Shadows**: `shadow-soft`, `shadow-card`, `shadow-float`, `shadow-inner-soft`.
- **Easing**: `ease-spring` (`cubic-bezier(0.22, 1, 0.36, 1)`) for smooth feel.
- **Fonts**: `font-sans` (Inter), `font-serif` (Newsreader), `font-mono` (JetBrains Mono).
- **Safelist**: `tailwind.config.js` has a `safelist` array for all dynamically-constructed class strings. Add new dynamic classes here to prevent Tailwind from purging them.

### Key Component Patterns

- `src/components/dashboard/` — Dashboard-specific sub-components (`DashboardSidebar`, `VitalCard`, `BodyMap`, `LiveECG`, `QuickEntryModal`, `RightPanel`).
- `VitalCard.tsx` — Uses `prevValueRef` to animate counters from previous value → new value, preventing flash-to-zero on every vital update interval.
- `QuickEntryModal.tsx` — Uses `closing` state (not `visible` state set in effect) to drive modal unmount after close animation. Avoids `react-hooks/set-state-in-effect` lint error.
- `DashboardSidebar.tsx` — Emergency Alert button wires to `CriticalAlertModal`. `CriticalAlertModal` is passed hardcoded `AlertData`.
- `src/data/` — Mock/static data only; no real API layer exists yet.
- `CursorGlow.tsx` — Mouse-tracking glow effect, rendered at app level.
- `CriticalAlertModal.tsx` — Modal for critical vital sign alerts.

### Page-Specific Notes

- **VitalInputPage** — `useSearchParams` detects `?mode=note` to auto-switch to the voice tab. Submit button validates HR/BP/SpO2, calls `submitVitals`, then navigates to `/predictions` after 1500ms.
- **PredictionsPage** — All gauge/bar/condition data is derived from `computePrediction(submittedVitals)`, not hardcoded.
- **AIInsightsPage** — `HEALTH_SCORE` and `topCondition` are derived from `computePrediction`. Score counter re-runs when `HEALTH_SCORE` changes.
- **ClinicalChatPage** — Live chat with Anthropic API. `messages` state drives rendering; initial 2 messages are entrance-animated via GSAP refs (`bubble1Ref`, `bubble2Ref`); typing indicator shown when `isLoading`.
- **ClinicalReportsPage** — Download PDF uses `html2canvas` + `jsPDF` to capture `mainRef`. Print uses `window.print()`.
- **PatientHistoryPage** — `ENTRY_VITALS` is a `Record<string, VitalEntry[]>` keyed by date strings for per-entry vitals data. `CHART_PATHS` is a `Record<string, { spo2, bp, hr }>` keyed by range (`1M`/`3M`/`1Y`/`ALL`); switching tabs fades paths out, swaps `d` attribute, draws in via GSAP.

### TypeScript Patterns

- GSAP `onComplete` callbacks that call `navigate()` must use block body `() => { navigate('/foo'); }` not expression body `() => navigate('/foo')` — react-router's `navigate` may return `Promise<void>` which is not assignable to GSAP's `Callback` type.
- Context files exporting both a provider component and a hook need `/* eslint-disable react-refresh/only-export-components */` at the top.
