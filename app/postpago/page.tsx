'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function PostpagoRedirectInner() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    window.location.replace(`/postpago.html${qs ? `?${qs}` : ''}`);
  }, [sp]);

  return null;
}

export default function PostpagoRedirect() {
  return (
    <Suspense fallback={null}>
      <PostpagoRedirectInner />
    </Suspense>
  );
}
