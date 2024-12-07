import { PlaceResult } from '@/types/places';
import Image from 'next/image';
import { StarIcon, MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/solid';

interface BusinessListProps {
  businesses: PlaceResult[];
  showMap?: boolean;
}

export default function BusinessList({ businesses, showMap = true }: BusinessListProps) {
  return (
    <div className="space-y-6">
      {businesses.map((business) => (
        <div
          key={business.placeId}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              {/* Business Image */}
              {business.photos && business.photos[0] && (
                <div className="w-full md:w-48 h-48 relative mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                  <Image
                    src={business.photos[0].url}
                    alt={business.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Business Information */}
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {business.name}
                    </h2>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(business.rating || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {business.rating} ({business.userRatingsTotal} reviews)
                      </span>
                    </div>
                  </div>
                  
                  {/* Price Level */}
                  {business.priceLevel && (
                    <span className="text-green-600 font-medium">
                      {'$'.repeat(business.priceLevel)}
                    </span>
                  )}
                </div>

                {/* Address and Contact */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{business.formattedAddress}</span>
                  </div>
                  
                  {business.formattedPhoneNumber && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-5 w-5 mr-2" />
                      <span>{business.formattedPhoneNumber}</span>
                    </div>
                  )}
                  
                  {business.openNow !== undefined && (
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span className={business.openNow ? 'text-green-600' : 'text-red-600'}>
                        {business.openNow ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features and Services */}
                {business.features && business.features.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {business.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {business.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                          +{business.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {businesses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No businesses found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
}
