import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { api } from '../api';
import { fechaFormato } from '../constants/cartaUtils';
import CartaTimeline from './CartaTimeline.jsx';
import { FormCarta, DialogEditarCarta } from './CartaForm.jsx';

export default function Cartas({ usuario }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [cartas, setCartas] = useState([]);
  const [activaId, setActivaId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const refs = useRef({});

  const cargar = () => {
    api
      .get('/api/cartas')
      .then(({ data }) => {
        const ordenadas = [...data].sort((a, b) => {
          const fa = new Date(a.fecha || a.createdAt);
          const fb = new Date(b.fecha || b.createdAt);
          return fb - fa; // más reciente primero
        });
        setCartas(ordenadas);
        setError('');
      })
      .catch(() => setError('No se pudo cargar.'));
  };

  useEffect(() => {
    cargar();
  }, []);

  const irA = (id) => {
    setActivaId(id);
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* ── Sidebar ── */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            position: 'sticky',
            top: 24,
            maxHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      irA(carta._id);
                    }
                  }}
                  sx={{
                    p: 1.5,
                    mb: 0.75,
                    cursor: 'pointer',
                    border: activa ? `1px solid ${primary}` : `1px solid ${primary}1f`,
                    background: activa ? `${primary}08` : '#fff',
                    transition: 'all 0.15s',
                    '&:hover': { background: `${primary}10` },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }} noWrap>
                    {carta.titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {carta.autor}
                    {carta.para ? ` → ${carta.para}` : ''}
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
            <Box
              key={carta._id}
              ref={(el) => {
                refs.current[carta._id] = el;
              }}
            >
              <CartaTimeline
                carta={carta}
                isFirst={i === cartas.length - 1}
                primaryColor={primary}
                onEditar={setEditando}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <FormCarta open={formOpen} onClose={() => setFormOpen(false)} onPublicada={cargar} usuario={usuario} />

      {editando && (
        <DialogEditarCarta
          carta={editando}
          onClose={() => setEditando(null)}
          onGuardado={() => {
            cargar();
            setEditando(null);
          }}
        />
      )}
    </Box>
  );
}
