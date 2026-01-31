// src/contexts/NotificationContext.jsx
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastCheckRef = useRef(new Date());

  useEffect(() => {
    if (!session?.user?.id) return;

    // Solicitar permiso de notificaciones del navegador
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Polling cada 5 segundos
    const interval = setInterval(() => {
      checkForNotifications();
    }, 5000);

    // Verificar inmediatamente
    checkForNotifications();

    return () => clearInterval(interval);
  }, [session]);

  const checkForNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(
        `/api/notifications/check?userId=${session.user.id}&role=${session.user.role}&lastCheck=${lastCheckRef.current.toISOString()}`
      );
      
      if (!res.ok) return;

      const data = await res.json();
      
      if (data.notifications && data.notifications.length > 0) {
        // Agregar nuevas notificaciones
        setNotifications((prev) => [...data.notifications, ...prev].slice(0, 50));
        setUnreadCount((prev) => prev + data.notifications.length);

        // Mostrar notificación del navegador para cada una
        data.notifications.forEach((notification) => {
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
            });
          }
          
          // Reproducir sonido
          playNotificationSound();
        });

        // Actualizar timestamp de última verificación
        lastCheckRef.current = new Date();
      }
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      // Ignorar error de audio
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}