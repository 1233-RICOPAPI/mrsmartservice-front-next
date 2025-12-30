(function(){
  const card = document.getElementById('sdCard');
  if (!card) return;

  const wa = (window.WHATSAPP_BUSINESS || window.MR_CONFIG?.WHATSAPP_NUMBER || '573014190633').replace(/\D/g,'');
  const DEFAULT_IMG = window.MR_CONFIG?.DEFAULT_SOFTWARE_IMG || '/assets/img/default-software.svg';

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

  function resolveImg(u){
    const raw = String(u || '').trim();
    if (!raw) return DEFAULT_IMG;
    if (/^(https?:\/\/|data:|blob:)/i.test(raw)) return raw;

    const apiBase = String(window.MR_CONFIG?.API_BASE || '').replace(/\/+$/,'');
    const apiOrigin = apiBase.replace(/\/api$/,'');
    const withSlash = raw.startsWith('/') ? raw : `/${raw}`;

    // /uploads/... debe venir del backend, no de Vercel
    if (withSlash.startsWith('/uploads/')) {
      return apiOrigin ? `${apiOrigin}${withSlash}` : withSlash;
    }

    // Si en BD guardaste sin el prefijo, asumimos carpeta uploads
    if (!withSlash.includes('/')) {
      return apiOrigin ? `${apiOrigin}/uploads/${raw}` : `/uploads/${raw}`;
    }

    // fallback a utilidad si existe
    const resolved = (window.MR_UTIL?.resolveMediaUrl) ? window.MR_UTIL.resolveMediaUrl(raw) : raw;
    return resolved || DEFAULT_IMG;
  }

  function splitImages(imageUrl){
    const raw = String(imageUrl || '').trim();
    if (!raw) return [DEFAULT_IMG];
    // Permitimos varias URLs separadas por coma (se guarda en el mismo campo para no migrar BD)
    const list = raw.split(',').map(s=>s.trim()).filter(Boolean).map(resolveImg);
    return list.length ? list : [DEFAULT_IMG];
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

    // thumbs behavior
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

    // Si no es numérico, usamos fallback local (cuando aún no hay datos en BD)
    const n = Number(id);
    if (!Number.isFinite(n)) {
      const sw = fallback[id];
      if (sw) render(sw);
      else card.innerHTML = '<p style="color:#6b7280">No se encontró el software.</p>';
      return;
    }

    try {
      const sw = await (window.apiFetch ? window.apiFetch(`/softwares/${n}`) : Promise.resolve(null));
      if (!sw) throw new Error('empty');
      render(sw);
    } catch (err) {
      console.warn('No se pudo cargar el detalle del software:', err);
      card.innerHTML = '<p style="color:#6b7280">No se pudo cargar el software. Intenta más tarde.</p>';
    }
  }

  load();
})();
