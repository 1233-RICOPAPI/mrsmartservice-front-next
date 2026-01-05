'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ForgotPasswordRedirect() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    const target = '/forgot-password.html' + (qs ? '?' + qs : '');
    window.location.replace(target);
  }, [sp]);

  return null;
}
