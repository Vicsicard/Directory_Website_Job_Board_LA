import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats } from '@/utils/cacheCleanup';

export async function GET() {
  try {
    const stats = await getCacheStats();
    return NextResponse.json({
      status: 'healthy',
      stats
    });
  } catch (error) {
    console.error('Error getting cache status:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to get cache status'
      },
      { status: 500 }
    );
  }
}
