import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

/**
 * Wrapper de DatePicker consistente en toda la app.
 * value/onChange trabajan con strings 'YYYY-MM-DD' (o '' vacío).
 */
export default function DatePickerField({ label = 'Fecha en que se usará', value, onChange, disabled, sx }) {
  const dayjsValue = value ? dayjs(value) : null;

  return (
    <DatePicker
      label={label}
      value={dayjsValue}
      onChange={(newVal) => onChange(newVal ? newVal.format('YYYY-MM-DD') : '')}
      disabled={disabled}
      format="DD/MM/YYYY"
      slotProps={{
        textField: {
          fullWidth: true,
          sx,
        },
        popper: {
          sx: {
            '& .MuiPaper-root': {
              border: '1px solid rgba(111, 78, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(59, 42, 29, 0.16)',
            },
          },
        },
      }}
    />
  );
}
