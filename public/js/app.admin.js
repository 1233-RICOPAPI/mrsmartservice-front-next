/*
  // Por defecto: mostrar solo aprobadas
  try {
    if (selEstado && !selEstado.value) selEstado.value = 'approved';
  } catch {}

  // Botón para ver abandonos (initiated) solo para ADMIN/DEV
  if (btnVentasInitiated) {
    const role = String(window.adminCurrentUser?.role || '').toUpperCase();
    btnVentasInitiated.style.display = (role === 'ADMIN' || role === 'DEV') ? 'inline-flex' : 'none';
    btnVentasInitiated.addEventListener('click', () => {
      if (selEstado) selEstado.value = 'initiated';
      fetchVentas();
    });
  }
*******************
 * MR SmartService - Admin helpers globales
 ********************/

let adminCurrentUser = null;

/**
 * Obtiene el usuario logueado desde /api/me y lo deja en adminCurrentUser.
 * Requiere token válido (adminAuthHeaders()).
 */
async function fetchCurrentUser() {
  try {
    const res = await fetch(API + '/me', {
      headers: adminAuthHeaders()
    });

    if (!res.ok) {
      throw new Error('me_failed ' + res.status);
    }

    adminCurrentUser = await res.json();
    return adminCurrentUser;
  } catch (err) {
    console.error('Error al obtener usuario actual:', err);
    adminCurrentUser = null;
    throw err;
  }
}

/**
 * Construye headers de autorización con el token JWT, si existe.
 */
function adminAuthHeaders(extra = {}) {
  const t = getToken ? getToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...extra,
  };
}

/**
 * Wrapper simple de fetch para API admin.
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, options);
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Error API ${path}: ${res.status} ${msg}`);
  }
  return res.json();
}

/**
 * Toast genérico. Usa appShowToast si existe, si no, alert.
 */
function showToast(msg, type = 'info') {
  if (typeof window !== 'undefined' && typeof window.appShowToast === 'function') {
    window.appShowToast(msg, type);
  } else {
    alert(msg);
  }
}

/**
 * Confirm genérico. Usa appShowConfirm si existe, si no, confirm().
 */
function showConfirm({ title, message, onConfirm }) {
  if (typeof window !== 'undefined' && typeof window.appShowConfirm === 'function') {
    window.appShowConfirm({ title, message, onConfirm });
  } else {
    if (confirm(`${title}\n\n${message}`)) onConfirm && onConfirm();
  }
}



/********************
 * MULTIMEDIA (PRODUCTOS)
 ********************/
const ADMIN_MAX_MEDIA = 6;

function adminGuessMediaType(urlOrFile) {
  if (!urlOrFile) return 'image';
  if (typeof urlOrFile === 'string') {
    return (typeof guessMediaTypeFromUrl === 'function') ? guessMediaTypeFromUrl(urlOrFile) : (/youtube\.com|youtu\.be|\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(urlOrFile) ? 'video' : 'image');
  }
  const t = String(urlOrFile.type || '').toLowerCase();
  return t.startsWith('video/') ? 'video' : 'image';
}

function adminParseMediaFromProduct(prod) {
  try {
    if (typeof parseMediaItems === 'function') {
      return parseMediaItems(prod);
    }
  } catch {}

  // Fallback: legacy split
  const out = [];
  const push = (u, type) => {
    const url = String(u || '').trim();
    if (!url) return;
    out.push({ type: type || adminGuessMediaType(url), url });
  };

  const imgs = String(prod?.image_url || '').split(/[|,;\n]+/).map(s=>s.trim()).filter(Boolean);
  imgs.forEach(u=>push(u,'image'));
  const vids = String(prod?.video_url || '').split(/[|,;\n]+/).map(s=>s.trim()).filter(Boolean);
  vids.forEach(u=>push(u,'video'));
  return out.slice(0, ADMIN_MAX_MEDIA);
}

function adminUrlsFromTextarea(id) {
  const el = document.getElementById(id);
  const raw = (el && el.value) ? String(el.value) : '';
  return raw
    .split(/\r?\n+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function adminFilesFromInput(id) {
  const el = document.getElementById(id);
  const files = (el && el.files) ? Array.from(el.files) : [];
  return files;
}

async function adminUploadOneFile(file, folder) {
  // Subidas de productos: usar SIEMPRE el backend (/api/upload) para evitar
  // errores de permisos de Firebase Storage (storage/unauthorized) cuando
  // el panel está autenticado con JWT propio (admin/dev) y NO con Firebase Auth.
  //
  // Si algún día quieres volver a habilitar Firebase Storage, define:
  //   window.MR_USE_FIREBASE_STORAGE = true
  // en admin.html y asegúrate de tener reglas correctas + sesión Firebase.
  const canUseFirebase =
    !!window.MR_USE_FIREBASE_STORAGE &&
    window.MR &&
    typeof window.MR.uploadFileToFirebase === 'function' &&
    typeof window.MR.firebaseIsSignedIn === 'function' &&
    window.MR.firebaseIsSignedIn();

  if (canUseFirebase) {
    const url = await window.MR.uploadFileToFirebase(file, folder);
    return url || '';
  }

  // Backend /api/upload (recomendado)
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(API + '/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    console.error('adminUploadOneFile failed:', res.status, err);
    throw new Error((err && (err.message || err.error)) || ('Error subiendo archivo (' + res.status + ')'));
  }

  const data = await res.json().catch(()=>({}));
  return data.url || '';
}

async function adminUploadFiles(files, folder, limit) {
  const out = [];
  const list = (files || []).slice(0, Math.max(0, limit || ADMIN_MAX_MEDIA));
  for (const f of list) {
    const url = await adminUploadOneFile(f, folder);
    if (url) {
      out.push({ type: adminGuessMediaType(f), url });
    }
  }
  return out;
}

function adminBuildMediaList({ urlLines, files }) {
  const out = [];
  for (const u of (urlLines || [])) {
    out.push({ type: adminGuessMediaType(u), url: String(u).trim() });
    if (out.length >= ADMIN_MAX_MEDIA) break;
  }

  // Los archivos siempre se agregan al final, en el orden seleccionado
  const remaining = ADMIN_MAX_MEDIA - out.length;
  return { base: out, remaining };
}

function adminPickThumbUrl(mediaItems) {
  const items = Array.isArray(mediaItems) ? mediaItems : [];
  const img = items.find(m => m && m.type === 'image' && m.url);
  return img ? img.url : 'images/placeholder.jpg';
}
/********************
 * ADMIN STATS / VENTAS
 ********************/

/********************
 * ADMIN STATS / VENTAS (KPIs)
 ********************/
async function initStatsUI() {
  const rangeSelect = document.getElementById('statsRange');
  const btnStats    = document.getElementById('btnStats');
  const kpiIngresos = document.getElementById('kpiIngresos');
  const kpiOrdenes  = document.getElementById('kpiOrdenes');
  const kpiTicket   = document.getElementById('kpiTicket');
  const kpiRate     = document.getElementById('kpiRate');
  const bars        = document.getElementById('barsVentas');

  if (!rangeSelect || !btnStats || !kpiIngresos || !kpiOrdenes || !kpiTicket || !kpiRate || !bars) {
    return;
  }

  async function loadStats() {
    const range = rangeSelect.value || 'month';

    try {
      const data = await apiFetch(`/stats/sales?range=${encodeURIComponent(range)}`, {
        headers: adminAuthHeaders(),
      });

      kpiIngresos.textContent = money(data.ingresos || 0);
      kpiOrdenes.textContent  = String(data.ordenes || 0);
      kpiTicket.textContent   = '$' + money(data.ticket || 0);
      kpiRate.textContent     = (data.rate || 0) + '%';

      if (Array.isArray(data.series) && data.series.length) {
        bars.innerHTML = data.series
          .map((p) => {
            const value = Number(p.value || 0);
            // % relativo para el ancho de la barrita
            const max   = Math.max(...data.series.map(s => Number(s.value || 0) || 0), 1);
            const pct   = Math.round((value / max) * 100);

            return `
              <div class="mini-bar">
                <span class="mini-bar-label">${p.label}</span>
                <div class="mini-bar-track">
                  <div class="mini-bar-fill" style="width:${pct}%;"></div>
                </div>
                <span class="mini-bar-value">${money(value)}</span>
              </div>
            `;
          })
          .join('');
      } else {
        bars.innerHTML = '<p>No hay datos para este rango.</p>';
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      bars.innerHTML = '<p>Error cargando estadísticas.</p>';
    }
  }

  btnStats.addEventListener('click', (e) => {
    e.preventDefault();
    loadStats();
  });

  // carga inicial
  loadStats();
}

async function initVentasUI() {
  const tbody        = document.getElementById('ventasBody');
  const empty        = document.getElementById('ventasEmpty');
  const formFiltros  = document.getElementById('filtrosVentas');
  const infoVentas   = document.getElementById('infoVentas');
  const btnPrev      = document.getElementById('prevVentas');
  const btnNext      = document.getElementById('nextVentas');

  if (!tbody || !formFiltros) return;

  let currentPage = 1;

  async function cargarVentas(page = 1) {
    const desde   = document.getElementById('ventaDesde')?.value || '';
    const hasta   = document.getElementById('ventaHasta')?.value || '';
    const estado  = document.getElementById('ventaEstado')?.value || 'todos';
    const query   = document.getElementById('ventaQuery')?.value.trim() || '';

    const params = new URLSearchParams();
    if (estado && estado !== 'todos') params.set('status', estado);
    if (query) params.set('q', query);
    if (desde) params.set('from', desde);
    if (hasta) params.set('to', hasta);

    try {
      const data = await apiFetch('/orders?' + params.toString(), {
        headers: adminAuthHeaders(),
      });

      // Soportar formato [ ... ] o { rows, totalPages }
      const rows  = Array.isArray(data) ? data : (data.rows || []);
      const pages = data.totalPages || 1;

      if (!rows.length) {
        tbody.innerHTML = '';
        if (empty) empty.hidden = false;
      } else {
        if (empty) empty.hidden = true;
        tbody.innerHTML = rows
          .map((o) => {
            const fecha = o.created_at
              ? new Date(o.created_at).toLocaleString('es-CO')
              : '';
            const total = money(o.total_amount || 0);
            const cliente = o.domicilio_nombre || o.email || '-';

            return `
              <tr>
                <td>${fecha}</td>
                <td>${o.order_id}</td>
                <td>${cliente}</td>
                <td>${total}</td>
                <td>${o.status}</td>
                <td class="right">
                  <!-- aquí podrías poner botón "Ver detalle" si quieres -->
                </td>
              </tr>
            `;
          })
          .join('');
      }

      currentPage = Math.min(Math.max(page, 1), pages || 1);
      if (infoVentas) {
        infoVentas.textContent = `Página ${currentPage} de ${pages || 1}`;
      }
    } catch (err) {
      console.error('Error cargando ventas:', err);
      tbody.innerHTML = `
        <tr><td colspan="6">Error cargando ventas.</td></tr>
      `;
      if (empty) empty.hidden = true;
      if (infoVentas) infoVentas.textContent = 'Página 1 de 1';
    }
  }

  formFiltros.addEventListener('submit', (e) => {
    e.preventDefault();
    cargarVentas(1);
  });

  btnPrev?.addEventListener('click', () => {
    if (currentPage > 1) cargarVentas(currentPage - 1);
  });
  btnNext?.addEventListener('click', () => {
    cargarVentas(currentPage + 1);
  });

  // primera carga
  cargarVentas(1);
}


/********************
 * ADMIN PERFIL / CAMBIO DE CONTRASEÑA
 ********************/

function initPerfilUsuario() {
  // Coincide con admin.html
  const form = document.getElementById('formChangePassword');
  if (!form) return;

  const msgEl = document.getElementById('changePassMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById('oldPassword')?.value || '';
    const newPassword = document.getElementById('newPassword')?.value || '';
    const newPassword2 = document.getElementById('newPassword2')?.value || '';

    const setMsg = (txt, ok = false) => {
      if (msgEl) {
        msgEl.textContent = txt;
        msgEl.style.color = ok ? '#16a34a' : '#dc2626';
      } else {
        showToast(txt, ok ? 'success' : 'error');
      }
    };

    if (!oldPassword || !newPassword || !newPassword2) {
      setMsg('Completa todos los campos de contraseña');
      return;
    }
    if (newPassword !== newPassword2) {
      setMsg('Las nuevas contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setMsg('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const res = await fetch(API + '/users/change-password', {
        method: 'POST',
        headers: adminAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'invalid_password') {
          setMsg('La contraseña actual no es correcta');
        } else if (data.error === 'weak_password') {
          setMsg('La nueva contraseña es muy débil');
        } else {
          setMsg('No se pudo cambiar la contraseña');
        }
        return;
      }

      setMsg('Contraseña actualizada correctamente', true);
      form.reset();
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      setMsg('Error de conexión al cambiar la contraseña');
    }
  });
}

// Compat: el panel llama initProfileAdminUI, pero la función real aquí es initPerfilUsuario
function initProfileAdminUI() {
  initPerfilUsuario();
}

/********************
 * ADMIN PUBLICIDAD (ADS)
 ********************/

let adminAdsCache = [];

async function adminFetchAds() {
  const res = await fetch(API + '/ads/all', {
    headers: adminAuthHeaders(),
  });

  if (!res.ok) throw new Error('ads_failed');
  return res.json();
}

function renderAdsTable(list) {
  const tbody = document.getElementById('adsTableBody');
  const empty = document.getElementById('adsEmpty');
  if (!tbody) return;

  if (!Array.isArray(list) || !list.length) {
    tbody.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  tbody.innerHTML = list
    .map((ad) => {
      const created = ad.created_at
        ? new Date(ad.created_at).toLocaleString('es-CO')
        : '';
      const statusLabel = ad.active ? 'Activo' : 'Inactivo';
      return `
        <tr data-id="${ad.ad_id}">
          <td>${ad.ad_id}</td>
          <td>${ad.title}</td>
          <td>${statusLabel}</td>
          <td>${created}</td>
          <td class="right">
            <button type="button" class="btn btn-light btn-sm" data-op="edit">Editar</button>
            <button type="button" class="btn btn-light btn-sm" data-op="toggle">
              ${ad.active ? 'Desactivar' : 'Activar'}
            </button>
            <button type="button" class="btn btn-danger btn-sm" data-op="delete">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

async function loadAdsAdminUI() {
  try {
    adminAdsCache = await adminFetchAds();
    renderAdsTable(adminAdsCache);
  } catch (err) {
    console.error('Error cargando ads admin:', err);
    const tbody = document.getElementById('adsTableBody');
    const empty = document.getElementById('adsEmpty');
    if (tbody) tbody.innerHTML = '';
    if (empty) {
      empty.hidden = false;
      empty.textContent = 'Error cargando anuncios.';
    }
  }
}

function initAdsAdminUI() {
  const form     = document.getElementById('formAds');
  const tbody    = document.getElementById('adsTableBody');
  const resetBtn = document.getElementById('adResetBtn');
  if (!form || !tbody) return;

  const idField     = document.getElementById('adId');
  const titleField  = document.getElementById('adTitle');
  const descField   = document.getElementById('adDesc');
  const imgField    = document.getElementById('adImageUrl');
  const vidField    = document.getElementById('adVideoUrl');
  const activeField = document.getElementById('adActive');

  function resetForm() {
    form.reset();
    if (idField) idField.value = '';
    const fImg = document.getElementById('adImageFile');
    const fVid = document.getElementById('adVideoFile');
    if (fImg) fImg.value = '';
    if (fVid) fVid.value = '';
  }

  resetBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    resetForm();
  });

  // Sube imagen / video del anuncio a /api/upload (Cloudinary)
  async function uploadAdFile(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) return null;

    const fd = new FormData();
    fd.append('image', input.files[0]); // el backend acepta image/video

    try {
      const res = await fetch(API + '/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: fd,
      });
      if (!res.ok) throw new Error('upload_failed');
      const data = await res.json();
      return data.url || null;
    } catch (err) {
      console.error('Error subiendo archivo de anuncio:', err);
      showToast('Error subiendo archivo del anuncio', 'error');
      return null;
    }
  }

  // Crear / actualizar anuncio
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleField?.value.trim() || '';
    const desc  = descField?.value.trim() || '';

    // 1) Valores escritos por el admin
    let img = imgField?.value.trim() || '';
    let vid = vidField?.value.trim() || '';
    const active = activeField?.checked ?? true;

    if (!title) {
      showToast('El título del anuncio es obligatorio', 'error');
      return;
    }

    // 2) Si hay archivos seleccionados, los subimos y usamos esas URLs
    const uploadedImg = await uploadAdFile('adImageFile');
    if (uploadedImg) img = uploadedImg;

    const uploadedVid = await uploadAdFile('adVideoFile');
    if (uploadedVid) vid = uploadedVid;

    const isEdit = idField && idField.value;
    const url    = isEdit ? `${API}/ads/${idField.value}` : API + '/ads';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: adminAuthHeaders(),
        body: JSON.stringify({
        title,
        description: desc,
        image_url: img,
        video_url: vid,
        active,
        }),
      });

      if (!res.ok) throw new Error('ads_save_failed');

      showToast(isEdit ? 'Anuncio actualizado' : 'Anuncio creado', 'success');
      resetForm();
      await loadAdsAdminUI();
    } catch (err) {
      console.error('Error guardando anuncio:', err);
      showToast('No se pudo guardar el anuncio', 'error');
    }
  });

  // Acciones sobre la tabla (editar / activar / eliminar)
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-op]');
    if (!btn) return;

    const tr = btn.closest('tr');
    const id = tr?.dataset.id;
    if (!id) return;

    const ad = adminAdsCache.find((a) => String(a.ad_id) === String(id));
    const op = btn.dataset.op;

    if (op === 'edit' && ad) {
      if (idField) idField.value     = ad.ad_id;
      if (titleField) titleField.value = ad.title || '';
      if (descField) descField.value   = ad.description || '';
      if (imgField) imgField.value     = ad.image_url || '';
      if (vidField) vidField.value     = ad.video_url || '';
      if (activeField) activeField.checked = !!ad.active;
      window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
      return;
    }

    if (op === 'toggle') {
      const nextActive = !ad?.active;
      try {
        const res = await fetch(`${API}/ads/${id}`, {
          method: 'PUT',
          headers: adminAuthHeaders(),
          body: JSON.stringify({ active: nextActive }),
        });
        if (!res.ok) throw new Error('ads_update_failed');
        showToast('Anuncio actualizado', 'success');
        await loadAdsAdminUI();
      } catch (err) {
        console.error('Error actualizando anuncio:', err);
        showToast('No se pudo actualizar el anuncio', 'error');
      }
      return;
    }

    if (op === 'delete') {
      showConfirm({
        title: 'Eliminar anuncio',
        message: '¿Seguro que quieres eliminar este anuncio?',
        onConfirm: async () => {
          try {
            const res = await fetch(`${API}/ads/${id}`, {
              method: 'DELETE',
              headers: adminAuthHeaders(),
            });
            if (!res.ok) throw new Error('ads_delete_failed');
            showToast('Anuncio eliminado', 'success');
            await loadAdsAdminUI();
          } catch (err) {
            console.error('Error eliminando anuncio:', err);
            showToast('No se pudo eliminar el anuncio', 'error');
          }
        },
      });
    }
  });

  // Cargar lista inicial
  loadAdsAdminUI();
}



/********************
 * ADMIN PRODUCTOS
 ********************/

// Helpers offline (cache de productos para fallback)
function getOffline() {
  try {
    return JSON.parse(localStorage.getItem('__admin_products_offline') || '[]');
  } catch {
    return [];
  }
}
function setOffline(arr) {
  try {
    localStorage.setItem('__admin_products_offline', JSON.stringify(arr || []));
  } catch {}
}

async function fetchProducts() {
  try {
    const res = await fetch(API + '/products');
    if (!res.ok) throw new Error('api');
    const data = await res.json();
    setOffline(data);
    return data;
  } catch {
    return getOffline();
  }
}

async function saveProd(id, body) {
  try {
    const res = await fetch(`${API}/products/${id}`, {
      method: 'PUT', headers: adminAuthHeaders(), body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('api');
  } catch {
    const arr = getOffline() || [];
    const i   = arr.findIndex(p => +p.product_id === +id);
    if (i !== -1) arr[i] = { ...arr[i], ...body };
    setOffline(arr);
  }
  adminLoadProducts(true);
}

async function delProd(id) {
  showConfirm({
    title: 'Eliminar producto',
    message: '¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.',
    onConfirm: async () => {
      try {
        const res = await fetch(`${API}/products/${id}`, {
          method: 'DELETE', headers: adminAuthHeaders()
        });
        if (!res.ok) throw new Error('api');
      } catch {
        const arr = getOffline() || [];
        const i   = arr.findIndex(p => +p.product_id === +id);
        if (i !== -1) {
          arr.splice(i, 1);
          setOffline(arr);
        }
      }
      adminLoadProducts(true);
    }
  });
}

async function createProd(body) {
  try {
    const res = await fetch(`${API}/products`, {
      method: 'POST', headers: adminAuthHeaders(), body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('api');
  } catch {
    const arr    = getOffline() || [];
    const nextId = arr.length ? Math.max(...arr.map(p => +p.product_id || 0)) + 1 : 1;
    arr.unshift({
      product_id: nextId,
      name: body.name,
      price: Number(body.price) || 0,
      stock: Number(body.stock) || 0,
      discount_percent: Number(body.discount_percent) || 0,
      image_url: body.image_url || '',
      category: body.category || 'General',
      active: true,
      description: body.description || '',
      tech_sheet: body.tech_sheet || ''
    });
    setOffline(arr);
  }
  adminLoadProducts(true);
}

// ==========================
// ADMIN: filtro de productos (búsqueda + categoría)
// ==========================
let adminProductsCache = null;

function adminNormalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function ensureAdminProductsFilterBar() {
  const list = document.getElementById('listaAdmin');
  if (!list) return null;

  // ya existe
  let bar = document.getElementById('adminProductsFilterBar');
  if (bar) return bar;

  bar = document.createElement('div');
  bar.id = 'adminProductsFilterBar';
  bar.className = 'admin-products-toolbar';

  bar.innerHTML = `
    <div class="field grow">
      <label for="adminProdQuery">Buscar productos</label>
      <input id="adminProdQuery" type="search" placeholder="Nombre, categoría, descripción o ID..." autocomplete="off">
    </div>

    <div class="field">
      <label for="adminProdCat">Categoría</label>
      <select id="adminProdCat">
        <option value="todos">Todas</option>
      </select>
    </div>

    <div id="adminProdCount" class="admin-products-count"></div>
  `;

  // Insertar justo encima de la lista
  list.parentElement?.insertBefore(bar, list);

  // Bind (una sola vez)
  const q = bar.querySelector('#adminProdQuery');
  const c = bar.querySelector('#adminProdCat');

  const rerender = () => adminLoadProducts(false); // usa cache

  // debounce simple
  let t;
  q?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(rerender, 180);
  });
  c?.addEventListener('change', rerender);

  return bar;
}

function adminApplyProductsFilter(all) {
  const qEl = document.getElementById('adminProdQuery');
  const cEl = document.getElementById('adminProdCat');

  const qRaw = adminNormalizeText(qEl?.value || '');
  const cat  = adminNormalizeText(cEl?.value || 'todos');

  let out = Array.isArray(all) ? [...all] : [];

  if (cat && cat !== 'todos') {
    out = out.filter(p => adminNormalizeText(p.category || 'general') === cat);
  }

  if (qRaw) {
    out = out.filter(p => {
      const hay = adminNormalizeText(
        `${p.product_id || ''} ${p.name || ''} ${p.category || ''} ${p.description || ''}`
      );
      return hay.includes(qRaw);
    });
  }

  return out;
}

function adminSyncCategoryOptions(all) {
  const sel = document.getElementById('adminProdCat');
  if (!sel) return;

  const current = adminNormalizeText(sel.value || 'todos');

  const cats = Array.from(
    new Set((all || []).map(p => (p.category || 'General').trim()).filter(Boolean))
  ).sort((a,b) => adminNormalizeText(a).localeCompare(adminNormalizeText(b)));

  // Reconstruir (mantener "Todos")
  sel.innerHTML = '<option value="todos">Todas</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');

  // Restaurar selección si existe
  const opt = Array.from(sel.options).find(o => adminNormalizeText(o.value) === current);
  if (opt) sel.value = opt.value;
  else sel.value = 'todos';
}

async function adminLoadProducts(forceFetch = false) {
  const rows  = document.getElementById('productsTbody'); // por si algún día usas tabla
  const cards = document.getElementById('listaAdmin');    // <-- este es el contenedor real
// Asegurar barra de filtros (se inyecta si hace falta)
ensureAdminProductsFilterBar();

// Cache: solo volvemos a pedir a la API cuando se requiere
if (forceFetch || !Array.isArray(adminProductsCache)) {
  adminProductsCache = await fetchProducts();
}

const allDataRaw = Array.isArray(adminProductsCache) ? adminProductsCache : [];
  // Normalizamos IDs por si viene data vieja (id vs product_id) o cache corrupta
  const allData = allDataRaw.map((p) => {
    const pid = (p && (p.product_id ?? p.id ?? p.productId ?? p.productID));
    const num = Number(pid);
    return {
      ...p,
      product_id: Number.isFinite(num) ? num : (p?.product_id ?? p?.id ?? pid),
    };
  });

  // Aviso si hay productos sin ID válido (no se podrán editar/eliminar)
  const invalidIds = allData.filter(p => !Number.isFinite(Number(p.product_id)));
  if (invalidIds.length && !window.__warnedInvalidProductIds) {
    window.__warnedInvalidProductIds = true;
    console.warn('Productos con ID inválido (posible cache vieja):', invalidIds);
    showToast('Hay productos con ID inválido. Limpia cache (localStorage) si no puedes editar/eliminar.', 'error');
  }
adminSyncCategoryOptions(allData);

const data = adminApplyProductsFilter(allData);

  // 🔹 helper: saber si es USER (solo ver, sin editar)
  const roleUpper = adminCurrentUser ? String(adminCurrentUser.role).toUpperCase() : '';
  const isUser    = roleUpper === 'USER';

  if (cards) {
    cards.innerHTML = data.map(p => {
      const media = adminParseMediaFromProduct(p);
      const firstImage = media.find(m => m.type === 'image' && m.url) || null;
      const img  = firstImage ? resolveImg(firstImage.url) : 'https://via.placeholder.com/300x200?text=Producto';

      // ⭐ RATING
      const rating = Number(p.avg_rating || 0);
      const ratingCount = Number(p.review_count || 0);

      const fullStars  = '★'.repeat(Math.round(rating));
      const emptyStars = '☆'.repeat(5 - Math.round(rating));
      const ratingHtml = ratingCount
        ? `<div class="prod-rating">
             <span class="stars">${fullStars}${emptyStars}</span>
             <span class="count">(${ratingCount})</span>
           </div>`
        : `<div class="prod-rating prod-rating-empty">
             <span class="stars">☆☆☆☆☆</span>
             <span class="count">Sin reseñas</span>
           </div>`;

      // 🔹 botones de editar/eliminar SOLO para admin/dev, NO para USER
      const adminButtons = !isUser
        ? `
          <button class="btn btn-sm btn-primary editar" data-id="${p.product_id}">Editar</button>
          <button class="btn btn-sm btn-danger eliminar" data-id="${p.product_id}">Eliminar</button>
        `
        : `
          <small class="text-muted">Sin permisos para editar</small>
        `;

      return `
        <div class="product-card" data-id="${p.product_id}">
          <div class="product-card-img">
            <img src="${img}" alt="${p.name}">
          </div>
          <div class="product-card-body">
            <h3>${p.name}</h3>
            <p class="prod-cat">${p.category || 'General'}</p>
            <p class="prod-price">${money(p.price || 0)}</p>
            <p class="prod-stock">Stock: ${p.stock || 0}</p>
            <p class="prod-desc">${p.description || ''}</p>
            ${ratingHtml}
            <div class="product-card-actions">
              ${adminButtons}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // contador (filtrados vs total)
    const countEl = document.getElementById('adminProdCount');
    if (countEl) countEl.textContent = `${data.length} / ${allData.length}`;


    // Eventos en modo cards
    if (!isUser) {
      cards.onclick = (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const card = btn.closest('.product-card');
        if (!card) return;
        const id = Number(card.dataset.id);
      if (!Number.isFinite(id)) {
        showToast('Este producto no tiene ID válido (posible cache vieja).', 'error');
        return;
      }

        if (btn.classList.contains('eliminar')) {
          delProd(id);
        }
        if (btn.classList.contains('editar')) {
          const prod = allData.find(p => +p.product_id === id);
          if (prod) openEditProductModal(prod);
        }
      };
    } else {
      // aseguramos que no queden handlers viejos
      cards.onclick = null;
    }

    return;
  }

  if (rows) {
    rows.innerHTML = data.map(p => `
      <tr data-id="${p.product_id}">
        <td>${p.product_id}</td>
        <td><input value="${p.name}" data-f="name" class="form-control form-control-sm"></td>
        <td><input type="number" value="${p.price}" data-f="price" class="form-control form-control-sm"></td>
        <td><input type="number" value="${p.stock}" data-f="stock" class="form-control form-control-sm"></td>
        <td><input type="number" value="${p.discount_percent || 0}" data-f="discount_percent" class="form-control form-control-sm"></td>
        <td><input value="${p.category || ''}" data-f="category" class="form-control form-control-sm"></td>
        <td><input value="${p.image_url || ''}" data-f="image_url" class="form-control form-control-sm"></td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-primary btn-save">Guardar</button>
          <button class="btn btn-sm btn-danger btn-del">Eliminar</button>
        </td>
      </tr>`).join('');

    rows.onclick = async (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      const id = +tr.dataset.id;
      if (e.target.classList.contains('btn-del')) await delProd(id);
      if (e.target.classList.contains('btn-save')) {
        const b = {};
        tr.querySelectorAll('input').forEach(i => {
          b[i.dataset.f] = i.type === 'number' ? +i.value : i.value;
        });
        await saveProd(id, b);
      }
    };
  }
}


async function uploadImage() {
  // Soportar ambos ids por si acaso
  const fileInput =
    document.getElementById('imageFile') ||
    document.getElementById('imgFile');

  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    const urlField = document.getElementById('imageUrl');
    if (urlField && urlField.value.trim()) {
      return urlField.value.trim();
    }
    return '';
  }

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    const res = await fetch(API + '/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!res.ok) {
    const err = await res.json().catch(() => null);
    console.error('uploadImage failed:', res.status, err);
    showToast((err && (err.message || err.error)) || ('Error subiendo archivo (' + res.status + ')'), 'error');
    return '';
  }

    const data = await res.json();
    const url = data.url || '';
    const urlField = document.getElementById('imageUrl');
    if (urlField) urlField.value = url;
    return url;
  } catch (err) {
    console.error('Error uploadImage:', err);
    showToast('Error de conexión al subir imagen', 'error');
    return '';
  }
}


async function uploadVideo() {
  const fileInput = document.getElementById('videoFile');
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    const urlField = document.getElementById('videoUrl');
    if (urlField && urlField.value.trim()) {
      return urlField.value.trim();
    }
    return '';
  }

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    const res = await fetch(API + '/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!res.ok) {
    const err = await res.json().catch(() => null);
    console.error('uploadVideo failed:', res.status, err);
    showToast((err && (err.message || err.error)) || ('Error subiendo archivo (' + res.status + ')'), 'error');
    return '';
  }

    const data = await res.json();
    const url = data.url || '';
    const urlField = document.getElementById('videoUrl');
    if (urlField) urlField.value = url;
    return url;
  } catch (err) {
    console.error('Error uploadVideo:', err);
    showToast('Error de conexión al subir video', 'error');
    return '';
  }
}


async function initNewProductForm() {
  const form = document.getElementById('formProducto');
  if (!form) return;

  // Aviso si seleccionan más de 6 archivos
  const mf = document.getElementById('mediaFiles');
  if (mf) {
    mf.addEventListener('change', () => {
      const n = mf.files ? mf.files.length : 0;
      if (n > ADMIN_MAX_MEDIA) {
        showToast(`Máximo ${ADMIN_MAX_MEDIA} archivos por producto. Se subirán los primeros ${ADMIN_MAX_MEDIA}.`, 'info');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name  = document.getElementById('nombre')?.value || '';
    const cat   = document.getElementById('categoria')?.value || 'General';
    const price = Number(document.getElementById('precio')?.value || 0);
    const stock = Number(document.getElementById('stock')?.value || 0);

    const discount_percent = Number(document.getElementById('discount')?.value || 0);
    const discount_start   = document.getElementById('discountStart')?.value || null;
    const discount_end     = document.getElementById('discountEnd')?.value || null;

    const description = document.getElementById('description')?.value || '';
    const tech_sheet  = document.getElementById('tech_sheet')?.value || '';

    // Multimedia (nuevo): URLs + archivos (máx. 6 total, guardado en orden)
    const urlLines = adminUrlsFromTextarea('mediaUrls');
    const files    = adminFilesFromInput('mediaFiles');

    const { base, remaining } = adminBuildMediaList({ urlLines, files });

    let uploaded = [];
    try {
      if (remaining > 0 && files.length) {
        uploaded = await adminUploadFiles(files, 'products', remaining);
      }
    } catch (err) {
      console.error('Error subiendo multimedia:', err);
      showToast(err?.message || 'Error subiendo archivos', 'error');
      return;
    }

    const media = [...base, ...uploaded].slice(0, ADMIN_MAX_MEDIA);

    // Compatibilidad: si no usaron el nuevo campo, usamos los campos antiguos
    let image_url = '';
    let video_url = '';

    if (media.length) {
      image_url = JSON.stringify(media);
      video_url = '';
    } else {
      // legacy
      const legacyImg = await uploadImage();
      const legacyVid = await uploadVideo();
      image_url = legacyImg;
      video_url = legacyVid;
    }

    const body = {
      name,
      category: cat,
      price,
      stock,
      description,
      tech_sheet,
      discount_percent,
      discount_start,
      discount_end,
      image_url,
      video_url,
    };

    try {
      await createProd(body);
      showToast('Producto creado', 'success');
      form.reset();
      // limpiar multimedia nueva
      const mu = document.getElementById('mediaUrls');
      const mf = document.getElementById('mediaFiles');
      if (mu) mu.value = '';
      if (mf) mf.value = '';

      adminLoadProducts(true);
    } catch (err) {
      console.error('Error creando producto:', err);
      showToast('Error creando producto', 'error');
    }
  });
}




function openEditProductModal(prod) {
  const modal = document.getElementById('modalEditProd');
  if (!modal) return;

  // Fill
  document.getElementById('editName').value        = prod.name || '';
  document.getElementById('editCategory').value    = prod.category || '';
  document.getElementById('editPrice').value       = prod.price || 0;
  document.getElementById('editStock').value       = prod.stock || 0;
  document.getElementById('editDescripcion').value = prod.description || '';
  document.getElementById('editSpecs').value       = prod.tech_sheet || '';

  const ds = document.getElementById('editDiscountStart');
  const de = document.getElementById('editDiscountEnd');
  const dp = document.getElementById('editDiscountPercent');

  if (dp) dp.value = Number(prod.discount_percent || 0);
  if (ds) ds.value = prod.discount_start ? String(prod.discount_start).slice(0, 10) : '';
  if (de) de.value = prod.discount_end ? String(prod.discount_end).slice(0, 10) : '';

  // Multimedia: prellenar en el orden guardado
  const media = adminParseMediaFromProduct(prod);
  const urls  = media.map(m => m.url).filter(Boolean);

  const editUrls = document.getElementById('editMediaUrls');
  if (editUrls) editUrls.value = urls.join('\n');

  const editFiles = document.getElementById('editMediaFiles');
  if (editFiles) editFiles.value = '';

  // Guardar id en dataset
  modal.dataset.prodId = String(prod.product_id);

  // Mostrar
  modal.classList.remove('hidden');
}



function bindEditProductModal() {
  const modal = document.getElementById('modalEditProd');
  const form  = document.getElementById('formEditProd');
  if (!modal || !form) return;

  const cancel = document.getElementById('editCancel');
  if (cancel) cancel.addEventListener('click', () => modal.classList.add('hidden'));

  // Aviso si seleccionan más de 6 archivos
  const editMf = document.getElementById('editMediaFiles');
  if (editMf) {
    editMf.addEventListener('change', () => {
      const n = editMf.files ? editMf.files.length : 0;
      if (n > ADMIN_MAX_MEDIA) {
        showToast(`Máximo ${ADMIN_MAX_MEDIA} archivos por producto. Se subirán los primeros ${ADMIN_MAX_MEDIA}.`, 'info');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = modal.dataset.prodId;
    if (!id) return;

    const name  = document.getElementById('editName')?.value || '';
    const category = document.getElementById('editCategory')?.value || '';
    const price = Number(document.getElementById('editPrice')?.value || 0);
    const stock = Number(document.getElementById('editStock')?.value || 0);

    const description = document.getElementById('editDescripcion')?.value || '';
    const tech_sheet  = document.getElementById('editSpecs')?.value || '';

    const discount_percent = Number(document.getElementById('editDiscountPercent')?.value || 0);
    const discount_start   = document.getElementById('editDiscountStart')?.value || null;
    const discount_end     = document.getElementById('editDiscountEnd')?.value || null;

    // Multimedia edit
    const urlLines = adminUrlsFromTextarea('editMediaUrls');
    const files    = adminFilesFromInput('editMediaFiles');

    const { base, remaining } = adminBuildMediaList({ urlLines, files });

    let uploaded = [];
    try {
      if (remaining > 0 && files.length) {
        uploaded = await adminUploadFiles(files, 'products', remaining);
      }
    } catch (err) {
      console.error('Error subiendo multimedia (edit):', err);
      showToast(err?.message || 'Error subiendo archivos', 'error');
      return;
    }

    const media = [...base, ...uploaded].slice(0, ADMIN_MAX_MEDIA);

    const body = {
      name,
      category,
      price,
      stock,
      description,
      tech_sheet,
      discount_percent,
      discount_start,
      discount_end,
      image_url: media.length ? JSON.stringify(media) : '',
      video_url: '',
    };

    try {
      await saveProd(id, body);
      modal.classList.add('hidden');
      showToast('Producto actualizado', 'success');
    } catch (err) {
      console.error('Error actualizando producto:', err);
      showToast('Error actualizando producto', 'error');
    }
  });
}




/************ ADMIN USUARIOS (MÁX 3 EXTRAS, SOLO ADMIN/DEV) ************/
async function fetchUsersAdmin() {
  try {
    const data = await apiFetch('/users', {
      headers: adminAuthHeaders()
    });
    return data;
  } catch (err) {
    console.error('Error cargando usuarios admin:', err);
    return [];
  }
}

function renderUsersAdmin(users) {
  const tbody = document.getElementById('adminUsersTbody');
  if (!tbody) return;

  if (!Array.isArray(users) || !users.length) {
    tbody.innerHTML = `
      <tr><td colspan="5">No hay usuarios registrados.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = users
    .map((u) => {
      const created = u.created_at
        ? new Date(u.created_at).toLocaleString('es-CO')
        : '';
      return `
        <tr data-id="${u.user_id}">
          <td>${u.user_id}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${created}</td>
          <td>
            <button class="btn btn-sm btn-danger btn-del-user">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function initUsersAdminUI() {
  const wrapper = document.getElementById('usersAdmin');
  if (!wrapper) return;

  const roleUpper = adminCurrentUser
    ? String(adminCurrentUser.role).toUpperCase()
    : '';

  // Solo ADMIN / DEV_ADMIN pueden ver esta sección
  if (!['ADMIN', 'DEV_ADMIN'].includes(roleUpper)) {
    wrapper.style.display = 'none';
    return;
  }

  // Pintamos el contenido interno (form + tabla)
  wrapper.innerHTML = `
    <h2>Usuarios del panel</h2>
    <p class="text-muted">
      Crea hasta 3 usuarios adicionales con rol USER para el panel.
    </p>

    <form id="formAdminUsers" class="form-grid" autocomplete="off">
      <div class="profile-row profile-row-2">
        <div class="form-field">
          <label for="adminUserEmail">Correo del usuario</label>
          <input type="email" id="adminUserEmail" required />
        </div>
        <div class="form-field">
          <label for="adminUserPassword">Contraseña</label>
          <input type="password" id="adminUserPassword" required />
        </div>
      </div>
      <div class="profile-actions">
        <button type="submit" class="btn-primary">
          Crear usuario
        </button>
      </div>
    </form>

    <div class="table-wrap" style="margin-top:1.5rem;">
      <table class="smart-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="adminUsersTbody"></tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('adminUsersTbody');
  const form  = document.getElementById('formAdminUsers');
  if (!tbody || !form) return;

  async function loadUsers() {
    const users = await fetchUsersAdmin();
    renderUsersAdmin(users);
  }

  // Crear usuario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('#adminUserEmail')?.value.trim() || '';
    const pass  = form.querySelector('#adminUserPassword')?.value.trim() || '';

    if (!email || !pass) {
      showToast('Email y contraseña son obligatorios', 'error');
      return;
    }
    if (pass.length < 8) {
      showToast('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    try {
      const res = await fetch(API + '/users', {
        method: 'POST',
        headers: adminAuthHeaders(),
        body: JSON.stringify({ email, password: pass }),
      });

           if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'email_in_use') {
          showToast('Ese correo ya está en uso', 'error');
        } else if (data.error === 'user_limit_reached') {
          showToast('Ya tienes el máximo de 3 usuarios con rol USER.', 'error');
        } else {
          showToast('No se pudo crear el usuario', 'error');
        }
        return;
      }


      showToast('Usuario creado correctamente', 'success');
      form.reset();
      await loadUsers();
    } catch (err) {
      console.error('Error creando usuario admin:', err);
      showToast('Error de conexión al crear usuario', 'error');
    }
  });

  // Eliminar usuario (excepto seed se valida en el backend)
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-del-user');
    if (!btn) return;
    const tr = btn.closest('tr');
    const id = tr?.dataset.id;
    if (!id) return;

    showConfirm({
      title: 'Eliminar usuario',
      message: '¿Seguro que quieres eliminar este usuario del panel?',
      onConfirm: async () => {
        try {
          await apiFetch(`/users/${id}`, {
            method: 'DELETE',
            headers: adminAuthHeaders()
          });
          showToast('Usuario eliminado', 'success');
          await loadUsers();
        } catch (err) {
          console.error('Error eliminando usuario:', err);
          showToast('No se pudo eliminar el usuario', 'error');
        }
      },
    });
  });

  // Cargar lista inicial
  loadUsers();
}


/********************
 * ADMIN LICENCIAS (postventa)
 ********************/

async function fetchLicensesAdmin(query = {}) {
  const qs = new URLSearchParams();
  if (query.software_id) qs.set('software_id', String(query.software_id));
  if (query.q) qs.set('q', String(query.q));
  if (query.revoked !== undefined && query.revoked !== null && query.revoked !== '') {
    qs.set('revoked', String(query.revoked));
  }
  const suffix = qs.toString() ? ('?' + qs.toString()) : '';
  return await apiFetch('/licenses' + suffix, { headers: adminAuthHeaders() });
}

function initLicensesAdminUI() {
  const wrapper = document.getElementById('licensesAdmin');
  if (!wrapper) return;

  const roleUpper = adminCurrentUser ? String(adminCurrentUser.role).toUpperCase() : '';
  if (!['ADMIN', 'DEV_ADMIN'].includes(roleUpper)) {
    wrapper.style.display = 'none';
    return;
  }

  wrapper.innerHTML = `
    <h2>Licencias (postventa)</h2>
    <p class="text-muted">
      Genera licencias por <b>software</b> (para que NO funcionen en otros).\n
      Por defecto: <b>3 sedes</b> + <b>6 PCs</b> + <b>major_max = 1 (v1)</b>.
    </p>

    <form id="formLic" class="form-grid" autocomplete="off">
      <div class="profile-row profile-row-2">
        <div class="form-field">
          <label for="licSoftware">Software</label>
          <select id="licSoftware"></select>
        </div>
        <div class="form-field">
          <label for="licMajor">Versión máxima (major_max)</label>
          <input id="licMajor" type="number" min="1" value="1" />
        </div>
      </div>

      <div class="profile-row profile-row-2">
        <div class="form-field">
          <label for="licSites">Sedes (max_sites)</label>
          <input id="licSites" type="number" min="1" value="3" />
        </div>
        <div class="form-field">
          <label for="licDevices">PCs (max_devices)</label>
          <input id="licDevices" type="number" min="1" value="6" />
        </div>
      </div>

      <div class="profile-row profile-row-2">
        <div class="form-field">
          <label for="licEmail">Correo cliente (opcional)</label>
          <input id="licEmail" type="email" placeholder="cliente@correo.com" />
        </div>
        <div class="form-field">
          <label for="licName">Nombre / Empresa (opcional)</label>
          <input id="licName" type="text" placeholder="Nombre o empresa" />
        </div>
      </div>

      <div class="profile-actions" style="gap:10px;display:flex;flex-wrap:wrap;align-items:center">
        <button type="submit" class="btn-primary">Generar licencia</button>
        <button type="button" class="btn-secondary" id="btnRefreshLic">Actualizar</button>
        <div class="text-muted" style="font-size:13px">Tip: busca por correo, nit, empresa…</div>
      </div>

      <div class="profile-row profile-row-2" style="margin-top:10px">
        <div class="form-field">
          <label for="licSearch">Buscar</label>
          <input id="licSearch" type="text" placeholder="correo / empresa / nit" />
        </div>
        <div class="form-field">
          <label for="licRevoked">Estado</label>
          <select id="licRevoked">
            <option value="">Todas</option>
            <option value="false">Activas</option>
            <option value="true">Revocadas</option>
          </select>
        </div>
      </div>
    </form>

    <div class="table-wrap" style="margin-top:1.5rem;">
      <table class="smart-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Software</th>
            <th>Cliente</th>
            <th>v</th>
            <th>Sedes</th>
            <th>PCs</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="licensesTbody"></tbody>
      </table>
    </div>

    <div style="margin-top:10px">
      <div class="text-muted" style="font-size:13px;line-height:1.4">
        La licencia incluye <code>software_id</code>. El software offline valida que coincida con su ID\n
        (por ejemplo Parqueadero = <b>3</b>), así NO se cruza con Restaurante, etc.
      </div>
    </div>
  `;

  const $soft = document.getElementById('licSoftware');
  const $tbody = document.getElementById('licensesTbody');
  const $form = document.getElementById('formLic');
  const $btnRefresh = document.getElementById('btnRefreshLic');
  const $search = document.getElementById('licSearch');
  const $revoked = document.getElementById('licRevoked');
  if (!$soft || !$tbody || !$form || !$btnRefresh || !$search || !$revoked) return;

  async function loadSoftwares() {
    try {
      const list = await apiFetch('/softwares/all', { headers: adminAuthHeaders() });
      const arr = Array.isArray(list) ? list : [];
      $soft.innerHTML = arr.map((s) => {
        const id = s.softwareId ?? s.software_id ?? s.id;
        const name = s.name || ('Software #' + id);
        const sel = String(id) === '3' ? 'selected' : '';
        return `<option value="${id}" ${sel}>${escapeHtml(name)} (ID ${id})</option>`;
      }).join('');
    } catch (e) {
      console.error('Error cargando softwares para licencias:', e);
      $soft.innerHTML = `<option value="3">Software Parqueadero (ID 3)</option>`;
    }
  }

  function renderRows(rows) {
    const arr = Array.isArray(rows) ? rows : [];
    if (!arr.length) {
      $tbody.innerHTML = `<tr><td colspan="8">No hay licencias.</td></tr>`;
      return;
    }
    $tbody.innerHTML = arr.map((r) => {
      const id = r.license_id;
      const sw = r.software_name || ('ID ' + r.software_id);
      const cli = (r.customer_email || r.customer_name || r.customer_company || '').trim() || '-';
      const st = r.revoked ? 'Revocada' : 'Activa';
      const btnText = r.revoked ? 'Reactivar' : 'Revocar';
      const btnClass = r.revoked ? 'btn-secondary' : 'btn-danger';

      return `
        <tr data-id="${id}" data-key="${encodeURIComponent(r.license_key || '')}" data-revoked="${r.revoked ? '1' : '0'}">
          <td>${id}</td>
          <td>${escapeHtml(sw)}</td>
          <td>${escapeHtml(cli)}</td>
          <td>${Number(r.major_max || 1)}</td>
          <td>${Number(r.max_sites || 0)}</td>
          <td>${Number(r.max_devices || 0)}</td>
          <td>${st}</td>
          <td style="white-space:nowrap">
            <button type="button" class="btn-secondary btn-copy-lic">Copiar</button>
            <button type="button" class="${btnClass} btn-toggle-lic">${btnText}</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function loadRows() {
    const q = $search.value.trim();
    const revoked = $revoked.value;
    const software_id = $soft.value;
    try {
      const rows = await fetchLicensesAdmin({ software_id, q, revoked });
      renderRows(rows);
    } catch (e) {
      console.error('Error cargando licencias:', e);
      showToast('No se pudieron cargar licencias', 'error');
      renderRows([]);
    }
  }

  // generar
  $form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      software_id: Number($soft.value),
      major_max: Number(document.getElementById('licMajor')?.value || 1),
      max_sites: Number(document.getElementById('licSites')?.value || 3),
      max_devices: Number(document.getElementById('licDevices')?.value || 6),
      customer_email: (document.getElementById('licEmail')?.value || '').trim(),
      customer_name: (document.getElementById('licName')?.value || '').trim(),
      license_type: 'PERPETUAL',
    };

    try {
      const res = await apiFetch('/licenses', {
        method: 'POST',
        headers: adminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      showToast('Licencia generada ✅', 'success');
      // Copiar al portapapeles
      try { await navigator.clipboard.writeText(res.license_key || ''); } catch {}
      await loadRows();
    } catch (e) {
      console.error('Error generando licencia:', e);
      const msg = (e && e.message) ? e.message : 'No se pudo generar la licencia';
      showToast(msg, 'error');
    }
  });

  $btnRefresh.addEventListener('click', async () => {
    await loadRows();
    showToast('Licencias actualizadas', 'success');
  });
  $search.addEventListener('input', () => { loadRows(); });
  $revoked.addEventListener('change', () => { loadRows(); });
  $soft.addEventListener('change', () => { loadRows(); });

  $tbody.addEventListener('click', async (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const id = tr.dataset.id;
    if (!id) return;

    if (e.target.closest('.btn-copy-lic')) {
      const key = decodeURIComponent(tr.dataset.key || '');
      if (!key) return showToast('Esta licencia no tiene key', 'error');
      try { await navigator.clipboard.writeText(key); } catch {}
      showToast('Licencia copiada', 'success');
      return;
    }

    if (e.target.closest('.btn-toggle-lic')) {
      const revoked = tr.dataset.revoked === '1';
      const endpoint = revoked ? `/licenses/${id}/unrevoke` : `/licenses/${id}/revoke`;
      try {
        await apiFetch(endpoint, { method: 'PATCH', headers: adminAuthHeaders() });
        showToast(revoked ? 'Licencia reactivada' : 'Licencia revocada', 'success');
        await loadRows();
      } catch (err) {
        console.error('Error cambiando estado licencia:', err);
        showToast('No se pudo cambiar el estado', 'error');
      }
    }
  });

  // init
  loadSoftwares().then(loadRows);
}



/********************
 * ADMIN SOFTWARES (reciclado de "Domicilios")
 ********************/

async function fetchDomicilios() {
  try {
    // Mantengo el nombre de la función por compatibilidad con el init del tab,
    // pero ahora devuelve SOFTWARES.
    const rows = await apiFetch('/softwares/all', {
      headers: adminAuthHeaders(),
    });
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.error('Error cargando softwares:', err);
    return [];
  }
}

function renderDomicilios(list) {
  const tbody = document.getElementById('domTableBody');
  const empty = document.getElementById('domEmpty');
  if (!tbody) return;

  if (!Array.isArray(list) || !list.length) {
    tbody.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  tbody.innerHTML = list
    .map((s) => {
      const id = s.softwareId ?? s.software_id ?? s.id;
      const name = s.name || '-';
      const tags = s.tags || '';
      const active = (s.active ?? true) ? 'Sí' : 'No';

      return `
        <tr data-id="${id}">
          <td>${id}</td>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(tags)}</td>
          <td>${active}</td>
          <td style="white-space:nowrap">
            <button type="button" class="btn-secondary btn-edit-sw">Editar</button>
            <button type="button" class="btn-danger btn-del-sw">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function initDomiciliosUI() {
      // Guard extra: evita dobles listeners (y dobles POST) si por alguna razón se inicializa dos veces
      if (window.__MR_SW_ADMIN_INIT) return;
      window.__MR_SW_ADMIN_INIT = true;

  const tbody     = document.getElementById('domTableBody');
  const btnRef    = document.getElementById('domRefresh');
  const selEstado = document.getElementById('domEstado');
  const inpQuery  = document.getElementById('domQuery');

  // Form
  const inpId = document.getElementById('swId');
  const inpName = document.getElementById('swName');
  const inpShort = document.getElementById('swShort');
  const inpFeatures = document.getElementById('swFeatures');
  const inpTags = document.getElementById('swTags');
  const inpImage = document.getElementById('swImageUrl');
  const inpFiles = document.getElementById('swImagesFile');
  const selActive = document.getElementById('swActive');
  const btnSave = document.getElementById('swSave');
  const btnClear = document.getElementById('swClear');

  if (!tbody || !btnRef || !btnSave) return;

  let all = [];
  // Candado anti doble envío: evita crear/actualizar 2 veces (doble click o doble listener)
  let isSaving = false;

  function setSavingState(saving) {
    isSaving = !!saving;
    try {
      btnSave.disabled = isSaving;
      if (btnClear) btnClear.disabled = isSaving;
      if (btnRef) btnRef.disabled = isSaving;
    } catch {}

    // UX: cambia el texto mientras guarda
    try {
      if (isSaving) {
        btnSave.dataset._prevText = btnSave.textContent || '';
        btnSave.textContent = 'Guardando...';
      } else if (btnSave.dataset._prevText) {
        btnSave.textContent = btnSave.dataset._prevText;
        delete btnSave.dataset._prevText;
      }
    } catch {}
  }

  function readForm() {
    return {
      name: (inpName?.value || '').trim(),
      short_description: (inpShort?.value || '').trim() || null,
      features: (inpFeatures?.value || '').trim() || null,
      tags: (inpTags?.value || '').trim() || null,
      image_url: (inpImage?.value || '').trim() || null,
      active: String(selActive?.value || 'true') === 'true',
    };
  }

  function fillForm(sw) {
    if (!sw) return;
    inpId.value = sw.softwareId ?? sw.software_id ?? sw.id ?? '';
    inpName.value = sw.name || '';
    inpShort.value = sw.shortDescription ?? sw.short_description ?? '';
    inpFeatures.value = sw.features ?? '';
    inpTags.value = sw.tags ?? '';
    inpImage.value = sw.imageUrl ?? sw.image_url ?? '';
    if (inpFiles) inpFiles.value = '';
    selActive.value = (sw.active ?? true) ? 'true' : 'false';
    btnSave.textContent = 'Actualizar';
  }

  function clearForm() {
    inpId.value = '';
    inpName.value = '';
    inpShort.value = '';
    inpFeatures.value = '';
    inpTags.value = '';
    inpImage.value = '';
    if (inpFiles) inpFiles.value = '';
    selActive.value = 'true';
    btnSave.textContent = 'Guardar';
  }

  function splitUrls(str) {
    return String(str || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function uniq(arr) {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      const k = String(x || '').trim();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(k);
    }
    return out;
  }

  function authOnlyHeaders() {
    const t = getToken ? getToken() : null;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async function uploadImages(files) {
    const list = Array.from(files || []).filter(Boolean);
    if (!list.length) return [];

    const uploaded = [];
    for (const f of list) {
      const fd = new FormData();
      fd.append('image', f);

      const res = await fetch(API + '/upload', {
        method: 'POST',
        headers: authOnlyHeaders(),
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`upload_failed ${res.status} ${txt}`);
      }

      const data = await res.json();
      if (data?.url) uploaded.push(String(data.url));
    }

    return uploaded;
  }

  async function loadAll() {
    all = await fetchDomicilios();
    aplicarFiltros();
  }

  function aplicarFiltros() {
    const estado = selEstado?.value || 'activos';
    const q      = (inpQuery?.value || '').toLowerCase().trim();

    let list = all.slice();

    if (estado !== 'todos') {
      const wantActive = estado === 'activos';
      list = list.filter((s) => Boolean(s.active ?? true) === wantActive);
    }

    if (q) {
      list = list.filter((s) => {
        const txt = [s.name, s.tags, s.shortDescription, s.short_description, s.features]
          .join(' ')
          .toLowerCase();
        return txt.includes(q);
      });
    }

    renderDomicilios(list);
  }

  btnRef.addEventListener('click', () => loadAll());
  selEstado?.addEventListener('change', aplicarFiltros);
  inpQuery?.addEventListener('input', () => {
    if (!inpQuery.value) aplicarFiltros();
  });

  btnClear?.addEventListener('click', clearForm);

  btnSave.addEventListener('click', async () => {
    if (isSaving) return; // evita doble creación por doble click o doble listener
    const dto = readForm();
    if (!dto.name) {
      showToast('El nombre es obligatorio', 'error');
      return;
    }

    const id = (inpId?.value || '').trim();
    try {
      setSavingState(true);
      // Si el admin seleccionó archivos, los subimos primero y los añadimos a image_url.
      const newUrls = inpFiles?.files?.length ? await uploadImages(inpFiles.files) : [];
      if (newUrls.length) {
        const current = splitUrls(dto.image_url);
        dto.image_url = uniq([...current, ...newUrls]).join(', ');
        // reflejar en el input para que el admin vea las URLs resultantes
        if (inpImage) inpImage.value = dto.image_url;
      }

      if (id) {
        await apiFetch(`/softwares/${id}`, {
          method: 'PUT',
          headers: adminAuthHeaders(),
          body: JSON.stringify(dto),
        });
        showToast('Software actualizado', 'success');
      } else {
        await apiFetch('/softwares', {
          method: 'POST',
          headers: adminAuthHeaders(),
          body: JSON.stringify(dto),
        });
        showToast('Software creado', 'success');
      }
      clearForm();
      await loadAll();
    } catch (err) {
      console.error('Error guardando software:', err);
      showToast('No se pudo guardar el software', 'error');
    } finally {
      setSavingState(false);
    }
  });

  tbody.addEventListener('click', async (e) => {
    const btnEdit = e.target.closest('.btn-edit-sw');
    const btnDel  = e.target.closest('.btn-del-sw');
    const tr = e.target.closest('tr');
    const id = tr?.dataset?.id;
    if (!id) return;

    if (btnEdit) {
      const sw = all.find((x) => String(x.softwareId ?? x.software_id ?? x.id) === String(id));
      fillForm(sw);
      return;
    }

    if (btnDel) {
      showConfirm({
        title: 'Eliminar software',
        message: '¿Seguro que quieres eliminar este software del catálogo?',
        onConfirm: async () => {
          try {
            await apiFetch(`/softwares/${id}`, {
              method: 'DELETE',
              headers: adminAuthHeaders(),
            });
            showToast('Software eliminado', 'success');
            clearForm();
            await loadAll();
          } catch (err) {
            console.error('Error eliminando software:', err);
            showToast('No se pudo eliminar el software', 'error');
          }
        },
      });
    }
  });

  // carga inicial
  loadAll();
}

function initAdminPanel() {
  // Botones de pestañas (Productos, Tienda, Domicilios, etc.)
  const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  const tabPanes   = document.querySelectorAll('.tab-pane[id]');
  if (!tabButtons.length || !tabPanes.length) return;

  // Para no registrar listeners duplicados si se llama dos veces
  tabButtons.forEach((btn) => {
    btn._adminTabHandled && btn.removeEventListener('click', btn._adminTabHandled);

    const handler = (e) => {
      e.preventDefault();
      const targetId = btn.dataset.tab;
      if (!targetId) return;
      showTab(targetId);
    };

    btn._adminTabHandled = handler;
    btn.addEventListener('click', handler);
  });

  function showTab(targetId) {
    // activar/desactivar botones
    tabButtons.forEach((btn) => {
      const active = btn.dataset.tab === targetId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // mostrar/ocultar paneles
    tabPanes.forEach((pane) => {
      const active = pane.id === targetId;
      pane.classList.toggle('active', active);
      pane.hidden = !active;
    });

    // Inicializaciones perezosas por tab
    switch (targetId) {
      case 'tab-prod':
        // productos
        adminLoadProducts?.();
        break;
      case 'tab-tienda':
        // vista tienda en iframe
        const frame = document.getElementById('tiendaFrame');
        if (frame && !frame.dataset.loaded) {
          frame.src = 'index.html';
          frame.dataset.loaded = '1';
        }
        break;
      case 'tab-domicilios':
        // reciclado: Softwares
        const swPane = document.getElementById('tab-domicilios');
        if (swPane && !swPane.dataset.loaded) {
          initDomiciliosUI?.();
          swPane.dataset.loaded = '1';
        }
        break;
      case 'tab-publicidad':
        initAdsAdminUI?.();
        break;
      case 'tab-ventas':
        initVentasUI?.();
        break;
      case 'tab-estadisticas':
        initStatsUI?.();
        break;
      case 'tab-perfil':
        initProfileAdminUI?.();
        initUsersAdminUI?.();
        initLicensesAdminUI?.();
        break;
    }

    // pequeño scroll para que siempre se vea el contenido
    const main = document.querySelector('.admin-main');
    if (main) {
      const top = main.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // pestaña inicial
  showTab('tab-prod');
}

// Que se ejecute solo en admin.html
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('admin-page')) {
    initAdminPanel();

    // ✅ Conectar Firebase Auth para poder subir a Storage (evita el 403)
    window.MR?.ensureFirebaseLogin?.().catch((e) => {
      console.warn('Firebase login no realizado:', e);
    });
  }
});






