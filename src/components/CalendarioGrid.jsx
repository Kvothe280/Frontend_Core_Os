import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TIPO_COLOR } from '../constants/calendarioTipos';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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

export default function CalendarioGrid({ mesRef, eventos, diaSeleccionado, onSelectDia }) {
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
          <Typography
            key={d}
            variant="caption"
            sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 600, py: 0.5 }}
          >
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDia(seleccionado ? null : key);
                }
              }}
              sx={{
                minHeight: 64,
                p: 0.75,
                borderRadius: 1.5,
                cursor: 'pointer',
                border: seleccionado ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
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
                  <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
                    +{evs.length - 6}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
