import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { CSVError, withErrorHandling } from './errorHandling';
import { z } from 'zod';

// Validation schemas
const keywordSchema = z.object({
  keyword: z.string().min(1, 'Keyword cannot be empty'),
  category: z.string().min(1, 'Category cannot be empty'),
  priority: z.number().int().min(0),
});

const locationSchema = z.object({
  city: z.string().min(1, 'City cannot be empty'),
  state: z.string().length(2, 'State must be a 2-letter code'),
  latitude: z.number(),
  longitude: z.number(),
  population: z.number().int().min(0),
});

export type Keyword = z.infer<typeof keywordSchema>;
export type Location = z.infer<typeof locationSchema>;

// Helper function to resolve paths relative to project root
function resolveDataPath(fileName: string): string {
  const dataPath = path.join(process.cwd(), 'data', fileName);
  if (!dataPath) {
    throw new Error(`Invalid data path for file: ${fileName}`);
  }
  return dataPath;
}

async function parseCSV<T>(filePath: string, schema: z.Schema<T>): Promise<T[]> {
  if (!filePath) {
    throw new Error('File path is required for CSV parsing');
  }

  return withErrorHandling(async () => {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      }, (error, records) => {
        if (error) {
          reject(new CSVError(`Failed to parse CSV file: ${error.message}`));
          return;
        }

        try {
          const validatedRecords = records.map(record => schema.parse(record));
          resolve(validatedRecords);
        } catch (validationError) {
          reject(new CSVError(`CSV validation failed: ${validationError.message}`));
        }
      });
    });
  });
}

const csvCache = new Map<string, { data: any[]; timestamp: number }>();
const CSV_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedCSVData<T>(
  fileName: string,
  schema: z.Schema<T>,
  forceRefresh = false
): Promise<T[]> {
  const cacheKey = fileName;
  const now = Date.now();
  const cached = csvCache.get(cacheKey);

  if (!forceRefresh && cached && now - cached.timestamp < CSV_CACHE_TTL) {
    return cached.data as T[];
  }

  try {
    const filePath = resolveDataPath(fileName);
    const data = await parseCSV(filePath, schema);
    csvCache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error(`Error loading CSV data from ${fileName}:`, error);
    if (cached) {
      console.log('Using cached data as fallback');
      return cached.data as T[];
    }
    throw error;
  }
}

export async function getKeywords(forceRefresh = false): Promise<Keyword[]> {
  return getCachedCSVData('keywords.csv', keywordSchema, forceRefresh);
}

export async function getLocations(forceRefresh = false): Promise<Location[]> {
  return getCachedCSVData('locations.csv', locationSchema, forceRefresh);
}

export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function validateKeywordExists(keyword: string): Promise<boolean> {
  const keywords = await getKeywords();
  return keywords.some(k => generateSlug(k.keyword) === keyword);
}

export async function validateLocationExists(location: string): Promise<boolean> {
  const locations = await getLocations();
  return locations.some(l => generateSlug(`${l.city}-${l.state}`) === location);
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
          location: generateSlug(`${location.city}-${location.state}`)
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
