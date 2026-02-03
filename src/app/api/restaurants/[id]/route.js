// src/app/api/restaurants/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';

// GET - Obtener un restaurante específico
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ Await params primero
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

// PUT - Actualizar restaurante
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ Await params primero
    const { id } = await params;
    
    const data = await request.json();

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error actualizando restaurante:', error);
    return NextResponse.json(
      { error: 'Error al actualizar restaurante' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar restaurante
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ Await params primero
    const { id } = await params;
    
    const restaurant = await Restaurant.findByIdAndDelete(id);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Restaurante eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando restaurante:', error);
    return NextResponse.json(
      { error: 'Error al eliminar restaurante' },
      { status: 500 }
    );
  }
}