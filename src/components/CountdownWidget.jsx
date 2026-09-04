import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { useApi } from '../hooks/useApi';
import FechaImportanteDialog from './FechaImportanteDialog.jsx';

function diasHasta(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.ceil((fecha - hoy) / 86400000);
}

// Parsea un string 'YYYY-MM-DD' (o un ISO datetime, se toma solo la fecha) como
// medianoche LOCAL, evitando el corrimiento de un día que da `new Date(str)`
// cuando el string se interpreta como UTC y la zona local va detrás.
function parseFechaLocal(str) {
  const [y, m, d] = String(str).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function proximaOcurrenciaAnual(fechaBase) {
  const base = parseFechaLocal(fechaBase);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let d = new Date(hoy.getFullYear(), base.getMonth(), base.getDate());
  if (d < hoy) d.setFullYear(hoy.getFullYear() + 1);
  return d;
}

// Próximo múltiplo de 3 meses desde el aniversario que aún no ha pasado. No se persiste:
// se recalcula en cada render, así que al pasar la fecha salta solo al siguiente múltiplo.
function proximoMesiversario(fechaInicioStr) {
  if (!fechaInicioStr) return null;
  const inicio = parseFechaLocal(fechaInicioStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  for (let n = 3; n <= 120; n += 3) {
    const fecha = new Date(inicio);
    fecha.setMonth(fecha.getMonth() + n);
    if (fecha >= hoy) {
      return { label: `${n} meses juntos`, emoji: '💜', dias: diasHasta(fecha) };
    }
  }
  return null;
}

export default function CountdownWidget() {
  const theme = useTheme();
  const { data: citas } = useApi('/api/citas-propuestas');
  const { data: fechas, refetch } = useApi('/api/fechas-importantes');
  const { data: dashboard } = useApi('/api/dashboard');
  const [dialogItem, setDialogItem] = useState(undefined); // undefined=cerrado, null=crear, objeto=editar

  const items = useMemo(() => {
    const fechasItems = (fechas || [])
      .map((f) => {
        const fecha = f.tipo === 'anual' ? proximaOcurrenciaAnual(f.fecha) : parseFechaLocal(f.fecha);
        return { label: f.titulo, emoji: f.emoji || '📌', dias: diasHasta(fecha), _raw: f, _editable: true };
      })
      .filter((f) => f.dias >= 0);

    const mesiversario = proximoMesiversario(dashboard?.fechaInicio);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const citasItems = (citas || [])
      .filter((c) => c.estado !== 'rechazada' && c.estado !== 'cancelada' && new Date(c.fechaPropuesta) >= hoy)
      .map((c) => ({ label: c.titulo, emoji: '📅', dias: diasHasta(new Date(c.fechaPropuesta)) }))
      .slice(0, 2);

    return [...fechasItems, ...(mesiversario ? [mesiversario] : []), ...citasItems]
      .sort((a, b) => a.dias - b.dias)
      .slice(0, 5);
  }, [fechas, citas, dashboard]);

  return (
    <Card sx={{ p: 2, border: `1px solid ${theme.palette.primary.main}24` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6">Próximas fechas</Typography>
        <IconButton size="small" onClick={() => setDialogItem(null)} color="primary">
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {items.map((f, i) => (
          <Box
            key={f._raw?._id || `${f.label}-${i}`}
            onClick={f._editable ? () => setDialogItem(f._raw) : undefined}
            sx={{
              flex: '1 1 90px',
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${theme.palette.primary.main}0f`,
              border: `1px solid ${theme.palette.primary.main}20`,
              textAlign: 'center',
              cursor: f._editable ? 'pointer' : 'default',
            }}
          >
            <Typography fontSize="1.4rem" lineHeight={1} mb={0.5}>
              {f.emoji}
            </Typography>
            <Typography variant="h4" sx={{ color: 'primary.main', lineHeight: 1 }}>
              {f.dias}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              días
            </Typography>
            <Typography variant="caption" fontWeight={500} noWrap>
              {f.label}
            </Typography>
          </Box>
        ))}
      </Box>
      {dialogItem !== undefined && (
        <FechaImportanteDialog item={dialogItem} onClose={() => setDialogItem(undefined)} onGuardado={refetch} />
      )}
    </Card>
  );
}
