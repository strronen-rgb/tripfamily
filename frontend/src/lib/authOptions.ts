import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const authOptions: NextAuthOptions = {
  providers: [
    // Email + Password login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          const data = await res.json();
          if (!res.ok || !data.data) return null;
          return {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            image: data.data.user.avatarUrl,
            token: data.data.token,
          };
        } catch {
          return null;
        }
      },
    }),
    // Google OAuth — verified by our backend
    CredentialsProvider({
      id: 'google-oauth',
      name: 'google-oauth',
      credentials: {
        token: { label: 'Token', type: 'text' },
        userId: { label: 'UserId', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${credentials.token}` },
          });
          const data = await res.json();
          if (!res.ok || !data.data?.user) return null;
          return {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            image: data.data.user.avatarUrl,
            token: credentials.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
