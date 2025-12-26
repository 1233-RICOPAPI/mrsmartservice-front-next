/********************
 * MR SmartService - Firebase (Storage) helper
 * - Sube archivos a Firebase Storage y devuelve downloadURL.
 * - Requiere agregar los SDKs "firebase-*-compat.js" en el HTML.
 *
 * IMPORTANTE:
 * 1) Pega tu firebaseConfig real en window.MR_FIREBASE_CONFIG (abajo o en admin.html antes de este script)
 * 2) Reglas recomendadas (seguras):
 *    - read: true (público para mostrar en la web)
 *    - write: request.auth != null (solo usuarios autenticados en Firebase Auth)
 ********************/

(() => {
  // --- 1) Config (REEMPLAZA con tu firebaseConfig real) ---
  window.MR_FIREBASE_CONFIG = window.MR_FIREBASE_CONFIG || {
     apiKey: "AIzaSyCYmFtcY2PBPD52ksvZcH7-ZSnBFGodWfE",
  authDomain: "mrsmartservice-decad.firebaseapp.com",
  projectId: "mrsmartservice-decad",
  storageBucket: "mrsmartservice-decad.firebasestorage.app",
  messagingSenderId: "366944204374",
  appId: "1:366944204374:web:ed196db5aec20dd81f2df7",
  measurementId: "G-FNCRF070QX"
  };

  // --- 2) Init ---
  if (!window.firebase) {
    console.warn("[Firebase] SDK no cargado. Falta agregar firebase-app-compat.js");
    return;
  }

  try {
    // Evita inicializar 2 veces
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(window.MR_FIREBASE_CONFIG);
    }
  } catch (e) {
    console.warn("[Firebase] init error:", e);
  }

  const storage = firebase.storage ? firebase.storage() : null;

  window.MR = window.MR || {};
  window.MR.firebase = window.MR.firebase || {};
  window.MR.firebase.storage = storage;

  // --- 3) Helpers ---
  const safeName = (name) => String(name || "file")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(0, 120);

  async function uploadFileToFirebase(file, folder = "uploads") {
    if (!storage) throw new Error("firebase_storage_not_ready");
    if (!file) throw new Error("no_file");

    const ts = Date.now();
    const path = `${folder}/${ts}_${safeName(file.name)}`;

    const ref = storage.ref().child(path);
    await ref.put(file, { contentType: file.type || undefined });
    const url = await ref.getDownloadURL();
    return url;
  }

  // Exponer global
  window.MR.uploadFileToFirebase = uploadFileToFirebase;

  // 
  // Auth helpers: sesión Firebase (necesaria para poder escribir en Storage si tus reglas lo exigen)
  // Nota: la sesión de Firebase se guarda en el navegador (persistencia LOCAL por defecto).
  window.MR.firebaseIsSignedIn = () => {
    try { return !!(window.firebase && firebase.auth && firebase.auth().currentUser); } catch { return false; }
  };

  window.MR.firebaseCurrentEmail = () => {
    try { return firebase.auth().currentUser?.email || ""; } catch { return ""; }
  };

  window.MR.firebaseSignIn = async (email, password) => {
    if (!window.firebase || !firebase.auth) {
      throw new Error("Firebase Auth no está cargado (revisa los <script> firebase-auth-compat.js y el orden).");
    }
    if (!email || !password) throw new Error("Faltan credenciales para iniciar sesión en Firebase.");

    const auth = firebase.auth();

    // Si ya está logueado con el mismo correo, no hacemos nada.
    const current = auth.currentUser;
    if (current && String(current.email || "").toLowerCase() === String(email).toLowerCase()) return current;

    // Intenta login
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return cred?.user || auth.currentUser || null;
  };

  window.MR.firebaseSignOut = async () => {
    try {
      if (window.firebase && firebase.auth) await firebase.auth().signOut();
    } catch (e) {
      console.warn("[Firebase] signOut falló:", e?.message || e);
    }
  };
})();
