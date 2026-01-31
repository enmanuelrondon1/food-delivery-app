// src/components/NearbyRestaurantsModal.jsx
'use client';

import { useState, useEffect } from 'react';
import Map from './Map';
import RestaurantCard from './RestaurantCard';

export default function NearbyRestaurantsModal({ onClose }) {
  const [restaurants, setRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState(null); // Ubicación REAL del usuario
  const [searchLocation, setSearchLocation] = useState(null); // Ubicación de búsqueda seleccionada
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('restaurants'); // 'restaurants' o 'places'
  const [searchResults, setSearchResults] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [selectedPlaceName, setSelectedPlaceName] = useState(''); // Nombre del lugar seleccionado

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setSearchLocation(location); // Al inicio, la búsqueda es en tu ubicación real
          fetchNearbyRestaurants(location);
        },
        (error) => {
          console.error('Error:', error);
          alert('No pudimos obtener tu ubicación. Por favor, habilita los permisos de ubicación.');
          onClose();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
      onClose();
    }
  };

  const fetchNearbyRestaurants = async (location) => {
    try {
      const res = await fetch(
        `/api/restaurants?lat=${location.lat}&lng=${location.lng}`
      );
      const data = await res.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda de lugares con Nominatim (OpenStreetMap)
  const searchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchingPlaces(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error buscando lugares:', error);
    } finally {
      setSearchingPlaces(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    
    if (searchType === 'places') {
      // Debounce para búsqueda de lugares
      const timeoutId = setTimeout(() => {
        searchPlaces(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const selectPlace = (place) => {
    const newLocation = {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    };
    setSearchLocation(newLocation); // Actualizar la ubicación de BÚSQUEDA
    setSelectedPlaceName(place.display_name); // Guardar el nombre del lugar
    fetchNearbyRestaurants(newLocation);
    setSearchResults([]);
    setSearchTerm('');
  };

  const resetToMyLocation = () => {
    if (userLocation) {
      setSearchLocation(userLocation);
      setSelectedPlaceName('');
      fetchNearbyRestaurants(userLocation);
      setSearchTerm('');
    }
  };

  const filteredRestaurants = restaurants.filter((r) =>
    searchTerm && searchType === 'restaurants'
      ? r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Determinar qué ubicación mostrar en el mapa (la de búsqueda)
  const currentDisplayLocation = searchLocation || userLocation;
  
  // Verificar si estamos mostrando la ubicación real del usuario o una búsqueda
  const isShowingRealLocation = userLocation && searchLocation && 
    userLocation.lat === searchLocation.lat && 
    userLocation.lng === searchLocation.lng;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold">📍 Restaurantes Cerca de Ti</h2>
              <p className="text-blue-100 mt-1">
                {loading ? 'Detectando ubicación...' : `${filteredRestaurants.length} restaurantes encontrados`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs de búsqueda */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setSearchType('restaurants');
                setSearchResults([]);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                searchType === 'restaurants'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🍽️ Buscar restaurantes
            </button>
            <button
              onClick={() => {
                setSearchType('places');
                setSearchTerm('');
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                searchType === 'places'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🗺️ Buscar lugares
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={
                searchType === 'restaurants'
                  ? 'Buscar en restaurantes cercanos...'
                  : 'Buscar dirección, ciudad, país...'
              }
              className="w-full px-4 py-3 pl-12 rounded-lg text-gray-900 focus:ring-2 focus:ring-white/50 outline-none"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchingPlaces && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Resultados de búsqueda de lugares */}
            {searchType === 'places' && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto z-10">
                {searchResults.map((place) => (
                  <button
                    key={place.place_id}
                    onClick={() => selectPlace(place)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition"
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{place.display_name}</p>
                        <p className="text-xs text-gray-500">{place.type}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información de ubicación - MEJORADA */}
          {currentDisplayLocation && (
            <div className="mt-3 space-y-2">
              {/* Ubicación actual de búsqueda */}
              <div className={`rounded-lg px-4 py-2 text-sm ${
                isShowingRealLocation 
                  ? 'bg-green-500/30 border border-green-300'
                  : 'bg-yellow-500/30 border border-yellow-300'
              }`}>
                {isShowingRealLocation ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <div className="flex-1">
                      <p className="font-semibold">Mostrando restaurantes cerca de TU UBICACIÓN REAL</p>
                      <p className="text-xs opacity-90">
                        Lat: {currentDisplayLocation.lat.toFixed(4)}, Lng: {currentDisplayLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <div className="flex-1">
                      <p className="font-semibold">Mostrando restaurantes cerca de:</p>
                      <p className="text-xs opacity-90">
                        {selectedPlaceName || `Lat: ${currentDisplayLocation.lat.toFixed(4)}, Lng: ${currentDisplayLocation.lng.toFixed(4)}`}
                      </p>
                    </div>
                    <button
                      onClick={resetToMyLocation}
                      className="bg-white/30 hover:bg-white/50 px-3 py-1 rounded text-xs font-medium transition"
                    >
                      🎯 Volver a mi ubicación
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 320px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Obteniendo tu ubicación...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mapa */}
              <div className="lg:sticky lg:top-0 h-fit">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <Map 
                    restaurants={filteredRestaurants} 
                    userLocation={currentDisplayLocation}
                    showUserMarker={true}
                  />
                </div>
                
                {/* Instrucciones */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">💡 Consejos:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Usa "Buscar lugares" para explorar otras ubicaciones</li>
                    <li>• Busca direcciones, ciudades o países</li>
                    <li>• Los restaurantes se actualizarán automáticamente</li>
                    <li>• Usa el botón "Volver a mi ubicación" para regresar</li>
                  </ul>
                </div>
              </div>

              {/* Lista de restaurantes */}
              <div className="space-y-4">
                {filteredRestaurants.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg mb-2">No hay restaurantes cerca</p>
                    <p className="text-gray-400 text-sm">
                      Intenta buscar en otra ubicación usando "Buscar lugares"
                    </p>
                  </div>
                ) : (
                  filteredRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}