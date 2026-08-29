import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import { api, mediaUrl } from '../api';

const OTROS = { karol: 'Karol', enrique: 'Enrique' };

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function Lightbox({ src, open, onClose }) {
  if (!open) return null;
  return (
    <Dialog open onClose={onClose} maxWidth={false} fullScreen
      PaperProps={{ sx: { background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
    >
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', zIndex: 10 }}>
        <CloseIcon />
      </IconButton>
      <Box component="img" src={src} sx={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: 1 }} />
    </Dialog>
  );
}

function Burbuja({ msg, esPropio, primary, onBorrar }) {
  const [lightbox, setLightbox] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: esPropio ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 0.5,
        mb: 1,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Burbuja */}
      <Box
        sx={{
          maxWidth: { xs: '80%', sm: '60%' },
          bgcolor: esPropio ? primary : 'background.paper',
          color: esPropio ? '#fff' : 'text.primary',
          borderRadius: esPropio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          border: esPropio ? 'none' : '1px solid rgba(111,78,55,0.15)',
          p: msg.imagen ? 0.5 : '8px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {msg.imagen && (
          <Box
            onClick={() => setLightbox(true)}
            sx={{ cursor: 'zoom-in', borderRadius: '12px', overflow: 'hidden', mb: msg.contenido ? 0.5 : 0 }}
          >
            <Box
              component="img"
              src={mediaUrl(msg.imagen)}
              sx={{ display: 'block', maxWidth: 260, maxHeight: 220, objectFit: 'contain', bgcolor: esPropio ? `${primary}cc` : '#f5f0eb' }}
            />
          </Box>
        )}
        {msg.contenido && (
          <Typography variant="body2" sx={{ px: msg.imagen ? 1 : 0, pb: msg.imagen ? 0.5 : 0, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {msg.contenido}
          </Typography>
        )}
        <Lightbox src={mediaUrl(msg.imagen)} open={lightbox} onClose={() => setLightbox(false)} />
      </Box>

      {/* Tiempo + borrar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: esPropio ? 'flex-end' : 'flex-start', gap: 0.25, minWidth: 36 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
          {tiempoRelativo(msg.createdAt)}
        </Typography>
        {esPropio && (
          <IconButton
            size="small"
            onClick={() => onBorrar(msg._id)}
            sx={{
              opacity: hover ? 1 : 0,
              transition: 'opacity 0.15s',
              p: 0.25,
              color: 'text.disabled',
              '&:hover': { color: 'error.main' },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default function Mensajes({ usuario }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const pollRef = useRef(null);

  const cargar = async () => {
    try {
      const { data } = await api.get('/api/mensajes');
      setMensajes(data);
    } catch {}
  };

  useEffect(() => {
    cargar();
    pollRef.current = setInterval(cargar, 6000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes.length]);

  const enviar = async (e) => {
    e?.preventDefault();
    if ((!texto.trim() && !archivo) || enviando) return;
    setEnviando(true);
    setError('');
    try {
      const form = new FormData();
      if (texto.trim()) form.append('contenido', texto.trim());
      if (archivo) form.append('archivo', archivo);
      await api.post('/api/mensajes', form);
      setTexto('');
      setArchivo(null);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar.');
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async (id) => {
    try {
      await api.delete(`/api/mensajes/${id}`);
      setMensajes((prev) => prev.filter((m) => m._id !== id));
    } catch {}
  };

  // Hora de reset
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  manana.setHours(0, 0, 0, 0);
  const horaReset = manana.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 32px)', maxHeight: 900 }}>
      {/* Header */}
      <Box sx={{ pb: 1.5, borderBottom: `1px solid ${primary}20`, mb: 1 }}>
        <Typography variant="overline" sx={{ color: primary }}>Solo para los dos</Typography>
        <Typography variant="h4">Mensajes</Typography>
        <Typography variant="caption" color="text.secondary">
          La conversación se borra cada día a medianoche · próximo reset {horaReset}
        </Typography>
      </Box>

      {/* Área de mensajes */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1, px: 0.5 }}>
        {mensajes.length === 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              Aún no hay mensajes hoy.<br />¡Empieza la conversación!
            </Typography>
          </Box>
        )}
        {mensajes.map((msg) => (
          <Burbuja
            key={msg._id}
            msg={msg}
            esPropio={msg.autor === usuario}
            primary={primary}
            onBorrar={borrar}
          />
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Preview archivo seleccionado */}
      {archivo && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, bgcolor: `${primary}0d`, borderRadius: 1, mb: 0.5 }}>
          <Typography variant="caption" sx={{ flex: 1 }} noWrap>{archivo.name}</Typography>
          <IconButton size="small" onClick={() => setArchivo(null)}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ px: 1, pb: 0.5 }}>{error}</Typography>
      )}

      {/* Input */}
      <Box
        component="form"
        onSubmit={enviar}
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
          pt: 1,
          borderTop: `1px solid ${primary}20`,
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setArchivo(e.target.files[0] || null)}
        />
        <IconButton
          onClick={() => fileRef.current?.click()}
          sx={{ color: archivo ? primary : 'text.disabled', mb: 0.5 }}
        >
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={`Escríbele a ${OTROS[usuario === 'karol' ? 'enrique' : 'karol']}…`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
          }}
          variant="outlined"
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <IconButton
          type="submit"
          disabled={(!texto.trim() && !archivo) || enviando}
          sx={{ bgcolor: primary, color: '#fff', mb: 0.5, '&:hover': { bgcolor: primary, opacity: 0.88 }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
        >
          {enviando ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}
