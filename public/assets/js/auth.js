(function () {
  function setToken(token) {
    if (token) localStorage.setItem('MR_TOKEN', token);
    else localStorage.removeItem('MR_TOKEN');
  }

  function token() {
    return localStorage.getItem('MR_TOKEN') || '';
  }

  async function me() {
    if (!token()) return null;
    try { return await window.MR_API.get('/api/me'); } catch { return null; }
  }

  window.MR_AUTH = { setToken, token, me };
})();
