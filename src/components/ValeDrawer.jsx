import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { mediaUrl } from '../api';
import CanjeModal from './CanjeModal.jsx';

export default function ValeDrawer({ vale, open, onClose, onSuccess }) {
  const [canjeOpen, setCanjeOpen] = useState(false);
  const disponible = vale?.estado === 'disponible';
  const foto = vale?.imagen ? mediaUrl(vale.imagen) : '';

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            background: '#fffaf4',
            borderLeft: '1px solid rgba(111, 78, 55, 0.2)',
            p: 0,
          },
        }}
      >
        {vale && (
          <Box>
            {foto ? (
              <Box component="img" src={foto} alt={vale.titulo} sx={{ width: '100%', height: 240, objectFit: 'cover' }} />
            ) : (
              <Box sx={{ height: 120, bgcolor: '#ebe2d6' }} />
            )}
            <Box sx={{ p: 3 }}>
              <Typography variant="overline" sx={{ color: 'primary.main' }}>
                {vale.tipo === 'mensual' ? vale.periodo : `Mes ${vale.mes}`} · {vale.tipo}
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {vale.titulo}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {vale.descripcion}
              </Typography>
              <Button fullWidth variant="contained" disabled={!disponible} onClick={() => setCanjeOpen(true)}>
                {disponible ? 'Canjear vale' : vale.estado === 'canjeado' ? 'Ya fue usado' : 'No disponible'}
              </Button>
              <Button fullWidth sx={{ mt: 1 }} onClick={onClose}>
                Cerrar
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
      <CanjeModal
        vale={vale}
        open={canjeOpen}
        onClose={() => setCanjeOpen(false)}
        onSuccess={() => {
          setCanjeOpen(false);
          onSuccess();
        }}
      />
    </>
  );
}
