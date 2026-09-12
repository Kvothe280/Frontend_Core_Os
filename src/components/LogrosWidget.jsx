import { useEffect, useRef, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useApi } from '../hooks/useApi';

const VISTOS_KEY = 'coreos_logros_vistos';

function leerVistos() {
  try {
    return new Set(JSON.parse(localStorage.getItem(VISTOS_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function guardarVistos(ids) {
  try {
    localStorage.setItem(VISTOS_KEY, JSON.stringify([...ids]));
  } catch {
    /* localStorage no disponible — la próxima carga simplemente re-anima */
  }
}

function fechaCorta(iso) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function progresoTexto(categoria) {
  const siguiente = categoria.tiers.find((t) => !t.desbloqueado);
  if (!siguiente) return '¡Categoría completa!';
  const faltan = siguiente.umbral - categoria.conteoActual;
  return `Faltan ${faltan} para "${siguiente.titulo}"`;
}

function Nodo({ tier, primary, esNuevo }) {
  const label = tier.desbloqueado
    ? `${tier.titulo} — conseguido el ${fechaCorta(tier.fecha)}`
    : `${tier.titulo} — todavía bloqueado`;
  return (
    <Tooltip title={label} enterTouchDelay={0}>
      <Box
        component="button"
        type="button"
        aria-label={label}
        sx={{
          '@keyframes logroPop': {
            '0%': { transform: 'scale(0.55)', opacity: 0 },
            '65%': { transform: 'scale(1.18)' },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none !important' },
          animation: esNuevo ? 'logroPop 0.55s cubic-bezier(.34,1.56,.64,1)' : 'none',
          width: 36,
          height: 36,
          minWidth: 36,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.05rem',
          lineHeight: 1,
          p: 0,
          cursor: 'pointer',
          fontFamily: 'inherit',
          border: tier.desbloqueado ? 'none' : `1.5px solid ${alpha(primary, 0.3)}`,
          bgcolor: tier.desbloqueado ? primary : alpha(primary, 0.06),
          opacity: tier.desbloqueado ? 1 : 0.55,
          boxShadow: tier.desbloqueado ? `0 2px 6px ${alpha(primary, 0.35)}` : 'none',
          transition: 'transform 0.15s ease',
          '&:hover': { transform: 'scale(1.08)' },
          '&:focus-visible': { outline: `2px solid ${primary}`, outlineOffset: 2 },
        }}
      >
        {tier.emoji}
      </Box>
    </Tooltip>
  );
}

function FilaCategoria({ categoria, primary, nuevos }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', rowGap: 0.5, columnGap: 1.5 }}>
      <Typography variant="body2" sx={{ minWidth: 96, fontWeight: 500, flexShrink: 0 }}>
        {categoria.emoji} {categoria.label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', flex: '1 1 140px', minWidth: 140 }}>
        {categoria.tiers.map((tier, i) => (
          <Box key={tier.id} sx={{ display: 'flex', alignItems: 'center', flex: i < categoria.tiers.length - 1 ? 1 : '0 0 auto' }}>
            <Nodo tier={{ ...tier, emoji: categoria.emoji }} primary={primary} esNuevo={nuevos.has(tier.id)} />
            {i < categoria.tiers.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  minWidth: 12,
                  mx: 0.5,
                  bgcolor: tier.desbloqueado ? primary : alpha(primary, 0.15),
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
        ))}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          flexBasis: { xs: '100%', sm: 'auto' },
          minWidth: { sm: 128 },
          textAlign: { xs: 'left', sm: 'right' },
        }}
      >
        {progresoTexto(categoria)}
      </Typography>
    </Box>
  );
}

export default function LogrosWidget() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const { data, error } = useApi('/api/logros');
  const [nuevos, setNuevos] = useState(new Set());
  const yaProcesado = useRef(false);

  useEffect(() => {
    if (!data || yaProcesado.current) return;
    yaProcesado.current = true;
    const vistos = leerVistos();
    const desbloqueadosAhora = data.categorias.flatMap((c) => c.tiers.filter((t) => t.desbloqueado).map((t) => t.id));
    const nuevosIds = desbloqueadosAhora.filter((id) => !vistos.has(id));
    if (nuevosIds.length > 0) {
      setNuevos(new Set(nuevosIds));
      guardarVistos(new Set(desbloqueadosAhora));
    }
  }, [data]);

  if (error) {
    return (
      <Typography variant="body2" color="text.secondary">
        No se pudieron cargar los logros.
      </Typography>
    );
  }
  if (!data) return null;

  return (
    <Card sx={{ p: 2, border: `1px solid ${alpha(primary, 0.14)}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Logros</Typography>
        <Box
          role="status"
          aria-atomic="true"
          aria-label={`${data.totalDesbloqueados} de ${data.totalLogros} logros desbloqueados`}
          sx={{
            px: 1.25,
            py: 0.25,
            borderRadius: 5,
            bgcolor: alpha(primary, 0.1),
            color: primary,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {data.totalDesbloqueados}/{data.totalLogros}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {data.categorias.map((categoria) => (
          <FilaCategoria key={categoria.id} categoria={categoria} primary={primary} nuevos={nuevos} />
        ))}
      </Box>
    </Card>
  );
}
