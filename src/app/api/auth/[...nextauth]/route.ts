import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import prisma from '@prisma_client/prisma';
import { compare } from 'bcrypt';
import { generateFromEmail } from 'unique-username-generator';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

const createUserProfile = async (user: Partial<User> & { id: string }) => {
  await prisma.user_Profile.create({
    data: { userId: user.id },
  });
};

export const authOptions: NextAuthOptions = {
  theme: {
    colorScheme: 'dark',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile, tokens) {
        const user = await prisma.user.findUnique({
          where: { email: profile.email },
        });
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
        const user = await prisma.user.findUnique({
          where: { email: profile.email },
        });
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

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

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
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            username: user.username,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
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
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: {
            email: userEmail,
            name: profile?.name || user?.name!,
            image: profile?.image || user?.image!,
            username: generateFromEmail(userEmail!),
          },
        });
        const newAccount = await prisma.account.create({
          data: {
            userId: newUser.id,
            type: account?.provider,
            refresh_token: account?.refresh_token,
            access_token: account?.access_token,
            token_type: account?.token_type,
            expires_at: account?.expires_at,
            scope: account?.scope,
            id_token: account?.id_token,
            provider: account?.provider!,
            providerAccountId: account?.providerAccountId!,
          },
        });
        await createUserProfile(newUser);
        return true;
      }
      return !!existingUser;
    },
    async redirect({ baseUrl, url }) {
      console.log(url);
      if (url.startsWith('/auth/signin')) {
        return `${baseUrl}/auth/signin`;
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
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
