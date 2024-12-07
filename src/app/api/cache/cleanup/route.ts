import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredCache, getCacheStats } from '@/utils/cacheCleanup';

// Add basic authentication to prevent unauthorized access
const isAuthorized = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  
  // Use API key from environment variable
  const apiKey = process.env.CACHE_CLEANUP_API_KEY || 'default-cleanup-key';
  return authHeader === `Bearer ${apiKey}`;
};

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cleanupStats = await cleanupExpiredCache();
    return NextResponse.json({
      message: 'Cache cleanup completed successfully',
      stats: cleanupStats
    });
  } catch (error) {
    console.error('Error in cache cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup cache' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await getCacheStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}
