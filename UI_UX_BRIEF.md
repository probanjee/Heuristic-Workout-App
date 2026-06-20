# HeuristicAI — UI/UX Design Brief

**Version:** 1.0.0  
**Designer/Developer:** Prosun Banerjee  
**Design Tool:** Figma  
**Last Updated:** 2025  

---

## 1. Design Philosophy

HeuristicAI lives in the gym — loud, dim, humid, physically demanding. The UI must work when:
- The user's hands are sweaty.
- The screen is at arm's length.
- The brain is running on adrenaline, not executive function.
- The environment has harsh overhead lighting or deep shadow.

**Core design principle:** Zero cognitive load during a set. Maximum information density before and after, absolute minimalism during.

---

## 2. Aesthetic Direction

### The Look: **Brutalist-Tech Dark**

Not glassmorphism softness, not neumorph shadows, not a startup's teal gradient.  
HeuristicAI is built on raw **functional aggression** — the visual language of industrial instruments, high-performance dashboards, and military HUD systems.

Think: F1 telemetry dash × strength sport × terminal UI × Japanese typographic density.

**Mood board references:**
- Wahoo ELEMNT cycling computer (data density, no decoration)
- Nike Training Club's dark mode (purposeful bold type, minimal chrome)
- Bloomberg Terminal (dense, but every pixel earns its place)
- Razer peripheral UI (dark, green accent, sharp edges — not gamer-tacky, just decisive)

**What this means in practice:**
- Black backgrounds. Not dark gray. `#0A0A0A`.
- Monospace or semi-condensed numbers (timing, weight, reps feel like instruments).
- A single electric accent: `#00FF87` (electric green) — used sparingly for CTAs and live data.
- Red: `#FF3B3B` — reserved exclusively for warnings and high-RPE states.
- Amber: `#FFB830` — moderate warnings, RPE 7–8 range.
- No rounded pill buttons. Sharp edges (border-radius: 4–8px max) or fully square.

---

## 3. Color System

```
// constants/theme.ts

export const colors = {
  // Backgrounds
  bg: {
    primary:   '#0A0A0A',   // main background
    secondary: '#141414',   // card backgrounds
    elevated:  '#1E1E1E',   // modals, bottom sheets
    overlay:   '#0A0A0AE6', // translucent overlays (90% opacity)
  },

  // Accent — Electric Green (primary CTA, live data, active states)
  accent: {
    primary:   '#00FF87',   // primary CTAs, active indicators
    dim:       '#00FF8733', // 20% opacity for backgrounds
    muted:     '#00CC6A',   // secondary accent, hover states
  },

  // Semantic
  semantic: {
    success:   '#00FF87',   // same as accent
    warning:   '#FFB830',   // RPE 7–8, moderate fatigue
    danger:    '#FF3B3B',   // RPE 9–10, form breakdown, session warning
    info:      '#3B8AFF',   // informational, sync status
  },

  // Text
  text: {
    primary:   '#F5F5F5',   // headings, primary labels
    secondary: '#9A9A9A',   // body, subtext
    muted:     '#5A5A5A',   // placeholders, disabled
    inverse:   '#0A0A0A',   // text on accent backgrounds
  },

  // Borders
  border: {
    default:   '#2A2A2A',
    subtle:    '#1A1A1A',
    accent:    '#00FF8733',
  },

  // RPE Gradient (used in RPE input + set card)
  rpe: [
    '#00FF87',  // 1
    '#00CC6A',  // 2
    '#44CC66',  // 3
    '#88CC44',  // 4
    '#AACC22',  // 5
    '#CCCC00',  // 6
    '#FFBB00',  // 7
    '#FF8800',  // 8
    '#FF4400',  // 9
    '#FF3B3B',  // 10
  ],
};
```

---

## 4. Typography

### Font Stack

```
Display / Numbers:   'DM Mono'  (Google Fonts — monospace, clean technical feel)
Headings:            'Space Grotesk'  ... NO — banned by design principle
                     'Syne'  (bold, geometric, slightly condensed, memorable)
Body:                'Inter'  ... NO — too generic
                     'IBM Plex Sans'  (neutral but has character, pairs with DM Mono)
```

> **Decision:** Syne (headings + UI labels) + DM Mono (numbers, timers, weights) + IBM Plex Sans (body, descriptions)

### Type Scale

```
// Screen headings
H1: Syne, 32px, weight 800, line-height 1.1, tracking -1px
H2: Syne, 24px, weight 700, line-height 1.2
H3: Syne, 18px, weight 600, line-height 1.3

// Body
Body-L: IBM Plex Sans, 16px, weight 400, line-height 1.5
Body-M: IBM Plex Sans, 14px, weight 400, line-height 1.5
Body-S: IBM Plex Sans, 12px, weight 400, line-height 1.4
Caption: IBM Plex Sans, 11px, weight 400, color text.muted

// Numbers (all use DM Mono)
Num-XL:  DM Mono, 64px, weight 700, line-height 1.0   // rep counter, rest timer
Num-L:   DM Mono, 48px, weight 700, line-height 1.0   // weight display
Num-M:   DM Mono, 32px, weight 500, line-height 1.1   // set numbers, 1RM
Num-S:   DM Mono, 20px, weight 400, line-height 1.2   // stats, badges
```

---

## 5. Spacing System

Based on 4px grid. All spacing values are multiples of 4.

```
space-1:   4px
space-2:   8px
space-3:   12px
space-4:   16px   ← default horizontal padding
space-5:   20px
space-6:   24px   ← section padding
space-8:   32px
space-10:  40px
space-12:  48px
space-16:  64px
space-20:  80px
```

Safe area: respect iOS notch + Dynamic Island. Bottom navigation bar: 72px height + safe area inset.

---

## 6. Component Specifications

### 6.1 Set Card (Active Workout — Most Critical Component)

```
┌──────────────────────────────────────────┐
│ BARBELL SQUAT              Set 2 / 4     │  ← Syne Bold 18px / DM Mono 14px
│ Quad • Glute • Core                      │  ← IBM Plex Sans 12px, muted
├──────────────────────────────────────────┤
│                                          │
│      75 KG                               │  ← DM Mono 64px, primary
│                                          │
│   [  −2.5  ]    REPS:  [ 4 ] [5] [6]   │  ← buttons sharp 8px radius
│   [ +2.5   ]           [ 7 ] [8] [9]   │
│                                          │
│  ████████████████░░░░  5/6 reps          │  ← progress bar, accent color
│                                          │
│         [ COMPLETE SET → ]               │  ← full-width, accent bg
└──────────────────────────────────────────┘
```

- Weight: DM Mono 64px — the largest element on screen. Muscle memory.
- Complete Set: full-width, `#00FF87` background, `#0A0A0A` text, 8px radius.
- Haptic: `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` on tap.

---

### 6.2 Rest Timer

```
┌──────────────────────────────────────────┐
│                                          │
│              REST                        │
│                                          │
│           ╭────────╮                    │
│          ╱          ╲                   │
│         │  1:30      │  ← DM Mono 48px  │
│         │            │                  │
│          ╲          ╱                   │
│           ╰────────╯                    │
│   (SVG ring, 4px stroke, drains CW)     │
│                                          │
│   NEXT SET: 75 KG × 6                   │  ← IBM Plex 14px, muted
│                                          │
│       [ SKIP →  ]  [ + 30s ]            │
│                                          │
└──────────────────────────────────────────┘
```

- Ring stroke color: starts `#00FF87`, transitions to `#FF8800` → `#FF3B3B` in last 20s.
- Background pulse: very subtle opacity animation on background in last 10s.

---

### 6.3 RPE Input Card

```
Full-screen overlay (slides up from bottom, spring animation)

┌──────────────────────────────────────────┐
│                                          │
│  HOW WAS THAT SET?                       │  ← Syne 24px
│  Set 2 · Barbell Squat · 75 kg × 6      │  ← IBM Plex 12px, muted
│                                          │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐                  │
│  │ 1││ 2││ 3││ 4││ 5│  ← 40px buttons   │
│  └──┘└──┘└──┘└──┘└──┘                  │
│                                          │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐                  │
│  │ 6││ 7││ 8││ 9││10│                  │
│  └──┘└──┘└──┘└──┘└──┘                  │
│                                          │
│  😊 Easy        😐 Hard        😤 Max   │
│                                          │
│  [Skip — use 6]    auto in 12s ▒▒▒░░░   │
│                                          │
└──────────────────────────────────────────┘
```

- Each button: 40×40px, sharp (4px radius), border `#2A2A2A`, text DM Mono.
- Selected state: background = RPE gradient color for that number, text = `#0A0A0A`.
- Auto-dismiss progress bar visible at bottom.
- Haptic `Light` on selection, `Medium` on skip.

---

### 6.4 Heuristic Banner

```
Slides up over rest timer (spring, 300ms)

┌──────────────────────────────────────────┐
│ 🤖 COACH                        RPE 9   │  ← Syne 14px Bold / DM Mono badge
│──────────────────────────────────────────│
│ RPE 9 on set 2. Reducing weight 10%      │  ← IBM Plex 14px
│ and adding 30 seconds rest.              │
│                                          │
│ NEXT SET:  67.5 KG × 6                  │  ← DM Mono, accent color
│ REST:      2:00 MIN                      │  ← DM Mono
│                                          │
│  [ ACCEPT ✓ ]        [ OVERRIDE ]       │
└──────────────────────────────────────────┘
```

- Left-bordered: 3px solid `#00FF87` border-left (if positive change) / `#FF3B3B` (if warning).
- Accept: `#00FF87` bg. Override: ghost with `#2A2A2A` border.

---

### 6.5 Progress Charts

```
Chart library: react-native-gifted-charts (or Victory Native)

Volume Chart (Stacked Bar):
  • Bar fill: each muscle group has a distinct dark-mode safe color
    - Chest:    #3B8AFF
    - Back:     #00FF87
    - Legs:     #FF8800
    - Shoulders:#9B59FF
    - Arms:     #FF3B8B
    - Core:     #FFB830
  • Background grid: 1px #1A1A1A lines
  • No chart border
  • Axis labels: DM Mono 11px

RPE Trend (Line):
  • Line: 2px, #FF8800 → #FF3B3B gradient based on values
  • Area fill: same color at 10% opacity
  • Dot markers: 6px radius, filled

1RM Progress (Line):
  • Line: 2px #00FF87
  • Ghost line: previous period in #2A2A2A for comparison
```

---

## 7. Motion Design System

### Principles

1. **Functional motion only** — every animation serves a purpose: signals state change, guides attention, or provides feedback.
2. **Spring physics over easing curves** — natural deceleration, no artificial bounce.
3. **Never block input** — animations run on the native UI thread via Reanimated 3.

### Animation Catalog

| Name | Trigger | Duration | Curve | Component |
|---|---|---|---|---|
| Set Complete Slide | "Complete Set" tapped | 300ms | spring (stiffness 200) | SetCard → exit left |
| RPE Card Rise | Set complete | 350ms | spring (stiffness 180) | RPE overlay from bottom |
| Heuristic Banner | RPE submitted | 300ms | spring (stiffness 160) | Banner slides up |
| Rest Timer Ring | Rest starts | Continuous | linear | SVG stroke-dashoffset |
| Weight Ticker | Heuristic weight change | 400ms | easeOut | Number scrolls up/down |
| Tab Switch | Tab tap | 200ms | easeInOut | Content fade + scale 0.97→1 |
| Page Enter | Screen push | 250ms | easeOut | Slide from right + fade |
| Celebration | Session end | 800ms | custom | Particle burst (Lottie) |
| Skeleton Pulse | Loading | Continuous | easeInOut sine | Opacity 0.3→0.6→0.3 |
| Form Warning | Form issue detected | 200ms | easeOut | Banner from bottom |

### Haptic Map

```
Light Impact:     RPE button tap, chip selection, nav tap
Medium Impact:    Rep tap, set complete, accept suggestion
Heavy Impact:     High RPE warning, form breakdown alert
Error Notif:      Session terminate warning, sync error
Success Notif:    Session end, sync complete
```

---

## 8. Screen Inventory (Full List)

| Screen | Route | Priority |
|---|---|---|
| Welcome | `/welcome` | P0 |
| Goals | `/goals` | P0 |
| Training Level | `/level` | P0 |
| Equipment | `/equipment` | P0 |
| Injuries | `/injuries` | P0 |
| Baseline Test | `/baseline` | P1 |
| Account Creation | `/account` | P1 |
| Workout Home | `/(tabs)/workout` | P0 |
| Active Workout | `/(tabs)/workout/active` | P0 |
| Post-Workout Summary | `/(tabs)/workout/summary` | P0 |
| Exercise Library | `/(tabs)/library` | P0 |
| Exercise Detail | `/(tabs)/library/[slug]` | P0 |
| Progress Dashboard | `/(tabs)/progress` | P1 |
| Profile / Settings | `/(tabs)/profile` | P1 |
| Login | `/auth/login` | P1 |
| Signup | `/auth/signup` | P1 |
| Forgot Password | `/auth/forgot` | P2 |

---

## 9. Icon & Illustration System

- **Icons:** Lucide React Native (sharp, minimal, 24px default, 2px stroke weight)
- **Custom icons needed:** RPE faces (5 expressions), muscle group diagrams (front/back body)
- **Illustrations:** None. The app is data/motion only. No decorative illustrations — they slow down the gym experience mentally.
- **Exercise thumbnails:** High-contrast photos (dark studio lighting) OR generated 3D mesh renders of silhouettes. No cheesy stock photos.
- **Loading states:** Skeleton screens, not spinners. Skeleton matches the layout of the content it replaces.

---

## 10. Empty States

| Screen | Empty State |
|---|---|
| Progress (no sessions yet) | "Complete your first workout to see stats" + "Start Workout" CTA |
| Exercise library (no filter results) | "No exercises match this filter. Try removing one." |
| Session history (new user) | "Nothing here yet. Your sessions will appear after your first workout." |

---

## 11. Accessibility Specifications

- **Color contrast:** All text/background combos ≥ 4.5:1 (WCAG AA). `#9A9A9A` on `#0A0A0A` = 5.9:1 ✓
- **Touch targets:** Minimum 44×44pt for all interactive elements (Apple HIG)
- **Dynamic type:** All text respects system font size scaling (no hardcoded font sizes in production)
- **Screen readers:** All interactive elements have `accessibilityLabel` + `accessibilityRole`
- **Reduce motion:** Wrap all Reanimated animations in `AccessibilityInfo.isReduceMotionEnabled()` check
- **Focus order:** Logical left-to-right, top-to-bottom for keyboard/switch navigation
- **Error messages:** Never rely on color alone — always include icon + text

---

## 12. Figma File Structure

```
HeuristicAI/
├── 🎨 Foundations
│   ├── Colors
│   ├── Typography
│   ├── Spacing & Grid
│   └── Icons
├── 🧩 Components
│   ├── Buttons
│   ├── Cards
│   ├── Form Elements
│   ├── Charts
│   ├── Overlays & Modals
│   └── Navigation
├── 📱 Screens
│   ├── Onboarding (7 screens)
│   ├── Workout (5 screens)
│   ├── Library (2 screens)
│   ├── Progress (1 screen)
│   └── Profile (1 screen)
├── 🏃 Flows
│   ├── Onboarding Flow
│   └── Active Workout Flow
└── 📤 Export
    ├── App Store Screenshots (iOS 6.7" + 6.1")
    └── Play Store Screenshots (16:9)
```

---

## 13. Design Tokens Export (for NativeWind / Tailwind Config)

```js
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0A0A0A',
          secondary: '#141414',
          elevated:  '#1E1E1E',
        },
        accent:  '#00FF87',
        warning: '#FFB830',
        danger:  '#FF3B3B',
        info:    '#3B8AFF',
        text: {
          primary:   '#F5F5F5',
          secondary: '#9A9A9A',
          muted:     '#5A5A5A',
        },
        border: '#2A2A2A',
      },
      fontFamily: {
        display: ['Syne_800ExtraBold'],
        heading: ['Syne_700Bold'],
        body:    ['IBMPlexSans_400Regular'],
        mono:    ['DMSans_400Regular'], // fallback — use DM Mono from expo-google-fonts
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        // No xl or higher — not our aesthetic
      },
    },
  },
};
```
