// src/app/api/orders/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id).populate('restaurantId', 'name image');

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    return NextResponse.json(
      { error: 'Error al obtener pedido' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar estado del pedido
// PATCH - Actualizar estado del pedido
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { status } = await request.json();

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // 🔔 Enviar notificación al cliente
    const statusMessages = {
      preparing: '👨‍🍳 Tu pedido está siendo preparado',
      ready: '✅ ¡Tu pedido está listo!',
      delivered: '🎉 Pedido entregado. ¡Buen provecho!',
      cancelled: '❌ Tu pedido ha sido cancelado',
    };

    if (statusMessages[status]) {
      sendNotification(order.customerId.toString(), {
        type: 'order_status',
        title: 'Actualización de pedido',
        message: `Pedido #${order._id.toString().slice(-8)}: ${statusMessages[status]}`,
        orderId: order._id,
        status,
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    return NextResponse.json(
      { error: 'Error al actualizar pedido' },
      { status: 500 }
    );
  }
}