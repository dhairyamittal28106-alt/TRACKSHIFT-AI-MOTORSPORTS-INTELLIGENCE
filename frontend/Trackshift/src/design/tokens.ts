
export const colors = {
  bg: {
    base: '#0A0A0A',
    panel: '#141414',
    panelAlt: '#1A1A1A',
    overlay: 'rgba(10, 10, 10, 0.85)',
  },

  accent: {
    primary: '#E10600',
    secondary: '#FF1E1A',
    hover: '#FF1E1A',
    dim: 'rgba(225, 6, 0, 0.15)',
    border: 'rgba(225, 6, 0, 0.35)',
    glow: 'rgba(225, 6, 0, 0.35)',
  },

  tech: {
    cyan: '#22D3EE',
    cyanDim: 'rgba(34, 211, 238, 0.15)',
    cyanGlow: 'rgba(34, 211, 238, 0.35)',
  },

  text: {
    primary: '#F5F5F5',
    secondary: '#CFCFCF',
    muted: '#8A8A8A',
    accent: '#E10600',
  },

  grey: {
    structural: '#5A5A5A',
    lighter: '#7A7A7A',
  },

  status: {
    green: '#22C55E',
    amber: '#F59E0B',
    red: '#FF4D4D',
    greenDim: 'rgba(34, 197, 94, 0.15)',
    amberDim: 'rgba(245, 158, 11, 0.15)',
    redDim: 'rgba(255, 77, 77, 0.15)',
  },

  tyre: {
    soft: '#FF4D4D',
    medium: '#F59E0B',
    hard: '#F0F2F5',
    inter: '#22C55E',
    wet: '#3B82F6',
  },

  border: {
    default: '#3A3A3A',
    accent: '#E10600',
    subtle: 'rgba(255, 255, 255, 0.08)',
    grey: '#5A5A5A',
    greyLighter: '#7A7A7A',
  },
} as const;

export const typography = {
  label: 'text-[10px] font-semibold tracking-[0.15em] uppercase',
  labelSm: 'text-[9px] font-semibold tracking-[0.18em] uppercase',
  stat: 'text-2xl font-bold tabular-nums',
  statSm: 'text-lg font-bold tabular-nums',
  title: 'text-sm font-semibold tracking-widest uppercase',
} as const;

export const TYRE_COLORS: Record<string, string> = {
  SOFT: colors.tyre.soft,
  MEDIUM: colors.tyre.medium,
  HARD: colors.tyre.hard,
  INTER: colors.tyre.inter,
  WET: colors.tyre.wet,
};
