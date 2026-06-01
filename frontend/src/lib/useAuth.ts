'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role?: string;
  familyId?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedUser = localStorage.getItem('tripfamily_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {}
    setLoading(false);
  }, []);

  const getToken = useCallback(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('tripfamily_token') : null;
  }, []);

  const isAuthenticated = !!user && !!getToken();

  return { user, loading, isAuthenticated, getToken };
}
