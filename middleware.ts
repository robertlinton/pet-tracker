import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of all public paths
const publicPaths = [
  '/signin',
  '/signup',
  '/reset-password',
  // Add any other public paths here
];

// List of paths that should redirect to dashboard if authenticated
const authPaths = [
  '/signin',
  '/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get('__session')?.value;

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Check if the path is an auth path that should redirect when authenticated
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // Handle API routes and static files
  if (
    pathname.startsWith('/_next') || // Next.js static files
    pathname.startsWith('/api') ||   // API routes
    pathname.startsWith('/static') || // Static files
    pathname.includes('.') // Files with extensions (images, etc.)
  ) {
    return NextResponse.next();
  }

  // If path is public and user is not authenticated, allow access
  if (isPublicPath && !token) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access auth paths, redirect to dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If path is not public and user is not authenticated, redirect to signin
  if (!isPublicPath && !token) {
    const redirectUrl = new URL('/signin', request.url);
    // Optional: Add the original path as a redirect parameter
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow access to all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};