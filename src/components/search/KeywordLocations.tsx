'use client';

import Link from 'next/link';
import { generateSlug } from '@/utils/csvParser';
import { Location } from '@/types/Location';

interface KeywordLocationsProps {
  keyword: string;
  locations: Location[];
}

export default function KeywordLocations({ keyword, locations }: KeywordLocationsProps) {
  const keywordSlug = generateSlug(keyword);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations.map((location) => {
        const locationSlug = generateSlug(location.location);
        return (
          <Link
            key={location.location}
            href={`/${keywordSlug}/${locationSlug}`}
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="text-lg font-medium text-gray-900">
              {location.location}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Find {keyword} services in {location.location}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
