import { Place } from '@/types/Place';
import { StarIcon, MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/solid';

interface BusinessListProps {
  businesses: Place[];
  showMap?: boolean;
}

export default function BusinessList({ businesses, showMap = false }: BusinessListProps) {
  return (
    <div className="space-y-6">
      {/* Business Cards */}
      <div className="grid grid-cols-1 gap-6">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              {/* Business Name and Rating */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {business.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(business.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {business.rating} ({business.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                {business.priceLevel && (
                  <span className="mt-2 md:mt-0 px-2 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded">
                    {business.priceLevel}
                  </span>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{business.address}</span>
                </div>
                
                {business.phone && (
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    <span>{business.phone}</span>
                  </div>
                )}

                {business.hours && (
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>{business.hours.monday}</span>
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className="mt-4 flex flex-wrap gap-2">
                {business.categories.map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* Website Link */}
              {business.website && (
                <div className="mt-4">
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Map Section */}
      {showMap && businesses.length > 0 && (
        <div className="mt-8 h-96 bg-gray-100 rounded-lg">
          {/* Map component would go here */}
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Map View Coming Soon
          </div>
        </div>
      )}
    </div>
  );
}
