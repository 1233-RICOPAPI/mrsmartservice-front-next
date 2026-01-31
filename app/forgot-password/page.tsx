'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function ForgotPasswordRedirectInner() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    const target = '/forgot-password.html' + (qs ? '?' + qs : '');
    window.location.replace(target);
  }, [sp]);

  return null;
}

export default function ForgotPasswordRedirect() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordRedirectInner />
    </Suspense>
  );
}
