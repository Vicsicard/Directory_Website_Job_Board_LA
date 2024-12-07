interface SearchStatsProps {
  total: number;
  keyword: string;
  filters: {
    rating?: number;
    priceLevel?: number;
    openNow?: boolean;
    sortBy?: string;
  };
}

export function SearchStats({ total, keyword, filters }: SearchStatsProps) {
  const getFilterDescription = () => {
    const filterParts = [];
    
    if (filters.rating) {
      filterParts.push(`rated ${filters.rating}+ stars`);
    }
    
    if (filters.priceLevel) {
      filterParts.push(`priced ${Array(filters.priceLevel).fill('$').join('')}`);
    }
    
    if (filters.openNow) {
      filterParts.push('open now');
    }
    
    if (filterParts.length === 0) {
      return '';
    }
    
    return ` (${filterParts.join(', ')})`;
  };

  const getSortDescription = () => {
    switch (filters.sortBy) {
      case 'rating':
        return 'sorted by highest rating';
      case 'reviews':
        return 'sorted by most reviewed';
      case 'price-asc':
        return 'sorted by lowest price';
      case 'price-desc':
        return 'sorted by highest price';
      default:
        return 'sorted by relevance';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <p className="text-gray-600">
        Found <span className="font-semibold">{total}</span> {keyword.toLowerCase()} services
        {getFilterDescription()}, {getSortDescription()}.
      </p>
    </div>
  );
}
