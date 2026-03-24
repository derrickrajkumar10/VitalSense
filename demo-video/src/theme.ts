export const COLORS = {
  ivory:   '#F5F1EA',
  cream:   '#FAF7F2',
  paper:   '#FFFFFF',
  ink:     '#1a1a1a',
  muted:   '#6b6b6b',
  sage:    '#63755A',
  sageLight: '#A8B89F',
  lavender: '#6A608A',
  lavenderLight: '#C5BFD8',
  rose:    '#8B1A1A',
  roseLight: '#C97C7C',
  sand:    '#C4A882',
  amber:   '#D4A843',
} as const;

export const FONTS = {
  display: '"Playfair Display", Georgia, serif',
  body:    '"DM Sans", "Inter", system-ui, sans-serif',
  mono:    '"JetBrains Mono", "Fira Code", monospace',
} as const;

// ─── Scene timing (frames at 30fps) ──────────────────────────────────────────
export const SCENE = {
  landing:       { from: 0,    duration: 360  }, // 0s–12s
  dashboard:     { from: 360,  duration: 540  }, // 12s–30s
  aiTop:         { from: 900,  duration: 360  }, // 30s–42s
  aiBottom:      { from: 1260, duration: 360  }, // 42s–54s
  prediction:    { from: 1620, duration: 390  }, // 54s–67s
  history:       { from: 2010, duration: 360  }, // 67s–79s
  export:        { from: 2370, duration: 210  }, // 79s–86s
  outro:         { from: 2580, duration: 120  }, // 86s–90s
} as const;

export const TOTAL_FRAMES = 2700; // 90 seconds
