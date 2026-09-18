import type { Metadata } from 'next';
import { Suspense } from 'react';

import LoginForm from '@/components/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

/**
 * Login route — the proxy redirects already-authenticated visitors to `/admin`.
 **/
export default function LoginPage() {
  return (
    // `useSearchParams` in the form makes it a client boundary that needs its own Suspense.
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
