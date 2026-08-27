import axios from 'axios';

export const API = 'http://localhost:3001';

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  try {
    const usuario = localStorage.getItem('coreos_usuario');
    if (usuario) config.headers['x-usuario'] = usuario;
  } catch {}
  return config;
});

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API}${path}`;
}
