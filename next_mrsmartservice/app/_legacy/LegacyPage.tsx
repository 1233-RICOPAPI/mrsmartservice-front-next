'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import type { LegacyTemplate } from './templates';

function normalizeSrc(src: string): string {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return src.startsWith('/') ? src : '/' + src;
}

export default function LegacyPage({ template }: { template: LegacyTemplate }) {
  // Scripts base (mismo orden que el front original) para que la lógica legacy funcione.
  // Se cargan DESPUÉS de template.scripts (por ejemplo, Firebase compat en admin).
  const commonScripts = [
    '/js/app.config.js',
    '/js/app.ui.js',
    '/js/app.catalog.js',
    '/js/app.cart.js',
    '/js/app.admin.js',
    '/js/app.detail.js',
    '/js/app.home.js',
    '/js/app.auth.js',
    '/js/app.footer.js',
    '/js/app.main.js',
  ];

  useEffect(() => {
    const prev = document.body.className;
    document.body.className = template.bodyClass || '';
    return () => {
      document.body.className = prev;
    };
  }, [template.bodyClass]);

  return (
    <>
      <div
        id="legacy-root"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: template.bodyHtml }}
      />

      {template.scripts.map((src, idx) => (
        <Script key={src + idx} src={normalizeSrc(src)} strategy="afterInteractive" />
      ))}

      {commonScripts.map((src, idx) => (
        <Script key={src + idx} src={src} strategy="afterInteractive" />
      ))}

      {template.inlineScripts.map((code, idx) => (
        <Script
          key={'inline-' + idx}
          id={'legacy-inline-' + idx}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      ))}
    </>
  );
}
