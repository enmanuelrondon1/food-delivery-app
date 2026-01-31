// src/components/LocationPickerMap.jsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

function LocationMarker({ onLocationChange, center }) {
  const [position, setPosition] = useState(center);

  useMapEvents({
    click(e) {
      const newPosition = e.latlng;
      setPosition(newPosition);
      onLocationChange({
        lat: newPosition.lat,
        lng: newPosition.lng,
      });
    },
  });

  useEffect(() => {
    setPosition(center);
  }, [center]);

  return position ? <Marker position={position} /> : null;
}

export default function LocationPickerMap({ center, onLocationChange }) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={15}
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
      className="z-10"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationChange={onLocationChange} center={center} />
      
      {/* Instrucción */}
      <div className="leaflet-top leaflet-center" style={{ pointerEvents: 'none' }}>
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg m-4">
          <p className="text-sm text-gray-700 font-medium">
            📍 Haz clic en el mapa para seleccionar tu ubicación
          </p>
        </div>
      </div>
    </MapContainer>
  );
}