/* ═══════════════════════════════════════════════
   CareTrack – Diagnoses page
   ═══════════════════════════════════════════════ */

let allDx       = [];
let allPatients = [];
let currentUser = null;

(async () => {
  currentUser = await renderLayout('/diagnoses.html');
  if (!currentUser) return;
  initDrawer('dxDrawer');

  allPatients = await API.getPatients();
  const sel = document.getElementById('dxPatient');
  allPatients.forEach(p => sel.insertAdjacentHTML('beforeend',
    `<option value="${p.id}">${p.full_name}</option>`));

  document.getElementById('dxDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('saveDxBtn').addEventListener('click', saveDx);
  await loadDx();
})();

async function loadDx() {
  const page = document.getElementById('ct-page');
  try {
    const params = {};
    const sev    = document.getElementById('filterSev')?.value;
    const search = document.getElementById('searchDx')?.value;
    if (sev)    params.severity = sev;
    if (search) params.search   = search;

    allDx = await API.getDiagnoses(params);
    const canAdd    = ['admin','clinician'].includes(currentUser.role);
    const canDelete = currentUser.role === 'admin';

    const sevCounts = { Low:0, Medium:0, High:0, Critical:0 };
    allDx.forEach(d => { if(sevCounts[d.severity]!==undefined) sevCounts[d.severity]++; });

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Tashxislar</h1>
          <p class="ct-page-subtitle">${allDx.length} ta tashxis</p>
        </div>
        ${canAdd ? `<button class="ct-btn ct-btn-primary" onclick="openAddDx()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tashxis qo'shish
        </button>` : ''}
      </div>

      <!-- Quick severity badges -->
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <button class="ct-btn ct-btn-ghost ct-btn-sm" onclick="quickFilter('')">
          Barchasi <b style="margin-left:4px">${allDx.length}</b>
        </button>
        ${Object.entries(sevCounts).map(([k,v])=>`
          <button class="ct-btn ct-btn-ghost ct-btn-sm" onclick="quickFilter('${k}')">
            <span class="ct-badge ct-badge-${k.toLowerCase()}">${k}</span>
            <b style="margin-left:4px">${v}</b>
          </button>`).join('')}
      </div>

      <div class="ct-card" style="margin-bottom:16px">
        <div class="ct-filter-row">
          <div class="ct-search-wrap" style="flex:1;min-width:200px">
            <svg class="ct-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="ct-input" id="searchDx" placeholder="Tashxis nomi yoki ICD kodi…" value="${params.search||''}"
              onkeydown="if(event.key==='Enter')loadDx()"/>
          </div>
          <select class="ct-select" id="filterSev" style="min-width:160px" onchange="loadDx()">
            <option value="">Barcha darajalar</option>
            <option value="Low" ${params.severity==='Low'?'selected':''}>Low</option>
            <option value="Medium" ${params.severity==='Medium'?'selected':''}>Medium</option>
            <option value="High" ${params.severity==='High'?'selected':''}>High</option>
            <option value="Critical" ${params.severity==='Critical'?'selected':''}>Critical</option>
          </select>
          <button class="ct-btn ct-btn-outline" onclick="loadDx()">Filtr</button>
        </div>
      </div>

      <div class="ct-card">
        <div class="ct-card-body-flush">
          <div class="ct-table-wrap">
            <table class="ct-table">
              <thead>
                <tr><th>Sana</th><th>Tashxis</th><th>Daraja</th><th>Bemor</th><th>Shifokor</th><th>Amallar</th></tr>
              </thead>
              <tbody>
                ${allDx.map(d => `
                  <tr>
                    <td style="font-size:12.5px;color:var(--ct-gray-500);white-space:nowrap">${d.diagnosis_date}</td>
                    <td>
                      <div style="font-weight:500;color:var(--ct-gray-900)">${d.title}</div>
                      <code style="font-size:11px;color:var(--ct-gray-400)">${d.icd_code}</code>
                      ${d.description ? `<div style="font-size:11.5px;color:var(--ct-gray-500);margin-top:2px">${d.description.slice(0,60)}${d.description.length>60?'…':''}</div>` : ''}
                    </td>
                    <td><span class="ct-badge ct-badge-${d.severity?.toLowerCase()}">${d.severity}</span></td>
                    <td>
                      ${d.patient
                        ? `<div style="font-weight:500;font-size:13px">${d.patient.full_name}</div>`
                        : '<span style="color:var(--ct-gray-300)">—</span>'}
                    </td>
                    <td style="font-size:13px;color:var(--ct-gray-600)">${d.doctor?.full_name||'—'}</td>
                    <td>
                      <div class="ct-row-actions">
                        ${canAdd ? `<button class="ct-btn ct-btn-ghost ct-btn-sm" onclick="openEditDx(${d.id})" title="Tahrirlash">${ICONS.edit.replace('<svg ',`<svg style="width:14px;height:14px" `)}</button>` : ''}
                        ${canDelete ? `<button class="ct-btn ct-btn-danger ct-btn-sm" onclick="deleteDx(${d.id})" title="O'chirish">${ICONS.trash.replace('<svg ',`<svg style="width:14px;height:14px" `)}</button>` : ''}
                      </div>
                    </td>
                  </tr>`).join('')}
                ${allDx.length===0 ? `
                  <tr><td colspan="6">
                    <div class="ct-empty"><div class="ct-empty-icon" style="display:flex;justify-content:center;opacity:.4">${ICONS.diagnoses.replace('<svg ',`<svg style="width:40px;height:40px" `)}</div><div class="ct-empty-text" style="margin-top:12px">Tashxislar topilmadi</div></div>
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

function quickFilter(severity) {
  const sel = document.getElementById('filterSev');
  if (sel) sel.value = severity;
  loadDx();
}

function openAddDx() {
  document.getElementById('dxDrawerTitle').textContent = "Tashxis qo'shish";
  document.getElementById('dxId').value       = '';
  document.getElementById('dxPatient').value  = '';
  document.getElementById('dxIcd').value      = '';
  document.getElementById('dxTitle').value    = '';
  document.getElementById('dxSeverity').value = 'Low';
  document.getElementById('dxDate').value     = new Date().toISOString().slice(0,10);
  document.getElementById('dxDesc').value     = '';
  document.getElementById('dxNotes').value    = '';
  document.getElementById('dxDrawerAlert').innerHTML = '';
  openDrawer('dxDrawer');
}

function openEditDx(id) {
  const d = allDx.find(x => x.id === id);
  if (!d) return;
  document.getElementById('dxDrawerTitle').textContent = 'Tashxisni tahrirlash';
  document.getElementById('dxId').value       = d.id;
  document.getElementById('dxPatient').value  = d.patient_id;
  document.getElementById('dxIcd').value      = d.icd_code;
  document.getElementById('dxTitle').value    = d.title;
  document.getElementById('dxSeverity').value = d.severity;
  document.getElementById('dxDate').value     = d.diagnosis_date;
  document.getElementById('dxDesc').value     = d.description || '';
  document.getElementById('dxNotes').value    = d.notes || '';
  document.getElementById('dxDrawerAlert').innerHTML = '';
  openDrawer('dxDrawer');
}

async function saveDx() {
  const id = document.getElementById('dxId').value;
  const data = {
    patient_id:     document.getElementById('dxPatient').value,
    icd_code:       document.getElementById('dxIcd').value.trim(),
    title:          document.getElementById('dxTitle').value.trim(),
    severity:       document.getElementById('dxSeverity').value,
    diagnosis_date: document.getElementById('dxDate').value,
    description:    document.getElementById('dxDesc').value.trim(),
    notes:          document.getElementById('dxNotes').value.trim(),
  };
  const alertEl = document.getElementById('dxDrawerAlert');
  alertEl.innerHTML = '';
  const btn = document.getElementById('saveDxBtn');
  btn.disabled = true;
  try {
    if (id) { await API.updateDiagnosis(id, data); toast('Tashxis yangilandi', 'success'); }
    else    { await API.createDiagnosis(data); toast("Tashxis qo'shildi", 'success'); }
    closeDrawer('dxDrawer');
    await loadDx();
  } catch(e) {
    alertEl.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:12px;display:flex;align-items:center;gap:8px">${ICONS.alertTriangle.replace('<svg ',`<svg style="width:15px;height:15px;flex-shrink:0" `)} ${e.message}</div>`;
  } finally { btn.disabled = false; }
}

async function deleteDx(id) {
  if (!confirm("Bu tashxisni o'chirasizmi?")) return;
  try {
    await API.deleteDiagnosis(id);
    toast("Tashxis o'chirildi", 'warning');
    await loadDx();
  } catch(e) { toast(e.message, 'error'); }
}
