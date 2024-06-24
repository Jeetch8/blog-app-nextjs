import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { compare, hash } from 'bcrypt';
import { generateFromEmail } from 'unique-username-generator';
import { db } from '@/db/drizzle';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getUserByEmail, createUser } from '@/db_access/user';
import { createAccount } from '@/db_access/account';
import { createUserProfile } from '@/db_access/profile';
export const authOptions: NextAuthOptions = {
  theme: {
    colorScheme: 'dark',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile, tokens) {
        const user = await getUserByEmail(profile.email);
        return { ...profile, username: user?.username };
      },
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      async profile(profile, tokens) {
        const user = await getUserByEmail(profile.email);
        return { ...profile, username: user?.username };
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // gets called when user signs in with credentials
      async authorize(credentials) {
        try {
          if (!credentials) {
            return null;
          }

          const user = await getUserByEmail(credentials.email);

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            image: user?.image,
            username: user?.username,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account, profile }) {
      const userEmail =
        typeof user.email === 'string' ? user.email : profile?.email;
      if (!userEmail) {
        return false;
      }
      const existingUser = await getUserByEmail(userEmail);
      if (!existingUser) {
        await db.transaction(async (tx) => {
          const newUser = await createUser(
            {
              email: userEmail,
              name: profile?.name || user?.name!,
              image: profile?.image || user?.image!,
              username: generateFromEmail(userEmail!),
            },
            tx
          );
          await createAccount(
            {
              userId: newUser[0]?.id,
              type: account?.provider,
              refreshToken: account?.refresh_token,
              accessToken: account?.access_token,
              tokenType: account?.token_type,
              expiresAt: account?.expires_at,
              scope: account?.scope,
              idToken: account?.id_token,
              provider: account?.provider!,
              providerAccountId: account?.providerAccountId!,
            },
            tx
          );
          await createUserProfile(newUser[0], tx);
        });
        return true;
      }
      return !!existingUser;
    },
    async redirect({ baseUrl, url }) {
      const callbackUrl = new URL(url).searchParams.get('callbackUrl');
      if (callbackUrl) {
        return callbackUrl;
      }
      if (url.startsWith('/auth/signin')) {
        return `${baseUrl}/`;
      }
      return baseUrl;
    },
    async jwt({ token, user, account, profile, session, trigger }) {
      // console.log('jwt', token, user, account, profile, session, trigger);
      if (user) {
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token, newSession, trigger, user }) {
      // console.log('session', session, token, newSession, trigger, user);
      if (session.user) {
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.email = token.email as string;
        session.user.id = token.sub as string;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
