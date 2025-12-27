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
