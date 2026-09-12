import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { mediaUrl } from '../api';

function RecuerdoImagen({ imagen, titulo }) {
  const [roto, setRoto] = useState(false);
  const src = imagen ? mediaUrl(imagen) : '';
  if (!src || roto) return <Box sx={{ height: 140, bgcolor: '#ebe2d6' }} />;
  return (
    <Box
      sx={{
        height: 140,
        bgcolor: '#f5f0eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={src}
        alt={titulo}
        onError={() => setRoto(true)}
        sx={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain', display: 'block' }}
      />
    </Box>
  );
}

export default function RecuerdosRecientesSection({ recuerdosRecientes, onOpenRecuerdos }) {
  const theme = useTheme();

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h5">Recuerdos recientes</Typography>
        <Button onClick={onOpenRecuerdos}>Ver todos / agregar</Button>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(6, 1fr)' },
        }}
      >
        {(recuerdosRecientes || []).map((item) => (
          <Card key={item._id} sx={{ overflow: 'hidden', border: `1px solid ${theme.palette.primary.main}24` }}>
            <RecuerdoImagen imagen={item.imagen} titulo={item.titulo} />
            <Typography variant="caption" sx={{ display: 'block', p: 1 }}>
              {item.titulo}
            </Typography>
          </Card>
        ))}
        {(!recuerdosRecientes || recuerdosRecientes.length === 0) && (
          <Box
            sx={{ gridColumn: '1/-1', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}
          >
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <rect width="56" height="56" rx="16" fill={theme.palette.primary.main + '14'} />
              <rect
                x="12"
                y="16"
                width="32"
                height="24"
                rx="4"
                stroke={theme.palette.primary.main}
                strokeWidth="1.8"
                fill="none"
              />
              <circle cx="22" cy="24" r="3" stroke={theme.palette.primary.main} strokeWidth="1.6" fill="none" />
              <path
                d="M12 33l8-7 6 5 5-4 7 6"
                stroke={theme.palette.primary.main}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Todavía no hay recuerdos guardados.
            </Typography>
            <Button size="small" onClick={onOpenRecuerdos}>
              Agregar el primero
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
