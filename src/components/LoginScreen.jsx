import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import PanelPerfil, { SESSION_KEY } from './PanelPerfil.jsx';

export { SESSION_KEY };

const LOGIN_STYLES = `
  @keyframes twinkle {
    0%,100%{ opacity:0.12 }
    50%{ opacity:0.8 }
  }
  @keyframes sun-spin {
    from{ transform:rotate(0deg) }
    to{ transform:rotate(360deg) }
  }
  @keyframes moon-shimmer {
    0%,100%{ filter:drop-shadow(0 0 18px rgba(220,210,255,0.25)) }
    50%{ filter:drop-shadow(0 0 38px rgba(220,210,255,0.55)) }
  }
  @keyframes sun-shimmer {
    0%,100%{ filter:drop-shadow(0 0 18px rgba(253,186,116,0.3)) }
    50%{ filter:drop-shadow(0 0 40px rgba(253,186,116,0.7)) }
  }
  @keyframes form-in {
    from{ opacity:0; transform:translateY(12px) }
    to{ opacity:1; transform:translateY(0) }
  }
`;

export default function LoginScreen({ onAcceso }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activo, setActivo] = useState(null);

  return (
    <>
      <style>{LOGIN_STYLES}</style>
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: mobile ? 'column' : 'row' }}>
        <PanelPerfil
          config={{ id: 'karol', nombre: 'Karol' }}
          activo={activo === 'karol'}
          inactivo={activo === 'enrique'}
          onSelect={() => setActivo(activo === 'karol' ? null : 'karol')}
          onAcceso={onAcceso}
          mobile={mobile}
        />
        <PanelPerfil
          config={{ id: 'enrique', nombre: 'Enrique' }}
          activo={activo === 'enrique'}
          inactivo={activo === 'karol'}
          onSelect={() => setActivo(activo === 'enrique' ? null : 'enrique')}
          onAcceso={onAcceso}
          mobile={mobile}
        />
      </Box>
    </>
  );
}
