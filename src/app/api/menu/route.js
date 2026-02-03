// src/app/api/menu/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import Restaurant from '@/models/Restaurant';

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

    // Obtener sesión para determinar si es el dueño del restaurante
    const session = await getServerSession(authOptions);
    
    let query = { restaurantId };

    // Si NO es el dueño del restaurante, solo mostrar items disponibles
    if (!session || session.user.role !== 'restaurant') {
      query.available = true;
    } else {
      // Si ES el dueño, verificar que sea SU restaurante
      const restaurant = await Restaurant.findById(restaurantId);
      
      // Si no es su restaurante, solo mostrar items disponibles
      if (!restaurant || restaurant.ownerId.toString() !== session.user.id) {
        query.available = true;
      }
      // Si es su restaurante, mostrar TODOS los items (disponibles y no disponibles)
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

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
    // Verificar autenticación y rol
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'restaurant') {
      return NextResponse.json(
        { error: 'No autorizado. Debes ser dueño de un restaurante.' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();

    // Verificar que el restaurante pertenece al usuario autenticado
    const restaurant = await Restaurant.findById(data.restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    if (restaurant.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para agregar items a este restaurante' },
        { status: 403 }
      );
    }

    // Crear el item del menú
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