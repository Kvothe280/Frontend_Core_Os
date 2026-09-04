import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api } from '../api';
import { nombreDe, otroUsuario } from '../constants/usuarios';

export function FormCarta({ open, onClose, onPublicada, usuario }) {
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [fecha, setFecha] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const autor = nombreDe(usuario);
  const para = nombreDe(otroUsuario(usuario));

  const reset = () => {
    setTitulo('');
    setCuerpo('');
    setFecha('');
    setArchivo(null);
    setError('');
  };

  const publicar = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('cuerpo', cuerpo);
    form.append('autor', autor);
    form.append('para', para);
    if (fecha) form.append('fecha', fecha);
    if (archivo) form.append('archivo', archivo);
    try {
      await api.post('/api/cartas', form);
      reset();
      onPublicada?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo publicar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Nueva carta</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          De <strong>{autor}</strong> para <strong>{para}</strong>
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Título"
          fullWidth
          margin="normal"
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <TextField
          label="Fecha (opcional)"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <TextField
          label="Carta (opcional si adjuntas imagen o PDF)"
          fullWidth
          margin="normal"
          multiline
          minRows={5}
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
        />
        <Button component="label" sx={{ mt: 1 }}>
          Adjuntar imagen o PDF (opcional)
          <input
            hidden
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setArchivo(e.target.files[0] || null)}
          />
        </Button>
        {archivo && (
          <Typography variant="caption" sx={{ ml: 1, display: 'block' }}>
            {archivo.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Cancelar
        </Button>
        <Button variant="contained" onClick={publicar} disabled={loading || !titulo}>
          Publicar carta
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function DialogEditarCarta({ carta, onClose, onGuardado }) {
  const [titulo, setTitulo] = useState(carta?.titulo || '');
  const [cuerpo, setCuerpo] = useState(carta?.cuerpo || '');
  const [autor, setAutor] = useState(carta?.autor || '');
  const [para, setPara] = useState(carta?.para || '');
  const [fecha, setFecha] = useState(carta?.fecha ? new Date(carta.fecha).toISOString().slice(0, 10) : '');
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');

  const guardar = async () => {
    setError('');
    try {
      const form = new FormData();
      form.append('titulo', titulo);
      form.append('cuerpo', cuerpo);
      form.append('autor', autor);
      form.append('para', para);
      if (fecha) form.append('fecha', fecha);
      if (archivo) form.append('archivo', archivo);
      await api.put(`/api/cartas/${carta._id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onGuardado?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar.');
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar carta</DialogTitle>
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
          label="Autor"
          fullWidth
          margin="normal"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          required
        />
        <TextField label="Para" fullWidth margin="normal" value={para} onChange={(e) => setPara(e.target.value)} />
        <TextField
          label="Fecha"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <TextField
          label="Contenido"
          fullWidth
          margin="normal"
          multiline
          minRows={4}
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {carta?.imagen ? 'Reemplazar imagen / PDF' : 'Agregar imagen o PDF'}
          </Typography>
          <Button variant="outlined" component="label" size="small">
            {archivo ? archivo.name : 'Elegir archivo'}
            <input type="file" accept="image/*,.pdf" hidden onChange={(e) => setArchivo(e.target.files[0] || null)} />
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={guardar}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
