import { MongoClient, Collection, Document } from 'mongodb';
import { CachedPlacesData } from '@/types/places';

const MONGODB_URI = process.env.MONGODB_URI;
const CACHE_COLLECTION = 'places_cache';
const CACHE_DURATION_MS = 180 * 24 * 60 * 60 * 1000; // 180 days in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

async function connectToDatabase(retryCount = 0): Promise<{ client: MongoClient; db: any }> {
  try {
    if (cachedClient && cachedDb) {
      return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(MONGODB_URI!);
    const db = client.db('directory_db');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`MongoDB connection attempt ${retryCount + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectToDatabase(retryCount + 1);
    }
    throw error;
  }
}

export async function getCacheCollection(): Promise<Collection<CachedPlacesData>> {
  const { db } = await connectToDatabase();
  return db.collection(CACHE_COLLECTION);
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total_pages: number;
  current_page: number;
  total_items: number;
}

export async function getCachedPlaces(
  query: string,
  paginationParams: PaginationParams
): Promise<PaginatedResponse<Document> | null> {
  const collection = await getCacheCollection();
  
  try {
    const cachedData = await collection.findOne({ 
      query,
      expiresAt: { $gt: new Date() }
    });

    if (!cachedData) {
      return null;
    }

    const { page = 1, limit = 10 } = paginationParams;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      items: cachedData.results.slice(startIndex, endIndex),
      total_pages: Math.ceil(cachedData.results.length / limit),
      current_page: page,
      total_items: cachedData.results.length
    };
  } catch (error) {
    console.error('Error retrieving cached places:', error);
    return null;
  }
}

export async function cachePlaces(query: string, data: any): Promise<void> {
  const collection = await getCacheCollection();
  
  try {
    const expiresAt = new Date(Date.now() + CACHE_DURATION_MS);
    
    await collection.updateOne(
      { query },
      { 
        $set: {
          query,
          results: data.results,
          expiresAt,
          lastUpdated: new Date(),
          metadata: {
            status: data.status,
            nextPageToken: data.next_page_token || null
          }
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error caching places:', error);
    throw error;
  }
}

export async function clearExpiredCache(): Promise<void> {
  const collection = await getCacheCollection();
  
  try {
    await collection.deleteMany({
      expiresAt: { $lte: new Date() }
    });
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
}

export async function initializeDatabase(): Promise<void> {
  const collection = await getCacheCollection();
  
  try {
    // Create indexes
    await collection.createIndex({ query: 1 }, { unique: true });
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await collection.createIndex({ lastUpdated: 1 });
    
    // Clear expired cache on startup
    await clearExpiredCache();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database when the module is imported
initializeDatabase().catch(console.error);
