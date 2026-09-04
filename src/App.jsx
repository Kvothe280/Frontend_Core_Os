import { useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import LoginScreen, { SESSION_KEY } from './components/LoginScreen.jsx';
import AppShell from './components/AppShell.jsx';

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    try {
      return localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState('panel');
  const [tick, setTick] = useState(0);
  const theme = useMemo(() => getTheme(usuario), [usuario]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!usuario ? (
        <LoginScreen onAcceso={(u) => setUsuario(u)} />
      ) : (
        <AppShell usuario={usuario} page={page} setPage={setPage} tick={tick} setTick={setTick} />
      )}
    </ThemeProvider>
  );
}
