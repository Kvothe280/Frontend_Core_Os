import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';

export function useApi(url, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(() => {
    setLoading(true);
    api.get(url)
      .then(({ data: payload }) => { setData(payload); setError(''); })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => { cargar(); }, [...deps, cargar]);

  return { data, error, loading, refetch: cargar };
}
