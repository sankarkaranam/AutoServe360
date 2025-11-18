import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/logo';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-[350px] flex-col items-center justify-center space-y-6">
        <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">Hero Motors</h1>
        </div>
        <div className='w-full'>
            <LoginForm role="admin" />
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Super Admin / Company Login
        </p>
      </div>
    </div>
  );
}
