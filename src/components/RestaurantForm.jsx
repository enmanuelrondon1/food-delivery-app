// src/components/RestaurantForm.jsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">Cargando mapa...</p>
    </div>
  ),
});

export default function RestaurantForm({ restaurant, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    address: '',
    lat: 9.433411335833638,
    lng: -64.4748330379938,
    cuisine: '',
    deliveryTime: '30-40 min',
    isOpen: true,
  });
  
  // Estados separados para los inputs de coordenadas (como strings)
  const [latInput, setLatInput] = useState('9.433411335833638');
  const [lngInput, setLngInput] = useState('-64.4748330379938');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (restaurant) {
      const lat = restaurant.location?.lat || 9.433411335833638;
      const lng = restaurant.location?.lng || -64.4748330379938;
      
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        image: restaurant.image || '',
        address: restaurant.location?.address || '',
        lat: lat,
        lng: lng,
        cuisine: restaurant.cuisine || '',
        deliveryTime: restaurant.deliveryTime || '30-40 min',
        isOpen: restaurant.isOpen ?? true,
      });
      
      setLatInput(lat.toString());
      setLngInput(lng.toString());
    }
  }, [restaurant]);

  const handleLocationChange = (newLocation) => {
    setFormData((prev) => ({
      ...prev,
      lat: newLocation.lat,
      lng: newLocation.lng,
    }));
    setLatInput(newLocation.lat.toString());
    setLngInput(newLocation.lng.toString());
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setFormData((prev) => ({
          ...prev,
          lat: lat,
          lng: lng,
        }));
        setLatInput(lat.toString());
        setLngInput(lng.toString());
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener la ubicación. Asegúrate de dar permisos de ubicación al navegador.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleLatInputChange = (e) => {
    const value = e.target.value;
    setLatInput(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        lat: numValue,
      }));
    }
  };

  const handleLngInputChange = (e) => {
    const value = e.target.value;
    setLngInput(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        lng: numValue,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = restaurant
        ? `/api/restaurants/${restaurant._id}`
        : '/api/restaurants';
      const method = restaurant ? 'PUT' : 'POST';

      console.log('🚀 Enviando petición:', method, url);
      console.log('📦 Datos:', {
        name: formData.name,
        description: formData.description,
        image: formData.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        location: {
          address: formData.address,
          lat: formData.lat,
          lng: formData.lng,
        },
        cuisine: formData.cuisine,
        deliveryTime: formData.deliveryTime,
        isOpen: formData.isOpen,
      });

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image: formData.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          location: {
            address: formData.address,
            lat: formData.lat,
            lng: formData.lng,
          },
          cuisine: formData.cuisine,
          deliveryTime: formData.deliveryTime,
          isOpen: formData.isOpen,
        }),
      });

      console.log('📡 Respuesta status:', res.status);

      if (!res.ok) {
        // Obtener el mensaje de error del servidor
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('✅ Éxito:', data);
      onSuccess(data);
    } catch (err) {
      console.error('❌ Error completo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cuisineTypes = [
    'Italiana',
    'Americana',
    'Japonesa',
    'Mexicana',
    'Venezolana',
    'China',
    'Postres',
    'Café',
    'Parrilla',
    'Árabe',
    'India',
    'Peruana',
    'Española',
    'Francesa',
    'Tailandesa',
    'Otra',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nombre del Restaurante *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Ej: Pizzería Napolitana"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Describe tu restaurante y especialidades"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de Cocina *
        </label>
        <select
          required
          value={formData.cuisine}
          onChange={(e) =>
            setFormData({ ...formData, cuisine: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Selecciona un tipo</option>
          {cuisineTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          URL de la Imagen
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="https://images.unsplash.com/photo-..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Puedes buscar imágenes en{' '}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            Unsplash.com
          </a>
        </p>
        {formData.image && (
          <img
            src={formData.image}
            alt="Preview"
            className="mt-3 w-full h-48 object-cover rounded-lg"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Dirección *
        </label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Ej: Av. Principal, Anaco, Anzoátegui"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ubicación en el Mapa *
        </label>

        <div className="mb-4 space-y-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {gettingLocation ? (
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                📍 Usar Mi Ubicación Actual
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Latitud
              </label>
              <input
                type="text"
                value={latInput}
                onChange={handleLatInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                placeholder="9.433411"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Longitud
              </label>
              <input
                type="text"
                value={lngInput}
                onChange={handleLngInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                placeholder="-64.474833"
              />
            </div>
          </div>
        </div>

        <LocationPickerMap
          initialPosition={{ lat: formData.lat, lng: formData.lng }}
          onLocationChange={handleLocationChange}
        />
        <p className="text-xs text-gray-600 mt-2">
          💡 Puedes: (1) Hacer clic en el mapa, (2) Usar tu ubicación actual, o (3) Ingresar coordenadas manualmente
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tiempo de Entrega Estimado
        </label>
        <input
          type="text"
          value={formData.deliveryTime}
          onChange={(e) =>
            setFormData({ ...formData, deliveryTime: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Ej: 30-40 min"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isOpen"
          checked={formData.isOpen}
          onChange={(e) =>
            setFormData({ ...formData, isOpen: e.target.checked })
          }
          className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
        />
        <label htmlFor="isOpen" className="ml-3 text-sm font-semibold text-gray-700">
          Restaurante abierto (visible para clientes)
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : restaurant ? 'Actualizar Restaurante' : 'Crear Restaurante'}
        </button>
      </div>
    </form>
  );
}