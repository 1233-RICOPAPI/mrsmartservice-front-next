(function () {
  const KEY = 'MR_CART';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch { return []; }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items || []));
  }

  function add(item) {
    const cart = read();
    const pid = Number(item.product_id);
    const existing = cart.find((x) => Number(x.product_id) === pid);
    if (existing) existing.quantity = Number(existing.quantity || 1) + Number(item.quantity || 1);
    else cart.push({
      product_id: pid,
      name: String(item.name || item.title || `Producto #${pid}`),
      unit_price: Number(item.unit_price || item.price || 0),
      image_url: item.image_url || item.imageUrl || null,
      quantity: Number(item.quantity || 1),
    });
    write(cart);
    return cart;
  }

  function updateQty(product_id, qty) {
    const cart = read();
    const pid = Number(product_id);
    const q = Math.max(1, Number(qty || 1));
    for (const it of cart) {
      if (Number(it.product_id) === pid) it.quantity = q;
    }
    write(cart);
    return cart;
  }

  function remove(product_id) {
    const pid = Number(product_id);
    const cart = read().filter((x) => Number(x.product_id) !== pid);
    write(cart);
    return cart;
  }

  function clear() { write([]); }

  function subtotal() {
    return read().reduce((acc, it) => acc + Number(it.unit_price || 0) * Number(it.quantity || 1), 0);
  }

  window.MR_CART = { read, write, add, updateQty, remove, clear, subtotal };
})();
