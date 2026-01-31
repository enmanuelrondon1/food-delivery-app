// src/app/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

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

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const resOrders = await fetch('/api/orders/restaurant');
      const ordersData = await resOrders.json();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error obteniendo datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Actualizar optimísticamente en la UI primero
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Hacer la petición al servidor
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Si falla, revertir y refrescar
        alert('Error al actualizar el estado del pedido');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      alert('Error de conexión');
      // Refrescar para sincronizar
      fetchDashboardData();
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard del Restaurante
          </h1>
          <p className="text-gray-600">
            Gestiona tus pedidos y menú desde aquí
          </p>
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
                Pedidos ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === 'menu'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Menú
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

                      {/* Items del pedido */}
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

                      {/* Dirección */}
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">
                          Dirección de entrega:
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.deliveryAddress.street}
                        </p>
                      </div>

                      {/* Acciones */}
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
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  Gestión de menú próximamente
                </p>
                <p className="text-sm text-gray-500">
                  Por ahora puedes usar el script seed.js para agregar items al
                  menú
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}