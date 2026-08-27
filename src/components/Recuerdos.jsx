import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api, mediaUrl } from '../api';

const TIPOS = [
  { value: 'recuerdo', label: 'Recuerdo' },
  { value: 'cita', label: 'Cita' },
];

function etiquetaTipo(tipo) {
  if (tipo === 'cafe' || tipo === 'cita') return 'Cita';
  return TIPOS.find((t) => t.value === tipo)?.label ?? tipo;
}

function FormularioAgregar({ onAgregado }) {
  const [titulo, setTitulo] = useState('');
  const [nota, setNota] = useState('');
  const [tipo, setTipo] = useState('recuerdo');
  const [fecha, setFecha] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');

  const agregar = async (e) => {
    e.preventDefault();
    setError('');
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('nota', nota);
    form.append('tipo', tipo);
    if (fecha) form.append('fecha', fecha);
    if (archivo) form.append('imagen', archivo);
    try {
      await api.post('/api/recuerdos', form);
      setTitulo('');
      setNota('');
      setFecha('');
      setArchivo(null);
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
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
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
      <Button type="submit" variant="contained">
        Guardar
      </Button>
    </Card>
  );
}

function DialogEditar({ item, onClose, onGuardado }) {
  const [titulo, setTitulo] = useState(item?.titulo || '');
  const [nota, setNota] = useState(item?.nota || '');
  const [tipo, setTipo] = useState(item?.tipo === 'cafe' ? 'cita' : (item?.tipo || 'recuerdo'));
  const [fecha, setFecha] = useState(
    item?.fecha ? new Date(item.fecha).toISOString().slice(0, 10) : ''
  );
  const [error, setError] = useState('');

  const guardar = async () => {
    setError('');
    try {
      await api.put(`/api/recuerdos/${item._id}`, { titulo, nota, tipo, fecha });
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
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Título" fullWidth margin="normal" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        <TextField select label="Tipo" fullWidth margin="normal" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>
        <TextField label="Fecha" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <TextField label="Nota" fullWidth margin="normal" multiline minRows={3} value={nota} onChange={(e) => setNota(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={guardar}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Recuerdos({ onChange }) {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(0);
  const [editando, setEditando] = useState(null);

  const cargar = () => {
    api.get('/api/recuerdos').then(({ data }) => setItems(data));
  };

  useEffect(() => { cargar(); }, []);

  const borrar = async (id) => {
    await api.delete(`/api/recuerdos/${id}`);
    cargar();
    onChange?.();
  };

  const alAgregar = () => { cargar(); onChange?.(); setTab(0); };
  const alEditar = () => { cargar(); onChange?.(); };

  const conImagen = items.filter((i) => i.imagen);

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>
        Archivo vivo
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Recuerdos
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Todo lo que vivimos juntos. Si marcas "Cita" suma al contador del panel.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid rgba(111,78,55,0.15)' }} textColor="primary" indicatorColor="primary">
        <Tab label="Todos" />
        <Tab label={`Galería${conImagen.length ? ` (${conImagen.length})` : ''}`} />
        <Tab label="Agregar" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
          {items.map((item) => (
            <Card key={item._id} sx={{ overflow: 'hidden' }}>
              {item.imagen ? (
                <CardMedia component="img" image={mediaUrl(item.imagen)} alt={item.titulo} sx={{ height: 180, objectFit: 'cover' }} />
              ) : (
                <Box sx={{ height: 80, bgcolor: '#ebe2d6' }} />
              )}
              <Box sx={{ p: 2 }}>
                <Typography variant="overline">{etiquetaTipo(item.tipo)}</Typography>
                <Typography variant="h6">{item.titulo}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(item.fecha).toLocaleDateString('es-MX')}
                </Typography>
                {item.nota && <Typography variant="body2" sx={{ mt: 1 }}>{item.nota}</Typography>}
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button size="small" onClick={() => setEditando(item)}>Editar</Button>
                  <Button size="small" color="error" onClick={() => borrar(item._id)}>Quitar</Button>
                </Box>
              </Box>
            </Card>
          ))}
          {items.length === 0 && <Typography color="text.secondary">Aún no hay recuerdos. Agrégalos en la pestaña Agregar.</Typography>}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {conImagen.length === 0 ? (
            <Typography color="text.secondary">Ningún recuerdo tiene foto todavía.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' } }}>
              {conImagen.map((item) => (
                <Card key={item._id} sx={{ overflow: 'hidden', border: '1px solid rgba(111,78,55,0.12)' }}>
                  <CardMedia component="img" image={mediaUrl(item.imagen)} alt={item.titulo} sx={{ height: 200, objectFit: 'cover' }} />
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'primary.main', display: 'block' }}>{etiquetaTipo(item.tipo)}</Typography>
                    <Typography variant="subtitle2">{item.titulo}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(item.fecha).toLocaleDateString('es-MX')}</Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {tab === 2 && <FormularioAgregar onAgregado={alAgregar} />}

      {editando && <DialogEditar item={editando} onClose={() => setEditando(null)} onGuardado={alEditar} />}
    </Box>
  );
}
