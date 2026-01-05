'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordRedirect() {
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString() || '';
    const target = '/reset-password.html' + (qs ? '?' + qs : '');
    window.location.replace(target);
  }, [sp]);

  return null;
}
