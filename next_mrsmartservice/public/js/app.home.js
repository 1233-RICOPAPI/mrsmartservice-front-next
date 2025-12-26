/********************
 * MR SmartService - Home (header, productos destacados, categorías, slider)
 ********************/

/* ============== HOME: productos destacados (sección "homeProducts") ============== */
async function loadHomeProducts() {
  const wrap = document.getElementById('homeProducts');
  if (!wrap) return;

  try {
    const all = await fetchProducts();
    // Mostramos los primeros 8 productos como destacados
    renderCatalog(all.slice(0, 8), wrap);
  } catch (err) {
    console.error('Error cargando productos destacados:', err);
  }
}

/* ============== HOME: categorías dinámicas (sección "homeCategories") ============== */
async function loadHomeCategories() {
  const wrap = document.getElementById('homeCategories');
  if (!wrap) return;

  try {
    const all = await fetchProducts();

    const map = new Map();
    all.forEach((p) => {
      const cat = (p.category || 'General').trim();
      if (!map.has(cat)) {
        const imgs = parseImages(p.image_url);
        map.set(cat, resolveImg(imgs[0]));
      }
    });

    const cats = Array.from(map.entries()).slice(0, 8);

    wrap.innerHTML = cats
      .map(
        ([cat, img]) => `
      <article class="home-cat-card" data-cat="${cat}">
        <div class="home-cat-thumb">
          ${img ? `<img src="${img}" alt="${cat}">` : ''}
        </div>
        <div class="home-cat-name">${cat}</div>
      </article>
    `
      )
      .join('');

    // Al hacer click en una categoría, filtramos el catálogo
    wrap.querySelectorAll('.home-cat-card').forEach((card) => {
      card.addEventListener('click', () => {
        const cat = (card.dataset.cat || '').toLowerCase();

        const url = new URL('index.html', location.origin);
        url.searchParams.set('cat', cat);
        url.hash = 'catalogo';

        location.href = url.toString();
      });
    });
  } catch (err) {
    console.error('Error cargando categorías dinámicas:', err);
  }
}

/* ============== HEADER: botones globales (Login/Admin/Logout) ============== */
function bindHeaderButtons() {
  const adminBtn = document.getElementById('btnAdmin');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      if (getToken()) {
        location.href = 'admin.html';
      } else {
        location.href = 'login.html';
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      location.href = 'index.html';
    });
  }

  // Desde el panel admin ver la tienda en otra pestaña (si existe ese botón)
  const btnVerTienda = document.getElementById('btnVerTienda');
  if (btnVerTienda) {
    btnVerTienda.addEventListener('click', () => {
      window.open('index.html', '_blank');
    });
  }
}

/* ========== SLIDER HOME: botones + puntos + auto ========== */
function initHeroSlider() {
  const slides        = document.querySelectorAll('.slide');
  const dotsContainer = document.querySelector('.slider-dots');
  const btnPrev       = document.querySelector('.slider-btn.prev');
  const btnNext       = document.querySelector('.slider-btn.next');

  if (!slides.length || !dotsContainer || !btnPrev || !btnNext) return;

  let current = 0;
  let timer   = null;

  // Crear dots dinámicamente
  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className    = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.type         = 'button';
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.slider-dot');

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() {
    goTo(current + 1);
  }
  function prev() {
    goTo(current - 1);
  }

  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  btnNext.addEventListener('click', () => {
    next();
    resetTimer();
  });

  btnPrev.addEventListener('click', () => {
    prev();
    resetTimer();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const i = Number(dot.dataset.index || 0);
      goTo(i);
      resetTimer();
    });
  });

  // Arrancamos el slider
  resetTimer();
}
