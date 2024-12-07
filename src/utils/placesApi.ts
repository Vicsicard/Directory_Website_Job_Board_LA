import { Location } from './csvParser';

export interface Place {
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
}

// Mock data for development
const MOCK_PLACES: Place[] = [
  {
    name: "Sample Business 1",
    address: "123 Main St",
    rating: 4.5,
    reviewCount: 42,
    phone: "(555) 123-4567",
    website: "https://example.com",
  },
  {
    name: "Sample Business 2",
    address: "456 Oak Ave",
    rating: 4.2,
    reviewCount: 28,
    phone: "(555) 234-5678",
    website: "https://example.com",
  },
  {
    name: "Sample Business 3",
    address: "789 Pine St",
    rating: 4.8,
    reviewCount: 56,
    phone: "(555) 345-6789",
    website: "https://example.com",
  },
];

export async function getPlaces(keyword: string, location: Location): Promise<Place[]> {
  // In a real implementation, this would fetch from an API
  // For now, return mock data with location coordinates
  return MOCK_PLACES.map(place => ({
    ...place,
    latitude: location.latitude,
    longitude: location.longitude
  }));
}

// For backward compatibility
export async function getPlacesByKeyword(keyword: string): Promise<Place[]> {
  // In development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return MOCK_PLACES;
  }

  // In production, implement actual Places API call
  // This is where you'd make the actual API call to Google Places
  throw new Error('Production Places API not yet implemented');
}

export const transformPlaceResults = (places: Place[]): Place[] => places;
