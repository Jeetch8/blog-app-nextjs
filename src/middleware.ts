import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const token = await getToken({ req: req });
    if (
      req.nextUrl.pathname.startsWith('/auth') ||
      req.nextUrl.pathname === '/' ||
      req.nextUrl.pathname === '/home' ||
      req.nextUrl.pathname.startsWith('/images')
    ) {
      return NextResponse.next();
    }

    if (!token) {
      const url = new URL('/api/auth/signin', req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }
  },
  {
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
      newUser: '/auth/register',
    },

    callbacks: {
      authorized: ({ req, token }) => {
        //   console.log(token, 'token');
        return true;
      },
    },
  }
);

// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { getToken } from 'next-auth/jwt'

// export async function middleware(request: NextRequest) {
//   const token = await getToken({ req: request })
//   const { pathname } = request.nextUrl

//   // Allow access to the root path
//   if (pathname === '/') {
//     return NextResponse.next()
//   }

//   // Protect all other routes
//   if (!token) {
//     const url = new URL('/api/auth/signin', request.url)
//     url.searchParams.set('callbackUrl', encodeURI(request.url))
//     return NextResponse.redirect(url)
//   }

//   return NextResponse.next()
// }

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
