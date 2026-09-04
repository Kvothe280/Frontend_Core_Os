import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { api } from '../api';

export default function PropCitaModal({ open, onClose, onCreada }) {
  const [form, setForm] = useState({ titulo: '', nota: '', fecha: '', hora: '19:00' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.titulo || !form.fecha) { setError('Título y fecha son obligatorios.'); return; }
    setLoading(true);
    try {
      const fechaPropuesta = new Date(`${form.fecha}T${form.hora}:00`);
      await api.post('/api/citas-propuestas', { titulo: form.titulo, nota: form.nota, fechaPropuesta });
      setForm({ titulo: '', nota: '', fecha: '', hora: '19:00' });
      onCreada?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la cita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Proponer cita</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Título" fullWidth sx={{ mt: 1, mb: 2 }} required value={form.titulo}
          onChange={(e) => { setError(''); setForm((p) => ({ ...p, titulo: e.target.value })); }} />
        <TextField label="Nota (opcional)" fullWidth multiline rows={2} sx={{ mb: 2 }} value={form.nota}
          onChange={(e) => setForm((p) => ({ ...p, nota: e.target.value }))} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="Fecha" type="date" fullWidth required value={form.fecha} InputLabelProps={{ shrink: true }}
            onChange={(e) => { setError(''); setForm((p) => ({ ...p, fecha: e.target.value })); }} />
          <TextField label="Hora" type="time" sx={{ width: 130 }} required value={form.hora} InputLabelProps={{ shrink: true }}
            onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>Proponer</Button>
      </DialogActions>
    </Dialog>
  );
}
