/********************
 * MR SmartService - Config & Helpers (PROD)
 ********************/

(() => {
  /* ============== CONFIG ============== */

  // Detecta local / red privada (útil cuando abres el front por IP de red,
  // ej: http://192.168.x.x:3000 desde otro dispositivo).
  const host = location.hostname;
  const isPrivateIp =
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    isPrivateIp;

  // URL REAL de Cloud Run (SIN /api al final)
  const CLOUD_RUN_ORIGIN = (typeof window !== "undefined" && window.__API_ORIGIN__) ? window.__API_ORIGIN__ : "https://mrsmartservice-256100476140.us-central1.run.app";

  // Helpers para normalizar URLs
  const trimSlash = (s) => String(s || "").replace(/\/+$/, "");
  const join = (base, path) => {
    const b = trimSlash(base);
    const p = String(path || "");
    if (!p) return b;
    return p.startsWith("/") ? b + p : b + "/" + p;
  };

  // Origen del backend (sin /api)
  // - En local: localhost:8080
  // - En prod: window.__API__ (si existe) o CLOUD_RUN_ORIGIN
  // En local usamos el mismo host del front para llegar al backend (8080).
  // Si el host es localhost/127.0.0.1 => usamos localhost.
  const localBackendHost =
    host === "127.0.0.1" || host === "0.0.0.0" ? "localhost" : host;

  const BACKEND_ORIGIN = isLocal
    ? `http://${localBackendHost}:8080`
    : trimSlash(window.__API__ || CLOUD_RUN_ORIGIN);

  // API base (siempre termina en /api)
  const API = join(BACKEND_ORIGIN, "/api");

  // Origen base del backend (útil si sirves rutas sin /api)
  const API_ORIGIN = trimSlash(BACKEND_ORIGIN);

  // ✅ Exponer config global (IMPORTANTE: algunos scripts usan API directo)
  window.MR = window.MR || {};
  window.MR.isLocal = isLocal;
  window.MR.API = API;
  window.MR.API_ORIGIN = API_ORIGIN;

  // ✅ compatibilidad con tu front actual (app.auth.js usa API global)
  window.API = API;
  window.API_ORIGIN = API_ORIGIN;

  /* ============== HELPERS DE RUTA/SESIÓN ============== */

  const isPage = (name) => {
    const url = new URL(location.href);
    return url.pathname.endsWith("/" + name) || url.pathname.endsWith(name);
  };

  const getToken = () => localStorage.getItem("token") || "";
  const setToken = (t) => localStorage.setItem("token", t || "");
  const clearToken = () => localStorage.removeItem("token");

  // Normaliza el shape de producto para soportar respuestas snake_case y camelCase.
  // Esto evita errores como product_id undefined (que termina en "bad_item" al crear pago).
  const normalizeProduct = (p) => {
    if (!p || typeof p !== "object") return p;

    const product_id = p.product_id ?? p.productId ?? p.id;
    const discount_percent = p.discount_percent ?? p.discountPercent ?? p.discount ?? 0;
    const image_url = p.image_url ?? p.imageUrl ?? p.image ?? p.imagePath ?? p.img ?? null;

    return {
      ...p,
      product_id,
      discount_percent,
      image_url,
    };
  };

  const authHeaders = (extra = {}) => {
    const t = getToken();
    const base = { "Content-Type": "application/json", ...extra };
    return t ? { ...base, Authorization: "Bearer " + t } : base;
  };

  // apiFetch: wrapper para consumir tu backend
  async function apiFetch(path, opts = {}) {
    // path puede venir "/products" o "products"
    const normalizedPath = String(path || "");
    const url = normalizedPath.startsWith("/")
      ? join(API, normalizedPath)
      : join(API, "/" + normalizedPath);

    const method = (opts.method || "GET").toUpperCase();
    const headers = opts.headers || {};

    let body = opts.body;

    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    const isString = typeof body === "string";

    // Si es FormData no forzamos Content-Type
    const finalHeaders = isFormData ? { ...headers } : authHeaders(headers);

    // Si body es objeto normal => JSON
    if (body && !isFormData && !isString && typeof body === "object") {
      body = JSON.stringify(body);
    }

    const res = await fetch(url, {
      ...opts,
      method,
      headers: finalHeaders,
      body,
      // JWT va en header; evita problemas con cookies cross-site
      credentials: "omit",
    });

    const text = await res.text().catch(() => "");
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text || null;
    }

    if (!res.ok) {
      const msg =
        (data && (data.error || data.message)) ||
        `API ${res.status}: ${res.statusText}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      err.url = url;
      throw err;
    }

    return data;
  }

  const money = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

  /* ============== CACHE LOCAL DE PRODUCTOS (OFFLINE) ============== */

  const LS_KEY_PRODUCTS = "mr_products_cache_v1";

  function getOffline() {
    try {
      const txt = localStorage.getItem(LS_KEY_PRODUCTS);
      return txt ? JSON.parse(txt) : [];
    } catch {
      return [];
    }
  }

  function setOffline(list) {
    try {
      localStorage.setItem(LS_KEY_PRODUCTS, JSON.stringify(list || []));
    } catch {
      // ignoramos errores de cuota
    }
  }

  async function fetchProducts(force = false) {
    if (!force) {
      const cached = getOffline();
      if (cached && cached.length) return cached;
    }

    try {
      const data = await apiFetch("/products");
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const normalized = list.map(normalizeProduct);
      if (normalized.length) {
        setOffline(normalized);
        return normalized;
      }
      return [];
    } catch (e) {
      console.warn("Error cargando productos desde API, uso cache local:", e);
      return getOffline() || [];
    }
  }

  /* ============== FORMATEO DE FECHAS ============== */

  function fmtDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Export global
  window.isPage = isPage;
  window.getToken = getToken;
  window.setToken = setToken;
  window.clearToken = clearToken;
  window.authHeaders = authHeaders;
  window.apiFetch = apiFetch;
  window.money = money;
  window.fetchProducts = fetchProducts;
  window.fmtDate = fmtDate;
})();


// ==== Contact / WhatsApp (configurable) ====
window.WHATSAPP_INVOICE = '573014190633'; // pruebas
window.WHATSAPP_BUSINESS = '573014190633'; // empresa
window.COMPANY_EMAIL = 'yesfri@hotmail.es';
window.COMPANY_PHONE_DISPLAY = '+57 301 419 0633';
window.COMPANY_FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61578618060404';
