import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { api } from '../api';

function DialogDesbloqueo({ preguntas, onClose, onExito }) {
  const [respuestas, setRespuestas] = useState({});
  const [incorrectas, setIncorrectas] = useState([]);
  const [loading, setLoading] = useState(false);

  const setRespuesta = (id, valor) =>
    setRespuestas((prev) => ({ ...prev, [String(id)]: valor }));

  const intentar = async () => {
    setLoading(true);
    setIncorrectas([]);
    try {
      const { data } = await api.post('/api/vale-cifrado/intentar', { respuestas });
      if (data.ok) {
        onExito(data.recompensa);
      } else {
        setIncorrectas(data.incorrectas || []);
      }
    } catch {
      setIncorrectas([]);
    } finally {
      setLoading(false);
    }
  };

  const todasRespondidas = preguntas.every((p) => String(respuestas[p.id] || '').trim());

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem' }}>
        Vale cifrado del mes
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Responde las 5 preguntas para revelar tu recompensa.
        </Typography>
        {incorrectas.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {incorrectas.length === preguntas.length
              ? 'Ninguna respuesta coincide. Inténtalo de nuevo.'
              : `${incorrectas.length} respuesta${incorrectas.length > 1 ? 's' : ''} incorrecta${incorrectas.length > 1 ? 's' : ''}. Revísalas.`}
          </Alert>
        )}
        {preguntas.map((p, i) => (
          <TextField
            key={p.id}
            label={`${i + 1}. ${p.pregunta}`}
            fullWidth
            margin="normal"
            value={respuestas[p.id] || ''}
            onChange={(e) => setRespuesta(p.id, e.target.value)}
            error={incorrectas.includes(p.id)}
          />
        ))}
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cerrar</Button>
        <Button
          variant="contained"
          onClick={intentar}
          disabled={loading || !todasRespondidas}
        >
          Desbloquear
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ValeCifradoCard() {
  const theme = useTheme();
  const [estado, setEstado] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recompensaReveal, setRecompensaReveal] = useState('');

  const cargar = async () => {
    try {
      const { data } = await api.get('/api/vale-cifrado');
      setEstado(data);
    } catch {
      /* silencioso */
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const alExito = (recompensa) => {
    setDialogOpen(false);
    setRecompensaReveal(recompensa);
    cargar();
  };

  if (!estado) return null;

  const abierto = estado.desbloqueado || recompensaReveal;
  const recompensa = recompensaReveal || estado.recompensa;

  const mesSiguiente = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1)
      .toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
  };

  return (
    <>
      <Card
        sx={{
          border: abierto ? `1.5px solid ${theme.palette.primary.main}` : `1px dashed ${theme.palette.primary.main}73`,
          background: abierto ? '#fff' : '#efe8df',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <Box
          sx={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: abierto ? '#ebe2d6' : '#ddd4c5',
          }}
        >
          {abierto ? (
            <LockOpenIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          ) : (
            <LockIcon sx={{ fontSize: 48, color: 'rgba(111,78,55,0.5)' }} />
          )}
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="overline" sx={{ color: 'primary.main' }}>
            {abierto ? 'Desbloqueado · especial' : 'Cifrado · especial'}
          </Typography>
          <Typography variant="h6">
            {abierto ? recompensa : 'Vale cifrado del mes'}
          </Typography>
          {!abierto && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
              5 preguntas para abrirlo
            </Typography>
          )}
          {!abierto && (
            <Button size="small" variant="outlined" onClick={() => setDialogOpen(true)}>
              Intentar desbloquear
            </Button>
          )}
          {abierto && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Este mes ya está tuyo.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Se renueva el {mesSiguiente()}
              </Typography>
            </>
          )}
        </Box>
      </Card>

      {dialogOpen && (
        <DialogDesbloqueo
          preguntas={estado.preguntas}
          onClose={() => setDialogOpen(false)}
          onExito={alExito}
        />
      )}
    </>
  );
}
