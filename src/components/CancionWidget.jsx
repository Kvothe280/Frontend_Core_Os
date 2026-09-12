import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { NOMBRES, otroUsuario } from '../constants/usuarios';

function TrackCard({ entrada, nombre, acento }) {
  if (!entrada) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.45 }}>
        <MusicNoteIcon fontSize="small" />
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          {nombre} todavía no eligió canción esta semana
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: acento + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MusicNoteIcon sx={{ color: acento, fontSize: '1.2rem' }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {entrada.titulo}
        </Typography>
        {entrada.artista && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {entrada.artista}
          </Typography>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {nombre}
      </Typography>
    </Box>
  );
}

export default function CancionWidget({ usuario }) {
  const theme = useTheme();
  const otro = otroUsuario(usuario);
  const { data, error: loadError, loading, refetch } = useApi('/api/canciones');
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardarError, setGuardarError] = useState('');

  const guardar = async () => {
    if (!titulo.trim()) return;
    setGuardando(true);
    setGuardarError('');
    try {
      await api.post('/api/canciones', { titulo, artista, url });
      refetch();
      setOpen(false);
      setTitulo('');
      setArtista('');
      setUrl('');
    } catch (err) {
      setGuardarError(err.response?.data?.error || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <Skeleton variant="rounded" height={110} sx={{ borderRadius: 2 }} />;

  const miCancion = data?.[usuario] || null;

  return (
    <Card sx={{ p: 2, border: `1px solid ${theme.palette.primary.main}24` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6">Canción de la semana</Typography>
        <Button size="small" onClick={() => setOpen((v) => !v)}>
          {miCancion ? 'Cambiar' : 'Agregar'}
        </Button>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {loadError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TrackCard entrada={data?.[otro]} nombre={NOMBRES[otro]} acento={theme.palette.primary.main} />
        <TrackCard
          entrada={miCancion}
          nombre={NOMBRES[usuario]}
          acento={theme.palette.secondary?.main || theme.palette.primary.main}
        />
      </Box>

      {open && (
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {guardarError && (
            <Alert severity="error" sx={{ mb: 0.5 }}>
              {guardarError}
            </Alert>
          )}
          <TextField size="small" label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} fullWidth />
          <TextField
            size="small"
            label="Artista"
            value={artista}
            onChange={(e) => setArtista(e.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label="Link (Spotify / YouTube)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
          />
          <Button variant="contained" size="small" onClick={guardar} disabled={!titulo.trim() || guardando}>
            Guardar
          </Button>
        </Box>
      )}
    </Card>
  );
}
