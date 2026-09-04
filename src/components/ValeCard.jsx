import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { mediaUrl } from '../api';

function etiqueta(vale) {
  if (vale.tipo === 'mensual') return vale.periodo || 'Este mes';
  if (vale.mes) return `Mes ${vale.mes}`;
  return vale.tipo;
}

export default function ValeCard({ vale, onOpen }) {
  const canjeado = vale.estado === 'canjeado';
  const foto = vale.imagen ? mediaUrl(vale.imagen) : '';

  return (
    <Card
      sx={{
        overflow: 'hidden',
        border: '1px solid rgba(111, 78, 55, 0.18)',
        background: '#fff',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px rgba(59, 42, 29, 0.12)',
        },
      }}
    >
      <CardActionArea onClick={onOpen}>
        <Box sx={{ position: 'relative' }}>
          {foto ? (
            <CardMedia
              component="img"
              image={foto}
              alt={vale.titulo}
              sx={{ height: 160, objectFit: 'cover', filter: canjeado ? 'grayscale(0.45)' : 'none' }}
            />
          ) : (
            <Box sx={{ height: 120, bgcolor: '#ebe2d6' }} />
          )}
          <Chip
            size="small"
            label={etiqueta(vale)}
            sx={{ position: 'absolute', top: 12, left: 12, background: '#fffaf4', color: 'primary.main' }}
          />
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="overline" sx={{ color: canjeado ? '#8d8d8d' : 'primary.main' }}>
            {canjeado ? 'Usado' : 'Disponible'} · {vale.tipo}
          </Typography>
          <Typography variant="h6">{vale.titulo}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Abrir panel →
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}
