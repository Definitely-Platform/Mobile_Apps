export const themeTokens = {
  colors: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    backgroundDark: '#090a0f',
    backgroundCardDark: '#13141c',
    surfaceDark: '#1a1b26',
    borderDark: 'rgba(255, 255, 255, 0.08)',
    textPrimaryDark: '#ffffff',
    textSecondaryDark: '#94a3b8',
    textMutedDark: '#64748b',
    emerald: '#10b981',
    rose: '#ef4444',
    amber: '#f59e0b',
  },
  gradients: {
    laser: ['#f97316', '#ec4899', '#8b5cf6'],
    primary: ['#6366f1', '#a855f7'],
  },
  typography: {
    fontBody: 'Inter',
    fontMono: 'IBM Plex Mono',
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
} as const;
