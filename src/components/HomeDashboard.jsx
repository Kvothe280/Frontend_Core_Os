import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api';
import CancionWidget from './CancionWidget.jsx';
import CountdownWidget from './CountdownWidget.jsx';
import DashboardVales from './DashboardVales.jsx';
import LogrosWidget from './LogrosWidget.jsx';
import MoodWidget from './MoodWidget.jsx';
import RecuerdosRecientesSection from './RecuerdosRecientesSection.jsx';
import WishlistWidget from './WishlistWidget.jsx';
import { nombreDe } from '../constants/usuarios';

function MetricCard({ label, value, hint, onClick }) {
  const theme = useTheme();
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${theme.palette.primary.main}29`,
        background: theme.palette.background.paper,
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

function saludoDinamico(usuario) {
  const hora = new Date().getHours();
  const nombre = nombreDe(usuario);
  if (hora < 12) return `Buenos días, ${nombre}`;
  if (hora < 19) return `Buenas tardes, ${nombre}`;
  return `Buenas noches, ${nombre}`;
}

export default function HomeDashboard({ tick, usuario, onOpenCartas, onOpenRecuerdos }) {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tickLocal, setTickLocal] = useState(0);

  const cargar = () => {
    api
      .get('/api/dashboard')
      .then(({ data: payload }) => setData(payload))
      .catch(() => setError('No me pude conectar con el núcleo. ¿Está corriendo el backend?'));
  };

  useEffect(() => {
    cargar();
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
      <Box>
        <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={380} height={20} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            mb: 3,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2, mb: 4 }} />
        <Skeleton variant="text" width={140} height={30} sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(6, 1fr)' } }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  const { metricas } = data;

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.18em' }}>
        {saludoDinamico(usuario)}
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Nuestro panel
      </Typography>
      <Typography
        sx={{
          mb: 3,
          maxWidth: 640,
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontStyle: 'italic',
          fontSize: '1.1rem',
          color: 'text.secondary',
        }}
      >
        {metricas.diasJuntos === 1
          ? 'El primer día de todo lo nuestro.'
          : `${metricas.diasJuntos} días construyendo algo bonito juntos.`}
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
        <MetricCard label="Citas" value={metricas.citas} hint="Se cuentan desde Recuerdos" onClick={onOpenRecuerdos} />
        <MetricCard label="Vales canjeados" value={metricas.valesCanjeados} hint="Total acumulado" />
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
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: `1px solid ${theme.palette.primary.main}`,
                color: theme.palette.text.primary,
              }}
            />
            <Area
              type="monotone"
              dataKey="citas"
              name="Citas"
              stroke={theme.palette.primary.main}
              fill="url(#citaFill)"
            />
            <Area type="monotone" dataKey="cartas" name="Cartas" stroke="#a67c52" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Widgets secundarios */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, mb: 4 }}>
        <MoodWidget usuario={usuario} />
        <CountdownWidget fechaInicio={data.fechaInicio} />
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, mb: 4 }}>
        <CancionWidget usuario={usuario} />
        <WishlistWidget />
      </Box>
      <Box sx={{ mb: 4 }}>
        <LogrosWidget />
      </Box>

      {/* Vales */}
      <DashboardVales
        valesMensuales={data.valesMensuales}
        onCanjeadoEspecial={() => setTickLocal((n) => n + 1)}
        cargar={cargar}
      />

      {/* Recuerdos recientes */}
      <RecuerdosRecientesSection recuerdosRecientes={data.recuerdosRecientes} onOpenRecuerdos={onOpenRecuerdos} />
    </Box>
  );
}
