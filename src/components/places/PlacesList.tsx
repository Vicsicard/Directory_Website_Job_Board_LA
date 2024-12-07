'use client';

import { Place } from '@/utils/placesApi';
import { StarIcon } from '@heroicons/react/24/solid';

interface PlacesListProps {
  places: Place[];
}

export default function PlacesList({ places }: PlacesListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {places.map((place, index) => (
        <div
          key={`${place.name}-${index}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {place.name}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {place.address}
            </p>
            
            {place.rating && (
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(place.rating!)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {place.rating} ({place.reviewCount} reviews)
                </span>
              </div>
            )}
            
            {place.phone && (
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Phone:</span> {place.phone}
              </p>
            )}
            
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
