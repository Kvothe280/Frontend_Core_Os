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

export default function AdminPoolMensualPanel({ tc, poolMensual, onError, cargar }) {
  const [nuevoM, setNuevoM] = useState({ titulo: '', descripcion: '' });

  const agregarMensual = async (e) => {
    e.preventDefault();
    onError('');
    try {
      await api.post('/api/vale-pool', nuevoM);
      setNuevoM({ titulo: '', descripcion: '' });
      cargar();
    } catch {
      onError('Error al guardar en el pool mensual.');
    }
  };

  const borrarMensual = async (id) => {
    try {
      await api.delete(`/api/vale-pool/${id}`);
      cargar();
    } catch {
      onError('No se pudo borrar del pool mensual.');
    }
  };

  const mono = { fontFamily: MONO_FONT, color: tc.text };
  const monoDim = { fontFamily: MONO_FONT, color: `${tc.text}99` };

  return (
    <Box>
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
