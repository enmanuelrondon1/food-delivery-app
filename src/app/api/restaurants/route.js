// src/app/api/restaurants/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

// GET - Obtener todos los restaurantes
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const all = searchParams.get("all");

    // Si "all=true", devolver todos sin filtrar por distancia
    if (all === 'true') {
      const allRestaurants = await Restaurant.find({ isOpen: true })
        .sort({ rating: -1 })
        .limit(50);
      return NextResponse.json(allRestaurants);
    }

    let restaurants = await Restaurant.find({ isOpen: true })
      .sort({ rating: -1 })
      .limit(20);

    // Si hay coordenadas, calcular distancia
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      restaurants = restaurants.map((restaurant) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          restaurant.location.lat,
          restaurant.location.lng,
        );
        return {
          ...restaurant.toObject(),
          distance: distance.toFixed(2),
        };
      });

      // Ordenar por distancia
      restaurants.sort((a, b) => a.distance - b.distance);
    }

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Error obteniendo restaurantes:", error);
    return NextResponse.json(
      { error: "Error al obtener restaurantes" },
      { status: 500 },
    );
  }
}
// POST - Crear restaurante (solo para usuarios tipo restaurant)
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    const restaurant = await Restaurant.create(data);

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("Error creando restaurante:", error);
    return NextResponse.json(
      { error: "Error al crear restaurante" },
      { status: 500 },
    );
  }
}

// Función para calcular distancia entre dos puntos (fórmula de Haversine simplificada)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
