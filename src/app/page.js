// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RestaurantCard from '@/components/RestaurantCard';
import NearbyRestaurantsModal from '@/components/NearbyRestaurantsModal';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNearbyModal, setShowNearbyModal] = useState(false);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [restaurants, searchTerm, selectedCuisine, priceRange, sortBy]);

  const fetchAllRestaurants = async () => {
    try {
      // Obtener todos los restaurantes sin filtrar por ubicación
      const res = await fetch('/api/restaurants?all=true');
      const data = await res.json();
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch (error) {
      console.error('Error obteniendo restaurantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...restaurants];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCuisine !== 'all') {
      filtered = filtered.filter((r) => r.cuisine === selectedCuisine);
    }

    if (priceRange !== 'all') {
      if (priceRange === 'low') {
        filtered = filtered.filter((r) => r.rating < 4.0);
      } else if (priceRange === 'medium') {
        filtered = filtered.filter((r) => r.rating >= 4.0 && r.rating < 4.5);
      } else if (priceRange === 'high') {
        filtered = filtered.filter((r) => r.rating >= 4.5);
      }
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRestaurants(filtered);
  };

  const cuisineTypes = ['all', ...new Set(restaurants.map((r) => r.cuisine))];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('all');
    setPriceRange('all');
    setSortBy('rating');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Cargando restaurantes...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Agrupar por categoría
  const restaurantsByCategory = cuisineTypes.slice(1).reduce((acc, cuisine) => {
    acc[cuisine] = restaurants.filter((r) => r.cuisine === cuisine);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fadeIn">
              ¿Qué quieres comer hoy? 🍔
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Descubre los mejores restaurantes y pide tu comida favorita
            </p>
            
            {/* Búsqueda principal */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar pizza, sushi, hamburguesas..."
                  className="w-full px-6 py-5 pl-14 text-lg rounded-full shadow-2xl focus:ring-4 focus:ring-white/50 outline-none transition text-gray-900"
                />
                <svg
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 w-7 h-7 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8 flex-wrap">
              <div className="text-center">
                <p className="text-4xl font-bold">{restaurants.length}+</p>
                <p className="text-orange-100">Restaurantes</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold">4.5⭐</p>
                <p className="text-orange-100">Calificación promedio</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold">30min</p>
                <p className="text-orange-100">Entrega promedio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros rápidos */}
        <div className="mb-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            <button
              onClick={() => setSelectedCuisine('all')}
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition ${
                selectedCuisine === 'all'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🍽️ Todos
            </button>
            {cuisineTypes.slice(1).map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition ${
                  selectedCuisine === cuisine
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cuisine === 'Italiana' && '🍕'}
                {cuisine === 'Mexicana' && '🌮'}
                {cuisine === 'Japonesa' && '🍣'}
                {cuisine === 'Americana' && '🍔'}
                {' '}{cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros adicionales */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
              >
                <option value="all">💰 Todos los precios</option>
                <option value="low">$ Económico</option>
                <option value="medium">$$ Moderado</option>
                <option value="high">$$$ Premium</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
              >
                <option value="rating">⭐ Mejor calificación</option>
                <option value="name">🔤 Nombre (A-Z)</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium text-gray-700"
            >
              🔄 Limpiar
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando{' '}
            <span className="font-bold text-orange-500 text-lg">
              {filteredRestaurants.length}
            </span>{' '}
            {filteredRestaurants.length === 1 ? 'restaurante' : 'restaurantes'}
          </p>
        </div>

        {/* Grid de restaurantes */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-8xl mb-6">😕</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              No encontramos restaurantes
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              Intenta con otros filtros o búsqueda
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-full transition shadow-xl font-bold text-lg"
            >
              Ver todos los restaurantes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <div
                key={restaurant._id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante para ver restaurantes cercanos */}
      <button
        onClick={() => setShowNearbyModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center gap-3 font-bold text-lg z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        Ver cercanos
      </button>

      {/* Modal de restaurantes cercanos */}
      {showNearbyModal && (
        <NearbyRestaurantsModal onClose={() => setShowNearbyModal(false)} />
      )}
    </div>
  );
}