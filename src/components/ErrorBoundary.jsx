import { Component } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[CORE OS] Error no capturado:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5">Algo salió mal.</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
          La pantalla tuvo un error inesperado. Recarga la página — si sigue pasando, avísale a Enrique.
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Recargar
        </Button>
      </Box>
    );
  }
}
