import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SearchFiltersProps {
  currentFilters: {
    rating?: number;
    priceLevel?: number;
    openNow?: boolean;
    sortBy?: string;
  };
  totalResults: number;
}

export default function SearchFilters({ currentFilters, totalResults }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilters = (key: string, value: string | number | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Filters</h2>
        <p className="text-sm text-gray-600">
          {totalResults} results found
        </p>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={currentFilters.sortBy || 'relevance'}
          onChange={(e) => updateFilters('sort', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="relevance">Most Relevant</option>
          <option value="rating">Highest Rated</option>
          <option value="reviews">Most Reviewed</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Rating
        </label>
        <select
          value={currentFilters.rating || ''}
          onChange={(e) => updateFilters('rating', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>

      {/* Price Level Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <select
          value={currentFilters.priceLevel || ''}
          onChange={(e) => updateFilters('price', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Any Price</option>
          <option value="1">$</option>
          <option value="2">$$</option>
          <option value="3">$$$</option>
          <option value="4">$$$$</option>
        </select>
      </div>

      {/* Open Now Filter */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={currentFilters.openNow || false}
            onChange={(e) => updateFilters('openNow', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Open Now</span>
        </label>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => router.push(pathname)}
        className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Reset Filters
      </button>
    </div>
  );
}
