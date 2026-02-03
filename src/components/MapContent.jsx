// src/components/MapContent.jsx - VERSION DEBUG
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Next.js
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Componente para actualizar el mapa cuando cambia la ubicación
function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      console.log('🗺️ MapUpdater - Moviendo mapa a:', center);
      console.log('   Latitud:', center.lat);
      console.log('   Longitud:', center.lng);
      console.log('   Verificar en Google Maps:', `https://www.google.com/maps?q=${center.lat},${center.lng}`);
      
      // Forzar la actualización del centro del mapa
      map.setView([center.lat, center.lng], 13);
      
      // Alternativa con animación (comenta la línea anterior y descomenta esta si prefieres animación)
      // map.flyTo([center.lat, center.lng], 13, { duration: 1.5 });
    }
  }, [center, map]);
  
  return null;
}

// Componente para mostrar info de debug
function DebugInfo({ userLocation, restaurants }) {
  const map = useMap();
  const [mapCenter, setMapCenter] = useState(null);
  
  useEffect(() => {
    const updateCenter = () => {
      const center = map.getCenter();
      setMapCenter(center);
    };
    
    updateCenter();
    map.on('moveend', updateCenter);
    
    return () => {
      map.off('moveend', updateCenter);
    };
  }, [map]);
  
  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '60px', marginLeft: '10px' }}>
      <div className="bg-white/95 rounded-lg shadow-lg p-3 text-xs max-w-[250px]">
        <p className="font-bold text-purple-600 mb-2">🐛 DEBUG INFO</p>
        
        <div className="space-y-1">
          <p className="font-semibold text-gray-700">Ubicación recibida:</p>
          <p className="text-gray-600">Lat: {userLocation?.lat?.toFixed(6) || 'N/A'}</p>
          <p className="text-gray-600">Lng: {userLocation?.lng?.toFixed(6) || 'N/A'}</p>
          
          {mapCenter && (
            <>
              <p className="font-semibold text-gray-700 mt-2">Centro del mapa:</p>
              <p className="text-gray-600">Lat: {mapCenter.lat?.toFixed(6)}</p>
              <p className="text-gray-600">Lng: {mapCenter.lng?.toFixed(6)}</p>
              
              {userLocation && (
                <p className={`mt-2 font-semibold ${
                  Math.abs(mapCenter.lat - userLocation.lat) < 0.01 &&
                  Math.abs(mapCenter.lng - userLocation.lng) < 0.01
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {Math.abs(mapCenter.lat - userLocation.lat) < 0.01 &&
                   Math.abs(mapCenter.lng - userLocation.lng) < 0.01
                    ? '✅ Mapa centrado correctamente'
                    : '❌ Mapa NO está en la ubicación correcta'}
                </p>
              )}
            </>
          )}
          
          <p className="text-gray-600 mt-2">Restaurantes: {restaurants?.length || 0}</p>
        </div>
        
        <button
          onClick={() => {
            console.log('📍 Datos completos:', {
              userLocation,
              mapCenter,
              restaurants: restaurants?.length
            });
          }}
          className="mt-2 bg-purple-500 text-white px-2 py-1 rounded text-xs w-full hover:bg-purple-600"
        >
          Log en consola
        </button>
      </div>
    </div>
  );
}

export default function MapContent({ restaurants, userLocation }) {
  // Validación de userLocation
  if (!userLocation || !userLocation.lat || !userLocation.lng) {
    console.warn('⚠️ MapContent - No hay ubicación válida:', userLocation);
    return (
      <div className="w-full h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Esperando ubicación...</p>
      </div>
    );
  }

  console.log('🗺️ MapContent - Renderizando con ubicación:', userLocation);
  console.log('   Número de restaurantes:', restaurants?.length || 0);

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
      className="shadow-lg z-10"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Componente que actualiza el mapa cuando cambia la ubicación */}
      <MapUpdater center={userLocation} />
      
      {/* Panel de debug */}
      {/* <DebugInfo userLocation={userLocation} restaurants={restaurants} /> */}

      {/* Marcador de usuario - GRANDE Y VISIBLE */}
      <Marker 
        position={[userLocation.lat, userLocation.lng]}
        icon={L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div style="
              background: #3B82F6;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            ">
              📍
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })}
      >
        <Popup>
          <div className="text-center">
            <strong className="text-blue-600 text-lg">📍 TU UBICACIÓN</strong>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </p>
            <a 
              href={`https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 underline mt-1 block"
            >
              Ver en Google Maps
            </a>
          </div>
        </Popup>
      </Marker>

      {/* Marcadores de restaurantes */}
      {restaurants && restaurants.map((restaurant) => (
        <Marker
          key={restaurant._id}
          position={[restaurant.location.lat, restaurant.location.lng]}
          icon={L.divIcon({
            className: 'custom-restaurant-marker',
            html: `
              <div style="
                background: #8B5CF6;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
              ">
                🍽️
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>
            <div>
              <h3 className="font-bold text-purple-600">{restaurant.name}</h3>
              <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
              <p className="text-sm">⭐ {restaurant.rating}</p>
              {restaurant.distance && (
                <p className="text-sm font-semibold text-blue-600">
                  📍 {restaurant.distance} km de distancia
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1 font-mono">
                {restaurant.location.lat.toFixed(4)}, {restaurant.location.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}