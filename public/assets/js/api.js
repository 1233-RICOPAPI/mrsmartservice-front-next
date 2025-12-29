(function () {
  function apiBase() {
    return (window.MR_CONFIG?.API_BASE || '').replace(/\/+$/, '');
  }

  function authToken() {
    return localStorage.getItem('MR_TOKEN') || '';
  }

  async function request(path, options) {
    const base = apiBase();
    const url = base ? `${base}${path}` : path;
    const headers = Object.assign({ 'Content-Type': 'application/json' }, (options && options.headers) || {});

    const token = authToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, Object.assign({ headers }, options));
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!res.ok) {
      const msg = data && (data.message || data.error) ? (data.message || data.error) : `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  window.MR_API = {
    apiBase,
    get: (p) => request(p, { method: 'GET' }),
    post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body || {}) }),
    put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body || {}) }),
    patch: (p, body) => request(p, { method: 'PATCH', body: JSON.stringify(body || {}) }),
    del: (p) => request(p, { method: 'DELETE' }),
  };
})();
