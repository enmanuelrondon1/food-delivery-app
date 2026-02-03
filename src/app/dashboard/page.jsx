// src/app/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RestaurantForm from '@/components/RestaurantForm';
import MenuManagement from '@/components/MenuManagement';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session.user.role !== 'restaurant') {
        router.push('/');
        return;
      }
      fetchDashboardData();
    }
  }, [session, status]);

  // Auto-refresh cada 30 segundos solo para pedidos
  useEffect(() => {
    if (activeTab === 'orders') {
      const interval = setInterval(() => {
        fetchOrders();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([fetchRestaurant(), fetchOrders()]);
    } catch (error) {
      console.error('Error obteniendo datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurant = async () => {
    try {
      const res = await fetch('/api/restaurants/my-restaurant');
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data);
      } else if (res.status === 404) {
        // No tiene restaurante aún
        setRestaurant(null);
      }
    } catch (error) {
      console.error('Error obteniendo restaurante:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/restaurant');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        alert('Error al actualizar el estado del pedido');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      alert('Error de conexión');
      fetchOrders();
    }
  };

  const handleRestaurantSuccess = (data) => {
    setRestaurant(data);
    setShowRestaurantForm(false);
    alert('Restaurante guardado exitosamente');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Si no tiene restaurante, mostrar formulario de creación
  if (!restaurant && !showRestaurantForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Bienvenido!
              </h1>
              <p className="text-gray-600">
                Para comenzar, registra tu restaurante en nuestra plataforma
              </p>
            </div>
            <button
              onClick={() => setShowRestaurantForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition text-lg"
            >
              Registrar Mi Restaurante
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de creación/edición de restaurante
  if (showRestaurantForm || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {restaurant ? 'Editar Restaurante' : 'Registrar Restaurante'}
            </h1>
            {restaurant && (
              <button
                onClick={() => setShowRestaurantForm(false)}
                className="text-gray-600 hover:text-gray-900 font-semibold"
              >
                ← Volver al Dashboard
              </button>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <RestaurantForm
              restaurant={restaurant}
              onSuccess={handleRestaurantSuccess}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con info del restaurante */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {restaurant.image && (
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {restaurant.name}
                </h1>
                <p className="text-gray-600 mb-2">{restaurant.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    📍 {restaurant.location.address}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      restaurant.isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowRestaurantForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Editar Restaurante
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Pedidos Pendientes</p>
            <p className="text-3xl font-bold text-orange-500">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">En Preparación</p>
            <p className="text-3xl font-bold text-blue-500">
              {orders.filter((o) => o.status === 'preparing').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Listos</p>
            <p className="text-3xl font-bold text-green-500">
              {orders.filter((o) => o.status === 'ready').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Hoy</p>
            <p className="text-3xl font-bold text-gray-900">
              ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === 'orders'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📦 Pedidos ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === 'menu'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🍽️ Menú
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'orders' ? (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No hay pedidos aún</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="border rounded-lg p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Pedido #{order._id.slice(-8)}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>

                      <div className="mb-4 space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-gray-900 font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">
                          Dirección de entrega:
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.deliveryAddress.street}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id, 'preparing')
                            }
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                          >
                            Comenzar a preparar
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id, 'ready')
                            }
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                          >
                            Marcar como listo
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id, 'delivered')
                            }
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                          >
                            Marcar como entregado
                          </button>
                        )}
                        {order.status !== 'cancelled' &&
                          order.status !== 'delivered' && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order._id, 'cancelled')
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                            >
                              Cancelar
                            </button>
                          )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <MenuManagement restaurantId={restaurant._id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}