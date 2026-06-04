/* ═══════════════════════════════════════════════
   CareTrack – Patients page
   ═══════════════════════════════════════════════ */

let allPatients = [];
let allDoctors  = [];
let currentUser = null;

(async () => {
  currentUser = await renderLayout('/patients.html');
  if (!currentUser) return;
  initDrawer('patDrawer');
  initDrawer('profileDrawer');

  allDoctors = await API.getDoctors();
  const docSel = document.getElementById('patDoctor');
  allDoctors.forEach(d => docSel.insertAdjacentHTML('beforeend',
    `<option value="${d.id}">${d.full_name} · ${d.specialty}</option>`));

  document.getElementById('savePatBtn').addEventListener('click', savePat);

  // Direct profile open via URL param
  const pid = new URLSearchParams(location.search).get('profile');
  if (pid) { await loadPatients(); openProfile(+pid); }
  else await loadPatients();
})();

async function loadPatients() {
  const page = document.getElementById('ct-page');
  try {
    const params = {};
    const search = document.getElementById('searchPat')?.value;
    const docF   = document.getElementById('filterDocPat')?.value;
    if (search) params.search    = search;
    if (docF)   params.doctor_id = docF;

    allPatients = await API.getPatients(params);
    const canAdd    = ['admin','receptionist'].includes(currentUser.role);
    const canEdit   = ['admin','clinician'].includes(currentUser.role);
    const canDelete = currentUser.role === 'admin';

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Bemorlar</h1>
          <p class="ct-page-subtitle">${allPatients.length} ta bemor ro'yxatda</p>
        </div>
        ${canAdd ? `<button class="ct-btn ct-btn-primary" onclick="openAddPat()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Bemor qo'shish
        </button>` : ''}
      </div>

      <div class="ct-card" style="margin-bottom:16px">
        <div class="ct-filter-row">
          <div class="ct-search-wrap" style="flex:1;min-width:200px">
            <svg class="ct-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="ct-input" id="searchPat" placeholder="Ism bo'yicha qidirish…" value="${params.search||''}"
              onkeydown="if(event.key==='Enter')loadPatients()"/>
          </div>
          <select class="ct-select" id="filterDocPat" style="min-width:200px">
            <option value="">Barcha shifokorlar</option>
            ${allDoctors.map(d=>`<option value="${d.id}" ${params.doctor_id==d.id?'selected':''}>${d.full_name}</option>`).join('')}
          </select>
          <button class="ct-btn ct-btn-outline" onclick="loadPatients()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtr
          </button>
        </div>
      </div>

      <div class="ct-card">
        <div class="ct-card-body-flush">
          <div class="ct-table-wrap">
            <table class="ct-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bemor</th>
                  <th>Yoshi / Jinsi</th>
                  <th>Tayinlangan shifokor</th>
                  <th>Telefon</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                ${allPatients.map((p, i) => `
                  <tr>
                    <td style="color:var(--ct-gray-400);font-size:12px">${i+1}</td>
                    <td>
                      <div class="ct-cell-name" style="cursor:pointer" onclick="openProfile(${p.id})">
                        <div class="ct-cell-avatar">${ini(p.full_name)}</div>
                        <div>
                          <div style="font-weight:500;color:var(--ct-gray-900)">${p.full_name}</div>
                          ${p.address ? `<div style="font-size:11px;color:var(--ct-gray-400)">${p.address}</div>` : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      ${calcAge(p.date_of_birth)} yosh
                      <span style="font-size:11px;color:var(--ct-gray-400)">· ${p.gender}</span>
                    </td>
                    <td>
                      ${p.doctor
                        ? `<div style="font-size:13px">${p.doctor.full_name}</div>
                           <div style="font-size:11px;color:var(--ct-gray-400)">${p.doctor.specialty}</div>`
                        : '<span style="color:var(--ct-gray-300)">—</span>'}
                    </td>
                    <td style="font-size:13px;color:var(--ct-gray-600)">${p.phone || '—'}</td>
                    <td>
                      <div class="ct-row-actions">
                        <button class="ct-btn ct-btn-outline ct-btn-sm" onclick="openProfile(${p.id})" style="gap:5px">${ICONS.eye.replace('<svg ',`<svg style="width:13px;height:13px" `)} Profil</button>
                        ${canEdit ? `<button class="ct-btn ct-btn-ghost ct-btn-sm" onclick="openEditPat(${p.id})" title="Tahrirlash">${ICONS.edit.replace('<svg ',`<svg style="width:14px;height:14px" `)}</button>` : ''}
                        ${canDelete ? `<button class="ct-btn ct-btn-danger ct-btn-sm" onclick="deletePat(${p.id},'${p.full_name.replace(/'/g,"\\'")}')}" title="O'chirish">${ICONS.trash.replace('<svg ',`<svg style="width:14px;height:14px" `)}</button>` : ''}
                      </div>
                    </td>
                  </tr>`).join('')}
                ${allPatients.length === 0 ? `
                  <tr><td colspan="6">
                    <div class="ct-empty"><div class="ct-empty-icon" style="display:flex;justify-content:center;opacity:.4">${ICONS.patients.replace('<svg ',`<svg style="width:40px;height:40px" `)}</div><div class="ct-empty-text" style="margin-top:12px">Bemorlar topilmadi</div></div>
                  </td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
  } catch(e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error" style="display:flex;align-items:center;gap:8px">${ICONS.xCircle.replace('<svg ',`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

function openAddPat() {
  document.getElementById('patDrawerTitle').textContent = "Bemor qo'shish";
  document.getElementById('patId').value    = '';
  document.getElementById('patName').value  = '';
  document.getElementById('patDob').value   = '';
  document.getElementById('patGender').value= '';
  document.getElementById('patPhone').value = '';
  document.getElementById('patEmail').value = '';
  document.getElementById('patDoctor').value= '';
  document.getElementById('patAddress').value='';
  document.getElementById('patDrawerAlert').innerHTML = '';
  openDrawer('patDrawer');
}

function openEditPat(id) {
  const p = allPatients.find(x => x.id === id);
  if (!p) return;
  document.getElementById('patDrawerTitle').textContent = 'Bemorni tahrirlash';
  document.getElementById('patId').value     = p.id;
  document.getElementById('patName').value   = p.full_name;
  document.getElementById('patDob').value    = p.date_of_birth;
  document.getElementById('patGender').value = p.gender;
  document.getElementById('patPhone').value  = p.phone || '';
  document.getElementById('patEmail').value  = p.email || '';
  document.getElementById('patDoctor').value = p.doctor_id || '';
  document.getElementById('patAddress').value= p.address || '';
  document.getElementById('patDrawerAlert').innerHTML = '';
  openDrawer('patDrawer');
}

async function savePat() {
  const id = document.getElementById('patId').value;
  const data = {
    full_name:     document.getElementById('patName').value.trim(),
    date_of_birth: document.getElementById('patDob').value,
    gender:        document.getElementById('patGender').value,
    phone:         document.getElementById('patPhone').value.trim(),
    email:         document.getElementById('patEmail').value.trim(),
    address:       document.getElementById('patAddress').value.trim(),
    doctor_id:     document.getElementById('patDoctor').value || null,
  };
  const alertEl = document.getElementById('patDrawerAlert');
  alertEl.innerHTML = '';
  const btn = document.getElementById('savePatBtn');
  btn.disabled = true;
  try {
    if (id) { await API.updatePatient(id, data); toast('Bemor yangilandi', 'success'); }
    else    { await API.createPatient(data); toast("Bemor qo'shildi", 'success'); }
    closeDrawer('patDrawer');
    await loadPatients();
  } catch(e) {
    alertEl.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:12px;display:flex;align-items:center;gap:8px">${ICONS.alertTriangle.replace('<svg ',`<svg style="width:15px;height:15px;flex-shrink:0" `)} ${e.message}</div>`;
  } finally { btn.disabled = false; }
}

async function openProfile(id) {
  document.getElementById('profileDrawerTitle').textContent = 'Bemor profili';
  document.getElementById('profileDrawerBody').innerHTML = `<div class="ct-loading-overlay"><div class="ct-spinner"></div></div>`;
  openDrawer('profileDrawer');
  try {
    const { patient: p, diagnoses } = await API.getProfile(id);
    document.getElementById('profileDrawerTitle').textContent = p.full_name;
    const sevCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    diagnoses.forEach(d => { if (sevCounts[d.severity] !== undefined) sevCounts[d.severity]++; });

    document.getElementById('profileDrawerBody').innerHTML = `
      <!-- Info cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">${ICONS.profile.replace('<svg ',`<svg style="width:15px;height:15px" `)} Shaxsiy ma'lumotlar</h3></div>
          <div class="ct-card-body" style="font-size:13px;line-height:2">
            <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Ism:</span> <b>${p.full_name}</b></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Tug'ilgan:</span> ${p.date_of_birth} (${calcAge(p.date_of_birth)} yosh)</div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Jins:</span> ${p.gender}</div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Telefon:</span> ${p.phone||'—'}</div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Email:</span> ${p.email||'—'}</div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Manzil:</span> ${p.address||'—'}</div>
          </div>
        </div>
        <div class="ct-card">
          <div class="ct-card-header"><h3 class="ct-card-title">${ICONS.doctors.replace('<svg ',`<svg style="width:15px;height:15px" `)} Shifokor</h3></div>
          <div class="ct-card-body" style="font-size:13px;line-height:2">
            ${p.doctor ? `
              <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Ism:</span> <b>${p.doctor.full_name}</b></div>
              <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Mutaxassislik:</span> ${p.doctor.specialty}</div>
              <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Bo'lim:</span> ${p.doctor.department}</div>
              <div style="display:flex;justify-content:space-between"><span style="color:var(--ct-gray-500)">Tel:</span> ${p.doctor.phone}</div>
            ` : '<p style="color:var(--ct-gray-400)">Shifokor biriktirilmagan</p>'}
          </div>
        </div>
      </div>

      <!-- Diagnosis stats -->
      ${diagnoses.length > 0 ? `
      <div style="display:flex;gap:8px;margin-bottom:16px">
        ${Object.entries(sevCounts).filter(([,v])=>v>0).map(([k,v])=>`<span class="ct-badge ct-badge-${k.toLowerCase()}">${k}: ${v}</span>`).join('')}
      </div>` : ''}

      <!-- Diagnosis timeline -->
      <h4 style="font-size:13px;font-weight:600;color:var(--ct-gray-700);margin:0 0 14px">Tashxislar tarixi (${diagnoses.length})</h4>
      ${diagnoses.length === 0
        ? `<div class="ct-empty"><div class="ct-empty-icon" style="display:flex;justify-content:center;opacity:.4">${ICONS.clipboardList.replace('<svg ',`<svg style="width:36px;height:36px" `)}</div><div class="ct-empty-text" style="margin-top:12px">Tashxislar mavjud emas</div></div>`
        : `<div class="ct-timeline">
            ${diagnoses.map(d => `
              <div class="ct-timeline-item">
                <div class="ct-timeline-dot" style="background:${sevColor(d.severity)}"></div>
                <div class="ct-card" style="margin-left:0">
                  <div class="ct-card-body" style="padding:14px">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
                      <div>
                        <span class="ct-badge ct-badge-${d.severity?.toLowerCase()}" style="margin-right:6px">${d.severity}</span>
                        <b style="font-size:13.5px">${d.title}</b>
                        <span style="font-size:11.5px;color:var(--ct-gray-400);margin-left:8px"><code>${d.icd_code}</code></span>
                      </div>
                      <div style="font-size:11px;color:var(--ct-gray-400);white-space:nowrap">${d.diagnosis_date}</div>
                    </div>
                    ${d.description ? `<p style="font-size:12.5px;color:var(--ct-gray-600);margin:4px 0">${d.description}</p>` : ''}
                    ${d.notes ? `<p style="font-size:12px;color:var(--ct-gray-500);background:var(--ct-gray-50);padding:8px;border-radius:6px;margin:6px 0 0"><em>${d.notes}</em></p>` : ''}
                    <div style="font-size:11px;color:var(--ct-gray-400);margin-top:6px">Shifokor: ${d.doctor?.full_name||'—'}</div>
                  </div>
                </div>
              </div>`).join('')}
          </div>`}`;
  } catch(e) {
    document.getElementById('profileDrawerBody').innerHTML = `<div class="ct-alert ct-alert-error" style="display:flex;align-items:center;gap:8px">${ICONS.xCircle.replace('<svg ',`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

async function deletePat(id, name) {
  if (!confirm(`"${name}" bemorini va uning barcha tashxislarini o'chirasizmi?`)) return;
  try {
    await API.deletePatient(id);
    toast("Bemor o'chirildi", 'warning');
    await loadPatients();
  } catch(e) { toast(e.message, 'error'); }
}

// Utils
function ini(name) { return (name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
function calcAge(dob) { return dob ? Math.floor((Date.now()-new Date(dob).getTime())/(365.25*24*3600*1000)) : '—'; }
function sevColor(s) { return { Low:'#10b981',Medium:'#f59e0b',High:'#ef4444',Critical:'#7f1d1d' }[s]||'#94a3b8'; }
