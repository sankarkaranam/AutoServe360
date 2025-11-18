'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export type AppUser = {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<AppUser, 'displayName' | 'photoURL'>>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>({
    id: '1',
    email: 'demo@example.com',
    displayName: 'Demo User',
    photoURL: null,
  });

  const [loading, setLoading] = useState(false);

  async function signIn(email: string, _password: string) {
    setLoading(true);
    try {
      setUser({
        id: '1',
        email,
        displayName: 'Sankar',
        photoURL: null,
      });
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(patch: Partial<Pick<AppUser, 'displayName' | 'photoURL'>>) {
    setUser(prev => (prev ? { ...prev, ...patch } : prev));
  }

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signOut,
    updateProfile
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
