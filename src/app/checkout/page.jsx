// src/app/checkout/page.jsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import LocationPicker from "@/components/LocationPicker";

// Componente interno que usa useSearchParams
function CheckoutContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Mostrar mensaje si el usuario canceló el pago
  useEffect(() => {
    if (searchParams.get('canceled')) {
      setError('Pago cancelado. Puedes intentar de nuevo o pagar en efectivo.');
    }
  }, [searchParams]);

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

      // Si el método de pago es con tarjeta, usar Stripe
      if (paymentMethod === 'card') {
        // Crear sesión de checkout de Stripe
        const stripeRes = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderData: {
              ...orderData,
              items: cart.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          }),
        });

        const stripeData = await stripeRes.json();

        if (!stripeRes.ok) {
          setError(stripeData.error || 'Error al procesar el pago');
          return;
        }

        // Guardar datos temporales para recuperar después del pago
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        // Redirigir a Stripe Checkout
        window.location.href = stripeData.url;
        return;
      }

      // Si es efectivo, crear la orden directamente
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
                  {/* Efectivo */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    style={{
                      borderColor: paymentMethod === 'cash' ? '#f97316' : '#d1d5db',
                      backgroundColor: paymentMethod === 'cash' ? '#fff7ed' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💵</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Efectivo al entregar
                          </p>
                          <p className="text-sm text-gray-600">
                            Paga cuando recibas tu pedido
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Tarjeta con Stripe */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    style={{
                      borderColor: paymentMethod === 'card' ? '#f97316' : '#d1d5db',
                      backgroundColor: paymentMethod === 'card' ? '#fff7ed' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💳</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Tarjeta de Crédito/Débito
                          </p>
                          <p className="text-sm text-gray-600">
                            Pago seguro con Stripe
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                        alt="Stripe" 
                        className="h-6"
                      />
                    </div>
                  </label>
                </div>

                {/* Información de seguridad */}
                {paymentMethod === 'card' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <span className="text-blue-600">🔒</span>
                      <div className="text-xs text-blue-800">
                        <p className="font-semibold mb-1">Pago 100% seguro</p>
                        <p>Tus datos de tarjeta están protegidos por Stripe. Nunca almacenamos tu información de pago.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !deliveryAddress}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'card' ? '💳 Pagar con Tarjeta' : '✓ Confirmar Pedido'}
                    <span className="font-bold">${getTotal()}</span>
                  </>
                )}
              </button>

              {/* Tarjetas de prueba info */}
              {paymentMethod === 'card' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-800 mb-2">
                    💡 Tarjetas de prueba (modo desarrollo):
                  </p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• <span className="font-mono">4242 4242 4242 4242</span> - Pago exitoso</li>
                    <li>• <span className="font-mono">4000 0000 0000 0002</span> - Tarjeta declinada</li>
                    <li>• CVV: cualquier 3 dígitos | Fecha: cualquier futura</li>
                  </ul>
                </div>
              )}
            </form>
          </div>

          {/* Resumen del Pedido */}
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

            {/* Trust badges */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">🔒</span>
                  <p className="text-xs text-gray-600">Pago Seguro</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">🚚</span>
                  <p className="text-xs text-gray-600">Envío Rápido</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">✅</span>
                  <p className="text-xs text-gray-600">Garantizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}