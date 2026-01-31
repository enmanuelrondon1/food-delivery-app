// src/app/api/reviews/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';

// POST - Crear nueva calificación
export async function POST(request) {
  try {
    await dbConnect();
    const { orderId, customerId, restaurantId, rating, comment } = await request.json();

    // Verificar que el pedido existe y fue entregado
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Solo puedes calificar pedidos entregados' },
        { status: 400 }
      );
    }

    // Verificar que no haya calificado antes
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya has calificado este pedido' },
        { status: 400 }
      );
    }

    // Crear review
    const review = await Review.create({
      orderId,
      customerId,
      restaurantId,
      rating,
      comment,
    });

    // Actualizar orden
    await Order.findByIdAndUpdate(orderId, {
      rating,
      review: comment,
      ratedAt: new Date(),
    });

    // Actualizar rating promedio del restaurante
    const reviews = await Review.find({ restaurantId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(avgRating * 10) / 10, // Redondear a 1 decimal
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creando review:', error);
    return NextResponse.json(
      { error: 'Error al crear review' },
      { status: 500 }
    );
  }
}

// GET - Obtener reviews de un restaurante
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId es requerido' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ restaurantId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error obteniendo reviews:', error);
    return NextResponse.json(
      { error: 'Error al obtener reviews' },
      { status: 500 }
    );
  }
}