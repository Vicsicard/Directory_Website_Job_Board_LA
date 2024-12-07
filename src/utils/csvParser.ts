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
          // Validate each record
          const validatedRecords = await Promise.all(
            records.map(async (record: any, index: number) => {
              try {
                return await schema.parseAsync(record);
              } catch (validationError) {
                throw new CSVError(
                  `Invalid record at line ${index + 2}: ${(validationError as Error).message}`
                );
              }
            })
          );

          resolve(validatedRecords);
        } catch (validationError) {
          reject(validationError);
        }
      });
    });
  }, 'Error parsing CSV file');
}

const csvCache = new Map<string, any[]>();
const CSV_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedCSVData<T>(
  filePath: string,
  schema: z.Schema<T>,
  forceRefresh = false
): Promise<T[]> {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const cacheKey = `${absolutePath}`;

  if (!forceRefresh && csvCache.has(cacheKey)) {
    return csvCache.get(cacheKey) as T[];
  }

  try {
    const data = await parseCSV(absolutePath, schema);
    csvCache.set(cacheKey, data);
    
    // Set cache expiration
    setTimeout(() => {
      csvCache.delete(cacheKey);
    }, CSV_CACHE_TTL);

    return data;
  } catch (error) {
    if (csvCache.has(cacheKey)) {
      console.warn('Error refreshing CSV data, using cached data:', error);
      return csvCache.get(cacheKey) as T[];
    }
    throw error;
  }
}

export async function getKeywords(forceRefresh = false): Promise<Keyword[]> {
  return getCachedCSVData('src/data/keywords.csv', keywordSchema, forceRefresh);
}

export async function getLocations(forceRefresh = false): Promise<Location[]> {
  return getCachedCSVData('src/data/locations.csv', locationSchema, forceRefresh);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
  return `Discover the top-rated ${keyword} in ${city}, ${state}, including contact details and reviews. Find the best local services near you.`;
}
