// src/components/Map.jsx
'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Componente del mapa que se renderiza solo en el cliente
const MapContent = dynamic(
  () => import('./MapContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    )
  }
);

export default function Map({ restaurants, userLocation }) {
  return <MapContent restaurants={restaurants} userLocation={userLocation} />;
}