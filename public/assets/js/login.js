(async function () {
  await window.MR_HEADER.initHeader();

  const form = document.getElementById('login-form');
  const msg = document.getElementById('msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    try {
      const email = form.email.value.trim();
      const password = form.password.value;
      const res = await window.MR_API.post('/api/login', { email, password });
      if (!res?.access_token) throw new Error('No se recibió token');
      window.MR_AUTH.setToken(res.access_token);
      location.href = '/admin.html';
    } catch (err) {
      msg.textContent = `Error: ${err.message}`;
    }
  });
})();
