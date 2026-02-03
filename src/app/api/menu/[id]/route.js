// src/app/api/menu/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import Restaurant from '@/models/Restaurant';

// GET - Obtener un item específico
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Next.js 15+: params es una Promise que debe ser unwrapped
    const { id } = await params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error obteniendo item:', error);
    return NextResponse.json(
      { error: 'Error al obtener item' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar item del menú
export async function PUT(request, { params }) {
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

    // Next.js 15+: params es una Promise que debe ser unwrapped
    const { id } = await params;

    // Obtener el item actual
    const currentItem = await MenuItem.findById(id);

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el restaurante pertenece al usuario autenticado
    const restaurant = await Restaurant.findById(currentItem.restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    if (restaurant.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar este item' },
        { status: 403 }
      );
    }

    // Actualizar el item
    const data = await request.json();
    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error actualizando item:', error);
    return NextResponse.json(
      { error: 'Error al actualizar item' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar item del menú
export async function DELETE(request, { params }) {
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

    // Next.js 15+: params es una Promise que debe ser unwrapped
    const { id } = await params;

    // Obtener el item actual
    const currentItem = await MenuItem.findById(id);

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el restaurante pertenece al usuario autenticado
    const restaurant = await Restaurant.findById(currentItem.restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    if (restaurant.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este item' },
        { status: 403 }
      );
    }

    // Eliminar el item
    await MenuItem.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando item:', error);
    return NextResponse.json(
      { error: 'Error al eliminar item' },
      { status: 500 }
    );
  }
} 