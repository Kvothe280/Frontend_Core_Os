import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, mediaUrl } from '../api';
import ValeCard from './ValeCard.jsx';
import ValeDrawer from './ValeDrawer.jsx';
import ValeEspecialCard from './ValeEspecialCard.jsx';

function MetricCard({ label, value, hint, onClick }) {
  const theme = useTheme();
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${theme.palette.primary.main}29`,
        background: '#fff',
      }}
    >
      <Typography variant="overline" sx={{ color: 'primary.main' }}>
        {label}
      </Typography>
      <Typography variant="h3" sx={{ my: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {hint}
      </Typography>
    </Card>
  );
}

export default function HomeDashboard({ tick, usuario, onOpenCartas, onOpenRecuerdos }) {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [valeSel, setValeSel] = useState(null);
  const [tickLocal, setTickLocal] = useState(0);

  const cargar = () => {
    api
      .get('/api/dashboard')
      .then(({ data: payload }) => setData(payload))
      .catch(() => setError('No me pude conectar con el núcleo. ¿Está corriendo el backend?'));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, tickLocal]);

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4 }}>
        {error}
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4 }}>
        Cargando todo lo nuestro…
      </Typography>
    );
  }

  const { metricas } = data;

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.18em' }}>
        Hola, {usuario === 'karol' ? 'Karol' : 'Enrique'}
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Nuestro panel
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        Desde el 18 de febrero de 2026 todo quedó aquí guardado. Las cartas, los recuerdos y lo que construimos juntos.
      </Typography>

      {/* Métricas */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          mb: 3,
        }}
      >
        <MetricCard label="Días juntos" value={metricas.diasJuntos} hint="Desde el 18 de febrero de 2026" />
        <MetricCard
          label="Cartas escritas"
          value={metricas.cartasEscritas}
          hint="Toca para leer o agregar"
          onClick={onOpenCartas}
        />
        <MetricCard
          label="Citas"
          value={metricas.citas}
          hint="Se cuentan desde Recuerdos"
          onClick={onOpenRecuerdos}
        />
        <MetricCard
          label="Vales canjeados"
          value={metricas.valesCanjeados}
          hint="Total acumulado"
        />
      </Box>

      {/* Gráfica */}
      <Card sx={{ p: 2, mb: 4, border: `1px solid ${theme.palette.primary.main}24`, height: 280 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Cartas y citas
        </Typography>
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={data.serie}>
            <defs>
              <linearGradient id="citaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.35} />
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(59, 42, 29, 0.08)" />
            <XAxis dataKey="mes" stroke="#6b5344" />
            <YAxis stroke="#6b5344" allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${theme.palette.primary.main}`, color: theme.palette.text.primary }} />
            <Area type="monotone" dataKey="citas" name="Citas" stroke={theme.palette.primary.main} fill="url(#citaFill)" />
            <Area type="monotone" dataKey="cartas" name="Cartas" stroke="#a67c52" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Vales */}
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Tus vales
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Cuatro mensuales solo para ti, más uno especial que se desbloquea respondiendo las preguntas del mes.
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <ValeEspecialCard onCanjeado={() => setTickLocal((n) => n + 1)} />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          mb: 4,
        }}
      >
        {(data.valesMensuales || []).map((vale) => (
          <ValeCard key={vale._id} vale={vale} onOpen={() => setValeSel(vale)} />
        ))}
      </Box>

      {/* Recuerdos recientes */}
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
        {(data.recuerdosRecientes || []).map((item) => (
          <Card key={item._id} sx={{ overflow: 'hidden', border: `1px solid ${theme.palette.primary.main}24` }}>
            {item.imagen ? (
              <Box sx={{
                height: 140,
                bgcolor: '#f5f0eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <Box
                  component="img"
                  src={mediaUrl(item.imagen)}
                  alt={item.titulo}
                  sx={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain', display: 'block' }}
                />
              </Box>
            ) : (
              <Box sx={{ height: 140, bgcolor: '#ebe2d6' }} />
            )}
            <Typography variant="caption" sx={{ display: 'block', p: 1 }}>
              {item.titulo}
            </Typography>
          </Card>
        ))}
        {(!data.recuerdosRecientes || data.recuerdosRecientes.length === 0) && (
          <Typography color="text.secondary">Aún no hay recuerdos. Agréguenlos en la pestaña Recuerdos.</Typography>
        )}
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
    </Box>
  );
}
