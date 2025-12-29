(async function () {
  await window.MR_HEADER.initHeader();

  const params = new URLSearchParams(location.search);
  const statusRaw = (params.get('status') || params.get('collection_status') || params.get('payment_status') || '').toString();
  const paymentId = (params.get('payment_id') || params.get('collection_id') || '').toString();
  const status = statusRaw.toUpperCase();

  const elInfo = document.getElementById('order-info');
  const elMsg = document.getElementById('msg');
  const billingForm = document.getElementById('billing-form');
  const btnWhatsapp = document.getElementById('btn-whatsapp');

  function readCheckout() {
    try { return JSON.parse(localStorage.getItem('MR_LAST_CHECKOUT') || 'null'); } catch { return null; }
  }

  const checkout = readCheckout();
  if (!checkout) {
    elInfo.innerHTML = '<div class="small">No encontré la información del checkout. Si vienes de MercadoPago, vuelve a intentar desde el carrito.</div>';
    btnWhatsapp.disabled = true;
    return;
  }

  // Confirmar pago/orden
  let confirmed = null;
  try {
    const cacheKey = 'MR_LAST_CONFIRMED';
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && cached.paymentId === paymentId && cached.order_id) {
      confirmed = cached;
    } else {
      confirmed = await window.MR_API.post('/api/payments/confirm', {
        status: status || 'PENDING',
        payment_id: paymentId,
        items: checkout.items,
        total: checkout.total,
        shipping: checkout.shipping,
      });
      localStorage.setItem(cacheKey, JSON.stringify({ ...confirmed, paymentId }));
    }
  } catch (e) {
    elMsg.textContent = `Error confirmando orden: ${e.message}`;
    btnWhatsapp.disabled = true;
    return;
  }

  const orderId = confirmed.order_id;
  const invoiceUrl = confirmed.invoice_url;
  let invoiceToken = confirmed.invoice_token;

  if (status === 'APPROVED' || status === 'APROBADO') {
    window.MR_CART.clear();
    localStorage.removeItem('MR_LAST_CHECKOUT');
  }

  // Render info
  const sub = (checkout.items || []).filter((x)=>x.product_id !== 'SHIP' && x.type !== 'shipping')
    .reduce((a, it) => a + Number(it.unit_price||0) * Number(it.quantity||1), 0);
  const shipCost = (checkout.shipping?.shipping_cost || 0);
  const total = checkout.total || (sub + shipCost);

  elInfo.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="h2">${status === 'APPROVED' ? 'Pago aprobado ✅' : (status ? `Estado: ${status}` : 'Orden registrada')}</div>
        <div class="small">Orden ID: <strong>${orderId}</strong></div>
        ${invoiceUrl ? `<div class="small">Factura: <a class="link" href="${invoiceUrl}" target="_blank" rel="noopener">abrir</a></div>` : ''}
      </div>
    </div>
  `;

  // Guardar buyer por defecto
  const buyerSaved = (() => { try { return JSON.parse(localStorage.getItem('MR_BUYER')||'null'); } catch { return null; } })();
  if (buyerSaved?.name) billingForm.name.value = buyerSaved.name;
  if (buyerSaved?.phone) billingForm.phone.value = buyerSaved.phone;

  btnWhatsapp.addEventListener('click', async () => {
    elMsg.textContent = '';
    try {
      const data = {
        name: billingForm.name.value.trim(),
        nit: billingForm.nit.value.trim(),
        company: billingForm.company.value.trim(),
        email: billingForm.email.value.trim(),
        phone: billingForm.phone.value.trim(),
      };

      if (!data.name || !data.phone) {
        elMsg.textContent = 'Nombre y teléfono son obligatorios.';
        return;
      }

      // Persist buyer for softwares
      localStorage.setItem('MR_BUYER', JSON.stringify({ name: data.name, phone: data.phone }));

      // Guardar billing en backend (si hay invoiceToken)
      if (invoiceToken) {
        const r = await window.MR_API.patch(`/api/invoices/${orderId}/billing?token=${encodeURIComponent(invoiceToken)}`, data);
        if (r?.invoice_token) invoiceToken = r.invoice_token;
      }

      const ship = checkout.shipping || {};
      const deliveryLabel = ship.mode === 'RECOGER'
        ? 'Recoger en local'
        : (ship.mode === 'DOMICILIO_VILLAVICENCIO' ? 'Domicilio (Villavicencio) + $7.000' : (ship.mode || 'Domicilio'));

      const lines = [];
      lines.push('Compra realizada ✅');
      lines.push(`Cliente: ${data.name}`);
      if (data.nit || data.company) lines.push(`NIT/Razón social: ${data.nit || ''}${data.company ? ' / ' + data.company : ''}`.trim());
      if (data.email) lines.push(`Correo: ${data.email}`);
      lines.push(`Tel: ${data.phone}`);
      lines.push('');
      lines.push(`Entrega: ${deliveryLabel}`);
      if (ship.mode !== 'RECOGER') {
        if (ship.ciudad) lines.push(`Ciudad: ${ship.ciudad}`);
        if (ship.direccion) lines.push(`Dirección: ${ship.direccion}${ship.barrio ? ' – ' + ship.barrio : ''}`);
        if (ship.nota) lines.push(`Nota: ${ship.nota}`);
      }
      lines.push('');
      lines.push('Productos:');
      for (const it of (checkout.items || []).filter((x)=>x.product_id !== 'SHIP' && x.type !== 'shipping')) {
        const t = Number(it.unit_price||0) * Number(it.quantity||1);
        lines.push(`- ${it.title || it.name || 'Producto'} x${it.quantity} = ${window.MR_UTIL.fmtCOP(t)}`);
      }
      lines.push('');
      lines.push(`Subtotal: ${window.MR_UTIL.fmtCOP(sub)}`);
      lines.push(`Envío: ${window.MR_UTIL.fmtCOP(shipCost)}`);
      lines.push(`Total: ${window.MR_UTIL.fmtCOP(total)}`);
      lines.push(`Orden ID: ${orderId}`);
      if (invoiceUrl) lines.push(`Factura: ${invoiceUrl}`);

      window.MR_UTIL.openWhatsApp(lines.join('\n'));
    } catch (e) {
      elMsg.textContent = `Error: ${e.message}`;
    }
  });
})();
