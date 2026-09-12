import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api';
import { MONO_FONT } from '../constants/terminalTheme.js';
import { cardSx, formCardSx, fieldSx, labelSx, buttonSx } from '../constants/adminPanelStyles.js';

export default function AdminPoolEspecialPanel({ tc, poolEspecial, onError, cargar }) {
  const [nuevoE, setNuevoE] = useState({ titulo: '', descripcion: '' });

  const agregarEspecial = async (e) => {
    e.preventDefault();
    onError('');
    try {
      await api.post('/api/vale-especial-pool', nuevoE);
      setNuevoE({ titulo: '', descripcion: '' });
      cargar();
    } catch (err) {
      onError(err.response?.data?.error || 'Error al guardar en el pool especial.');
    }
  };

  const borrarEspecial = async (id) => {
    try {
      await api.delete(`/api/vale-especial-pool/${id}`);
      cargar();
    } catch (err) {
      onError(err.response?.data?.error || 'No se pudo borrar.');
    }
  };

  const mono = { fontFamily: MONO_FONT, color: tc.text };
  const monoDim = { fontFamily: MONO_FONT, color: `${tc.text}99` };

  return (
    <Box>
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
    </Box>
  );
}
