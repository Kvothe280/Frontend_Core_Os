import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EventIcon from '@mui/icons-material/Event';
import { api } from '../api';
import { nombreDe } from '../constants/usuarios';

function formatFechaCita(fecha) {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

function CitaPendienteCard({ cita, usuario, onRefresh }) {
  const theme = useTheme();
  const esMia = cita.proponente === usuario;
  const [loading, setLoading] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [reagendando, setReagendando] = useState(false);

  const accion = async (endpoint) => {
    setLoading(true);
    try {
      if (endpoint === 'aceptar') await api.put(`/api/citas-propuestas/${cita._id}/aceptar`);
      else if (endpoint === 'rechazar') await api.delete(`/api/citas-propuestas/${cita._id}/rechazar`);
      else if (endpoint === 'cancelar') await api.delete(`/api/citas-propuestas/${cita._id}/cancelar`);
      onRefresh?.();
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const reagendar = async () => {
    if (!nuevaFecha) return;
    setReagendando(true);
    try {
      await api.put(`/api/citas-propuestas/${cita._id}/reagendar`, { fecha: nuevaFecha });
      setNuevaFecha('');
      onRefresh?.();
    } catch {
      /* ignore */
    } finally {
      setReagendando(false);
    }
  };

  const esAceptada = cita.estado === 'aceptada';

  return (
    <Card
      sx={{
        p: 2,
        mb: 1.5,
        border: `1px solid ${esAceptada ? theme.palette.success.main + '50' : theme.palette.primary.main + '29'}`,
        background: esAceptada ? `${theme.palette.success.main}08` : 'transparent',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
            {cita.titulo}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {formatFechaCita(cita.fechaPropuesta)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Propuso: {nombreDe(cita.proponente)}
          </Typography>
          {cita.nota && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
            >
              {cita.nota}
            </Typography>
          )}
        </Box>
        <Chip label={esAceptada ? 'confirmada' : 'pendiente'} size="small" color={esAceptada ? 'success' : 'warning'} />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
        {!esMia && !esAceptada && (
          <Button size="small" variant="contained" onClick={() => accion('aceptar')} disabled={loading}>
            Aceptar
          </Button>
        )}
        {!esMia && !esAceptada && (
          <Button size="small" color="error" onClick={() => accion('rechazar')} disabled={loading}>
            Rechazar
          </Button>
        )}
        {(esAceptada || esMia) && (
          <Button size="small" variant="outlined" color="inherit" onClick={() => accion('cancelar')} disabled={loading}>
            {esAceptada ? 'Cancelar cita' : 'Retirar'}
          </Button>
        )}
      </Box>

      {esAceptada && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'center' }}>
          <TextField
            type="date"
            size="small"
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={reagendar}
            disabled={!nuevaFecha || reagendando}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Reagendar
          </Button>
        </Box>
      )}
    </Card>
  );
}

export default function CitasSidebar({ citas, usuario, onRefresh, onProponer }) {
  return (
    <Box sx={{ width: 300, flexShrink: 0 }}>
      <Button variant="contained" fullWidth startIcon={<EventIcon />} onClick={onProponer} sx={{ mb: 2.5 }}>
        Proponer cita
      </Button>

      <Typography
        variant="subtitle2"
        sx={{ mb: 1, color: 'primary.main', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 11 }}
      >
        Citas activas
      </Typography>

      {citas.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Sin citas pendientes ni confirmadas.
        </Typography>
      )}

      {citas.map((cita) => (
        <CitaPendienteCard key={cita._id} cita={cita} usuario={usuario} onRefresh={onRefresh} />
      ))}
    </Box>
  );
}
