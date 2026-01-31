// src/app/api/orders/restaurant/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Obtener todos los pedidos (para dashboard de restaurante)
export async function GET(request) {
  try {
    await dbConnect();

    // Por ahora traemos todos los pedidos
    // En producción filtrarías por restaurantId del usuario autenticado
    const orders = await Order.find({})
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 })
      .limit(50); // Últimos 50 pedidos

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}``