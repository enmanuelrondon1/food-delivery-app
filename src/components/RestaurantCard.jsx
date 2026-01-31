// src/components/RestaurantCard.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant._id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {restaurant.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {restaurant.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-500 font-semibold">
              {restaurant.cuisine}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐ {restaurant.rating}</span>
              {restaurant.distance && (
                <span className="text-gray-500">
                  • {restaurant.distance} km
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            ⏱️ {restaurant.deliveryTime}
          </div>
        </div>
      </div>
    </Link>
  );
}