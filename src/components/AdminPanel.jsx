import { useEffect, useState } from 'react';
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
import { MONO_FONT } from '../constants/terminalTheme.js';

const cardSx = (tc) => ({
  p: 1.5,
  mb: 1,
  bgcolor: 'rgba(255,255,255,0.04)',
  border: `1px solid ${tc.border}30`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

const formCardSx = (tc) => ({
  bgcolor: 'rgba(255,255,255,0.02)',
  border: `1px dashed ${tc.border}50`,
});

const fieldSx = (tc) => ({
  '& .MuiInputBase-input': { fontFamily: MONO_FONT, fontSize: 13.5, color: tc.input },
  '& fieldset': { borderColor: `${tc.border}60` },
  '&:hover fieldset': { borderColor: tc.border },
  '&.Mui-focused fieldset': { borderColor: tc.border },
});

const labelSx = (tc) => ({
  fontFamily: MONO_FONT,
  fontSize: 13,
  color: `${tc.text}99`,
  '&.Mui-focused': { color: tc.text },
});

const buttonSx = (tc) => ({
  fontFamily: MONO_FONT,
  fontSize: 12,
  color: tc.text,
  borderColor: `${tc.border}60`,
  '&:hover': { borderColor: tc.border, bgcolor: `${tc.border}12` },
});

export default function AdminPanel({ tc }) {
  const [preguntas, setPreguntas] = useState([]);
  const [poolEspecial, setPoolEspecial] = useState([]);
  const [poolMensual, setPoolMensual] = useState([]);
  const [nuevaP, setNuevaP] = useState({ pregunta: '', respuesta: '' });
  const [nuevoE, setNuevoE] = useState({ titulo: '', descripcion: '' });
  const [nuevoM, setNuevoM] = useState({ titulo: '', descripcion: '' });
  const [error, setError] = useState('');
  const [diaActual] = useState(new Date().getDate());

  const cargar = () =>
    Promise.all([
      api.get('/api/preguntas-mes').then(({ data }) => setPreguntas(data)),
      api.get('/api/vale-especial-pool').then(({ data }) => setPoolEspecial(data)),
      api.get('/api/vale-pool').then(({ data }) => setPoolMensual(data)),
    ]);

  useEffect(() => {
    cargar();
  }, []);

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
    try {
      await api.delete(`/api/preguntas-mes/${id}`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo borrar.');
    }
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
    try {
      await api.delete(`/api/vale-especial-pool/${id}`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo borrar.');
    }
  };

  const agregarMensual = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/vale-pool', nuevoM);
      setNuevoM({ titulo: '', descripcion: '' });
      cargar();
    } catch {
      setError('Error al guardar en el pool mensual.');
    }
  };

  const borrarMensual = async (id) => {
    try {
      await api.delete(`/api/vale-pool/${id}`);
      cargar();
    } catch {
      setError('No se pudo borrar del pool mensual.');
    }
  };

  const puedeCargar = diaActual <= 12;
  const mono = { fontFamily: MONO_FONT, color: tc.text };
  const monoDim = { fontFamily: MONO_FONT, color: `${tc.text}99` };

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            mb: 2,
            fontFamily: MONO_FONT,
            fontSize: 12.5,
            color: '#FF8A80',
            borderColor: 'rgba(255,138,128,0.4)',
            '& .MuiAlert-icon': { color: '#FF8A80' },
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* ── Mis preguntas del mes ── */}
      <Typography sx={{ ...mono, fontSize: 15, fontWeight: 600, mb: 0.5 }}>
        Mis preguntas del mes ({preguntas.length}/6)
      </Typography>
      <Typography sx={{ ...monoDim, fontSize: 12.5, mb: 2 }}>
        Las que escribes para que el otro las responda. Período de carga: días 1–12. Solo tú puedes ver estas
        preguntas y sus respuestas.
      </Typography>

      {preguntas.map((p, i) => (
        <Card key={p._id} sx={cardSx(tc)}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ ...mono, fontSize: 13, fontWeight: 600 }}>Pregunta {i + 1}</Typography>
            <Typography sx={{ ...mono, fontSize: 13 }}>{p.pregunta}</Typography>
            <Typography sx={{ ...monoDim, fontSize: 11.5 }}>Respuesta: {p.respuesta}</Typography>
            {p.respondida && <Chip label="respondida" size="small" color="success" sx={{ ml: 1, mt: 0.5 }} />}
          </Box>
          {!p.respondida && puedeCargar && (
            <IconButton
              size="small"
              onClick={() => borrarPregunta(p._id)}
              sx={{ flexShrink: 0, ml: 1, color: `${tc.text}99`, '&:hover': { color: '#FF8A80' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Card>
      ))}

      {preguntas.length < 6 && puedeCargar && (
        <Card sx={{ p: 2, mb: 4, ...formCardSx(tc) }} component="form" onSubmit={agregarPregunta}>
          <Typography sx={{ ...mono, fontSize: 13, mb: 1 }}>Agregar pregunta {preguntas.length + 1}/6</Typography>
          <TextField
            size="small"
            label="Pregunta"
            fullWidth
            sx={{ mb: 1, ...fieldSx(tc) }}
            InputLabelProps={{ sx: labelSx(tc) }}
            required
            value={nuevaP.pregunta}
            onChange={(e) => setNuevaP((p) => ({ ...p, pregunta: e.target.value }))}
          />
          <TextField
            size="small"
            label="Respuesta (sin acentos — se normaliza)"
            fullWidth
            sx={{ mb: 1.5, ...fieldSx(tc) }}
            InputLabelProps={{ sx: labelSx(tc) }}
            required
            value={nuevaP.respuesta}
            onChange={(e) => setNuevaP((p) => ({ ...p, respuesta: e.target.value }))}
          />
          <Button type="submit" size="small" variant="outlined" sx={buttonSx(tc)}>
            Agregar
          </Button>
        </Card>
      )}

      {preguntas.length < 6 && !puedeCargar && (
        <Typography sx={{ ...monoDim, fontSize: 12.5, mb: 4 }}>
          El período de carga cerró el día 12. Faltan {6 - preguntas.length} preguntas — esto generará una
          penalización para el otro.
        </Typography>
      )}

      {/* ── Mi pool de premios especiales ── */}
      <Divider sx={{ my: 3, borderColor: `${tc.border}30` }} />
      <Typography sx={{ ...mono, fontSize: 15, fontWeight: 600, mb: 0.5 }}>
        Mi pool de premios especiales ({poolEspecial.length})
      </Typography>
      <Typography sx={{ ...monoDim, fontSize: 12.5, mb: 2 }}>
        Premios que le darás al otro cuando complete las preguntas. Solo tú los ves hasta que el protocolo se
        completa. El sistema elige uno al azar cada mes (3 meses de pausa antes de repetir).
      </Typography>

      {poolEspecial.map((v) => (
        <Card key={v._id} sx={cardSx(tc)}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ ...mono, fontSize: 13, fontWeight: 600 }}>{v.titulo}</Typography>
            {v.descripcion && <Typography sx={{ ...monoDim, fontSize: 11.5 }}>{v.descripcion}</Typography>}
            {v.usadoEnPeriodos?.length > 0 && (
              <Typography sx={{ ...monoDim, fontSize: 11, display: 'block' }}>
                Usado en: {v.usadoEnPeriodos.slice(-3).join(', ')}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => borrarEspecial(v._id)}
            sx={{ flexShrink: 0, ml: 1, color: `${tc.text}99`, '&:hover': { color: '#FF8A80' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Card>
      ))}

      <Card sx={{ p: 2, mt: 1, mb: 4, ...formCardSx(tc) }} component="form" onSubmit={agregarEspecial}>
        <Typography sx={{ ...mono, fontSize: 13, mb: 1 }}>Agregar premio especial</Typography>
        <TextField
          size="small"
          label="Título"
          fullWidth
          sx={{ mb: 1, ...fieldSx(tc) }}
          InputLabelProps={{ sx: labelSx(tc) }}
          required
          value={nuevoE.titulo}
          onChange={(e) => setNuevoE((p) => ({ ...p, titulo: e.target.value }))}
        />
        <TextField
          size="small"
          label="Descripción (opcional)"
          fullWidth
          sx={{ mb: 1.5, ...fieldSx(tc) }}
          InputLabelProps={{ sx: labelSx(tc) }}
          value={nuevoE.descripcion}
          onChange={(e) => setNuevoE((p) => ({ ...p, descripcion: e.target.value }))}
        />
        <Button type="submit" size="small" variant="outlined" sx={buttonSx(tc)}>
          Agregar al pool
        </Button>
      </Card>

      {/* ── Pool de vales mensuales (compartida) ── */}
      <Divider sx={{ my: 3, borderColor: `${tc.border}30` }} />
      <Typography sx={{ ...mono, fontSize: 15, fontWeight: 600, mb: 0.5 }}>
        Pool de vales mensuales ({poolMensual.length})
      </Typography>
      <Typography sx={{ ...monoDim, fontSize: 12.5, mb: 2 }}>
        Vales compartidos del sorteo mensual. No se repiten en meses consecutivos.
      </Typography>

      {poolMensual.map((v) => (
        <Card key={v._id} sx={cardSx(tc)}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ ...mono, fontSize: 13, fontWeight: 600 }}>{v.titulo}</Typography>
            {v.descripcion && <Typography sx={{ ...monoDim, fontSize: 11.5 }}>{v.descripcion}</Typography>}
          </Box>
          <IconButton
            size="small"
            onClick={() => borrarMensual(v._id)}
            sx={{ flexShrink: 0, ml: 1, color: `${tc.text}99`, '&:hover': { color: '#FF8A80' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Card>
      ))}

      <Card sx={{ p: 2, mt: 1, ...formCardSx(tc) }} component="form" onSubmit={agregarMensual}>
        <Typography sx={{ ...mono, fontSize: 13, mb: 1 }}>Agregar vale mensual al pool</Typography>
        <TextField
          size="small"
          label="Título"
          fullWidth
          sx={{ mb: 1, ...fieldSx(tc) }}
          InputLabelProps={{ sx: labelSx(tc) }}
          required
          value={nuevoM.titulo}
          onChange={(e) => setNuevoM((p) => ({ ...p, titulo: e.target.value }))}
        />
        <TextField
          size="small"
          label="Descripción (opcional)"
          fullWidth
          sx={{ mb: 1.5, ...fieldSx(tc) }}
          InputLabelProps={{ sx: labelSx(tc) }}
          value={nuevoM.descripcion}
          onChange={(e) => setNuevoM((p) => ({ ...p, descripcion: e.target.value }))}
        />
        <Button type="submit" size="small" variant="outlined" sx={buttonSx(tc)}>
          Agregar al pool
        </Button>
      </Card>
    </Box>
  );
}
