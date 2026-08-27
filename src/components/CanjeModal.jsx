import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { api } from '../api';

export default function CanjeModal({ vale, open, onClose, onSuccess }) {
  const [fecha, setFecha] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (loading) return;
    setFecha('');
    setNotas('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!vale?._id) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/api/vales/canjear', {
        valeId: vale._id,
        fecha,
        notas,
      });
      setFecha('');
      setNotas('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Fallo al registrar el canje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Canjear vale</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          {vale?.titulo}. Enrique recibirá la confirmación por Discord.
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Fecha"
          type="datetime-local"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <TextField
          label="Notas"
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enviando…' : 'Confirmar canje'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
