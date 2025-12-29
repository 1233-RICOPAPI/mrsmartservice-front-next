(async function () {
  await window.MR_HEADER.initHeader();

  const elItems = document.getElementById('cart-items');
  const elTotals = document.getElementById('cart-totals');
  const elMsg = document.getElementById('msg');

  const form = document.getElementById('shipping-form');
  const btnPay = document.getElementById('btn-pay');

  function render() {
    const cart = window.MR_CART.read();
    if (!cart.length) {
      elItems.innerHTML = '<div class="small">Tu carrito está vacío.</div>';
      elTotals.innerHTML = '';
      btnPay.disabled = true;
      return;
    }
    btnPay.disabled = false;

    elItems.innerHTML = cart.map((it) => {
      const img = it.image_url || window.MR_CONFIG.DEFAULT_PRODUCT_IMG;
      return `
        <div class="card">
          <div class="card-body" style="display:flex;gap:12px;align-items:center;">
            <img src="${img}" alt="${it.name}" style="width:72px;height:72px;object-fit:cover;border-radius:12px;border:1px solid var(--border);"/>
            <div style="flex:1;">
              <div style="font-weight:800;">${it.name}</div>
              <div class="small">${window.MR_UTIL.fmtCOP(it.unit_price)} c/u</div>
            </div>
            <div class="row" style="gap:8px;">
              <input class="input" style="width:90px;" type="number" min="1" value="${it.quantity}" data-qty="${it.product_id}"/>
              <button class="btn danger" data-remove="${it.product_id}">Quitar</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    for (const inp of elItems.querySelectorAll('[data-qty]')) {
      inp.addEventListener('change', () => {
        const pid = inp.getAttribute('data-qty');
        window.MR_CART.updateQty(pid, inp.value);
        renderTotals();
      });
    }
    for (const btn of elItems.querySelectorAll('[data-remove]')) {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-remove');
        window.MR_CART.remove(pid);
        render();
        renderTotals();
      });
    }

    renderTotals();
  }

  function currentShipping() {
    const mode = form.mode.value;
    const nombre = form.nombre.value.trim();
    const telefono = form.telefono.value.trim();
    const ciudad = form.ciudad.value.trim();
    const direccion = form.direccion.value.trim();
    const barrio = form.barrio.value.trim();
    const nota = form.nota.value.trim();

    let shipping_cost = 0;
    let finalMode = mode;
    const cityNorm = window.MR_UTIL.normalizeCity(ciudad);
    const isVillavo = cityNorm === 'villavicencio' || cityNorm.includes('villavicencio');

    if (mode === 'DOMICILIO') {
      if (isVillavo) {
        shipping_cost = 7000;
        finalMode = 'DOMICILIO_VILLAVICENCIO';
      } else {
        shipping_cost = 0;
        finalMode = 'CONTRAENTREGA';
      }
    }

    return { mode: finalMode, nombre, telefono, ciudad, direccion, barrio, nota, shipping_cost, isVillavo };
  }

  function renderTotals() {
    const cart = window.MR_CART.read();
    const sub = window.MR_CART.subtotal();
    const ship = currentShipping();
    const shipCost = ship.mode === 'DOMICILIO_VILLAVICENCIO' ? 7000 : 0;
    const total = sub + shipCost;

    const deliveryLabel = ship.mode === 'RECOGER'
      ? 'Recoger en local'
      : (ship.mode === 'DOMICILIO_VILLAVICENCIO' ? 'Domicilio (Villavicencio)' : 'Contraentrega (fuera de Villavicencio)');

    elTotals.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="row" style="justify-content:space-between;"><span>Subtotal</span><strong>${window.MR_UTIL.fmtCOP(sub)}</strong></div>
          <div class="row" style="justify-content:space-between;"><span>Entrega</span><span class="small">${deliveryLabel}</span></div>
          <div class="row" style="justify-content:space-between;"><span>Envío</span><strong>${window.MR_UTIL.fmtCOP(shipCost)}</strong></div>
          <div class="row" style="justify-content:space-between;margin-top:8px;"><span>Total</span><strong>${window.MR_UTIL.fmtCOP(total)}</strong></div>
        </div>
      </div>
    `;

    // Toggle address fields
    const showAddr = ship.mode !== 'RECOGER';
    document.getElementById('addr-fields').style.display = showAddr ? 'grid' : 'none';
    document.getElementById('addr-hint').textContent = showAddr
      ? (ship.mode === 'CONTRAENTREGA' ? 'Fuera de Villavicencio: se envía a contraentrega (no se cobra envío aquí).' : 'Villavicencio: domicilio + $7.000 COP.')
      : 'Recoger en el local: no necesitas dirección.';
  }

  form.addEventListener('change', renderTotals);

  btnPay.addEventListener('click', async () => {
    elMsg.textContent = '';
    const cart = window.MR_CART.read();
    if (!cart.length) return;

    const ship = currentShipping();
    if (!ship.nombre || !ship.telefono) {
      elMsg.textContent = 'Por favor escribe tu nombre y teléfono.';
      return;
    }
    if (ship.mode !== 'RECOGER') {
      if (!ship.ciudad || !ship.direccion) {
        elMsg.textContent = 'Por favor completa ciudad y dirección.';
        return;
      }
    }

    const sub = window.MR_CART.subtotal();
    const shipCost = ship.mode === 'DOMICILIO_VILLAVICENCIO' ? 7000 : 0;
    const total = sub + shipCost;

    const items = cart.map((it) => ({
      product_id: it.product_id,
      title: it.name,
      quantity: it.quantity,
      unit_price: it.unit_price,
    }));

    // Guardamos datos del comprador para autocompletar WhatsApp de Softwares
    localStorage.setItem('MR_BUYER', JSON.stringify({ name: ship.nombre, phone: ship.telefono }));

    try {
      if (ship.mode === 'CONTRAENTREGA') {
        // No pasarela: se registra orden pendiente y se envía a WhatsApp
        const res = await window.MR_API.post('/api/payments/confirm', {
          status: 'PENDING',
          payment_id: '',
          items,
          total,
          shipping: {
            mode: ship.mode,
            nombre: ship.nombre,
            telefono: ship.telefono,
            ciudad: ship.ciudad,
            direccion: ship.direccion,
            barrio: ship.barrio,
            nota: ship.nota,
            shipping_cost: 0,
          },
        });

        const lines = [];
        lines.push('Pedido (contraentrega) ✅');
        lines.push(`Cliente: ${ship.nombre} – Tel: ${ship.telefono}`);
        lines.push(`Entrega: Contraentrega`);
        lines.push(`Ciudad: ${ship.ciudad}`);
        lines.push(`Dirección: ${ship.direccion}${ship.barrio ? ' – ' + ship.barrio : ''}`);
        if (ship.nota) lines.push(`Nota: ${ship.nota}`);
        lines.push('');
        lines.push('Productos:');
        for (const it of cart) {
          const t = Number(it.unit_price) * Number(it.quantity);
          lines.push(`- ${it.name} x${it.quantity} = ${window.MR_UTIL.fmtCOP(t)}`);
        }
        lines.push('');
        lines.push(`Subtotal: ${window.MR_UTIL.fmtCOP(sub)}`);
        lines.push(`Envío: ${window.MR_UTIL.fmtCOP(0)}`);
        lines.push(`Total: ${window.MR_UTIL.fmtCOP(total)}`);
        if (res?.order_id) lines.push(`Orden ID: ${res.order_id}`);
        if (res?.invoice_url) lines.push(`Factura: ${res.invoice_url}`);

        window.MR_UTIL.openWhatsApp(lines.join('\n'));
        window.MR_CART.clear();
        location.href = '/index.html';
        return;
      }

      // Pasarela (MP): guardamos checkout y creamos preferencia
      const checkout = {
        items: [...items, ...(shipCost > 0 ? [{ type: 'shipping', product_id: 'SHIP', title: 'Envío', unit_price: shipCost, quantity: 1 }] : [])],
        shipping: {
          mode: ship.mode,
          nombre: ship.nombre,
          telefono: ship.telefono,
          ciudad: ship.ciudad,
          direccion: ship.direccion,
          barrio: ship.barrio,
          nota: ship.nota,
          shipping_cost: shipCost,
        },
        total,
      };
      localStorage.setItem('MR_LAST_CHECKOUT', JSON.stringify(checkout));

      const pref = await window.MR_API.post('/api/payments/create', { items: checkout.items });
      const init = pref?.init_point || pref?.sandbox_init_point;
      if (!init) throw new Error('No se recibió init_point de MercadoPago');

      location.href = init;
    } catch (e) {
      elMsg.textContent = `Error: ${e.message}`;
    }
  });

  render();
  renderTotals();
})();
