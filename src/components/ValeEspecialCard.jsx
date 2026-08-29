import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { api } from '../api';

const PENALIZACION_LABEL = {
  ligera: 'Penalización ligera (1–2 preguntas faltaron)',
  media: 'Penalización media (3–4 preguntas faltaron)',
  grave: 'Penalización grave (5–6 preguntas faltaron)',
};

export default function ValeEspecialCard({ onCanjeado }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [vem, setVem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [canjeando, setCanjeando] = useState(false);
  const [canjeado, setCanjeado] = useState(false);
  const [fechaCanje, setFechaCanje] = useState('');

  const cargar = () => api.get('/api/vale-especial-mes').then(({ data }) => setVem(data));

  useEffect(() => { cargar(); }, []);

  const canjear = async () => {
    setCanjeando(true);
    try {
      await api.post('/api/vale-especial-mes/canjear', { fecha: fechaCanje || undefined });
      setCanjeado(true);
      await cargar();
      onCanjeado?.();
    } catch { /* ignore */ }
    finally { setCanjeando(false); }
  };

  if (!vem) return null;

  const abierto = vem.estado === 'desbloqueado' || vem.estado === 'compensacion';
  const yaCanjeado = vem.estado === 'canjeado';
  const bloqueado = !abierto && !yaCanjeado;

  const titulo = abierto || yaCanjeado ? (vem.titulo || 'Vale especial') : 'Vale especial del mes';

  // ── Chip label y color ──
  const chipProps = bloqueado
    ? { label: 'pendiente', color: 'default' }
    : yaCanjeado
    ? { label: 'usado', color: 'default' }
    : vem.estado === 'compensacion'
    ? { label: 'compensación', color: 'warning' }
    : vem.estado === 'inutilizado'
    ? { label: 'inutilizado', color: 'error' }
    : { label: 'disponible', color: 'success' };

  return (
    <>
      <Card
        sx={{
          overflow: 'hidden',
          border: abierto
            ? `1px solid ${primary}50`
            : `1px solid rgba(111, 78, 55, 0.18)`,
          background: '#fff',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          ...(!bloqueado && {
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 28px rgba(59, 42, 29, 0.12)',
            },
          }),
        }}
      >
        <CardActionArea onClick={() => !bloqueado && setDrawerOpen(true)} disabled={bloqueado}>
          {/* Header visual */}
          <Box sx={{
            height: 120,
            bgcolor: bloqueado ? '#d9cfc4' : abierto ? `${primary}18` : '#ebe2d6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {bloqueado
              ? <LockIcon sx={{ fontSize: 40, color: '#999' }} />
              : <CardGiftcardIcon sx={{ fontSize: 40, color: primary, opacity: 0.6 }} />
            }
            <Chip
              size="small"
              label={chipProps.label}
              color={chipProps.color}
              sx={{ position: 'absolute', top: 12, left: 12, background: '#fffaf4' }}
            />
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="overline" sx={{ color: bloqueado ? '#8d8d8d' : primary }}>
              {yaCanjeado ? 'Usado' : abierto ? 'Disponible' : 'Cifrado'} · Especial
            </Typography>
            <Typography variant="h6">{titulo}</Typography>
            {abierto && vem.descripcion && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} noWrap>
                {vem.descripcion}
              </Typography>
            )}
            {yaCanjeado && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {vem.titulo}
              </Typography>
            )}
            {!bloqueado && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {yaCanjeado ? 'Ya fue usado este mes' : 'Abrir panel →'}
              </Typography>
            )}
            {bloqueado && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Completa las preguntas en Terminal
              </Typography>
            )}
          </Box>
        </CardActionArea>
      </Card>

      {/* ── Drawer del vale especial ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            background: '#fffaf4',
            borderLeft: '1px solid rgba(111, 78, 55, 0.2)',
          },
        }}
      >
        <Box>
          {/* Banner superior */}
          <Box sx={{
            height: 180,
            bgcolor: abierto ? `${primary}1a` : '#ebe2d6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CardGiftcardIcon sx={{ fontSize: 72, color: primary, opacity: 0.5 }} />
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography variant="overline" sx={{ color: primary }}>
              Vale especial del mes
            </Typography>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {vem.titulo || 'Vale especial'}
            </Typography>
            {vem.descripcion && (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {vem.descripcion}
              </Typography>
            )}

            {vem.estado === 'compensacion' && (
              <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                {PENALIZACION_LABEL.grave} — el otro no cargó preguntas este mes.
              </Typography>
            )}

            {yaCanjeado ? (
              <Box sx={{ p: 2, bgcolor: `${primary}0d`, borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ color: primary, fontWeight: 600 }}>
                  ✓ Vale canjeado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {vem.fechaCanje
                    ? new Date(vem.fechaCanje).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Hasta el próximo mes.'}
                </Typography>
              </Box>
            ) : (
              <>
                {canjeado && (
                  <Box sx={{ p: 2, bgcolor: `${primary}0d`, borderRadius: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: primary, fontWeight: 600 }}>
                      ✓ ¡Vale canjeado! Disfrútalo.
                    </Typography>
                  </Box>
                )}
                <TextField
                  label="Fecha en que se usará"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={fechaCanje}
                  onChange={(e) => setFechaCanje(e.target.value)}
                  disabled={canjeando || canjeado}
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={canjear}
                  disabled={canjeando || canjeado || yaCanjeado}
                  sx={{ mb: 1 }}
                >
                  {canjeado ? '¡Canjeado!' : 'Canjear vale especial'}
                </Button>
              </>
            )}

            <Button fullWidth onClick={() => setDrawerOpen(false)}>
              Cerrar
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
