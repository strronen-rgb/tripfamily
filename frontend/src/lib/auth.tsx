'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  familyId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with NextAuth session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const u = session.user as any;
      setUser({
        id: u.id || u.sub,
        email: u.email || '',
        name: u.name || '',
        avatarUrl: u.image || u.avatarUrl,
        role: u.role || 'MEMBER',
        familyId: u.familyId,
      });
      setToken(u.accessToken || null);
    } else if (status === 'unauthenticated') {
      setUser(null);
      setToken(null);
    }
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    // Sign in via NextAuth
    const result = await nextAuthSignIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (result?.error) throw new Error(result.error);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    // Auto-login after register
    const result = await nextAuthSignIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (result?.error) throw new Error(result.error);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await nextAuthSignIn('google', { callbackUrl: '/' });
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
    await nextAuthSignOut({ callbackUrl: '/auth' });
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data?.user) {
        setUser(data.data.user);
      }
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user && !!token,
        token,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Helper: fetch with auth token
export async function authFetch<T>(endpoint: string, token: string | null, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
