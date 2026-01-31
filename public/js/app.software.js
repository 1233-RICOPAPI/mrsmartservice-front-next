(function(){
  const grid = document.getElementById('swGrid');
  if (!grid) return;

  const wa = (window.WHATSAPP_BUSINESS || '573014190633').replace(/\D/g,'');
  const DEFAULT_IMG = (window.MR_CONFIG && window.MR_CONFIG.DEFAULT_SOFTWARE_IMG)
    ? window.MR_CONFIG.DEFAULT_SOFTWARE_IMG
    : 'images/software.avif';

  // Base host para archivos (uploads). Preferimos MR_CONFIG.API_BASE y luego window.API.
  const API_HOST = (() => {
    const base = (window.MR_CONFIG && window.MR_CONFIG.API_BASE) ? window.MR_CONFIG.API_BASE : (window.API || '');
    const s = String(base || '').replace(/\/+$/, '');
    return s.endsWith('/api') ? s.slice(0, -4) : s;
  })();

  function resolveImgUrl(url){
    const raw = String(url || '').trim();
    if (!raw) return DEFAULT_IMG;
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;

    // Si viene como /uploads/.. o uploads/.. lo servimos desde el backend
    if (API_HOST) {
      if (raw.startsWith('/')) return API_HOST + raw;
      return API_HOST + '/' + raw;
    }

    // Fallback: lo dejamos tal cual (sirve para rutas relativas en local)
    return raw;
  }

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

  function extractFirstImage(raw){
    // Acepta:
    // - string con URLs separadas por , | ; \n
    // - JSON array de objetos: [{type:'image',url:'...'}]
    // - JSON array de strings: ['url1','url2']
    const txt = String(raw || '').trim();
    if (!txt) return '';

    // JSON
    if ((txt.startsWith('[') && txt.endsWith(']')) || (txt.startsWith('{') && txt.endsWith('}'))) {
      try {
        const j = JSON.parse(txt);
        const arr = Array.isArray(j) ? j : (Array.isArray(j?.media) ? j.media : []);
        if (Array.isArray(arr) && arr.length) {
          // objetos
          const imgObj = arr.find(x => x && typeof x === 'object' && String(x.type || x.kind || '').toLowerCase().includes('image') && (x.url || x.src));
          if (imgObj) return String(imgObj.url || imgObj.src || '').trim();
          // strings
          const str = arr.find(x => typeof x === 'string' && x.trim());
          if (str) return str.trim();
        }
      } catch {}
    }

    // String multi-url: coma, pipe, punto y coma o salto de línea
    const parts = txt.split(/[\n\r,;|]+/g).map(s => s.trim()).filter(Boolean);
    return parts[0] || '';
  }

  function normalize(sw){
    const id = sw.softwareId ?? sw.software_id ?? sw.id ?? sw.slug ?? '';
    const name = sw.name || '';
    const desc = sw.shortDescription ?? sw.short_description ?? sw.desc ?? sw.description ?? '';
    const features = sw.features ?? '';
    const imgRaw = sw.imageUrl ?? sw.image_url ?? sw.img ?? sw.media ?? '';
    const first = extractFirstImage(imgRaw);
    const img = resolveImgUrl(first || DEFAULT_IMG);
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
