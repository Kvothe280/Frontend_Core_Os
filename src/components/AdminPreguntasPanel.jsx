import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api';
import { MONO_FONT } from '../constants/terminalTheme.js';
import { cardSx, formCardSx, fieldSx, labelSx, buttonSx } from '../constants/adminPanelStyles.js';

export default function AdminPreguntasPanel({ tc, preguntas, onError, cargar }) {
  const [nuevaP, setNuevaP] = useState({ pregunta: '', respuesta: '' });
  const [diaActual] = useState(new Date().getDate());

  const agregarPregunta = async (e) => {
    e.preventDefault();
    onError('');
    try {
      await api.post('/api/preguntas-mes', nuevaP);
      setNuevaP({ pregunta: '', respuesta: '' });
      cargar();
    } catch (err) {
      onError(err.response?.data?.error || 'Error al guardar pregunta.');
    }
  };

  const borrarPregunta = async (id) => {
    try {
      await api.delete(`/api/preguntas-mes/${id}`);
      cargar();
    } catch (err) {
      onError(err.response?.data?.error || 'No se pudo borrar.');
    }
  };

  const puedeCargar = diaActual <= 12;
  const mono = { fontFamily: MONO_FONT, color: tc.text };
  const monoDim = { fontFamily: MONO_FONT, color: `${tc.text}99` };

  return (
    <Box>
      <Typography sx={{ ...mono, fontSize: 15, fontWeight: 600, mb: 0.5 }}>
        Mis preguntas del mes ({preguntas.length}/6)
      </Typography>
      <Typography sx={{ ...monoDim, fontSize: 12.5, mb: 2 }}>
        Las que escribes para que el otro las responda. Período de carga: días 1–12. Solo tú puedes ver estas
        preguntas y sus respuestas.
      </Typography>

      {preguntas.map((p, i) => (
        <Card key={p._id} sx={cardSx(tc)}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ ...mono, fontSize: 13, fontWeight: 600 }}>Pregunta {i + 1}</Typography>
            <Typography sx={{ ...mono, fontSize: 13 }}>{p.pregunta}</Typography>
            <Typography sx={{ ...monoDim, fontSize: 11.5 }}>Respuesta: {p.respuesta}</Typography>
            {p.respondida && <Chip label="respondida" size="small" color="success" sx={{ ml: 1, mt: 0.5 }} />}
          </Box>
          {!p.respondida && puedeCargar && (
            <IconButton
              size="small"
              onClick={() => borrarPregunta(p._id)}
              sx={{ flexShrink: 0, ml: 1, color: `${tc.text}99`, '&:hover': { color: '#FF8A80' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Card>
      ))}

      {preguntas.length < 6 && puedeCargar && (
        <Card sx={{ p: 2, mb: 4, ...formCardSx(tc) }} component="form" onSubmit={agregarPregunta}>
          <Typography sx={{ ...mono, fontSize: 13, mb: 1 }}>Agregar pregunta {preguntas.length + 1}/6</Typography>
          <TextField
            size="small"
            label="Pregunta"
            fullWidth
            sx={{ mb: 1, ...fieldSx(tc) }}
            InputLabelProps={{ sx: labelSx(tc) }}
            required
            value={nuevaP.pregunta}
            onChange={(e) => setNuevaP((p) => ({ ...p, pregunta: e.target.value }))}
          />
          <TextField
            size="small"
            label="Respuesta (sin acentos — se normaliza)"
            fullWidth
            sx={{ mb: 1.5, ...fieldSx(tc) }}
            InputLabelProps={{ sx: labelSx(tc) }}
            required
            value={nuevaP.respuesta}
            onChange={(e) => setNuevaP((p) => ({ ...p, respuesta: e.target.value }))}
          />
          <Button type="submit" size="small" variant="outlined" sx={buttonSx(tc)}>
            Agregar
          </Button>
        </Card>
      )}

      {preguntas.length < 6 && !puedeCargar && (
        <Typography sx={{ ...monoDim, fontSize: 12.5, mb: 4 }}>
          El período de carga cerró el día 12. Faltan {6 - preguntas.length} preguntas — esto generará una
          penalización para el otro.
        </Typography>
      )}
    </Box>
  );
}
