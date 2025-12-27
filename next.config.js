/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Evita que Next "adivine" el workspace root cuando hay múltiples lockfiles
  // (por ejemplo, uno en C:\Users\... y otro en este proyecto).
  // Esto solo afecta el trazado de archivos para output y elimina el warning.
  outputFileTracingRoot: __dirname,
  // Este proyecto usa Next como "wrapper" para servir archivos estáticos legacy (.html, js, css) desde /public,
  // y rutas limpias (/contacto, /carrito, etc.) que redireccionan a esos .html.
};

module.exports = nextConfig;
