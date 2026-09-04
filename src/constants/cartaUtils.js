export function esPdf(ruta) {
  return typeof ruta === 'string' && ruta.toLowerCase().endsWith('.pdf');
}

export function fechaFormato(carta) {
  const f = carta.fecha || carta.createdAt;
  return f ? new Date(f).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}
