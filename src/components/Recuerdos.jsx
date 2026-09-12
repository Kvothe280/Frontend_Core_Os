import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { api } from '../api';
import { RecuerdoCard, GaleriaCard } from './RecuerdoCards.jsx';
import { FormularioAgregar, DialogEditar } from './RecuerdoForm.jsx';
import MapaRecuerdos from './MapaRecuerdos.jsx';

export default function Recuerdos({ onChange }) {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(0);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => {
    api
      .get('/api/recuerdos')
      .then(({ data }) => {
        setItems(data);
        setError('');
      })
      .catch(() => setError('No se pudo cargar.'));
  };

  useEffect(() => {
    cargar();
  }, []);

  const borrar = async (id) => {
    setError('');
    try {
      await api.delete(`/api/recuerdos/${id}`);
      cargar();
      onChange?.();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo borrar.');
    }
  };

  const alAgregar = () => {
    cargar();
    onChange?.();
    setTab(0);
  };
  const alEditar = () => {
    cargar();
    onChange?.();
  };

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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid rgba(111,78,55,0.15)' }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Todos" />
        <Tab label={`Galería${conImagen.length ? ` (${conImagen.length})` : ''}`} />
        <Tab label="Mapa" />
        <Tab label="Agregar" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
          {items.map((item) => (
            <RecuerdoCard key={item._id} item={item} onEditar={setEditando} onBorrar={borrar} />
          ))}
          {items.length === 0 && (
            <Typography color="text.secondary">Aún no hay recuerdos. Agrégalos en la pestaña Agregar.</Typography>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {conImagen.length === 0 ? (
            <Typography color="text.secondary">Ningún recuerdo tiene foto todavía.</Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
              }}
            >
              {conImagen.map((item) => (
                <GaleriaCard key={item._id} item={item} />
              ))}
            </Box>
          )}
        </Box>
      )}

      {tab === 2 && <MapaRecuerdos items={items} />}

      {tab === 3 && <FormularioAgregar onAgregado={alAgregar} />}

      {editando && <DialogEditar item={editando} onClose={() => setEditando(null)} onGuardado={alEditar} />}
    </Box>
  );
}
