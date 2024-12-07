import { PlaceResult } from '@/types/places';

interface PlacesListProps {
  places: PlaceResult[];
  isLoading?: boolean;
  error?: string;
}

export default function PlacesList({ places, isLoading, error }: PlacesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="text-gray-600 p-4 bg-gray-50 rounded-lg">
        No results found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {places.map((place) => (
        <div key={place.place_id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
          
          <div className="text-gray-600 mb-3">
            {place.formatted_address}
          </div>
          
          {place.rating && (
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(place.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {place.rating} ({place.user_ratings_total} reviews)
              </span>
            </div>
          )}
          
          {place.opening_hours?.weekday_text && (
            <div className="text-sm text-gray-600 mb-2">
              <strong>Hours:</strong>
              <ul className="mt-1">
                {place.opening_hours.weekday_text.map((day) => (
                  <li key={day}>{day}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {place.formatted_phone_number && (
              <a
                href={`tel:${place.formatted_phone_number}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                📞 {place.formatted_phone_number}
              </a>
            )}
            
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 hover:bg-green-100"
              >
                🌐 Website
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
