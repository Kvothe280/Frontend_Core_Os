import { useMemo, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { getTheme } from './theme';
import { api } from './api';
import HomeDashboard from './components/HomeDashboard.jsx';
import Terminal from './components/Terminal.jsx';
import Boveda from './components/Boveda.jsx';
import Cartas from './components/Cartas.jsx';
import Recuerdos from './components/Recuerdos.jsx';

const DRAWER = 268;
const SESSION_KEY = 'coreos_usuario';

function PantallaLogin({ onAcceso }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const intentar = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.post('/api/auth/login', { clave });
      if (data.ok) {
        try { localStorage.setItem(SESSION_KEY, data.usuario); } catch {}
        onAcceso(data.usuario);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f7f3ee' }}>
      <Box sx={{ textAlign: 'center', maxWidth: 320, width: '100%', px: 3 }}>
        <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 0.5 }}>CORE OS</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Solo para nosotros dos.</Typography>
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          value={clave}
          onChange={(e) => { setClave(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && intentar()}
          error={error}
          helperText={error ? 'Contraseña incorrecta, inténtalo de nuevo.' : ''}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" fullWidth onClick={intentar} disabled={loading || !clave}>
          Entrar
        </Button>
      </Box>
    </Box>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    try { return localStorage.getItem(SESSION_KEY) || null; } catch { return null; }
  });
  const [page, setPage] = useState('panel');
  const [bovedaAbierta, setBovedaAbierta] = useState(false);
  const [tick, setTick] = useState(0);
  const theme = useMemo(() => getTheme(usuario), [usuario]);

  useEffect(() => {
    api.post('/api/auth/login', { clave: '' }).then(({ data }) => {
      if (data.ok) setUsuario((prev) => prev || data.usuario);
    }).catch(() => {});
  }, []);

  const items = useMemo(
    () => [
      { id: 'panel', label: 'Inicio', icon: <DashboardOutlinedIcon /> },
      { id: 'cartas', label: 'Cartas', icon: <MailOutlineIcon /> },
      { id: 'recuerdos', label: 'Recuerdos', icon: <PhotoLibraryOutlinedIcon /> },
      { id: 'terminal', label: 'Terminal', icon: <TerminalIcon /> },
      {
        id: 'boveda',
        label: 'Nuestros Vales',
        icon: bovedaAbierta ? <LockOpenIcon /> : <LockIcon />,
        locked: !bovedaAbierta,
      },
    ],
    [bovedaAbierta]
  );

  if (!usuario) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PantallaLogin onAcceso={(u) => setUsuario(u)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER,
            '& .MuiDrawer-paper': {
              width: DRAWER,
              borderRight: `1px solid ${theme.palette.primary.main}29`,
              background: theme.palette.background.paper,
              px: 1.5,
            },
          }}
        >
          <Box sx={{ px: 1.5, py: 3 }}>
            <Typography variant="overline" sx={{ color: theme.palette.primary.main, letterSpacing: '0.22em' }}>
              CORE OS
            </Typography>
            <Typography variant="h5" sx={{ lineHeight: 1.15 }}>
              Nuestro sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Juntos desde el 18 de febrero
            </Typography>
          </Box>
          <List>
            {items.map((item) => (
              <ListItemButton
                key={item.id}
                selected={page === item.id}
                onClick={() => setPage(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}1f`,
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.locked ? theme.palette.secondary.main : theme.palette.primary.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.locked ? 'Cifrado' : null}
                />
              </ListItemButton>
            ))}
          </List>
        </Drawer>

        <main style={{ flex: 1, padding: 24, minWidth: 0, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
          {page === 'panel' && (
            <HomeDashboard
              tick={tick}
              usuario={usuario}
              onEstado={(abierta) => setBovedaAbierta(abierta)}
              onOpenCartas={() => setPage('cartas')}
              onOpenRecuerdos={() => setPage('recuerdos')}
            />
          )}
          {page === 'cartas' && <Cartas usuario={usuario} />}
          {page === 'recuerdos' && <Recuerdos onChange={() => setTick((n) => n + 1)} />}
          {page === 'terminal' && (
            <Terminal
              usuario={usuario}
              onEstado={(abierta) => setBovedaAbierta(abierta)}
              onUnlock={() => {
                setTick((n) => n + 1);
                setPage('boveda');
              }}
            />
          )}
          {page === 'boveda' && <Boveda tick={tick} />}
        </main>
      </div>
    </ThemeProvider>
  );
}
