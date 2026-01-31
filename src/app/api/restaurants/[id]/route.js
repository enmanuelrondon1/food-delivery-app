// src/app/api/restaurants/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error obteniendo restaurante:', error);
    return NextResponse.json(
      { error: 'Error al obtener restaurante' },
      { status: 500 }
    );
  }
}