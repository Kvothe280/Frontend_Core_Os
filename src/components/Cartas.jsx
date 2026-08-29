import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { api, mediaUrl } from '../api';

function esPdf(ruta) {
  return typeof ruta === 'string' && ruta.toLowerCase().endsWith('.pdf');
}

function fechaFormato(carta) {
  const f = carta.fecha || carta.createdAt;
  return f ? new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

// ── Modal agregar carta ────────────────────────────────────────────────────

function FormCarta({ open, onClose, onPublicada, usuario }) {
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [fecha, setFecha] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const autor = usuario === 'karol' ? 'Karol' : 'Enrique';
  const para = usuario === 'karol' ? 'Enrique' : 'Karol';

  const reset = () => { setTitulo(''); setCuerpo(''); setFecha(''); setArchivo(null); setError(''); };

  const publicar = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('cuerpo', cuerpo);
    form.append('autor', autor);
    form.append('para', para);
    if (fecha) form.append('fecha', fecha);
    if (archivo) form.append('archivo', archivo);
    try {
      await api.post('/api/cartas', form);
      reset();
      onPublicada?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo publicar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => { reset(); onClose(); }} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva carta</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          De <strong>{autor}</strong> para <strong>{para}</strong>
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Título" fullWidth margin="normal" required value={titulo}
          onChange={(e) => setTitulo(e.target.value)} />
        <TextField label="Fecha (opcional)" type="date" fullWidth margin="normal"
          InputLabelProps={{ shrink: true }} value={fecha}
          onChange={(e) => setFecha(e.target.value)} />
        <TextField label="Carta (opcional si adjuntas imagen o PDF)" fullWidth margin="normal"
          multiline minRows={5} value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)} />
        <Button component="label" sx={{ mt: 1 }}>
          Adjuntar imagen o PDF (opcional)
          <input hidden type="file" accept="image/*,application/pdf"
            onChange={(e) => setArchivo(e.target.files[0] || null)} />
        </Button>
        {archivo && (
          <Typography variant="caption" sx={{ ml: 1, display: 'block' }}>{archivo.name}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { reset(); onClose(); }}>Cancelar</Button>
        <Button variant="contained" onClick={publicar} disabled={loading || !titulo}>Publicar carta</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Lightbox de imagen ─────────────────────────────────────────────────────

function Lightbox({ src, alt, open, onClose }) {
  if (!open) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullScreen
      PaperProps={{ sx: { background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
    >
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', zIndex: 10 }}>
        <CloseIcon />
      </IconButton>
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: 1 }}
      />
    </Dialog>
  );
}

// ── Carta en el timeline ───────────────────────────────────────────────────

function CartaTimeline({ carta, isFirst, primaryColor }) {
  const f = fechaFormato(carta);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4, position: 'relative' }}>
      {/* Línea + dot */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
        <Box sx={{
          width: 12, height: 12, borderRadius: '50%',
          bgcolor: primaryColor, flexShrink: 0, mt: 1.5, zIndex: 1,
          boxShadow: `0 0 0 3px ${primaryColor}28`,
        }} />
        {!isFirst && (
          <Box sx={{ flex: 1, width: 2, bgcolor: `${primaryColor}20`, minHeight: 40, mt: 0.5 }} />
        )}
      </Box>

      {/* Contenido */}
      <Card sx={{ flex: 1, p: 3, border: `1px solid ${primaryColor}18`, background: '#fffaf4' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="overline" sx={{ color: primaryColor, lineHeight: 1 }}>
              {carta.autor}{carta.para ? ` para ${carta.para}` : ''}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25 }}>{carta.titulo}</Typography>
          </Box>
          {f && (
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 2, mt: 0.5 }}>
              {f}
            </Typography>
          )}
        </Box>

        {carta.imagen && (
          esPdf(carta.imagen) ? (
            <Box sx={{ mt: 2, mb: 2 }}>
              <iframe
                src={mediaUrl(carta.imagen)}
                title={carta.titulo}
                style={{ width: '100%', height: 420, border: `1px solid ${primaryColor}20`, borderRadius: 8 }}
              />
              <Typography variant="caption">
                <a href={mediaUrl(carta.imagen)} target="_blank" rel="noopener noreferrer">
                  Abrir en nueva pestaña
                </a>
              </Typography>
            </Box>
          ) : (
            <>
              {/* Miniatura — contain: se ve completa sin recorte */}
              <Box
                onClick={() => setLightboxOpen(true)}
                sx={{
                  mt: 2, mb: 1, cursor: 'zoom-in',
                  display: 'flex', justifyContent: 'center',
                  bgcolor: `${primaryColor}08`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  maxHeight: 300,
                }}
              >
                <Box
                  component="img"
                  src={mediaUrl(carta.imagen)}
                  alt=""
                  sx={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Toca la imagen para verla completa
              </Typography>
              <Lightbox
                src={mediaUrl(carta.imagen)}
                alt={carta.titulo}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
              />
            </>
          )
        )}

        {carta.cuerpo && (
          <Typography sx={{ mt: 1.5, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {carta.cuerpo}
          </Typography>
        )}
      </Card>
    </Box>
  );
}

// ── Página principal ───────────────────────────────────────────────────────

export default function Cartas({ usuario }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [cartas, setCartas] = useState([]);
  const [activaId, setActivaId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const refs = useRef({});

  const cargar = () => {
    api.get('/api/cartas').then(({ data }) => {
      const ordenadas = [...data].sort((a, b) => {
        const fa = new Date(a.fecha || a.createdAt);
        const fb = new Date(b.fecha || b.createdAt);
        return fb - fa; // más reciente primero
      });
      setCartas(ordenadas);
    });
  };

  useEffect(() => { cargar(); }, []);

  const irA = (id) => {
    setActivaId(id);
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>Archivo de amor</Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>Cartas</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Una por una, con cariño. Cada carta guarda quién la escribió y para quién es.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* ── Sidebar ── */}
        <Box sx={{
          width: 260,
          flexShrink: 0,
          position: 'sticky',
          top: 24,
          maxHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => setFormOpen(true)}
            sx={{ mb: 2 }}
          >
            Nueva carta
          </Button>

          <Box sx={{ overflowY: 'auto', flex: 1, pr: 0.5 }}>
            {cartas.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                La primera carta puede ser tuya.
              </Typography>
            )}
            {cartas.map((carta) => {
              const activa = activaId === carta._id;
              return (
                <Card
                  key={carta._id}
                  onClick={() => irA(carta._id)}
                  sx={{
                    p: 1.5, mb: 0.75, cursor: 'pointer',
                    border: activa ? `1px solid ${primary}` : `1px solid ${primary}1f`,
                    background: activa ? `${primary}08` : '#fff',
                    transition: 'all 0.15s',
                    '&:hover': { background: `${primary}10` },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}
                    noWrap>{carta.titulo}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {carta.autor}{carta.para ? ` → ${carta.para}` : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fechaFormato(carta)}
                  </Typography>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* ── Timeline ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {cartas.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Aún no hay cartas. Escribe la primera con el botón de arriba.
            </Typography>
          )}
          {cartas.map((carta, i) => (
            <Box key={carta._id} ref={(el) => { refs.current[carta._id] = el; }}>
              <CartaTimeline
                carta={carta}
                isFirst={i === cartas.length - 1}
                primaryColor={primary}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <FormCarta
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onPublicada={cargar}
        usuario={usuario}
      />
    </Box>
  );
}
