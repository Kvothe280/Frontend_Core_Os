import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { mediaUrl } from '../api';
import { etiquetaTipo } from '../constants/recuerdoTipos';
import { formatearFecha } from '../constants/fechaUtils';
import '../leafletIcons.js';

const CENTRO_DEFAULT = [19.4326, -99.1332]; // CDMX

function AjustarVista({ puntos }) {
  const map = useMap();
  useEffect(() => {
    if (puntos.length === 0) return;
    if (puntos.length === 1) {
      map.setView(puntos[0], 13);
    } else {
      map.fitBounds(puntos, { padding: [32, 32] });
    }
  }, [map, puntos]);
  return null;
}

export default function MapaRecuerdos({ items }) {
  const conUbicacion = items.filter((i) => i.ubicacion);
  const puntos = conUbicacion.map((i) => [i.ubicacion.lat, i.ubicacion.lng]);

  if (conUbicacion.length === 0) {
    return (
      <Typography color="text.secondary">
        Ningún recuerdo tiene ubicación todavía. Agrégala editando un recuerdo o al crear uno nuevo.
      </Typography>
    );
  }

  return (
    <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(111,78,55,0.15)' }}>
      <MapContainer center={CENTRO_DEFAULT} zoom={4} style={{ height: 480, width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarVista puntos={puntos} />
        {conUbicacion.map((item) => (
          <Marker key={item._id} position={[item.ubicacion.lat, item.ubicacion.lng]}>
            <Popup>
              <Box sx={{ minWidth: 160 }}>
                {item.imagen && (
                  <Box
                    component="img"
                    src={mediaUrl(item.imagen)}
                    alt={item.titulo}
                    sx={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 1, mb: 0.5 }}
                  />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {item.titulo}
                </Typography>
                {item.ubicacion.nombre && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {item.ubicacion.nombre}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {etiquetaTipo(item.tipo)} · {formatearFecha(item.fecha)}
                </Typography>
                {item.nota && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    {item.nota}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
