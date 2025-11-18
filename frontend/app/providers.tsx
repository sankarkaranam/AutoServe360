'use client';

import * as React from 'react';
import { AuthProvider } from './_providers/auth'; // expects app/_providers/auth.tsx

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
