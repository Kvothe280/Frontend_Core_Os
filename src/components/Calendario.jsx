import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { api } from '../api';
import CalendarioGrid from './CalendarioGrid.jsx';
import { TIPO_COLOR, TIPO_LABEL } from '../constants/calendarioTipos';
import CitasSidebar from './CitasSidebar.jsx';
import PropCitaModal from './PropCitaModal.jsx';
import { nombreDe } from '../constants/usuarios';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function mesStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ── Detalle del día ────────────────────────────────────────────────────────

function DiaDetalle({ dia, eventos }) {
  const theme = useTheme();
  if (!dia || !eventos?.length) return null;

  return (
    <Card sx={{ mt: 2, p: 2, border: `1px solid ${theme.palette.primary.main}29` }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>
        {new Date(dia + 'T12:00:00').toLocaleDateString('es-MX', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Typography>
      {eventos.map((ev, i) => {
        const color = ev.tipo === 'vale_canjeado' ? theme.palette.primary.main : TIPO_COLOR[ev.tipo];
        return (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mt: '5px', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  {TIPO_LABEL[ev.tipo]}
                </Typography>
                {ev.proponente && (
                  <Typography variant="caption" color="text.secondary">
                    · {nombreDe(ev.proponente)} → {nombreDe(ev.destinatario)}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2">{ev.titulo}</Typography>
            </Box>
          </Box>
        );
      })}
    </Card>
  );
}

// ── Página principal ───────────────────────────────────────────────────────

export default function Calendario({ usuario }) {
  const theme = useTheme();
  const [mesRef, setMesRef] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });
  const [eventos, setEventos] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [citas, setCitas] = useState([]);
  const [formOpen, setFormOpen] = useState(false);

  const cargarEventos = useCallback(() => {
    api
      .get(`/api/calendario?mes=${mesStr(mesRef)}`)
      .then(({ data }) => setEventos(data))
      .catch(() => {});
  }, [mesRef]);
  const cargarCitas = useCallback(() => {
    api
      .get('/api/citas-propuestas')
      .then(({ data }) => setCitas(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);
  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  const refresh = () => {
    cargarEventos();
    cargarCitas();
  };

  const irMesAnterior = () => setMesRef((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const irMesSiguiente = () => setMesRef((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const eventosDelDia = diaSeleccionado ? eventos[diaSeleccionado] || [] : [];

  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const citasActivas = citas.filter((c) => new Date(c.fechaPropuesta) >= hoyInicio);

  // Leyenda de colores
  const leyenda = [
    { tipo: 'vale_canjeado', color: theme.palette.primary.main },
    { tipo: 'cita_registrada', color: TIPO_COLOR.cita_registrada },
    { tipo: 'cita_confirmada', color: TIPO_COLOR.cita_confirmada },
    { tipo: 'cita_pendiente', color: TIPO_COLOR.cita_pendiente },
    { tipo: 'recuerdo', color: TIPO_COLOR.recuerdo },
    { tipo: 'carta', color: TIPO_COLOR.carta },
  ];

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>
        Nuestro tiempo
      </Typography>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Calendario
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
        {/* ── Columna izquierda: grid ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Navegación de mes */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton onClick={irMesAnterior} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6">
              {MESES[mesRef.getMonth()]} {mesRef.getFullYear()}
            </Typography>
            <IconButton onClick={irMesSiguiente} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <CalendarioGrid
            mesRef={mesRef}
            eventos={eventos}
            diaSeleccionado={diaSeleccionado}
            onSelectDia={setDiaSeleccionado}
          />

          {/* Leyenda */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
            {leyenda.map(({ tipo, color }) => (
              <Box key={tipo} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                <Typography variant="caption" color="text.secondary">
                  {TIPO_LABEL[tipo]}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Detalle del día seleccionado */}
          <DiaDetalle dia={diaSeleccionado} eventos={eventosDelDia} />
        </Box>

        {/* ── Sidebar: citas ── */}
        <CitasSidebar citas={citasActivas} usuario={usuario} onRefresh={refresh} onProponer={() => setFormOpen(true)} />
      </Box>

      <PropCitaModal open={formOpen} onClose={() => setFormOpen(false)} onCreada={refresh} />
    </Box>
  );
}
