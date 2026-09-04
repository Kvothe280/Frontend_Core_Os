import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { api } from '../api';
import AvatarUsuario from './AvatarUsuario.jsx';
import { NOMBRES, otroUsuario } from '../constants/usuarios';

const EMOJIS = ['😊', '🥰', '😌', '😄', '🤩', '😴', '😔', '😤', '😰', '🤒', '🥺', '😭'];

function EmojiPicker({ value, onChange }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
      {EMOJIS.map((e) => (
        <Box
          key={e}
          onClick={() => onChange(e)}
          sx={{
            fontSize: '1.5rem',
            cursor: 'pointer',
            lineHeight: 1,
            px: 0.5,
            py: 0.25,
            borderRadius: 2,
            border: value === e ? '2px solid' : '2px solid transparent',
            borderColor: value === e ? 'primary.main' : 'transparent',
            transition: 'border-color 0.15s',
            '&:hover': { borderColor: 'primary.light' },
          }}
        >
          {e}
        </Box>
      ))}
    </Box>
  );
}

function MoodDisplay({ entrada, nombre, usuario }) {
  const theme = useTheme();
  if (!entrada) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: `${theme.palette.primary.main}0a`,
          border: `1px solid ${theme.palette.primary.main}18`,
        }}
      >
        <AvatarUsuario usuario={usuario} size={24} />
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'primary.main', opacity: 0.8 }}>
          {nombre} todavía no registró su estado hoy
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <AvatarUsuario usuario={usuario} size={36} />
      <Typography fontSize="2rem" lineHeight={1}>
        {entrada.emoji}
      </Typography>
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {nombre}
        </Typography>
        {entrada.nota && (
          <Typography variant="caption" color="text.secondary">
            {entrada.nota}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function MoodWidget({ usuario }) {
  const theme = useTheme();
  const otro = otroUsuario(usuario);

  const [mood, setMood] = useState(null);
  const [emoji, setEmoji] = useState('');
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(
    () =>
      api
        .get('/api/mood')
        .then(({ data }) => {
          setMood(data);
          if (data[usuario]) {
            setEmoji(data[usuario].emoji);
            setNota(data[usuario].nota || '');
          }
        })
        .catch(() => {}),
    [usuario]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async () => {
    if (!emoji) return;
    setGuardando(true);
    try {
      await api.post('/api/mood', { emoji, nota });
      await cargar();
    } finally {
      setGuardando(false);
    }
  };

  if (!mood) {
    return <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />;
  }

  return (
    <Card sx={{ p: 2, border: `1px solid ${theme.palette.primary.main}24` }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        ¿Cómo están hoy?
      </Typography>

      {/* Estado del otro */}
      <Box sx={{ mb: 2 }}>
        <MoodDisplay entrada={mood[otro]} nombre={NOMBRES[otro]} usuario={otro} />
      </Box>

      {/* Formulario propio */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <AvatarUsuario usuario={usuario} size={22} />
          <Typography variant="caption" color="text.secondary">
            Tu estado de hoy
          </Typography>
        </Box>
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <TextField
          size="small"
          placeholder="Una nota corta (opcional)"
          value={nota}
          onChange={(e) => setNota(e.target.value.slice(0, 120))}
          fullWidth
          sx={{ mt: 1.5 }}
          onKeyDown={(e) => e.key === 'Enter' && guardar()}
        />
        <Button variant="contained" size="small" onClick={guardar} disabled={!emoji || guardando} sx={{ mt: 1 }}>
          {mood[usuario] ? 'Actualizar' : 'Registrar'}
        </Button>
      </Box>
    </Card>
  );
}
