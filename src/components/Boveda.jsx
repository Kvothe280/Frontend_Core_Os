import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import { api } from '../api';
import ValeCard from './ValeCard.jsx';
import ValeDrawer from './ValeDrawer.jsx';

export default function Boveda({ tick }) {
  const [payload, setPayload] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);

  const cargar = () => {
    api.get('/api/vales').then(({ data }) => setPayload(data));
  };

  useEffect(() => { cargar(); }, [tick]);

  if (!payload) return null;

  const mensuales = payload.vales.filter((v) => v.tipo === 'mensual' && v.estado !== 'canjeado');
  const especiales = payload.vales.filter((v) => v.tipo !== 'mensual' && v.estado !== 'canjeado');
  const usados = payload.vales.filter((v) => v.estado === 'canjeado');

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>Solo para ti</Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>Nuestros Vales</Typography>

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Este mes</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, mb: 4 }}>
        {mensuales.map((vale) => (
          <ValeCard key={vale._id} vale={vale} onOpen={() => setSeleccionado(vale)} />
        ))}
      </Box>

      {!payload.bovedaAbierta ? (
        <Box sx={{ minHeight: 240, display: 'grid', placeItems: 'center', border: '1px dashed rgba(111, 78, 55, 0.4)', borderRadius: 3, background: '#efe8df', mb: 3 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 420, p: 3 }}>
            <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4">Vales especiales cifrados</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Completa los 6 enigmas en Terminal para abrir este archivo.
            </Typography>
            <Typography variant="overline" sx={{ color: 'primary.main' }}>
              Protocolo {payload.enigmasResueltos}/{payload.enigmasTotal}
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>Archivo especial desencriptado. Estos son solo tuyos.</Alert>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' } }}>
            {especiales.map((vale) => (
              <ValeCard key={vale._id} vale={vale} onOpen={() => setSeleccionado(vale)} />
            ))}
          </Box>
        </>
      )}

      {usados.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Ya usados</Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' } }}>
            {usados.map((vale) => (
              <ValeCard key={vale._id} vale={vale} onOpen={() => setSeleccionado(vale)} />
            ))}
          </Box>
        </>
      )}

      <ValeDrawer
        vale={seleccionado}
        open={Boolean(seleccionado)}
        onClose={() => setSeleccionado(null)}
        onSuccess={() => { setSeleccionado(null); cargar(); }}
      />
    </Box>
  );
}
