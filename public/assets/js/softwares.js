(async function () {
  await window.MR_HEADER.initHeader();

  const list = document.getElementById('software-list');
  const elError = document.getElementById('error');

  const buyer = (() => { try { return JSON.parse(localStorage.getItem('MR_BUYER')||'null'); } catch { return null; } })();
  const buyerName = buyer?.name ? String(buyer.name) : '';
  const buyerPhone = buyer?.phone ? String(buyer.phone) : '';

  function msgTemplate(name) {
    const base = `Hola, me interesa el Software ${name}.
¿Me regalas precio, requisitos e instalación?`;
    const extra = (buyerName || buyerPhone) ? `
Mi nombre es: ${buyerName || ''} – Tel: ${buyerPhone || ''}` : '';
    return (base + extra).trim();
  }

  async function load() {
    try {
      const rows = await window.MR_API.get('/api/softwares');
      render(rows || []);
    } catch (e) {
      elError.textContent = `No pude cargar softwares: ${e.message}`;
    }
  }

  function card(s) {
    const img = s.image_url || window.MR_CONFIG.DEFAULT_SOFTWARE_IMG;
    const tags = (s.tags || '').split(',').map(x=>x.trim()).filter(Boolean);
    return `
      <div class="card">
        <div class="card-body">
          <img src="${img}" alt="${(s.name||'Software')}">
          <div class="h2">${s.name || 'Software'}</div>
          <div class="small">${s.short_description || ''}</div>
          ${tags.length ? `<div class="row" style="flex-wrap:wrap;margin-top:8px;gap:6px;">${tags.map(t=>`<span class="badge">${t}</span>`).join('')}</div>` : ''}
          <details style="margin-top:10px;">
            <summary class="link">Ver detalles</summary>
            <div class="small" style="margin-top:6px;white-space:pre-wrap;">${s.features || 'Sin especificaciones.'}</div>
          </details>
          <div class="row" style="margin-top:12px;">
            <button class="btn" data-quote="${s.software_id}" data-name="${encodeURIComponent(s.name||'')}">Cotizar por WhatsApp</button>
          </div>
        </div>
      </div>
    `;
  }

  function render(rows) {
    list.innerHTML = rows.length ? rows.map(card).join('') : '<div class="small">No hay softwares activos.</div>';
    for (const btn of list.querySelectorAll('[data-quote]')) {
      btn.addEventListener('click', () => {
        const name = decodeURIComponent(btn.getAttribute('data-name') || '');
        window.MR_UTIL.openWhatsApp(msgTemplate(name));
      });
    }
  }

  load();
})();
