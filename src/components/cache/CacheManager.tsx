'use client';

import { useEffect, useCallback } from 'react';

// Run cache cleanup every 24 hours
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

export default function CacheManager() {
  const runCacheCleanup = useCallback(async (retryCount = 0) => {
    try {
      // Check cache service status first
      const statusResponse = await fetch('/api/cache/cleanup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CACHE_CLEANUP_API_KEY || 'default-cleanup-key'}`
        }
      });

      if (!statusResponse.ok) {
        const statusError = await statusResponse.json();
        throw new Error(`Cache service check failed: ${statusError.error || 'Unknown error'}`);
      }

      // If service is running, proceed with cleanup
      const response = await fetch('/api/cache/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CACHE_CLEANUP_API_KEY || 'default-cleanup-key'}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cache cleanup failed: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Cache cleanup completed:', data);
    } catch (error) {
      console.error('Error running cache cleanup:', error);

      // Retry logic for specific errors
      if (retryCount < MAX_RETRIES && 
          (error instanceof Error && 
           (error.message.includes('Database connection failed') || 
            error.message.includes('ECONNREFUSED')))) {
        console.log(`Retrying cache cleanup in ${RETRY_DELAY}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => runCacheCleanup(retryCount + 1), RETRY_DELAY);
      }
    }
  }, []);

  useEffect(() => {
    // Run cleanup immediately when component mounts
    runCacheCleanup();

    // Schedule periodic cleanup
    const intervalId = setInterval(runCacheCleanup, CLEANUP_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [runCacheCleanup]);

  // This component doesn't render anything
  return null;
}
