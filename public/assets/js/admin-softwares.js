(async function () {
  await window.MR_HEADER.initHeader();

  const elMsg = document.getElementById('msg');
  const table = document.getElementById('softwares-table');
  const form = document.getElementById('software-form');
  const btnNew = document.getElementById('btn-new');

  const user = await window.MR_AUTH.me();
  if (!user || !['ADMIN','DEV_ADMIN'].includes(user.role)) {
    document.getElementById('admin-guard').innerHTML = '<div class="card"><div class="card-body">Acceso solo para ADMIN / DEV_ADMIN.</div></div>';
    document.getElementById('admin-panel').style.display = 'none';
    return;
  }

  let currentId = null;
  let isSaving = false;

  function setMsg(t, ok) {
    elMsg.textContent = t || '';
    elMsg.style.color = ok ? 'var(--brand)' : 'var(--danger)';
  }

  function clearForm() {
    currentId = null;
    form.reset();
    form.active.checked = true;
    document.getElementById('form-title').textContent = 'Nuevo software';
  }

  async function load() {
    setMsg('');
    const rows = await window.MR_API.get('/api/softwares/all');
    render(rows || []);
  }

  function render(rows) {
    table.innerHTML = rows.map((s) => {
      return `
        <tr>
          <td>${s.software_id}</td>
          <td><strong>${s.name}</strong><div class="small">${s.short_description || ''}</div></td>
          <td>${s.active ? '<span class="badge">Activo</span>' : '<span class="badge" style="border-color:rgba(239,68,68,0.4);color:#fecaca;">Oculto</span>'}</td>
          <td class="small">${s.price ? window.MR_UTIL.fmtCOP(s.price) : ''}</td>
          <td style="white-space:nowrap;">
            <button class="btn" data-edit="${s.software_id}">Editar</button>
            <button class="btn danger" data-del="${s.software_id}">Eliminar</button>
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5" class="small">No hay softwares.</td></tr>';

    for (const b of table.querySelectorAll('[data-edit]')) {
      b.addEventListener('click', async () => {
        const id = Number(b.getAttribute('data-edit'));
        const all = await window.MR_API.get('/api/softwares/all');
        const s = (all || []).find((x) => Number(x.software_id) === id);
        if (!s) return;
        currentId = id;
        document.getElementById('form-title').textContent = `Editar software #${id}`;
        form.name.value = s.name || '';
        form.short_description.value = s.short_description || '';
        form.features.value = s.features || '';
        form.tags.value = s.tags || '';
        form.price.value = s.price || '';
        form.image_url.value = s.image_url || '';
        form.whatsapp_template.value = s.whatsapp_template || '';
        form.active.checked = !!s.active;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    for (const b of table.querySelectorAll('[data-del]')) {
      b.addEventListener('click', async () => {
        const id = Number(b.getAttribute('data-del'));
        if (!confirm(`¿Eliminar software #${id}?`)) return;
        try {
          await window.MR_API.del(`/api/softwares/${id}`);
          setMsg('Eliminado.', true);
          load();
        } catch (e) {
          setMsg(e.message, false);
        }
      });
    }
  }

  btnNew.addEventListener('click', () => {
    clearForm();
    setMsg('');
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (isSaving) return;
    setMsg('');

    const btn = form.querySelector('button[type="submit"]');
    const payload = {
      name: form.name.value.trim(),
      short_description: form.short_description.value.trim(),
      features: form.features.value.trim(),
      tags: form.tags.value.trim(),
      price: form.price.value ? Number(form.price.value) : undefined,
      image_url: form.image_url.value.trim(),
      whatsapp_template: form.whatsapp_template.value.trim(),
      active: !!form.active.checked,
    };

    if (!payload.name) {
      setMsg('Nombre es obligatorio.', false);
      return;
    }

    try {
      isSaving = true;
      if (btn) btn.disabled = true;
      if (currentId) {
        await window.MR_API.put(`/api/softwares/${currentId}`, payload);
        setMsg('Actualizado ✅', true);
      } else {
        await window.MR_API.post('/api/softwares', payload);
        setMsg('Creado ✅', true);
      }
      clearForm();
      load();
    } catch (e) {
      setMsg(e.message, false);
    } finally {
      isSaving = false;
      if (btn) btn.disabled = false;
    }
  });

  clearForm();
  load();
})();
