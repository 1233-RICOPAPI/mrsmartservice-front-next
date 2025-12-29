(async function () {
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');
  const token = params.get('token');

  const el = document.getElementById('invoice');
  const elErr = document.getElementById('error');

  if (!orderId || !token) {
    elErr.textContent = 'Faltan parámetros de factura (orderId/token).';
    return;
  }

  try {
    const data = await window.MR_API.get(`/api/invoices/${orderId}?token=${encodeURIComponent(token)}`);
    render(data);
  } catch (e) {
    elErr.textContent = `No pude cargar la factura: ${e.message}`;
  }

  function render(data) {
    const c = data?.company || {};
    const o = data?.order || {};
    const items = data?.items || [];

    const rows = items.map((it) => {
      const total = Number(it.unit_price||0) * Number(it.quantity||1);
      return `<tr>
        <td>${it.name}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:right">${window.MR_UTIL.fmtCOP(it.unit_price)}</td>
        <td style="text-align:right">${window.MR_UTIL.fmtCOP(total)}</td>
      </tr>`;
    }).join('');

    el.innerHTML = `
      <div class="card" style="background:#fff;color:#111;">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
            <div>
              <div style="font-size:22px;font-weight:900;">${c.name || 'MR SmartService'}</div>
              <div style="font-size:13px;">NIT: ${c.nit || ''}</div>
              <div style="font-size:13px;">Tel: ${c.phone || ''}</div>
              <div style="font-size:13px;">Email: ${c.email || ''}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:18px;font-weight:800;">Factura</div>
              <div style="font-size:13px;">Orden: ${o.order_id || ''}</div>
              <div style="font-size:13px;">Fecha: ${o.created_at ? new Date(o.created_at).toLocaleString('es-CO') : ''}</div>
            </div>
          </div>

          <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;"/>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <div style="font-weight:800;margin-bottom:6px;">Cliente</div>
              <div style="font-size:13px;">Nombre: ${o.customer_name || ''}</div>
              <div style="font-size:13px;">Tel: ${o.customer_phone || ''}</div>
              ${o.customer_email ? `<div style="font-size:13px;">Email: ${o.customer_email}</div>` : ''}
              ${o.customer_nit ? `<div style="font-size:13px;">NIT: ${o.customer_nit}</div>` : ''}
              ${o.customer_company ? `<div style="font-size:13px;">Razón social: ${o.customer_company}</div>` : ''}
            </div>
            <div>
              <div style="font-weight:800;margin-bottom:6px;">Entrega</div>
              <div style="font-size:13px;">Modo: ${o.domicilio_modo || ''}</div>
              ${o.customer_city ? `<div style="font-size:13px;">Ciudad: ${o.customer_city}</div>` : ''}
              ${o.customer_address ? `<div style="font-size:13px;">Dirección: ${o.customer_address}</div>` : ''}
            </div>
          </div>

          <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;"/>

          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr>
                <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:8px 4px;">Producto</th>
                <th style="text-align:center;border-bottom:1px solid #e5e7eb;padding:8px 4px;">Cant</th>
                <th style="text-align:right;border-bottom:1px solid #e5e7eb;padding:8px 4px;">V/Unit</th>
                <th style="text-align:right;border-bottom:1px solid #e5e7eb;padding:8px 4px;">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div style="display:flex;justify-content:flex-end;margin-top:14px;">
            <div style="min-width:280px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;"><span>Envío</span><strong>${window.MR_UTIL.fmtCOP(o.domicilio_costo || 0)}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:16px;margin-top:6px;"><span>Total</span><strong>${window.MR_UTIL.fmtCOP(o.total_amount || 0)}</strong></div>
            </div>
          </div>

          <div style="margin-top:18px;display:flex;gap:10px;">
            <button class="btn" onclick="window.print()">Imprimir</button>
            <a class="btn" href="/index.html">Volver a la tienda</a>
          </div>
        </div>
      </div>
    `;
  }
})();
