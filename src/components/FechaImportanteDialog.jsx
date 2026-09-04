import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { api } from '../api';

export default function FechaImportanteDialog({ item, onClose, onGuardado }) {
  const [titulo, setTitulo] = useState(item?.titulo || '');
  const [fecha, setFecha] = useState(item?.fecha ? new Date(item.fecha).toISOString().slice(0, 10) : '');
  const [tipo, setTipo] = useState(item?.tipo || 'unica');
  const [emoji, setEmoji] = useState(item?.emoji || '');
  const [error, setError] = useState('');

  const guardar = async () => {
    setError('');
    if (!titulo.trim() || !fecha) {
      setError('Título y fecha son requeridos.');
      return;
    }
    try {
      const payload = { titulo: titulo.trim(), fecha, tipo, emoji: emoji.trim() || undefined };
      if (item) await api.put(`/api/fechas-importantes/${item._id}`, payload);
      else await api.post('/api/fechas-importantes', payload);
      onGuardado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar.');
    }
  };

  const borrar = async () => {
    try {
      await api.delete(`/api/fechas-importantes/${item._id}`);
      onGuardado();
      onClose();
    } catch {
      setError('No se pudo borrar.');
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{item ? 'Editar fecha' : 'Agregar fecha importante'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Título"
          fullWidth
          margin="normal"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <TextField
          label="Fecha"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
        <TextField
          select
          label="Tipo"
          fullWidth
          margin="normal"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <MenuItem value="unica">Única vez</MenuItem>
          <MenuItem value="anual">Se repite cada año</MenuItem>
        </TextField>
        <TextField
          label="Emoji (opcional)"
          fullWidth
          margin="normal"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
          placeholder="📌"
        />
      </DialogContent>
      <DialogActions>
        {item && (
          <Button color="error" onClick={borrar} sx={{ mr: 'auto' }}>
            Borrar
          </Button>
        )}
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={guardar}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
