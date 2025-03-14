// src/middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/analyze/my',
  '/profile',
  '/settings',
];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check auth session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the pathname from the URL
  const { pathname } = req.nextUrl;
  
  // Check if the pathname matches a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    // Create the URL to redirect to
    const redirectUrl = new URL('/auth/login', req.url);
    // Add the original URL as a query parameter to redirect back after login
    redirectUrl.searchParams.set('redirect', pathname);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};