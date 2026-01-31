// src/app/api/notifications/check/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const lastCheck = searchParams.get('lastCheck');

    if (!userId || !role) {
      return NextResponse.json({ notifications: [] });
    }

    const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 60000);
    const notifications = [];

    if (role === 'restaurant') {
      // Buscar nuevos pedidos pendientes
      const newOrders = await Order.find({
        status: 'pending',
        createdAt: { $gte: lastCheckDate },
      }).sort({ createdAt: -1 });

      notifications.push(
        ...newOrders.map((order) => ({
          type: 'new_order',
          title: '🔔 Nuevo pedido',
          message: `Pedido #${order._id.toString().slice(-8)} - $${order.total.toFixed(2)}`,
          orderId: order._id,
          timestamp: order.createdAt,
        }))
      );
    } else if (role === 'customer') {
      // Buscar actualizaciones en los pedidos del cliente
      const updatedOrders = await Order.find({
        customerId: userId,
        updatedAt: { $gte: lastCheckDate },
        createdAt: { $lt: lastCheckDate }, // Solo actualizaciones, no creaciones
      }).sort({ updatedAt: -1 });

      const statusMessages = {
        preparing: '👨‍🍳 Tu pedido está siendo preparado',
        ready: '✅ ¡Tu pedido está listo!',
        delivered: '🎉 Pedido entregado. ¡Buen provecho!',
        cancelled: '❌ Tu pedido ha sido cancelado',
      };

      notifications.push(
        ...updatedOrders.map((order) => ({
          type: 'order_status',
          title: 'Actualización de pedido',
          message: `Pedido #${order._id.toString().slice(-8)}: ${statusMessages[order.status] || order.status}`,
          orderId: order._id,
          status: order.status,
          timestamp: order.updatedAt,
        }))
      );
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return NextResponse.json({ notifications: [] });
  }
}