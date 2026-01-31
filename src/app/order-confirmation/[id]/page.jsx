// src/app/order-confirmation/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (params.id) {
      fetchOrder();
    }
  }, [params.id, status]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error("Error obteniendo pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar después del useEffect existente:
  useEffect(() => {
    if (
      !order ||
      order.status === "delivered" ||
      order.status === "cancelled"
    ) {
      return;
    }

    // Auto-refresh cada 10 segundos para ver actualizaciones de estado
    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [order]);

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
      ready: "Listo para entregar",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 text-xl">Pedido no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Confirmación exitosa */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-gray-600 mb-4">
            Tu pedido ha sido recibido y está siendo procesado
          </p>
          <p className="text-sm text-gray-500">
            Número de orden:{" "}
            <span className="font-mono font-semibold">
              #{order._id.slice(-8)}
            </span>
          </p>
        </div>

        {/* Estado del pedido */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Estado del Pedido
            </h2>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                order.status,
              )}`}
            >
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Timeline del estado */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ["pending", "preparing", "ready", "delivered"].includes(
                    order.status,
                  )
                    ? "bg-orange-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Pedido recibido</p>
                <p className="text-sm text-gray-600">
                  Tu pedido fue confirmado
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ["preparing", "ready", "delivered"].includes(order.status)
                    ? "bg-orange-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">En preparación</p>
                <p className="text-sm text-gray-600">
                  El restaurante está preparando tu orden
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ["ready", "delivered"].includes(order.status)
                    ? "bg-orange-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">
                  Listo para entrega
                </p>
                <p className="text-sm text-gray-600">Tu pedido está listo</p>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status === "delivered"
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                4
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Entregado</p>
                <p className="text-sm text-gray-600">Disfruta tu comida</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del pedido */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Detalles del Pedido
          </h2>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    ${item.price} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 text-xl font-bold">
              <span>Total</span>
              <span className="text-orange-500">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Información de entrega */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Información de Entrega
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Dirección</p>
              <p className="font-medium text-gray-900">
                {order.deliveryAddress.street}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Método de pago</p>
              <p className="font-medium text-gray-900">
                {order.paymentMethod === "cash"
                  ? "Efectivo al entregar"
                  : "Tarjeta"}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Ordenar de nuevo
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
          >
            Ver mis pedidos
          </button>
        </div>
      </div>
    </div>
  );
}
