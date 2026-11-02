'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginScreen } from '@/components/screens/Auth';

function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const nextParam = searchParams.get('next');

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          setError(data.errors[firstKey]?.[0] || 'Invalid credentials');
        } else if (data.error) {
          setError(data.error);
        } else {
          setError('Invalid email or password');
        }
      } else {
        if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.startsWith('/\\')) {
          router.push(nextParam);
        } else {
          router.push('/jobs');
        }
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginScreen
        onSubmit={handleLogin}
        error={error}
        loading={loading}
        onToast={setToastMsg}
      />
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-ink px-4 py-2.5 text-[13px] text-white shadow-xl animate-fade-in"
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>}>
      <LoginContainer />
    </Suspense>
  );
}
