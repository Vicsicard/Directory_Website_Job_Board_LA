import { NextResponse } from 'next/server';
import { getKeywords } from '@/utils/csvParser';

export async function GET() {
  try {
    const keywords = await getKeywords();
    return NextResponse.json(keywords);
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}
