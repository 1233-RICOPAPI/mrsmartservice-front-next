'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginRedirectInner() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    const target = '/login.html' + (qs ? '?' + qs : '');
    window.location.replace(target);
  }, [sp]);

  return null;
}

export default function LoginRedirect() {
  return (
    <Suspense fallback={null}>
      <LoginRedirectInner />
    </Suspense>
  );
}
