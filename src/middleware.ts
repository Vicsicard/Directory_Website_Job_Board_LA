import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Basic request logging
  const path = request.nextUrl.pathname;
  console.log(`API Request to: ${path}`);

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
}
