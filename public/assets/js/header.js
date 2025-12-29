(function () {
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  async function initHeader(opts) {
    const target = document.querySelector('[data-mr-header]');
    if (!target) return;

    const user = await window.MR_AUTH.me();
    const isLogged = !!user;
    const html = `
      <div class="header">
        <div class="container header-inner">
          <a class="brand" href="/index.html" aria-label="Inicio">
            <div class="logo"></div>
            <div>
              <div style="font-weight:800;letter-spacing:0.2px;">MR SmartService</div>
              <div style="font-size:12px;color:var(--muted);">Tecnología & Software</div>
            </div>
          </a>
          <nav class="nav">
            <a href="/index.html">Tienda</a>
            <a href="/software.html">Softwares</a>
            <a href="/publicidad.html">Publicidad</a>
            <a href="/carrito.html">Carrito</a>
            ${isLogged ? '<a href="/admin.html">Admin</a>' : ''}
          </nav>
          <div class="row" style="gap:8px;">
            ${isLogged ? '<button class="btn" id="mr-logout">Salir</button>' : '<a class="btn" href="/login.html" id="mr-login-btn">Login</a>'}
          </div>
        </div>
      </div>
    `;

    target.replaceWith(el(`<div data-mr-header>${html}</div>`));

    const logout = document.getElementById('mr-logout');
    if (logout) {
      logout.addEventListener('click', () => {
        window.MR_AUTH.setToken('');
        location.href = '/index.html';
      });
    }
  }

  window.MR_HEADER = { initHeader };
})();
