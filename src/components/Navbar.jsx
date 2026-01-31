// src/components/Navbar.jsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-orange-500">
              🍔 FoodApp
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                {/* Campana de notificaciones */}
                <NotificationBell />
                
                <span className="text-gray-700">
                  Hola, {session.user.name}
                </span>
                {session.user.role === 'customer' && (
                  <Link
                    href="/orders"
                    className="text-gray-700 hover:text-orange-500"
                  >
                    Mis Pedidos
                  </Link>
                )}
                {session.user.role === 'restaurant' && (
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-orange-500"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-orange-500"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}