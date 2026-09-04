export const TIPOS = [
  { value: 'recuerdo', label: 'Recuerdo' },
  { value: 'cita', label: 'Cita' },
];

export function etiquetaTipo(tipo) {
  if (tipo === 'cafe' || tipo === 'cita') return 'Cita';
  return TIPOS.find((t) => t.value === tipo)?.label ?? tipo;
}
