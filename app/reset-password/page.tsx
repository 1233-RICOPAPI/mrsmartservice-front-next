'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function ResetPasswordRedirectInner() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    const target = '/reset-password.html' + (qs ? '?' + qs : '');
    window.location.replace(target);
  }, [sp]);

  return null;
}

export default function ResetPasswordRedirect() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordRedirectInner />
    </Suspense>
  );
}
