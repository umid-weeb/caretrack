/* ═══════════════════════════════════════════════
   CareTrack – Appointments page
   ═══════════════════════════════════════════════ */

let currentUser = null;
let allDoctors  = [];
let allPatients = [];
let selectedTime = null;

(async () => {
  currentUser = await renderLayout('/appointments.html');
  if (!currentUser) return;
  initDrawer('aptDrawer');

  allDoctors = await API.getDoctors();
  const docSel = document.getElementById('aptDoctor');
  allDoctors.forEach(d => docSel.insertAdjacentHTML('beforeend',
    `<option value="${d.id}">${d.full_name} – ${d.specialty} ${d.available_status!=='Available'?'('+d.available_status+')':''}</option>`));

  // Role-based: patient sees own name, admin/receptionist selects patient
  if (['admin','receptionist'].includes(currentUser.role)) {
    allPatients = await API.getPatients();
    document.getElementById('aptPatNameRow').style.display = 'none';
    document.getElementById('aptPatSelectRow').style.display = '';
    const sel = document.getElementById('aptPatient');
    allPatients.forEach(p => sel.insertAdjacentHTML('beforeend',
      `<option value="${p.id}">${p.full_name}</option>`));
  } else {
    document.getElementById('aptPatName').value = currentUser.full_name;
  }

  // Default: today + allow future
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('aptDate').value = today;
  document.getElementById('aptDate').min   = today;

  document.getElementById('saveAptBtn').addEventListener('click', saveApt);
  await loadApts();
})();

async function loadSlots() {
  const docId = document.getElementById('aptDoctor').value;
  const date  = document.getElementById('aptDate').value;
  const cont  = document.getElementById('slotsContainer');
  selectedTime = null;
  document.getElementById('aptTime').value = '';

  if (!docId || !date) {
    cont.innerHTML = `<div style="font-size:13px;color:var(--ct-gray-400)">Avval shifokor va sanani tanlang</div>`;
    return;
  }
  cont.innerHTML = `<div class="ct-loading-overlay" style="padding:16px"><div class="ct-spinner"></div></div>`;
  try {
    const { isWorkday, slots, bookedSlots, allSlots } = await API.getDoctorSlots(docId, date);
    if (!isWorkday) {
      cont.innerHTML = `<div class="ct-alert ct-alert-warning" style="display:flex;align-items:center;gap:8px">${ICONS.alertTriangle.replace('<svg ',`<svg style="width:15px;height:15px;flex-shrink:0" `)} Yakshanba kuni qabul qabul qilinmaydi</div>`;
      return;
    }
    if (allSlots.length === 0) {
      cont.innerHTML = `<div class="ct-alert ct-alert-warning">Bu kun uchun jadval mavjud emas</div>`;
      return;
    }

    // Group slots by time of day
    const groups = { 'Ertalab (08:00–12:00)':[], 'Tushdan keyin (13:00–17:00)':[], 'Kechqurun (17:00–20:00)':[] };
    allSlots.forEach(s => {
      const h = parseInt(s.split(':')[0]);
      if (h < 12)      groups['Ertalab (08:00–12:00)'].push(s);
      else if (h < 17) groups['Tushdan keyin (13:00–17:00)'].push(s);
      else             groups['Kechqurun (17:00–20:00)'].push(s);
    });

    let html = '';
    for (const [label, list] of Object.entries(groups)) {
      if (list.length === 0) continue;
      html += `<div style="font-size:11.5px;font-weight:600;color:var(--ct-gray-500);text-transform:uppercase;letter-spacing:.05em;margin:12px 0 6px">${label}</div>`;
      html += `<div class="ct-slots-grid" style="grid-template-columns:repeat(5,1fr)">`;
      html += list.map(s => {
        const isBooked = bookedSlots.includes(s);
        const isAvail  = slots.includes(s);
        return `<div class="ct-slot ${isBooked?'booked':''}"
          data-time="${s}" onclick="${isAvail?`selectSlot('${s}',this)`:''}"
          title="${isBooked?'Band qilingan':'Bo\'sh'}">
          ${s}
          ${isBooked ? '<div style="font-size:9px;margin-top:1px">Band</div>' : ''}
        </div>`;
      }).join('');
      html += `</div>`;
    }

    if (slots.length === 0) html += `<div class="ct-alert ct-alert-warning" style="margin-top:8px">Bu kun barcha vaqtlar band</div>`;

    cont.innerHTML = html;
  } catch(e) {
    cont.innerHTML = `<div class="ct-alert ct-alert-error" style="display:flex;align-items:center;gap:8px">${ICONS.xCircle.replace('<svg ',`<svg style="width:15px;height:15px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

function selectSlot(time, el) {
  document.querySelectorAll('.ct-slot.selected').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedTime = time;
  document.getElementById('aptTime').value = time;
}

async function loadApts() {
  const page = document.getElementById('ct-page');
  try {
    const apts = await API.getAppointments();
    const canCreate = ['admin','receptionist','patient'].includes(currentUser.role);
    const canStatus = ['admin','receptionist','clinician'].includes(currentUser.role);

    // Group by date
    const byDate = {};
    apts.forEach(a => { (byDate[a.date] = byDate[a.date]||[]).push(a); });
    const dates = Object.keys(byDate).sort().reverse();

    const today = new Date().toISOString().slice(0,10);

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Qabullar</h1>
          <p class="ct-page-subtitle">${apts.length} ta umumiy qabul</p>
        </div>
        ${canCreate ? `<button class="ct-btn ct-btn-primary" onclick="openNewApt()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Qabul yozish
        </button>` : ''}
      </div>

      ${dates.length === 0 ? `
        <div class="ct-card"><div class="ct-card-body"><div class="ct-empty"><div class="ct-empty-icon" style="display:flex;justify-content:center;opacity:.4">${ICONS.appointments.replace('<svg ',`<svg style="width:40px;height:40px" `)}</div><div class="ct-empty-text" style="margin-top:12px">Hali hech qanday qabul yo'q</div></div></div></div>` :
      dates.map(date => {
        const list = byDate[date].sort((a,b)=>a.time.localeCompare(b.time));
        const isToday = date === today;
        return `
          <div class="ct-card" style="margin-bottom:16px">
            <div class="ct-card-header">
              <h3 class="ct-card-title">
                ${isToday ? `${ICONS.calendar.replace('<svg ',`<svg style="width:15px;height:15px" `)} Bugun – ` : ''}${formatDate(date)}
                <span style="font-size:12px;color:var(--ct-gray-400);font-weight:400">${list.length} ta qabul</span>
              </h3>
              ${isToday ? '<span class="ct-badge ct-badge-booked">Bugun</span>' : ''}
            </div>
            <div class="ct-card-body-flush">
              <table class="ct-table">
                <thead><tr><th>Vaqt</th><th>Bemor</th><th>Shifokor</th><th>Status</th><th>Amallar</th></tr></thead>
                <tbody>
                  ${list.map(a => `
                    <tr>
                      <td><span style="font-weight:700;color:var(--ct-primary);font-size:14px">${a.time}</span></td>
                      <td>
                        <div style="font-weight:500">${a.patient_name}</div>
                        ${a.notes ? `<div style="font-size:11px;color:var(--ct-gray-400)">${a.notes}</div>` : ''}
                      </td>
                      <td>
                        <div style="font-size:13px">${a.doctor?.full_name||'—'}</div>
                        <div style="font-size:11px;color:var(--ct-gray-400)">${a.doctor?.specialty||''}</div>
                      </td>
                      <td>
                        ${canStatus
                          ? `<select class="ct-select" style="font-size:12px;padding:5px 8px;width:140px" onchange="changeStatus(${a.id}, this.value)">
                              <option value="booked" ${a.status==='booked'?'selected':''}>Kutilmoqda</option>
                              <option value="completed" ${a.status==='completed'?'selected':''}>Yakunlangan</option>
                              <option value="cancelled" ${a.status==='cancelled'?'selected':''}>Bekor qilingan</option>
                            </select>`
                          : `<span class="ct-badge ct-badge-${a.status}">${statusLbl(a.status)}</span>`}
                      </td>
                      <td>
                        <div class="ct-row-actions">
                          ${(currentUser.role==='patient'||currentUser.role==='admin') && a.status==='booked'
                            ? `<button class="ct-btn ct-btn-danger ct-btn-sm" onclick="cancelApt(${a.id})">Bekor</button>`
                            : ''}
                        </div>
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
      }).join('')}`;
  } catch(e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error" style="display:flex;align-items:center;gap:8px">${ICONS.xCircle.replace('<svg ',`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

function openNewApt() {
  document.getElementById('aptDrawerAlert').innerHTML = '';
  document.getElementById('aptDoctor').value = '';
  document.getElementById('aptDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('aptNotes').value = '';
  document.getElementById('aptTime').value = '';
  selectedTime = null;
  document.getElementById('slotsContainer').innerHTML = `<div style="font-size:13px;color:var(--ct-gray-400)">Avval shifokor va sanani tanlang</div>`;
  if (['admin','receptionist'].includes(currentUser.role)) {
    document.getElementById('aptPatient').value = '';
  }
  openDrawer('aptDrawer');
}

async function saveApt() {
  const data = {
    doctor_id: document.getElementById('aptDoctor').value,
    date:      document.getElementById('aptDate').value,
    time:      selectedTime || document.getElementById('aptTime').value,
    notes:     document.getElementById('aptNotes').value.trim(),
  };
  if (['admin','receptionist'].includes(currentUser.role)) {
    const sel = document.getElementById('aptPatient');
    if (sel.value) {
      data.patient_id   = sel.value;
      data.patient_name = sel.options[sel.selectedIndex]?.text;
    }
  }
  const alertEl = document.getElementById('aptDrawerAlert');
  alertEl.innerHTML = '';
  const btn = document.getElementById('saveAptBtn');
  btn.disabled = true;
  try {
    await API.createAppointment(data);
    toast('Qabul muvaffaqiyatli yozildi!', 'success');
    closeDrawer('aptDrawer');
    await loadApts();
  } catch(e) {
    alertEl.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:12px;display:flex;align-items:center;gap:8px">${ICONS.alertTriangle.replace('<svg ',`<svg style="width:15px;height:15px;flex-shrink:0" `)} ${e.message}</div>`;
  } finally { btn.disabled = false; }
}

async function changeStatus(id, status) {
  try {
    await API.updateAptStatus(id, status);
    toast('Status yangilandi', 'success');
  } catch(e) {
    toast(e.message, 'error');
    await loadApts();
  }
}

async function cancelApt(id) {
  if (!confirm('Ushbu qabulni bekor qilasizmi?')) return;
  try {
    await API.cancelApt(id);
    toast('Qabul bekor qilindi', 'warning');
    await loadApts();
  } catch(e) { toast(e.message, 'error'); }
}

// Utils
function formatDate(d) {
  return new Date(d+'T00:00:00').toLocaleDateString('uz-UZ',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}
function statusLbl(s) {
  return {booked:'Kutilmoqda',completed:'Yakunlangan',cancelled:'Bekor qilingan'}[s]||s;
}
