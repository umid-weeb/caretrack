document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('regForm');

  if (loginForm || regForm) {
    getCurrentUser().then(user => {
      if (user?.id) location = '/dashboard.html';
    }).catch(() => {});
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const alertBox = document.getElementById('alertBox');
      const btn = document.getElementById('loginBtn');
      alertBox.innerHTML = '';
      btn.disabled = true;
      btn.innerHTML = '<div class="ct-spinner" style="width:16px;height:16px"></div> Tekshirilmoqda...';
      try {
        const data = await API.login({ username, password });
        if (data.token) setAuthToken(data.token);
        location = '/dashboard.html';
      } catch (err) {
        alertBox.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:14px">⚠️ ${err.message}</div>`;
        btn.disabled = false;
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Kirish';
      }
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', async e => {
      e.preventDefault();
      const full_name = document.getElementById('full_name').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const password2 = document.getElementById('password2').value;
      const phone = document.getElementById('phone').value;
      const alertBox = document.getElementById('alertBox');
      const btn = document.getElementById('regBtn');
      alertBox.innerHTML = '';
      if (password !== password2) {
        alertBox.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:14px">⚠️ Parollar mos kelmadi</div>`;
        return;
      }
      btn.disabled = true;
      btn.innerHTML = '<div class="ct-spinner" style="width:16px;height:16px;display:inline-block"></div> Yuklanmoqda...';
      try {
        const data = await API.register({ full_name, username, password, phone });
        if (data.token) setAuthToken(data.token);
        location = '/dashboard.html';
      } catch (err) {
        alertBox.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:14px">⚠️ ${err.message}</div>`;
        btn.disabled = false;
        btn.innerHTML = '✓ Ro\'yxatdan o\'tish';
      }
    });
  }
});
