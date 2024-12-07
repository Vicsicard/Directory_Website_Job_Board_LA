import { NextResponse } from 'next/server';
import { cleanupExpiredCache } from '@/utils/cacheCleanup';

// This endpoint will be called by a CRON job
export async function POST() {
  try {
    const stats = await cleanupExpiredCache();
    
    return NextResponse.json({
      message: 'Scheduled cache cleanup completed successfully',
      stats
    });
  } catch (error) {
    console.error('Error in scheduled cache cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to run scheduled cache cleanup' },
      { status: 500 }
    );
  }
}
