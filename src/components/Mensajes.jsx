import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { api } from '../api';
import { NOMBRES, otroUsuario } from '../constants/usuarios';
import Burbuja from './Burbuja.jsx';

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
    } catch {
      /* falla silenciosa: es un poll cada 6s, el siguiente ciclo reintenta */
    }
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
    } catch {
      /* si falla, el mensaje sigue visible — el usuario puede reintentar */
    }
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
        <Typography variant="overline" sx={{ color: primary }}>
          Solo para los dos
        </Typography>
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
              Aún no hay mensajes hoy.
              <br />
              ¡Empieza la conversación!
            </Typography>
          </Box>
        )}
        {mensajes.map((msg) => (
          <Burbuja key={msg._id} msg={msg} esPropio={msg.autor === usuario} primary={primary} onBorrar={borrar} />
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Preview archivo seleccionado */}
      {archivo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.5,
            bgcolor: `${primary}0d`,
            borderRadius: 1,
            mb: 0.5,
          }}
        >
          <Typography variant="caption" sx={{ flex: 1 }} noWrap>
            {archivo.name}
          </Typography>
          <IconButton size="small" onClick={() => setArchivo(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ px: 1, pb: 0.5 }}>
          {error}
        </Typography>
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
          placeholder={`Escríbele a ${NOMBRES[otroUsuario(usuario)]}…`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          variant="outlined"
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <IconButton
          type="submit"
          disabled={(!texto.trim() && !archivo) || enviando}
          sx={{
            bgcolor: primary,
            color: '#fff',
            mb: 0.5,
            '&:hover': { bgcolor: primary, opacity: 0.88 },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          {enviando ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}
