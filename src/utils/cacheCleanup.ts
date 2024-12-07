import { getCacheCollection } from './mongodb';

const CACHE_DURATION_MS = 180 * 24 * 60 * 60 * 1000; // 180 days in milliseconds

export async function cleanupExpiredCache() {
  try {
    const collection = await getCacheCollection();
    if (!collection) {
      throw new Error('Failed to get cache collection');
    }

    const expiryTimestamp = Date.now() - CACHE_DURATION_MS;

    // Delete all entries older than 180 days
    const result = await collection.deleteMany({
      timestamp: { $lt: expiryTimestamp }
    });

    console.log(`Cleaned up ${result.deletedCount} expired cache entries`);
    
    // Get cache statistics
    const totalEntries = await collection.countDocuments();
    const oldestEntry = await collection
      .find()
      .sort({ timestamp: 1 })
      .limit(1)
      .toArray();
    
    const stats = {
      totalEntries,
      oldestEntryAge: oldestEntry.length > 0 
        ? Math.floor((Date.now() - oldestEntry[0].timestamp) / (24 * 60 * 60 * 1000))
        : 0,
      deletedEntries: result.deletedCount
    };

    return stats;
  } catch (error) {
    console.error('Error during cache cleanup:', error);
    throw new Error(`Cache cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getCacheStats() {
  try {
    const collection = await getCacheCollection();
    
    const stats = {
      totalEntries: await collection.countDocuments(),
      totalSize: await collection.stats().then(stats => stats.size),
      indexes: await collection.indexes(),
    };

    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    throw error;
  }
}
