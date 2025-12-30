(function(){
  const grid = document.getElementById('swGrid');
  if (!grid) return;

  const wa = (window.WHATSAPP_BUSINESS || window.MR_CONFIG?.WHATSAPP_NUMBER || '573014190633').replace(/\D/g,'');
  const DEFAULT_IMG = window.MR_CONFIG?.DEFAULT_SOFTWARE_IMG || '/assets/img/default-software.svg';

  // Fallback local (si la API aún no tiene softwares cargados)
  const fallback = [
    {
      id: 'parqueadero',
      name: 'Software Parqueadero',
      desc: 'Entradas/salidas, tarifas, reportes y facturación mostrador.',
      tags: ['Pago único', 'Offline', 'Reportes'],
      img: DEFAULT_IMG,
      features: ''
    },
    {
      id: 'restaurante',
      name: 'Software Restaurante',
      desc: 'Mesas, pedidos, cocina, inventario básico y facturación mostrador.',
      tags: ['Pago único', 'Offline', 'Multiusuario'],
      img: DEFAULT_IMG,
      features: ''
    },
    {
      id: 'factura-mostrador',
      name: 'Factura Mostrador Pro',
      desc: 'Caja, clientes, reportes y facturación rápida.',
      tags: ['Pago único', 'Offline', 'Escalable'],
      img: DEFAULT_IMG,
      features: ''
    }
  ];

  function splitTags(tags){
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(Boolean);
    return String(tags)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  function resolveImg(url){
    const u = String(url || '').trim();
    if (!u) return DEFAULT_IMG;
    if (/^(https?:\/\/|data:|blob:)/i.test(u)) return u;

    // Si el backend guarda rutas relativas (uploads/.. o /uploads/..),
    // en Vercel eso apunta al front y da 404. Aquí las convertimos a URL
    // absoluta del backend (API_BASE sin /api).
    const apiBase = String(window.MR_CONFIG?.API_BASE || '').trim();
    const apiOrigin = apiBase.replace(/\/api\/?$/, '');
    const isUpload = u.startsWith('/uploads') || u.startsWith('uploads/');
    if (isUpload && apiOrigin) {
      const path = u.startsWith('/') ? u : `/${u}`;
      return `${apiOrigin}${path}`;
    }

    // Fallback al resolutor si existe
    if (window.MR_UTIL?.resolveMediaUrl) {
      return window.MR_UTIL.resolveMediaUrl(u) || DEFAULT_IMG;
    }
    return u;
  }

  function normalize(sw){
    const id = sw.softwareId ?? sw.software_id ?? sw.id ?? sw.slug ?? '';
    const name = sw.name || '';
    const desc = sw.shortDescription ?? sw.short_description ?? sw.desc ?? sw.description ?? '';
    const features = sw.features ?? '';
    const img = resolveImg(sw.imageUrl ?? sw.image_url ?? sw.img);
    const tags = splitTags(sw.tags);
    return { id, name, desc, features, img, tags };
  }

  function buildMsg(sw){
    return `Hola, me interesa el software ${sw.name}.`;
  }

  function render(list){
    grid.innerHTML = '';

    list.forEach((raw) => {
      const s = normalize(raw);
      const msg = buildMsg(s);

      const el = document.createElement('article');
      el.className = 'sw-card';
      el.innerHTML = `
        <img src="${s.img}" alt="${s.name}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">
        <h3>${s.name}</h3>
        <p>${s.desc || ''}</p>
        <div class="sw-tags">${(s.tags || []).map(t => `<span class="sw-tag">${t}</span>`).join('')}</div>
        <div class="sw-actions">
          <a class="sw-btn primary" target="_blank" rel="noopener"
             href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}">Cotizar</a>
          <a class="sw-btn ghost" href="software-detalle.html?id=${encodeURIComponent(String(s.id))}">Ver detalles</a>
        </div>
      `;

      grid.appendChild(el);
    });
  }

  async function init(){
    try {
      // Nota: apiFetch usa /api/... por debajo, por eso aquí NO ponemos /api
      const data = await (window.apiFetch ? window.apiFetch('/softwares') : Promise.resolve(null));
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      render(list.length ? list : fallback);
    } catch (err) {
      console.warn('No se pudieron cargar softwares desde API, uso fallback:', err);
      render(fallback);
    }
  }

  init();
})();
