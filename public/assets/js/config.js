// Global config (editable)
(function () {
  const DEFAULT_API_LOCAL = 'http://localhost:8080';

  const saved = localStorage.getItem('MR_API_BASE');
  const guessed = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? DEFAULT_API_LOCAL
    : '';

  window.MR_CONFIG = {
    API_BASE: saved || guessed,
    WHATSAPP_NUMBER: '573014190633',
    COMPANY_NAME: 'MR SmartService',
    DEFAULT_SOFTWARE_IMG: '/assets/img/default-software.svg',
    DEFAULT_PRODUCT_IMG: '/assets/img/default-product.svg',
  };
})();
