import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api, mediaUrl } from '../api';

function esPdf(ruta) {
  return typeof ruta === 'string' && ruta.toLowerCase().endsWith('.pdf');
}

export default function Cartas({ usuario }) {
  const theme = useTheme();
  const [cartas, setCartas] = useState([]);
  const [activa, setActiva] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [autor, setAutor] = useState(usuario === 'karol' ? 'Karol' : 'Enrique');
  const [para, setPara] = useState(usuario === 'karol' ? 'Enrique' : 'Karol');
  const [fecha, setFecha] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');

  const cargar = () => {
    api.get('/api/cartas').then(({ data }) => {
      setCartas(data);
      setActiva((prev) => data.find((c) => c._id === prev?._id) || data[0] || null);
    });
  };

  useEffect(() => { cargar(); }, []);

  const publicar = async (e) => {
    e.preventDefault();
    setError('');
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('cuerpo', cuerpo);
    form.append('autor', autor);
    form.append('para', para);
    if (fecha) form.append('fecha', fecha);
    if (archivo) form.append('archivo', archivo);
    try {
      await api.post('/api/cartas', form);
      setTitulo('');
      setCuerpo('');
      setFecha('');
      setArchivo(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo publicar.');
    }
  };

  const fechaCartaActiva = activa?.fecha
    ? new Date(activa.fecha).toLocaleDateString('es-MX')
    : new Date(activa?.createdAt || Date.now()).toLocaleDateString('es-MX');

  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>
        Archivo de amor
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Cartas
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Una por una, con cariño. Cada carta guarda quién la escribió y para quién es.
      </Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '280px 1fr' } }}>
        <Box>
          {cartas.map((carta) => (
            <Card
              key={carta._id}
              onClick={() => setActiva(carta)}
              sx={{
                p: 1.5,
                mb: 1,
                cursor: 'pointer',
                border: activa?._id === carta._id ? `1px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.primary.main}1f`,
              }}
            >
              <Typography variant="subtitle2">{carta.titulo}</Typography>
              <Typography variant="caption" color="text.secondary">
                {carta.autor}{carta.para ? ` → ${carta.para}` : ''} · {carta.fecha
                  ? new Date(carta.fecha).toLocaleDateString('es-MX')
                  : new Date(carta.createdAt).toLocaleDateString('es-MX')}
              </Typography>
            </Card>
          ))}
          {cartas.length === 0 && (
            <Typography color="text.secondary">Todavía no hay cartas. La primera puede ser tuya.</Typography>
          )}
        </Box>

        <Box>
          {activa && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="overline" sx={{ color: 'primary.main' }}>
                {activa.autor}{activa.para ? ` para ${activa.para}` : ''}
              </Typography>
              <Typography variant="h4">{activa.titulo}</Typography>
              <Typography variant="caption" color="text.secondary">
                {fechaCartaActiva}
              </Typography>
              {activa.imagen && (
                esPdf(activa.imagen) ? (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <iframe
                      src={mediaUrl(activa.imagen)}
                      title={activa.titulo}
                      style={{ width: '100%', height: 480, border: '1px solid rgba(111,78,55,0.2)', borderRadius: 8 }}
                    />
                    <Typography variant="caption">
                      <a href={mediaUrl(activa.imagen)} target="_blank" rel="noopener noreferrer" style={{ color: 'primary.main' }}>
                        Abrir PDF en nueva pestaña
                      </a>
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    component="img"
                    src={mediaUrl(activa.imagen)}
                    alt=""
                    sx={{ width: '100%', maxHeight: 280, objectFit: 'cover', my: 2, borderRadius: 2 }}
                  />
                )
              )}
              {activa.cuerpo && (
                <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{activa.cuerpo}</Typography>
              )}
            </Card>
          )}

          <Card sx={{ p: 3 }} component="form" onSubmit={publicar}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Agregar carta
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
              De <strong>{autor}</strong> para <strong>{para}</strong>
            </Typography>
            <TextField label="Título" fullWidth margin="normal" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            <TextField
              label="Fecha de la carta (opcional)"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <TextField
              label="Carta (opcional si adjuntas imagen o PDF)"
              fullWidth
              margin="normal"
              multiline
              minRows={5}
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
            />
            <Button component="label" sx={{ mt: 1 }}>
              Adjuntar imagen o PDF (opcional)
              <input hidden type="file" accept="image/*,application/pdf" onChange={(e) => setArchivo(e.target.files[0] || null)} />
            </Button>
            {archivo && (
              <Typography variant="caption" sx={{ ml: 1 }}>{archivo.name}</Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Button type="submit" variant="contained">Publicar</Button>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
