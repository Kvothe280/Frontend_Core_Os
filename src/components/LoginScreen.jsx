import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { api } from '../api';

export const SESSION_KEY = 'coreos_usuario';

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

const STARS = [
  {x:7,y:12,s:2.4,d:0,dur:4.2},{x:21,y:6,s:1.4,d:1.1,dur:5.0},
  {x:80,y:9,s:2.0,d:2.3,dur:3.8},{x:92,y:25,s:1.2,d:0.5,dur:4.6},
  {x:13,y:36,s:1.7,d:3.1,dur:3.5},{x:65,y:19,s:2.2,d:1.7,dur:4.9},
  {x:4,y:60,s:1.1,d:0.8,dur:5.3},{x:84,y:52,s:1.8,d:2.9,dur:4.1},
  {x:37,y:4,s:1.3,d:1.4,dur:4.7},{x:53,y:16,s:2.5,d:0.2,dur:3.6},
  {x:10,y:82,s:1.6,d:2.0,dur:5.1},{x:75,y:76,s:1.2,d:3.5,dur:4.4},
  {x:46,y:90,s:1.9,d:0.7,dur:3.9},{x:89,y:87,s:1.4,d:1.9,dur:4.8},
  {x:28,y:68,s:1.0,d:3.8,dur:5.4},{x:60,y:62,s:2.1,d:1.3,dur:3.7},
  {x:18,y:50,s:1.5,d:2.6,dur:4.3},{x:96,y:44,s:1.3,d:0.4,dur:5.2},
];

function MoonSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" overflow="hidden"
      style={{ animation:'moon-shimmer 5s ease-in-out infinite', flexShrink:0 }}>
      <defs>
        <linearGradient id="mg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f4e8"/>
          <stop offset="50%" stopColor="#ddd0b0"/>
          <stop offset="100%" stopColor="#b09a6a"/>
        </linearGradient>
      </defs>
      <path d="M65 10C42 10 24 28 24 51C24 74 42 90 65 90C52 83 44 68 44 51C44 34 52 19 65 10Z" fill="url(#mg1)"/>
      <circle cx="39" cy="50" r="5" fill="rgba(0,0,0,0.08)"/>
      <circle cx="46" cy="66" r="3.2" fill="rgba(0,0,0,0.07)"/>
      <circle cx="34" cy="64" r="2" fill="rgba(0,0,0,0.06)"/>
      <circle cx="50" cy="40" r="1.8" fill="rgba(0,0,0,0.06)"/>
      <ellipse cx="48" cy="24" rx="6" ry="11" fill="rgba(255,255,255,0.22)" transform="rotate(-18,48,24)"/>
    </svg>
  );
}

function SunSVG({ size }) {
  const rays = Array.from({length:16},(_,i)=>i*22.5);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" overflow="hidden"
      style={{ animation:'sun-shimmer 4s ease-in-out infinite', flexShrink:0 }}>
      <defs>
        <radialGradient id="sg1" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fffde7"/>
          <stop offset="50%" stopColor="#fdd835"/>
          <stop offset="100%" stopColor="#e65100"/>
        </radialGradient>
      </defs>
      <g style={{transformOrigin:'50px 50px', animation:'sun-spin 22s linear infinite'}}>
        {rays.map((deg,i) => {
          const rad = deg*Math.PI/180;
          const inner = 28, len = i%2===0 ? 14 : 9;
          return (
            <line key={i}
              x1={50+inner*Math.cos(rad)} y1={50+inner*Math.sin(rad)}
              x2={50+(inner+len)*Math.cos(rad)} y2={50+(inner+len)*Math.sin(rad)}
              stroke={i%2===0?'#fbbf24':'#fde68a'}
              strokeWidth={i%2===0?2.4:1.6} strokeLinecap="round" opacity="0.9"
            />
          );
        })}
      </g>
      <circle cx="50" cy="50" r="23" fill="url(#sg1)"/>
      <circle cx="43" cy="46" r="3.2" fill="rgba(230,81,0,0.15)"/>
      <circle cx="57" cy="55" r="2.1" fill="rgba(230,81,0,0.12)"/>
      <ellipse cx="42" cy="39" rx="7" ry="11" fill="rgba(255,255,255,0.22)" transform="rotate(-22,42,39)"/>
    </svg>
  );
}

function PanelPerfil({ config, activo, inactivo, onSelect, onAcceso, mobile }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const intentar = async () => {
    if (!clave) return;
    setLoading(true); setError(false);
    try {
      const { data } = await api.post('/api/auth/login', { clave, usuario: config.id });
      if (data.ok) {
        try {
          localStorage.setItem(SESSION_KEY, data.usuario);
          if (data.token) localStorage.setItem('coreos_token', data.token);
        } catch {}
        onAcceso(data.usuario);
      } else { setError(true); }
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  const isLuna = config.id === 'karol';
  const svgSize = mobile ? 80 : 116;
  const bgLuna = 'radial-gradient(ellipse at 25% 20%, #1e1b4b 0%, #0f0c2e 55%, #05030f 100%)';
  const bgSol  = 'radial-gradient(ellipse at 72% 18%, #fffbeb 0%, #fde68a 42%, #fb923c 78%, #ea580c 100%)';

  return (
    <Box
      onClick={!activo && !inactivo ? onSelect : undefined}
      sx={{
        flex: activo ? '2.6 1 0' : inactivo ? '0.38 1 0' : '1 1 0',
        minWidth:0, minHeight:0,
        background: isLuna ? bgLuna : bgSol,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        cursor: activo||inactivo ? 'default' : 'pointer',
        transition:'flex 0.5s cubic-bezier(0.4,0,0.2,1)',
        overflow:'hidden', position:'relative', userSelect:'none',
      }}
    >
      {isLuna && !inactivo && STARS.map((st,i) => (
        <Box key={i} sx={{
          position:'absolute', left:`${st.x}%`, top:`${st.y}%`,
          width:st.s, height:st.s, borderRadius:'50%', bgcolor:'#fff',
          animation:`twinkle ${st.dur}s ease-in-out ${st.d}s infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {!isLuna && !inactivo && (
        <Box sx={{ position:'absolute', bottom:0, left:0, right:0, height:'30%',
          background:'linear-gradient(to top, rgba(255,255,255,0.10), transparent)',
          pointerEvents:'none' }}/>
      )}

      <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center',
        gap: activo ? 1.5 : 0.8, px:3, width:'100%', maxWidth:300 }}>

        {!inactivo && (isLuna ? <MoonSVG size={svgSize}/> : <SunSVG size={svgSize}/>)}

        {!inactivo && (
          <Typography sx={{
            color: isLuna ? '#e0d7f8' : '#7c2d12',
            fontWeight:700,
            fontSize: activo ? (mobile?'1.1rem':'1.4rem') : (mobile?'0.9rem':'1.05rem'),
            transition:'font-size 0.3s',
            letterSpacing:'0.1em',
          }}>
            {config.nombre}
          </Typography>
        )}

        {!inactivo && !activo && (
          <Typography sx={{
            color: isLuna ? 'rgba(224,215,248,0.4)' : 'rgba(124,45,18,0.5)',
            fontSize:'0.7rem', letterSpacing:'0.06em',
          }}>
            toca para entrar
          </Typography>
        )}

        {activo && (
          <Box sx={{ width:'100%', mt:0.5, animation:'form-in 0.35s ease-out' }}
            onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              type="password"
              placeholder="Contraseña"
              value={clave}
              onChange={(e) => { setClave(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === 'Enter' && intentar()}
              style={{
                width:'100%', boxSizing:'border-box',
                padding:'11px 16px', borderRadius:12,
                border: error
                  ? '1.5px solid #f87171'
                  : `1.5px solid ${isLuna?'rgba(200,185,255,0.3)':'rgba(154,52,18,0.3)'}`,
                background: isLuna ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)',
                backdropFilter:'blur(10px)',
                color: isLuna ? '#f0ecff' : '#1c0700',
                fontSize:'1rem', outline:'none', fontFamily:'inherit',
              }}
            />
            {error && (
              <Typography sx={{ color:'#f87171', fontSize:'0.72rem', mt:0.5, textAlign:'center' }}>
                Contraseña incorrecta
              </Typography>
            )}
            <Box sx={{ display:'flex', alignItems:'center', gap:1, mt:1.5 }}>
              <Button size="small" onClick={onSelect} sx={{
                color: isLuna ? '#c4b5fd' : '#9a3412',
                fontSize:'0.75rem', textTransform:'none', whiteSpace:'nowrap',
                p:'2px 6px', minWidth:0, flexShrink:0,
              }}>
                ← Cambiar
              </Button>
              <Button variant="contained" fullWidth onClick={intentar}
                disabled={loading||!clave}
                sx={{
                  bgcolor: isLuna ? '#5b21b6' : '#c2410c',
                  borderRadius:2.5, textTransform:'none', fontWeight:700,
                  letterSpacing:'0.04em',
                  boxShadow: isLuna?'0 4px 18px rgba(91,33,182,0.5)':'0 4px 18px rgba(194,65,12,0.5)',
                  '&:hover':{ bgcolor: isLuna?'#4c1d95':'#9a3412' },
                  '&.Mui-disabled':{ bgcolor: isLuna?'#5b21b640':'#c2410c40' },
                }}>
                {loading ? '···' : 'Entrar'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function LoginScreen({ onAcceso }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activo, setActivo] = useState(null);

  return (
    <>
      <style>{LOGIN_STYLES}</style>
      <Box sx={{ minHeight:'100dvh', display:'flex', flexDirection: mobile?'column':'row' }}>
        <PanelPerfil
          config={{ id:'karol', nombre:'Karol' }}
          activo={activo === 'karol'}
          inactivo={activo === 'enrique'}
          onSelect={() => setActivo(activo==='karol'?null:'karol')}
          onAcceso={onAcceso}
          mobile={mobile}
        />
        <PanelPerfil
          config={{ id:'enrique', nombre:'Enrique' }}
          activo={activo === 'enrique'}
          inactivo={activo === 'karol'}
          onSelect={() => setActivo(activo==='enrique'?null:'enrique')}
          onAcceso={onAcceso}
          mobile={mobile}
        />
      </Box>
    </>
  );
}
