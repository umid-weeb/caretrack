/* ═══════════════════════════════════════════════
   CareTrack – Dashboard (role-aware)
   ═══════════════════════════════════════════════ */

(async () => {
  const user = await renderLayout('/dashboard.html');
  if (!user) return;

  const page = document.getElementById('ct-page');
  const renderers = {
    admin:        renderAdminDash,
    clinician:    renderClinicianDash,
    receptionist: renderReceptionistDash,
    patient:      renderPatientDash,
  };
  await (renderers[user.role] || renderPatientDash)(page, user);
})();

/* ── Admin ──────────────────────────────────────── */
async function renderAdminDash(page, user) {
  try {
    const rpt = await API.getSummary();
    const { totals, severityCounts, patientsByDepartment, aptStats, criticalAndHigh } = rpt;
    const total = totals.diagnoses || 1;

    // Severity bars data
    const sevData = [
      { key: 'Critical', cls: 'critical', label: 'Critical', val: severityCounts.Critical },
      { key: 'High',     cls: 'high',     label: 'High',     val: severityCounts.High },
      { key: 'Medium',   cls: 'medium',   label: 'Medium',   val: severityCounts.Medium },
      { key: 'Low',      cls: 'low',      label: 'Low',      val: severityCounts.Low },
    ];

    const deptEntries = Object.entries(patientsByDepartment).sort((a,b)=>b[1]-a[1]);
    const maxDept = Math.max(...deptEntries.map(e=>e[1]), 1);

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Boshqaruv paneli</h1>
          <p class="ct-page-subtitle">Klinika umumiy holati – ${new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
        <div style="display:flex;gap:8px">
          <a href="/patients.html" class="ct-btn ct-btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Bemor qo'shish
          </a>
          <a href="/doctors.html" class="ct-btn ct-btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Shifokor qo'shish
          </a>
        </div>
      </div>

      <!-- Stat cards -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
        <div class="ct-stat">
          <div class="ct-stat-icon blue">${ICONS.doctors.replace('<svg ',`<svg style="width:22px;height:22px" `)}</div>
          <div><div class="ct-stat-val">${totals.doctors}</div><div class="ct-stat-label">Shifokorlar</div></div>
        </div>
        <div class="ct-stat">
          <div class="ct-stat-icon green">${ICONS.patients.replace('<svg ',`<svg style="width:22px;height:22px" `)}</div>
          <div><div class="ct-stat-val">${totals.patients}</div><div class="ct-stat-label">Bemorlar</div></div>
        </div>
        <div class="ct-stat">
          <div class="ct-stat-icon purple">${ICONS.diagnoses.replace('<svg ',`<svg style="width:22px;height:22px;color:#fff" `)}</div>
          <div><div class="ct-stat-val">${totals.diagnoses}</div><div class="ct-stat-label">Tashxislar</div></div>
        </div>
        <div class="ct-stat">
          <div class="ct-stat-icon red">${ICONS.alertTriangle.replace('<svg ',`<svg style="width:22px;height:22px" `)}</div>
          <div><div class="ct-stat-val">${totals.critical}</div><div class="ct-stat-label">Kritik holatlar</div></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
        <!-- Severity chart -->
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">${ICONS.barChart.replace('<svg ',`<svg style="width:15px;height:15px" `)} Tashxis og'irligi taqsimoti</h3></div>
          <div class="ct-card-body">
            <div class="ct-bar-chart">
              ${sevData.map(s => `
                <div class="ct-bar-row">
                  <div class="ct-bar-label">
                    <span class="ct-badge ct-badge-${s.cls.toLowerCase()}">${s.label}</span>
                  </div>
                  <div class="ct-bar-track"><div class="ct-bar-fill ct-bar-${s.cls}" style="width:${Math.round(s.val/total*100)}%"></div></div>
                  <div class="ct-bar-val">${s.val}</div>
                </div>`).join('')}
            </div>
            <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--ct-gray-100);display:flex;justify-content:space-between;font-size:12px;color:var(--ct-gray-500)">
              <span>Jami tashxislar</span>
              <span class="fw-bold" style="color:var(--ct-gray-800)">${totals.diagnoses}</span>
            </div>
          </div>
        </div>

        <!-- Appointments donut replacement -->
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">${ICONS.calendar.replace('<svg ',`<svg style="width:15px;height:15px" `)} Qabullar statistikasi</h3></div>
          <div class="ct-card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
              <div style="text-align:center;padding:16px;background:var(--ct-gray-50);border-radius:8px">
                <div style="font-size:28px;font-weight:700;color:var(--ct-primary)">${aptStats.today}</div>
                <div style="font-size:12px;color:var(--ct-gray-500)">Bugungi qabullar</div>
              </div>
              <div style="text-align:center;padding:16px;background:var(--ct-gray-50);border-radius:8px">
                <div style="font-size:28px;font-weight:700;color:var(--ct-gray-800)">${aptStats.total}</div>
                <div style="font-size:12px;color:var(--ct-gray-500)">Jami qabullar</div>
              </div>
            </div>
            <div class="ct-bar-chart">
              <div class="ct-bar-row">
                <div style="min-width:110px;font-size:12px;color:var(--ct-gray-600)">Kutilmoqda</div>
                <div class="ct-bar-track"><div class="ct-bar-fill" style="background:var(--ct-primary);width:${aptStats.total ? Math.round(aptStats.booked/aptStats.total*100) : 0}%"></div></div>
                <div class="ct-bar-val">${aptStats.booked}</div>
              </div>
              <div class="ct-bar-row">
                <div style="min-width:110px;font-size:12px;color:var(--ct-gray-600)">Yakunlangan</div>
                <div class="ct-bar-track"><div class="ct-bar-fill" style="background:var(--ct-success);width:${aptStats.total ? Math.round(aptStats.completed/aptStats.total*100) : 0}%"></div></div>
                <div class="ct-bar-val">${aptStats.completed}</div>
              </div>
              <div class="ct-bar-row">
                <div style="min-width:110px;font-size:12px;color:var(--ct-gray-600)">Bekor qilingan</div>
                <div class="ct-bar-track"><div class="ct-bar-fill" style="background:var(--ct-danger);width:${aptStats.total ? Math.round(aptStats.cancelled/aptStats.total*100) : 0}%"></div></div>
                <div class="ct-bar-val">${aptStats.cancelled}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <!-- Department chart -->
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">${ICONS.hospital.replace('<svg ',`<svg style="width:15px;height:15px" `)} Bo'lim bo'yicha bemorlar</h3></div>
          <div class="ct-card-body">
            <div class="ct-bar-chart">
              ${deptEntries.map(([dept, cnt]) => `
                <div class="ct-bar-row">
                  <div style="font-size:12px;color:var(--ct-gray-600);min-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${dept}</div>
                  <div class="ct-bar-track"><div class="ct-bar-fill ct-bar-accent" style="width:${Math.round(cnt/maxDept*100)}%"></div></div>
                  <div class="ct-bar-val">${cnt}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Critical diagnoses -->
        <div class="ct-card">
          <div class="ct-card-header">
            <h3 class="ct-card-title">${ICONS.alertTriangle.replace('<svg ',`<svg style="width:15px;height:15px" `)} Kritik va yuqori darajali tashxislar</h3>
            <a href="/diagnoses.html" class="ct-btn ct-btn-ghost ct-btn-sm">Barchasini ko'rish</a>
          </div>
          <div class="ct-card-body-flush">
            <table class="ct-table">
              <tbody>
                ${criticalAndHigh.slice(0,6).map(d => `
                  <tr>
                    <td style="width:90px"><span class="ct-badge ct-badge-${d.severity?.toLowerCase()}">${d.severity}</span></td>
                    <td style="font-size:13px;color:var(--ct-gray-800)">${d.title}</td>
                    <td style="font-size:12px;color:var(--ct-gray-400);text-align:right">${d.diagnosis_date}</td>
                  </tr>`).join('')}
                ${criticalAndHigh.length === 0 ? `<tr><td colspan="3" class="ct-empty"><div class="ct-empty-text">Hozircha bunday holatlar yo'q</div></td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    // Responsive stat grid
    document.querySelector('[style*="grid-template-columns:repeat(4"]').style.cssText =
      window.innerWidth < 768
        ? 'display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px'
        : 'display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px';

    ['[style*="grid-template-columns:1fr 1fr"]'].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (window.innerWidth < 900) el.style.gridTemplateColumns = '1fr';
      });
    });

  } catch(e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error">${ICONS.xCircle.replace("<svg ",`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

/* ── Clinician ──────────────────────────────────── */
async function renderClinicianDash(page, user) {
  try {
    const { queue, doctor } = await API.getQueue();
    const today = new Date().toLocaleDateString('uz-UZ', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Bugungi navbat</h1>
          <p class="ct-page-subtitle">${doctor?.full_name || user.full_name} – ${today}</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="ct-stat" style="padding:12px 16px">
            <div class="ct-stat-icon blue" style="width:36px;height:36px">${ICONS.clipboardList.replace('<svg ',`<svg style="width:18px;height:18px" `)}</div>
            <div><div class="ct-stat-val" style="font-size:20px">${queue.length}</div><div class="ct-stat-label">Jami navbat</div></div>
          </div>
          <div class="ct-stat" style="padding:12px 16px">
            <div class="ct-stat-icon green" style="width:36px;height:36px">${ICONS.checkCircle.replace('<svg ',`<svg style="width:18px;height:18px" `)}</div>
            <div><div class="ct-stat-val" style="font-size:20px">${queue.filter(q=>q.status==='completed').length}</div><div class="ct-stat-label">Yakunlangan</div></div>
          </div>
        </div>
      </div>

      <div class="ct-card">
        <div class="ct-card-header"><h3 class="ct-card-title">${ICONS.appointments.replace('<svg ',`<svg style="width:15px;height:15px" `)} Navbat ro'yxati</h3></div>
        <div class="ct-card-body-flush">
          <table class="ct-table">
            <thead><tr>
              <th>Vaqt</th><th>Bemor ismi</th><th>Status</th><th>So'nggi tashxis</th><th>Amallar</th>
            </tr></thead>
            <tbody>
              ${queue.length === 0 ? `
                <tr><td colspan="5">
                  <div class="ct-empty"><div class="ct-empty-icon">🗓️</div><div class="ct-empty-text">Bugun navbatda hech kim yo'q</div></div>
                </td></tr>` :
              queue.map(a => {
                const lastDx = a.patient?.diagnoses?.[0];
                return `<tr>
                  <td><span style="font-weight:600;color:var(--ct-primary)">${a.time}</span></td>
                  <td>
                    <div class="ct-cell-name">
                      <div class="ct-cell-avatar">${initials2(a.patient_name)}</div>
                      <div>
                        <div style="font-weight:500">${a.patient_name}</div>
                        ${a.patient ? `<div style="font-size:11px;color:var(--ct-gray-400)">${calcAge(a.patient.date_of_birth)} yosh · ${a.patient.gender}</div>` : ''}
                      </div>
                    </div>
                  </td>
                  <td><span class="ct-badge ct-badge-${a.status}">${statusLabel(a.status)}</span></td>
                  <td>${lastDx ? `<span class="ct-badge ct-badge-${lastDx.severity?.toLowerCase()}">${lastDx.severity}</span> <span style="font-size:12px;color:var(--ct-gray-600)">${lastDx.title}</span>` : '<span style="color:var(--ct-gray-300)">—</span>'}</td>
                  <td>
                    ${a.patient ? `<a href="/patients.html?profile=${a.patient.id}" class="ct-btn ct-btn-outline ct-btn-sm">Profil</a>` : ''}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch(e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error">${ICONS.xCircle.replace("<svg ",`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

/* ── Receptionist ───────────────────────────────── */
async function renderReceptionistDash(page, user) {
  try {
    const apts = await API.getAppointments();
    const today = new Date().toISOString().slice(0,10);
    const todayApts = apts.filter(a => a.date === today);
    const booked = todayApts.filter(a=>a.status==='booked').length;
    const done   = todayApts.filter(a=>a.status==='completed').length;

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Qabulxona paneli</h1>
          <p class="ct-page-subtitle">${new Date().toLocaleDateString('uz-UZ', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</p>
        </div>
        <a href="/appointments.html" class="ct-btn ct-btn-primary">+ Qabul yozish</a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
        <div class="ct-stat"><div class="ct-stat-icon blue">${ICONS.calendar.replace('<svg ',`<svg style="width:22px;height:22px" `)}</div><div><div class="ct-stat-val">${todayApts.length}</div><div class="ct-stat-label">Bugungi qabullar</div></div></div>
        <div class="ct-stat"><div class="ct-stat-icon green">${ICONS.checkCircle.replace('<svg ',`<svg style="width:22px;height:22px" `)}</div><div><div class="ct-stat-val">${done}</div><div class="ct-stat-label">Yakunlangan</div></div></div>
        <div class="ct-stat"><div class="ct-stat-icon amber">${ICONS.clock.replace('<svg ',`<svg style="width:22px;height:22px" `)}</div><div><div class="ct-stat-val">${booked}</div><div class="ct-stat-label">Kutilmoqda</div></div></div>
      </div>

      <div class="ct-card">
        <div class="ct-card-header">
          <h3 class="ct-card-title">Bugungi qabullar ro'yxati</h3>
          <a href="/appointments.html" class="ct-btn ct-btn-ghost ct-btn-sm">Barchasini ko'rish</a>
        </div>
        <div class="ct-card-body-flush">
          <table class="ct-table">
            <thead><tr><th>Vaqt</th><th>Bemor</th><th>Shifokor</th><th>Status</th></tr></thead>
            <tbody>
              ${todayApts.sort((a,b)=>a.time.localeCompare(b.time)).map(a => `
                <tr>
                  <td><b>${a.time}</b></td>
                  <td>${a.patient_name}</td>
                  <td>${a.doctor?.full_name || '—'}</td>
                  <td><span class="ct-badge ct-badge-${a.status}">${statusLabel(a.status)}</span></td>
                </tr>`).join('')}
              ${todayApts.length===0 ? `<tr><td colspan="4"><div class="ct-empty"><div class="ct-empty-icon">${ICONS.calendar.replace("<svg ",`<svg style="width:15px;height:15px" `)}</div><div class="ct-empty-text">Bugun hech qanday qabul yo'q</div></div></td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch(e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error">${ICONS.xCircle.replace("<svg ",`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

/* ── Patient ────────────────────────────────────── */
async function renderPatientDash(page, user) {
  try {
    const apts = await API.getAppointments();
    const upcoming = apts.filter(a => a.status === 'booked').sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Salom, ${user.full_name.split(' ')[0]}!</h1>
          <p class="ct-page-subtitle">Sizning shaxsiy CareTrack panelingizga xush kelibsiz</p>
        </div>
        <a href="/appointments.html" class="ct-btn ct-btn-primary">+ Qabul yozish</a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
        <div class="ct-stat"><div class="ct-stat-icon blue">${ICONS.calendar.replace('<svg ',`<svg style="width:22px;height:22px" `)}</div><div><div class="ct-stat-val">${apts.length}</div><div class="ct-stat-label">Jami qabullar</div></div></div>
        <div class="ct-stat"><div class="ct-stat-icon green">${ICONS.clock.replace('<svg ',`<svg style="width:22px;height:22px" `)}</div><div><div class="ct-stat-val">${upcoming.length}</div><div class="ct-stat-label">Rejalashtirilgan</div></div></div>
        <div class="ct-stat"><div class="ct-stat-icon purple">${ICONS.checkCircle.replace('<svg ',`<svg style="width:22px;height:22px;color:#fff" `)}</div><div><div class="ct-stat-val">${apts.filter(a=>a.status==='completed').length}</div><div class="ct-stat-label">Yakunlangan</div></div></div>
      </div>

      <div class="ct-card">
        <div class="ct-card-header">
          <h3 class="ct-card-title">${ICONS.calendar.replace("<svg ",`<svg style="width:15px;height:15px" `)} Rejalashtirilgan qabullar</h3>
          <a href="/appointments.html" class="ct-btn ct-btn-ghost ct-btn-sm">Hammasini ko'rish</a>
        </div>
        <div class="ct-card-body-flush">
          <table class="ct-table">
            <thead><tr><th>Sana</th><th>Vaqt</th><th>Shifokor</th><th>Status</th></tr></thead>
            <tbody>
              ${upcoming.slice(0,5).map(a => `
                <tr>
                  <td>${a.date}</td>
                  <td><b>${a.time}</b></td>
                  <td>${a.doctor?.full_name || '—'}<br/><span style="font-size:11px;color:var(--ct-gray-400)">${a.doctor?.specialty||''}</span></td>
                  <td><span class="ct-badge ct-badge-${a.status}">${statusLabel(a.status)}</span></td>
                </tr>`).join('')}
              ${upcoming.length===0 ? `<tr><td colspan="4"><div class="ct-empty"><div class="ct-empty-icon">${ICONS.calendar.replace("<svg ",`<svg style="width:15px;height:15px" `)}</div><div class="ct-empty-text">Rejalashtirilgan qabullar yo'q. <a href="/appointments.html">Hozir yoziling!</a></div></div></td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch(e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error">${ICONS.xCircle.replace("<svg ",`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

/* ── Utility ────────────────────────────────────── */
function calcAge(dob) {
  if (!dob) return '—';
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25*24*3600*1000));
}

function initials2(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
}

function statusLabel(s) {
  return { booked: 'Kutilmoqda', completed: 'Yakunlangan', cancelled: 'Bekor qilindi' }[s] || s;
}
