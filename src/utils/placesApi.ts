import { getCachedPlaces, cachePlaces, PaginationParams } from './mongodb';
import { ApiError, handleApiError } from './errorUtils';
import { 
  withRetry, 
  withFallback, 
  withCircuitBreaker, 
  withTimeout,
  ErrorBoundary 
} from './errorRecovery';
import { transformPlaceData, enrichPlaceData } from './dataTransform';
import { PlacesApiResponse, Location } from '@/types/places';

const PLACES_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

async function fetchFromPlacesApi(
  query: string, 
  pageToken?: string,
  userLocation?: Location
): Promise<PlacesApiResponse> {
  return withRetry(
    async () => {
      const url = new URL(PLACES_API_ENDPOINT);
      url.searchParams.append('query', query);
      url.searchParams.append('key', API_KEY!);
      url.searchParams.append('type', 'business');
      
      if (pageToken) {
        url.searchParams.append('pagetoken', pageToken);
      }

      if (userLocation) {
        url.searchParams.append('location', `${userLocation.lat},${userLocation.lng}`);
        url.searchParams.append('radius', '50000'); // 50km radius
      }

      const response = await withTimeout(
        () => fetch(url.toString()),
        10000 // 10 second timeout
      );

      if (!response.ok) {
        throw new ApiError(
          'Failed to fetch from Places API',
          response.status,
          'PLACES_API_ERROR'
        );
      }

      const data = await response.json();
      
      if (data.status === 'OVER_QUERY_LIMIT') {
        throw new ApiError(
          'API quota exceeded',
          429,
          'PLACES_API_QUOTA_ERROR'
        );
      }

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new ApiError(
          `Places API error: ${data.status}`,
          500,
          'PLACES_API_STATUS_ERROR'
        );
      }

      // Transform and enrich each place in the results
      const transformedResults = data.results.map(place => {
        const transformedPlace = transformPlaceData(place);
        return enrichPlaceData(transformedPlace, userLocation);
      });

      return {
        ...data,
        results: transformedResults
      };
    },
    {
      maxRetries: 3,
      baseDelay: 2000,
      exponential: true,
      shouldRetry: (error) => {
        if (error instanceof ApiError) {
          return ['PLACES_API_QUOTA_ERROR', 'PLACES_API_NETWORK_ERROR'].includes(error.code);
        }
        return false;
      }
    }
  );
}

async function fetchAllPages(query: string, userLocation?: Location): Promise<any[]> {
  let allResults: any[] = [];
  let nextPageToken: string | undefined;

  do {
    // Add delay before fetching next page (Google Places API requirement)
    if (nextPageToken) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const data = await fetchFromPlacesApi(query, nextPageToken, userLocation);
    allResults = [...allResults, ...data.results];
    nextPageToken = data.next_page_token;
  } while (nextPageToken);

  return allResults;
}

export async function getPlaces(
  keyword: string,
  location: string,
  paginationParams: PaginationParams,
  userLocation?: Location
) {
  const query = `${keyword} in ${location}`;
  
  return withCircuitBreaker(
    async () => {
      return await ErrorBoundary.wrap(
        async () => {
          try {
            // Try cache first
            const cachedResults = await getCachedPlaces(query, paginationParams);
            if (cachedResults) {
              // Enrich cached results with user-specific data
              const enrichedResults = cachedResults.items.map(place => 
                enrichPlaceData(place, userLocation)
              );
              
              return {
                ...cachedResults,
                items: enrichedResults
              };
            }

            console.log(`Fetching fresh data for: ${query}`);
            
            // Fetch all pages with fallback
            const results = await withFallback(
              async () => await fetchAllPages(query, userLocation),
              {
                fallbackFn: async () => {
                  // If full fetch fails, try getting just the first page
                  const firstPage = await fetchFromPlacesApi(query, undefined, userLocation);
                  return firstPage.results;
                },
                onFallback: (error) => {
                  console.warn('Failed to fetch all pages, falling back to first page only:', error);
                }
              }
            );

            // Cache results
            await withRetry(
              async () => await cachePlaces(query, {
                results,
                status: 'OK',
              }),
              {
                maxRetries: 2,
                baseDelay: 1000
              }
            );

            // Return paginated results
            const { page = 1, limit = 10 } = paginationParams;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            return {
              items: results.slice(startIndex, endIndex),
              total_pages: Math.ceil(results.length / limit),
              current_page: page,
              total_items: results.length
            };

          } catch (error) {
            return handleApiError(error);
          }
        },
        'places-api-fetch',
        async () => {
          // Last resort fallback: return empty results with error status
          return {
            items: [],
            total_pages: 0,
            current_page: paginationParams.page || 1,
            total_items: 0,
            error: 'Service temporarily unavailable'
          };
        }
      );
    },
    5, // threshold
    60000 // reset timeout
  );
}
