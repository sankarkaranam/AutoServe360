// app/login/dealer/page.tsx
'use client';

import React from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { Card } from '@/components/ui/card';

export default function DealerLoginPage() {
  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            Dealer Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to AutoServe360 to access your dashboard.
          </p>
        </div>
        <Card className="p-6">
          <LoginForm role="dealer" />
        </Card>
      </div>
    </main>
  );
}
