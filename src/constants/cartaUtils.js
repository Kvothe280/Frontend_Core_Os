import { formatearFecha } from './fechaUtils';

export function esPdf(ruta) {
  return typeof ruta === 'string' && ruta.toLowerCase().endsWith('.pdf');
}

export function fechaFormato(carta) {
  const f = carta.fecha || carta.createdAt;
  return formatearFecha(f, { day: 'numeric', month: 'long', year: 'numeric' });
}
