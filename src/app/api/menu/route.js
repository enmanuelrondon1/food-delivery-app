// src/app/api/menu/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

// GET - Obtener items del menú por restaurante
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

    const menuItems = await MenuItem.find({ 
      restaurantId, 
      available: true 
    }).sort({ category: 1, name: 1 });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error obteniendo menú:', error);
    return NextResponse.json(
      { error: 'Error al obtener menú' },
      { status: 500 }
    );
  }
}

// POST - Crear item de menú
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    const menuItem = await MenuItem.create(data);

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creando item:', error);
    return NextResponse.json(
      { error: 'Error al crear item' },
      { status: 500 }
    );
  }
}