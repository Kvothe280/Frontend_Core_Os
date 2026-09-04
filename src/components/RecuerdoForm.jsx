import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api } from '../api';
import { TIPOS } from '../constants/recuerdoTipos';
import LocationPicker from './LocationPicker.jsx';

export function FormularioAgregar({ onAgregado }) {
  const [titulo, setTitulo] = useState('');
  const [nota, setNota] = useState('');
  const [tipo, setTipo] = useState('recuerdo');
  const [fecha, setFecha] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);
  const [error, setError] = useState('');

  const agregar = async (e) => {
    e.preventDefault();
    setError('');
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('nota', nota);
    form.append('tipo', tipo);
    if (fecha) form.append('fecha', fecha);
    if (archivo) form.append('archivo', archivo);
    if (ubicacion) form.append('ubicacion', JSON.stringify(ubicacion));
    try {
      await api.post('/api/recuerdos', form);
      setTitulo('');
      setNota('');
      setFecha('');
      setArchivo(null);
      setUbicacion(null);
      onAgregado?.();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar.');
    }
  };

  return (
    <Card sx={{ p: 3 }} component="form" onSubmit={agregar}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Agregar
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        <TextField select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Fecha"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <Button component="label">
          Foto
          <input hidden type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files[0] || null)} />
        </Button>
      </Box>
      {archivo && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          {archivo.name}
        </Typography>
      )}
      <TextField
        label="Nota"
        fullWidth
        margin="normal"
        multiline
        minRows={3}
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />
      <Box sx={{ mt: 2, mb: 2 }}>
        <LocationPicker value={ubicacion} onChange={setUbicacion} />
      </Box>
      <Button type="submit" variant="contained">
        Guardar
      </Button>
    </Card>
  );
}

export function DialogEditar({ item, onClose, onGuardado }) {
  const [titulo, setTitulo] = useState(item?.titulo || '');
  const [nota, setNota] = useState(item?.nota || '');
  const [tipo, setTipo] = useState(item?.tipo === 'cafe' ? 'cita' : item?.tipo || 'recuerdo');
  const [fecha, setFecha] = useState(item?.fecha ? new Date(item.fecha).toISOString().slice(0, 10) : '');
  const [archivo, setArchivo] = useState(null);
  const [ubicacion, setUbicacion] = useState(item?.ubicacion || null);
  const [error, setError] = useState('');

  const guardar = async () => {
    setError('');
    try {
      const form = new FormData();
      form.append('titulo', titulo);
      form.append('nota', nota);
      form.append('tipo', tipo);
      if (fecha) form.append('fecha', fecha);
      if (archivo) form.append('archivo', archivo);
      form.append('ubicacion', ubicacion ? JSON.stringify(ubicacion) : '');
      await api.put(`/api/recuerdos/${item._id}`, form, {
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
      <DialogTitle>Editar recuerdo</DialogTitle>
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
        <TextField select label="Tipo" fullWidth margin="normal" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
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
          label="Nota"
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {item?.imagen ? 'Reemplazar imagen' : 'Agregar imagen'}
          </Typography>
          <Button variant="outlined" component="label" size="small">
            {archivo ? archivo.name : 'Elegir archivo'}
            <input type="file" accept="image/*" hidden onChange={(e) => setArchivo(e.target.files[0] || null)} />
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <LocationPicker value={ubicacion} onChange={setUbicacion} />
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
