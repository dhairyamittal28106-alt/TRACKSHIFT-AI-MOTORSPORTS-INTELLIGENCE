
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trackbg: '#0A0A0A',
        panel: '#141414',
        'panel-alt': '#1A1A1A',
        accent: {
          DEFAULT: '#E10600',
          hover: '#FF1E1A',
          secondary: '#FF1E1A',
          dim: 'rgba(225, 6, 0, 0.15)',
          glow: 'rgba(225, 6, 0, 0.35)',
        },
        tech: {
          cyan: '#22D3EE',
          dim: 'rgba(34, 211, 238, 0.15)',
        },
        status: {
          green: '#22C55E',
          amber: '#F59E0B',
          red: '#FF4D4D',
        },
        tyre: {
          soft: '#FF4D4D',
          medium: '#F59E0B',
          hard: '#F0F2F5',
          inter: '#22C55E',
          wet: '#3B82F6',
        },
        brandgrey: {
          border: '#3A3A3A',
          structural: '#5A5A5A',
          lighter: '#7A7A7A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        technical: '0.15em',
        widest: '0.2em',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(225, 6, 0, 0.3), 0 0 10px rgba(225, 6, 0, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(225, 6, 0, 0.6), 0 0 25px rgba(225, 6, 0, 0.35)' },
        },
        scan: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}