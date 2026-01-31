// src/app/api/orders/by-session/[sessionId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { sessionId } = params;
    
    // Buscar orden por stripeSessionId
    const order = await Order.findOne({ stripeSessionId: sessionId });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error buscando orden:', error);
    return NextResponse.json(
      { error: 'Error al buscar la orden' },
      { status: 500 }
    );
  }
}