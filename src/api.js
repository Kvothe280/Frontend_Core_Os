import axios from 'axios';

export const API = 'http://localhost:3001';

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  try {
    const token   = localStorage.getItem('coreos_token');
    const usuario = localStorage.getItem('coreos_usuario');
    if (token)   config.headers['Authorization'] = `Bearer ${token}`;
    if (usuario) config.headers['x-usuario']     = usuario;
  } catch {}
  return config;
});

// Si el servidor responde 401 limpiamos la sesión para forzar re-login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      try {
        localStorage.removeItem('coreos_token');
        localStorage.removeItem('coreos_usuario');
      } catch {}
      // Reload forzará la pantalla de login
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API}${path}`;
}
