import { alpha } from '@mui/material/styles';

export const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#F5F2E9',
        color: '#18241B',
        fontFamily: "'Noto Sans', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        padding: '8px 20px',
        boxShadow: 'none',
        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 14px rgba(1, 62, 24, 0.15)',
        },
        '&.MuiButton-containedPrimary': {
          backgroundColor: '#013E18',
          color: '#F5F2E9',
          '&:hover': {
            backgroundColor: '#00280F',
          },
        },
        '&.MuiButton-containedSecondary': {
          backgroundColor: '#C99325',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#B5821F',
            boxShadow: '0 4px 14px rgba(201, 147, 37, 0.25)',
          },
        },
        '&.MuiButton-outlinedPrimary': {
          borderColor: '#013E18',
          color: '#013E18',
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: alpha('#013E18', 0.05),
          },
        },
        '&.MuiButton-outlinedSecondary': {
          borderColor: '#C99325',
          color: '#C99325',
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: alpha('#C99325', 0.08),
          },
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        border: '1px solid rgba(24, 36, 27, 0.08)',
        boxShadow: '0 2px 12px rgba(24, 36, 27, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          boxShadow: '0 12px 28px rgba(24, 36, 27, 0.08)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: 16,
      },
      elevation1: {
        boxShadow: '0 2px 12px rgba(24, 36, 27, 0.05)',
      },
      elevation2: {
        boxShadow: '0 4px 20px rgba(24, 36, 27, 0.08)',
      },
      elevation3: {
        boxShadow: '0 8px 30px rgba(24, 36, 27, 0.12)',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 24,
        boxShadow: '0 24px 60px rgba(24, 36, 27, 0.25)',
        border: '1px solid rgba(24, 36, 27, 0.08)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined' as const,
      size: 'medium' as const,
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          backgroundColor: '#FAF8F2',
          '&:hover fieldset': {
            borderColor: '#013E18',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#013E18',
            borderWidth: 2,
          },
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        backgroundColor: '#C99325',
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 700,
        fontSize: '0.9rem',
        color: '#536458',
        '&.Mui-selected': {
          color: '#013E18',
        },
      },
    },
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        color: '#013E18',
        height: 6,
      },
      thumb: {
        width: 18,
        height: 18,
        backgroundColor: '#FFFFFF',
        border: '3px solid #C99325',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        '&:focus, &:hover, &.Mui-active': {
          boxShadow: '0 0 0 8px rgba(201, 147, 37, 0.16)',
        },
      },
      track: {
        background: 'linear-gradient(90deg, #013E18, #C99325)',
      },
      rail: {
        backgroundColor: '#E5E0D5',
      },
    },
  },
  MuiDataGrid: {
    styleOverrides: {
      root: {
        border: '1px solid rgba(24, 36, 27, 0.08)',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#FAF8F2',
          color: '#18241B',
          fontWeight: 800,
          borderBottom: '2px solid rgba(24, 36, 27, 0.08)',
        },
        '& .MuiDataGrid-cell': {
          borderBottom: '1px solid rgba(24, 36, 27, 0.05)',
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'rgba(1, 62, 24, 0.03)',
        },
      },
    },
  },
};
