(function(){
  const grid = document.getElementById('adsGrid');
  const status = document.getElementById('status');
  const q = document.getElementById('q');
  const type = document.getElementById('type');
  const btnMore = document.getElementById('btnMore');

  if (!grid || !status || !q || !type || !btnMore) return;

  const PAGE_SIZE = 12;

  let all = [];
  let filtered = [];
  let shown = 0;

  const esc = (s) => String(s ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;");

  function guessType(ad){
    const vid = String(ad?.video_url || '').trim();
    const img = String(ad?.image_url || '').trim();
    if (vid) return 'video';
    if (img) return 'image';
    return 'none';
  }

  function matches(ad){
    const term = normCat(q.value);
    const tsel = type.value;

    const tt = guessType(ad);
    if (tsel !== 'all' && tt !== tsel) return false;

    if (!term) return true;

    const hay = normCat(`${ad.title || ''} ${ad.description || ''}`);
    return hay.includes(term);
  }

  function renderOne(ad){
    const title = esc(ad.title || 'Anuncio');
    const desc = esc(ad.description || '');
    const img = String(ad.image_url || '').trim();
    const vid = String(ad.video_url || '').trim();

    const media = vid
      ? `<video src="${esc(vid)}" controls playsinline preload="metadata"></video>`
      : (img
          ? `<img src="${esc(img)}" alt="${title}" loading="lazy" />`
          : `<div class="muted" style="padding:24px">Sin media</div>`);

    const card = document.createElement('article');
    card.className = 'ad-card';
    card.innerHTML = `
      <div class="ad-media">${media}</div>
      <div class="ad-body">
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `;
    return card;
  }

  function paint(reset){
    if (reset) {
      grid.innerHTML = '';
      shown = 0;
    }

    const slice = filtered.slice(shown, shown + PAGE_SIZE);
    slice.forEach(ad => grid.appendChild(renderOne(ad)));
    shown += slice.length;

    status.textContent = filtered.length
      ? `Mostrando ${Math.min(shown, filtered.length)} de ${filtered.length} anuncios`
      : 'No hay anuncios para mostrar.';

    btnMore.style.display = (shown < filtered.length) ? 'inline-flex' : 'none';
  }

  function applyFilters(){
    filtered = all.filter(a => matches(a));
    paint(true);
  }

  async function load(){
    try{
      status.textContent = 'Cargando anuncios...';
      const res = await fetch(API + '/ads');
      if (!res.ok) throw new Error('ads_fetch_failed');

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // Solo activos (por si el backend devuelve todo)
      all = list.filter(a => a && (a.active === true || a.active === 1 || a.active === 'true' || a.active === undefined));

      applyFilters();
    }catch(e){
      console.error(e);
      status.textContent = 'No se pudieron cargar los anuncios.';
    }
  }

  q.addEventListener('input', () => applyFilters());
  type.addEventListener('change', () => applyFilters());
  btnMore.addEventListener('click', () => paint(false));

  load();
})();
