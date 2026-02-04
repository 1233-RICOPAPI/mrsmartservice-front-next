/* Helper estrellas (para reseñas) */
function renderStars(rating) {
  const val = Math.round(Number(rating) || 0);
  let html  = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= val ? 'star-full' : 'star-empty'}">★</span>`;
  }
  return `<span class="rating-stars">${html}</span>`;
}

/************ RESEÑAS DE PRODUCTO (con fallback localStorage) ************/
function lsKeyReviews(productId) {
  return `reviews_product_${productId}`;
}

async function fetchReviews(productId) {
  try {
    const data = await apiFetch(`/products/${productId}/reviews`, {
      headers: authHeaders()
    });

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;

    return [];
  } catch (e) {
    console.warn('Error cargando reseñas desde API, uso localStorage:', e);
  }

  try {
    const ls = localStorage.getItem(lsKeyReviews(productId));
    return ls ? JSON.parse(ls) : [];
  } catch {
    return [];
  }
}

function getOrCreateDeviceId() {
  const key = 'mr_device_id';
  try {
    let id = localStorage.getItem(key);
    if (!id || id.length < 8) {
      id = 'mr_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'mr_anon_' + Date.now();
  }
}

async function postReview(productId, body) {
  const payload = {
    author: body.name || body.author || 'Anónimo',
    rating: body.rating,
    comment: body.comment,
    device_id: getOrCreateDeviceId()
  };

  try {
    const data = await apiFetch(`/products/${productId}/reviews`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    return data;
  } catch (e) {
    if (e?.message && (e.message.includes('already_reviewed') || e.message.includes('409'))) {
      throw { status: 409, message: 'Ya has dejado una opinión para este producto. Solo se permite una calificación por producto.' };
    }
    console.warn('Error enviando reseña a la API, guardo en localStorage:', e);
    try {
      const lsKey = lsKeyReviews(productId);
      const ls    = localStorage.getItem(lsKey);
      const arr   = ls ? JSON.parse(ls) : [];
      arr.push({
        id: Date.now(),
        name: payload.author,
        rating: payload.rating,
        comment: payload.comment,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(lsKey, JSON.stringify(arr));
    } catch (err) {
      console.error('No se pudo guardar reseña en localStorage:', err);
    }
  }
}

function computeAverageRating(reviews) {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((a, r) => a + Number(r.rating || r.stars || 0), 0);
  return sum / reviews.length;
}

function renderReviewsUI(reviews) {
  const list    = document.getElementById('reviewsList');
  const summary = document.getElementById('ratingSummary');
  if (!list || !summary) return;

  const hasReviews  = reviews.length > 0;
  const avg         = computeAverageRating(reviews);
  const avgRounded  = hasReviews ? avg.toFixed(1) : '0.0';
  const countLabel  = hasReviews
    ? `(${reviews.length} opinión${reviews.length === 1 ? '' : 'es'})`
    : '(Sin opiniones)';

  summary.innerHTML = `
    <div class="rating-header">
      <span class="rating-number">${avgRounded}</span>
      ${renderStars(avg)}
      <span class="rating-count">${countLabel}</span>
    </div>
    ${
      !hasReviews
        ? `
          <p class="reviews-empty-title">
            Este producto aún no tiene opiniones.
          </p>
          <p class="reviews-empty-sub">
            Sé el primero en opinar sobre este producto.
          </p>
        `
        : ''
    }
  `;

  if (!hasReviews) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = reviews.map(r => {
    const name    = r.name || r.author_name || r.author || 'Anónimo';
    const comment = r.comment || r.text || '';
    const rating  = Number(r.rating || r.stars || 0);
    const created = r.created_at ? fmtDate(r.created_at) : '';

    return `
      <article class="review-item">
        <header class="review-head">
          <div class="review-left">
            <strong>${name}</strong>
            ${renderStars(rating)}
          </div>
          ${created ? `<span class="review-date">${created}</span>` : ''}
        </header>
        <p class="review-text">${comment}</p>
      </article>
    `;
  }).join('');
}

/* Estrellas clickeables para el input de calificación */
function initRatingInput() {
  const box    = document.getElementById('ratingStarsInput');
  const hidden = document.getElementById('reviewRating');
  if (!box || !hidden) return;

  const stars  = box.querySelectorAll('.rating-input-star');
  let current  = Number(hidden.value) || 0;

  const paint = (n) => {
    stars.forEach((s, idx) => {
      s.classList.toggle('on', idx < n);
    });
  };

  stars.forEach(star => {
    const val = Number(star.dataset.value || 0);

    star.addEventListener('mouseenter', () => paint(val));
    star.addEventListener('mouseleave', () => paint(current));
    star.addEventListener('click', () => {
      current      = val;
      hidden.value = String(val);
      paint(current);
    });
  });

  paint(current);
}

async function initReviews(productId) {
  const form         = document.getElementById('reviewForm');
  const nameInput    = document.getElementById('reviewName');
  const ratingInput  = document.getElementById('reviewRating');
  const commentInput = document.getElementById('reviewComment');

  async function loadAndRender() {
    const reviews = await fetchReviews(productId);
    renderReviewsUI(reviews);
  }

  await loadAndRender();

  if (form) {
    initRatingInput();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name    = (nameInput.value || '').trim();
      const rating  = Number(ratingInput.value);
      const comment = (commentInput.value || '').trim();

      if (!name || !rating || !comment) {
        showToast('Completa todos los campos de la reseña');
        return;
      }

      try {
        await postReview(productId, { name, rating, comment });
        showToast('¡Gracias por tu opinión!');
        form.reset();
      } catch (err) {
        if (err?.status === 409 || (err?.message && err.message.includes('Ya has dejado'))) {
          showToast(err?.message || 'Ya has dejado una opinión para este producto.', 'error');
          return;
        }
        throw err;
      }

      ratingInput.value = '';
      const box = document.getElementById('ratingStarsInput');
      if (box) {
        box.querySelectorAll('.rating-input-star').forEach(s => s.classList.remove('on'));
      }

      await loadAndRender();
    });
  }
}

/* ============ DETALLE DE PRODUCTO (app.js) ============ */
function initDetalleProducto() {
  const contenedor = document.getElementById('detalleProducto');
  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id') || 0);

  if (!id) {
    contenedor.innerHTML = '<p style="padding:2rem;">Producto no encontrado.</p>';
    return;
  }

  fetchProducts().then(productos => {
    const p = productos.find(pr => +pr.product_id === id);
    if (!p) {
      contenedor.innerHTML = '<p style="padding:2rem;">Producto no disponible.</p>';
      return;
    }

// Preparar datos
const mediaAll = (typeof parseMediaItems === 'function') ? parseMediaItems(p) : [];
const media = Array.isArray(mediaAll) ? mediaAll.slice(0, 6) : [];

// Thumb (para carrito/preview): primera imagen; si no hay, placeholder
const thumbItem = media.find(m => m && m.type === 'image' && m.url) || null;
const thumbUrl = thumbItem ? thumbItem.url : '';
const imgs = parseImages(p.image_url); // compat: para fallback
const img = thumbUrl ? resolveImg(thumbUrl) : (imgs.length ? resolveImg(imgs[0]) : 'https://via.placeholder.com/800x600?text=Producto');

const base = Number(p.price) || 0;
const desc = Number(p.discount_percent) || 0;
const final = Math.max(0, Math.round(base * (1 - desc / 100)));

// Datos simulados para la ficha técnica (puedes adaptarlos si vienen de tu DB)
const descripcion = p.description || `Este ${p.name} ofrece un rendimiento excepcional para sus necesidades diarias. Cuenta con la garantía y el respaldo de MR SmartService.`;

const fichaTecnica = [
  { k: "Condición", v: "Nuevo" },
  { k: "Categoría", v: p.category || "Tecnología" },
  { k: "SKU", v: `MR-${p.product_id}` },
  { k: "Stock", v: `${p.stock} unidades` },
  { k: "Garantía", v: "12 Meses directa" },
  { k: "Envío", v: "Nacional e Internacional" }
];

// --- HTML ESTRUCTURADO ---

    contenedor.innerHTML = `
      <div class="columna-izquierda">
        
        
<div class="detalle-gallery">
  <div class="detalle-gallery-main">
    ${
      media.length > 1
        ? '<button type="button" class="gal-arrow gal-prev" aria-label="Anterior">‹</button>'
        : ''
    }
    <div id="detalleMainMedia" class="detalle-main-media" aria-label="Multimedia del producto"></div>
    ${
      media.length > 1
        ? '<button type="button" class="gal-arrow gal-next" aria-label="Siguiente">›</button>'
        : ''
    }
  </div>
  ${
    media.length > 1
      ? `<div class="detalle-gallery-dots">${media.map((_, i) => `
            <button type="button" 
              class="gal-dot ${i === 0 ? 'active' : ''}" 
              data-i="${i}"></button>
          `).join('')}</div>`
      : ''
  }
</div>

        <div class="bloque-ficha">
          <h3>Descripción</h3>
          <p>${descripcion}</p>

          <h3>Características Principales</h3>
          <table class="tabla-zebra">
            <tbody>
              ${fichaTecnica.map(item => `
                <tr>
                  <th>${item.k}</th>
                  <td>${item.v}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="detalle-info">
        <h1>${p.name}</h1>
        <div class="detalle-marca">${p.category || 'Tecnología MR SmartService'}</div>
        
        <div class="precio-box">
          <div class="detalle-precio">${money(final)}</div>
          ${
            desc > 0
              ? `<div class="detalle-antes">Antes: <del>${money(base)}</del> <span class="pill-off">-${desc}% OFF</span></div>`
              : ''
          }
        </div>

        <div class="detalle-cuotas">
          <p>💳 con tus medios de pago favoritos.</p>
        </div>

        <div class="detalle-actions">
          <button class="btn-primario" data-id="${p.product_id}" id="btnComprarAhora">
            Comprar ahora
          </button>
          <button class="btn-secundario" data-id="${p.product_id}" id="btnAgregarDetalle">
            Agregar al carrito
          </button>
        </div>

        <div class="detalle-extra">
          <p>Stock disponible: <strong>${p.stock ?? 0}</strong> unidades.</p>
          <p>Envíos y entregas coordinadas directamente con MR SmartService.</p>
        </div>

        <hr class="divider">

        <div class="detalle-reviews">
          <h2>Opiniones de clientes</h2>
          <div id="ratingSummary" class="rating-summary"></div>
          <div id="reviewsList" class="reviews-list"></div>

          <div class="review-form-box">
            <h3>Deja tu opinión</h3>
            <form id="reviewForm" autocomplete="off">
              <div class="campo">
                <label for="reviewName">Tu nombre</label>
                <input type="text" id="reviewName" placeholder="Ej: Juan" required />
              </div>

              <div class="campo">
                <label>Calificación</label>
                <div id="ratingStarsInput" class="rating-input">
                  <span class="rating-input-star" data-value="1">★</span>
                  <span class="rating-input-star" data-value="2">★</span>
                  <span class="rating-input-star" data-value="3">★</span>
                  <span class="rating-input-star" data-value="4">★</span>
                  <span class="rating-input-star" data-value="5">★</span>
                </div>
                <input type="hidden" id="reviewRating" value="">
              </div>

              <div class="campo">
                <label for="reviewComment">Comentario</label>
                <textarea id="reviewComment" rows="3" placeholder="¿Qué te pareció este producto?" required></textarea>
              </div>

              <button type="submit" class="btn-primario full-width">Enviar opinión</button>
            </form>
          </div>
        </div>
      </div>
    `;

    // --- LÓGICA DE BOTONES Y GALERÍA ---
    const btnAdd = document.getElementById('btnAgregarDetalle');
    const btnBuy = document.getElementById('btnComprarAhora');

    if (btnAdd) {
      if (p.stock <= 0) {
        btnAdd.disabled = true;
        btnAdd.textContent = "Agotado";
      } else {
        btnAdd.onclick = () => {
          addToCart({ ...p, precio: final, imagen: img });
          showToast('Agregado al carrito');
          actualizarContadorCarrito();
        };
      }
    }

    if (btnBuy) {
      if (p.stock <= 0) btnBuy.disabled = true;
      else btnBuy.onclick = () => openCheckoutModal([{ ...p, precio: final, imagen: img, cant: 1 }]);
    }

// Lógica Galería (multimedia: imágenes + videos)
const stage = document.getElementById('detalleMainMedia');
const dots = document.querySelectorAll('.gal-dot');
const prevBtn = document.querySelector('.gal-prev');
const nextBtn = document.querySelector('.gal-next');

let currentIdx = 0;

const renderMediaAt = (index) => {
  if (!stage) return;

  // Fallback si no hay media: mostrar una imagen (img)
  if (!media.length) {
    stage.innerHTML = `<img src="${img}" alt="${escapeHtml(p.name)}" />`;
    return;
  }

  if (index < 0) index = media.length - 1;
  if (index >= media.length) index = 0;
  currentIdx = index;

  const item = media[currentIdx] || {};
  stage.innerHTML = buildProductMediaHTML(item, p.name);

  dots.forEach(d => d.classList.remove('active'));
  const activeDot = document.querySelector(`.gal-dot[data-i="${currentIdx}"]`);
  if (activeDot) activeDot.classList.add('active');
};

if (prevBtn) prevBtn.onclick = () => renderMediaAt(currentIdx - 1);
if (nextBtn) nextBtn.onclick = () => renderMediaAt(currentIdx + 1);

dots.forEach(dot => {
  dot.onclick = () => renderMediaAt(Number(dot.dataset.i));
});

// Inicializar
renderMediaAt(0);

// Swipe (mobile) + teclado (accesibilidad)
// Permite pasar de una imagen/video a otra deslizando.
try {
  let touchStartX = null;
  let touchStartY = null;
  const SWIPE_MIN_PX = 35;

  const onTouchStart = (e) => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  };

  const onTouchEnd = (e) => {
    if (touchStartX == null || touchStartY == null) return;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;

    // Evitar disparar swipe cuando el gesto fue más vertical que horizontal
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < SWIPE_MIN_PX) return;

    if (dx < 0) renderMediaAt(currentIdx + 1);
    else renderMediaAt(currentIdx - 1);
  };

  // Escuchamos sobre el contenedor principal para no pelear con el <video>/<iframe>
  const swipeTarget = document.querySelector('.detalle-gallery-main');
  if (swipeTarget) {
    swipeTarget.addEventListener('touchstart', onTouchStart, { passive: true });
    swipeTarget.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  window.addEventListener('keydown', (ev) => {
    if (!media || media.length <= 1) return;
    if (ev.key === 'ArrowLeft') renderMediaAt(currentIdx - 1);
    if (ev.key === 'ArrowRight') renderMediaAt(currentIdx + 1);
  });
} catch (e) {
  console.warn('Swipe gallery init failed:', e);
}

    // Inicializar reseñas
    initReviews(id);
  });
}


// Helpers para multimedia en detalle
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function buildProductMediaHTML(item, name) {
  const url = String(item && item.url ? item.url : '').trim();
  const type = String(item && item.type ? item.type : '').toLowerCase();
  const safeName = escapeHtml(name || 'Producto');

  if (!url) {
    return `<img src="https://via.placeholder.com/800x600?text=Producto" alt="${safeName}" />`;
  }

  const isYT = /youtube\.com|youtu\.be/i.test(url);

  if (type === 'video' || isYT || /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url)) {
    if (isYT) {
      const embed = toYouTubeEmbed(url);
      return `
        <div class="video-wrapper">
          <iframe
            src="${embed}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
    return `<video class="detalle-media" controls playsinline preload="metadata" src="${resolveImg(url)}"></video>`;
  }

  return `<img class="detalle-media" src="${resolveImg(url)}" alt="${safeName}" />`;
}
