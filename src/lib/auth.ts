import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/account/login',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('This account has been disabled. Please contact the gallery.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        if (user.role === 'CUSTOMER' && !user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  secret: (() => {
    if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
      throw new Error('NEXTAUTH_SECRET must be set in production environment.');
    }
    return process.env.NEXTAUTH_SECRET || 'dev_secret_key_change_in_production';
  })(),
};

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    return null;
  }
  const role = session.user.role;
  if (role !== Role.OWNER && role !== Role.STAFF) {
    return null;
  }
  return session;
}

export async function requireOwnerSession() {
  const session = await getServerAuthSession();
  if (!session || !session.user || session.user.role !== Role.OWNER) {
    return null;
  }
  return session;
}
