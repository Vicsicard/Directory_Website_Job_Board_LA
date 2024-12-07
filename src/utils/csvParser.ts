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
  if (!fileName) throw new Error('Filename is required');
  const dataPath = path.join(process.cwd(), 'data', fileName);
  return dataPath;
}

// Parse CSV with better error handling
async function parseCSV<T>(filePath: string, schema: z.Schema<T>): Promise<T[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    if (!fileContent.trim()) {
      console.warn(`Empty file: ${filePath}`);
      return [];
    }

    return new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, output) => {
        if (err) {
          console.error(`Error parsing CSV: ${filePath}`, err);
          reject(err);
          return;
        }
        
        try {
          const validatedData = output.map(row => schema.parse(row));
          resolve(validatedData);
        } catch (validationError) {
          console.error(`Validation error in CSV: ${filePath}`, validationError);
          reject(validationError);
        }
      });
    });
  } catch (error) {
    console.error(`Error reading/parsing CSV: ${filePath}`, error);
    return [];
  }
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
  try {
    return await getCachedCSVData('keywords.csv', keywordSchema, forceRefresh);
  } catch (error) {
    console.error('Error getting keywords:', error);
    return [];
  }
}

export async function getLocations(forceRefresh = false): Promise<Location[]> {
  try {
    return await getCachedCSVData('locations.csv', locationSchema, forceRefresh);
  } catch (error) {
    console.error('Error getting locations:', error);
    return [];
  }
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
