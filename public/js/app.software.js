(function(){
  const grid = document.getElementById('swGrid');
  if (!grid) return;

  const wa = (window.WHATSAPP_BUSINESS || '573014190633').replace(/\D/g,'');

  const softwares = [
    {
      id: 'parqueadero',
      name: 'Software Parqueadero',
      desc: 'Entradas/salidas, tarifas, reportes y facturación mostrador.',
      tags: ['Pago único', 'Offline', 'Reportes'],
      status: 'Próximamente',
      // En este repo solo existe un banner genérico (software.avif).
      // Usamos el mismo para evitar 307/404 por archivos faltantes.
      img: 'images/software.avif'
    },
    {
      id: 'restaurante',
      name: 'Software Restaurante',
      desc: 'Mesas, pedidos, cocina, inventario básico y facturación mostrador.',
      tags: ['Pago único', 'Offline', 'Multiusuario'],
      status: 'Próximamente',
      img: 'images/software.avif'
    },
    {
      id: 'factura-mostrador',
      name: 'Factura Mostrador Pro',
      desc: 'Caja, clientes, reportes y facturación rápida.',
      tags: ['Pago único', 'Offline', 'Escalable'],
      status: 'Próximamente',
      img: 'images/software.avif'
    }
  ];

  softwares.forEach((s) => {
    const el = document.createElement('article');
    el.className = 'sw-card';
    el.innerHTML = `
      <img src="${s.img}" alt="${s.name}" loading="lazy" onerror="this.style.display='none'">
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <div class="sw-tags">${s.tags.map(t => `<span class="sw-tag">${t}</span>`).join('')}</div>
      <div class="sw-actions">
        <a class="sw-btn primary" href="#" onclick="return false;">${s.status}</a>
        <a class="sw-btn ghost" target="_blank" rel="noopener"
           href="https://wa.me/${wa}?text=${encodeURIComponent('Hola, quiero información sobre: ' + s.name)}">Preguntar</a>
      </div>
    `;
    grid.appendChild(el);
  });
})();
