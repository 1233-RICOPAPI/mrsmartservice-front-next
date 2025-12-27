export type LegacyTemplate = {
  title: string;
  bodyClass: string;
  bodyHtml: string;
  scripts: string[];
  inlineScripts: string[];
};

export const legacyTemplates: Record<string, LegacyTemplate> = {
  "admin.html": {
    title: `Administrador | MR SmartService`,
    bodyClass: `admin-page`,
    bodyHtml: `<header class="main-header">
    <div class="logo-container">
      <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img" />
      <h1>MR SmartService</h1>
    </div>

    <nav class="admin-nav" aria-label="Navegación del panel">
      <span class="badge-admin" aria-current="page">Administrador</span>
    </nav>

    <button id="logoutBtn" class="logout-btn" type="button">Cerrar sesión</button>
  </header>

  <section class="admin-panel">
    <div class="admin-container">

      <!-- Pestañas -->
      <div class="admin-tabs" role="tablist" aria-label="Secciones del panel">
        <button
          id="tab-prod-tab"
          class="tab-btn active"
          data-tab="tab-prod"
          role="tab"
          type="button"
          aria-selected="true"
          aria-controls="tab-prod"
        >
          Productos
        </button>
        <button
          id="tab-tienda-tab"
          class="tab-btn"
          data-tab="tab-tienda"
          role="tab"
          type="button"
          aria-selected="false"
          aria-controls="tab-tienda"
        >
          Tienda
        </button>
        <!-- Domicilios visible para USER -->
        <button
          id="tab-domicilios-tab"
          class="tab-btn"
          data-tab="tab-domicilios"
          role="tab"
          type="button"
          aria-selected="false"
          aria-controls="tab-domicilios"
        >
          Domicilios
        </button>
        <!-- Publicidad solo admin/dev -->
        <button
          id="tab-ads-tab"
          class="tab-btn hide-for-user"
          data-tab="tab-ads"
          role="tab"
          type="button"
          aria-selected="false"
          aria-controls="tab-ads"
        >
          Publicidad
        </button>
        <!-- Ventas visible para USER -->
        <button
          id="tab-ventas-tab"
          class="tab-btn"
          data-tab="tab-ventas"
          role="tab"
          type="button"
          aria-selected="false"
          aria-controls="tab-ventas"
        >
          Ventas
        </button>
        <!-- Estadísticas solo staff -->
        <button
          id="tab-estadisticas-tab"
          class="tab-btn hide-for-user"
          data-tab="tab-estadisticas"
          role="tab"
          type="button"
          aria-selected="false"
          aria-controls="tab-estadisticas"
        >
          Estadísticas
        </button>
        <!-- Perfil/Usuarios solo staff -->
        <button
          id="tab-perfil-tab"
          class="tab-btn hide-for-user"
          data-tab="tab-perfil"
          role="tab"
          type="button"
          aria-selected="false"
          aria-controls="tab-perfil"
        >
          Perfil
        </button>
      </div>
      <!-- ============================
            TAB — GESTIÓN DE PRODUCTOS
      ============================== -->

      <div
        id="tab-prod"
        class="tab-pane active"
        role="tabpanel"
        aria-labelledby="tab-prod-tab"
      >
        <div class="panel-head" style="text-align:center;">
          <h2>Gestión de Productos</h2>
          <p style="color:#64748b;">Administra tu catálogo de forma sencilla</p>
        </div>

        <!-- FORMULARIO PARA CREAR PRODUCTO -->
        <form id="formProducto" class="modern-admin-form" autocomplete="off">

          <div class="form-row-2">
            <div class="form-group">
              <label for="nombre">Nombre del producto</label>
              <input type="text" id="nombre" name="nombre" required />
            </div>

            <div class="form-group">
              <label for="categoria">Categoría</label>
              <input list="catList" id="categoria" name="categoria" required />
              <datalist id="catList">
                <option value="Computadoras"></option>
                <option value="Componentes"></option>
                <option value="Cámaras"></option>
                <option value="Accesorios"></option>
              </datalist>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="precio">Precio ($)</label>
              <input type="number" id="precio" name="precio" min="0" required />
            </div>

            <div class="form-group">
              <label for="stock">Stock</label>
              <input type="number" id="stock" name="stock" min="0" required />
            </div>
          </div>

          <!-- DESCUENTO + RANGO DE FECHAS -->
          <div class="form-row-2">
            <div class="form-group">
              <label for="discount">Descuento (%)</label>
              <input
                type="number"
                id="discount"
                name="discount"
                min="0"
                max="90"
                value="0"
              />
            </div>

            <div class="form-group">
              <label>Vigencia del descuento</label>
              <div style="display:flex; gap:8px;">
                <input
                  type="date"
                  id="discountStart"
                  placeholder="Desde"
                  aria-label="Fecha de inicio del descuento"
                />
                <input
                  type="date"
                  id="discountEnd"
                  placeholder="Hasta"
                  aria-label="Fecha de fin del descuento"
                />
              </div>
              <small>Si dejas ambas fechas vacías, el descuento aplica siempre.</small>
            </div>
          </div>

          <!-- DESCRIPCIÓN -->
          <div class="form-group">
            <label for="description">Descripción del producto</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="Descripción detallada del producto..."
            ></textarea>
          </div>

          <!-- FICHA TÉCNICA -->
          <div class="form-group">
            <label for="tech_sheet">Ficha técnica</label>
            <textarea
              id="tech_sheet"
              name="tech_sheet"
              rows="6"
              placeholder="Pantalla: 144Hz&#10;Procesador: Ryzen 5&#10;RAM: 16GB"
            ></textarea>
          </div>

<!-- MULTIMEDIA (IMÁGENES + VIDEOS) -->
<div class="media-upload-section">
  <div class="media-title"><span>🖼️</span> Multimedia del producto (máx. 6)</div>

  <div class="form-group">
    <label for="mediaUrls">URLs (1 por línea, en el orden que quieres mostrar)</label>
    <textarea
      id="mediaUrls"
      name="mediaUrls"
      rows="4"
      placeholder="https://...jpg&#10;https://...mp4&#10;https://youtu.be/..."
    ></textarea>
    <small>Puedes mezclar imágenes y videos. Máximo 6 en total (se guarda en el orden que pongas aquí + el orden de los archivos seleccionados).</small>
  </div>

  <div class="divider-text">
    <span>O SUBIR ARCHIVOS</span>
  </div>

  <div class="file-input-wrapper">
    <label for="mediaFiles" class="file-custom-btn">
      📂 Seleccionar imágenes / videos
    </label>
    <input
      type="file"
      id="mediaFiles"
      name="mediaFiles"
      accept="image/*,video/*"
      multiple
      aria-label="Subir imágenes o videos del producto"
    />
  </div>

  <!-- Compatibilidad (inputs antiguos, ocultos) -->
  <div style="display:none" aria-hidden="true">
    <input type="url" id="imageUrl" name="imageUrl" />
    <input type="file" id="imgFile" name="imgFile" accept="image/*" />
    <input type="url" id="videoUrl" name="videoUrl" />
    <input type="file" id="videoFile" name="videoFile" accept="video/*" />
  </div>
</div>

<button type="submit" class="btn-save-modern">
            💾 Agregar Producto
          </button>
        </form>

        <div id="listaAdmin" class="lista-productos-admin" aria-live="polite"></div>
      </div>

      <!-- ============================
           MODAL EDITAR PRODUCTO
      ============================== -->
      <div
        id="modalEditProd"
        class="modal-envio hidden"
        aria-modal="true"
        role="dialog"
        aria-labelledby="modalEditProdTitle"
      >
        <div class="modal-envio-backdrop"></div>

        <div class="modal-envio-dialog modal-edit-prod-dialog">
          <h2 id="modalEditProdTitle" class="modal-envio-title">
            Editar producto
          </h2>

          <form id="formEditProd" class="formulario-admin">
            <div class="campo">
              <label for="editName">Nombre</label>
              <input type="text" id="editName" required />
            </div>

            <div class="campo">
              <label for="editCategory">Categoría</label>
              <input type="text" id="editCategory" />
            </div>

            <div class="campo">
              <label for="editPrice">Precio ($)</label>
              <input type="number" id="editPrice" min="0" step="1" required />
            </div>

            <div class="campo">
              <label for="editStock">Stock</label>
              <input type="number" id="editStock" min="0" step="1" required />
            </div>

            <div class="campo">
              <label for="editDescripcion">Descripción</label>
              <textarea
                id="editDescripcion"
                rows="4"
                placeholder="Descripción detallada del producto..."
              ></textarea>
            </div>

            <div class="campo">
              <label for="editSpecs">Ficha técnica</label>
              <textarea
                id="editSpecs"
                rows="6"
                placeholder="Pantalla: 144Hz&#10;Procesador: Ryzen 5&#10;RAM: 16GB"
              ></textarea>
            </div>

            <div class="campo">
              <p class="campo-label">Vista previa ficha técnica</p>
              <div
                id="editSpecsPreview"
                class="specs-preview-box"
                aria-live="polite"
              >
                Escribe para ver la vista previa…
              </div>
            </div>

            <!-- DESCUENTO + VIGENCIA (EDITAR) -->
            <div class="campo">
              <label for="editDiscountPercent">Descuento (%)</label>
              <input
                type="number"
                id="editDiscountPercent"
                min="0"
                max="90"
              />
            </div>

            <div class="campo">
              <label>Vigencia del descuento</label>
              <div style="display:flex; gap:8px;">
                <input
                  type="date"
                  id="editDiscountStart"
                  placeholder="Desde"
                  aria-label="Fecha de inicio del descuento"
                />
                <input
                  type="date"
                  id="editDiscountEnd"
                  placeholder="Hasta"
                  aria-label="Fecha de fin del descuento"
                />
              </div>
              <small>Si dejas ambas fechas vacías, el descuento aplica siempre.</small>
            </div>

<div class="campo">
  <label for="editMediaUrls">Multimedia (URLs, 1 por línea, máx. 6)</label>
  <textarea
    id="editMediaUrls"
    rows="4"
    placeholder="https://...jpg&#10;https://...mp4&#10;https://youtu.be/..."
  ></textarea>
  <small>Orden = el orden del listado. Puedes mezclar imágenes y videos.</small>
</div>

<div class="campo">
  <label for="editMediaFiles">Agregar archivos (imágenes / videos)</label>
  <input type="file" id="editMediaFiles" accept="image/*,video/*" multiple />
  <small>Los archivos se agregan al final respetando el orden de selección. Máximo 6 en total.</small>
</div>

<!-- Compatibilidad (inputs antiguos, ocultos) -->
<div style="display:none" aria-hidden="true">
  <input type="text" id="editImageUrl" />
  <input type="file" id="editImgFile" accept="image/*" />
  <input type="text" id="editVideoUrl" />
  <input type="file" id="editVideoFile" accept="video/*" />
</div>
            <div class="modal-footer">
              <button type="button" id="editCancel" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primario full-width">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
       <!-- ============================
            TAB — PUBLICIDAD
      ============================ -->
      <div
        id="tab-ads"
        class="tab-pane"
        role="tabpanel"
        aria-labelledby="tab-ads-tab"
        hidden
      >
        <div class="panel-head" style="text-align:center;">
          <h2>Gestión de Publicidad</h2>
          <p style="color:#64748b;">Configura los banners del inicio</p>
        </div>

        <form id="formAds" class="modern-admin-form" autocomplete="off">
          <input type="hidden" id="adId" />

          <div class="form-group">
            <label for="adTitle">Título del anuncio</label>
            <input
              type="text"
              id="adTitle"
              required
              placeholder="Ej: Gran Promo Navideña"
            />
          </div>

          <div class="form-group">
            <label for="adDesc">Descripción breve</label>
            <textarea id="adDesc" rows="2"></textarea>
          </div>

          <div class="media-upload-section">
            <div class="media-title">🖼️ Contenido Visual</div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="adImageUrl">URL Imagen</label>
                <input type="url" id="adImageUrl" placeholder="https://..." />
              </div>

              <div class="form-group">
                <label for="adVideoUrl">URL Video</label>
                <input type="url" id="adVideoUrl" placeholder="https://..." />
              </div>
            </div>

            <div class="divider-text"><span>O SUBIR ARCHIVOS</span></div>

            <div class="form-row-2">
              <div class="file-input-wrapper">
                <label for="adImageFile" class="file-custom-btn">
                  📂 Subir Imagen
                </label>
                <input
                  type="file"
                  id="adImageFile"
                  accept="image/*"
                  aria-label="Subir imagen para el anuncio"
                />
              </div>

              <div class="file-input-wrapper">
                <label for="adVideoFile" class="file-custom-btn">
                  🎬 Subir Video
                </label>
                <input
                  type="file"
                  id="adVideoFile"
                  accept="video/*"
                  aria-label="Subir video para el anuncio"
                />
              </div>
            </div>
          </div>

          <div class="form-row-2" style="align-items:center;">
            <label
              for="adActive"
              style="display:flex; gap:10px; align-items:center;"
            >
              <input type="checkbox" id="adActive" checked />
              <span>Anuncio activo</span>
            </label>

            <div style="display:flex; gap:10px;">
              <button type="button" id="adResetBtn" class="btn-secondary">
                Limpiar
              </button>
              <button type="submit" id="adSubmitBtn" class="btn-save-modern">
                Guardar
              </button>
            </div>
          </div>
        </form>

        <hr class="divider" />

        <div class="table-wrap">
          <table class="smart-table" id="adsTable">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Título</th>
                <th scope="col">Estado</th>
                <th scope="col">Creado</th>
                <th scope="col" class="right">Acciones</th>
              </tr>
            </thead>
            <tbody id="adsTableBody"></tbody>
          </table>
          <div id="adsEmpty" class="empty-state" hidden>
            <p>No hay anuncios creados.</p>
          </div>
        </div>
      </div>

      <!-- ============================
            TAB — VENTAS
      ============================ -->
      <div
        id="tab-ventas"
        class="tab-pane"
        role="tabpanel"
        aria-labelledby="tab-ventas-tab"
        hidden
      >
        <section class="panel">
          <header class="panel-head">
            <h2>Historial de ventas</h2>

            <form id="filtrosVentas" class="filters">
              <div class="field">
                <label for="ventaDesde">Desde</label>
                <input type="date" id="ventaDesde" />
              </div>

              <div class="field">
                <label for="ventaHasta">Hasta</label>
                <input type="date" id="ventaHasta" />
              </div>

              <div class="field">
                <label for="ventaEstado">Estado</label>
                <select id="ventaEstado">
                  <option value="todos">Todos</option>
                  <option value="approved" selected>Aprobado</option>
                  <option value="pending">Pendiente</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>

              <div class="field grow">
                <label for="ventaQuery">Buscar</label>
                <input
                  type="search"
                  id="ventaQuery"
                  placeholder="Cliente, email, #orden…"
                />
              </div>

              <button type="submit" class="btn btn-primary">Aplicar</button>
            </form>
          </header>

          <div class="table-wrap">
            <table class="smart-table" id="tablaVentas">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Orden</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Total</th>
                  <th scope="col">Estado</th>
                  <th scope="col" class="right">Acciones</th>
                </tr>
              </thead>
              <tbody id="ventasBody"></tbody>
            </table>

            <div id="ventasEmpty" class="empty-state" hidden>
              <p>No hay ventas para mostrar.</p>
            </div>
          </div>

          <footer class="panel-foot">
            <div class="pager">
              <button type="button" class="btn btn-light" id="prevVentas">
                Anterior
              </button>
              <span id="infoVentas">Página 1 de 1</span>
              <button type="button" class="btn btn-light" id="nextVentas">
                Siguiente
              </button>
            </div>
          </footer>
        </section>
      </div>

      <!-- ============================
            TAB — ESTADÍSTICAS
      ============================ -->
      <div
        id="tab-estadisticas"
        class="tab-pane"
        role="tabpanel"
        aria-labelledby="tab-estadisticas-tab"
        hidden
      >
        <section class="panel">
          <header class="panel-head">
            <h2>Estadísticas</h2>

            <div class="filters">
              <div class="field">
                <label for="statsRange">Rango</label>
                <select id="statsRange" name="statsRange">
                  <option value="day">Diario</option>
                  <option value="week">Semanal</option>
                  <option value="month" selected>Mensual</option>
                  <option value="year">Anual</option>
                </select>
              </div>
              <button type="button" class="btn btn-primary" id="btnStats">
                Actualizar
              </button>
            </div>
          </header>

          <div class="stats-grid">
            <div class="kpi">
              <span>Ingresos</span>
              <strong id="kpiIngresos">$0</strong>
              <small id="kpiIngresosDelta"></small>
            </div>
            <div class="kpi">
              <span>Órdenes</span>
              <strong id="kpiOrdenes">0</strong>
              <small id="kpiOrdenesDelta"></small>
            </div>
            <div class="kpi">
              <span>Ticket promedio</span>
              <strong id="kpiTicket">$0</strong>
              <small id="kpiTicketDelta"></small>
            </div>
            <div class="kpi">
              <span>Tasa de aprobación</span>
              <strong id="kpiRate">0%</strong>
              <small id="kpiRateDelta"></small>
            </div>
          </div>

          <div class="mini-bars" id="barsVentas"></div>
        </section>
      </div>


      

      <!-- ============================
            TAB — PERFIL + USUARIOS
      ============================ -->
      <div
        id="tab-perfil"
        class="tab-pane"
        role="tabpanel"
        aria-labelledby="tab-perfil-tab"
        hidden
      >
        <section class="admin-card">
          <h2>Mi perfil – Cambiar contraseña</h2>

          <form id="formChangePassword" class="form-grid" autocomplete="off">
            <div class="profile-row">
              <div class="form-field">
                <label for="oldPassword">Contraseña actual</label>
                <input type="password" id="oldPassword" required />
              </div>
            </div>

            <div class="profile-row profile-row-2">
              <div class="form-field">
                <label for="newPassword">Nueva contraseña</label>
                <input type="password" id="newPassword" required />
              </div>

              <div class="form-field">
                <label for="newPassword2">Repetir nueva contraseña</label>
                <input type="password" id="newPassword2" required />
              </div>
            </div>

            <div class="profile-actions">
              <button type="submit" class="btn-primary">
                Actualizar contraseña
              </button>
              <p id="changePassMsg"></p>
            </div>
          </form>
        </section>

        <section id="usersAdmin" class="admin-card admin-users-card"></section>
      </div>

      <!-- ============================
            TAB — TIENDA
      ============================ -->
      <div
        id="tab-tienda"
        class="tab-pane"
        role="tabpanel"
        aria-labelledby="tab-tienda-tab"
        hidden
      >
        <h2>Vista de la tienda</h2>
        <div class="tienda-preview">
          <iframe
            id="tiendaFrame"
            src="index.html"
            loading="lazy"
            title="Vista de la tienda"
          ></iframe>
        </div>
      </div>

      <!-- ============================
            TAB — DOMICILIOS
      ============================ -->
      <div
        id="tab-domicilios"
        class="tab-pane"
        role="tabpanel"
        aria-labelledby="tab-domicilios-tab"
        hidden
      >
        <section class="panel">
          <header class="panel-head">
            <h2>Domicilios</h2>
          </header>

          <div class="filters">
            <div class="field">
              <label for="domEstado">Estado</label>
              <select id="domEstado">
                <option value="pendiente">Pendientes</option>
                <option value="entregado">Entregados</option>
                <option value="todos">Todos</option>
              </select>
            </div>

            <div class="field grow">
              <label for="domQuery">Buscar</label>
              <input
                type="search"
                id="domQuery"
                placeholder="Nombre, barrio, ciudad…"
              />
            </div>

            <button type="button" id="domRefresh" class="btn-primary">
              Actualizar
            </button>
          </div>

          <div class="table-wrap">
            <table class="smart-table" id="domTable">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Orden</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Dirección</th>
                  <th scope="col">Ciudad/Barrio</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody id="domTableBody"></tbody>
            </table>

            <div id="domEmpty" class="empty-state" hidden>
              <p>No hay domicilios para mostrar.</p>
            </div>
          </div>
        </section>
      </div>
    </div> <!-- END admin-container -->
  </section>

  <!-- TOAST -->
  <div id="appToast" class="toast hidden" aria-live="polite">
    <span id="appToastMsg"></span>
  </div>

  <!-- CONFIRM MODAL -->
  <div
    id="appConfirm"
    class="modal-envio hidden"
    aria-modal="true"
    role="dialog"
    aria-labelledby="appConfirmTitle"
  >
    <div class="modal-envio-backdrop"></div>
    <div class="modal-envio-dialog modal-confirm-dialog">
      <h2 id="appConfirmTitle">¿Estás seguro?</h2>
      <p id="appConfirmMsg" class="modal-confirm-text"></p>
      <div class="modal-confirm-actions">
        <button id="appConfirmCancel" class="btn-secondary" type="button">
          Cancelar
        </button>
        <button id="appConfirmOk" class="btn-danger" type="button">
          Aceptar
        </button>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div id="app-footer"></div>

  <!-- SCRIPTS -->
  
  
  
  

  <!-- Firebase (Storage) - compat (global firebase) -->
  
  
  

  <!-- Tu config/funciones Firebase (debe ir DESPUÉS de los SDKs) -->
  

  
  

  <!-- Auth primero (para que el token/usuario esté listo) -->
  

  <!-- Admin después (usa auth + firebase) -->
  

  <!-- Otros módulos -->`,
    scripts: [
      'https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js',
      '/js/app.firebase.js',
    ],
    inlineScripts: ["// Para evitar el error storage/unauthorized en Firebase Storage,\n    // el panel sube archivos por el backend (/api/upload) por defecto.\n    window.MR_USE_FIREBASE_STORAGE = false;", "// SOLO actualizar badge según el rol, sin redirigir.\n    document.addEventListener(\"DOMContentLoaded\", async () => {\n      const badge = document.querySelector(\".badge-admin\");\n\n      try {\n        const token = localStorage.getItem(\"token\") || \"\";\n\n        if (!token || typeof API === \"undefined\") {\n          if (badge) badge.textContent = \"Usuario\";\n          return;\n        }\n\n        const res = await fetch(API + \"/me\", {\n          headers: { Authorization: \"Bearer \" + token },\n        });\n\n        if (!res.ok) {\n          if (badge) badge.textContent = \"Usuario\";\n          return;\n        }\n\n        const me = await res.json();\n        const role = String(me.role || \"\").toUpperCase();\n\n        if (!badge) return;\n\n        if (role === \"DEV_ADMIN\") {\n          badge.textContent = \"Developer\";\n        } else if (role === \"ADMIN\") {\n          badge.textContent = \"Administrador\";\n        } else {\n          // USER u otro rol\n          badge.textContent = \"Usuario\";\n        }\n      } catch (err) {\n        console.error(\"Error comprobando rol en admin.html:\", err);\n        if (badge) badge.textContent = \"Usuario\";\n      }\n    });"],
  },
  "carrito.html": {
    title: `Carrito de Compras | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<header class="main-header">
  <div class="logo-container">
    <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img" />
    <h1>MR SmartService</h1>
  </div>

  <nav class="main-nav">
    <a href="index.html">Inicio</a>
    <a href="contacto.html">Contacto</a>
    <a href="carrito.html" class="active" style="color: var(--primary);">Carrito</a>
    <button id="btnAdmin" class="btn-admin">Login</button>
  </nav>
</header>

<section class="container" style="padding-top: 3rem;">
  <div class="cart-card">
    <header style="border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <h2 style="font-family: var(--font-head); color: var(--secondary);">Tu Carrito</h2>
      <a href="index.html#catalogo" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">Seguir comprando</a>
    </header>

    <div id="lista-carrito" class="cart-items">
      <!-- app.cart.js pinta los items -->
    </div>

    <div class="cart-summary" style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 2rem; text-align: right;">
      <h3 style="font-size: 1.5rem; color: var(--secondary); margin-bottom: 1rem;">
        Total: <span id="total" style="color: var(--primary); font-weight: 800;">$0</span>
      </h3>

      <button id="finalizarCompra" class="btn-primario" style="font-size: 1.1rem; padding: 1rem 2rem;">
        Finalizar compra
      </button>
    </div>
  </div>
</section>

<!-- ========== MODAL ENVÍO / CHECKOUT ========== -->
<div id="modalEnvio" class="modal-ml hidden">
  <div class="modal-ml-backdrop"></div>

  <div class="modal-ml-dialog">
    <button id="modalEnvioCancelar" class="btn-close-modal">✕</button>

    <div class="modal-ml-grid">
      <div class="modal-ml-main">
        <h2 class="ml-title-main">Elige la forma de entrega</h2>

        <div class="ml-card-wrapper">
          <label class="ml-card" for="radioDom">
            <div class="ml-card-header">
              <div class="ml-radio-area">
                <input type="radio" id="radioDom" name="shippingMode" value="domicilio" />
                <span class="ml-card-title">Enviar a domicilio</span>
              </div>
              <span class="ml-price">-</span>
            </div>

            <div class="ml-card-body">
              <p class="ml-address">Villavicencio, Meta</p>
              <p class="ml-sub">Llega mañana a tu dirección</p>
            </div>
          </label>

          <div id="shippingFormWrapper" class="shipping-form-container hidden">
            <div class="ml-form-grid">
              <div class="ml-field">
                <label>Nombre de contacto</label>
                <input type="text" id="shipNombre" placeholder="Ej: Juan Pérez" />
              </div>

              <div class="ml-field">
                <label>Teléfono</label>
                <input type="tel" id="shipTelefono" placeholder="Ej: 3001234567" />
              </div>

              <div class="ml-field full">
                <label>Dirección</label>
                <input type="text" id="shipDireccion" placeholder="Calle, Carrera, #, Barrio..." />
              </div>

              <div class="ml-field">
                <label>Barrio</label>
                <input type="text" id="shipBarrio" />
              </div>

              <div class="ml-field">
                <label>Ciudad</label>
                <input type="text" id="shipCiudad" value="Villavicencio" />
              </div>

              <div class="ml-field full">
                <label>Referencia (Opcional)</label>
                <input type="text" id="shipNota" placeholder="Edificio, color de casa, etc." />
              </div>
            </div>
          </div>
        </div>

        <div class="ml-card-wrapper">
          <label class="ml-card" for="radioLocal">
            <div class="ml-card-header">
              <div class="ml-radio-area">
                <input type="radio" id="radioLocal" name="shippingMode" value="local" />
                <span class="ml-card-title">Retirar en un punto de entrega</span>
              </div>
              <span class="ml-price">Gratis</span>
            </div>

            <div class="ml-card-body">
              <p class="ml-green-text">A 350 m de tu domicilio</p>
              <p class="ml-address">MR SmartService - C.C. Los Centauros</p>
              <p class="ml-sub">Lu a Vi: 8 a 12 hs. Lu a Vi: 14 a 17:30 hs.</p>
              <a href="#" class="ml-link">Ver punto en el mapa</a>
            </div>
          </label>
        </div>

        <div class="ml-actions-row">
          <button id="modalEnvioConfirmar" class="btn-ml-continuar" disabled>
            Continuar
          </button>

          <div id="shippingOutsideNotice" class="ml-alert hidden" style="margin-top:12px; padding:10px 12px; border-radius:10px; background:#fff3f3; color:#b00020; font-size:14px; line-height:1.3;">
            Por ahora el pago online con domicilio solo está disponible en <b>Villavicencio</b>. Si estás en otro municipio, pronto habilitaremos tarifas.
          </div>
        </div>
      </div>

      <div class="modal-ml-sidebar">
        <div class="ml-summary-card">
          <h3>Resumen de compra</h3>
          <hr class="ml-hr" />

          <div class="ml-row">
            <span>Productos</span>
            <span id="modalSubtotal">$ 0</span>
          </div>
          <div class="ml-row">
            <span>Envío</span>
            <span id="summaryShipping">A definir</span>
          </div>

          <hr class="ml-hr" />

          <div class="ml-total-row">
            <span>Total</span>
            <span id="modalTotal">$ 0</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="appToast" class="toast hidden" aria-live="polite">
  <span id="appToastMsg"></span>
</div>

<div id="app-footer"></div>`,
    scripts: [],
    inlineScripts: [],
  },
  "contacto.html": {
    title: `Contacto | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<header class="main-header">
    <div class="logo-container">
      <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img">
      <h1>MR SmartService</h1>
    </div>

    <nav class="main-nav">
      <a href="index.html">Inicio</a>
      <a href="contacto.html" class="active">Contacto</a>
      <a href="carrito.html">Carrito</a>
      <button id="btnAdmin" class="btn-admin">Login</button>
    </nav>
  </header>
  
  <section class="contacto">
    <div class="contacto-grid">
      
      <div class="contacto-form-card">
        <h2>Solicita tu cotización</h2>
        <p class="form-sub">Déjanos tus datos y te responderemos por WhatsApp al instante para agendar tu servicio.</p>
        
        <form id="whatsappForm" class="form-cotizacion">
          <div class="form-group">
            <label for="clienteNombre">Nombre</label>
            <input type="text" id="clienteNombre" placeholder="Tu nombre completo" required>
          </div>

          <div class="form-group">
            <label for="servicioInteres">¿Qué te interesa?</label>
            <select id="servicioInteres" required>
              <option value="" disabled selected>Selecciona una opción...</option>
              <option value="Instalación de Cámaras">Instalación de Cámaras de Seguridad</option>
              <option value="Mantenimiento de PC">Mantenimiento de Computadores</option>
              <option value="Compra de Repuestos">Cotización de Repuestos/Partes</option>
              <option value="Soporte Técnico">Soporte Técnico / Reparación</option>
              <option value="Otro">Otra consulta</option>
            </select>
          </div>

          <div class="form-group">
            <label for="clienteMensaje">Detalles (Opcional)</label>
            <textarea id="clienteMensaje" rows="4" placeholder="Ej: Necesito 4 cámaras para mi local..."></textarea>
          </div>

          <button type="submit" class="btn-whatsapp">
            <span class="icon-ws">📱</span> Enviar a WhatsApp
          </button>
        </form>
      </div>

      <div class="contacto-info-wrapper">
        
        <div class="info-card">
          <h3>Información de Contacto</h3>
          <p class="intro-text">
            Somos especialistas en tecnología y seguridad. Visítanos en nuestro local principal para recibir asesoría personalizada.
          </p>
          
          <ul class="info-list">
            <li>
              <strong>📍 Dirección:</strong><br>
              C.C. Los Centauros, Cra. 31 #37-32, Local 46, Villavicencio.
            </li>
            <li>
            <strong>📱 WhatsApp:</strong><br>
             <a href="https://wa.me/573014190633" target="_blank">+57 301 4190633</a>
             </li>
            <li>
              <strong>✉️ Email:</strong><br>
              <a href="mailto:yesfri@hotmail.es">yesfri@hotmail.es</a>
            </li>
            <li class="pagos-row">
              <strong>💳 Pagos:</strong> Davivienda • Bancolombia • Nequi
            </li>
          </ul>
        </div>

        <div class="mapa-container">
         <iframe 
         src="https://maps.google.com/maps?q=C.C.+Los+Centauros,+Cra.+31+%2337-32,+Villavicencio&t=&z=16&ie=UTF8&iwloc=&output=embed" 
         width="100%" 
         height="100%" 
         style="border:0;" 
         allowfullscreen="" 
         loading="lazy" 
         referrerpolicy="no-referrer-when-downgrade">
         </iframe>
        </div>

      </div>

    </div>
  </section>















  <div id="app-footer"></div>`,
    scripts: [],
    inlineScripts: ["document.getElementById('whatsappForm').addEventListener('submit', function(e) {\n    e.preventDefault(); \n\n    const nombre = document.getElementById('clienteNombre').value;\n    const servicio = document.getElementById('servicioInteres').value;\n    const mensaje = document.getElementById('clienteMensaje').value;\n    const telefono = \"573014190633\";\n\n    const texto =\n      `Hola MR SmartService, mi nombre es ${nombre}.\\n\\n` +\n      `Estoy interesado en: ${servicio}.\\n\\n` +\n      `Detalles: ${mensaje}`;\n\n    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;\n    window.open(url, '_blank');\n  });"],
  },
  "detalle-producto.html": {
    title: `Detalle del producto | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<!-- ========== HEADER ========== -->
  <header class="main-header">
    <div class="logo-container">
      <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img">
      <h1>MR SmartService</h1>
    </div>

    <nav class="main-nav">
      <a href="index.html">Inicio</a>
      <a href="carrito.html">Carrito</a>
      <button id="btnAdmin" class="btn-admin" type="button">Login</button>
    </nav>
  </header>

  <!-- ========== ICONO CARRITO FLOTANTE ========== -->
  <a href="carrito.html" class="cart-float" aria-label="Ir al carrito">
    🛒 <span id="cart-count">0</span>
  </a>

  <!-- ========== DETALLE PRODUCTO + RESEÑAS ========== -->
  <main class="detalle-main">
    <section
      id="detalleProducto"
      class="detalle-grid"
      role="region"
      aria-label="Detalle del producto"
    ><div class="prod-descripcion">
  <h2>Descripción</h2>
  <p id="descripcionProducto"></p>
</div>

<div class="prod-ficha">
  <h2>Características Principales</h2>
  <table class="tabla-ficha" id="tablaFicha"></table>
</div>

      <!-- initDetalleProducto() pintará la ficha completa -->
    </section>

    <section
      id="detalleReviewsSection"
      class="detalle-reviews"
      aria-label="Opiniones de clientes"
    >
      <!-- Contenedor para reseñas -->
    </section>
  </main>

  <!-- ========== MODAL ENVÍO / CHECKOUT (igual que carrito) ========== -->
  <div id="modalEnvio" class="modal-ml hidden">
  <div class="modal-ml-backdrop"></div>

  <div class="modal-ml-dialog">
    <button id="modalEnvioCancelar" class="btn-close-modal">✕</button>

    <div class="modal-ml-grid">
      
      <div class="modal-ml-main">
        <h2 class="ml-title-main">Elige la forma de entrega</h2>

        <div class="ml-card-wrapper">
          <label class="ml-card" for="radioDom">
            <div class="ml-card-header">
              <div class="ml-radio-area">
                <input type="radio" id="radioDom" name="shippingMode" value="domicilio">
                <span class="ml-card-title">Enviar a domicilio</span>
              </div>
              <span class="ml-price">$ 15.000</span>
            </div>
            
            <div class="ml-card-body">
              <p class="ml-address">Villavicencio, Meta</p>
              <p class="ml-sub">Llega mañana a tu dirección</p>
            </div>
          </label>

          <div id="shippingFormWrapper" class="shipping-form-container hidden">
            <div class="ml-form-grid">
              <div class="ml-field">
                <label>Nombre de contacto</label>
                <input type="text" id="shipNombre" placeholder="Ej: Juan Pérez">
              </div>
              <div class="ml-field">
                <label>Teléfono</label>
                <input type="tel" id="shipTelefono" placeholder="Ej: 3001234567">
              </div>
              <div class="ml-field full">
                <label>Dirección</label>
                <input type="text" id="shipDireccion" placeholder="Calle, Carrera, #, Barrio...">
              </div>
              <div class="ml-field">
                <label>Barrio</label>
                <input type="text" id="shipBarrio">
              </div>
              <div class="ml-field">
                <label>Ciudad</label>
                <input type="text" id="shipCiudad" value="Villavicencio">
              </div>
              <div class="ml-field full">
                <label>Referencia (Opcional)</label>
                <input type="text" id="shipNota" placeholder="Edificio, color de casa, etc.">
              </div>
            </div>
          </div>
        </div>

        <div class="ml-card-wrapper">
          <label class="ml-card" for="radioLocal">
            <div class="ml-card-header">
              <div class="ml-radio-area">
                <input type="radio" id="radioLocal" name="shippingMode" value="local">
                <span class="ml-card-title">Retirar en un punto de entrega</span>
              </div>
              <span class="ml-price">Gratis</span>
            </div>
            
            <div class="ml-card-body">
              <p class="ml-green-text">A 350 m de tu domicilio</p>
              <p class="ml-address">MR SmartService - C.C. Los Centauros</p>
              <p class="ml-sub">Lu a Vi: 8 a 12 hs. Lu a Vi: 14 a 17:30 hs.</p>
              <a href="#" class="ml-link">Ver punto en el mapa</a>
            </div>
          </label>
        </div>

        <div class="ml-actions-row">
          <button id="modalEnvioConfirmar" class="btn-ml-continuar" disabled>
            Continuar
          </button>
        </div>
      </div>

      <div class="modal-ml-sidebar">
        <div class="ml-summary-card">
          <h3>Resumen de compra</h3>
          <hr class="ml-hr">
          
          <div class="ml-row">
            <span>Productos</span>
            <span id="modalSubtotal">$ 0</span>
          </div>
          <div class="ml-row">
            <span>Envío</span>
            <span id="summaryShipping">A definir</span>
          </div>
          
          <hr class="ml-hr">
          
          <div class="ml-total-row">
            <span>Total</span>
            <span id="modalTotal">$ 0</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

  <!-- ========== TOAST GLOBAL ========== -->
  <div id="appToast" class="toast hidden" aria-live="polite">
    <span id="appToastMsg"></span>
  </div>

  <!-- ========== MODAL CONFIRM GLOBAL ========== -->
  <div id="appConfirm" class="modal-envio hidden" aria-modal="true" role="dialog">
    <div class="modal-envio-backdrop"></div>

    <div class="modal-envio-dialog modal-confirm-dialog">
      <h2 id="appConfirmTitle">¿Estás seguro?</h2>
      <p id="appConfirmMsg" class="modal-confirm-text"></p>

      <div class="modal-confirm-actions">
        <button id="appConfirmCancel" type="button" class="btn-secondary">
          Cancelar
        </button>
        <button id="appConfirmOk" type="button" class="btn-danger">
          Aceptar
        </button>
      </div>
    </div>
  </div>

  <!-- ========== FOOTER + JS ========== -->
  <div id="app-footer"></div>`,
    scripts: [],
    inlineScripts: [],
  },
  "estadisticas.html": {
    title: `Estadísticas | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<!-- ===== HEADER GLOBAL ===== -->
  <header class="main-header">
    <div class="logo-container">
      <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img"/>
      <h1>MR SmartService</h1>
    </div>
    <nav class="main-nav">
      <a href="index.html">Inicio</a>
      <a href="productos.html">Productos</a>
      <a href="contacto.html">Contacto</a>
      <a href="carrito.html">Carrito</a>
      <a href="admin.html">Administrador</a>
      <a href="estadisticas.html" class="active">Estadísticas</a>
    </nav>
  </header>

  <main class="container">

    <!-- ===== Historial de Ventas ===== -->
    <section class="panel">
      <header class="panel-head">
        <h2>Historial de ventas</h2>
        <form id="filtrosVentas" class="filters">
          <div class="field">
            <label for="ventaDesde">Desde</label>
            <input type="date" id="ventaDesde"/>
          </div>
          <div class="field">
            <label for="ventaHasta">Hasta</label>
            <input type="date" id="ventaHasta"/>
          </div>
          <div class="field">
            <label for="ventaEstado">Estado</label>
            <select id="ventaEstado">
              <option value="todos">Todos</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
          <div class="field grow">
            <label for="ventaQuery">Buscar</label>
            <input type="search" id="ventaQuery" placeholder="Cliente, email, id de orden..."/>
          </div>
          <button type="submit" class="btn btn-primary">Aplicar</button>
        </form>
      </header>

      <div class="table-wrap">
        <table class="smart-table" id="tablaVentas">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Orden</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th class="right">Acciones</th>
            </tr>
          </thead>
          <tbody id="ventasBody">
            <!-- filas dinámicas -->
          </tbody>
        </table>

        <div id="ventasEmpty" class="empty-state" hidden>
          <img src="https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/shopping-cart.svg" alt="Sin ventas"/>
          <p>No hay ventas que coincidan con los filtros.</p>
        </div>
      </div>

      <footer class="panel-foot">
        <div class="pager">
          <button class="btn btn-light" id="prevVentas">Anterior</button>
          <span id="infoVentas">Página 1 de 1</span>
          <button class="btn btn-light" id="nextVentas">Siguiente</button>
        </div>
      </footer>
    </section>

    <!-- ===== Estadísticas ===== -->
    <section class="panel">
      <header class="panel-head">
        <h2>Estadísticas</h2>
        <div class="filters">
          <div class="field">
            <label for="statsRange">Rango</label>
            <select id="statsRange">
              <option value="day">Diario</option>
              <option value="week">Semanal</option>
              <option value="month" selected>Mensual</option>
              <option value="year">Anual</option>
            </select>
          </div>
          <button class="btn btn-primary" id="btnStats">Actualizar</button>
        </div>
      </header>

      <div class="stats-grid">
        <div class="kpi">
          <span class="kpi-title">Ingresos</span>
          <strong id="kpiIngresos">$0</strong>
          <small id="kpiIngresosDelta" class="delta up">+0%</small>
        </div>
        <div class="kpi">
          <span class="kpi-title">Órdenes</span>
          <strong id="kpiOrdenes">0</strong>
          <small id="kpiOrdenesDelta" class="delta">0%</small>
        </div>
        <div class="kpi">
          <span class="kpi-title">Ticket promedio</span>
          <strong id="kpiTicket">$0</strong>
          <small id="kpiTicketDelta" class="delta">0%</small>
        </div>
        <div class="kpi">
          <span class="kpi-title">Tasa de aprobación</span>
          <strong id="kpiRate">0%</strong>
          <small id="kpiRateDelta" class="delta">0%</small>
        </div>
      </div>

      <!-- Mini barras (sin librerías) -->
      <div class="mini-bars" id="barsVentas"></div>

      <!-- (Opcional) Gráfica con Chart.js
      <div class="chart-wrapper">
        <canvas id="ventasChart"></canvas>
      </div>
      -->
    </section>

  </main>

  <!-- Footer inyectado por app.js -->
  <div id="app-footer"></div>

  <!-- Script principal (debe venir después del #app-footer) -->`,
    scripts: [],
    inlineScripts: [],
  },
  "factura.html": {
    title: `Factura - MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<div class="invoice-wrap" id="invoiceApp">
    <div class="invoice-head">
      <div>
        <h1>Factura mostrador</h1>
        <div class="invoice-meta muted" id="invCompany"></div>
        <div class="invoice-meta" id="invMeta"></div>
      </div>
      <div class="invoice-actions no-print">
        <button class="btn btn-ghost" id="btnBack">Volver</button>
        <button class="btn btn-primary" id="btnPrint">Imprimir / Guardar PDF</button>
      </div>
    </div>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:14px 0;" />

    <div id="invCustomer" class="invoice-meta"></div>

    <table class="invoice-table" id="invTable">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="width:90px;">Cant.</th>
          <th style="width:140px;">Precio</th>
          <th style="width:160px;">Total</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <div class="invoice-total">
      <div class="box invoice-meta" id="invTotals"></div>
    </div>

    <p class="invoice-meta muted" style="margin-top:12px;">Compra realizada en el sitio web de MR SmartService.</p>
  </div>`,
    scripts: ['/js/app.invoice.js'],
    inlineScripts: [],
  },
  "forgot-password.html": {
    title: `Recuperar contraseña | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<main class="auth-page">
    <section class="auth-card">
      <div class="logo-container" style="justify-content: center; margin-bottom: 1rem;">
        <img src="images/logo.png" alt="Logo" class="logo-img" style="height: 60px;">
      </div>
      
      <h2>Recuperar contraseña</h2>
      <p style="color: var(--text-light); margin-bottom: 1.5rem; font-size: 0.9rem;">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu acceso.
      </p>

      <form id="formForgotPassword" autocomplete="off">
        <div class="field">
          <label for="forgotEmail" style="text-align: left; display: block; margin-bottom: 0.5rem; font-weight: bold;">Correo electrónico</label>
          <input
            type="email"
            id="forgotEmail"
            name="email"
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <button type="submit" class="btn-primario">
          Enviar enlace
        </button>
      </form>

      <p id="forgotMsg" class="auth-msg" style="margin-top: 1rem; font-weight: bold;"></p>

      <div style="margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem;">
        <a href="login.html" style="color: var(--primary); text-decoration: none; font-weight: 600;">
          ← Volver al inicio de sesión
        </a>
      </div>
    </section>
  </main>

  <div id="appToast" class="toast hidden">
    <span id="appToastMsg"></span>
  </div>`,
    scripts: [],
    inlineScripts: [],
  },
  "index.html": {
    title: `MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<a href="carrito.html" class="cart-float">
    <img src="images/cart-icon.svg" alt="Carrito de compras">
    <span id="cart-count">0</span>
  </a>

  <header class="main-header">
    <div class="logo-container">
      <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img">
      <h1>MR SmartService</h1>
    </div>
    <nav class="main-nav">
      <a href="index.html" class="active">Inicio</a>
      <a href="contacto.html">Contacto</a>
      <a href="software.html">Softwares</a>
      <a href="publicidad.html">Publicidad</a>
      <a href="carrito.html">Carrito</a>
      <button id="btnAdmin" class="btn-admin">Login</button>
    </nav>
  </header>

  <div class="main-wrapper-gradient">
    <div class="layout-grid">

      <aside class="main-sidebar">
        <h3 class="sidebar-head">Categorías</h3>
        <ul class="category-menu">
          <li>
            <a href="index.html?cat=Computadores#catalogo"><span class="cat-icon">💻</span> Computadores</a>
          </li>
          <li>
            <a href="index.html?cat=Componentes#catalogo">
              <span class="cat-icon">💾</span> Componentes
            </a>
          </li>
          <li>
            <a href="index.html?cat=Cámaras%20Seguridad#catalogo">
              <span class="cat-icon">📹</span> Cámaras Seguridad
            </a>
          </li>
          <li>
            <a href="index.html?cat=Accesorios#catalogo">
              <span class="cat-icon">🎧</span> Accesorios
            </a>
          </li>

          <!-- ✅ FIX: este era el que estaba mal -->
          <li>
            <a href="software.html">
              <span class="cat-icon">🧩</span> Softwares
            </a>
          </li>

          <li>
            <a href="index.html?cat=Impresoras#catalogo">
              <span class="cat-icon">🖨️</span> Impresoras
            </a>
          </li>

          <li class="menu-divider"></li>
          <li>
            <a href="#catalogo" class="highlight-link">
              <span class="cat-icon">🔥</span> Ofertas del Día
            </a>
          </li>
          <li>
            <a href="contacto.html">
              <span class="cat-icon">🛠️</span> Servicio Técnico
            </a>
          </li>
        </ul>
      </aside>

      <main class="main-content-hero">
        <div class="bg-particles" id="bgParticles"></div>

        <div class="hero-card-integrated">
          <div class="hero-text-content">
            <h1>
              Tu tienda tecnológica con <br /><span>soporte real</span>.
            </h1>
            <p>
              Equipos de cómputo, componentes, accesorios y cámaras de seguridad
              con asesoría personalizada en Villavicencio.
            </p>
            <div class="hero-buttons">
              <button class="btn-main"
                onclick="document.getElementById('catalogo').scrollIntoView({behavior: 'smooth'})">
                Ver catálogo →
              </button>
              <button class="btn-sub" onclick="window.location.href='contacto.html'">
                Hablar con un asesor
              </button>
            </div>
          </div>

          <div class="hero-visual-panel">
            <div class="hero-nebulosa"></div>
                        <div class="hero-laptop-wrapper">
              <!-- HERO SLIDER (agrega/ajusta tus imágenes en /images/) -->
              <div class="hero-slider" id="heroSlider" aria-label="Slider principal">
                <!-- ✅ Mantengo tu imagen actual como primera -->
                <img class="hero-slide active" src="images/laptop-hero.avif" alt="Portátil MR SmartService" loading="eager">

                <!-- ✅ Agrega 3-4 imágenes más (PNG/WebP) -->
                <img class="hero-slide" src="images/CAMARA2.png" alt="Producto destacado 2" loading="lazy">
                <img class="hero-slide" src="images/games.png" alt="Producto destacado 3" loading="lazy">
                <img class="hero-slide" src="images/impresoras.png" alt="Producto destacado 4" loading="lazy">
                <img class="hero-slide" src="images/componentes.png" alt="Producto destacado 5" loading="lazy">

                <button class="hero-arrow prev" type="button" aria-label="Anterior">‹</button>
                <button class="hero-arrow next" type="button" aria-label="Siguiente">›</button>

                <div class="hero-dots" aria-label="Indicadores"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  </div>

  <section id="catalogo" class="catalogo-section">
    <div class="container-fluid">

      <section class="panel">
        <header class="panel-head">
          <h2 style="width: 100%; margin-bottom: 1rem; border-bottom:1px solid #eee; padding-bottom:0.5rem;">
            Catálogo Completo
          </h2>

          <form id="filtrosProd" class="filters">
            <div class="field grow">
              <label for="q">Buscar</label>
              <input id="q" type="search" placeholder="Buscar producto...">
            </div>
            <div class="field">
              <label for="categoriaSelect">Categoría</label>
              <select id="categoriaSelect">
                <option value="todos">Todas</option>
              </select>
            </div>
            <div class="field">
              <label>Min</label>
              <input id="pmin" type="number" placeholder="$0">
            </div>
            <div class="field">
              <label>Max</label>
              <input id="pmax" type="number" placeholder="$∞">
            </div>
            <div class="field" style="display:flex; flex-direction:row; align-items:center; gap:0.5rem; padding-bottom:0.8rem;">
              <input id="soloDesc" type="checkbox" style="width:auto; margin:0;">
              <label for="soloDesc" style="margin:0; cursor:pointer;">Ofertas</label>
            </div>
            <div class="field">
              <label for="ordenSelect">Ordenar</label>
              <select id="ordenSelect">
                <option value="recent">Recientes</option>
                <option value="priceAsc">Precio ↑</option>
                <option value="priceDesc">Precio ↓</option>
                <option value="nameAsc">Nombre A-Z</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-bottom:2px;">Filtrar</button>
          </form>
        </header>

        <div id="productos" class="grid-catalogo"></div>

        <div id="prodEmpty" class="empty-state" hidden>
          <p>No se encontraron productos.</p>
        </div>
      </section>

    </div>
  </section>

  <!-- CATEGORÍAS DESTACADAS -->
  <section class="home-cats">
    <div class="home-cats-header">
      <h2>Categorías destacadas</h2>
      <a href="index.html#catalogo">Ver todas</a>
    </div>

    <div class="home-cats-scroller">
      <button class="home-cats-nav prev" type="button" aria-label="Anterior" data-dir="-1">‹</button>
      <button class="home-cats-nav next" type="button" aria-label="Siguiente" data-dir="1">›</button>

      <div class="home-cats-grid" id="homeFeaturedCats">
        <article class="cat-card home-featured-cat" data-cat="Cámaras Seguridad" tabindex="0" role="link" aria-label="Ver Cámaras Seguridad">
          <div class="cat-icon">
            <img src="images/camaras.png" alt="Cámaras de seguridad" loading="lazy">
          </div>
          <div class="cat-info">
            <h3>Cámaras de seguridad</h3>
            <p>Instalación y configuración completa.</p>
          </div>
        </article>

        <article class="cat-card home-featured-cat" data-cat="Computadoras" tabindex="0" role="link" aria-label="Ver Computadoras">
          <div class="cat-icon">
            <img src="images/computadores.png" alt="Computadores" loading="lazy">
          </div>
          <div class="cat-info">
            <h3>Computadores</h3>
            <p>Portátiles y equipos de escritorio.</p>
          </div>
        </article>

        <article class="cat-card home-featured-cat" data-cat="Componentes" tabindex="0" role="link" aria-label="Ver Componentes">
          <div class="cat-icon">
            <img src="images/componentes.png" alt="Componentes" loading="lazy">
          </div>
          <div class="cat-info">
            <h3>Componentes</h3>
            <p>SSD, RAM, fuentes, gabinetes.</p>
          </div>
        </article>

        <article class="cat-card home-featured-cat" data-cat="Accesorios" tabindex="0" role="link" aria-label="Ver Accesorios">
          <div class="cat-icon">
            <img src="images/accesorios.png" alt="Accesorios" loading="lazy">
          </div>
          <div class="cat-info">
            <h3>Accesorios</h3>
            <p>Teclados, mouse, audífonos y más.</p>
          </div>
        </article>

        <article class="cat-card home-featured-cat" data-cat="Impresoras" tabindex="0" role="link" aria-label="Ver Impresoras">
          <div class="cat-icon">
            <img src="images/impresoras.png" alt="Impresoras" loading="lazy">
          </div>
          <div class="cat-info">
            <h3>Impresoras</h3>
            <p>Tinta, láser y multifuncionales.</p>
          </div>
        </article>

        <article class="cat-card home-featured-cat" data-cat="Games" tabindex="0" role="link" aria-label="Ver Games">
          <div class="cat-icon">
            <img src="images/games.png" alt="Games" loading="lazy">
          </div>
          <div class="cat-info">
            <h3>Games</h3>
            <p>Videojuegos y sus componentes.</p>
          </div>
        </article>

        <!-- ✅ Softwares: el JS (goCategory) debe redirigir a software.html -->
        <article class="cat-card home-featured-cat" data-cat="Softwares" tabindex="0" role="link" aria-label="Ver Softwares">
          <div class="cat-icon">
            <img src="images/software.avif" alt="Softwares" loading="lazy">
          </div>
          <div class="cat-info">
            <h3>Softwares</h3>
            <p>Softwares para tu negocio al mejor precio.</p>
          </div>
        </article>

      </div>
    </div>
  </section>
  <!-- PUBLICIDAD HOME (preview) -->
  <section class="home-section" id="sec-publicidad">
    <h2>Publicidad y promociones</h2>
    <p class="home-sub">Videos promocionales de MR SmartService.</p>

    <div id="homeAds" class="home-ads-grid"></div>

    <div class="home-ads-actions">
      <button id="btnAdsMore" type="button" class="btn btn-ghost">Ver más</button>
    </div>
  </section>

  <div id="appToast" class="toast hidden" aria-live="polite">
    <span id="appToastMsg"></span>
  </div>

  <div id="appConfirm" class="modal-envio hidden" aria-modal="true" role="dialog">
    <div class="modal-envio-backdrop"></div>
    <div class="modal-envio-dialog modal-confirm-dialog">
      <h2 id="appConfirmTitle">¿Estás seguro?</h2>
      <p id="appConfirmMsg" class="modal-confirm-text"></p>
      <div class="modal-confirm-actions">
        <button id="appConfirmCancel" type="button" class="btn-secondary">Cancelar</button>
        <button id="appConfirmOk" type="button" class="btn-danger">Aceptar</button>
      </div>
    </div>
  </div>

  <!-- BENEFICIOS HOME -->
  <section class="benefits-section">
    <div class="benefits-container">

      <div class="benefit-item">
        <div class="benefit-icon">
          <img src="https://cdn-icons-png.flaticon.com/512/893/893097.png" alt="Pago">
        </div>
        <div class="benefit-info">
          <h3>Paga como quieras</h3>
          <p>Tarjetas, efectivo o transferencias. Tu dinero siempre está seguro.</p>
          <a href="info-envios-pagos.html#pagos">Ver medios de pago</a>
        </div>
      </div>

      <div class="benefit-item">
        <div class="benefit-icon">
          <img src="https://cdn-icons-png.flaticon.com/512/709/709790.png" alt="Envío">
        </div>
        <div class="benefit-info">
          <h3>Envío rápido y seguro</h3>
          <p>Recibe tus productos en Villavicencio y todo el país.</p>
          <a href="info-envios-pagos.html#envios">Ver costos de envío</a>
        </div>
      </div>

      <div class="benefit-item">
        <div class="benefit-icon">
          <img src="https://cdn-icons-png.flaticon.com/512/1161/1161388.png" alt="Seguridad">
        </div>
        <div class="benefit-info">
          <h3>Compra protegida</h3>
          <p>¿No es lo que esperabas? Te devolvemos el dinero.</p>
          <a href="info-envios-pagos.html#proteccion">Cómo te protegemos</a>
        </div>
      </div>

    </div>
  </section>

  <div id="app-footer"></div>

  
  

  
  
  
  
  
  
  

  <!-- NOTA: app.software.js y app.publicidad.js NO son necesarios en index.html
       (van en sus páginas respectivas). -->
  

  <!-- Scroll reveal para .reveal -->
  

  
  <!-- HERO SLIDER JS -->`,
    scripts: [],
    inlineScripts: ["const reveals = document.querySelectorAll(\".reveal\");\n\n    const observer = new IntersectionObserver(\n      (entries) => {\n        entries.forEach((entry) => {\n          if (entry.isIntersecting) {\n            entry.target.classList.add(\"visible\");\n            observer.unobserve(entry.target);\n          }\n        });\n      },\n      { threshold: 0.15 }\n    );\n\n    reveals.forEach((el) => observer.observe(el));", "document.addEventListener('DOMContentLoaded', () => {\n      const container = document.getElementById('bgParticles');\n      if (!container) return;\n\n      const total = 40;\n      for (let i = 0; i < total; i++) {\n        const dot = document.createElement('span');\n        dot.classList.add('particle');\n        dot.style.left = Math.random() * 100 + 'vw';\n\n        const delay = Math.random() * 8;\n        const duration = 6 + Math.random() * 6;\n\n        dot.style.animationDelay = delay + 's';\n        dot.style.animationDuration = duration + 's';\n\n        const size = 3 + Math.random() * 7;\n        dot.style.width = size + 'px';\n        dot.style.height = size + 'px';\n\n        container.appendChild(dot);\n      }\n    });", "(function(){\n    const slider = document.getElementById('heroSlider');\n    if (!slider) return;\n\n    const slides = Array.from(slider.querySelectorAll('.hero-slide'));\n    const btnPrev = slider.querySelector('.hero-arrow.prev');\n    const btnNext = slider.querySelector('.hero-arrow.next');\n    const dotsWrap = slider.querySelector('.hero-dots');\n\n    let i = 0;\n    let timer = null;\n    const INTERVAL = 4000; // 4s pro\n\n    // Crear dots\n    if (dotsWrap){\n      dotsWrap.innerHTML = slides.map((_, idx) =>\n        `<button class=\"hero-dot ${idx===0?'active':''}\" type=\"button\" aria-label=\"Ir a ${idx+1}\"></button>`\n      ).join('');\n    }\n    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.hero-dot')) : [];\n\n    function show(idx){\n      i = (idx + slides.length) % slides.length;\n      slides.forEach((s, k) => s.classList.toggle('active', k === i));\n      dots.forEach((d, k) => d.classList.toggle('active', k === i));\n    }\n\n    function next(){ show(i + 1); }\n    function prev(){ show(i - 1); }\n\n    function start(){\n      stop();\n      timer = setInterval(next, INTERVAL);\n    }\n    function stop(){\n      if (timer) clearInterval(timer);\n      timer = null;\n    }\n\n    btnNext && btnNext.addEventListener('click', () => { next(); start(); });\n    btnPrev && btnPrev.addEventListener('click', () => { prev(); start(); });\n\n    dots.forEach((d, idx) => d.addEventListener('click', () => { show(idx); start(); }));\n\n    // Pausar en hover/touch\n    slider.addEventListener('mouseenter', stop);\n    slider.addEventListener('mouseleave', start);\n    slider.addEventListener('touchstart', stop, {passive:true});\n    slider.addEventListener('touchend', start, {passive:true});\n\n    show(0);\n    start();\n  })();"],
  },
  "info-envios-pagos.html": {
    title: `Información de Envíos, Pagos y Protección | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<header class="main-header">
  <div class="logo-container">
    <img src="images/logo.png" class="logo-img">
    <h1>MR SmartService</h1>
  </div>
  <nav class="main-nav">
    <a href="index.html">Inicio</a>
    <a href="contacto.html">Contacto</a>
    <a href="carrito.html">Carrito</a>
  </nav>
</header>

<div class="info-wrapper">

  <section class="info-block">
    <h2>💳 Medios de pago</h2>
    <p>Aceptamos:</p>
    <ul>
      <li>Tarjetas débito y crédito (Mercado Pago).</li>
      <li>Transferencia Bancolombia, Davivienda y Nequi.</li>
      <li>Pago en efectivo en tienda.</li>
    </ul>
  </section>

  <section class="info-block">
    <h2>🚚 Costos de envío</h2>
    <p>Los envíos se calculan así:</p>
    <ul>
      <li><strong>Villavicencio:</strong> domicilio desde $7.000.</li>
      <li><strong>Acacías:</strong> domicilio desde $20.000.</li>
      <li><strong>Otras ciudades:</strong> envío por Coordinadora (se paga al transportador).</li>
    </ul>
  </section>

  <section class="info-block">
    <h2>🛡️ Compra protegida</h2>
    <p>
      Todas tus compras están respaldadas.  
      Si el producto llega defectuoso o no corresponde a lo comprado, te ayudamos con cambio o devolución.
    </p>
  </section>

</div>`,
    scripts: [],
    inlineScripts: [],
  },
  "login.html": {
    title: `Login | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<header class="main-header">
    <div class="logo-container">
      <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img">
      <h1>MR SmartService</h1>
    </div>
  </header>

  <section class="login-section">
    <div class="login-box">
      <div class="login-icon" id="loginLock">🔒</div>

      <h2>Iniciar sesión</h2>
      <input type="text" id="usuario" placeholder="Usuario o email" autocomplete="username">
      <div class="input-group">
  <input
    type="password"
    id="password"
    placeholder="Contraseña"
    autocomplete="current-password"
  >
  <span id="togglePassword" class="toggle-eye">👁️</span>
</div>


      <button id="btnLogin">Entrar</button>
      <p id="mensaje"></p>
      <a href="forgot-password.html" class="link-forgot">¿Olvidaste tu contraseña?</a>

    </div>
  </section>

  <footer class="footer">
    <div class="footer-bottom">
      <p>© 2025 <strong>MR SmartService</strong>. Todos los derechos reservados.</p>
    </div>
  </footer>`,
    scripts: [],
    inlineScripts: ["document.addEventListener(\"DOMContentLoaded\", () => {\n    const pass = document.getElementById(\"password\");\n    const eye = document.getElementById(\"togglePassword\");\n\n    eye.addEventListener(\"click\", () => {\n      const isHidden = pass.type === \"password\";\n      pass.type = isHidden ? \"text\" : \"password\";\n      eye.textContent = isHidden ? \"🔑\" : \"👁️\";\n    });\n  });"],
  },
  "postpago.html": {
    title: `Pago aprobado`,
    bodyClass: ``,
    bodyHtml: `<div class="wrap">
    <div class="card">
      <div class="ok">
        <div class="badge">✅</div>
        <div>
          <h2 style="margin:0">Procesando tu pago…</h2>
          <div class="muted" id="subtitle">Confirmando con Mercado Pago</div>
        </div>
      </div>
    </div>

    <div class="card" id="result" style="display:none">
      <h3 style="margin:0 0 8px">Listo</h3>
      <div class="muted" id="meta"></div>

      <div class="btns">
        <a class="btn btn-primary" id="btnInvoice" href="#" target="_blank" rel="noopener">Descargar factura</a>
        <a class="btn btn-ghost" id="btnWhats" href="#" target="_blank" rel="noopener">Pedir por WhatsApp</a>
        <a class="btn btn-ghost" id="btnStore" href="index.html">Volver a la tienda</a>
      </div>

      <div class="muted" style="margin-top:12px">
        Si no se abre la factura, copia y pega este link: <br>
        <code id="invoiceText"></code>
      </div>
    </div>

    <div class="card" id="error" style="display:none">
      <h3 style="margin:0 0 8px;color:#b91c1c">No pudimos confirmar el pago</h3>
      <div class="muted" id="errText"></div>
      <div class="btns">
        <a class="btn btn-primary" href="carrito.html">Volver al carrito</a>
        <a class="btn btn-ghost" href="index.html">Ir a la tienda</a>
      </div>
    </div>
  </div>`,
    scripts: [],
    inlineScripts: ["function getParam(name){\n    const u = new URL(window.location.href);\n    return u.searchParams.get(name);\n  }\n\n  function apiBase(){\n    // window.API viene de app.config.js\n    if (window.API) return window.API;\n    // fallback (por si no cargó el config)\n    return 'https://mrsmartservice-256100476140.us-central1.run.app/api';\n  }\n\n  async function confirmPago(paymentId){\n    const url = apiBase().replace(/\\/$/, '') + '/payments/confirm';\n    const res = await fetch(url, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ payment_id: String(paymentId) })\n    });\n    let data = null;\n    try { data = await res.json(); } catch (e) { data = { error: 'bad_response' }; }\n    if (!res.ok) {\n      const err = new Error(data?.error || 'confirm_failed');\n      err.data = data;\n      throw err;\n    }\n    return data;\n  }\n\n  // WhatsApp (pon aquí tu número con indicativo, sin +)\n  const WHATS_PHONE = (window.WHATSAPP_INVOICE || window.WHATSAPP_BUSINESS || '573014190633').replace(/\\D/g,'');\n\n  // Construir mensaje WhatsApp con datos de la orden + productos + solicitud de datos fiscales\n  async function buildWhatsMsg({ invoiceUrl, orderId, paymentId, statusFromConfirm }){\n    try{\n      // Extraer token desde la URL de la factura (viene del backend)\n      const u = new URL(invoiceUrl);\n      const token = u.searchParams.get('token') || '';\n\n      // Pedimos el JSON de la factura para sacar cliente + items + totales\n      const inv = await (async () => {\n        const url = apiBase().replace(/\\/$/, '') + `/invoices/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`;\n        const r2 = await fetch(url);\n        if (!r2.ok) throw new Error('invoice_json_failed');\n        return r2.json();\n      })();\n\n      const order = inv.order || {};\n      const items = Array.isArray(inv.items) ? inv.items : [];\n\n      const moneyCOP = (n) => {\n        try { return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(Number(n||0)); }\n        catch { return '$' + (Number(n||0)||0); }\n      };\n\n      const name  = order.customer_name || order.domicilio_nombre || 'Cliente';\n      const email = order.customer_email || order.payer_email || order.email || '';\n      const tel   = order.customer_phone || order.domicilio_telefono || '';\n      const city  = order.customer_city || order.domicilio_ciudad || '';\n      const addr  = order.customer_address || order.domicilio_direccion || '';\n\n      const modo = String(order.domicilio_modo || '').toLowerCase();\n      let entrega = 'Recoger en tienda';\n      if (modo === 'local') entrega = 'Domicilio (Villavicencio)';\n      else if (modo === 'coordinadora') entrega = 'Envío (Coordinadora)';\n      else if (modo) entrega = 'Entrega: ' + order.domicilio_modo;\n\n      const lines = [];\n      lines.push('Hola, necesito mi factura / confirmación de compra.');\n      lines.push(`Orden #${orderId} · Pago ${paymentId} · Estado: ${order.status || statusFromConfirm}`);\n      lines.push(`Cliente: ${name}${tel ? ' · Tel: ' + tel : ''}${email ? ' · Email: ' + email : ''}`);\n      if (city || addr) lines.push(`Dirección: ${[city, addr].filter(Boolean).join(' / ')}`);\n      lines.push(entrega);\n\n      if (items.length) {\n        lines.push('--- Productos ---');\n        let subtotal = 0;\n        items.forEach((it, idx) => {\n          const qty = Number(it.quantity || 0);\n          const unit = Number(it.unit_price || 0);\n          const totalLine = qty * unit;\n          subtotal += totalLine;\n          lines.push(`${idx+1}) ${it.name || ''} x${qty} · ${moneyCOP(unit)} · ${moneyCOP(totalLine)}`);\n        });\n        const ship = Number(order.domicilio_costo || 0);\n        const total = Number(order.total_amount || (subtotal + ship));\n        lines.push('--- Totales ---');\n        lines.push(`Subtotal: ${moneyCOP(subtotal)}`);\n        if (ship) lines.push(`Domicilio: ${moneyCOP(ship)}`);\n        lines.push(`Total: ${moneyCOP(total)}`);\n      }\n\n      // ✅ Solicitud de datos fiscales (para facturar manual)\n      lines.push('');\n      lines.push('✅ DATOS PARA FACTURACIÓN (por favor responde con esto):');\n      lines.push('1) Nombre completo');\n      lines.push('2) Tipo y número de documento (CC o NIT)');\n      lines.push('3) Razón social (si aplica)');\n      lines.push('4) Correo para factura');\n      lines.push('5) Teléfono');\n      lines.push('6) Dirección + Ciudad');\n      lines.push('');\n      lines.push('Factura: ' + invoiceUrl);\n\n      return lines.join('\\n');\n    } catch (e) {\n      // fallback simple (igual pide datos fiscales)\n      return (\n        `Hola, necesito mi factura / confirmación de compra.\\n` +\n        `Orden #${orderId} · Pago ${paymentId}.\\n\\n` +\n        `✅ DATOS PARA FACTURACIÓN (por favor responde con esto):\\n` +\n        `1) Nombre completo\\n` +\n        `2) Tipo y número de documento (CC o NIT)\\n` +\n        `3) Razón social (si aplica)\\n` +\n        `4) Correo para factura\\n` +\n        `5) Teléfono\\n` +\n        `6) Dirección + Ciudad\\n\\n` +\n        `Factura: ${invoiceUrl}`\n      );\n    }\n  }\n\n  (async function main(){\n    const paymentId = getParam('payment_id') || getParam('collection_id');\n    const subtitle = document.getElementById('subtitle');\n\n    if (!paymentId) {\n      document.getElementById('error').style.display = 'block';\n      document.getElementById('errText').textContent = 'Falta payment_id en la URL. (Ej: ?payment_id=123)';\n      subtitle.textContent = 'Faltan datos en la URL';\n      return;\n    }\n\n    try {\n      const r = await confirmPago(paymentId);\n      subtitle.textContent = 'Pago confirmado ✅';\n\n      const invoiceUrl = r.invoice_url;\n      const orderId = r.order_id;\n\n      if (!invoiceUrl) throw new Error('invoice_url_missing');\n\n      // Guarda para que en la tienda puedas mostrar \"Última factura\"\n      try {\n        localStorage.setItem('last_invoice_url', invoiceUrl);\n        localStorage.setItem('last_order_id', String(orderId));\n        localStorage.setItem('last_payment_id', String(paymentId));\n        localStorage.setItem('last_invoice_at', new Date().toISOString());\n      } catch (e) {}\n\n      // pinta UI\n      document.getElementById('result').style.display = 'block';\n      document.getElementById('meta').innerHTML = `Orden <b>#${orderId}</b> · Estado <b>${r.status}</b> · Payment <b>${paymentId}</b>`;\n\n      const btnInvoice = document.getElementById('btnInvoice');\n      btnInvoice.href = invoiceUrl;\n      document.getElementById('invoiceText').textContent = invoiceUrl;\n\n      // ✅ IMPORTANTE: armar WhatsApp AL CLIC (evita caché y asegura el mensaje completo)\n      const btnWhats = document.getElementById('btnWhats');\n      btnWhats.addEventListener('click', async (ev) => {\n        ev.preventDefault();\n        btnWhats.textContent = 'Abriendo WhatsApp...';\n\n        const msg = await buildWhatsMsg({\n          invoiceUrl,\n          orderId,\n          paymentId,\n          statusFromConfirm: r.status\n        });\n\n        const url = `https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(msg)}`;\n        window.open(url, '_blank', 'noopener');\n\n        btnWhats.textContent = 'Pedir por WhatsApp';\n      });\n\n    } catch (e) {\n      subtitle.textContent = 'Error al confirmar ❌';\n      document.getElementById('error').style.display = 'block';\n      document.getElementById('errText').textContent = `${e.message} ${e.data ? JSON.stringify(e.data) : ''}`;\n    }\n  })();"],
  },
  "publicidad.html": {
    title: `Publicidad | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<header class="main-header">
    <div class="logo-container">
      <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img">
      <h1>MR SmartService</h1>
    </div>
    <nav class="main-nav">
      <a href="index.html" >Inicio</a>
      <a href="publicidad.html" class="active">publicidad</a>
      <a href="contacto.html">Contacto</a>
      <button id="btnAdmin" class="btn-admin">Login</button>
    </nav>
  </header>
  <main class="ads-wrap">
    <div class="ads-head">
      <div>
        <h1>Publicidad</h1>
        <div class="muted">Anuncios activos del sistema (mejor rendimiento que en Home).</div>
      </div>

      <div class="ads-tools">
        <input id="q" type="search" placeholder="Buscar anuncio..." />
        <select id="type">
          <option value="all">Todos</option>
          <option value="image">Solo imagen</option>
          <option value="video">Solo video</option>
        </select>
      </div>
    </div>

    <div id="status" class="muted"></div>

    <section class="ads-grid" id="adsGrid"></section>

    <div class="ads-footer">
      <button class="btn-load" id="btnMore" type="button" style="display:none">Cargar más</button>
    </div>
  </main>`,
    scripts: ['/js/app.publicidad.js'],
    inlineScripts: [],
  },
  "reset-password.html": {
    title: `Restablecer Contraseña | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<main class="auth-page">
    <section class="auth-card">
      <div class="logo-container" style="justify-content: center; margin-bottom: 1rem;">
        <img src="images/logo.png" alt="Logo" class="logo-img" style="height: 60px;">
      </div>

      <h2>Crear nueva contraseña</h2>
      <p style="color: var(--text-light); margin-bottom: 1.5rem; font-size: 0.9rem;">
        Escribe tu nueva contraseña segura.
      </p>

      <form id="formResetPassword" autocomplete="off">
        <div class="field" style="margin-bottom: 1rem;">
          <label for="resetPassword1" style="text-align: left; display: block; margin-bottom: 0.5rem; font-weight: bold;">Nueva contraseña</label>
          <input type="password" id="resetPassword1" required placeholder="Mínimo 8 caracteres" />
        </div>

        <div class="field" style="margin-bottom: 1rem;">
          <label for="resetPassword2" style="text-align: left; display: block; margin-bottom: 0.5rem; font-weight: bold;">Confirmar contraseña</label>
          <input type="password" id="resetPassword2" required placeholder="Repite la contraseña" />
        </div>

        <button type="submit" class="btn-primario">
          Guardar contraseña
        </button>
      </form>

      <p id="resetMsg" class="auth-msg" style="margin-top: 1rem; font-weight: bold;"></p>
    </section>
  </main>`,
    scripts: [],
    inlineScripts: [],
  },
  "software.html": {
    title: `Softwares | MR SmartService`,
    bodyClass: ``,
    bodyHtml: `<header class="main-header">
    <div class="logo-container">
      <img src="images/logo.png" alt="Logo MR SmartService" class="logo-img">
      <h1>MR SmartService</h1>
    </div>
    <nav class="main-nav">
      <a href="index.html" >Inicio</a>
      <a href="software.html" class="active">Softwares</a>
      <a href="contacto.html">Contacto</a>
      <button id="btnAdmin" class="btn-admin">Login</button>
    </nav>
  </header>
  <main class="sw-wrap">
    <section class="sw-hero">
      <h1>Softwares instalables</h1>
      <p>Apps de escritorio para tu negocio. <b>Pago único</b>, instalables, pensadas para funcionar incluso sin internet.</p>
    </section>

    <section class="sw-grid" id="swGrid"></section>

    <section class="sw-note">
      <h2>Entrega automática (futuro)</h2>
      <p class="muted">Cuando compres, el sistema generará usuario/clave únicos y te dará el instalador.</p>
      <div class="sw-steps">
        <div class="sw-step"><b>1) Compra</b>Pagas el software (Mercado Pago).</div>
        <div class="sw-step"><b>2) Credenciales</b>Se crea usuario y clave únicos (no repetidos).</div>
        <div class="sw-step"><b>3) Instalador</b>Descargas e ingresas con tus credenciales.</div>
      </div>
    </section>
  </main>`,
    scripts: ['/js/app.software.js'],
    inlineScripts: [],
  }
};
