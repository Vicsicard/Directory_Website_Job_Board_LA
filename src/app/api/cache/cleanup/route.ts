import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredCache } from '@/utils/cacheCleanup';
import { getMongoConnection } from '@/utils/mongodb';

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

    // Test MongoDB connection first
    try {
      const connection = await getMongoConnection();
      await connection.db.command({ ping: 1 });
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const cleanupStats = await cleanupExpiredCache();
    
    if (!cleanupStats) {
      return NextResponse.json(
        { error: 'Cache cleanup failed - no stats returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Cache cleanup completed successfully',
      stats: cleanupStats
    });
  } catch (error) {
    console.error('Error in cache cleanup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to cleanup cache: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// GET endpoint to check cache status
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test MongoDB connection
    try {
      const connection = await getMongoConnection();
      await connection.db.command({ ping: 1 });
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'Cache service is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking cache status:', error);
    return NextResponse.json(
      { error: 'Failed to check cache status' },
      { status: 500 }
    );
  }
}
