import { useEffect, useRef, useState } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import { api } from '../api';

const mono = { fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: '#7CFF9A' };

const AYUDA = [
  '> Comandos disponibles:',
  '  [1] responder  — ingresar clave del enigma actual',
  '  [2] cifrado    — modo vale cifrado del mes',
  '  [3] pregunta   — mostrar pregunta actual de nuevo',
  '  [admin]        — panel de administración',
  '  [salir]        — volver al modo enigma',
];

// ── Panel de administración (enigmas + preguntas cifrado) ──────────────────

function PanelAdmin() {
  const [enigmas, setEnigmas] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [editEnigma, setEditEnigma] = useState(null);
  const [nuevoE, setNuevoE] = useState({ pregunta: '', respuesta: '' });
  const [editPregunta, setEditPregunta] = useState(null);
  const [nuevoP, setNuevoP] = useState({ pregunta: '', respuesta: '' });
  const [error, setError] = useState('');

  const cargar = () => Promise.all([
    api.get('/api/enigmas').then(({ data }) => setEnigmas(data)),
    api.get('/api/preguntas-cifrado').then(({ data }) => setPreguntas(data)),
  ]);

  useEffect(() => { cargar(); }, []);

  const agregarEnigma = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/enigmas', nuevoE);
      setNuevoE({ pregunta: '', respuesta: '' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar enigma.');
    }
  };

  const guardarEnigma = async (en) => {
    try {
      await api.put(`/api/enigmas/${en._id}`, { pregunta: en.pregunta, respuesta: en.respuesta });
      setEditEnigma(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar.');
    }
  };

  const eliminarEnigma = async (id) => {
    try {
      await api.delete(`/api/enigmas/${id}`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo borrar.');
    }
  };

  const agregarPregunta = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/preguntas-cifrado', { ...nuevoP, orden: preguntas.length + 1 });
      setNuevoP({ pregunta: '', respuesta: '' });
      cargar();
    } catch {
      setError('Error al guardar pregunta.');
    }
  };

  const guardarPregunta = async (p) => {
    try {
      await api.put(`/api/preguntas-cifrado/${p._id}`, { pregunta: p.pregunta, respuesta: p.respuesta, orden: p.orden });
      setEditPregunta(null);
      cargar();
    } catch {
      setError('Error al actualizar pregunta.');
    }
  };

  const eliminarPregunta = async (id) => {
    try {
      await api.delete(`/api/preguntas-cifrado/${id}`);
      cargar();
    } catch {
      setError('No se pudo borrar.');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Enigmas del mes */}
      <Typography variant="h6" sx={{ mb: 0.5 }}>Enigmas del mes ({enigmas.length}/6)</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Deben estar los 6 antes del día 15. No se pueden reutilizar respuestas de meses anteriores.
      </Typography>

      {enigmas.map((en, i) => (
        <Card key={en._id} sx={{ p: 2, mb: 1.5, border: '1px solid rgba(111,78,55,0.14)' }}>
          {editEnigma === en._id ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField size="small" label="Pregunta" fullWidth value={en.pregunta}
                onChange={(e) => setEnigmas((prev) => prev.map((x) => x._id === en._id ? { ...x, pregunta: e.target.value } : x))} />
              <TextField size="small" label="Respuesta (clave)" fullWidth value={en.respuesta}
                onChange={(e) => setEnigmas((prev) => prev.map((x) => x._id === en._id ? { ...x, respuesta: e.target.value } : x))} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={() => guardarEnigma(en)}>Guardar</Button>
                <Button size="small" onClick={() => { setEditEnigma(null); cargar(); }}>Cancelar</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Enigma {i + 1}</Typography>
                  {en.resuelto && <Chip label="resuelto" size="small" color="success" />}
                </Box>
                <Typography variant="body2">{en.pregunta || '(sin pregunta)'}</Typography>
                <Typography variant="caption" color="text.secondary">Clave: {en.respuesta}</Typography>
              </Box>
              {!en.resuelto && (
                <Box>
                  <IconButton size="small" onClick={() => setEditEnigma(en._id)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => eliminarEnigma(en._id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              )}
            </Box>
          )}
        </Card>
      ))}

      {enigmas.length < 6 && (
        <Card sx={{ p: 2, mb: 4, border: '1px dashed rgba(111,78,55,0.3)' }} component="form" onSubmit={agregarEnigma}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Agregar enigma {enigmas.length + 1}/6</Typography>
          <TextField size="small" label="Pregunta" fullWidth sx={{ mb: 1 }} required value={nuevoE.pregunta}
            onChange={(e) => setNuevoE((p) => ({ ...p, pregunta: e.target.value }))} />
          <TextField size="small" label="Respuesta (clave)" fullWidth sx={{ mb: 1.5 }} required value={nuevoE.respuesta}
            onChange={(e) => setNuevoE((p) => ({ ...p, respuesta: e.target.value }))} />
          <Button type="submit" size="small" variant="outlined">Agregar</Button>
        </Card>
      )}

      {/* Preguntas vale cifrado */}
      <Typography variant="h6" sx={{ mb: 0.5 }}>Preguntas del vale cifrado ({preguntas.length}/5)</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Karol debe responderlas todas para desbloquear el vale cifrado del mes.
      </Typography>

      {preguntas.map((p, i) => (
        <Card key={p._id} sx={{ p: 2, mb: 1.5, border: '1px solid rgba(111,78,55,0.14)' }}>
          {editPregunta === p._id ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField size="small" label="Pregunta" fullWidth value={p.pregunta}
                onChange={(e) => setPreguntas((prev) => prev.map((x) => x._id === p._id ? { ...x, pregunta: e.target.value } : x))} />
              <TextField size="small" label="Respuesta" fullWidth value={p.respuesta}
                onChange={(e) => setPreguntas((prev) => prev.map((x) => x._id === p._id ? { ...x, respuesta: e.target.value } : x))} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={() => guardarPregunta(p)}>Guardar</Button>
                <Button size="small" onClick={() => { setEditPregunta(null); cargar(); }}>Cancelar</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{i + 1}. {p.pregunta}</Typography>
                <Typography variant="caption" color="text.secondary">Respuesta: {p.respuesta}</Typography>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => setEditPregunta(p._id)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => eliminarPregunta(p._id)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
          )}
        </Card>
      ))}

      <Card sx={{ p: 2, border: '1px dashed rgba(111,78,55,0.3)' }} component="form" onSubmit={agregarPregunta}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Agregar pregunta {preguntas.length + 1}</Typography>
        <TextField size="small" label="Pregunta" fullWidth sx={{ mb: 1 }} required value={nuevoP.pregunta}
          onChange={(e) => setNuevoP((p) => ({ ...p, pregunta: e.target.value }))} />
        <TextField size="small" label="Respuesta" fullWidth sx={{ mb: 1.5 }} required value={nuevoP.respuesta}
          onChange={(e) => setNuevoP((p) => ({ ...p, respuesta: e.target.value }))} />
        <Button type="submit" size="small" variant="outlined">Agregar</Button>
      </Card>
    </Box>
  );
}

// ── Terminal principal ─────────────────────────────────────────────────────

export default function Terminal({ usuario, onEstado, onUnlock }) {
  const [enigma, setEnigma] = useState(null);
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [decrypt, setDecrypt] = useState(null);
  const [mode, setMode] = useState('enigma'); // 'enigma' | 'cifrado' | 'admin'
  const [cifradoState, setCifradoState] = useState(null); // { preguntas, respuestas, index }
  const endRef = useRef(null);

  const pushLog = (line) => setLogs((prev) => [...prev, line]);
  const pushLogs = (lines) => setLogs((prev) => [...prev, ...lines]);

  const cargarEnigma = async (append = false) => {
    const { data } = await api.get('/api/enigmas/activo');
    setEnigma(data);
    onEstado?.(data.bovedaAbierta);
    let lineas;
    if (data.bloqueado) {
      lineas = ['⛔ ' + data.mensaje];
    } else if (data.pendienteConfiguracion) {
      lineas = ['⚙  ' + data.mensaje];
    } else if (data.activo) {
      lineas = [`enigma ${data.orden}/6`, data.pregunta];
    } else {
      lineas = [data.mensaje];
    }
    if (append) pushLogs(lineas);
    else setLogs(['core-os login', 'iniciando protocolo de 6 capas…', ...AYUDA, '─'.repeat(40), ...lineas]);
  };

  useEffect(() => {
    let cancelado = false;
    api.get('/api/enigmas/activo').then(({ data }) => {
      if (cancelado) return;
      setEnigma(data);
      onEstado?.(data.bovedaAbierta);
      let lineas;
      if (data.bloqueado) lineas = ['⛔ ' + data.mensaje];
      else if (data.pendienteConfiguracion) lineas = ['⚙  ' + data.mensaje];
      else if (data.activo) lineas = [`enigma ${data.orden}/6`, data.pregunta];
      else lineas = [data.mensaje];
      setLogs(['core-os login', 'iniciando protocolo de 6 capas…', ...AYUDA, '─'.repeat(40), ...lineas]);
    }).catch(() => setLogs(['core-os login', 'ERROR: núcleo fuera de línea.']));
    return () => { cancelado = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const entrarCifrado = async () => {
    setMode('cifrado');
    const { data } = await api.get('/api/vale-cifrado');
    if (data.desbloqueado) {
      pushLogs(['[cifrado] Vale ya desbloqueado este mes.', `Recompensa: ${data.recompensa}`]);
      setMode('enigma');
      return;
    }
    if (!data.preguntas || data.preguntas.length === 0) {
      pushLogs(['[cifrado] No hay preguntas configuradas todavía.']);
      setMode('enigma');
      return;
    }
    setCifradoState({ preguntas: data.preguntas, respuestas: {}, index: 0 });
    pushLogs(['[cifrado] Modo vale cifrado activado.', `[cifrado] ${data.preguntas[0].pregunta}`]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || loading) return;
    pushLog(`> ${texto}`);
    setInput('');

    // Comandos globales
    if (texto === '1') {
      if (enigma?.activo) pushLog(enigma.pregunta);
      else pushLog('No hay enigma activo.');
      return;
    }
    if (texto === '2') { await entrarCifrado(); return; }
    if (texto === '3' || texto === 'pregunta') {
      if (enigma?.activo) pushLog(enigma.pregunta);
      else pushLog('No hay enigma activo.');
      return;
    }
    if (texto === 'salir' || texto === 'exit') {
      setMode('enigma');
      setCifradoState(null);
      pushLog('[enigma] Volviendo al protocolo de enigmas.');
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

    // Enigma sin cargar — informar sin llamar al backend
    if (mode === 'enigma' && !enigma?.activo) {
      if (enigma?.bloqueado) pushLog('⛔ Terminal bloqueada. Usa [admin] para gestionar o [2] para el vale cifrado.');
      else if (enigma?.pendienteConfiguracion) pushLog('⚙ Aún no hay enigmas cargados. Usa [admin] para agregarlos.');
      else pushLog('Protocolo completo. La Bóveda está abierta.');
      return;
    }

    // Modo cifrado
    if (mode === 'cifrado' && cifradoState) {
      const { preguntas, respuestas, index } = cifradoState;
      const preguntaActual = preguntas[index];
      const nuevasRespuestas = { ...respuestas, [preguntaActual.id]: texto };

      if (index < preguntas.length - 1) {
        const siguiente = preguntas[index + 1];
        setCifradoState({ preguntas, respuestas: nuevasRespuestas, index: index + 1 });
        pushLog(`[cifrado] ${siguiente.pregunta}`);
      } else {
        // Todas respondidas — enviar
        setLoading(true);
        try {
          const { data } = await api.post('/api/vale-cifrado/intentar', { respuestas: nuevasRespuestas });
          if (data.ok) {
            pushLogs(['[cifrado] ✓ Protocolo cifrado completado.', `[cifrado] Recompensa: ${data.recompensa}`]);
          } else {
            const n = data.incorrectas?.length || 0;
            pushLog(`[cifrado] ✗ ${n} respuesta${n !== 1 ? 's' : ''} incorrecta${n !== 1 ? 's' : ''}. Inténtalo de nuevo con [2].`);
          }
        } catch {
          pushLog('[cifrado] ERROR: canal de validación caído.');
        } finally {
          setLoading(false);
          setMode('enigma');
          setCifradoState(null);
        }
      }
      return;
    }

    // Modo enigma — validar respuesta
    setLoading(true);
    try {
      const { data } = await api.post('/api/terminal/validar', { respuesta: texto });
      if (data.ok && data.desencriptando) {
        setDecrypt(data);
        await new Promise((r) => setTimeout(r, 2500));
        setDecrypt(null);
        pushLog(data.mensaje);
        onEstado?.(data.bovedaAbierta);
        if (data.bovedaAbierta) {
          onUnlock?.();
        } else {
          await cargarEnigma(true);
        }
      } else {
        pushLog(data.mensaje);
      }
    } catch {
      pushLog('ERROR: canal de validación caído.');
    } finally {
      setLoading(false);
    }
  };

  const inputActivo = !loading && (
    mode === 'admin' ||
    mode === 'enigma' ||
    (mode === 'cifrado' && cifradoState !== null)
  );

  const placeholder = mode === 'admin'
    ? 'escribe "salir" para volver al protocolo…'
    : mode === 'cifrado'
    ? 'escribe tu respuesta…'
    : !enigma ? 'conectando…'
    : enigma.bloqueado ? 'bloqueado — escribe [admin] o [2]…'
    : enigma.pendienteConfiguracion ? 'escribe [admin] para configurar enigmas…'
    : enigma.activo ? 'escribe [1] [2] [admin] o la clave…'
    : 'protocolo completo — escribe [2] o [admin]…';

  return (
    <Box>
      {decrypt && (
        <div className="decrypt-overlay">
          <div className="decrypt-box">
            <div>DESENCRIPTANDO ARCHIVO…</div>
            <div style={{ marginTop: 8, opacity: 0.8 }}>{decrypt.mensaje}</div>
            <div className="decrypt-bar"><span /></div>
          </div>
        </div>
      )}

      <Typography variant="overline" sx={{ color: 'primary.main' }}>Acceso</Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>Terminal de enigmas</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Seis claves. Una por mes. La Bóveda no abre hasta completar el protocolo.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <Chip label={`modo: ${mode}`} size="small" sx={{ bgcolor: mode === 'cifrado' ? 'primary.main' : '#ebe2d6', color: mode === 'cifrado' ? '#fff' : 'primary.main' }} />
        {enigma && !enigma.bloqueado && !enigma.pendienteConfiguracion && (
          <Chip label={`${enigma.enigmasResueltos ?? 0}/6 enigmas`} size="small" variant="outlined" />
        )}
      </Box>

      <Box sx={{ border: '1px solid #2f7a45', borderRadius: 2, overflow: 'hidden' }}>
        {mode === 'admin' ? (
          <Box sx={{ bgcolor: '#fff', p: 2, maxHeight: 520, overflowY: 'auto' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#2f7a45' }}>
              ⚙ Panel de administración — {usuario}
            </Typography>
            <PanelAdmin />
          </Box>
        ) : (
          <Box sx={{ backgroundColor: '#070807', p: 2, minHeight: 380, boxShadow: 'inset 0 0 40px rgba(0, 40, 12, 0.45)' }}>
            {logs.map((line, i) => (
              <Typography key={`${i}-${line}`} sx={{ ...mono, fontSize: 14, whiteSpace: 'pre-wrap' }}>
                {line}
              </Typography>
            ))}
            <div ref={endRef} />
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, p: 2, bgcolor: '#070807', borderTop: '1px solid #2f7a45' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            disabled={!inputActivo}
            InputProps={{ sx: { ...mono, '& input': { color: '#7CFF9A' }, '& fieldset': { borderColor: '#2f7a45' } } }}
          />
          <Button type="submit" variant="outlined" disabled={!inputActivo} sx={{ ...mono, borderColor: '#7CFF9A' }}>
            ENTER
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
