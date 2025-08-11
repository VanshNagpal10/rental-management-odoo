/**
 * Customer Authentication Middleware
 * Ensures only authenticated customers can access customer routes
 */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function customerAuthMiddleware(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Check if user is authenticated and has customer role
    if (!token || token.role !== 'customer') {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Customer auth middleware error:', error);
    // Redirect to login on error
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/shop/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*'
  ]
};
