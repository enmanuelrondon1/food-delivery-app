// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Obtener pedidos del usuario
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId es requerido' },
        { status: 400 }
      );
    }

    const orders = await Order.find({ customerId })
      .populate('restaurantId', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pedido
// POST - Crear nuevo pedido
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    const order = await Order.create(data);

    // // 🔔 Enviar notificación a todos los restaurantes
    // notifyAllRestaurants({
    //   type: 'new_order',
    //   title: '🔔 Nuevo pedido',
    //   message: `Pedido #${order._id.toString().slice(-8)} - $${order.total.toFixed(2)}`,
    //   orderId: order._id,
    // });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creando pedido:', error);
    return NextResponse.json(
      { error: 'Error al crear pedido' },
      { status: 500 }
    );
  }
}