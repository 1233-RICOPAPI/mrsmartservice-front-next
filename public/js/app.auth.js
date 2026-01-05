/********************
 * MR SmartService - Auth (login, recuperar, reset, cambio de contraseña)
 ********************/

// API base (en producción apunta a Cloud Run)
const BASE = (typeof apiBase === 'function' ? apiBase() : (window.API || ''));

/* ============== LOGIN ============== */
async function doLogin(email, password) {
  const msg = document.getElementById('mensaje');
  if (msg) {
    msg.textContent = '';
    msg.style.color = 'red';
  }

  try {
    // 1) Login contra la API
    const res = await fetch(BASE + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.token) {
      throw new Error(data.error || 'Error de login');
    }

    // 2) Guardar token
    setToken(data.token);

    // 3) Preguntar a /api/me qué rol tiene este token
    let goAdmin = false;
    try {
      const meRes = await fetch(BASE + '/me', {
        headers: authHeaders()    // usa el token recién guardado
      });

      if (meRes.ok) {
        const me = await meRes.json().catch(() => ({}));

        // (Opcional) Si tienes usuarios también creados en Firebase Auth,
        // intenta iniciar sesión para habilitar uploads directos a Firebase Storage.
        // Si no existen en Firebase, este intento fallará y el panel subirá por backend /api/upload.
        try {
          const fbEmail = String(me.email || email || '').trim();
          if (fbEmail && window.MR && typeof window.MR.firebaseSignIn === 'function') {
            await window.MR.firebaseSignIn(fbEmail, password);
          }
        } catch (e) {
          console.warn('Firebase Storage login falló (se usará /api/upload):', e?.message || e);
        }

        const role = String(me.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'DEV_ADMIN') goAdmin = true;
      } else {
        // Si /me responde 403 ó 401, lo tratamos como usuario normal
        console.warn('GET /me no OK después de login:', meRes.status);
      }
    } catch (errMe) {
      console.error('Error consultando /me después de login:', errMe);
      // en error también lo tratamos como usuario normal
    }

    // 4) Redirigir según rol
    const nextUrl = goAdmin ? 'admin.html' : 'index.html';

    // Animación opcional del candado (si existe)
    const lock = document.getElementById('loginLock');
    if (lock) {
      lock.textContent = '🔓';
      lock.classList.add('opening');
      setTimeout(() => { window.location.href = nextUrl; }, 600);
    } else {
      window.location.href = nextUrl;
    }

  } catch (e) {
    console.error('Error en login:', e);
    if (msg) {
      msg.textContent = 'Usuario o contraseña incorrectos';
      msg.style.color = 'red';
    }
  }
}



/**
 * Enlaza los eventos del formulario de login (login.html)
 * - Inputs: #usuario, #password
 * - Botón: #btnLogin
 * - Mensaje: #mensaje
 */
function bindLoginForm() {
  const userInput = document.getElementById('usuario');
  const passInput = document.getElementById('password');
  const btn       = document.getElementById('btnLogin');
  const msg       = document.getElementById('mensaje');

  if (!userInput || !passInput || !btn) return;

  const setLoading = (loading) => {
    btn.disabled = loading;
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Ingresando...';
    } else {
      btn.textContent = btn.dataset.originalText || 'Entrar';
    }
  };

  const handleLogin = async () => {
    const user = (userInput.value || '').trim();
    const pass = (passInput.value || '').trim();

    if (!user || !pass) {
      if (msg) {
        msg.textContent = 'Ingresa usuario y contraseña';
        msg.style.color = 'red';
      }
      return;
    }

    setLoading(true);
    try {
      await doLogin(user, pass);
      // doLogin redirige si todo sale bien
    } catch {
      // El mensaje ya se maneja en doLogin
    } finally {
      setLoading(false);
    }
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogin();
  });

  [userInput, passInput].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  });
}

/************ Cambio de contraseña admin (perfil en admin.html) ************/
function initChangePasswordForm() {
  const form = document.getElementById('formChangePassword');
  if (!form) return;

  const oldInput  = document.getElementById('oldPassword');
  const newInput  = document.getElementById('newPassword');
  const new2Input = document.getElementById('newPassword2');
  const msg       = document.getElementById('changePassMsg');

  const showMsg = (text, ok = false) => {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = ok ? 'green' : 'red';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const oldPassword  = (oldInput.value || '').trim();
    const newPassword  = (newInput.value || '').trim();
    const newPassword2 = (new2Input.value || '').trim();

    if (!oldPassword || !newPassword || !newPassword2) {
      showMsg('Completa todos los campos.');
      return;
    }

    if (newPassword !== newPassword2) {
      showMsg('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (newPassword.length < 8) {
      showMsg('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      const res = await fetch(BASE + '/users/change-password', {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const code = data.error || data.code || 'change_password_failed';

        if (code === 'wrong_password') {
          showMsg('La contraseña actual no es correcta.');
        } else if (code === 'weak_password') {
          showMsg('La nueva contraseña es muy débil.');
        } else {
          showMsg('No se pudo actualizar la contraseña, intenta más tarde.');
        }
        return;
      }

      showMsg('Contraseña actualizada correctamente ✅', true);
      form.reset();
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      showMsg('Error de conexión al cambiar la contraseña.');
    }
  });
}

/************ Recuperar contraseña – Paso 1 (solicitar enlace) ************/
function initForgotPasswordUI() {
  const form = document.getElementById('formForgotPassword');
  if (!form) return;

  const emailInput = document.getElementById('forgotEmail');
  const msg        = document.getElementById('forgotMsg');

  const setMsg = (t, ok = false) => {
    if (!msg) return;
    msg.textContent = t;
    msg.style.color = ok ? 'green' : 'red';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (emailInput.value || '').trim();
    if (!email) {
      setMsg('Ingresa tu correo.');
      return;
    }

    try {
      const res = await fetch(BASE + '/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));

      // Caso especial: el backend no tiene SMTP configurado (no puede enviar emails)
      if (data && data.ok === false && (data.error === 'smtp_not_configured' || data.code === 'smtp_not_configured')) {
        setMsg('⚠️ El servidor no tiene SMTP configurado. Configura SMTP en Cloud Run para que lleguen los correos.', false);
        if (data.resetUrl) console.log('🔗 Enlace de recuperación (debug):', data.resetUrl);
        return;
      }

      if (!res.ok) {
        const code = data.error || data.code || 'request_failed';
        if (code === 'email_required') {
          setMsg('Debes ingresar un correo.');
        } else {
          setMsg('No se pudo procesar la solicitud, intenta más tarde.');
        }
        return;
      }

      // El backend SIEMPRE responde ok de forma genérica
      setMsg(
        '✅ Si el correo existe, se envió un enlace de recuperación (revisa también SPAM)',
        true
      );
      form.reset();

      // Solo para debug si el backend devuelve resetUrl
      if (data.resetUrl) {
        console.log('🔗 Enlace de recuperación (debug):', data.resetUrl);
      }
    } catch (err) {
      console.error(err);
      setMsg('❌ Error de conexión al solicitar el enlace.');
    }
  });
}

/************ Recuperar contraseña – Paso 2 (poner nueva) ************/
function initResetPasswordUI() {
  const form = document.getElementById('formResetPassword');
  if (!form) return;

  const p1  = document.getElementById('resetPassword1');
  const p2  = document.getElementById('resetPassword2');
  const msg = document.getElementById('resetMsg');
  const btn = form.querySelector('button[type="submit"]');

  const setMsg = (t, ok = false) => {
    if (!msg) return;
    msg.textContent = t;
    msg.style.color = ok ? 'green' : 'red';
  };

  const params = new URLSearchParams(location.search);
  const token  = params.get('token') || '';

  if (!token) {
    setMsg('Enlace inválido o expirado.');
    if (btn) btn.disabled = true;
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMsg('');

    const pass1 = (p1.value || '').trim();
    const pass2 = (p2.value || '').trim();

    if (!pass1 || !pass2) {
      setMsg('Completa ambos campos.');
      return;
    }

    if (pass1 !== pass2) {
      setMsg('Las contraseñas no coinciden.');
      return;
    }

    if (pass1.length < 8) {
      setMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      if (btn) btn.disabled = true;

      const res = await fetch(BASE + '/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pass1 })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const code = data.error || data.code || 'reset_failed';

        if (code === 'invalid_token' || code === 'expired_token') {
          setMsg('El enlace es inválido o ha expirado.');
        } else {
          setMsg('No se pudo actualizar la contraseña, intenta más tarde.');
        }

        if (btn) btn.disabled = false;
        return;
      }

      setMsg('✅ Contraseña actualizada. Ya puedes iniciar sesión.', true);
      form.reset();

      setTimeout(() => {
        location.href = 'login.html';
      }, 2000);
    } catch (err) {
      console.error(err);
      setMsg('❌ Error de conexión al cambiar la contraseña.');
      if (btn) btn.disabled = false;
    }
  });
}