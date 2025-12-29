/********************
 * MR SmartService - UI Helpers
 ********************/

/* ========== UI HELPERS (TOAST + CONFIRM) ========== */
function showToast(msg, timeout = 2200) {
  const toast = document.getElementById('appToast');
  const span  = document.getElementById('appToastMsg');

  if (!toast || !span) {
    alert(msg);
    return;
  }

  span.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, timeout);
}

function showConfirm({ title = 'Confirmar', message = '', onConfirm, onCancel }) {
  const modal     = document.getElementById('appConfirm');
  const hTitle    = document.getElementById('appConfirmTitle');
  const pMsg      = document.getElementById('appConfirmMsg');
  const btnOk     = document.getElementById('appConfirmOk');
  const btnCancel = document.getElementById('appConfirmCancel');

  if (!modal || !btnOk || !btnCancel) {
    const ok = confirm(message || title);
    if (ok && typeof onConfirm === 'function') onConfirm();
    if (!ok && typeof onCancel === 'function') onCancel();
    return;
  }

  hTitle.textContent = title;
  pMsg.textContent   = message;

  const hide = () => modal.classList.add('hidden');

  const handleOk = () => {
    hide();
    btnOk.removeEventListener('click', handleOk);
    btnCancel.removeEventListener('click', handleCancel);
    if (typeof onConfirm === 'function') onConfirm();
  };

  const handleCancel = () => {
    hide();
    btnOk.removeEventListener('click', handleOk);
    btnCancel.removeEventListener('click', handleCancel);
    if (typeof onCancel === 'function') onCancel();
  };

  btnOk.addEventListener('click', handleOk);
  btnCancel.addEventListener('click', handleCancel);

  modal.classList.remove('hidden');
}

/* ========== UI HELPERS (BUSY / LOADER) ========== */
function showBusy(message = 'Procesando…') {
  let el = document.getElementById('appBusy');

  if (!el) {
    el = document.createElement('div');
    el.id = 'appBusy';
    el.setAttribute('role', 'status');
    el.style.position = 'fixed';
    el.style.inset = '0';
    el.style.zIndex = '9999';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.background = 'rgba(0,0,0,0.35)';

    const box = document.createElement('div');
    box.style.background = '#fff';
    box.style.borderRadius = '14px';
    box.style.padding = '18px 18px';
    box.style.minWidth = '240px';
    box.style.boxShadow = '0 10px 30px rgba(0,0,0,0.18)';
    box.style.display = 'flex';
    box.style.alignItems = 'center';
    box.style.gap = '12px';

    const spin = document.createElement('div');
    spin.style.width = '20px';
    spin.style.height = '20px';
    spin.style.border = '3px solid #e5e7eb';
    spin.style.borderTopColor = '#111827';
    spin.style.borderRadius = '999px';
    spin.style.animation = 'mrSpin 0.9s linear infinite';

    const txt = document.createElement('div');
    txt.id = 'appBusyText';
    txt.style.fontWeight = '700';
    txt.style.color = '#111827';
    txt.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif';

    box.appendChild(spin);
    box.appendChild(txt);
    el.appendChild(box);
    document.body.appendChild(el);

    // keyframes sin tocar tu CSS global
    if (!document.getElementById('mrSpinStyle')) {
      const st = document.createElement('style');
      st.id = 'mrSpinStyle';
      st.textContent = '@keyframes mrSpin{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }
  }

  const t = document.getElementById('appBusyText');
  if (t) t.textContent = message;
  el.classList.remove('hidden');
}

function hideBusy() {
  const el = document.getElementById('appBusy');
  if (el) el.classList.add('hidden');
}
