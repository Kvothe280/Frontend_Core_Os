import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api, mediaUrl } from '../api';

export default function ValeDrawer({ vale, open, onClose, onSuccess }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [fecha, setFecha] = useState('');
  const [notas, setNotas] = useState('');
  const [canjeando, setCanjeando] = useState(false);
  const [canjeado, setCanjeado] = useState(false);
  const [error, setError] = useState('');

  const disponible = vale?.estado === 'disponible';
  const yaCanjeado = vale?.estado === 'canjeado';
  const foto = vale?.imagen ? mediaUrl(vale.imagen) : '';

  const handleClose = () => {
    if (canjeando) return;
    setFecha('');
    setNotas('');
    setError('');
    setCanjeado(false);
    onClose();
  };

  const canjear = async () => {
    if (!vale?._id) return;
    setCanjeando(true);
    setError('');
    try {
      await api.post('/api/vales/canjear', { valeId: vale._id, fecha, notas });
      setCanjeado(true);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar el canje.');
    } finally {
      setCanjeando(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          background: '#fffaf4',
          borderLeft: '1px solid rgba(111, 78, 55, 0.2)',
          p: 0,
        },
      }}
    >
      {vale && (
        <Box>
          {/* Banner superior */}
          {foto ? (
            <Box component="img" src={foto} alt={vale.titulo}
              sx={{ width: '100%', height: 200, objectFit: 'contain', bgcolor: '#f5f0eb' }} />
          ) : (
            <Box sx={{ height: 120, bgcolor: '#ebe2d6' }} />
          )}

          <Box sx={{ p: 3 }}>
            <Typography variant="overline" sx={{ color: primary }}>
              {vale.tipo === 'mensual' ? vale.periodo : `Mes ${vale.mes}`} · {vale.tipo}
            </Typography>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {vale.titulo}
            </Typography>
            {vale.descripcion && (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {vale.descripcion}
              </Typography>
            )}

            {yaCanjeado && (
              <Box sx={{ p: 2, bgcolor: `${primary}0d`, borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ color: primary, fontWeight: 600 }}>
                  ✓ Vale canjeado
                </Typography>
                {vale.detalles_canje?.fecha && (
                  <Typography variant="body2" color="text.secondary">
                    {new Date(vale.detalles_canje.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                )}
                {vale.detalles_canje?.notas && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {vale.detalles_canje.notas}
                  </Typography>
                )}
              </Box>
            )}

            {disponible && (
              <>
                {canjeado ? (
                  <Box sx={{ p: 2, bgcolor: `${primary}0d`, borderRadius: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: primary, fontWeight: 600 }}>
                      ✓ ¡Vale canjeado! Disfrútalo.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                      label="Fecha en que se usará"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      disabled={canjeando}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Notas (opcional)"
                      fullWidth
                      multiline
                      minRows={3}
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      disabled={canjeando}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={canjear}
                      disabled={canjeando}
                      sx={{ mb: 1 }}
                    >
                      {canjeando ? 'Registrando…' : 'Confirmar canje'}
                    </Button>
                  </>
                )}
              </>
            )}

            {!disponible && !yaCanjeado && (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Este vale no está disponible.
              </Typography>
            )}

            <Button fullWidth onClick={handleClose}>
              Cerrar
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
