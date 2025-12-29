(async function () {
  await window.MR_HEADER.initHeader();
  const list = document.getElementById('ad-list');
  const elError = document.getElementById('error');

  async function load() {
    try {
      const ads = await window.MR_API.get('/api/ads');
      render(ads || []);
    } catch (e) {
      elError.textContent = `No pude cargar publicidad: ${e.message}`;
    }
  }

  function card(a) {
    const img = a.image_url || window.MR_CONFIG.DEFAULT_PRODUCT_IMG;
    const link = a.link_url ? `<a class="btn" href="${a.link_url}" target="_blank" rel="noopener">Ver</a>` : '';
    const vid = a.video_url ? `<div class="small"><a class="link" href="${a.video_url}" target="_blank" rel="noopener">Video</a></div>` : '';
    return `
      <div class="card">
        <div class="card-body">
          <img src="${img}" alt="${a.title || 'Publicidad'}">
          <div class="h2">${a.title || 'Publicidad'}</div>
          <div class="small">${a.description || ''}</div>
          ${vid}
          <div class="row" style="margin-top:12px;">${link}</div>
        </div>
      </div>
    `;
  }

  function render(ads) {
    list.innerHTML = ads.length ? ads.map(card).join('') : '<div class="small">No hay anuncios activos.</div>';
  }

  load();
})();
