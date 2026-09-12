import { MONO_FONT } from './terminalTheme.js';

// Estilos compartidos entre los sub-paneles de AdminPanel (preguntas, pool
// especial, pool mensual) — todos usan las mismas cards/forms con el theme `tc`.

export const cardSx = (tc) => ({
  p: 1.5,
  mb: 1,
  bgcolor: 'rgba(255,255,255,0.04)',
  border: `1px solid ${tc.border}30`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

export const formCardSx = (tc) => ({
  bgcolor: 'rgba(255,255,255,0.02)',
  border: `1px dashed ${tc.border}50`,
});

export const fieldSx = (tc) => ({
  '& .MuiInputBase-input': { fontFamily: MONO_FONT, fontSize: 13.5, color: tc.input },
  '& fieldset': { borderColor: `${tc.border}60` },
  '&:hover fieldset': { borderColor: tc.border },
  '&.Mui-focused fieldset': { borderColor: tc.border },
});

export const labelSx = (tc) => ({
  fontFamily: MONO_FONT,
  fontSize: 13,
  color: `${tc.text}99`,
  '&.Mui-focused': { color: tc.text },
});

export const buttonSx = (tc) => ({
  fontFamily: MONO_FONT,
  fontSize: 12,
  color: tc.text,
  borderColor: `${tc.border}60`,
  '&:hover': { borderColor: tc.border, bgcolor: `${tc.border}12` },
});
