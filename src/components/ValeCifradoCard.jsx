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
  const sinPreguntas = !abierto && (!estado.preguntas || estado.preguntas.length === 0);

  const mesSiguiente = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1)
      .toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
  };

  // Cuando ya fue desbloqueado: tarjeta compacta y apagada para no cortar la fila de vales
  if (abierto) {
    return (
      <Card
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
          opacity: 0.72,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          minHeight: 72,
        }}
      >
        <LockOpenIcon sx={{ fontSize: 24, color: 'text.disabled', flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1.2 }}>
            cifrado · este mes
          </Typography>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {recompensa}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Se renueva el {mesSiguiente()}
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card
        sx={{
          border: `1px dashed ${theme.palette.primary.main}73`,
          background: theme.palette.background.default,
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
            bgcolor: theme.palette.divider,
          }}
        >
          <LockIcon sx={{ fontSize: 48, color: theme.palette.primary.main, opacity: 0.45 }} />
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="overline" sx={{ color: 'primary.main' }}>
            Cifrado · especial
          </Typography>
          <Typography variant="h6">Vale cifrado del mes</Typography>
          {sinPreguntas ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sin preguntas cargadas aún.
            </Typography>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                {estado.preguntas.length} pregunta{estado.preguntas.length !== 1 ? 's' : ''} para abrirlo
              </Typography>
              <Button size="small" variant="outlined" onClick={() => setDialogOpen(true)}>
                Intentar desbloquear
              </Button>
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
