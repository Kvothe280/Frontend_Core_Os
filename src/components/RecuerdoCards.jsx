import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { mediaUrl } from '../api';
import { etiquetaTipo } from '../constants/recuerdoTipos';
import Lightbox from './Lightbox.jsx';

export function RecuerdoCard({ item, onEditar, onBorrar }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgRota, setImgRota] = useState(false);
  const imgSrc = item.imagen ? mediaUrl(item.imagen) : '';

  return (
    <Card sx={{ overflow: 'hidden' }}>
      {imgSrc && !imgRota ? (
        <>
          <Box
            onClick={() => setLightboxOpen(true)}
            sx={{
              cursor: 'zoom-in',
              bgcolor: '#f5f0eb',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 180,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={imgSrc}
              alt={item.titulo}
              onError={() => setImgRota(true)}
              sx={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain', display: 'block' }}
            />
          </Box>
          <Lightbox src={imgSrc} alt={item.titulo} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
        </>
      ) : (
        <Box sx={{ height: 80, bgcolor: '#ebe2d6' }} />
      )}
      <Box sx={{ p: 2 }}>
        <Typography variant="overline">{etiquetaTipo(item.tipo)}</Typography>
        <Typography variant="h6">{item.titulo}</Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(item.fecha).toLocaleDateString('es-MX')}
        </Typography>
        {item.nota && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {item.nota}
          </Typography>
        )}
        {item.imagen && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Toca la imagen para verla completa
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button size="small" onClick={() => onEditar(item)}>
            Editar
          </Button>
          <Button size="small" color="error" onClick={() => onBorrar(item._id)}>
            Quitar
          </Button>
        </Box>
      </Box>
    </Card>
  );
}

export function GaleriaCard({ item }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgRota, setImgRota] = useState(false);
  const imgSrc = item.imagen ? mediaUrl(item.imagen) : '';

  return (
    <Card sx={{ overflow: 'hidden', border: '1px solid rgba(111,78,55,0.12)' }}>
      <Box
        onClick={() => imgSrc && !imgRota && setLightboxOpen(true)}
        sx={{
          cursor: imgSrc && !imgRota ? 'zoom-in' : 'default',
          bgcolor: '#f5f0eb',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
          overflow: 'hidden',
        }}
      >
        {imgSrc && !imgRota ? (
          <Box
            component="img"
            src={imgSrc}
            alt={item.titulo}
            onError={() => setImgRota(true)}
            sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, opacity: 0.35 }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect x="4" y="8" width="28" height="20" rx="3" stroke="#8b7355" strokeWidth="1.6" fill="none" />
              <circle cx="13" cy="16" r="2.5" stroke="#8b7355" strokeWidth="1.4" fill="none" />
              <path
                d="M4 22l8-7 5 4 4-3 7 6"
                stroke="#8b7355"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <Typography variant="caption" sx={{ color: '#8b7355', fontSize: '0.65rem' }}>
              Sin imagen
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block' }}>
          {etiquetaTipo(item.tipo)}
        </Typography>
        <Typography variant="subtitle2">{item.titulo}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(item.fecha).toLocaleDateString('es-MX')}
        </Typography>
        {item.nota && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
            {item.nota}
          </Typography>
        )}
      </Box>
      {imgSrc && !imgRota && (
        <Lightbox src={imgSrc} alt={item.titulo} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
      )}
    </Card>
  );
}
