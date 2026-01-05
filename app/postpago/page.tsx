'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PostpagoRedirect() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    window.location.replace(`/postpago.html${qs ? `?${qs}` : ''}`);
  }, [sp]);

  return null;
}
