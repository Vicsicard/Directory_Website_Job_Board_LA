'use client';

import { useEffect } from 'react';

// Run cache cleanup every 24 hours
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;

export default function CacheManager() {
  useEffect(() => {
    const runCacheCleanup = async () => {
      try {
        const response = await fetch('/api/cache/cleanup', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CACHE_CLEANUP_API_KEY || 'default-cleanup-key'}`
          }
        });

        if (!response.ok) {
          throw new Error('Cache cleanup failed');
        }

        const data = await response.json();
        console.log('Cache cleanup completed:', data);
      } catch (error) {
        console.error('Error running cache cleanup:', error);
      }
    };

    // Run cleanup immediately when component mounts
    runCacheCleanup();

    // Schedule periodic cleanup
    const intervalId = setInterval(runCacheCleanup, CLEANUP_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // This component doesn't render anything
  return null;
}
