(async function () {
  await window.MR_HEADER.initHeader();

  const elList = document.getElementById('product-list');
  const elError = document.getElementById('error');

  async function load() {
    elError.textContent = '';
    try {
      const products = await window.MR_API.get('/api/products');
      render(products || []);
    } catch (e) {
      elError.textContent = `No pude cargar productos: ${e.message}`;
    }
  }

  function card(p) {
    const price = Number(p.price || 0);
    const disc = Number(p.discount_percent || 0);
    const final = disc > 0 ? Math.round(price * (1 - disc / 100)) : price;
    const img = p.image_url || window.MR_CONFIG.DEFAULT_PRODUCT_IMG;
    return `
      <div class="card">
        <div class="card-body">
          <img src="${img}" alt="${(p.name||'Producto')}">
          <div style="display:flex;justify-content:space-between;gap:8px;">
            <div>
              <div class="h2">${p.name || 'Producto'}</div>
              <div class="small">${p.category || ''}</div>
            </div>
            <div style="text-align:right;">
              ${disc > 0 ? `<div class="small" style="text-decoration:line-through;color:var(--muted)">${window.MR_UTIL.fmtCOP(price)}</div>` : ''}
              <div style="font-weight:800">${window.MR_UTIL.fmtCOP(final)}</div>
            </div>
          </div>
          <div class="row" style="margin-top:10px;">
            <button class="btn" data-add="${p.product_id}" data-name="${encodeURIComponent(p.name||'')}" data-price="${final}" data-img="${encodeURIComponent(img)}">Agregar al carrito</button>
          </div>
        </div>
      </div>
    `;
  }

  function render(products) {
    elList.innerHTML = products.map(card).join('') || '<div class="small">No hay productos activos.</div>';
    for (const btn of elList.querySelectorAll('[data-add]')) {
      btn.addEventListener('click', () => {
        const pid = Number(btn.getAttribute('data-add'));
        const name = decodeURIComponent(btn.getAttribute('data-name') || '');
        const price = Number(btn.getAttribute('data-price') || 0);
        const img = decodeURIComponent(btn.getAttribute('data-img') || '');
        window.MR_CART.add({ product_id: pid, name, unit_price: price, image_url: img, quantity: 1 });
        btn.textContent = 'Agregado ✓';
        setTimeout(() => (btn.textContent = 'Agregar al carrito'), 900);
      });
    }
  }

  load();
})();
