export const NOMBRES = { karol: 'Karol', enrique: 'Enrique' };

export function nombreDe(usuario) {
  return NOMBRES[usuario] ?? usuario;
}

export function otroUsuario(usuario) {
  return usuario === 'karol' ? 'enrique' : 'karol';
}
