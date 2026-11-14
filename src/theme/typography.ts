export const typography = {
  fontFamily: [
    'Noto Sans',
    'Noto Sans Tamil',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'sans-serif',
  ].join(','),
  h1: {
    fontWeight: 900,
    letterSpacing: '-0.025em',
    color: '#18241B',
  },
  h2: {
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#18241B',
  },
  h3: {
    fontWeight: 800,
    letterSpacing: '-0.015em',
    color: '#18241B',
  },
  h4: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: '#18241B',
  },
  h5: {
    fontWeight: 700,
    color: '#18241B',
  },
  h6: {
    fontWeight: 700,
    color: '#18241B',
  },
  subtitle1: {
    fontWeight: 600,
    color: '#536458',
  },
  subtitle2: {
    fontWeight: 600,
    color: '#536458',
  },
  body1: {
    color: '#18241B',
    lineHeight: 1.6,
  },
  body2: {
    color: '#536458',
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
};
