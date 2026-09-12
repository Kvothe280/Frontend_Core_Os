import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { api } from '../api';
import { MONO_FONT } from '../constants/terminalTheme.js';
import AdminPreguntasPanel from './AdminPreguntasPanel.jsx';
import AdminPoolEspecialPanel from './AdminPoolEspecialPanel.jsx';
import AdminPoolMensualPanel from './AdminPoolMensualPanel.jsx';

export default function AdminPanel({ tc }) {
  const [preguntas, setPreguntas] = useState([]);
  const [poolEspecial, setPoolEspecial] = useState([]);
  const [poolMensual, setPoolMensual] = useState([]);
  const [error, setError] = useState('');

  const cargar = () =>
    Promise.all([
      api.get('/api/preguntas-mes').then(({ data }) => setPreguntas(data)),
      api.get('/api/vale-especial-pool').then(({ data }) => setPoolEspecial(data)),
      api.get('/api/vale-pool').then(({ data }) => setPoolMensual(data)),
    ]);

  useEffect(() => {
    cargar();
  }, []);

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            mb: 2,
            fontFamily: MONO_FONT,
            fontSize: 12.5,
            color: '#FF8A80',
            borderColor: 'rgba(255,138,128,0.4)',
            '& .MuiAlert-icon': { color: '#FF8A80' },
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <AdminPreguntasPanel tc={tc} preguntas={preguntas} onError={setError} cargar={cargar} />

      <Divider sx={{ my: 3, borderColor: `${tc.border}30` }} />
      <AdminPoolEspecialPanel tc={tc} poolEspecial={poolEspecial} onError={setError} cargar={cargar} />

      <Divider sx={{ my: 3, borderColor: `${tc.border}30` }} />
      <AdminPoolMensualPanel tc={tc} poolMensual={poolMensual} onError={setError} cargar={cargar} />
    </Box>
  );
}
