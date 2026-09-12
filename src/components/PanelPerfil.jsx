import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { api } from '../api';

export const SESSION_KEY = 'coreos_usuario';

const STARS = [
  { x: 7, y: 12, s: 2.4, d: 0, dur: 4.2 },
  { x: 21, y: 6, s: 1.4, d: 1.1, dur: 5.0 },
  { x: 80, y: 9, s: 2.0, d: 2.3, dur: 3.8 },
  { x: 92, y: 25, s: 1.2, d: 0.5, dur: 4.6 },
  { x: 13, y: 36, s: 1.7, d: 3.1, dur: 3.5 },
  { x: 65, y: 19, s: 2.2, d: 1.7, dur: 4.9 },
  { x: 4, y: 60, s: 1.1, d: 0.8, dur: 5.3 },
  { x: 84, y: 52, s: 1.8, d: 2.9, dur: 4.1 },
  { x: 37, y: 4, s: 1.3, d: 1.4, dur: 4.7 },
  { x: 53, y: 16, s: 2.5, d: 0.2, dur: 3.6 },
  { x: 10, y: 82, s: 1.6, d: 2.0, dur: 5.1 },
  { x: 75, y: 76, s: 1.2, d: 3.5, dur: 4.4 },
  { x: 46, y: 90, s: 1.9, d: 0.7, dur: 3.9 },
  { x: 89, y: 87, s: 1.4, d: 1.9, dur: 4.8 },
  { x: 28, y: 68, s: 1.0, d: 3.8, dur: 5.4 },
  { x: 60, y: 62, s: 2.1, d: 1.3, dur: 3.7 },
  { x: 18, y: 50, s: 1.5, d: 2.6, dur: 4.3 },
  { x: 96, y: 44, s: 1.3, d: 0.4, dur: 5.2 },
];

function MoonSVG({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      overflow="hidden"
      style={{ animation: 'moon-shimmer 5s ease-in-out infinite', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="mg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f4e8" />
          <stop offset="50%" stopColor="#ddd0b0" />
          <stop offset="100%" stopColor="#b09a6a" />
        </linearGradient>
      </defs>
      <path d="M65 10C42 10 24 28 24 51C24 74 42 90 65 90C52 83 44 68 44 51C44 34 52 19 65 10Z" fill="url(#mg1)" />
      <circle cx="39" cy="50" r="5" fill="rgba(0,0,0,0.08)" />
      <circle cx="46" cy="66" r="3.2" fill="rgba(0,0,0,0.07)" />
      <circle cx="34" cy="64" r="2" fill="rgba(0,0,0,0.06)" />
      <circle cx="50" cy="40" r="1.8" fill="rgba(0,0,0,0.06)" />
      <ellipse cx="48" cy="24" rx="6" ry="11" fill="rgba(255,255,255,0.22)" transform="rotate(-18,48,24)" />
    </svg>
  );
}

function SunSVG({ size }) {
  const rays = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      overflow="hidden"
      style={{ animation: 'sun-shimmer 4s ease-in-out infinite', flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="sg1" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="50%" stopColor="#fdd835" />
          <stop offset="100%" stopColor="#e65100" />
        </radialGradient>
      </defs>
      <g style={{ transformOrigin: '50px 50px', animation: 'sun-spin 22s linear infinite' }}>
        {rays.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const inner = 28,
            len = i % 2 === 0 ? 14 : 9;
          return (
            <line
              key={i}
              x1={50 + inner * Math.cos(rad)}
              y1={50 + inner * Math.sin(rad)}
              x2={50 + (inner + len) * Math.cos(rad)}
              y2={50 + (inner + len) * Math.sin(rad)}
              stroke={i % 2 === 0 ? '#fbbf24' : '#fde68a'}
              strokeWidth={i % 2 === 0 ? 2.4 : 1.6}
              strokeLinecap="round"
              opacity="0.9"
            />
          );
        })}
      </g>
      <circle cx="50" cy="50" r="23" fill="url(#sg1)" />
      <circle cx="43" cy="46" r="3.2" fill="rgba(230,81,0,0.15)" />
      <circle cx="57" cy="55" r="2.1" fill="rgba(230,81,0,0.12)" />
      <ellipse cx="42" cy="39" rx="7" ry="11" fill="rgba(255,255,255,0.22)" transform="rotate(-22,42,39)" />
    </svg>
  );
}

export default function PanelPerfil({ config, activo, inactivo, onSelect, onAcceso, mobile }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [mostrar, setMostrar] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const errorId = `pwd-error-${config.id}`;

  const fallar = () => {
    setError(true);
    setShakeTrigger((n) => n + 1);
  };

  const intentar = async () => {
    if (!clave) return;
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.post('/api/auth/login', { clave, usuario: config.id });
      if (data.ok) {
        try {
          localStorage.setItem(SESSION_KEY, data.usuario);
          if (data.token) localStorage.setItem('coreos_token', data.token);
        } catch {
          /* sin localStorage la sesión no persiste, pero el login de esta carga sigue funcionando */
        }
        onAcceso(data.usuario);
      } else {
        fallar();
      }
    } catch {
      fallar();
    } finally {
      setLoading(false);
    }
  };

  const isLuna = config.id === 'karol';
  const svgSize = mobile ? 80 : 116;
  const bgLuna = 'radial-gradient(ellipse at 25% 20%, #1e1b4b 0%, #0f0c2e 55%, #05030f 100%)';
  const bgSol = 'radial-gradient(ellipse at 72% 18%, #fffbeb 0%, #fde68a 42%, #fb923c 78%, #ea580c 100%)';

  return (
    <Box
      onClick={!activo && !inactivo ? onSelect : undefined}
      role={!activo && !inactivo ? 'button' : undefined}
      tabIndex={!activo && !inactivo ? 0 : undefined}
      onKeyDown={
        !activo && !inactivo
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      sx={{
        flex: activo ? '2.6 1 0' : inactivo ? '0.38 1 0' : '1 1 0',
        minWidth: 0,
        minHeight: 0,
        background: isLuna ? bgLuna : bgSol,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: activo || inactivo ? 'default' : 'pointer',
        transition: 'flex 0.5s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {isLuna &&
        !inactivo &&
        STARS.map((st, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: st.s,
              height: st.s,
              borderRadius: '50%',
              bgcolor: '#fff',
              animation: `twinkle ${st.dur}s ease-in-out ${st.d}s infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

      {!isLuna && !inactivo && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to top, rgba(255,255,255,0.10), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: activo ? 1.5 : 0.8,
          px: 3,
          width: '100%',
          maxWidth: 300,
        }}
      >
        {!inactivo && (isLuna ? <MoonSVG size={svgSize} /> : <SunSVG size={svgSize} />)}

        {!inactivo && (
          <Typography
            sx={{
              color: isLuna ? '#e0d7f8' : '#7c2d12',
              fontWeight: 700,
              fontSize: activo ? (mobile ? '1.1rem' : '1.4rem') : mobile ? '0.9rem' : '1.05rem',
              transition: 'font-size 0.3s',
              letterSpacing: '0.1em',
            }}
          >
            {config.nombre}
          </Typography>
        )}

        {!inactivo && !activo && (
          <Typography
            sx={{
              color: isLuna ? 'rgba(224,215,248,0.4)' : 'rgba(124,45,18,0.5)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
            }}
          >
            toca para entrar
          </Typography>
        )}

        {activo && (
          <Box
            sx={{
              width: '100%',
              mt: 0.5,
              p: 2.5,
              borderRadius: 4,
              background: isLuna ? 'rgba(139,92,246,0.07)' : 'rgba(251,146,60,0.09)',
              border: `1px solid ${isLuna ? 'rgba(139,92,246,0.28)' : 'rgba(251,146,60,0.32)'}`,
              animation: 'form-in 0.35s ease-out, glow-pulse-panel 3.2s ease-in-out 0.35s infinite',
              '@keyframes glow-pulse-panel': {
                '0%,100%': {
                  boxShadow: isLuna ? '0 0 0 0 rgba(139,92,246,0.18)' : '0 0 0 0 rgba(251,146,60,0.2)',
                },
                '50%': {
                  boxShadow: isLuna ? '0 0 26px 6px rgba(139,92,246,0.22)' : '0 0 26px 6px rgba(251,146,60,0.24)',
                },
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'form-in 0.35s ease-out',
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              key={shakeTrigger}
              className={error ? 'panel-shake-wrap' : ''}
              sx={{ position: 'relative', animation: error ? 'panel-shake 0.4s ease-in-out' : 'none' }}
            >
              <LockOutlinedIcon
                sx={{
                  position: 'absolute',
                  left: 18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  fontSize: 20,
                  color: isLuna ? 'rgba(224,215,248,0.55)' : 'rgba(124,45,18,0.55)',
                  pointerEvents: 'none',
                }}
              />
              <input
                autoFocus
                type={mostrar ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Contraseña"
                value={clave}
                onChange={(e) => {
                  setClave(e.target.value);
                  setError(false);
                }}
                onKeyDown={(e) => {
                  if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'));
                  if (e.key === 'Enter') intentar();
                }}
                onKeyUp={(e) => e.getModifierState && setCapsLock(e.getModifierState('CapsLock'))}
                aria-invalid={error}
                aria-describedby={error ? errorId : undefined}
                className="panel-password-input"
                style={{
                  '--focus-ring': isLuna ? 'rgba(139,92,246,0.3)' : 'rgba(251,146,60,0.35)',
                  '--autofill-bg': isLuna ? 'rgb(40,32,72)' : 'rgb(255,247,235)',
                  '--autofill-text': isLuna ? '#f0ecff' : '#1c0700',
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '16px 48px 16px 50px',
                  borderRadius: 999,
                  border: error
                    ? '1.5px solid #f87171'
                    : `1.5px solid ${isLuna ? 'rgba(200,185,255,0.35)' : 'rgba(154,52,18,0.35)'}`,
                  background: isLuna ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(10px)',
                  color: isLuna ? '#f0ecff' : '#1c0700',
                  fontSize: '1.05rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <IconButton
                onClick={() => setMostrar((m) => !m)}
                aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                sx={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  color: isLuna ? 'rgba(224,215,248,0.55)' : 'rgba(124,45,18,0.55)',
                }}
              >
                {mostrar ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Box>
            {capsLock && !error && (
              <Typography sx={{ color: isLuna ? '#e0d7f8' : '#9a3412', fontSize: '0.72rem', mt: 0.5, textAlign: 'center' }}>
                Bloq Mayús activado
              </Typography>
            )}
            {error && (
              <Typography id={errorId} role="alert" sx={{ color: '#f87171', fontSize: '0.72rem', mt: 0.5, textAlign: 'center' }}>
                Contraseña incorrecta
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 1.8 }}>
              <Button
                size="small"
                onClick={onSelect}
                sx={{
                  color: isLuna ? '#c4b5fd' : '#9a3412',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  p: '2px 6px',
                  minWidth: 0,
                  flexShrink: 0,
                }}
              >
                ← Cambiar
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={intentar}
                disabled={loading || !clave}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: isLuna ? '#5b21b6' : '#c2410c',
                  borderRadius: 999,
                  py: 1.3,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.04em',
                  boxShadow: isLuna ? '0 4px 18px rgba(91,33,182,0.5)' : '0 4px 18px rgba(194,65,12,0.5)',
                  '&:hover': { bgcolor: isLuna ? '#4c1d95' : '#9a3412' },
                  '&.Mui-disabled': { bgcolor: isLuna ? '#5b21b640' : '#c2410c40' },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.55s ease',
                  },
                  '&:hover::after': { transform: 'translateX(100%)' },
                }}
              >
                {loading ? <CircularProgress size={16} thickness={5} sx={{ color: '#fff' }} /> : 'Entrar'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
