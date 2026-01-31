// Global config (editable)
(function () {
  // 👉 Cambia aquí si algún día cambia tu API en producción
  const DEFAULT_API_PROD = 'https://mrsmartservice-256100476140.us-central1.run.app';
  const DEFAULT_API_LOCAL = 'http://localhost:8080';

  const saved = localStorage.getItem('MR_API_BASE');
  const isLocalhost = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

  // Si no hay nada guardado en localStorage, adivinamos según dónde corre el front.
  const guessed = isLocalhost ? DEFAULT_API_LOCAL : DEFAULT_API_PROD;

  function cleanBase(base) {
    let b = String(base || '').trim();
    if (!b) return b;
    // Quita trailing '/'
    b = b.replace(/\/+$/, '');
    // Mucha gente guarda ".../api" en localStorage; evitamos el bug "/api/api".
    b = b.replace(/\/api$/i, '');
    return b;
  }

  function resolveMediaUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';

    // Ya es absoluta
    if (/^https?:\/\//i.test(raw)) return raw;

    // Si viene como "uploads/xxx" sin slash
    if (!raw.startsWith('/')) {
      const base = cleanBase(window.MR_CONFIG?.API_BASE || saved || guessed);
      return base ? `${base}/${raw}` : `/${raw}`;
    }

    // Si viene como "/uploads/xxx" o "/api/..." lo pegamos al API_BASE
    const base = cleanBase(window.MR_CONFIG?.API_BASE || saved || guessed);
    if (!base) return raw;
    return `${base}${raw}`;
  }

  const normalizedBase = cleanBase(saved || guessed);
  // Si había un valor antiguo con "/api", lo migramos.
  if (saved && normalizedBase && saved !== normalizedBase) {
    try { localStorage.setItem('MR_API_BASE', normalizedBase); } catch {}
  }

  window.MR_CONFIG = {
    API_BASE: normalizedBase,
    WHATSAPP_NUMBER: '573014190633',
    COMPANY_NAME: 'MR SmartService',
    LOGO_SRC: '/assets/img/mr-logo-circle.png',
    DEFAULT_SOFTWARE_IMG: '/assets/img/default-software.svg',
    DEFAULT_PRODUCT_IMG: '/assets/img/default-product.svg',
    resolveMediaUrl,
  };

  // Compatibilidad con scripts viejos
  window.WHATSAPP_BUSINESS = window.MR_CONFIG.WHATSAPP_NUMBER;
})();
