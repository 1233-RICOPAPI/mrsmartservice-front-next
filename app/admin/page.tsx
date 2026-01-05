'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminRedirect() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    const target = '/admin.html' + (qs ? '?' + qs : '');
    window.location.replace(target);
  }, [sp]);

  return null;
}
