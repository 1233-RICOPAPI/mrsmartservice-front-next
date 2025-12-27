/********************
 * MR SmartService - Carrito & Checkout
 ********************/

/* ============== ESTADO DEL CARRITO ============== */
let carrito;
try {
  carrito = JSON.parse(localStorage.getItem('carrito')) || [];
} catch {
  carrito = [];
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const totalUnidades = carrito.reduce((a, b) => a + (b.cant || 1), 0);
  el.textContent = totalUnidades;
}

/* ============== HELPERS DE PRECIO (DESCUENTO) ============== */

// Convierte valores monetarios a número.
// Acepta números o strings formateados ("$22.345", "22.345", "22,345", "22345").
function parseMoney(v){
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (v === null || v === undefined) return 0;
  let s = String(v).trim();
  if (!s) return 0;

  // Elimina todo excepto dígitos y separadores
  s = s.replace(/[^0-9.,-]/g, '');

  // Si tiene . y , asumimos formato 1.234,56 (.), miles / , decimales
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else if (s.includes(',') && !s.includes('.')) {
    // Si solo hay coma: 22,345 (miles) o 22,34 (decimales)
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length === 3) s = parts[0] + parts[1];
    else s = s.replace(/,/g, '.');
  } else if (s.includes('.') && !s.includes(',')) {
    // Si solo hay punto: 22.345 (miles) o 22.34 (decimales)
    const parts = s.split('.');
    if (parts.length === 2 && parts[1].length === 3) s = parts[0] + parts[1];
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
/**
 * Precio base del ítem (sin descuento).
 * Soporta:
 *  - items nuevos:  it.precio_base
 *  - items viejos:  it.precio o it.price
 */
function getItemBasePrice(it) {
  if (!it) return 0;
  if (typeof it.precio_base !== 'undefined') {
    return parseMoney(it.precio_base);
  }
  return parseMoney(it.precio ?? it.price ?? it.unit_price ?? it.unitPrice ?? 0);
}

/**
 * Descuento porcentual guardado en el ítem.
 */
function getItemDiscount(it) {
  return Number(it.discount_percent ?? it.descuento ?? 0);
}

/**
 * Precio final con descuento aplicado.
 */
function getItemFinalPrice(it) {
  const base = getItemBasePrice(it);
  const discount = getItemDiscount(it);
  if (!discount) return base;
  return Math.round(base * (1 - discount / 100));
}

/* ============== OPERACIONES BÁSICAS ============== */
function addToCart(item) {
  // item: { id, nombre, price, discount_percent, imagen, cant? }
  const idx = carrito.findIndex((x) => +x.id === +item.id);
  const basePrice = Number(item.precio_base ?? item.precio ?? item.price ?? 0);
  const discount = Number(item.discount_percent ?? item.descuento ?? 0);

  if (idx >= 0) {
    carrito[idx].cant = (carrito[idx].cant || 1) + (item.cant || 1);
    carrito[idx].activo = carrito[idx].activo !== false;
  } else {
    carrito.push({
      id: item.id,
      nombre: item.nombre || item.name || 'Producto',
      // guardamos precio base + descuento; el precio final se calcula con helpers
      precio_base: basePrice,
      discount_percent: discount,
      imagen:
        item.imagen ||
        (Array.isArray(item.images) ? item.images[0] : item.image_url) ||
        '',
      cant: item.cant || 1,
      activo: true,
    });
  }
  guardarCarrito();
}

/* ============== RENDER DEL CARRITO (carrito.html) ============== */

function mostrarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const totalEl = document.getElementById('total');

  if (!lista || !totalEl) return;

  if (!carrito.length) {
    lista.innerHTML = `
      <p style="padding: 1rem; text-align:center; color: var(--text-light);">
        Tu carrito está vacío.
      </p>
    `;
    totalEl.textContent = money(0);
    return;
  }

  let total = 0;

  lista.innerHTML = carrito
    .map((it, idx) => {
      const cant = it.cant || 1;
      const unitBase = getItemBasePrice(it);
      const unitFinal = getItemFinalPrice(it);
      const sub = unitFinal * cant;
      const activo = it.activo !== false;

      if (activo) total += sub;

      const img =
        it.imagen || 'https://via.placeholder.com/120x120.png?text=Producto';

      // mostrar precio tachado si hay descuento
      const tieneDescuento = getItemDiscount(it) > 0;
      const priceHtml = tieneDescuento
        ? `
          <div class="cart-item-price">
            <div>
              <small style="text-decoration:line-through; color:#94a3b8;">
                ${money(unitBase)}
              </small>
            </div>
            <strong>${money(sub)}</strong>
          </div>
        `
        : `<div class="cart-item-price">${money(sub)}</div>`;

      return `
        <div class="cart-item ${!activo ? 'cart-item-off' : ''}">
          <div class="cart-item-main">
            <input
              type="checkbox"
              class="cart-item-check"
              data-i="${idx}"
              data-op="toggle"
              ${activo ? 'checked' : ''}
            >
            <img src="${img}" alt="${it.nombre}" class="cart-item-img">
            <div class="cart-item-info">
              <h4>${it.nombre}</h4>
              <small style="color:#888">ID: ${it.id}</small>
            </div>
          </div>

          <div class="cart-item-actions">
            <div class="qty">
              <button data-i="${idx}" data-op="minus">–</button>
              <strong>${cant}</strong>
              <button data-i="${idx}" data-op="plus">+</button>
            </div>
            ${priceHtml}
            <button class="cart-item-remove" data-i="${idx}" data-op="remove">
              ✕
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  totalEl.textContent = money(total);

  // Delegación de eventos (cantidad, eliminar, activar/desactivar)
  lista.querySelectorAll('button, input[type="checkbox"]').forEach((el) => {
    const idx = Number(el.dataset.i);
    const op = el.dataset.op;

    if (Number.isNaN(idx) || !op) return;

    if (op === 'plus') {
      el.addEventListener('click', () => {
        carrito[idx].cant = (carrito[idx].cant || 1) + 1;
        guardarCarrito();
        mostrarCarrito();
      });
    }

    if (op === 'minus') {
      el.addEventListener('click', () => {
        const actual = carrito[idx].cant || 1;
        if (actual <= 1) return;
        carrito[idx].cant = actual - 1;
        guardarCarrito();
        mostrarCarrito();
      });
    }

    if (op === 'remove') {
      el.addEventListener('click', () => {
        carrito.splice(idx, 1);
        guardarCarrito();
        mostrarCarrito();
      });
    }

    if (op === 'toggle' && el.type === 'checkbox') {
      el.addEventListener('change', () => {
        carrito[idx].activo = el.checked;
        guardarCarrito();
        mostrarCarrito();
      });
    }
  });
}

/* ============== HELPERS CIUDAD & COORDINADORA ============== */

function normalizarCiudad(ciudad) {
  return (ciudad || '')
    .toLowerCase()
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .trim();
}

function esVillavicencio(ciudad) {
  return normalizarCiudad(ciudad) === 'villavicencio';
}

function esAcacias(ciudad) {
  return normalizarCiudad(ciudad) === 'acacias';
}

// Si quieres usar "local" solo para Villavicencio
function esCiudadLocal(ciudad) {
  return esVillavicencio(ciudad);
}

/* ============== MODAL DE ENVÍO & CHECKOUT ============== */

let checkoutItems = [];
let checkoutSubtotal = 0;
let currentShippingCost = 0; // costo de envío actual en el modal

// Persistencia de modo de entrega (para que no se pierda al cerrar / recargar)
const MR_SHIP_PREF_KEY = 'mr_shipping_pref';
let shippingAllowed = false; // inicia en false hasta que elija una opción válida

function loadShippingPref() {
  try {
    return JSON.parse(localStorage.getItem(MR_SHIP_PREF_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveShippingPref(pref) {
  try {
    localStorage.setItem(MR_SHIP_PREF_KEY, JSON.stringify(pref || null));
  } catch {}
}

function openCheckoutModal(items) {
  checkoutItems = items || [];

  const modal = document.getElementById('modalEnvio');
  if (!modal) return;

  const subEl = document.getElementById('modalSubtotal');
  const totalEl = document.getElementById('modalTotal');
  const btnConfirm = document.getElementById('modalEnvioConfirmar');
  const radioLocal = document.querySelector(
    'input[name="shippingMode"][value="local"]'
  );
  const radioDom = document.querySelector(
    'input[name="shippingMode"][value="domicilio"]'
  );
  const shippingTextEl = document.getElementById('summaryShipping');
  const ciudadInput = document.getElementById('shipCiudad');
  const formWrap = document.getElementById('shippingFormWrapper');
  const noticeEl = document.getElementById('shippingOutsideNotice');

  // Subtotal con precio final (ya con descuento)
  checkoutSubtotal = checkoutItems.reduce(
    (a, b) => a + getItemFinalPrice(b) * (b.cant || 1),
    0
  );

  if (subEl) subEl.textContent = money(checkoutSubtotal);

  // ===== Reset estado del modal (IMPORTANTE: antes de aplicar pref) =====
  shippingAllowed = false;
  currentShippingCost = 0;

  if (btnConfirm) btnConfirm.disabled = true;
  if (radioLocal) radioLocal.checked = false;
  if (radioDom) radioDom.checked = false;

  if (shippingTextEl) {
    shippingTextEl.textContent = 'Por definir';
    shippingTextEl.style.color = '';
  }

  if (formWrap) formWrap.classList.add('hidden');
  if (noticeEl) noticeEl.classList.add('hidden');

  // Limpiar inputs del formulario de envío (dejando ciudad por defecto)
  ['shipNombre', 'shipDireccion', 'shipBarrio', 'shipTelefono', 'shipNota'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  if (ciudadInput) ciudadInput.value = 'Villavicencio';

  // ===== Prefill: mantener selección de entrega si el usuario cierra/abre de nuevo =====
  const pref = loadShippingPref();
  if (pref) {
    if (pref.mode === 'domicilio' && radioDom) radioDom.checked = true;
    if (pref.mode === 'local' && radioLocal) radioLocal.checked = true;
    if (pref.ciudad && ciudadInput) ciudadInput.value = pref.ciudad;
  }

  // Total inicial (sin envío)
  if (totalEl) totalEl.textContent = money(checkoutSubtotal);

  // Si hay pref marcada, recalcula para habilitar/bloquear botón correctamente
  recalcularEnvioYTotal();

  modal.classList.remove('hidden');
}

function closeCheckoutModal() {
  const modal = document.getElementById('modalEnvio');
  if (modal) modal.classList.add('hidden');
}

/**
 * Recalcula costo de envío y total visual
 * - Villavicencio: domicilio $7.000
 * - Otros municipios: por ahora no disponible en pago online
 * - Retiro en punto: gratis
 */
function recalcularEnvioYTotal() {
  const radioLocal = document.querySelector(
    'input[name="shippingMode"][value="local"]'
  );
  const radioDom = document.querySelector(
    'input[name="shippingMode"][value="domicilio"]'
  );
  const shippingTextEl = document.getElementById('summaryShipping');
  const ciudadInput = document.getElementById('shipCiudad');
  const formWrap = document.getElementById('shippingFormWrapper');
  const totalEl = document.getElementById('modalTotal');
  const btnConfirmEl = document.getElementById('modalEnvioConfirmar');
  const noticeEl = document.getElementById('shippingOutsideNotice');

  // Reset por defecto cada vez que recalcula (evita “estado viejo”)
  let envioCosto = 0;
  shippingAllowed = false;

  const ciudad = ciudadInput ? ciudadInput.value : '';

  // Si NO eligió nada todavía:
  if ((!radioDom || !radioDom.checked) && (!radioLocal || !radioLocal.checked)) {
    if (shippingTextEl) {
      shippingTextEl.textContent = 'Por definir';
      shippingTextEl.style.color = '';
    }
    if (formWrap) formWrap.classList.add('hidden');
    if (noticeEl) noticeEl.classList.add('hidden');
    if (btnConfirmEl) btnConfirmEl.disabled = true;
    if (totalEl) totalEl.textContent = money(checkoutSubtotal);
    currentShippingCost = 0;
    return;
  }

  // Si elige DOMICILIO
  if (radioDom && radioDom.checked) {
    if (esVillavicencio(ciudad)) {
      envioCosto = 7000;
      shippingAllowed = true;
      if (shippingTextEl) {
        shippingTextEl.textContent = '$ 7.000 (domicilio Villavicencio)';
        shippingTextEl.style.color = '#333';
      }
    } else {
      envioCosto = 0;
      shippingAllowed = false;
      if (shippingTextEl) {
        shippingTextEl.textContent =
          'Por ahora solo tenemos domicilio en Villavicencio. ' +
          'Para otros municipios, el pago online no está disponible.';
        shippingTextEl.style.color = '#b00020';
      }
    }
    if (formWrap) formWrap.classList.remove('hidden');
  }

  // Si elige RETIRO EN PUNTO
  if (radioLocal && radioLocal.checked) {
    envioCosto = 0;
    shippingAllowed = true;
    if (shippingTextEl) {
      shippingTextEl.textContent = 'Gratis (retiras en el local)';
      shippingTextEl.style.color = '#00a650';
    }
    if (formWrap) formWrap.classList.add('hidden');
  }

  currentShippingCost = envioCosto;

  if (btnConfirmEl) btnConfirmEl.disabled = !shippingAllowed;
  if (noticeEl) noticeEl.classList.toggle('hidden', shippingAllowed);

  const total = checkoutSubtotal + envioCosto;
  if (totalEl) totalEl.textContent = money(total);
}

// Datos de envío
function collectShippingData(mode) {
  // Si es retiro en tienda, no necesitamos datos de domicilio
  if (mode !== 'domicilio') {
    return {
      mode: 'local',
      carrier_mode: 'retiro',
      shipping_cost: 0,
    };
  }

  const nombre = (document.getElementById('shipNombre')?.value || '').trim();
  const direccion = (document.getElementById('shipDireccion')?.value || '').trim();
  const barrio = (document.getElementById('shipBarrio')?.value || '').trim();
  const ciudad = (document.getElementById('shipCiudad')?.value || '').trim();

  // Por ahora: domicilio SOLO en Villavicencio
  if (!esVillavicencio(ciudad)) {
    showToast('Por ahora solo tenemos domicilio en Villavicencio');
    return null;
  }

  const telefono = (document.getElementById('shipTelefono')?.value || '').trim();
  const nota = (document.getElementById('shipNota')?.value || '').trim();

  if (!nombre || !direccion || !barrio || !ciudad || !telefono) {
    showToast('Completa todos los datos de envío');
    return null;
  }

  let carrier_mode = 'coordinadora';
  if (esVillavicencio(ciudad)) carrier_mode = 'villavicencio';
  else if (esAcacias(ciudad)) carrier_mode = 'acacias';

  return {
    mode: 'domicilio',
    carrier_mode,
    shipping_cost: currentShippingCost,
    nombre,
    direccion,
    barrio,
    ciudad,
    telefono,
    nota,
  };
}

async function startCheckoutWithShipping(mode) {
  if (!shippingAllowed) {
    showToast(
      'Por ahora el pago online está disponible solo para Villavicencio o retiro en tienda'
    );
    return;
  }

  if (!checkoutItems || !checkoutItems.length) {
    showToast('No hay productos para pagar');
    return;
  }

  const shipping = collectShippingData(mode);
  if (!shipping) return;

  try {
    // Normaliza datos del carrito para evitar ítems inválidos en el backend
    const items = checkoutItems.map((it) => ({
      // El backend acepta product_id (legacy), productId o id. Forzamos a número si aplica.
      product_id: it.product_id ?? it.productId ?? it.id ?? null,
      title: it.nombre || it.title || it.name || 'Producto',
      // Siempre enviamos número (COP) para que no quede como string formateado
      unit_price: parseMoney(getItemFinalPrice(it)),
      quantity: Number(it.cant || it.quantity || 1),
      currency_id: 'COP',
    }));

    // Agregar el domicilio como ítem separado (marcado explícitamente como shipping)
    // Importante: NO dejar product_id en null, porque el backend lo toma como ítem inválido.
    if (Number(shipping?.shipping_cost || 0) > 0) {
      items.push({
        product_id: 'SHIP',
        type: 'shipping',
        title: 'Domicilio Villavicencio',
        unit_price: Number(shipping.shipping_cost),
        quantity: 1,
        currency_id: 'COP',
      });
    }

    // Persistir preferencia de entrega
    saveShippingPref({
      mode: shipping.mode === 'domicilio' ? 'domicilio' : 'local',
      ciudad: shipping.ciudad || '',
    });

    const resp = await fetch(API + '/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, shipping }),
    });

    if (!resp.ok) {
      console.error('Error en checkout:', resp.status, await resp.text());
      showToast('No se pudo iniciar el pago, intenta de nuevo');
      return;
    }

    const data = await resp.json();
    if (!data.init_point) {
      showToast('Respuesta inválida de Mercado Pago');
      return;
    }

    window.location.href = data.init_point;
  } catch (err) {
    console.error('Error en checkout:', err);
    showToast('Error de conexión al iniciar el pago');
  }
}

/* ============== INIT DEL MODAL (radios y botones) ============== */

function initCheckoutModal() {
  const modal = document.getElementById('modalEnvio');
  if (!modal) return;

  const btnCancel = document.getElementById('modalEnvioCancelar');
  const btnConfirm = document.getElementById('modalEnvioConfirmar');
  const radios = document.querySelectorAll('input[name="shippingMode"]');
  const ciudadInput = document.getElementById('shipCiudad'); // ✅ FIX: ahora sí existe en este scope

  // Cerrar modal
  if (btnCancel) {
    btnCancel.addEventListener('click', () => closeCheckoutModal());
  }

  // Cambio en radios
  if (radios.length) {
    radios.forEach((r) => {
      r.addEventListener('change', () => {
        recalcularEnvioYTotal();
        if (btnConfirm) btnConfirm.disabled = !shippingAllowed;
      });
    });
  }

  // Cambio en ciudad (si está seleccionado domicilio)
  if (ciudadInput) {
    ciudadInput.addEventListener('input', () => {
      const radioDom = document.querySelector(
        'input[name="shippingMode"][value="domicilio"]'
      );
      if (radioDom && radioDom.checked) {
        recalcularEnvioYTotal();
      }
    });
  }

  // Botón Continuar
  if (btnConfirm) {
    btnConfirm.addEventListener('click', async () => {
      const sel = document.querySelector('input[name="shippingMode"]:checked');
      if (!sel) {
        showToast('Elige cómo quieres recibir tu compra');
        return;
      }
      await startCheckoutWithShipping(sel.value);
    });
  }
}

/* ============== FLUJO COMPLETO: FINALIZAR COMPRA (carrito.html) ============== */

async function finalizarCompra() {
  if (!carrito.length) {
    showToast('Tu carrito está vacío');
    return;
  }

  const activos = carrito.filter((it) => it.activo !== false);
  if (!activos.length) {
    showToast('Selecciona al menos un producto para continuar con la compra');
    return;
  }

  const activosValidos = activos.map((it) => ({ ...it }));
  openCheckoutModal(activosValidos);
}

/* ============== INICIALIZACIÓN DE PÁGINA DE CARRITO ============== */

function initCarritoPage() {
  const btn = document.getElementById('finalizarCompra');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      finalizarCompra();
    });
  }
  mostrarCarrito();
  initCheckoutModal();
  handlePostPaymentReturn();
}

/**
 * Aseguramos que initCarritoPage se ejecute siempre en carrito.html
 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarritoPage);
  } else {
    initCarritoPage();
  }
}

// (Opcional, por si el HTML usa onclick="finalizarCompra()")
if (typeof window !== 'undefined') {
  window.finalizarCompra = finalizarCompra;
}

async function handlePostPaymentReturn() {
  try {
    const params = new URLSearchParams(window.location.search);
    const status = (
      params.get('status') ||
      params.get('collection_status') ||
      ''
    ).toLowerCase();
    if (!status) return;

    const paymentId = params.get('payment_id') || params.get('collection_id');
    if (status !== 'approved') {
      cleanUrlParams();
      return;
    }
    if (!paymentId) return;

    const confirm = await apiFetch('/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId }),
    });

    cleanUrlParams();

    try {
      localStorage.removeItem('carrito');
    } catch {}
    try {
      localStorage.removeItem('carrito_entrega');
    } catch {}

    await showInvoiceModal(confirm);
  } catch (e) {
    console.error('post-payment error', e);
  }
}

function cleanUrlParams() {
  const url = new URL(window.location.href);
  [
    'status',
    'payment_id',
    'collection_id',
    'collection_status',
    'preference_id',
    'external_reference',
    'merchant_order_id',
  ].forEach((k) => url.searchParams.delete(k));
  window.history.replaceState({}, document.title, url.toString());
}

function moneyCOP(n) {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(n || 0));
  } catch {
    return '$' + (Number(n || 0) || 0);
  }
}

async function showInvoiceModal(confirm) {
  const invoiceUrl = confirm?.invoice_url || null;
  const orderId = confirm?.order_id || '';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;max-width:560px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,.2);padding:18px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
        <div>
          <h3 style="margin:0 0 6px 0;">✅ Pago aprobado</h3>
          <div style="color:#6b7280;font-size:14px;">Orden #${orderId}</div>
        </div>
        <button id="invClose" style="border:0;background:#f3f4f6;border-radius:10px;padding:8px 10px;cursor:pointer;">✕</button>
      </div>

      <div style="margin-top:14px;display:grid;gap:10px;">
        <button id="btnMostrador" style="border:0;border-radius:12px;padding:12px 14px;background:#111827;color:#fff;cursor:pointer;">
          Ver factura mostrador (imprimible)
        </button>

        <button id="btnElectronica" style="border:0;border-radius:12px;padding:12px 14px;background:#f3f4f6;color:#111827;cursor:pointer;">
          Solicitar factura electrónica (WhatsApp)
        </button>

        <div id="elcForm" style="display:none;margin-top:6px;border:1px solid #e5e7eb;border-radius:12px;padding:12px;">
          <div style="font-weight:600;margin-bottom:8px;">Datos para factura electrónica</div>
          <div style="display:grid;gap:8px;">
            <input id="elcNit" placeholder="NIT / CC" style="padding:10px;border:1px solid #e5e7eb;border-radius:10px;" />
            <input id="elcName" placeholder="Nombre o razón social" style="padding:10px;border:1px solid #e5e7eb;border-radius:10px;" />
            <input id="elcEmail" placeholder="Correo" style="padding:10px;border:1px solid #e5e7eb;border-radius:10px;" />
            <input id="elcPhone" placeholder="Teléfono" style="padding:10px;border:1px solid #e5e7eb;border-radius:10px;" />
            <button id="btnSendWA" style="border:0;border-radius:12px;padding:12px 14px;background:#16a34a;color:#fff;cursor:pointer;">
              Enviar solicitud por WhatsApp
            </button>
            <div style="color:#6b7280;font-size:12px;line-height:1.3;">
              Se abrirá WhatsApp con el mensaje armado. Si deseas, puedes adjuntar la factura mostrador (PDF) desde WhatsApp.
            </div>
          </div>
        </div>

        <div style="color:#6b7280;font-size:12px;line-height:1.35;">
          * La factura mostrador es una página imprimible (puedes “Guardar como PDF”).<br/>
          * La factura electrónica se solicita por WhatsApp con los datos del cliente y el detalle de compra.
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#invClose').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  modal.querySelector('#btnMostrador').addEventListener('click', () => {
    if (invoiceUrl) window.open(invoiceUrl, '_blank');
    else alert('No se pudo generar el enlace de factura.');
  });

  modal.querySelector('#btnElectronica').addEventListener('click', async () => {
    const box = modal.querySelector('#elcForm');
    const show = box.style.display === 'none';
    box.style.display = show ? 'block' : 'none';

    // Auto-relleno desde la factura (si existe)
    if (show && invoiceUrl) {
      try {
        const u = new URL(invoiceUrl);
        const oid = u.searchParams.get('order_id');
        const token = u.searchParams.get('token');
        if (oid && token) {
          const inv = await apiFetch(`/invoices/${encodeURIComponent(oid)}?token=${encodeURIComponent(token)}`);
          const order = inv?.order || {};

          const preName = String(order.customer_name || order.domicilio_nombre || '').trim();
          const preEmail = String(order.customer_email || order.payer_email || '').trim();
          const prePhone = String(order.customer_phone || order.domicilio_telefono || '').trim();

          const inName = modal.querySelector('#elcName');
          const inEmail = modal.querySelector('#elcEmail');
          const inPhone = modal.querySelector('#elcPhone');

          if (inName && !inName.value.trim() && preName) inName.value = preName;
          if (inEmail && !inEmail.value.trim() && preEmail) inEmail.value = preEmail;
          if (inPhone && !inPhone.value.trim() && prePhone) inPhone.value = prePhone;
        }
      } catch (e) {
        console.warn('No se pudo prellenar datos de factura:', e);
      }
    }
  });

  modal.querySelector('#btnSendWA').addEventListener('click', async () => {
    try {
      let nit = modal.querySelector('#elcNit').value.trim();
      let name = modal.querySelector('#elcName').value.trim();
      let email = modal.querySelector('#elcEmail').value.trim();
      let phone = modal.querySelector('#elcPhone').value.trim();

      if (!nit) {
        alert('Completa el NIT/CC.');
        return;
      }
      // Traer detalle de la factura (productos/cantidades) desde el API publico
      let items = [];
      let invOrder = null;
      if (invoiceUrl) {
        const u = new URL(invoiceUrl);
        const oid = u.searchParams.get('order_id');
        const token = u.searchParams.get('token');
        if (oid && token) {
          const inv = await apiFetch(
            `/invoices/${encodeURIComponent(oid)}?token=${encodeURIComponent(token)}`
          );
          items = inv.items || [];
          invOrder = inv.order || null;

          // Auto-completar datos del comprador si vienen en la orden
          if (invOrder) {
            if (!name) name = String(invOrder.customer_name || invOrder.domicilio_nombre || '').trim();
            if (!email) email = String(invOrder.customer_email || invOrder.payer_email || '').trim();
            if (!phone) phone = String(invOrder.customer_phone || invOrder.domicilio_telefono || '').trim();
          }
        }
      }

      if (!name || !email || !phone) {
        alert('Completa nombre/razon social, correo y telefono (o vuelve a abrir el formulario para que se autocompleten).');
        return;
      }
      const lines = [];
      lines.push(`🧾 *Solicitud de FACTURA ELECTRÓNICA*`);
      lines.push(`✅ Compra desde el sitio web *MR SmartService*`);
      if (orderId) lines.push(`🔢 Orden: #${orderId}`);
      lines.push('');
      lines.push(`👤 Datos del cliente`);
      lines.push(`• NIT/CC: ${nit}`);
      lines.push(`• Nombre/Razón social: ${name}`);
      lines.push(`• Correo: ${email}`);
      lines.push(`• Tel: ${phone}`);
      lines.push('');
      if (items.length) {
        lines.push(`🛒 Detalle de productos`);
        let subtotal = 0;
        for (const it of items) {
          const qty = Number(it.quantity || 0);
          const unit = Number(it.unit_price || 0);
          const lineTotal = qty * unit;
          subtotal += lineTotal;
          lines.push(
            `• ${it.name}  x${qty}  (${moneyCOP(unit)})  = ${moneyCOP(
              lineTotal
            )}`
          );
        }
        lines.push(`Subtotal: ${moneyCOP(subtotal)}`);
        if (invOrder && invOrder.total_amount) {
          lines.push(`Total compra: ${moneyCOP(invOrder.total_amount)}`);
        }
      }
      if (invoiceUrl) {
        lines.push('');
        lines.push(`🧾 Factura mostrador (imprimible):`);
        lines.push(invoiceUrl);
      }
      lines.push('');
      lines.push(`📎 Nota: Si necesitas, adjunto la factura mostrador (PDF) en este chat.`);

      const wa = (window.WHATSAPP_INVOICE || '573216145781').replace(/\D/g, '');
      const text = encodeURIComponent(lines.join('\n'));
      window.open(`https://wa.me/${wa}?text=${text}`, '_blank');
    } catch (e) {
      console.error(e);
      alert('No se pudo armar el WhatsApp. Intenta de nuevo.');
    }
  });
}
