// src/components/LocationPicker.jsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Cargando mapa...</p>
    </div>
  ),
});

export default function LocationPicker({ onLocationSelect, initialLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [address, setAddress] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('📍 Ubicación obtenida del navegador:', location);
        console.log('   Precisión:', position.coords.accuracy, 'metros');
        setSelectedLocation(location);
        reverseGeocode(location);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación:', error);
        let errorMsg = 'No se pudo obtener tu ubicación. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Permisos denegados. Verifica la configuración del navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'La ubicación no está disponible. Intenta usar coordenadas manuales.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Tiempo agotado. Intenta de nuevo o usa coordenadas manuales.';
            break;
        }
        
        alert(errorMsg);
        setLoading(false);
        setShowManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Por favor ingresa coordenadas válidas');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Coordenadas fuera de rango válido\nLatitud: -90 a 90\nLongitud: -180 a 180');
      return;
    }
    
    const location = { lat, lng };
    console.log('📍 Ubicación manual ingresada:', location);
    setSelectedLocation(location);
    reverseGeocode(location);
    setShowManualInput(false);
  };

  const reverseGeocode = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
      );
      const data = await response.json();
      console.log('🗺️ Geocoding inverso:', data.display_name);
      // ✅ SOLO actualiza la dirección, NO las coordenadas
      setAddress(data.display_name || 'Ubicación seleccionada');
    } catch (error) {
      console.error('Error en geocoding:', error);
      setAddress(`Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`);
    }
  };

  const handleLocationChange = (location) => {
    console.log('📍 Ubicación cambiada desde el mapa:', location);
    // ✅ Actualiza la ubicación seleccionada sin sobrescribir
    setSelectedLocation(location);
    reverseGeocode(location);
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      alert('Por favor selecciona una ubicación');
      return;
    }

    const finalAddress = additionalDetails 
      ? `${address} - ${additionalDetails}`
      : address;

    console.log('✅ Ubicación confirmada:', {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: finalAddress
    });

    onLocationSelect({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: finalAddress,
    });
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && !selectedLocation) {
      const suggestedLocation = {
        lat: 9.433411335833638,
        lng: -64.4748330379938
      };
      console.log('💡 Sugerencia de ubicación inicial:', suggestedLocation);
    }
  }, [isOpen, selectedLocation]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-gray-700"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {address || 'Seleccionar ubicación en el mapa'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Selecciona tu ubicación
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Nota: Las computadoras no tienen GPS preciso
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Si la ubicación automática no es precisa, usa la opción de ingresar coordenadas manualmente o haz clic en el mapa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Usar mi ubicación actual
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  {showManualInput ? 'Ocultar' : 'Ingresar'} coordenadas
                </button>
              </div>

              {showManualInput && (
                <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-900 mb-3">
                    📍 Ingresa las coordenadas de tu ubicación
                  </p>
                  <p className="text-xs text-purple-700 mb-3">
                    Puedes obtener tus coordenadas desde Google Maps en tu teléfono:
                    <br />1. Abre Google Maps y mantén presionado tu ubicación
                    <br />2. Copia las coordenadas que aparecen
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-purple-900 mb-1">
                        Latitud
                      </label>
                      <input
                        type="text"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        placeholder="9.433411"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-900 mb-1">
                        Longitud
                      </label>
                      <input
                        type="text"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        placeholder="-64.474833"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-gray-900"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualLocationSubmit}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                  >
                    Usar estas coordenadas
                  </button>
                </div>
              )}

              <div className="mb-4">
                <LocationPickerMap
                  center={selectedLocation || { lat: 9.433411335833638, lng: -64.4748330379938 }}
                  onLocationChange={handleLocationChange}
                />
              </div>

              {address && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    Ubicación seleccionada:
                  </p>
                  <p className="text-gray-900 font-medium">{address}</p>
                  {selectedLocation && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detalles adicionales (opcional)
                </label>
                <input
                  type="text"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Ej: Casa #123, Edificio Azul, Piso 5, Apto 12B"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-gray-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedLocation}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar ubicación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}