import { MongoClient, Db, Collection, Document } from 'mongodb';
import { DatabaseError, withErrorHandling } from './errorHandling';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = 'directory_db';
const CACHE_COLLECTION = 'places_cache';
const CACHE_DURATION_MS = 180 * 24 * 60 * 60 * 1000; // 180 days in milliseconds

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoConnection | null = null;
let connectionPromise: Promise<MongoConnection> | null = null;

async function createConnection(): Promise<MongoConnection> {
  if (!MONGODB_URI) {
    throw new DatabaseError('MongoDB URI is not defined');
  }

  return withErrorHandling(async () => {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    return { client, db };
  }, 'Failed to connect to MongoDB');
}

export async function getMongoConnection(): Promise<MongoConnection> {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!connectionPromise) {
    connectionPromise = createConnection()
      .then((connection) => {
        cachedConnection = connection;
        return connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

export async function getCollection<T extends Document>(
  collectionName: string
): Promise<Collection<T>> {
  const { db } = await getMongoConnection();
  return db.collection<T>(collectionName);
}

export async function closeConnection(): Promise<void> {
  if (cachedConnection) {
    await cachedConnection.client.close();
    cachedConnection = null;
  }
  connectionPromise = null;
}

// Utility functions for common operations with error handling
export async function findOne<T extends Document>(
  collectionName: string,
  query: object,
  options: object = {}
): Promise<T | null> {
  return withErrorHandling(async () => {
    const collection = await getCollection<T>(collectionName);
    return collection.findOne(query, options);
  }, `Failed to find document in ${collectionName}`);
}

export async function findMany<T extends Document>(
  collectionName: string,
  query: object,
  options: object = {}
): Promise<T[]> {
  return withErrorHandling(async () => {
    const collection = await getCollection<T>(collectionName);
    return collection.find(query, options).toArray();
  }, `Failed to find documents in ${collectionName}`);
}

export async function insertOne<T extends Document>(
  collectionName: string,
  document: T
): Promise<T> {
  return withErrorHandling(async () => {
    const collection = await getCollection<T>(collectionName);
    const result = await collection.insertOne(document);
    return { ...document, _id: result.insertedId };
  }, `Failed to insert document into ${collectionName}`);
}

export async function updateOne<T extends Document>(
  collectionName: string,
  query: object,
  update: object,
  options: object = {}
): Promise<boolean> {
  return withErrorHandling(async () => {
    const collection = await getCollection<T>(collectionName);
    const result = await collection.updateOne(query, update, options);
    return result.modifiedCount > 0;
  }, `Failed to update document in ${collectionName}`);
}

export async function deleteOne<T extends Document>(
  collectionName: string,
  query: object
): Promise<boolean> {
  return withErrorHandling(async () => {
    const collection = await getCollection<T>(collectionName);
    const result = await collection.deleteOne(query);
    return result.deletedCount > 0;
  }, `Failed to delete document from ${collectionName}`);
}

// Health check function
export async function checkMongoConnection(): Promise<boolean> {
  try {
    const { client } = await getMongoConnection();
    await client.db().admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return false;
  }
}

// Cleanup function for graceful shutdown
export async function cleanup(): Promise<void> {
  await closeConnection();
}

// Add event listeners for graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

// Exported types
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

// Exported functions
export async function getCachedPlaces(
  query: string,
  paginationParams: PaginationParams
): Promise<PaginatedResponse<Document> | null> {
  const collection = await getCollection(CACHE_COLLECTION);
  
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
  const collection = await getCollection(CACHE_COLLECTION);
  
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
  const collection = await getCollection(CACHE_COLLECTION);
  
  try {
    await collection.deleteMany({
      expiresAt: { $lte: new Date() }
    });
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
}

export async function initializeDatabase(): Promise<void> {
  const collection = await getCollection(CACHE_COLLECTION);
  
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
