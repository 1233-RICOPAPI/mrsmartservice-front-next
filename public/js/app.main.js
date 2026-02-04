/********************
 * MR SmartService - Entrada principal
 * Inicialización por página
 ********************/

// ========================== PROTECCIÓN DE ADMIN ==========================
async function protectAdminPage() {
  if (!isPage('admin.html')) return null;

  if (!getToken || !getToken()) {
    location.href = 'login.html';
    return null;
  }

  let user = null;

  try {
    if (typeof fetchCurrentUser === 'function') {
      user = await fetchCurrentUser();
    }
  } catch (e) {
    console.warn('No se pudo obtener usuario actual', e);
  }

  if (!user || !user.role) {
    location.href = 'login.html';
    return null;
  }

  const role = String(user.role || '').toUpperCase();

  // 👉 Ahora dejamos pasar ADMIN, DEV_ADMIN y USER
  const allowed = ['ADMIN', 'DEV_ADMIN', 'USER', 'CONTADOR'];
  if (!allowed.includes(role)) {
    location.href = 'index.html';
    return user;
  }

  return user;
}

// ========== HELPERS ==========

// Normaliza texto para comparar categorías sin acentos / mayúsculas
function normCat(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Alias por compatibilidad si en algún lado llamas normalizarTexto()
function normalizarTexto(str) {
  return normCat(str);
}

// Navegación por categoría:
// - Si es Software(s) => software.html
// - Si no => catálogo filtrado en index.html
function goCategory(cat) {
  const raw = String(cat || '').trim();
  if (!raw) {
    window.location.href = 'index.html#catalogo';
    return;
  }

  const n = normCat(raw);
  if (n === 'software' || n === 'softwares') {
    window.location.href = 'software.html';
    return;
  }

  localStorage.setItem('mr_last_category', raw);
  window.location.href = `index.html?cat=${encodeURIComponent(raw)}#catalogo`;
}

// ========== CATEGORÍAS DINÁMICAS HOME ==========
async function loadDynamicHomeCategories() {
  const grid = document.getElementById('homeCategories');
  if (!grid) return;

  try {
    const resp = await fetch(API + '/products');
    if (!resp.ok) return;

    const products = await resp.json();
    const categorias = [
      ...new Set(
        products
          .map((p) => (p.category || '').trim())
          .filter(Boolean)
      ),
    ];

    // Limpia por si acaso
    grid.innerHTML = '';

    categorias.forEach((cat) => {
      const item = document.createElement('article');
      item.className = 'cat-card home-cat-box';
      item.innerHTML = `
        <div class="cat-icon">📦</div>
        <div class="cat-info">
          <h3>${cat}</h3>
          <p>Ver productos de ${cat}</p>
        </div>
      `;

      item.style.cursor = 'pointer';
      item.addEventListener('click', () => goCategory(cat));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goCategory(cat);
        }
      });
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'link');

      grid.appendChild(item);
    });
  } catch (err) {
    console.warn('Error cargando categorías dinámicas', err);
  }
}

// ========== CATEGORÍAS ESTÁTICAS HOME (cards de abajo) ==========
function bindStaticHomeCategories() {
  const cards = document.querySelectorAll('.home-categorias-grid .cat-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    const cat = card.querySelector('h3')?.textContent?.trim() || '';
    card.style.cursor = 'pointer';

    card.addEventListener('click', () => goCategory(cat));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goCategory(cat);
      }
    });

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
  });
}

// ========== CATEGORÍAS DESTACADAS HOME (arriba) ==========
function bindFeaturedHomeCategories() {
  const cards = document.querySelectorAll('.home-cats-grid .home-featured-cat');
  if (!cards.length) return;

  cards.forEach((card) => {
    const cat = (card.dataset.cat || card.querySelector('h3')?.textContent || '').trim();
    card.style.cursor = 'pointer';

    card.addEventListener('click', () => goCategory(cat));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goCategory(cat);
      }
    });

    // si no tiene tabindex, lo ponemos para accesibilidad
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    if (!card.hasAttribute('role')) card.setAttribute('role', 'link');
  });
}

// ========== MENÚ MÓVIL (Hamburguesa) ==========
function initMobileMenu() {
  const header = document.querySelector('.main-header');
  const nav    = header?.querySelector('.main-nav');
  if (!header || !nav) return;

  // Evitar doble binding en la misma página
  if (header.dataset.mobileMenuInit === '1') return;
  header.dataset.mobileMenuInit = '1';

  // 1) Asegurar wrapper .nav-links
  let wrap = nav.querySelector('.nav-links');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'nav-links';

    while (nav.firstChild) {
      wrap.appendChild(nav.firstChild);
    }
    nav.appendChild(wrap);
  }

  // 2) Asegurar botón .menu-toggle fuera del nav
  let btn = header.querySelector('.menu-toggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-toggle';
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '☰';
    header.insertBefore(btn, nav);
  }

  const closeMenu = () => {
    nav.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '☰';
  };

  const openMenu = () => {
    nav.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    btn.innerHTML = '✕';
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (nav.classList.contains('active')) closeMenu();
    else openMenu();
  });

  // Cerrar al hacer click en un link o botón del menú
  wrap.addEventListener('click', (e) => {
    const el = e.target.closest('a,button');
    if (!el) return;
    closeMenu();
  });

  // Cerrar al hacer click por fuera
  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('active')) return;
    if (!header.contains(e.target)) closeMenu();
  });

  // Cerrar si volvemos a desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

// ========== NAV (FLECHAS) PARA CATEGORÍAS DESTACADAS ==========
function initFeaturedCatsNav() {
  const grid = document.getElementById('homeFeaturedCats');
  if (!grid) return;

  const scroller = grid.closest('.home-cats-scroller');
  if (!scroller) return;

  const btnPrev = scroller.querySelector('.home-cats-nav.prev');
  const btnNext = scroller.querySelector('.home-cats-nav.next');

  const step = () => Math.min(320, Math.max(220, grid.clientWidth * 0.8));
  const move = (dir) => grid.scrollBy({ left: dir * step(), behavior: 'smooth' });

  btnPrev?.addEventListener('click', () => move(-1));
  btnNext?.addEventListener('click', () => move(1));
}

// ========== LIMITE DE PUBLICIDAD EN HOME (VER MÁS) ==========
function initHomeAdsLimiter(maxItems = 8) {
  const grid = document.getElementById('homeAds');
  const btn = document.getElementById('btnAdsMore');
  if (!grid || !btn) return;

  const apply = () => {
    const items = Array.from(grid.children);
    if (items.length <= maxItems) {
      btn.classList.remove('show');
      items.forEach((el) => (el.style.display = ''));
      return;
    }
    items.forEach((el, i) => (el.style.display = i < maxItems ? '' : 'none'));
    btn.classList.add('show');
  };

  // ✅ PRO: en vez de “mostrar todo”, redirige a la página dedicada
  btn.addEventListener('click', () => {
    window.location.href = 'publicidad.html';
  });

  // observar cambios (cuando loadHomeAds llena el grid)
  const obs = new MutationObserver(() => apply());
  obs.observe(grid, { childList: true });

  // primera pasada
  apply();
}

document.addEventListener('DOMContentLoaded', async () => {
  // ========= PROTEGER ADMIN (si estamos en admin.html) =========
  try {
    await protectAdminPage();
  } catch (e) {
    console.error('Error en protección de admin:', e);
  }

  // ========= COSAS GLOBALES =========
  initMobileMenu();

  if (typeof bindHeaderButtons === 'function') {
    bindHeaderButtons();
  }
  if (typeof actualizarContadorCarrito === 'function') {
    actualizarContadorCarrito();
  }
  if (typeof injectFooter === 'function') {
    injectFooter();
  }

  const path = new URL(location.href).pathname;

  const isHome =
    isPage('index.html') ||
    path === '/' ||
    path.endsWith('/web/') ||
    path.endsWith('/Ecomerce%20version%20original/web/');

  // ========= HOME =========
  if (isHome) {
    if (typeof loadCatalogPage === 'function') loadCatalogPage();
    if (typeof loadHomeAds === 'function') loadHomeAds();
    if (typeof loadHomeProducts === 'function') loadHomeProducts();
    if (typeof initHeroSlider === 'function') initHeroSlider();

    // categorías destacadas (arriba)
    bindFeaturedHomeCategories();
    initFeaturedCatsNav();

    // publicidad limitada + botón => publicidad.html
    initHomeAdsLimiter(8);

    // si usas categorías dinámicas en algún bloque del home
    loadDynamicHomeCategories();
    bindStaticHomeCategories();
  }

  // ========= CARRITO =========
  if (isPage('carrito.html')) {
    if (typeof initCarritoPage === 'function') {
      initCarritoPage();
    } else {
      if (typeof mostrarCarrito === 'function') mostrarCarrito();
      if (typeof initCheckoutModal === 'function') initCheckoutModal();
    }
  }

  // ========= DETALLE PRODUCTO =========
  if (isPage('detalle-producto.html')) {
    if (typeof initDetalleProducto === 'function') initDetalleProducto();
    if (typeof initCheckoutModal === 'function') initCheckoutModal();
  }

  // ========= AUTH =========
  if (isPage('login.html')) {
    if (typeof bindLoginForm === 'function') bindLoginForm();
    if (typeof initChangePasswordForm === 'function') initChangePasswordForm();
  }
  if (isPage('forgot-password.html')) {
    if (typeof initForgotPasswordUI === 'function') initForgotPasswordUI();
  }
  if (isPage('reset-password.html')) {
    if (typeof initResetPasswordUI === 'function') initResetPasswordUI();
  }

  // ========= ADMIN =========
  if (isPage('admin.html')) {
    if (typeof applyRoleVisibility === 'function') applyRoleVisibility();
    if (typeof initAdminTabs === 'function') initAdminTabs();

    if (typeof adminLoadProducts === 'function') adminLoadProducts();
    if (typeof initNewProductForm === 'function') initNewProductForm();
    if (typeof bindEditProductModal === 'function') bindEditProductModal();

    if (typeof initVentasUI === 'function') initVentasUI();
    if (typeof initStatsUI === 'function') initStatsUI();
    if (typeof initPerfilUsuario === 'function') initPerfilUsuario();

    if (typeof initAdsAdminUI === 'function') initAdsAdminUI();
    if (typeof initUsersAdminUI === 'function') initUsersAdminUI();
    if (typeof initDomiciliosUI === 'function') initDomiciliosUI();
  }
});
