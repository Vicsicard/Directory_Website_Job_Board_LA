import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  keyword: string;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ keyword, placeholder, className = '' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  
  const debouncedSearch = useDebounce((searchQuery: string, searchLocation: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    
    if (searchLocation) {
      params.set('location', searchLocation);
    } else {
      params.delete('location');
    }
    
    router.push(`?${params.toString()}`);
  }, 300);

  const handleSearch = useCallback((searchQuery: string, searchLocation: string) => {
    setQuery(searchQuery);
    setLocation(searchLocation);
    debouncedSearch(searchQuery, searchLocation);
  }, [debouncedSearch]);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value, location)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={placeholder || `Search ${keyword} services...`}
          />
        </div>

        {/* Location Input */}
        <div className="relative flex-grow md:flex-grow-0 md:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => handleSearch(query, e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter location..."
          />
        </div>
      </div>

      {/* Search Suggestions - can be implemented later */}
      {/* <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md">
        {suggestions.map((suggestion) => (
          // Render suggestions
        ))}
      </div> */}
    </div>
  );
}
