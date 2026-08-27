import { createTheme } from '@mui/material/styles';

const base = {
  typography: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    h3: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
    h4: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
    h5: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
    h6: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
};

// ── Enrique — "Nocturne": Seashell / Wheat / French Blue / Midnight Violet ──
const temaEnrique = createTheme({
  ...base,
  palette: {
    mode: 'light',
    primary: { main: '#3E4B8E', light: '#6470B5', dark: '#2B3566' },    // French Blue
    secondary: { main: '#3D1534', light: '#6B3460', dark: '#1F0A1A' },  // Midnight Violet
    background: {
      default: '#FFF4EB',   // Seashell — fondo general
      paper: '#FEFAF4',     // cálido entre seashell y wheat
    },
    text: {
      primary: '#1A1520',   // near-midnight, lectura cómoda
      secondary: '#5A5478',
    },
    divider: '#F0D9C4',     // wheat suave para bordes
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#FFF4EB !important', color: '#1A1520' } },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

// ── Karol — "Spring Soft": Canyon / Buttercream / Morning Sky / Olive Grove ──
const temaKarol = createTheme({
  ...base,
  palette: {
    mode: 'light',
    primary: { main: '#DF6D41', light: '#E8916B', dark: '#B5501F' },   // Canyon
    secondary: { main: '#AAA648', light: '#C4C070', dark: '#7A7830' }, // Olive Grove (antes no usado)
    background: {
      default: '#FEF6E4',   // Buttercream tintado — fondo general
      paper: '#FFFDF7',     // paper casi blanco con un suspiro cálido
    },
    text: {
      primary: '#3B2A1D',
      secondary: '#7A5C44',
    },
    info: { main: '#8DA6CC' },    // Morning Sky — para chips o badges
    divider: '#F5E6C8',           // buttercream tenue
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#FEF6E4 !important', color: '#3B2A1D' } },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export function getTheme(usuario) {
  return usuario === 'karol' ? temaKarol : temaEnrique;
}

export default temaEnrique;
