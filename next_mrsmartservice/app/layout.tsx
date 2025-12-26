export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolved server-side on each request.
  // In Cloud Run set API_ORIGIN or NEXT_PUBLIC_API_ORIGIN, e.g.:
  //   https://mrsmartservice-xxxxxx.us-central1.run.app
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.API_ORIGIN || "";

  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__API_ORIGIN__=${JSON.stringify(apiOrigin)};window.__API__=${JSON.stringify(apiOrigin)};`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
