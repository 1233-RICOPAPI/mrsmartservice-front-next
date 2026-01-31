'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function AdminRedirectInner() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    const target = '/admin.html' + (qs ? '?' + qs : '');
    window.location.replace(target);
  }, [sp]);

  return null;
}

export default function AdminRedirect() {
  return (
    <Suspense fallback={null}>
      <AdminRedirectInner />
    </Suspense>
  );
}
