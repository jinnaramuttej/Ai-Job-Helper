'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignupScreen } from '@/components/screens/Auth';

function SignupContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextParam = searchParams.get('next');

  const handleSignup = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          setError(data.errors[firstKey]?.[0] || 'Unable to create account');
        } else if (data.error) {
          setError(data.error);
        } else {
          setError('Unable to create account');
        }
      } else {
        const target = nextParam
          ? `/onboarding?next=${encodeURIComponent(nextParam)}`
          : '/onboarding';
        router.push(target);
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return <SignupScreen onSubmit={handleSignup} error={error} loading={loading} />;
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>}>
      <SignupContainer />
    </Suspense>
  );
}
