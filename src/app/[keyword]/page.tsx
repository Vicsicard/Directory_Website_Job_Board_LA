import { Metadata } from 'next';
import { getPlacesByKeyword } from '@/utils/placesApi';
import { transformPlaceResults } from '@/utils/dataTransform';
import BusinessList from '@/components/BusinessList';
import SearchFilters from '@/components/SearchFilters';
import { SearchStats } from '@/components/SearchStats';

type Props = {
  params: { keyword: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedKeyword = decodeURIComponent(params.keyword);
  return {
    title: `${decodedKeyword} Services Near You | Local Services Directory`,
    description: `Find top-rated ${decodedKeyword} services in your area. Compare prices, read reviews, and find the best local service providers.`,
  };
}

export default async function KeywordPage({ params, searchParams }: Props) {
  const decodedKeyword = decodeURIComponent(params.keyword);
  
  // Parse search parameters
  const filters = {
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    priceLevel: searchParams.price ? Number(searchParams.price) : undefined,
    openNow: searchParams.openNow === 'true',
    sortBy: searchParams.sort as string || 'relevance',
  };

  try {
    // Fetch and transform places data
    const placesData = await getPlacesByKeyword(decodedKeyword);
    const transformedResults = await transformPlaceResults(placesData);

    // Apply filters
    const filteredResults = transformedResults.filter(place => {
      if (filters.rating && place.rating < filters.rating) return false;
      if (filters.priceLevel && place.priceLevel > filters.priceLevel) return false;
      if (filters.openNow && !place.openNow) return false;
      return true;
    });

    // Sort results
    const sortedResults = [...filteredResults].sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0);
        case 'price-asc':
          return (a.priceLevel || 0) - (b.priceLevel || 0);
        case 'price-desc':
          return (b.priceLevel || 0) - (a.priceLevel || 0);
        default:
          return 0;
      }
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {decodedKeyword} Services Near You
            </h1>
            <p className="text-gray-600">
              Find and compare top-rated {decodedKeyword.toLowerCase()} services in your area
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Section */}
            <div className="lg:col-span-1">
              <SearchFilters
                currentFilters={filters}
                totalResults={sortedResults.length}
              />
            </div>

            {/* Results Section */}
            <div className="lg:col-span-3">
              <SearchStats
                total={sortedResults.length}
                keyword={decodedKeyword}
                filters={filters}
              />
              
              <BusinessList
                businesses={sortedResults}
                showMap={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching places:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to load results
          </h1>
          <p className="text-gray-600">
            We encountered an error while fetching results. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
