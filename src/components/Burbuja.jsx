import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { mediaUrl } from '../api';
import { nombreDe } from '../constants/usuarios';
import Lightbox from './Lightbox.jsx';

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export default function Burbuja({ msg, esPropio, primary, onBorrar }) {
  const [lightbox, setLightbox] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: esPropio ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 0.5,
        mb: 1,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Burbuja */}
      <Box
        sx={{
          maxWidth: { xs: '80%', sm: '60%' },
          bgcolor: esPropio ? primary : 'background.paper',
          color: esPropio ? '#fff' : 'text.primary',
          borderRadius: esPropio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          border: esPropio ? 'none' : '1px solid rgba(111,78,55,0.15)',
          p: msg.imagen ? 0.5 : '8px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {msg.imagen && (
          <Box
            onClick={() => setLightbox(true)}
            role="button"
            tabIndex={0}
            aria-label={`Ver imagen de ${nombreDe(msg.autor)}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightbox(true);
              }
            }}
            sx={{ cursor: 'zoom-in', borderRadius: '12px', overflow: 'hidden', mb: msg.contenido ? 0.5 : 0 }}
          >
            <Box
              component="img"
              src={mediaUrl(msg.imagen, { auth: true })}
              alt={`Imagen de ${nombreDe(msg.autor)}`}
              sx={{
                display: 'block',
                maxWidth: 260,
                maxHeight: 220,
                objectFit: 'contain',
                bgcolor: esPropio ? `${primary}cc` : '#f5f0eb',
              }}
            />
          </Box>
        )}
        {msg.contenido && (
          <Typography
            variant="body2"
            sx={{
              px: msg.imagen ? 1 : 0,
              pb: msg.imagen ? 0.5 : 0,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {msg.contenido}
          </Typography>
        )}
        <Lightbox
          src={mediaUrl(msg.imagen, { auth: true })}
          alt={`Imagen de ${nombreDe(msg.autor)}`}
          open={lightbox}
          onClose={() => setLightbox(false)}
        />
      </Box>

      {/* Tiempo + borrar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: esPropio ? 'flex-end' : 'flex-start',
          gap: 0.25,
          minWidth: 36,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
          {tiempoRelativo(msg.createdAt)}
        </Typography>
        {esPropio && (
          <IconButton
            size="small"
            onClick={() => onBorrar(msg._id)}
            sx={{
              opacity: hover ? 1 : 0,
              transition: 'opacity 0.15s',
              p: 0.25,
              color: 'text.disabled',
              '&:hover': { color: 'error.main' },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
