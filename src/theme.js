import { createTheme } from '@mui/material/styles';

// Escala tipográfica compartida — tamaños coherentes, sin saltos bruscos
const typography = {
  fontFamily: '"DM Sans", system-ui, sans-serif',
  h3: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 500,
    fontSize: '2.1rem',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 500,
    fontSize: '1.65rem',
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 500,
    fontSize: '1.3rem',
    lineHeight: 1.25,
  },
  h6: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 500,
    fontSize: '1.15rem',
    lineHeight: 1.3,
    fontStyle: 'italic',
    letterSpacing: '0.005em',
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  body1: { fontSize: '0.9rem', lineHeight: 1.65 },
  body2: { fontSize: '0.82rem', lineHeight: 1.6 },
  overline: {
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    fontWeight: 600,
    lineHeight: 2,
  },
  caption: { fontSize: '0.75rem', lineHeight: 1.5 },
};

const shape = { borderRadius: 12 };

// Overrides de componentes que aplican a ambos temas
function componentOverrides(primary) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          letterSpacing: '0.02em',
        },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        outlined: { borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: `0 1px 6px ${primary}14, 0 1px 2px ${primary}08`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: '0.75rem' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiDivider: {
      styleOverrides: { root: { opacity: 0.6 } },
    },
  };
}

// ── Enrique — "Nocturne" ──────────────────────────────────────────────────────
// Seashell · Wheat · Powder Blue · French Blue · Midnight Violet
const temaEnrique = createTheme({
  typography,
  shape,
  palette: {
    mode: 'light',
    primary: { main: '#3E4B8E', light: '#6470B5', dark: '#2B3566' }, // French Blue
    secondary: { main: '#3D1534', light: '#7A3A68', dark: '#1F0A1A' }, // Midnight Violet
    info: { main: '#A6BCC9', light: '#C8D8E3', dark: '#6E94A6' }, // Powder Blue
    background: {
      default: '#FFF4EB', // Seashell — fondo general
      paper: '#FEFAF4', // Seashell + tinte wheat mínimo
    },
    text: {
      primary: '#1A1520', // near-midnight: legible y cálido a la vez
      secondary: '#5A5478',
    },
    divider: '#EDD8BC', // Wheat suave — calidez en los separadores
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#FFF4EB !important', color: '#1A1520' },
      },
    },
    ...componentOverrides('#3E4B8E'),
  },
});

// ── Karol — "Spring Soft" ─────────────────────────────────────────────────────
// Canyon · Buttercream · Morning Sky · Olive Grove
const temaKarol = createTheme({
  typography,
  shape,
  palette: {
    mode: 'light',
    primary: { main: '#DF6D41', light: '#E8916B', dark: '#B5501F' }, // Canyon
    secondary: { main: '#AAA648', light: '#C4C070', dark: '#7A7830' }, // Olive Grove
    info: { main: '#8DA6CC', light: '#B5C7E0', dark: '#5D7FAA' }, // Morning Sky
    background: {
      default: '#FEF6E4', // Buttercream tintado — fondo general cálido
      paper: '#FFFCF5', // casi blanco con apenas un soplo de mantequilla
    },
    text: {
      primary: '#3B2A1D',
      secondary: '#7A5C44',
    },
    divider: '#F5E3C0', // Buttercream — suavísimo
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#FEF6E4 !important', color: '#3B2A1D' },
      },
    },
    ...componentOverrides('#DF6D41'),
  },
});

export function getTheme(usuario) {
  return usuario === 'karol' ? temaKarol : temaEnrique;
}

export default temaEnrique;
