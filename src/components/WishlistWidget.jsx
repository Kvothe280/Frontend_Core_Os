import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import Skeleton from '@mui/material/Skeleton';
import { useApi } from '../hooks/useApi';
import { api } from '../api';

const NOMBRES = { karol: 'Karol', enrique: 'Enrique' };

export default function WishlistWidget({ usuario }) {
  const theme = useTheme();
  const { data: items, loading, refetch } = useApi('/api/wishlist');
  const [texto, setTexto] = useState('');
  const [guardando, setGuardando] = useState(false);

  const agregar = async () => {
    if (!texto.trim()) return;
    setGuardando(true);
    try {
      await api.post('/api/wishlist', { texto: texto.trim() });
      setTexto('');
      refetch();
    } finally { setGuardando(false); }
  };

  const toggleHecho = async (item) => {
    await api.patch(`/api/wishlist/${item._id}`, { hecho: !item.hecho });
    refetch();
  };

  const eliminar = async (id) => {
    await api.delete(`/api/wishlist/${id}`);
    refetch();
  };

  if (loading) return <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} />;

  const pendientes = (items || []).filter((i) => !i.hecho);
  const hechos = (items || []).filter((i) => i.hecho);

  return (
    <Card sx={{ p: 2, border: `1px solid ${theme.palette.primary.main}24` }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>Lista de deseos</Typography>

      {pendientes.length === 0 && hechos.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontStyle: 'italic' }}>
          Nada aún — ¡agrega el primero!
        </Typography>
      )}

      {pendientes.map((item) => (
        <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', py: 0.25 }}>
          <Checkbox size="small" checked={false} onChange={() => toggleHecho(item)} sx={{ color: 'primary.main' }} />
          <Typography variant="body2" sx={{ flex: 1 }}>{item.texto}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            {NOMBRES[item.creadoPor]}
          </Typography>
          <IconButton size="small" onClick={() => eliminar(item._id)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {hechos.length > 0 && (
        <Box sx={{ mt: 1, borderTop: `1px solid ${theme.palette.divider}`, pt: 1 }}>
          {hechos.map((item) => (
            <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', py: 0.25, opacity: 0.5 }}>
              <Checkbox size="small" checked onChange={() => toggleHecho(item)} />
              <Typography variant="body2" sx={{ flex: 1, textDecoration: 'line-through' }}>{item.texto}</Typography>
              <IconButton size="small" onClick={() => eliminar(item._id)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
        <TextField
          size="small"
          placeholder="Algo que quieran hacer juntos…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && agregar()}
          fullWidth
        />
        <IconButton onClick={agregar} disabled={!texto.trim() || guardando} color="primary">
          <AddIcon />
        </IconButton>
      </Box>
    </Card>
  );
}
