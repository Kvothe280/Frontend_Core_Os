// Los valores de fecha que manda el backend a veces son "solo fecha" (guardados como
// medianoche UTC a partir de un <input type="date">) y a veces son timestamps reales
// (hora de creación o de canje). Mostrar todo con la hora local del navegador corre
// un día hacia atrás los "solo fecha" en zonas UTC negativas (ej. México, UTC-6).
// Se detectan los "solo fecha" porque caen justo en medianoche UTC exacta — algo
// prácticamente imposible para un timestamp real.
export function esFechaSoloDia(fecha) {
  const d = new Date(fecha);
  return (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  );
}

export function formatearFecha(fecha, opts) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-MX', esFechaSoloDia(fecha) ? { ...opts, timeZone: 'UTC' } : opts);
}
