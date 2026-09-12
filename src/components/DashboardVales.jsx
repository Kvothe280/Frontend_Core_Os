import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ValeCard from './ValeCard.jsx';
import ValeDrawer from './ValeDrawer.jsx';
import ValeEspecialCard from './ValeEspecialCard.jsx';

export default function DashboardVales({ valesMensuales, onCanjeadoEspecial, cargar }) {
  const [valeSel, setValeSel] = useState(null);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Tus vales
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Cuatro mensuales solo para ti, más uno especial que se desbloquea respondiendo las preguntas del mes.
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <ValeEspecialCard onCanjeado={onCanjeadoEspecial} />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          mb: 4,
        }}
      >
        {(valesMensuales || []).map((vale) => (
          <ValeCard key={vale._id} vale={vale} onOpen={() => setValeSel(vale)} />
        ))}
      </Box>

      <ValeDrawer
        vale={valeSel}
        open={Boolean(valeSel)}
        onClose={() => setValeSel(null)}
        onSuccess={() => {
          setValeSel(null);
          cargar();
        }}
      />
    </>
  );
}
