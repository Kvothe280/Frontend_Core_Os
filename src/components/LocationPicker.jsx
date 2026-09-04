import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import '../leafletIcons.js';

const CENTRO_DEFAULT = [19.4326, -99.1332]; // CDMX

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [nombre, setNombre] = useState(value?.nombre || '');

  const cambiarNombre = (v) => {
    setNombre(v);
    if (value) onChange({ ...value, nombre: v });
  };

  const pick = (lat, lng) => onChange({ lat, lng, nombre });

  const quitar = () => {
    setNombre('');
    onChange(null);
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Ubicación (opcional) — toca el mapa para marcar el lugar
      </Typography>
      <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(111,78,55,0.15)', mb: 1 }}>
        <MapContainer
          key={value ? 'con-pin' : 'vacio'}
          center={value ? [value.lat, value.lng] : CENTRO_DEFAULT}
          zoom={value ? 13 : 4}
          style={{ height: 220, width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={pick} />
          {value && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Nombre del lugar"
          value={nombre}
          onChange={(e) => cambiarNombre(e.target.value)}
          disabled={!value}
          sx={{ flex: 1, minWidth: 180 }}
        />
        {value && (
          <Button size="small" color="error" onClick={quitar}>
            Quitar ubicación
          </Button>
        )}
      </Box>
      {value && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </Typography>
      )}
    </Box>
  );
}
