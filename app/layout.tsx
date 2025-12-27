import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Mr Smart Service',
  description: 'Ecommerce Mr Smart Service',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
