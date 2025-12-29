(function () {
  function fmtCOP(v) {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(v || 0));
    } catch {
      return `$${Math.round(Number(v || 0)).toLocaleString('es-CO')}`;
    }
  }

  function openWhatsApp(message) {
    const n = window.MR_CONFIG.WHATSAPP_NUMBER;
    const url = `https://wa.me/${n}?text=${encodeURIComponent(message || '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function normalizeCity(s) {
    return String(s || '').trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  window.MR_UTIL = { fmtCOP, openWhatsApp, normalizeCity };
})();
