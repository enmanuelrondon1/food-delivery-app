// src/app/api/restaurants/my-restaurant/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';

// GET - Obtener el restaurante del usuario logueado
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'restaurant') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ ownerId: session.user.id });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'No se encontró restaurante' },
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