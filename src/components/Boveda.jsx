import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { api } from '../api';
import ValeCard from './ValeCard.jsx';
import ValeDrawer from './ValeDrawer.jsx';
import ValeEspecialCard from './ValeEspecialCard.jsx';

export default function Boveda({ tick }) {
  const [vales, setVales] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [tickLocal, setTickLocal] = useState(0);
  const [error, setError] = useState('');

  const cargar = () => {
    api
      .get('/api/vales')
      .then(({ data }) => {
        setVales(data.vales || []);
        setError('');
      })
      .catch(() => setError('No se pudo cargar.'));
  };

  useEffect(() => {
    cargar();
  }, [tick, tickLocal]);

  const mensuales = vales.filter((v) => v.tipo === 'mensual' && v.estado !== 'canjeado');
  const usados = vales.filter((v) => v.estado === 'canjeado');

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>
        Solo para ti
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Nuestros Vales
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Vale especial del mes */}
      <Box sx={{ mb: 3 }}>
        <ValeEspecialCard onCanjeado={() => setTickLocal((n) => n + 1)} />
      </Box>

      {/* Vales mensuales */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Este mes ({mensuales.length})
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          mb: 4,
        }}
      >
        {mensuales.map((vale) => (
          <ValeCard key={vale._id} vale={vale} onOpen={() => setSeleccionado(vale)} />
        ))}
        {mensuales.length === 0 && (
          <Typography color="text.secondary">Sin vales mensuales disponibles este mes.</Typography>
        )}
      </Box>

      {/* Usados */}
      {usados.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Ya usados
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
            }}
          >
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
        onSuccess={() => {
          setSeleccionado(null);
          cargar();
        }}
      />
    </Box>
  );
}
