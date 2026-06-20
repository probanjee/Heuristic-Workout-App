/**
 * HeuristicAI â€” Design System Constants
 * Source of truth: UI_UX_BRIEF.md
 * Brutalist-Tech Dark aesthetic
 */

// â”€â”€â”€ COLOR TOKENS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const colors = {
  // Backgrounds
  bg: {
    primary: '#0A0A0A',    // main background
    secondary: '#141414',   // card/surface
    elevated: '#1E1E1E',    // elevated surface
    overlay: 'rgba(10,10,10,0.9)', // modal/overlay
  },

  // Electric Green accent system
  accent: {
    primary: '#00FF87',
    dim: 'rgba(0,255,135,0.15)',
    muted: '#00CC6A',
  },

  // Semantic colors
  warning: '#FFB830',
  danger: '#FF3B3B',
  info: '#3B8AFF',
  success: '#00FF87',

  // Typography
  text: {
    primary: '#F5F5F5',
    secondary: '#9A9A9A',
    muted: '#5A5A5A',
    inverse: '#0A0A0A',
    accent: '#00FF87',
  },

  // Borders
  border: {
    default: '#2A2A2A',
    subtle: '#1A1A1A',
    accent: 'rgba(0,255,135,0.3)',
    warning: 'rgba(255,184,48,0.3)',
    danger: 'rgba(255,59,59,0.3)',
  },

  // Muscle group chart palette
  chart: {
    chest: '#3B8AFF',
    back: '#00FF87',
    legs: '#FF8800',
    shoulders: '#9B59FF',
    arms: '#FF3B8B',
    core: '#FFB830',
    glutes: '#FF5E00',
    quads: '#00D4FF',
    hamstrings: '#FF3B3B',
    calves: '#00FF87',
  },
} as const;

// â”€â”€â”€ SPACING SYSTEM (4px grid) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

// â”€â”€â”€ TYPOGRAPHY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const typography = {
  // Font families
  fonts: {
    display: 'Syne_800ExtraBold',       // hero text
    heading: 'Syne_700Bold',            // section headers, CTAs
    body: 'IBMPlexSans_400Regular',     // body text, labels
    bodyMedium: 'IBMPlexSans_500Medium',// emphasized body
    mono: 'DMMono_400Regular',          // numbers, timers, weights
    monoBold: 'DMMono_500Medium',         // key numbers
  },

  // Scale â€” each includes fontFamily, fontSize, lineHeight (as React Native style)
  scale: {
    // Display numerals (rep counter, timer)
    numXL: { fontFamily: 'DMMono_500Medium', fontSize: 64, lineHeight: 64 },
    numL: { fontFamily: 'DMMono_500Medium', fontSize: 48, lineHeight: 48 },
    numM: { fontFamily: 'DMMono_400Regular', fontSize: 32, lineHeight: 35 },
    numS: { fontFamily: 'DMMono_400Regular', fontSize: 20, lineHeight: 24 },

    // Headings
    h1: { fontFamily: 'Syne_800ExtraBold', fontSize: 32, lineHeight: 35, letterSpacing: -1 },
    h2: { fontFamily: 'Syne_700Bold', fontSize: 24, lineHeight: 29 },
    h3: { fontFamily: 'Syne_700Bold', fontSize: 18, lineHeight: 23 },

    // Body
    bodyL: { fontFamily: 'IBMPlexSans_400Regular', fontSize: 16, lineHeight: 24 },
    bodyM: { fontFamily: 'IBMPlexSans_400Regular', fontSize: 14, lineHeight: 21 },
    bodyS: { fontFamily: 'IBMPlexSans_400Regular', fontSize: 12, lineHeight: 17 },

    // Utility
    caption: { fontFamily: 'IBMPlexSans_400Regular', fontSize: 11, lineHeight: 15 },
    label: { fontFamily: 'DMMono_400Regular', fontSize: 11, lineHeight: 15, letterSpacing: 0.5 },
    tag: { fontFamily: 'Syne_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 1 },
  },
} as const;

// â”€â”€â”€ BORDER RADIUS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Brutalist: sharp, but not zero â€” 4-8px only

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

// â”€â”€â”€ ANIMATION TOKENS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const animation = {
  // Duration (ms)
  fast: 150,
  medium: 300,
  slow: 500,

  // Rest timer update interval
  timerInterval: 100,

  // Heuristic decision banner display duration
  bannerAutoDismiss: 8000,
} as const;

// â”€â”€â”€ HAPTICS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const haptics = {
  // Use expo-haptics ImpactFeedbackStyle values
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;

// â”€â”€â”€ WORKOUT CONSTANTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const workoutConstants = {
  defaultRestSeconds: 90,
  minRestSeconds: 30,
  maxRestSeconds: 300,
  defaultTargetSets: 4,
  defaultTargetReps: 6,
  defaultRPE: 6,

  // Rep counter display
  repDisplayThreshold: 999,

  // 1RM accuracy band (Â±5%)
  oneRmAccuracyBand: 0.05,

  // Session fatigue warning threshold
  fatigueTriggerRpe: 8.5,
  fatigueTriggerSets: 4,

  // Deload trigger
  deloadTriggerConsecutive: 3,

  // Cache
  videoCacheMaxMB: 500,
} as const;

// â”€â”€â”€ BREAKPOINTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// For responsive adjustments (tablet support excluded per TRD)

export const breakpoints = {
  phone: 390,
  phoneLarge: 428,
} as const;

