import { CSVError, withErrorHandling } from './errorHandling';
import { z } from 'zod';

// Mark this module as server-side only
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Validation schemas
const keywordSchema = z.object({
  keyword: z.string().min(1, 'Keyword cannot be empty'),
  category: z.string().optional(),
});

const locationSchema = z.object({
  location: z.string().min(1, 'Location cannot be empty'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  population: z.number().optional(),
});

export interface Keyword {
  keyword: string;
  category: string;
  description?: string;
}

export interface Location {
  location: string;
  state: string;
  latitude?: number;
  longitude?: number;
  population?: number;
}

// Mock data for development
const mockKeywords: Keyword[] = [
  {
    keyword: "Plumber",
    category: "Home Services",
    description: "Professional plumbing services"
  },
  {
    keyword: "Electrician",
    category: "Home Services",
    description: "Licensed electrical contractors"
  },
  {
    keyword: "Restaurant",
    category: "Food & Dining",
    description: "Local dining establishments"
  }
];

const mockLocations: Location[] = [
  {
    location: "New York",
    state: "NY",
    latitude: 40.7128,
    longitude: -74.0060,
    population: 8419000
  },
  {
    location: "Los Angeles",
    state: "CA",
    latitude: 34.0522,
    longitude: -118.2437,
    population: 3980000
  },
  {
    location: "Chicago",
    state: "IL",
    latitude: 41.8781,
    longitude: -87.6298,
    population: 2716000
  }
];

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getKeywords(): Promise<Keyword[]> {
  // In development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return mockKeywords;
  }

  // In production, you would fetch this from an API or database
  return mockKeywords; // For now, return mock data in all environments
}

export async function getLocations(): Promise<Location[]> {
  // In development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return mockLocations;
  }

  // In production, you would fetch this from an API or database
  return mockLocations; // For now, return mock data in all environments
}

export async function validateKeywordExists(keyword: string): Promise<boolean> {
  const keywords = await getKeywords();
  return keywords.some(k => generateSlug(k.keyword) === keyword);
}

export async function validateLocationExists(location: string): Promise<boolean> {
  const locations = await getLocations();
  return locations.some(l => generateSlug(`${l.location}-${l.state}`) === location);
}

export async function generateStaticPaths() {
  try {
    const [keywords, locations] = await Promise.all([
      getKeywords(),
      getLocations()
    ]);

    return keywords.flatMap(keyword => 
      locations.map(location => ({
        params: {
          keyword: generateSlug(keyword.keyword),
          location: generateSlug(`${location.location}-${location.state}`)
        }
      }))
    );
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

export function formatLocationDisplay(city: string, state: string): string {
  return `${city}, ${state}`;
}

export function generatePageTitle(keyword: string, city: string, state: string): string {
  return `${keyword} in ${city}, ${state} | Local Services Directory`;
}

export function generateMetaDescription(keyword: string, city: string, state: string): string {
  return `Find and compare the best ${keyword} services in ${city}, ${state}. Read reviews, check ratings, and contact local providers.`;
}
