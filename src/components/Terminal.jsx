import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api';

const MONO_FONT = '"IBM Plex Mono", "Courier New", monospace';

const TC = {
  enrique: {
    bg: '#0B0A12',
    text: '#A8B4F0',
    input: '#C4CAFE',
    border: '#3E4B8E',
    glow: 'rgba(62, 75, 142, 0.22)',
    adminTitle: '#A8B4F0',
  },
  karol: {
    bg: '#120A05',
    text: '#F4C896',
    input: '#FAD9B6',
    border: '#DF6D41',
    glow: 'rgba(223, 109, 65, 0.18)',
    adminTitle: '#DF6D41',
  },
};

const AYUDA = [
  '> Comandos:',
  '  [pregunta]  — mostrar la pregunta activa',
  '  [admin]     — abrir panel de administración',
  '  [salir]     — cerrar panel admin',
];

// ── Panel de administración ────────────────────────────────────────────────

function PanelAdmin({ usuario }) {
  const theme = useTheme();
  const [preguntas, setPreguntas] = useState([]);
  const [poolEspecial, setPoolEspecial] = useState([]);
  const [poolMensual, setPoolMensual] = useState([]);
  const [nuevaP, setNuevaP] = useState({ pregunta: '', respuesta: '' });
  const [nuevoE, setNuevoE] = useState({ titulo: '', descripcion: '' });
  const [nuevoM, setNuevoM] = useState({ titulo: '', descripcion: '' });
  const [error, setError] = useState('');
  const [diaActual, setDiaActual] = useState(new Date().getDate());

  const cargar = () => Promise.all([
    api.get('/api/preguntas-mes').then(({ data }) => setPreguntas(data)),
    api.get('/api/vale-especial-pool').then(({ data }) => setPoolEspecial(data)),
    api.get('/api/vale-pool').then(({ data }) => setPoolMensual(data)),
  ]);

  useEffect(() => { cargar(); }, []);

  const agregarPregunta = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/preguntas-mes', nuevaP);
      setNuevaP({ pregunta: '', respuesta: '' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar pregunta.');
    }
  };

  const borrarPregunta = async (id) => {
    try { await api.delete(`/api/preguntas-mes/${id}`); cargar(); }
    catch (err) { setError(err.response?.data?.error || 'No se pudo borrar.'); }
  };

  const agregarEspecial = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/vale-especial-pool', nuevoE);
      setNuevoE({ titulo: '', descripcion: '' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar en el pool especial.');
    }
  };

  const borrarEspecial = async (id) => {
    try { await api.delete(`/api/vale-especial-pool/${id}`); cargar(); }
    catch (err) { setError(err.response?.data?.error || 'No se pudo borrar.'); }
  };

  const agregarMensual = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/vale-pool', nuevoM);
      setNuevoM({ titulo: '', descripcion: '' });
      cargar();
    } catch { setError('Error al guardar en el pool mensual.'); }
  };

  const borrarMensual = async (id) => {
    try { await api.delete(`/api/vale-pool/${id}`); cargar(); }
    catch { setError('No se pudo borrar del pool mensual.'); }
  };

  const puedeCargar = diaActual <= 12;

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ── Mis preguntas del mes ── */}
      <Typography variant="h6" sx={{ mb: 0.5 }}>Mis preguntas del mes ({preguntas.length}/6)</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Las que escribes para que el otro las responda.
        Período de carga: días 1–12. Solo tú puedes ver estas preguntas y sus respuestas.
      </Typography>

      {preguntas.map((p, i) => (
        <Card key={p._id} sx={{ p: 1.5, mb: 1, border: `1px solid ${theme.palette.primary.main}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Pregunta {i + 1}</Typography>
            <Typography variant="body2">{p.pregunta}</Typography>
            <Typography variant="caption" color="text.secondary">Respuesta: {p.respuesta}</Typography>
            {p.respondida && <Chip label="respondida" size="small" color="success" sx={{ ml: 1 }} />}
          </Box>
          {!p.respondida && puedeCargar && (
            <IconButton size="small" onClick={() => borrarPregunta(p._id)} sx={{ flexShrink: 0, ml: 1 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Card>
      ))}

      {preguntas.length < 6 && puedeCargar && (
        <Card sx={{ p: 2, mb: 4, border: '1px dashed rgba(111,78,55,0.3)' }} component="form" onSubmit={agregarPregunta}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Agregar pregunta {preguntas.length + 1}/6</Typography>
          <TextField size="small" label="Pregunta" fullWidth sx={{ mb: 1 }} required value={nuevaP.pregunta}
            onChange={(e) => setNuevaP((p) => ({ ...p, pregunta: e.target.value }))} />
          <TextField size="small" label="Respuesta (sin acentos — se normaliza)" fullWidth sx={{ mb: 1.5 }} required value={nuevaP.respuesta}
            onChange={(e) => setNuevaP((p) => ({ ...p, respuesta: e.target.value }))} />
          <Button type="submit" size="small" variant="outlined">Agregar</Button>
        </Card>
      )}

      {preguntas.length < 6 && !puedeCargar && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          El período de carga cerró el día 12. Faltan {6 - preguntas.length} preguntas —
          esto generará una penalización para el otro.
        </Typography>
      )}

      {/* ── Mi pool de premios especiales ── */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 0.5 }}>Mi pool de premios especiales ({poolEspecial.length})</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Premios que le darás al otro cuando complete las preguntas. Solo tú los ves hasta que el
        protocolo se completa. El sistema elige uno al azar cada mes (3 meses de pausa antes de repetir).
      </Typography>

      {poolEspecial.map((v) => (
        <Card key={v._id} sx={{ p: 1.5, mb: 1, border: `1px solid ${theme.palette.primary.main}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.titulo}</Typography>
            {v.descripcion && <Typography variant="caption" color="text.secondary">{v.descripcion}</Typography>}
            {v.usadoEnPeriodos?.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Usado en: {v.usadoEnPeriodos.slice(-3).join(', ')}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => borrarEspecial(v._id)} sx={{ flexShrink: 0, ml: 1 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Card>
      ))}

      <Card sx={{ p: 2, mt: 1, mb: 4, border: '1px dashed rgba(111,78,55,0.3)' }} component="form" onSubmit={agregarEspecial}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Agregar premio especial</Typography>
        <TextField size="small" label="Título" fullWidth sx={{ mb: 1 }} required value={nuevoE.titulo}
          onChange={(e) => setNuevoE((p) => ({ ...p, titulo: e.target.value }))} />
        <TextField size="small" label="Descripción (opcional)" fullWidth sx={{ mb: 1.5 }} value={nuevoE.descripcion}
          onChange={(e) => setNuevoE((p) => ({ ...p, descripcion: e.target.value }))} />
        <Button type="submit" size="small" variant="outlined">Agregar al pool</Button>
      </Card>

      {/* ── Pool de vales mensuales (compartida) ── */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 0.5 }}>Pool de vales mensuales ({poolMensual.length})</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Vales compartidos del sorteo mensual. No se repiten en meses consecutivos.
      </Typography>

      {poolMensual.map((v) => (
        <Card key={v._id} sx={{ p: 1.5, mb: 1, border: `1px solid ${theme.palette.primary.main}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.titulo}</Typography>
            {v.descripcion && <Typography variant="caption" color="text.secondary">{v.descripcion}</Typography>}
          </Box>
          <IconButton size="small" onClick={() => borrarMensual(v._id)} sx={{ flexShrink: 0, ml: 1 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Card>
      ))}

      <Card sx={{ p: 2, mt: 1, border: '1px dashed rgba(111,78,55,0.3)' }} component="form" onSubmit={agregarMensual}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Agregar vale mensual al pool</Typography>
        <TextField size="small" label="Título" fullWidth sx={{ mb: 1 }} required value={nuevoM.titulo}
          onChange={(e) => setNuevoM((p) => ({ ...p, titulo: e.target.value }))} />
        <TextField size="small" label="Descripción (opcional)" fullWidth sx={{ mb: 1.5 }} value={nuevoM.descripcion}
          onChange={(e) => setNuevoM((p) => ({ ...p, descripcion: e.target.value }))} />
        <Button type="submit" size="small" variant="outlined">Agregar al pool</Button>
      </Card>
    </Box>
  );
}

// ── Terminal principal ─────────────────────────────────────────────────────

export default function Terminal({ usuario }) {
  const theme = useTheme();
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
    return () => { cancelado = true; };
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
      else if (pregunta?.estado === 'desbloqueado') pushLog('✓ Protocolo completado. Vale especial listo en Nuestros Vales.');
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

  const placeholder = !pregunta ? 'conectando…'
    : pregunta.estado === 'carga' ? 'preguntas disponibles el día 13…'
    : pregunta.estado === 'activa' ? 'escribe la respuesta o [pregunta] [admin]…'
    : pregunta.estado === 'desbloqueado' ? 'protocolo completo — escribe [admin]…'
    : 'escribe [admin] para gestionar…';

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>Acceso</Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>Terminal</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Seis preguntas del otro. Respóndelas del día 13 al 18 para desbloquear tu vale especial.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <Chip label={`modo: ${mode}`} size="small" sx={{ bgcolor: `${tc.border}18`, color: tc.text, fontFamily: MONO_FONT, fontSize: 11 }} />
        {pregunta?.estado === 'activa' && (
          <Chip label={`${pregunta.respondidas}/${pregunta.totalPreguntas} respondidas`} size="small" variant="outlined" />
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
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, p: 1.5, bgcolor: tc.bg, borderTop: `1px solid ${tc.border}40` }}>
            <TextField
              fullWidth size="small" placeholder={placeholder} value={input}
              onChange={(e) => setInput(e.target.value)} autoComplete="off" disabled={!inputActivo}
              InputProps={{ sx: { fontFamily: MONO_FONT, fontSize: 13.5, '& input': { color: tc.input }, '& fieldset': { borderColor: `${tc.border}60` }, '&:hover fieldset': { borderColor: tc.border }, '&.Mui-focused fieldset': { borderColor: tc.border } } }}
            />
            <Button type="submit" variant="outlined" disabled={!inputActivo}
              sx={{ fontFamily: MONO_FONT, fontSize: 12, borderColor: `${tc.border}60`, color: tc.text, '&:hover': { borderColor: tc.border, bgcolor: `${tc.border}12` } }}>
              ENTER
            </Button>
          </Box>
        )}
      </Box>

      {mode === 'admin' && (
        <Box sx={{ mt: 2, border: `1px solid ${tc.border}30`, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: tc.bg, borderBottom: `1px solid ${tc.border}30` }}>
            <Typography sx={{ fontFamily: MONO_FONT, fontSize: 12, color: tc.adminTitle }}>
              ⚙ admin — {usuario}
            </Typography>
            <Button size="small" onClick={() => { setMode('preguntas'); pushLog('[admin] Panel cerrado.'); }}
              sx={{ fontFamily: MONO_FONT, fontSize: 11, color: tc.text, borderColor: `${tc.border}60`, '&:hover': { borderColor: tc.border } }}
              variant="outlined">
              cerrar
            </Button>
          </Box>
          <Box sx={{ p: 2, bgcolor: theme.palette.background.paper, maxHeight: 640, overflowY: 'auto' }}>
            <PanelAdmin usuario={usuario} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
