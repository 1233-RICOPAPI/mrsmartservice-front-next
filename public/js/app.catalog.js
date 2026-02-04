function normalizeText(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}

/* ============== CATÁLOGO (index.html → #catalogo) ============== */
const unique   = (arr) => [...new Set(arr)];
const debounce = (fn, ms = 300) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };


/* Soporte para múltiples imágenes: "url1 | url2, url3" */


// ===============================
// Multimedia (imágenes + videos)
// - Nuevo formato recomendado (para guardar en DB):
//   product.image_url = JSON.stringify([{type:'image'|'video', url:'...'}, ...])
// - Sigue soportando formatos antiguos: image_url = "url1|url2" y video_url = "..."
// ===============================
const MAX_MEDIA_ITEMS = 6;

function guessMediaTypeFromUrl(url) {
  const u = String(url || '').trim();
  const low = u.toLowerCase();
  if (!u) return 'image';
  if (low.includes('youtube.com') || low.includes('youtu.be')) return 'video';
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(low)) return 'video';
  return 'image';
}

function parseMediaItemsFromJsonString(str) {
  const s = String(str || '').trim();
  if (!s) return null;
  if (!(s.startsWith('[') || s.startsWith('{'))) return null;
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.media)) return parsed.media;
    return null;
  } catch {
    return null;
  }
}

function parseMediaItems(productOrImageField, videoField) {
  let imageField = productOrImageField;
  let vField = videoField;

  if (productOrImageField && typeof productOrImageField === 'object' && !Array.isArray(productOrImageField)) {
    imageField = productOrImageField.image_url;
    vField = productOrImageField.video_url;
  }

  const out = [];
  const push = (url, type) => {
    const clean = String(url || '').trim();
    if (!clean || clean === 'null' || clean === 'undefined') return;
    out.push({ type: type || guessMediaTypeFromUrl(clean), url: clean });
  };

  // 1) JSON (nuevo)
  const jsonItems = parseMediaItemsFromJsonString(imageField);
  if (jsonItems) {
    for (const it of jsonItems) {
      if (!it) continue;
      if (typeof it === 'string') {
        push(it, guessMediaTypeFromUrl(it));
      } else if (typeof it === 'object') {
        push(it.url || it.src || '', String(it.type || '').toLowerCase() || guessMediaTypeFromUrl(it.url || it.src));
      }
      if (out.length >= MAX_MEDIA_ITEMS) break;
    }
    return out;
  }

  // 2) Legacy: image_url (varias separadas por | , ; o saltos)
  const imgs = String(imageField || '')
    .split(/[|,;\n]+/)
    .map(s => s.trim())
    .filter(s => s && s !== 'null' && s !== 'undefined');
  for (const u of imgs) {
    push(u, 'image');
    if (out.length >= MAX_MEDIA_ITEMS) break;
  }

  // 3) Legacy: video_url
  const vids = String(vField || '')
    .split(/[|,;\n]+/)
    .map(s => s.trim())
    .filter(s => s && s !== 'null' && s !== 'undefined');
  for (const u of vids) {
    push(u, 'video');
    if (out.length >= MAX_MEDIA_ITEMS) break;
  }

  return out;
}


/* Soporte para múltiples imágenes:
   - Legacy: "url1 | url2, url3"
   - Nuevo: JSON.stringify([{type:'image'|'video', url:'...'}])
*/
function parseImages(field) {
  // Soporta formatos viejos y evita URLs inválidas tipo "null" / "undefined"
  if (field == null) return ['images/banner1.jpg'];
  if (Array.isArray(field)) return field;

  const cleaned = String(field).trim();
  if (!cleaned || cleaned === 'null' || cleaned === 'undefined') return ['images/banner1.jpg'];

  // Nuevo formato: JSON con multimedia
  const jsonItems = parseMediaItemsFromJsonString(cleaned);
  if (jsonItems) {
    const media = parseMediaItems(cleaned, '');
    const imgs = media.filter(m => m.type === 'image').map(m => m.url);
    return imgs.length ? imgs : ['images/banner1.jpg'];
  }

  // Legacy
  const parts = cleaned
    .split(/[|,;]/)
    .map(s => s.trim())
    .filter(s => s && s !== 'null' && s !== 'undefined');

  return parts.length ? parts : ['images/banner1.jpg'];
}
/* ============== HOME: videos de publicidad (tabla ads) ============== */

// Helper 1: Convertir URL normal de YouTube a Embed (si no la tienes ya)
function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    // Caso youtu.be/ID
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    // Caso youtube.com/watch?v=ID
    if (u.searchParams.has('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    // Si ya es embed, devolver igual
    return url;
  } catch (e) {
    return url;
  }
}

// Helper 2: Resolver URL de imagen (evita URLs malformadas como "300x200?text=Producto:1")
function resolveImg(url) {
  if (!url || typeof url !== 'string') return 'images/placeholder.jpg';
  const u = String(url).trim();
  if (!u || u === 'null' || u === 'undefined') return 'images/placeholder.jpg';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/uploads') && typeof API_ORIGIN !== 'undefined') return API_ORIGIN + u;
  if (u.startsWith('/') || u.startsWith('./')) return u;
  return 'images/placeholder.jpg';
}


// TU FUNCIÓN PRINCIPAL
async function loadHomeAds() {
  const box = document.getElementById('homeAds');
  if (!box) return;

  try {
    // Nota: Asegúrate de que API esté definida en tu archivo
    const res = await fetch(API + '/ads'); 
    
    if (!res.ok) throw new Error('ads_home_failed');

    const ads = await res.json();

    // Filtrar solo los activos si el backend no lo hace
    const activeAds = ads.filter(ad => ad.active !== false);

    if (!activeAds.length) {
      box.innerHTML = '<div class="empty">Aún no hay videos de publicidad.</div>';
      return;
    }

    box.innerHTML = activeAds.map(ad => {
      const rawVideo = (ad.video_url || '').trim();
      const rawImage = (ad.image_url || '').trim();
      let mediaHtml = '';

      // 1) Si es YouTube → iframe
      if (rawVideo && /youtube\.com|youtu\.be/.test(rawVideo)) {
        const embed = toYouTubeEmbed(rawVideo);
        mediaHtml = `
          <div class="home-ad-video">
            <iframe
              src="${embed}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        `;
      }
      // 2) Si es MP4 / Cloudinary → video nativo
      else if (rawVideo) {
        const src = resolveImg(rawVideo);
        mediaHtml = `
          <div class="home-ad-video">
            <video
              controls
              src="${src}"
              controlsList="nodownload noplaybackrate noremoteplayback"
              oncontextmenu="return false;"
            ></video>
          </div>
        `;
      }
      // 3) Si no hay video pero sí imagen → solo imagen
      else if (rawImage) {
        const imgSrc = resolveImg(rawImage);
        mediaHtml = `
          <div class="home-ad-video">
            <img src="${imgSrc}" alt="${ad.title || 'Publicidad'}" />
          </div>
        `;
      }

      const desc = (ad.description || '').trim();

      return `
        <article class="home-ad-card">
          <div class="home-ad-info">
             <h3 class="home-ad-title">${ad.title || ''}</h3>
             ${desc ? `<p class="home-ad-desc">${desc}</p>` : ''}
          </div>
          ${mediaHtml}
        </article>
      `;
    }).join('');
    
  } catch (err) {
    console.error('fetchAdsHome error:', err);
    // No mostramos error feo al usuario, solo ocultamos o mostramos vacío
    box.innerHTML = ''; 
  }
}


function renderCatalog(items, into) {
  into.innerHTML = items.map(p => {
    const base  = Number(p.price) || 0;
    const desc  = Number(p.discount_percent) || 0;
    const final = Math.max(0, Math.round(base * (1 - desc / 100)));

    const imgs  = parseImages(p.image_url);
    const img   = resolveImg(imgs[0]);
    const stock = Number(p.stock ?? 0);

    let stockBadge  = '';
    let disabledBtn = '';

    if (stock <= 0) {
      stockBadge  = `<div class="stock-badge agotado">AGOTADO</div>`;
      disabledBtn = 'disabled';
    } else if (stock <= 5) {
      stockBadge = `<div class="stock-badge bajo">¡Solo quedan ${stock}!</div>`;
    }

    return `
      <article class="card-producto">
        <div class="stock-wrap">
          ${stockBadge}
          <img src="${img}" alt="${p.name}">
        </div>

        <h3>${p.name}</h3>

        <div class="price">
          ${desc > 0 ? `<del>${money(base)}</del>` : ''}
          <span>${money(final)}</span>
        </div>

        <div class="meta">
          ${(p.category || 'General')} ${desc > 0 ? `• -${desc}%` : ''}
        </div>

        <div class="producto-actions">
          <button class="btn-add"
            data-id="${p.product_id}"
            data-name="${p.name}"
            data-price="${final}"
            data-img="${img}"
            ${disabledBtn}>
            ${stock <= 0 ? 'No disponible' : 'Añadir'}
          </button>

          <a href="detalle-producto.html?id=${p.product_id}"
             class="btn-detalle">
            Ver detalle
          </a>
        </div>
      </article>`;
  }).join('');

  into.querySelectorAll('.btn-add').forEach(b => {
    if (b.disabled) return;
    b.addEventListener('click', () => {
      addToCart({
        id: Number(b.dataset.id) || 0,
        nombre: b.dataset.name || 'Producto',
        precio: Number(b.dataset.price) || 0,
        imagen: b.dataset.img || ''
      });
      showToast('Producto añadido al carrito');
    });
  });
}

async function loadCatalogPage() {
  const grid = document.getElementById('productos');
  if (!grid) return;

  const form = document.getElementById('filtrosProd') || document.getElementById('searchForm') || document;
  const all  = await fetchProducts();

  const selCat = document.getElementById('categoriaSelect');
  const q      = document.getElementById('q');
  const pmin   = document.getElementById('pmin') || document.getElementById('minPrice');
  const pmax   = document.getElementById('pmax') || document.getElementById('maxPrice');
  const solo   = document.getElementById('soloDesc') || document.getElementById('onlyDiscount');
  const orden  = document.getElementById('ordenSelect');

  const urlParams  = new URLSearchParams(location.search);
  const urlCat     = urlParams.get('cat');
  let initialCat   = urlCat ? urlCat.toLowerCase() : 'todos';

  if (selCat) {
    const cats = ['todos', ...unique(all.map(p => (p.category || 'General').toLowerCase()))];
    // Si viene cat en la URL y no existe en productos, igual lo agregamos para permitir filtrar (y mostrar vacío)
    if (urlCat) {
      const lowerUrlCat = urlCat.toLowerCase();
      if (!cats.includes(lowerUrlCat)) cats.push(lowerUrlCat);
    }
    selCat.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');

    if (urlCat) {
      const lower = urlCat.toLowerCase();
      const opt   = Array.from(selCat.options).find(o => o.value.toLowerCase() === lower);
      if (opt) selCat.value = opt.value;
    }
  }

  const apply = () => {
    const txt  = (q?.value || '').trim().toLowerCase();
    const cat  = (selCat?.value || initialCat || 'todos').toLowerCase();
    initialCat = null;
    const min  = Number(pmin?.value);
    const max  = Number(pmax?.value);
    const dsc  = !!solo?.checked;
    const ord  = orden?.value || 'recent';

    let list = all.filter(p => {
      const nameCat = `${p.name || ''} ${(p.category || '').toLowerCase()}`.toLowerCase();
      if (txt && !nameCat.includes(txt)) return false;
      if (cat !== 'todos' && (p.category || '').toLowerCase() !== cat) return false;

      const base  = Number(p.price) || 0;
      const desc  = Number(p.discount_percent) || 0;
      const final = Math.max(0, Math.round(base * (1 - desc / 100)));
      if (!Number.isNaN(min) && min > 0 && final < min) return false;
      if (!Number.isNaN(max) && max > 0 && final > max) return false;

      if (dsc && !(desc > 0)) return false;
      return true;
    });

    list.sort((a, b) => {
      const pa = Math.round((Number(a.price) || 0) * (1 - (Number(a.discount_percent) || 0) / 100));
      const pb = Math.round((Number(b.price) || 0) * (1 - (Number(b.discount_percent) || 0) / 100));
      if (ord === 'priceAsc')  return pa - pb;
      if (ord === 'priceDesc') return pb - pa;
      if (ord === 'nameAsc')   return String(a.name || '').localeCompare(String(b.name || ''));
      return (Number(b.product_id) || 0) - (Number(a.product_id) || 0);
    });

    const empty = document.getElementById('prodEmpty');
    if (list.length) {
      if (empty) empty.hidden = true;
      renderCatalog(list, grid);
    } else {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
    }
  };

  const deb = debounce(apply, 250);
  q?.addEventListener('input', deb);
  selCat?.addEventListener('change', apply);
  pmin?.addEventListener('input', deb);
  pmax?.addEventListener('input', deb);
  solo?.addEventListener('change', apply);
  orden?.addEventListener('change', apply);
  form.addEventListener('submit', (e) => { if (form.id) e.preventDefault(); apply(); });

  apply();
}