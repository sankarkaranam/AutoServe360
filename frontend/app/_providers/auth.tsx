'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/* =========================
   Roles & User Model
========================= */

export type UserRole =
  | 'superadmin'
  | 'saas_admin'
  | 'company_admin'
  | 'dealer_admin'
  | 'supervisor'
  | 'staff';

export type User = {
  id?: string;
  tenantId: string;
  email: string;
  name?: string;
  displayName?: string; // Added for compatibility
  photoURL?: string;    // Added for compatibility
  role?: UserRole;
  token?: string; // future: backend JWT
};

/* Role helpers (reuse anywhere) */
export const isSaaSAdmin = (u?: User | null) =>
  !!u && (u.role === 'superadmin' || u.role === 'saas_admin' || u.email === 'admin@example.com');

export const isDealerAdmin = (u?: User | null) =>
  !!u && (u.role === 'dealer_admin' || u.role === 'company_admin');

/* =========================
   Auth Context
========================= */

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (args: { tenantId: string; email: string; password: string }) => Promise<void>;
  loginWithOtp: (args: { tenantId: string; mobile: string; otp: string }) => Promise<void>; // future
  logout: () => void;
  updateProfile: (patch: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

/* =========================
   TEMP Mock Users (until FastAPI)
========================= */

const MOCK_USERS = [
  {
    tenantId: 'dealer-001',
    email: 'dealer@example.com',
    password: 'password',
    name: 'Demo Dealer',
    role: 'dealer_admin' as const,
  },
  {
    tenantId: 'saas', // special tenant for SaaS admin login
    email: 'admin@example.com',
    password: 'password',
    name: 'SaaS Admin',
    role: 'saas_admin' as const,
  },
];

/* =========================
   Provider
========================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on load
  useEffect(() => {
    try {
      const raw = localStorage.getItem('as360_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  /* Username/Password login (now calling FastAPI backend) */
  async function login({
    tenantId,
    email,
    password,
  }: {
    tenantId: string;
    email: string;
    password: string;
  }) {
    setLoading(true);

    try {
      // Call backend API
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_code: tenantId,
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
        throw new Error(error.detail || 'Invalid credentials');
      }

      const data = await response.json();

      // Store token and user info
      const u: User = {
        tenantId: tenantId,
        email: email,
        name: data.user?.name || data.user?.display_name || email.split('@')[0],
        role: data.user?.role || 'dealer_admin', // ✅ CRITICAL: Include role from backend
        token: data.access_token,
      };

      setUser(u);
      localStorage.setItem('as360_user', JSON.stringify(u));
      localStorage.setItem('as360_tenant', tenantId);
      localStorage.setItem('as360_token', data.access_token); // CRITICAL: Store JWT token
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  /* OTP login placeholder (wire to FastAPI later) */
  async function loginWithOtp({
    tenantId,
    mobile,
    otp,
  }: {
    tenantId: string;
    mobile: string;
    otp: string;
  }) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    // Simple demo rule: tenantId must be 'dealer-001' and OTP must be '123456'
    if (tenantId !== 'dealer-001' || otp !== '123456') {
      setLoading(false);
      throw new Error('Invalid OTP or tenant');
    }

    const u: User = {
      tenantId,
      email: `${mobile}@masked.local`,
      name: 'OTP User',
      role: 'dealer_admin',
      token: 'dev-mock-token',
    };

    setUser(u);
    localStorage.setItem('as360_user', JSON.stringify(u));
    localStorage.setItem('as360_tenant', tenantId);
    setLoading(false);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('as360_user');
    // If you also want to clear tenant, uncomment:
    // localStorage.removeItem('as360_tenant');
  }

  async function updateProfile(patch: Partial<User>) {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...patch };
      localStorage.setItem('as360_user', JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOtp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

/* Hook */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
