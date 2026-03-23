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

### Animation Stack

The project uses **two animation systems** — choose the right one per use case:

- **Framer Motion** (`framer-motion`) — Page transitions (`PageTransition.tsx`), component mount/unmount, declarative spring animations. Shared variants are defined per-page (e.g., `pageVariants`, `containerVariants`, `itemVariants`).
- **GSAP** (`gsap`, `@gsap/react`) — Imperative, timeline-based animations. Presets are in `src/lib/animations.ts` (`fadeUp`, `staggerFadeUp`, `scaleIn`, `slideInLeft`, etc.). Use `useScrollReveal` hook for scroll-triggered GSAP reveals.
- **Lenis** (`lenis`) — Smooth scroll, initialized in `src/lib/smoothScroll.ts`.

### Design System (Tailwind)

All custom tokens are in `tailwind.config.js`. Key rules:

- **Backgrounds** use `ivory` (#F5F1EA), `cream` (#FAF7F2), or `paper` (#FFFFFF) — never dark backgrounds.
- **Text** uses `ink.main` (#2C2926), `ink.muted`, `ink.soft`.
- **Accent colors**: `sage`, `lavender`, `rose`, `sand`, `amber` — each has `light`, `main`, `dark` variants.
- **Shadows**: `shadow-soft`, `shadow-card`, `shadow-float`, `shadow-inner-soft`.
- **Easing**: `ease-spring` (`cubic-bezier(0.22, 1, 0.36, 1)`) for smooth feel.
- **Fonts**: `font-sans` (Inter), `font-serif` (Newsreader), `font-mono` (JetBrains Mono).

### Key Component Patterns

- `src/components/dashboard/` — Dashboard-specific sub-components (`DashboardSidebar`, `VitalCard`, `BodyMap`, `LiveECG`, `QuickEntryModal`, `RightPanel`).
- `src/data/` — Mock/static data only; no real API layer exists yet.
- `CursorGlow.tsx` — Mouse-tracking glow effect, rendered at app level.
- `CriticalAlertModal.tsx` — Modal for critical vital sign alerts.
