import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// export const config = {
//   mathcer: ['/', '/:path*'],
//   missing: ['/auth/', '/auth/:path*'],
// };
export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    if (req.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.next();
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
