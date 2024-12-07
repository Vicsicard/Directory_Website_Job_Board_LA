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
  return path.join(process.cwd(), 'src', 'data', fileName);
}

async function parseCSV<T>(filePath: string, schema: z.Schema<T>): Promise<T[]> {
  return withErrorHandling(async () => {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
        cast_date: true,
        trim: true,
      }, async (error, records) => {
        if (error) {
          reject(new CSVError(`Failed to parse CSV file: ${error.message}`));
          return;
        }

        try {
          // Parse and validate each record
          const validatedRecords = await Promise.all(
            records.map(async (record) => {
              try {
                return schema.parse(record);
              } catch (err) {
                throw new CSVError(`Invalid record in CSV: ${err.message}`);
              }
            })
          );
          resolve(validatedRecords);
        } catch (err) {
          reject(err);
        }
      });
    });
  }, `Failed to parse CSV file at ${filePath}`);
}

const csvCache = new Map<string, { data: any[]; timestamp: number }>();
const CSV_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedCSVData<T>(
  fileName: string,
  schema: z.Schema<T>,
  forceRefresh = false
): Promise<T[]> {
  const filePath = resolveDataPath(fileName);
  const cacheKey = filePath;
  const now = Date.now();
  const cached = csvCache.get(cacheKey);

  if (
    !forceRefresh &&
    cached &&
    now - cached.timestamp < CSV_CACHE_TTL
  ) {
    return cached.data;
  }

  try {
    const data = await parseCSV(filePath, schema);
    csvCache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (error) {
    // If there's an error and we have cached data, return it as fallback
    if (cached) {
      console.warn(`Failed to refresh CSV data, using cached data: ${error.message}`);
      return cached.data;
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
  const keywords = await getKeywords();
  const locations = await getLocations();
  
  const paths = [];
  
  for (const keyword of keywords) {
    for (const location of locations) {
      paths.push({
        params: {
          keyword: generateSlug(keyword.keyword),
          location: generateSlug(`${location.city}-${location.state}`)
        }
      });
    }
  }
  
  return paths;
}

export function formatLocationDisplay(city: string, state: string): string {
  return `${city}, ${state}`;
}

export function generatePageTitle(keyword: string, city: string, state: string): string {
  return `The 10 Best ${keyword} in ${city}, ${state}`;
}

export function generateMetaDescription(keyword: string, city: string, state: string): string {
  return `Find and compare the best ${keyword} in ${city}, ${state}. Read reviews, check ratings, and contact local service providers.`;
}
