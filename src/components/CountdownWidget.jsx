import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useApi } from '../hooks/useApi';

const FIJAS = [
  { label: 'Aniversario', mes: 2, dia: 18, emoji: '💑' },
  { label: 'Cumple Karol', mes: 2, dia: 22, emoji: '🎂' },
  { label: 'Cumple Enrique', mes: 9, dia: 28, emoji: '🎂' },
];

function diasHasta(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.ceil((fecha - hoy) / 86400000);
}

function proximaFija(mes, dia) {
  const hoy = new Date();
  let d = new Date(hoy.getFullYear(), mes - 1, dia);
  if (d < hoy) d.setFullYear(hoy.getFullYear() + 1);
  return d;
}

export default function CountdownWidget() {
  const theme = useTheme();
  const { data: citas } = useApi('/api/citas-propuestas');

  const items = useMemo(() => {
    const fijas = FIJAS.map((f) => {
      const fecha = proximaFija(f.mes, f.dia);
      return { label: f.label, emoji: f.emoji, dias: diasHasta(fecha) };
    });

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const citasItems = (citas || [])
      .filter((c) => c.estado !== 'rechazada' && c.estado !== 'cancelada' && new Date(c.fechaPropuesta) >= hoy)
      .map((c) => ({ label: c.titulo, emoji: '📅', dias: diasHasta(new Date(c.fechaPropuesta)) }))
      .slice(0, 2);

    return [...fijas, ...citasItems].sort((a, b) => a.dias - b.dias).slice(0, 5);
  }, [citas]);

  return (
    <Card sx={{ p: 2, border: `1px solid ${theme.palette.primary.main}24` }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>Próximas fechas</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {items.map((f) => (
          <Box key={f.label} sx={{
            flex: '1 1 90px',
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${theme.palette.primary.main}0f`,
            border: `1px solid ${theme.palette.primary.main}20`,
            textAlign: 'center',
          }}>
            <Typography fontSize="1.4rem" lineHeight={1} mb={0.5}>{f.emoji}</Typography>
            <Typography variant="h4" sx={{ color: 'primary.main', lineHeight: 1 }}>{f.dias}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">días</Typography>
            <Typography variant="caption" fontWeight={500} noWrap>{f.label}</Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
