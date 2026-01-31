// src/app/checkout/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LocationPicker from "@/components/LocationPicker";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState({
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!deliveryAddress.trim()) {
      setError("Por favor selecciona tu ubicación de entrega");
      return;
    }

    if (deliveryCoordinates.lat === 0 && deliveryCoordinates.lng === 0) {
      setError("Por favor selecciona una ubicación válida en el mapa");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerId: session.user.id,
        restaurantId: cart.restaurantId,
        items: cart.items.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getTotal(),
        deliveryAddress: {
          street: deliveryAddress,
          lat: deliveryCoordinates.lat,
          lng: deliveryCoordinates.lng,
        },
        paymentMethod,
        status: "pending",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear pedido");
        return;
      }

      localStorage.removeItem("cart");
      router.push(`/order-confirmation/${data._id}`);
    } catch (error) {
      setError("Error al procesar el pedido");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    if (!cart) return 0;
    return cart.items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  if (status === "loading" || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Finalizar Pedido
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Detalles de Entrega
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de entrega *
                </label>

                <LocationPicker
                  onLocationSelect={(location) => {
                    setDeliveryAddress(location.address);
                    setDeliveryCoordinates({
                      lat: location.lat,
                      lng: location.lng,
                    });
                  }}
                />

                {deliveryAddress && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      ✓ Ubicación confirmada
                    </p>
                    <p className="text-xs text-green-700">{deliveryAddress}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pago
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Efectivo al entregar
                      </p>
                      <p className="text-sm text-gray-600">
                        Paga cuando recibas tu pedido
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Tarjeta (Simulado)
                      </p>
                      <p className="text-sm text-gray-600">
                        Pago con tarjeta de crédito/débito
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !deliveryAddress}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Procesando..." : "Confirmar Pedido"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Resumen del Pedido
            </h2>

            <div className="mb-4 pb-4 border-b">
              <p className="text-gray-600">De:</p>
              <p className="font-semibold text-gray-900">
                {cart.restaurantName}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center"
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
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${getTotal()}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-600">Delivery</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold border-t pt-4">
                <span>Total</span>
                <span className="text-orange-500">${getTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}