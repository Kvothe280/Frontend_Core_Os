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

const temaEnrique = createTheme({
  ...base,
  palette: {
    mode: 'light',
    primary: { main: '#3E6868' },
    secondary: { main: '#C94E44' },
    background: { default: '#f5f0e8', paper: '#ffffff' },
    text: { primary: '#2b3a3a', secondary: '#5a6e6e' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#f5f0e8 !important', color: '#2b3a3a' } },
    },
  },
});

const temaKarol = createTheme({
  ...base,
  palette: {
    mode: 'light',
    primary: { main: '#DF6D41' },
    secondary: { main: '#8DA6CC' },
    background: { default: '#fdf6e8', paper: '#ffffff' },
    text: { primary: '#3b2a1d', secondary: '#7a5c44' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#fdf6e8 !important', color: '#3b2a1d' } },
    },
  },
});

export function getTheme(usuario) {
  return usuario === 'karol' ? temaKarol : temaEnrique;
}

export default temaEnrique;
