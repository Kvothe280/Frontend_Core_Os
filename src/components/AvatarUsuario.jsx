import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { api, mediaUrl } from '../api';

const NOMBRES = { karol: 'Karol', enrique: 'Enrique' };

export default function AvatarUsuario({ usuario, size = 40, editable = false, onUploaded }) {
  const [rota, setRota] = useState(false);
  const [version, setVersion] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const src = mediaUrl(`/api/avatar/${usuario}?v=${version}`);

  const subir = async (file) => {
    if (!file) return;
    setSubiendo(true);
    const form = new FormData();
    form.append('archivo', file);
    try {
      await api.post('/api/avatar', form);
      setRota(false);
      setVersion((v) => v + 1);
      onUploaded?.();
    } finally {
      setSubiendo(false);
    }
  };

  const avatar = (
    <Avatar
      src={!rota ? src : undefined}
      imgProps={{ onError: () => setRota(true) }}
      sx={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {NOMBRES[usuario]?.[0]}
    </Avatar>
  );

  if (!editable) return avatar;

  return (
    <Box
      component="label"
      sx={{
        position: 'relative', display: 'inline-flex', cursor: 'pointer',
        '&:hover .avatar-overlay': { opacity: 1 },
      }}
    >
      {avatar}
      <Box
        className="avatar-overlay"
        sx={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.45)',
          opacity: subiendo ? 1 : 0, transition: 'opacity 0.15s',
        }}
      >
        {subiendo
          ? <CircularProgress size={size * 0.4} sx={{ color: '#fff' }} />
          : <Typography sx={{ color: '#fff', fontSize: size * 0.22, fontWeight: 600 }}>Cambiar</Typography>}
      </Box>
      <input hidden type="file" accept="image/*" onChange={(e) => subir(e.target.files[0])} />
    </Box>
  );
}
