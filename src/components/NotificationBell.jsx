// src/components/NotificationBell.jsx
'use client';

import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      markAsRead();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-orange-500 transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-orange-500 hover:text-orange-600"
              >
                Limpiar todo
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tienes notificaciones
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="p-4 border-b hover:bg-gray-50 transition"
                >
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    {notification.title}
                  </p>
                  <p className="text-gray-600 text-xs">{notification.message}</p>
                  {notification.timestamp && (
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}