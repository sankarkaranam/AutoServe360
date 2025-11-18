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

  /* Username/Password login (mock now; swap with FastAPI later) */
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
    await new Promise((r) => setTimeout(r, 500)); // simulate API latency

    const found = MOCK_USERS.find(
      (u) =>
        u.tenantId.trim() === tenantId.trim() &&
        u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );

    if (!found) {
      setLoading(false);
      throw new Error('Invalid credentials or tenant');
    }

    const u: User = {
      tenantId: found.tenantId,
      email: found.email,
      name: found.name,
      role: found.role,
      token: 'dev-mock-token',
    };

    setUser(u);
    localStorage.setItem('as360_user', JSON.stringify(u));
    localStorage.setItem('as360_tenant', found.tenantId);
    setLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOtp, logout }}>
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
