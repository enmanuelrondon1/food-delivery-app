// src/app/orders/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
// Agregar al inicio después de las importaciones
import RatingModal from "@/components/RatingModal";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session, status]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?customerId=${session.user.id}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error obteniendo pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pendiente",
      preparing: "En preparación",
      ready: "Listo",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return texts[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Agregar esta función antes del return:
  const handleRateOrder = async (rating, comment) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          customerId: session.user.id,
          restaurantId: selectedOrder.restaurantId,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        // Actualizar la lista de pedidos
        fetchOrders();
        setShowRatingModal(false);
        setSelectedOrder(null);
        alert("¡Gracias por tu calificación!");
      } else {
        const data = await res.json();
        alert(data.error || "Error al enviar calificación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar calificación");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-600 mb-6">
              Explora los restaurantes y haz tu primer pedido
            </p>
            <Link
              href="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Ver Restaurantes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="block">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Pedido #{order._id.slice(-8)}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                        {order.rating && (
                          <span className="text-yellow-500 text-sm">
                            ⭐ {order.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item(s)
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Artículos:</p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <p key={index} className="text-sm text-gray-900">
                          • {item.name} x{item.quantity}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-600">
                          + {order.items.length - 3} más...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      📍 {order.deliveryAddress.street}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/order-confirmation/${order._id}`}
                        className="text-orange-500 text-sm font-semibold hover:underline"
                      >
                        Ver detalles →
                      </Link>
                      {order.status === "delivered" && !order.rating && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRatingModal(true);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Calificar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Modal de calificación */}
            {showRatingModal && selectedOrder && (
              <RatingModal
                order={selectedOrder}
                onClose={() => {
                  setShowRatingModal(false);
                  setSelectedOrder(null);
                }}
                onSubmit={handleRateOrder}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
