/* ─── Auth helpers ─────────────────────────────────────────
   layout.js dan keyin yuklanmaydi — bu faqat asosiy holat.
   Toast, renderLayout, ICONS → layout.js da aniqlanadi.
   ────────────────────────────────────────────────────────── */

let _currentUser = null;

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(Array.from(atob(base64)).map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function isAuthTokenExpired(token) {
  const payload = parseJwt(token);
  return !!payload?.exp && Date.now() / 1000 >= payload.exp;
}

function getAuthToken() {
  const token = localStorage.getItem('ct-token');
  if (!token) return null;
  if (isAuthTokenExpired(token)) {
    clearAuthToken();
    return null;
  }
  return token;
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem('ct-token', token);
  } else {
    localStorage.removeItem('ct-token');
  }
}

function clearAuthToken() {
  localStorage.removeItem('ct-token');
}

async function getCurrentUser() {
  if (_currentUser) return _currentUser;
  const token = getAuthToken();
  if (!token) return null;
  try {
    _currentUser = await API.me();
    return _currentUser;
  } catch {
    clearAuthToken();
    return null;
  }
}

async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) { window.location = '/login.html'; return null; }
  return user;
}

async function logout() {
  try { await API.logout(); } catch {}
  clearAuthToken();
  _currentUser = null;
  window.location = '/login.html';
}

function applyRoleVisibility(user) {
  document.querySelectorAll('[data-roles]').forEach(el => {
    const roles = el.dataset.roles.split(',').map(r => r.trim());
    el.style.display = roles.includes(user.role) ? '' : 'none';
  });
}

// Stub — overridden by layout.js toast() when that file is loaded.
// Standalone pages (login/register) that don't load layout.js use this fallback.
function toast(msg, type = 'default') {
  let wrap = document.getElementById('ct-toasts');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'ct-toasts';
    wrap.className = 'ct-toast-wrap';
    document.body.appendChild(wrap);
  }
  const icons = { default:'ℹ️', success:'✅', error:'❌', warning:'⚠️' };
  const el = document.createElement('div');
  el.className = `ct-toast ${type !== 'default' ? `ct-toast-${type}` : ''}`;
  el.innerHTML = `<span class="ct-toast-icon">${icons[type]||icons.default}</span>${msg}`;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
}
