
/* ============== FOOTER GLOBAL ============== */
function injectFooter() {
  const mount = document.getElementById('app-footer');
  if (!mount) return;
  mount.innerHTML = `
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-col">
        <h3>MR SmartService</h3>
        <p>Venta e instalación de equipos de cómputo, componentes, accesorios y cámaras de seguridad.</p>
        <a href="https://wa.me/573014190633">#DESARROLLO DE SITOS WEB COMO ESTE CONTACTATANOS PARA TU PROPIO SITIO WEB  /🌐</a>
        </div>
      <div class="footer-col">
        <h3>Contáctanos</h3>
        <p>Cra. 31 #37-32, Local 46 – C.C. Los Centauros</p>
        <p>${window.COMPANY_PHONE_DISPLAY || '+57 301 419 0633'}</p>
        <p>${window.COMPANY_EMAIL || 'yesfri@hotmail.es'}</p>
      </div>
      <div class="footer-col">
        <h3>Síguenos</h3>
        <a href="${window.COMPANY_FACEBOOK_URL || 'https://www.facebook.com/profile.php?id=61578618060404'}" target="_blank" rel="noopener">Facebook</a>
        <a href="https://wa.me/573014190633">WhatsApp</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© MR SmartService. Todos los derechos reservados.</p>
    </div>
  </footer>`;
}