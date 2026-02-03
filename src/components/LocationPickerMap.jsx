// src/components/LocationPickerMap.jsx
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, onLocationChange }) {
  const markerRef = useRef(null);
  
  const map = useMapEvents({
    click(e) {
      const newPos = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      setPosition(newPos);
      onLocationChange(newPos);
    },
  });

  // ✅ Solo actualizar la vista del mapa cuando cambie la posición
  // NO llamar a onLocationChange aquí para evitar loops
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position?.lat, position?.lng, map]);

  return position === null ? null : <Marker position={[position.lat, position.lng]} ref={markerRef} />;
}

export default function LocationPickerMap({ initialPosition, center, onLocationChange }) {
  const [position, setPosition] = useState(initialPosition || center || { lat: 9.433411335833638, lng: -64.4748330379938 });
  const [mounted, setMounted] = useState(false);
  const isFirstRender = useRef(true);
  
  // Estados para el buscador
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Actualizar posición SOLO cuando cambien las props externas
  useEffect(() => {
    if (initialPosition) {
      console.log('📍 LocationPickerMap: Actualizando desde initialPosition:', initialPosition);
      setPosition(initialPosition);
    } else if (center) {
      console.log('📍 LocationPickerMap: Actualizando desde center:', center);
      setPosition(center);
    }
  }, [initialPosition?.lat, initialPosition?.lng, center?.lat, center?.lng]);

  // ✅ NO llamar a onLocationChange en el primer render
  // Solo llamarlo cuando el usuario interactúe con el mapa
  const handlePositionChange = (newPos) => {
    console.log('📍 LocationPickerMap: Nueva posición desde interacción:', newPos);
    setPosition(newPos);
    // Solo notificar si NO es el primer render
    if (!isFirstRender.current) {
      onLocationChange(newPos);
    }
  };

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  // 🔍 Función para buscar direcciones
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Por favor ingresa una dirección para buscar');
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      // Usar Nominatim (OpenStreetMap) para geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      
      const data = await response.json();
      
      if (data.length === 0) {
        alert('No se encontraron resultados. Intenta con otra búsqueda.');
        setSearching(false);
        return;
      }

      console.log('🔍 Resultados de búsqueda:', data);
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Error al buscar la dirección. Intenta de nuevo.');
    } finally {
      setSearching(false);
    }
  };

  // Manejar selección de resultado
  const handleSelectResult = (result) => {
    const newPos = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    
    console.log('📍 Ubicación seleccionada desde búsqueda:', newPos);
    setPosition(newPos);
    onLocationChange(newPos);
    setShowResults(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Buscador de direcciones */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm font-medium text-green-900">Buscar dirección</span>
        </div>
        
        <p className="text-xs text-green-700 mb-3">
          Escribe una dirección (ej: "Anaco, Anzoátegui, Venezuela") y presiona buscar
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ej: Anaco Estado Anzoátegui"
            className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Buscando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </>
            )}
          </button>
        </div>

        {/* Resultados de búsqueda */}
        {showResults && searchResults.length > 0 && (
          <div className="mt-3 bg-white border border-green-200 rounded-lg max-h-60 overflow-y-auto">
            <div className="p-2 bg-green-100 border-b border-green-200">
              <p className="text-xs font-medium text-green-900">Selecciona una ubicación:</p>
            </div>
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-3 py-2 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition"
              >
                <p className="text-sm text-gray-900">{result.display_name}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="h-[400px] rounded-lg overflow-hidden border-2 border-gray-300">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          key={`${position.lat}-${position.lng}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition}
            onLocationChange={handlePositionChange}
          />
        </MapContainer>
      </div>
      
      <p className="text-sm text-gray-600">
        💡 Puedes: (1) Buscar una dirección arriba, (2) Hacer clic en el mapa, o (3) Usar coordenadas manuales
      </p>
    </div>
  );
}