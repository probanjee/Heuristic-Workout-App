/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // NativeWind v4 content paths
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Background system
        bg: {
          primary: '#0A0A0A',
          secondary: '#141414',
          elevated: '#1E1E1E',
          overlay: '#0A0A0AE6',
        },
        // Electric Green accent
        accent: {
          DEFAULT: '#00FF87',
          dim: '#00FF8733',
          muted: '#00CC6A',
        },
        // Semantic
        warning: '#FFB830',
        danger: '#FF3B3B',
        info: '#3B8AFF',
        success: '#00FF87',
        // Text
        text: {
          primary: '#F5F5F5',
          secondary: '#9A9A9A',
          muted: '#5A5A5A',
          inverse: '#0A0A0A',
        },
        // Borders
        border: {
          DEFAULT: '#2A2A2A',
          subtle: '#1A1A1A',
          accent: '#00FF8733',
        },
        // Chart colors (muscle groups)
        chart: {
          chest: '#3B8AFF',
          back: '#00FF87',
          legs: '#FF8800',
          shoulders: '#9B59FF',
          arms: '#FF3B8B',
          core: '#FFB830',
        },
      },
      fontFamily: {
        // Syne — headings, UI labels
        display: ['Syne_800ExtraBold'],
        heading: ['Syne_700Bold'],
        // IBM Plex Sans — body text
        body: ['IBMPlexSans_400Regular'],
        'body-medium': ['IBMPlexSans_500Medium'],
        // DM Mono — numbers, timers, weights (instrument feel)
        mono: ['DMMono_400Regular'],
        'mono-bold': ['DMMono_700Bold'],
      },
      fontSize: {
        // Scale from typography brief
        'num-xl': ['64px', { lineHeight: '64px' }], // rep counter
        'num-l': ['48px', { lineHeight: '48px' }],  // weight display
        'num-m': ['32px', { lineHeight: '35px' }],  // set numbers
        'num-s': ['20px', { lineHeight: '24px' }],  // stats/badges
        'h1': ['32px', { lineHeight: '35px', letterSpacing: '-1px' }],
        'h2': ['24px', { lineHeight: '29px' }],
        'h3': ['18px', { lineHeight: '23px' }],
        'body-l': ['16px', { lineHeight: '24px' }],
        'body-m': ['14px', { lineHeight: '21px' }],
        'body-s': ['12px', { lineHeight: '17px' }],
        'caption': ['11px', { lineHeight: '15px' }],
      },
      spacing: {
        // 4px grid
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },
      borderRadius: {
        // Brutalist: sharp edges only
        'none': '0px',
        'sm': '4px',
        DEFAULT: '8px',
        'lg': '12px',
        // No xl or full — not our aesthetic
      },
    },
  },
  plugins: [],
};
