// src/app/restaurant/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantData();
  }, [params.id]);

  const fetchRestaurantData = async () => {
    try {
      // Obtener información del restaurante
      const resRestaurant = await fetch(`/api/restaurants/${params.id}`);
      const restaurantData = await resRestaurant.json();
      setRestaurant(restaurantData);

      // Obtener menú del restaurante
      const resMenu = await fetch(`/api/menu?restaurantId=${params.id}`);
      const menuData = await resMenu.json();
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find((cartItem) => cartItem._id === itemId);
    
    if (existingItem.quantity === 1) {
      setCart(cart.filter((cartItem) => cartItem._id !== itemId));
    } else {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    }
  };

  const getCartItemQuantity = (itemId) => {
    const item = cart.find((cartItem) => cartItem._id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Guardar carrito en localStorage y redirigir a checkout
    localStorage.setItem('cart', JSON.stringify({
      items: cart,
      restaurantId: params.id,
      restaurantName: restaurant.name,
    }));
    router.push('/checkout');
  };

  // Agrupar items por categoría
  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Restaurante no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header del restaurante */}
      <div className="relative h-64 w-full">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 pb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {restaurant.name}
            </h1>
            <p className="text-white text-lg">{restaurant.description}</p>
            <div className="flex items-center gap-4 mt-2 text-white">
              <span>⭐ {restaurant.rating}</span>
              <span>•</span>
              <span>{restaurant.cuisine}</span>
              <span>•</span>
              <span>⏱️ {restaurant.deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menú */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Menú</h2>

            {Object.keys(groupedMenu).length === 0 ? (
              <p className="text-gray-500">No hay items disponibles</p>
            ) : (
              Object.keys(groupedMenu).map((category) => (
                <div key={category} className="mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {groupedMenu[category].map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden flex"
                      >
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-orange-500">
                              ${item.price}
                            </span>
                            {getCartItemQuantity(item._id) > 0 ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => removeFromCart(item._id)}
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full"
                                >
                                  -
                                </button>
                                <span className="font-semibold">
                                  {getCartItemQuantity(item._id)}
                                </span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 rounded-full"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                              >
                                Agregar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Carrito (sticky) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tu Pedido
              </h3>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Tu carrito está vacío
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center border-b pb-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
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

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-orange-500">${getTotal()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Proceder al Pago
                  </button>

                  <button
                    onClick={() => setCart([])}
                    className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
                  >
                    Vaciar Carrito
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}