import { useEffect, useState } from 'react';
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

export default function AdminPanel() {
  const theme = useTheme();
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

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* ── Mis preguntas del mes ── */}
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Mis preguntas del mes ({preguntas.length}/6)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Las que escribes para que el otro las responda. Período de carga: días 1–12. Solo tú puedes ver estas preguntas
        y sus respuestas.
      </Typography>

      {preguntas.map((p, i) => (
        <Card
          key={p._id}
          sx={{
            p: 1.5,
            mb: 1,
            border: `1px solid ${theme.palette.primary.main}22`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Pregunta {i + 1}
            </Typography>
            <Typography variant="body2">{p.pregunta}</Typography>
            <Typography variant="caption" color="text.secondary">
              Respuesta: {p.respuesta}
            </Typography>
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
        <Card
          sx={{ p: 2, mb: 4, border: '1px dashed rgba(111,78,55,0.3)' }}
          component="form"
          onSubmit={agregarPregunta}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Agregar pregunta {preguntas.length + 1}/6
          </Typography>
          <TextField
            size="small"
            label="Pregunta"
            fullWidth
            sx={{ mb: 1 }}
            required
            value={nuevaP.pregunta}
            onChange={(e) => setNuevaP((p) => ({ ...p, pregunta: e.target.value }))}
          />
          <TextField
            size="small"
            label="Respuesta (sin acentos — se normaliza)"
            fullWidth
            sx={{ mb: 1.5 }}
            required
            value={nuevaP.respuesta}
            onChange={(e) => setNuevaP((p) => ({ ...p, respuesta: e.target.value }))}
          />
          <Button type="submit" size="small" variant="outlined">
            Agregar
          </Button>
        </Card>
      )}

      {preguntas.length < 6 && !puedeCargar && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          El período de carga cerró el día 12. Faltan {6 - preguntas.length} preguntas — esto generará una penalización
          para el otro.
        </Typography>
      )}

      {/* ── Mi pool de premios especiales ── */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Mi pool de premios especiales ({poolEspecial.length})
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Premios que le darás al otro cuando complete las preguntas. Solo tú los ves hasta que el protocolo se completa.
        El sistema elige uno al azar cada mes (3 meses de pausa antes de repetir).
      </Typography>

      {poolEspecial.map((v) => (
        <Card
          key={v._id}
          sx={{
            p: 1.5,
            mb: 1,
            border: `1px solid ${theme.palette.primary.main}22`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {v.titulo}
            </Typography>
            {v.descripcion && (
              <Typography variant="caption" color="text.secondary">
                {v.descripcion}
              </Typography>
            )}
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

      <Card
        sx={{ p: 2, mt: 1, mb: 4, border: '1px dashed rgba(111,78,55,0.3)' }}
        component="form"
        onSubmit={agregarEspecial}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Agregar premio especial
        </Typography>
        <TextField
          size="small"
          label="Título"
          fullWidth
          sx={{ mb: 1 }}
          required
          value={nuevoE.titulo}
          onChange={(e) => setNuevoE((p) => ({ ...p, titulo: e.target.value }))}
        />
        <TextField
          size="small"
          label="Descripción (opcional)"
          fullWidth
          sx={{ mb: 1.5 }}
          value={nuevoE.descripcion}
          onChange={(e) => setNuevoE((p) => ({ ...p, descripcion: e.target.value }))}
        />
        <Button type="submit" size="small" variant="outlined">
          Agregar al pool
        </Button>
      </Card>

      {/* ── Pool de vales mensuales (compartida) ── */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Pool de vales mensuales ({poolMensual.length})
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Vales compartidos del sorteo mensual. No se repiten en meses consecutivos.
      </Typography>

      {poolMensual.map((v) => (
        <Card
          key={v._id}
          sx={{
            p: 1.5,
            mb: 1,
            border: `1px solid ${theme.palette.primary.main}22`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {v.titulo}
            </Typography>
            {v.descripcion && (
              <Typography variant="caption" color="text.secondary">
                {v.descripcion}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => borrarMensual(v._id)} sx={{ flexShrink: 0, ml: 1 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Card>
      ))}

      <Card sx={{ p: 2, mt: 1, border: '1px dashed rgba(111,78,55,0.3)' }} component="form" onSubmit={agregarMensual}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Agregar vale mensual al pool
        </Typography>
        <TextField
          size="small"
          label="Título"
          fullWidth
          sx={{ mb: 1 }}
          required
          value={nuevoM.titulo}
          onChange={(e) => setNuevoM((p) => ({ ...p, titulo: e.target.value }))}
        />
        <TextField
          size="small"
          label="Descripción (opcional)"
          fullWidth
          sx={{ mb: 1.5 }}
          value={nuevoM.descripcion}
          onChange={(e) => setNuevoM((p) => ({ ...p, descripcion: e.target.value }))}
        />
        <Button type="submit" size="small" variant="outlined">
          Agregar al pool
        </Button>
      </Card>
    </Box>
  );
}
