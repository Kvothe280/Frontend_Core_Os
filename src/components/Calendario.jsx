import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import { api } from '../api';

// ── Colores por tipo de evento ─────────────────────────────────────────────

const TIPO_COLOR = {
  vale_canjeado:  null,           // usa primary del tema
  recuerdo:       '#a67c52',
  cita_registrada:'#43a047',
  carta:          '#8e44ad',
  cita_confirmada:'#1976d2',
  cita_pendiente: '#f57c00',
};

const TIPO_LABEL = {
  vale_canjeado:   'Vale canjeado',
  recuerdo:        'Recuerdo',
  cita_registrada: 'Cita',
  carta:           'Carta',
  cita_confirmada: 'Cita confirmada',
  cita_pendiente:  'Cita pendiente',
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

// ── Helpers ────────────────────────────────────────────────────────────────

function mesStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function diaStr(date, d) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function buildGrid(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let dow = firstDay.getDay();
  if (dow === 0) dow = 7;
  const offset = dow - 1;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function formatFechaCita(fecha) {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ── Formulario proponer cita ───────────────────────────────────────────────

function FormProponerCita({ open, onClose, onCreada }) {
  const [form, setForm] = useState({ titulo: '', nota: '', fecha: '', hora: '19:00' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.titulo || !form.fecha) { setError('Título y fecha son obligatorios.'); return; }
    setLoading(true);
    try {
      const fechaPropuesta = new Date(`${form.fecha}T${form.hora}:00`);
      await api.post('/api/citas-propuestas', { titulo: form.titulo, nota: form.nota, fechaPropuesta });
      setForm({ titulo: '', nota: '', fecha: '', hora: '19:00' });
      onCreada?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la cita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Proponer cita</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Título" fullWidth sx={{ mt: 1, mb: 2 }} required value={form.titulo}
          onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} />
        <TextField label="Nota (opcional)" fullWidth multiline rows={2} sx={{ mb: 2 }} value={form.nota}
          onChange={(e) => setForm((p) => ({ ...p, nota: e.target.value }))} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="Fecha" type="date" fullWidth required value={form.fecha} InputLabelProps={{ shrink: true }}
            onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} />
          <TextField label="Hora" type="time" sx={{ width: 130 }} required value={form.hora} InputLabelProps={{ shrink: true }}
            onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>Proponer</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Card cita pendiente ────────────────────────────────────────────────────

function CitaPendienteCard({ cita, usuario, onRefresh }) {
  const theme = useTheme();
  const esMia = cita.proponente === usuario;
  const [loading, setLoading] = useState(false);

  const accion = async (endpoint) => {
    setLoading(true);
    try {
      if (endpoint === 'aceptar') await api.put(`/api/citas-propuestas/${cita._id}/aceptar`);
      else if (endpoint === 'rechazar') await api.delete(`/api/citas-propuestas/${cita._id}/rechazar`);
      else if (endpoint === 'cancelar') await api.delete(`/api/citas-propuestas/${cita._id}/cancelar`);
      onRefresh?.();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const esAceptada = cita.estado === 'aceptada';

  return (
    <Card sx={{ p: 2, mb: 1.5, border: `1px solid ${esAceptada ? theme.palette.success.main + '50' : theme.palette.primary.main + '29'}`, background: esAceptada ? `${theme.palette.success.main}08` : 'transparent' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>{cita.titulo}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {formatFechaCita(cita.fechaPropuesta)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Propuso: {cita.proponente === 'karol' ? 'Karol' : 'Enrique'}
          </Typography>
          {cita.nota && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
              {cita.nota}
            </Typography>
          )}
        </Box>
        <Chip label={esAceptada ? 'confirmada' : 'pendiente'} size="small" color={esAceptada ? 'success' : 'warning'} />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
        {!esMia && !esAceptada && (
          <Button size="small" variant="contained" onClick={() => accion('aceptar')} disabled={loading}>Aceptar</Button>
        )}
        {!esMia && !esAceptada && (
          <Button size="small" color="error" onClick={() => accion('rechazar')} disabled={loading}>Rechazar</Button>
        )}
        <Button size="small" variant="outlined" color="inherit" onClick={() => accion('cancelar')} disabled={loading}>
          {esAceptada ? 'Cancelar cita' : esMia ? 'Retirar' : null}
        </Button>
      </Box>
    </Card>
  );
}

// ── Detalle del día ────────────────────────────────────────────────────────

function DiaDetalle({ dia, eventos, usuario, onRefresh }) {
  const theme = useTheme();
  if (!dia || !eventos?.length) return null;

  const completar = async (id) => {
    try { await api.put(`/api/citas-propuestas/${id}/completar`); onRefresh?.(); }
    catch { /* ignore */ }
  };

  return (
    <Card sx={{ mt: 2, p: 2, border: `1px solid ${theme.palette.primary.main}29` }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main' }}>
        {new Date(dia + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </Typography>
      {eventos.map((ev, i) => {
        const color = ev.tipo === 'vale_canjeado' ? theme.palette.primary.main : TIPO_COLOR[ev.tipo];
        return (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mt: '5px', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {TIPO_LABEL[ev.tipo]}
                </Typography>
                {ev.proponente && (
                  <Typography variant="caption" color="text.secondary">
                    · {ev.proponente === 'karol' ? 'Karol' : 'Enrique'} → {ev.destinatario === 'karol' ? 'Karol' : 'Enrique'}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2">{ev.titulo}</Typography>
              {(ev.tipo === 'cita_confirmada') && (ev.proponente === usuario || ev.destinatario === usuario) && (
                <Button size="small" sx={{ mt: 0.5, p: 0 }} onClick={() => completar(ev.id)}>
                  Marcar como completada
                </Button>
              )}
            </Box>
          </Box>
        );
      })}
    </Card>
  );
}

// ── Grid del mes ───────────────────────────────────────────────────────────

function CalendarioGrid({ mesRef, eventos, diaSeleccionado, onSelectDia }) {
  const theme = useTheme();
  const year = mesRef.getFullYear();
  const month = mesRef.getMonth() + 1;
  const cells = buildGrid(year, month);
  const hoy = new Date();
  const esHoy = (d) => hoy.getFullYear() === year && hoy.getMonth() + 1 === month && hoy.getDate() === d;

  return (
    <Box>
      {/* Cabecera días de la semana */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {DIAS_SEMANA.map((d) => (
          <Typography key={d} variant="caption" sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 600, py: 0.5 }}>
            {d}
          </Typography>
        ))}
      </Box>

      {/* Celdas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((d, i) => {
          if (!d) return <Box key={`empty-${i}`} />;
          const key = diaStr(mesRef, d);
          const evs = eventos[key] || [];
          const seleccionado = diaSeleccionado === key;
          const hoyFlag = esHoy(d);

          return (
            <Box
              key={key}
              onClick={() => onSelectDia(seleccionado ? null : key)}
              sx={{
                minHeight: 64,
                p: 0.75,
                borderRadius: 1.5,
                cursor: 'pointer',
                border: seleccionado
                  ? `2px solid ${theme.palette.primary.main}`
                  : '2px solid transparent',
                background: seleccionado
                  ? `${theme.palette.primary.main}10`
                  : hoyFlag
                  ? `${theme.palette.primary.main}08`
                  : theme.palette.background.paper,
                '&:hover': { background: `${theme.palette.primary.main}14` },
                transition: 'all 0.15s',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontWeight: hoyFlag ? 800 : 500,
                  color: hoyFlag ? theme.palette.primary.main : 'text.primary',
                  mb: 0.5,
                }}
              >
                {d}
              </Typography>
              {/* Puntos de eventos */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {evs.slice(0, 6).map((ev, j) => {
                  const color = ev.tipo === 'vale_canjeado' ? theme.palette.primary.main : TIPO_COLOR[ev.tipo];
                  return (
                    <Box key={j} sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                  );
                })}
                {evs.length > 6 && (
                  <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>+{evs.length - 6}</Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
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

  const cargarEventos = () => {
    api.get(`/api/calendario?mes=${mesStr(mesRef)}`).then(({ data }) => setEventos(data)).catch(() => {});
  };
  const cargarCitas = () => {
    api.get('/api/citas-propuestas').then(({ data }) => setCitas(data)).catch(() => {});
  };

  useEffect(() => { cargarEventos(); }, [mesRef]);
  useEffect(() => { cargarCitas(); }, []);

  const refresh = () => { cargarEventos(); cargarCitas(); };

  const irMesAnterior = () => setMesRef((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const irMesSiguiente = () => setMesRef((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const eventosDelDia = diaSeleccionado ? (eventos[diaSeleccionado] || []) : [];

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
      <Typography variant="overline" sx={{ color: 'primary.main' }}>Nuestro tiempo</Typography>
      <Typography variant="h3" sx={{ mb: 3 }}>Calendario</Typography>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* ── Columna izquierda: grid ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Navegación de mes */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton onClick={irMesAnterior} size="small"><ChevronLeftIcon /></IconButton>
            <Typography variant="h6">
              {MESES[mesRef.getMonth()]} {mesRef.getFullYear()}
            </Typography>
            <IconButton onClick={irMesSiguiente} size="small"><ChevronRightIcon /></IconButton>
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
                <Typography variant="caption" color="text.secondary">{TIPO_LABEL[tipo]}</Typography>
              </Box>
            ))}
          </Box>

          {/* Detalle del día seleccionado */}
          <DiaDetalle
            dia={diaSeleccionado}
            eventos={eventosDelDia}
            usuario={usuario}
            onRefresh={refresh}
          />
        </Box>

        {/* ── Sidebar: citas ── */}
        <Box sx={{ width: 300, flexShrink: 0 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EventIcon />}
            onClick={() => setFormOpen(true)}
            sx={{ mb: 2.5 }}
          >
            Proponer cita
          </Button>

          <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 11 }}>
            Citas activas
          </Typography>

          {citas.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Sin citas pendientes ni confirmadas.
            </Typography>
          )}

          {citas.map((cita) => (
            <CitaPendienteCard key={cita._id} cita={cita} usuario={usuario} onRefresh={refresh} />
          ))}
        </Box>
      </Box>

      <FormProponerCita
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreada={refresh}
      />
    </Box>
  );
}
