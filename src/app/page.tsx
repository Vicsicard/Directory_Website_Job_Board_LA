import SearchBox from '@/components/search/SearchBox';
import { getKeywords, getLocations, generateSlug } from '@/utils/csvParser';
import Link from 'next/link';

export default async function Home() {
  const keywords = await getKeywords();
  const locations = await getLocations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Local Services in Your Area
          </h1>
          <p className="text-xl text-gray-600">
            Search through our curated list of local service providers
          </p>
        </div>

        <SearchBox />

        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Popular Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keywords.slice(0, 6).map((keyword) => {
              const slug = generateSlug(keyword.keyword);
              return (
                <Link
                  key={keyword.keyword}
                  href={`/browse/${slug}`}
                  className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {keyword.keyword}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Popular Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.slice(0, 6).map((location) => {
              const slug = generateSlug(`${location.location}-${location.state}`);
              return (
                <Link
                  key={`${location.location}-${location.state}`}
                  href={`/search?location=${slug}`}
                  className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {location.location}, {location.state}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Population: {location.population?.toLocaleString() ?? 'N/A'}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
