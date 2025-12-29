(function () {
  function moneyCOP(n) {
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
      }).format(Number(n || 0));
    } catch {
      return '$' + (Number(n || 0) || 0);
    }
  }

  async function loadInvoice() {
    const app = document.getElementById('invoiceApp');
    if (!app) return;

    const params = new URLSearchParams(location.search);
    const orderId = params.get('order_id');
    const token = params.get('token');

    const btnPrint = document.getElementById('btnPrint');
    const btnBack = document.getElementById('btnBack');
    btnPrint?.addEventListener('click', () => window.print());
    btnBack?.addEventListener('click', () =>
      history.length > 1 ? history.back() : (location.href = 'index.html')
    );

    if (!orderId || !token) {
      app.innerHTML = '<p>Faltan datos de la factura.</p>';
      return;
    }

    let data;
    try {
      data = await apiFetch(
        `/invoices/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`
      );
    } catch (e) {
      console.error(e);
      app.innerHTML =
        '<p>No se pudo cargar la factura. Revisa el enlace o vuelve a intentar.</p>';
      return;
    }

    const company = data.company || {};
    const order = data.order || {};
    const items = Array.isArray(data.items) ? data.items : [];

    // Empresa
    const cName = company.name || 'MR SmartService';
    const cPhone = company.phone || (window.COMPANY_PHONE_DISPLAY || '');
    const cEmail = company.email || (window.COMPANY_EMAIL || '');
    document.getElementById('invCompany').textContent =
      `${cName} · ${cPhone} · ${cEmail}`.replace(/\s+·\s+$/, '');

    // Meta
    const created = order.created_at ? new Date(order.created_at) : new Date();
    document.getElementById('invMeta').textContent =
      `Orden #${order.order_id || orderId} · ${created.toLocaleString('es-CO')} · Estado: ${order.status || ''}`;

    // Cliente
    const name =
      order.customer_name ||
      order.domicilio_nombre ||
      order.customer ||
      'Cliente';

    const phone =
      order.customer_phone ||
      order.domicilio_telefono ||
      '';

    const email =
      order.customer_email ||
      order.payer_email ||
      order.email ||
      '';

    const city =
      order.customer_city ||
      order.domicilio_ciudad ||
      '';

    const address =
      order.customer_address ||
      [
        order.domicilio_direccion || '',
        order.domicilio_barrio || ''
      ].filter(Boolean).join(' - ') ||
      '';

    const custLines = [];
    if (name) custLines.push(`Cliente: ${name}`);
    if (phone) custLines.push(`Tel: ${phone}`);
    if (email) custLines.push(`Email: ${email}`);
    if (city || address) custLines.push(`Dirección: ${[city, address].filter(Boolean).join(' / ')}`);

    // Modo de entrega
    const normalizarCiudad = (c) =>
      String(c || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const esVillavicencio = (c) => normalizarCiudad(c) === 'villavicencio';

    const modo = String(order.domicilio_modo || '').toLowerCase();
    const shipCity = String(order.domicilio_ciudad || city || '').trim();
    const shipCost = Number(order.domicilio_costo || 0);

    if (modo === 'local') {
      custLines.push('Entrega: Recoger en el local (MR SmartService - C.C. Los Centauros)');
    } else if (modo === 'domicilio') {
      if (esVillavicencio(shipCity) && shipCost > 0) {
        custLines.push('Entrega: Domicilio Villavicencio');
      } else {
        custLines.push('Entrega: Contraentrega (fuera de Villavicencio)');
      }
    } else if (modo) {
      custLines.push(`Entrega: ${order.domicilio_modo}`);
    } else {
      custLines.push('Entrega: Recoger en el local');
    }

    document.getElementById('invCustomer').textContent = custLines.join(' · ');

    // Items
    const tbody = document.querySelector('#invTable tbody');
    tbody.innerHTML = '';

    let subtotal = 0;
    items.forEach(it => {
      const qty = Number(it.quantity || 0);
      const unit = Number(it.unit_price || 0);
      const line = unit * qty;
      subtotal += line;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.name || ''}</td>
        <td>${qty}</td>
        <td>${moneyCOP(unit)}</td>
        <td>${moneyCOP(line)}</td>
      `;
      tbody.appendChild(tr);
    });

    const shipping = Number(order.domicilio_costo || 0);
    const total = Number(order.total_amount || (subtotal + shipping));

    document.getElementById('invTotals').innerHTML = `
      <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><strong>${moneyCOP(subtotal)}</strong></div>
      <div style="display:flex;justify-content:space-between;"><span>Domicilio</span><strong>${moneyCOP(shipping)}</strong></div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:10px 0;" />
      <div style="display:flex;justify-content:space-between;font-size:16px;"><span>Total</span><strong>${moneyCOP(total)}</strong></div>
    `;
  }

  document.addEventListener('DOMContentLoaded', loadInvoice);
})();