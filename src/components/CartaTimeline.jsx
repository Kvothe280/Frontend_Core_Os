import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { mediaUrl } from '../api';
import { esPdf, fechaFormato } from '../constants/cartaUtils';
import Lightbox from './Lightbox.jsx';

export default function CartaTimeline({ carta, isFirst, primaryColor, onEditar }) {
  const f = fechaFormato(carta);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgRota, setImgRota] = useState(false);
  const imgSrc = carta.imagen ? mediaUrl(carta.imagen) : '';

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4, position: 'relative' }}>
      {/* Línea + dot */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: primaryColor,
            flexShrink: 0,
            mt: 1.5,
            zIndex: 1,
            boxShadow: `0 0 0 3px ${primaryColor}28`,
          }}
        />
        {!isFirst && <Box sx={{ flex: 1, width: 2, bgcolor: `${primaryColor}20`, minHeight: 40, mt: 0.5 }} />}
      </Box>

      {/* Contenido */}
      <Card sx={{ flex: 1, p: 3, border: `1px solid ${primaryColor}18`, background: '#fffaf4' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="overline" sx={{ color: primaryColor, lineHeight: 1 }}>
              {carta.autor}
              {carta.para ? ` para ${carta.para}` : ''}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25 }}>
              {carta.titulo}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexShrink: 0 }}>
            {f && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {f}
              </Typography>
            )}
            <Button size="small" onClick={() => onEditar(carta)} sx={{ minWidth: 0, px: 1 }}>
              Editar
            </Button>
          </Box>
        </Box>

        {carta.imagen &&
          (esPdf(carta.imagen) ? (
            <Box sx={{ mt: 2, mb: 2 }}>
              <iframe
                src={imgSrc}
                title={carta.titulo}
                style={{ width: '100%', height: 420, border: `1px solid ${primaryColor}20`, borderRadius: 8 }}
              />
              <Typography variant="caption">
                <a href={imgSrc} target="_blank" rel="noopener noreferrer">
                  Abrir en nueva pestaña
                </a>
              </Typography>
            </Box>
          ) : imgRota ? (
            <Box
              sx={{
                mt: 2,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: `${primaryColor}08`,
                border: `1px solid ${primaryColor}18`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="14" height="10" rx="2" stroke={primaryColor} strokeWidth="1.3" fill="none" />
                <circle cx="6.5" cy="7.5" r="1.2" stroke={primaryColor} strokeWidth="1.1" fill="none" />
                <path
                  d="M2 11l4-3.5 3 2.5 2-1.5 4 3"
                  stroke={primaryColor}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <Typography variant="caption" sx={{ color: primaryColor, fontStyle: 'italic' }}>
                Imagen no disponible — usa Editar para subirla de nuevo
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                onClick={() => setLightboxOpen(true)}
                role="button"
                tabIndex={0}
                aria-label={`Ver imagen de ${carta.titulo}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxOpen(true);
                  }
                }}
                sx={{
                  mt: 2,
                  mb: 1,
                  cursor: 'zoom-in',
                  display: 'flex',
                  justifyContent: 'center',
                  bgcolor: `${primaryColor}08`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  maxHeight: 300,
                }}
              >
                <Box
                  component="img"
                  src={imgSrc}
                  alt={carta.titulo}
                  onError={() => setImgRota(true)}
                  sx={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Toca la imagen para verla completa
              </Typography>
              <Lightbox src={imgSrc} alt={carta.titulo} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
            </>
          ))}

        {carta.cuerpo && (
          <Typography sx={{ mt: 1.5, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{carta.cuerpo}</Typography>
        )}
      </Card>
    </Box>
  );
}
