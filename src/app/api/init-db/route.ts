import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/utils/mongodb';
import { initializeRateLimiting } from '@/utils/rateLimiter';

export async function GET() {
  try {
    await initializeDatabase();
    await initializeRateLimiting();
    
    return NextResponse.json({ 
      message: 'Database and rate limiting initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing:', error);
    return NextResponse.json(
      { error: 'Failed to initialize' },
      { status: 500 }
    );
  }
}
