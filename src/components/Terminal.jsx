import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api } from '../api';
import AdminPanel from './AdminPanel.jsx';
import { MONO_FONT, TC } from '../constants/terminalTheme.js';

const AYUDA = [
  '> Comandos:',
  '  [pregunta]  — mostrar la pregunta activa',
  '  [admin]     — abrir panel de administración',
  '  [salir]     — cerrar panel admin',
];

// ── Terminal principal ─────────────────────────────────────────────────────

export default function Terminal({ usuario }) {
  const tc = TC[usuario] || TC.enrique;
  const mono = { fontFamily: MONO_FONT, color: tc.text };
  const [pregunta, setPregunta] = useState(null);
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('preguntas'); // 'preguntas' | 'admin'
  const endRef = useRef(null);

  const pushLog = (line) => setLogs((prev) => [...prev, line]);
  const pushLogs = (lines) => setLogs((prev) => [...prev, ...lines]);

  const cargarPreguntaActiva = async (append = false) => {
    const { data } = await api.get('/api/preguntas-mes/activa');
    setPregunta(data);
    let lineas;
    if (data.estado === 'carga') {
      lineas = [`⏳ ${data.mensaje}`];
    } else if (data.estado === 'sin_preguntas') {
      lineas = [`⚙ ${data.mensaje}`];
    } else if (data.estado === 'activa') {
      lineas = [`pregunta ${data.orden}/${data.totalPreguntas} (${data.respondidas} respondidas)`, data.pregunta];
    } else if (data.estado === 'desbloqueado' || data.estado === 'canjeado') {
      lineas = ['✓ Protocolo completado. Vale especial desbloqueado.'];
    } else if (data.estado === 'compensacion') {
      lineas = [`⚠ ${data.mensaje}`];
    } else if (data.estado === 'inutilizado') {
      lineas = [`✗ ${data.mensaje}`];
    } else {
      lineas = [data.mensaje || 'Estado desconocido.'];
    }
    if (append) pushLogs(lineas);
    else setLogs(['core-os login', 'protocolo de preguntas mensuales', ...AYUDA, '─'.repeat(40), ...lineas]);
  };

  useEffect(() => {
    let cancelado = false;
    cargarPreguntaActiva().catch(() => {
      if (!cancelado) setLogs(['core-os login', 'ERROR: núcleo fuera de línea.']);
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || loading) return;
    pushLog(`> ${texto}`);
    setInput('');

    if (texto === 'pregunta') {
      if (pregunta?.estado === 'activa') pushLog(pregunta.pregunta);
      else pushLog('No hay pregunta activa en este momento.');
      return;
    }
    if (texto === 'salir' || texto === 'exit') {
      setMode('preguntas');
      pushLog('[protocolo] Volviendo al modo preguntas.');
      return;
    }
    if (texto === 'ayuda' || texto === 'help') {
      pushLogs(AYUDA);
      return;
    }
    if (texto === 'admin') {
      setMode('admin');
      return;
    }

    if (mode === 'admin') return;

    // Si no hay pregunta activa
    if (!pregunta || pregunta.estado !== 'activa') {
      if (pregunta?.estado === 'carga') pushLog('⏳ Las preguntas abren el día 13.');
      else if (pregunta?.estado === 'desbloqueado')
        pushLog('✓ Protocolo completado. Vale especial listo en Nuestros Vales.');
      else if (pregunta?.estado === 'inutilizado') pushLog('✗ El plazo venció el día 18. Hasta el próximo mes.');
      else pushLog('Sin pregunta activa.');
      return;
    }

    // Responder pregunta activa
    setLoading(true);
    try {
      const { data } = await api.post('/api/preguntas-mes/responder', { respuesta: texto });
      if (data.completado) {
        pushLog(`✓ ${data.mensaje}`);
        await cargarPreguntaActiva(true);
      } else if (data.incorrecto) {
        pushLog(`✗ ${data.mensaje}`);
      } else {
        pushLog(data.mensaje);
        await cargarPreguntaActiva(true);
      }
    } catch {
      pushLog('ERROR: canal de validación caído.');
    } finally {
      setLoading(false);
    }
  };

  const inputActivo = !loading && mode === 'preguntas';

  const placeholder = !pregunta
    ? 'conectando…'
    : pregunta.estado === 'carga'
      ? 'preguntas disponibles el día 13…'
      : pregunta.estado === 'activa'
        ? 'escribe la respuesta o [pregunta] [admin]…'
        : pregunta.estado === 'desbloqueado'
          ? 'protocolo completo — escribe [admin]…'
          : 'escribe [admin] para gestionar…';

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>
        Acceso
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Terminal
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Seis preguntas del otro. Respóndelas del día 13 al 18 para desbloquear tu vale especial.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <Chip
          label={`modo: ${mode}`}
          size="small"
          sx={{ bgcolor: `${tc.border}18`, color: tc.text, fontFamily: MONO_FONT, fontSize: 11 }}
        />
        {pregunta?.estado === 'activa' && (
          <Chip
            label={`${pregunta.respondidas}/${pregunta.totalPreguntas} respondidas`}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      <Box sx={{ border: `1px solid ${tc.border}`, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ backgroundColor: tc.bg, p: 2, minHeight: 340, boxShadow: `inset 0 0 50px ${tc.glow}` }}>
          {logs.map((line, i) => (
            <Typography key={`${i}-${line}`} sx={{ ...mono, fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {line}
            </Typography>
          ))}
          <div ref={endRef} />
        </Box>
        {mode !== 'admin' && (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', gap: 1, p: 1.5, bgcolor: tc.bg, borderTop: `1px solid ${tc.border}40` }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              disabled={!inputActivo}
              InputProps={{
                sx: {
                  fontFamily: MONO_FONT,
                  fontSize: 13.5,
                  '& input': { color: tc.input },
                  '& fieldset': { borderColor: `${tc.border}60` },
                  '&:hover fieldset': { borderColor: tc.border },
                  '&.Mui-focused fieldset': { borderColor: tc.border },
                },
              }}
            />
            <Button
              type="submit"
              variant="outlined"
              disabled={!inputActivo}
              sx={{
                fontFamily: MONO_FONT,
                fontSize: 12,
                borderColor: `${tc.border}60`,
                color: tc.text,
                '&:hover': { borderColor: tc.border, bgcolor: `${tc.border}12` },
              }}
            >
              ENTER
            </Button>
          </Box>
        )}
      </Box>

      {mode === 'admin' && (
        <Box sx={{ mt: 2, border: `1px solid ${tc.border}30`, borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              bgcolor: tc.bg,
              borderBottom: `1px solid ${tc.border}30`,
            }}
          >
            <Typography sx={{ fontFamily: MONO_FONT, fontSize: 12, color: tc.adminTitle }}>
              ⚙ admin — {usuario}
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setMode('preguntas');
                pushLog('[admin] Panel cerrado.');
              }}
              sx={{
                fontFamily: MONO_FONT,
                fontSize: 11,
                color: tc.text,
                borderColor: `${tc.border}60`,
                '&:hover': { borderColor: tc.border },
              }}
              variant="outlined"
            >
              cerrar
            </Button>
          </Box>
          <Box sx={{ p: 2, bgcolor: tc.bg, maxHeight: 640, overflowY: 'auto' }}>
            <AdminPanel tc={tc} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
