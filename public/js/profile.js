/* ═══════════════════════════════════════════════
   CareTrack – Profile page (all roles)
   ═══════════════════════════════════════════════ */

let currentUser = null;

(async () => {
  currentUser = await renderLayout('/profile.html');
  if (!currentUser) return;
  initDrawer('pwdDrawer');
  await renderProfile();
})();

async function renderProfile() {
  const page = document.getElementById('ct-page');
  const u    = currentUser;

  const roleBadgeClass = {
    admin: 'ct-badge-admin', clinician: 'ct-badge-clinician',
    receptionist: 'ct-badge-receptionist', patient: 'ct-badge-patient',
  }[u.role] || '';

  const roleLabel = {
    admin: 'Administrator', clinician: 'Klinitsist',
    receptionist: 'Qabulxona xodimi', patient: 'Bemor',
  }[u.role] || u.role;

  const ini = (u.full_name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // Clinician uchun doctor ma'lumotlarini olish
  let doctorInfo = null;
  if (u.role === 'clinician' && u.doctor_id) {
    try { doctorInfo = await API.getDoctor(u.doctor_id); } catch {}
  }

  // Patient uchun tashxislar statistikasi
  let diagStats = null;
  let aptStats  = null;
  if (u.role === 'patient') {
    try {
      const { diagnoses } = await API.getMyDiagnoses();
      const sevC = { Low: 0, Medium: 0, High: 0, Critical: 0 };
      diagnoses.forEach(d => { if (sevC[d.severity] !== undefined) sevC[d.severity]++; });
      diagStats = { total: diagnoses.length, sevC };
    } catch {}
    try {
      const apts = await API.getAppointments();
      aptStats = {
        total:     apts.length,
        upcoming:  apts.filter(a => a.status === 'booked').length,
        completed: apts.filter(a => a.status === 'completed').length,
      };
    } catch {}
  }

  page.innerHTML = `
    <div class="ct-page-header">
      <div>
        <h1 class="ct-page-title">Mening profilim</h1>
        <p class="ct-page-subtitle">Hisob ma'lumotlari va sozlamalar</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:320px 1fr;gap:20px;align-items:start">

      <!-- Left: avatar + role card -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="ct-card">
          <div class="ct-card-body" style="text-align:center">
            <div style="width:80px;height:80px;border-radius:50%;background:var(--ct-primary-light);color:var(--ct-primary);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;margin:0 auto 14px;border:3px solid var(--ct-primary-light)">${ini}</div>
            <div style="font-size:18px;font-weight:700;color:var(--ct-gray-900);margin-bottom:4px">${u.full_name}</div>
            <div style="font-size:13px;color:var(--ct-gray-500);margin-bottom:12px">@${u.username}</div>
            <span class="ct-badge ${roleBadgeClass}" style="font-size:12px;padding:4px 12px">${roleLabel}</span>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">⚙️ Amallar</h3></div>
          <div class="ct-card-body" style="display:flex;flex-direction:column;gap:8px">
            <button class="ct-btn ct-btn-outline" style="justify-content:flex-start" onclick="openDrawer('pwdDrawer')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Parolni o'zgartirish
            </button>
            <button class="ct-btn ct-btn-danger" style="justify-content:flex-start" onclick="logout()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Tizimdan chiqish
            </button>
          </div>
        </div>
      </div>

      <!-- Right: details -->
      <div style="display:flex;flex-direction:column;gap:16px">

        <!-- Account info -->
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">👤 Hisob ma'lumotlari</h3></div>
          <div class="ct-card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              ${infoRow('To\'liq ism', u.full_name)}
              ${infoRow('Foydalanuvchi nomi', '@' + u.username)}
              ${infoRow('Rol', roleLabel)}
              ${infoRow('Hisob ID', '#' + u.id)}
            </div>
          </div>
        </div>

        <!-- Role-specific info -->
        ${doctorInfo ? `
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">🩺 Shifokor ma'lumotlari</h3></div>
          <div class="ct-card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              ${infoRow('To\'liq ism', doctorInfo.full_name)}
              ${infoRow('Mutaxassislik', doctorInfo.specialty)}
              ${infoRow('Bo\'lim', doctorInfo.department)}
              ${infoRow('Telefon', doctorInfo.phone)}
              ${infoRow('Email', doctorInfo.email)}
              ${infoRow('Holat', `<span class="ct-badge ct-badge-${doctorInfo.available_status?.toLowerCase().replace('-','-')}">${doctorInfo.available_status}</span>`)}
              ${doctorInfo.emergency_contact ? infoRow('Favqulodda aloqa', doctorInfo.emergency_contact) : ''}
            </div>
          </div>
        </div>` : ''}

        ${diagStats ? `
        <div class="ct-card">
          <div class="ct-card-header">
            <h3 class="ct-card-title">📊 Mening statistikam</h3>
            <a href="/my-diagnoses.html" class="ct-btn ct-btn-ghost ct-btn-sm">Tashxislarni ko'rish</a>
          </div>
          <div class="ct-card-body">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
              <div style="text-align:center;padding:14px;background:var(--ct-gray-50);border-radius:8px">
                <div style="font-size:22px;font-weight:700;color:var(--ct-gray-900)">${diagStats.total}</div>
                <div style="font-size:12px;color:var(--ct-gray-500)">Jami tashxislar</div>
              </div>
              <div style="text-align:center;padding:14px;background:var(--ct-gray-50);border-radius:8px">
                <div style="font-size:22px;font-weight:700;color:var(--ct-primary)">${aptStats?.upcoming || 0}</div>
                <div style="font-size:12px;color:var(--ct-gray-500)">Kelgusi qabullar</div>
              </div>
              <div style="text-align:center;padding:14px;background:var(--ct-gray-50);border-radius:8px">
                <div style="font-size:22px;font-weight:700;color:var(--ct-success)">${aptStats?.completed || 0}</div>
                <div style="font-size:12px;color:var(--ct-gray-500)">Yakunlangan qabullar</div>
              </div>
            </div>
            ${diagStats.sevC.Critical > 0 || diagStats.sevC.High > 0 ? `
            <div class="ct-alert ct-alert-warning" style="margin-top:12px">
              ⚠️ Sizda ${diagStats.sevC.Critical} ta kritik va ${diagStats.sevC.High} ta yuqori darajali tashxis mavjud. Shifokor bilan maslahatlashing.
            </div>` : ''}
          </div>
        </div>` : ''}

        <!-- Security info -->
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">🔒 Xavfsizlik</h3></div>
          <div class="ct-card-body" style="font-size:13.5px;color:var(--ct-gray-600)">
            <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--ct-gray-100)">
              <span style="color:var(--ct-success)">✅</span>
              <div>Parol bcrypt bilan himoyalangan</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--ct-gray-100)">
              <span style="color:var(--ct-success)">✅</span>
              <div>JWT token localStorage-da saqlanadi va so'rovlar Authorization sarlavhasi orqali yuboriladi</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:10px 0">
              <span style="color:var(--ct-success)">✅</span>
              <div>Sessiya 8 soatdan so'ng avtomatik tugaydi</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function infoRow(label, value) {
  return `
    <div>
      <div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--ct-gray-400);margin-bottom:4px">${label}</div>
      <div style="font-size:14px;color:var(--ct-gray-800)">${value || '—'}</div>
    </div>`;
}

async function changePassword() {
  const current  = document.getElementById('currentPwd').value;
  const newPwd   = document.getElementById('newPwd').value;
  const confirm  = document.getElementById('confirmPwd').value;
  const alertEl  = document.getElementById('pwdAlert');
  alertEl.innerHTML = '';

  if (!current || !newPwd || !confirm) {
    alertEl.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:12px">⚠️ Barcha maydonlarni to'ldiring</div>`;
    return;
  }
  if (newPwd.length < 6) {
    alertEl.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:12px">⚠️ Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak</div>`;
    return;
  }
  if (newPwd !== confirm) {
    alertEl.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:12px">⚠️ Yangi parollar mos kelmadi</div>`;
    return;
  }

  const btn = document.getElementById('savePwdBtn');
  btn.disabled = true;
  try {
    await API.put('/api/auth/change-password', { currentPassword: current, newPassword: newPwd });
    toast('Parol muvaffaqiyatli o\'zgartirildi', 'success');
    closeDrawer('pwdDrawer');
    document.getElementById('currentPwd').value = '';
    document.getElementById('newPwd').value = '';
    document.getElementById('confirmPwd').value = '';
  } catch (e) {
    alertEl.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:12px">⚠️ ${e.message}</div>`;
  } finally {
    btn.disabled = false;
  }
}
