import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { api } from '../api';

export default function ValeCifradoCard() {
  const theme = useTheme();
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    api.get('/api/vale-cifrado').then(({ data }) => setEstado(data)).catch(() => {});
  }, []);

  if (!estado?.desbloqueado) return null;

  const mesSiguiente = () =>
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      .toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        opacity: 0.8,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        minHeight: 72,
      }}
    >
      <LockOpenIcon sx={{ fontSize: 24, color: 'primary.main', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', lineHeight: 1.2 }}>
          cifrado · especial
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {estado.recompensa}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Se renueva el {mesSiguiente()}
        </Typography>
      </Box>
    </Card>
  );
}
