(function(){
  const card = document.getElementById('sdCard');
  if (!card) return;

  const wa = (window.WHATSAPP_BUSINESS || '573014190633').replace(/\D/g,'');
  const DEFAULT_IMG = (window.MR_CONFIG && window.MR_CONFIG.DEFAULT_SOFTWARE_IMG)
    ? window.MR_CONFIG.DEFAULT_SOFTWARE_IMG
    : 'images/software.avif';

  const API_HOST = (() => {
    const base = (window.MR_CONFIG && window.MR_CONFIG.API_BASE) ? window.MR_CONFIG.API_BASE : (window.API || '');
    const s = String(base || '').replace(/\/+$/, '');
    return s.replace(/\/api$/, '');
  })();

  function resolveImgUrl(url){
    const raw = String(url || '').trim();
    if (!raw) return DEFAULT_IMG;
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
    if (!API_HOST) {
      if (raw.startsWith('/')) return raw;
      return '/' + raw;
    }
    if (raw.startsWith('/')) return API_HOST + raw;
    return API_HOST + '/' + raw;
  }

  const fallback = {
    'parqueadero': {
      name: 'Software Parqueadero',
      shortDescription: 'Entradas/salidas, tarifas, reportes y facturación mostrador.',
      tags: 'Pago único, Offline, Reportes',
      features: 'Control de entradas y salidas\nTarifas y reportes\nFacturación mostrador',
      imageUrl: DEFAULT_IMG,
    },
    'restaurante': {
      name: 'Software Restaurante',
      shortDescription: 'Mesas, pedidos, cocina, inventario básico y facturación mostrador.',
      tags: 'Pago único, Offline, Multiusuario',
      features: 'Gestión de mesas y pedidos\nControl básico de inventario\nFacturación mostrador',
      imageUrl: DEFAULT_IMG,
    },
    'factura-mostrador': {
      name: 'Factura Mostrador Pro',
      shortDescription: 'Caja, clientes, reportes y facturación rápida.',
      tags: 'Pago único, Offline, Escalable',
      features: 'Caja y clientes\nReportes\nFacturación rápida',
      imageUrl: DEFAULT_IMG,
    }
  };

  function qs(){
    try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); }
  }

  function splitTags(tags){
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(Boolean);
    return String(tags).split(',').map(s=>s.trim()).filter(Boolean);
  }

  function splitImages(imageUrl){
    const txt = String(imageUrl || '').trim();
    if (!txt) return [DEFAULT_IMG];

    // JSON (array de objetos o strings)
    if ((txt.startsWith('[') && txt.endsWith(']')) || (txt.startsWith('{') && txt.endsWith('}'))) {
      try {
        const j = JSON.parse(txt);
        const arr = Array.isArray(j) ? j : (Array.isArray(j?.media) ? j.media : []);
        if (Array.isArray(arr) && arr.length) {
          const urls = [];
          arr.forEach(x => {
            if (!x) return;
            if (typeof x === 'string') {
              if (x.trim()) urls.push(x.trim());
              return;
            }
            if (typeof x === 'object') {
              const t = String(x.type || x.kind || '').toLowerCase();
              const u = String(x.url || x.src || '').trim();
              if (!u) return;
              // preferimos imágenes, pero si no hay, igual mostramos lo que exista
              if (!t || t.includes('image')) urls.push(u);
            }
          });

          if (urls.length) return urls.map(resolveImgUrl);
        }
      } catch {}
    }

    // String multi-url: coma, pipe, punto y coma o salto de línea
    const list = txt.split(/[\n\r,;|]+/g).map(s=>s.trim()).filter(Boolean);
    return (list.length ? list : [DEFAULT_IMG]).map(resolveImgUrl);
  }

  function normalize(sw){
    const id = sw.softwareId ?? sw.software_id ?? sw.id ?? '';
    return {
      id,
      name: sw.name || '',
      shortDescription: sw.shortDescription ?? sw.short_description ?? sw.desc ?? sw.description ?? '',
      features: sw.features ?? '',
      tags: splitTags(sw.tags),
      imageUrl: sw.imageUrl ?? sw.image_url ?? sw.img ?? '',
    };
  }

  function buildMsg(sw){
    return `Hola, me interesa el software ${sw.name}.`;
  }

  function featuresToHtml(features){
    const txt = String(features || '').trim();
    if (!txt) return '<p>Escríbenos por WhatsApp y te contamos todo (precio, requisitos e instalación).</p>';

    const lines = txt
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => l.replace(/^[-*•]+\s*/, ''));

    if (lines.length >= 2) {
      return `<ul>${lines.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
    }

    return `<p>${escapeHtml(txt)}</p>`;
  }

  function escapeHtml(str){
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render(sw){
    const s = normalize(sw);
    const imgs = splitImages(s.imageUrl);
    const msg = buildMsg(s);

    card.innerHTML = `
      <div class="sd-grid">
        <div>
          <img id="sdMainImg" class="sd-mainimg" src="${escapeHtml(imgs[0])}" alt="${escapeHtml(s.name)}" onerror="this.src='${DEFAULT_IMG}'">
          <div class="sd-thumbs" id="sdThumbs">
            ${imgs.map((u,i)=>`<img class="sd-thumb ${i===0?'active':''}" data-src="${escapeHtml(u)}" src="${escapeHtml(u)}" alt="Miniatura ${i+1}" onerror="this.src='${DEFAULT_IMG}'">`).join('')}
          </div>
        </div>

        <div>
          <h1 class="sd-title">${escapeHtml(s.name)}</h1>
          <p class="sd-desc">${escapeHtml(s.shortDescription || '')}</p>
          <div class="sd-tags">${(s.tags || []).map(t=>`<span class="sd-tag">${escapeHtml(t)}</span>`).join('')}</div>

          <div class="sd-actions">
            <a class="sd-btn primary" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}">Cotizar por WhatsApp</a>
            <a class="sd-btn ghost" href="software.html">Ver más softwares</a>
          </div>

          <div class="sd-features">
            <h2>Características</h2>
            ${featuresToHtml(s.features)}
          </div>
        </div>
      </div>
    `;

    const main = document.getElementById('sdMainImg');
    const thumbs = document.getElementById('sdThumbs');
    thumbs?.addEventListener('click', (e) => {
      const t = e.target.closest('.sd-thumb');
      if (!t || !main) return;
      const src = t.getAttribute('data-src');
      if (!src) return;
      main.src = src;
      thumbs.querySelectorAll('.sd-thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  }

  async function load(){
    const id = qs().get('id') || '';
    if (!id) {
      card.innerHTML = '<p style="color:#6b7280">No se encontró el software.</p>';
      return;
    }

    const n = Number(id);
    if (!Number.isFinite(n)) {
      const sw = fallback[id];
      if (sw) render(sw);
      else card.innerHTML = '<p style="color:#6b7280">No se encontró el software.</p>';
      return;
    }

    try {
      const base = (typeof apiBase === 'function' ? apiBase() : (window.API ? (String(window.API).replace(/\/+$/, '') + '/api') : ''));
      const res = await fetch(base + `/softwares/${n}`, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('http_' + res.status);
      const sw = await res.json();
      render(sw);
    } catch (err) {
      console.warn('No se pudo cargar el detalle del software:', err);
      card.innerHTML = '<p style="color:#6b7280">No se pudo cargar el software. Intenta más tarde.</p>';
    }
  }

  load();
})();
