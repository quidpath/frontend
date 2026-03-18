'use client';

import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    surface: {
      default: string;
      paper: string;
      elevated: string;
      overlay: string;
    };
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    surface?: {
      default?: string;
      paper?: string;
      elevated?: string;
      overlay?: string;
    };
  }
  interface TypeBackground {
    subtle: string;
    card: string;
  }
}

const GREEN = {
  50: '#E8F5E9',
  100: '#C8E6C9',
  200: '#A5D6A7',
  300: '#81C784',
  400: '#66BB6A',
  500: '#4CAF50',
  600: '#43A047',
  700: '#388E3C',
  800: '#2E7D32',
  900: '#1B5E20',
  950: '#0D3B11',
};

const TEAL = {
  400: '#26C6A6',
  500: '#1ABC9C',
  600: '#17A589',
};

const SLATE = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: GREEN[400],
      main: GREEN[600],
      dark: GREEN[800],
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: TEAL[400],
      main: TEAL[500],
      dark: TEAL[600],
      contrastText: '#FFFFFF',
    },
    accent: {
      light: GREEN[300],
      main: GREEN[500],
      dark: GREEN[700],
      contrastText: '#FFFFFF',
    },
    success: {
      light: '#6FCF97',
      main: '#27AE60',
      dark: '#219653',
      contrastText: '#FFFFFF',
    },
    warning: {
      light: '#F6C644',
      main: '#F2A40E',
      dark: '#D48109',
      contrastText: '#FFFFFF',
    },
    error: {
      light: '#EB7575',
      main: '#E53E3E',
      dark: '#C53030',
      contrastText: '#FFFFFF',
    },
    info: {
      light: '#63B3ED',
      main: '#3182CE',
      dark: '#2C5282',
      contrastText: '#FFFFFF',
    },
    grey: SLATE as Record<string, string>,
    text: {
      primary: SLATE[900],
      secondary: SLATE[500],
      disabled: SLATE[300],
    },
    background: {
      default: SLATE[50],
      paper: '#FFFFFF',
      subtle: SLATE[100],
      card: '#FFFFFF',
    } as Record<string, string>,
    surface: {
      default: SLATE[50],
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
      overlay: alpha('#FFFFFF', 0.95),
    },
    divider: SLATE[200],
  },

  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Cal Sans", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.15,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily: '"Cal Sans", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.375rem',
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '-0.005em',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0',
    },
    body1: {
      fontWeight: 400,
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    overline: {
      fontWeight: 600,
      fontSize: '0.6875rem',
      lineHeight: 1.5,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.005em',
      textTransform: 'none',
    },
  },

  spacing: 8,

  shape: {
    borderRadius: 10,
  },

  shadows: [
    'none',
    '0 1px 2px 0 rgba(0,0,0,0.04)',
    '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
    '0 2px 4px -1px rgba(0,0,0,0.06), 0 1px 3px -1px rgba(0,0,0,0.04)',
    '0 4px 6px -2px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
    '0 8px 10px -3px rgba(0,0,0,0.07), 0 3px 6px -3px rgba(0,0,0,0.04)',
    '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.04)',
    '0 12px 20px -4px rgba(0,0,0,0.08), 0 4px 8px -4px rgba(0,0,0,0.04)',
    '0 16px 25px -5px rgba(0,0,0,0.08), 0 6px 10px -6px rgba(0,0,0,0.04)',
    '0 20px 30px -6px rgba(0,0,0,0.09), 0 8px 12px -8px rgba(0,0,0,0.04)',
    '0 24px 38px -7px rgba(0,0,0,0.10), 0 10px 16px -8px rgba(0,0,0,0.04)',
    '0 28px 45px -7px rgba(0,0,0,0.10), 0 12px 18px -8px rgba(0,0,0,0.04)',
    '0 32px 50px -8px rgba(0,0,0,0.11), 0 14px 20px -10px rgba(0,0,0,0.05)',
    '0 36px 55px -8px rgba(0,0,0,0.11), 0 14px 22px -10px rgba(0,0,0,0.05)',
    '0 40px 60px -8px rgba(0,0,0,0.12), 0 16px 24px -10px rgba(0,0,0,0.05)',
    '0 44px 65px -9px rgba(0,0,0,0.12), 0 18px 26px -12px rgba(0,0,0,0.05)',
    '0 48px 70px -9px rgba(0,0,0,0.13), 0 20px 28px -12px rgba(0,0,0,0.05)',
    '0 52px 75px -10px rgba(0,0,0,0.13), 0 22px 30px -14px rgba(0,0,0,0.05)',
    '0 56px 80px -10px rgba(0,0,0,0.14), 0 24px 32px -14px rgba(0,0,0,0.05)',
    '0 60px 85px -10px rgba(0,0,0,0.14), 0 26px 34px -16px rgba(0,0,0,0.05)',
    '0 64px 90px -11px rgba(0,0,0,0.15), 0 28px 36px -16px rgba(0,0,0,0.05)',
    '0 68px 95px -11px rgba(0,0,0,0.15), 0 30px 38px -18px rgba(0,0,0,0.05)',
    '0 72px 100px -12px rgba(0,0,0,0.16), 0 32px 40px -18px rgba(0,0,0,0.06)',
    '0 76px 106px -12px rgba(0,0,0,0.16), 0 34px 42px -20px rgba(0,0,0,0.06)',
    '0 80px 112px -12px rgba(0,0,0,0.17), 0 36px 44px -20px rgba(0,0,0,0.06)',
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          backgroundColor: SLATE[50],
          color: SLATE[900],
        },
        '::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '::-webkit-scrollbar-thumb': {
          background: SLATE[300],
          borderRadius: '3px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: SLATE[400],
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.18s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        sizeLarge: {
          padding: '11px 24px',
          fontSize: '0.9375rem',
        },
        sizeSmall: {
          padding: '5px 12px',
          fontSize: '0.8125rem',
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -2px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.06)',
          },
        },
        outlined: {
          borderColor: SLATE[200],
          '&:hover': {
            borderColor: GREEN[500],
            backgroundColor: alpha(GREEN[500], 0.04),
          },
        },
      },
    },

    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${SLATE[200]}`,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            borderColor: SLATE[300],
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
          '&:last-child': {
            paddingBottom: '20px',
          },
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: SLATE[200],
        },
      },
    },

    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${SLATE[200]}`,
          color: SLATE[900],
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${SLATE[200]}`,
          backgroundImage: 'none',
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '1px 8px',
          padding: '8px 12px',
          width: 'calc(100% - 16px)',
          transition: 'all 0.15s ease',
          '&.Mui-selected': {
            backgroundColor: alpha(GREEN[600], 0.08),
            color: GREEN[700],
            '&:hover': {
              backgroundColor: alpha(GREEN[600], 0.12),
            },
            '& .MuiListItemIcon-root': {
              color: GREEN[600],
            },
          },
          '&:hover': {
            backgroundColor: SLATE[100],
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 38,
          color: SLATE[500],
        },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: SLATE[50],
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: SLATE[500],
            borderBottom: `2px solid ${SLATE[200]}`,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${SLATE[100]}`,
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: SLATE[50],
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: SLATE[200],
            },
            '&:hover fieldset': {
              borderColor: SLATE[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: GREEN[500],
              borderWidth: '1.5px',
            },
          },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: SLATE[800],
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 10px',
        },
        arrow: {
          color: SLATE[800],
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
        },
      },
    },

    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: SLATE[100],
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: SLATE[100],
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: SLATE[200],
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${SLATE[200]}`,
          '& .MuiTab-root': {
            fontWeight: 500,
            fontSize: '0.875rem',
            textTransform: 'none',
            letterSpacing: 0,
            minWidth: 0,
            padding: '10px 16px',
            color: SLATE[500],
            '&.Mui-selected': {
              color: GREEN[700],
              fontWeight: 600,
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: GREEN[600],
            height: 2,
          },
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: '0.6875rem',
        },
      },
    },
  },
});

export default theme;
