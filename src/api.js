import axios from 'axios';

export const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('coreos_token');
    const usuario = localStorage.getItem('coreos_usuario');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (usuario) config.headers['x-usuario'] = usuario;
  } catch {
    /* localStorage puede no estar disponible (privado/incógnito) — seguimos sin sesión */
  }
  return config;
});

// Si el servidor responde 401 en rutas protegidas, limpiamos sesión y forzamos re-login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.includes('/auth/login')) {
      try {
        localStorage.removeItem('coreos_token');
        localStorage.removeItem('coreos_usuario');
      } catch {
        /* si no se pudo limpiar, el reload de abajo igual fuerza el re-login */
      }
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export function mediaUrl(path, { auth = false } = {}) {
  if (!path) return '';
  const url = path.startsWith('http') ? path : `${API}${path}`;
  if (!auth) return url;
  try {
    const token = localStorage.getItem('coreos_token');
    if (!token) return url;
    return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
  } catch {
    return url;
  }
}
