/* ═══════════════════════════════════════════════
   CareTrack – Doctors page
   ═══════════════════════════════════════════════ */

let allDoctors  = [];
let currentUser = null;

(async () => {
  currentUser = await renderLayout('/doctors.html');
  if (!currentUser) return;
  initDrawer('docDrawer');
  document.getElementById('saveDocBtn').addEventListener('click', saveDoctor);
  await loadDoctors();
})();

async function loadDoctors() {
  const page = document.getElementById('ct-page');
  try {
    allDoctors = await API.getDoctors();
    const canEdit = currentUser.role === 'admin';

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Shifokorlar</h1>
          <p class="ct-page-subtitle">${allDoctors.length} ta shifokor ro'yxatda</p>
        </div>
        ${canEdit ? `<button class="ct-btn ct-btn-primary" onclick="openAddDoc()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Shifokor qo'shish
        </button>` : ''}
      </div>

      <!-- Filters – single row -->
      <div class="ct-card" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--ct-gradient-soft);border-bottom:1px solid var(--ct-gray-200)">
          <div style="position:relative;flex:1;min-width:0">
            <svg style="position:absolute;left:11px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:var(--ct-primary-mid);pointer-events:none;flex-shrink:0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="ct-input" id="searchDoc" placeholder="Ism, mutaxassislik yoki bo'lim bo'yicha qidirish…" style="padding-left:34px" oninput="filterDoctors(this.value)"/>
          </div>
          <select id="filterStatus" onchange="filterDoctors()" style="flex-shrink:0;padding:9px 10px;font-size:13px;border:1.5px solid var(--ct-gray-200);border-radius:var(--ct-radius-sm);background:#fff;color:var(--ct-gray-700);cursor:pointer;outline:none;min-width:140px">
            <option value="">Barcha holatlar</option>
            <option value="Available">Available</option>
            <option value="Off-duty">Off-duty</option>
            <option value="On-leave">On-leave</option>
          </select>
          <select id="filterDept" onchange="filterDoctors()" style="flex-shrink:0;padding:9px 10px;font-size:13px;border:1.5px solid var(--ct-gray-200);border-radius:var(--ct-radius-sm);background:#fff;color:var(--ct-gray-700);cursor:pointer;outline:none;min-width:160px">
            <option value="">Barcha bo'limlar</option>
            ${[...new Set(allDoctors.map(d=>d.department))].map(d=>`<option value="${d}">${d}</option>`).join('')}
          </select>
          <button onclick="clearDocFilters()" title="Filtrlarni tozalash"
            style="flex-shrink:0;display:flex;align-items:center;gap:5px;padding:8px 12px;font-size:12.5px;font-weight:500;background:transparent;border:1.5px solid var(--ct-gray-200);border-radius:var(--ct-radius-sm);cursor:pointer;color:var(--ct-gray-500);white-space:nowrap;transition:all var(--ct-transition)"
            onmouseover="this.style.borderColor='var(--ct-danger-mid)';this.style.color='var(--ct-danger)'"
            onmouseout="this.style.borderColor='var(--ct-gray-200)';this.style.color='var(--ct-gray-500)'">
            ${ICONS.close.replace('<svg ','<svg style="width:12px;height:12px" ')} Tozalash
          </button>
        </div>
        <div id="activeFilters" style="display:none;align-items:center;gap:6px;padding:8px 16px;flex-wrap:wrap;border-top:1px solid var(--ct-gray-100)"></div>
      </div>

      <!-- Doctor cards grid -->
      <div id="docGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px"></div>`;

    renderDocGrid(allDoctors, canEdit);
  } catch(e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error" style="display:flex;align-items:center;gap:8px">${ICONS.xCircle.replace("<svg ",`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

function filterDoctors(searchVal) {
  const q    = (searchVal !== undefined ? searchVal : (document.getElementById('searchDoc')?.value ?? '')).toLowerCase();
  const stat = document.getElementById('filterStatus')?.value || '';
  const dept = document.getElementById('filterDept')?.value  || '';

  const filtered = allDoctors.filter(d =>
    (!q    || d.full_name.toLowerCase().includes(q) || (d.department||'').toLowerCase().includes(q) || (d.specialty||'').toLowerCase().includes(q)) &&
    (!stat || d.available_status === stat) &&
    (!dept || d.department === dept)
  );

  renderDocGrid(filtered, currentUser?.role === 'admin');
  updateSubtitle(filtered.length);
  renderFilterTags(q, stat, dept);
}

function clearDocFilters() {
  const s = document.getElementById('searchDoc');
  const st = document.getElementById('filterStatus');
  const dt = document.getElementById('filterDept');
  if (s) s.value = '';
  if (st) st.value = '';
  if (dt) dt.value = '';
  filterDoctors('');
}

function updateSubtitle(count) {
  const sub = document.querySelector('.ct-page-subtitle');
  if (sub) sub.textContent = `${count} ta shifokor (jami: ${allDoctors.length})`;
}

function renderFilterTags(q, stat, dept) {
  const wrap = document.getElementById('activeFilters');
  if (!wrap) return;
  const tags = [];
  if (q)    tags.push({ label: `"${q}"`,         key: 'q' });
  if (stat) tags.push({ label: stat,              key: 'stat' });
  if (dept) tags.push({ label: dept,              key: 'dept' });

  if (tags.length === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  wrap.innerHTML = `<span style="font-size:11.5px;color:var(--ct-gray-400);font-weight:500">Filtr:</span>` +
    tags.map(t => `
      <span style="display:inline-flex;align-items:center;gap:5px;background:var(--ct-primary-light);color:var(--ct-primary);border:1px solid var(--ct-primary-mid);border-radius:20px;padding:3px 10px;font-size:12px;font-weight:600">
        ${t.label}
        <span style="cursor:pointer;font-weight:700;font-size:14px;line-height:1" onclick="clearTag('${t.key}')">×</span>
      </span>`).join('') +
    `<span style="font-size:12px;color:var(--ct-gray-400);margin-left:4px">${document.querySelectorAll('#docGrid .ct-doctor-card').length} natija</span>`;
}

function clearTag(key) {
  if (key === 'q')    { const el = document.getElementById('searchDoc');    if (el) el.value = ''; }
  if (key === 'stat') { const el = document.getElementById('filterStatus'); if (el) el.value = ''; }
  if (key === 'dept') { const el = document.getElementById('filterDept');   if (el) el.value = ''; }
  filterDoctors(document.getElementById('searchDoc')?.value || '');
}

function renderDocGrid(docs, canEdit) {
  const grid = document.getElementById('docGrid');
  if (!grid) return;
  if (docs.length === 0) {
    grid.innerHTML = `<div class="ct-empty" style="grid-column:1/-1;padding:48px"><div class="ct-empty-icon" style="display:flex;justify-content:center;opacity:.4">${ICONS.doctors.replace('<svg ',`<svg style="width:40px;height:40px" `)}</div><div class="ct-empty-text" style="margin-top:12px">Shifokorlar topilmadi</div></div>`;
    return;
  }
  const ico = (svg, size='14px') => svg.replace('<svg ', `<svg style="width:${size};height:${size};flex-shrink:0" `);

  grid.innerHTML = docs.map(d => {
    const ini = d.full_name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
    const avCls = d.available_status?.toLowerCase().replace(' ','-') || 'off-duty';
    return `<div class="ct-doctor-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="ct-doctor-avatar-lg">${ini}</div>
          <div>
            <div style="font-weight:700;font-size:14px;color:var(--ct-gray-900)">${d.full_name}</div>
            <div style="font-size:12.5px;color:var(--ct-primary);font-weight:500;margin-top:1px">${d.specialty}</div>
            <div style="font-size:12px;color:var(--ct-gray-400);margin-top:1px">${d.department}</div>
          </div>
        </div>
        <span class="ct-badge ct-badge-${avCls}" style="white-space:nowrap;flex-shrink:0">${d.available_status}</span>
      </div>
      <hr class="ct-divider"/>
      <div style="display:flex;flex-direction:column;gap:7px">
        <div style="font-size:12.5px;color:var(--ct-gray-600);display:flex;align-items:center;gap:7px">
          ${ico(ICONS.phone)}
          <span>${d.phone || '—'}</span>
        </div>
        <div style="font-size:12.5px;color:var(--ct-gray-600);display:flex;align-items:center;gap:7px">
          ${ico(ICONS.mail)}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.email || '—'}</span>
        </div>
        ${d.emergency_contact ? `
        <div style="font-size:12.5px;color:var(--ct-danger);display:flex;align-items:center;gap:7px">
          ${ico(ICONS.emergency)}
          <span>${d.emergency_contact}</span>
        </div>` : ''}
      </div>
      ${canEdit ? `<div style="display:flex;gap:8px;margin-top:4px">
        <button class="ct-btn ct-btn-outline ct-btn-sm" style="flex:1;gap:5px" onclick="openEditDoc(${d.id})">
          ${ico(ICONS.edit)} Tahrirlash
        </button>
        <button class="ct-btn ct-btn-danger ct-btn-sm" title="O'chirish" onclick="deleteDoctor(${d.id},'${d.full_name.replace(/'/g,"\\'")}')">
          ${ico(ICONS.trash)}
        </button>
      </div>` : ''}
    </div>`;
  }).join('');
}

function openAddDoc() {
  document.getElementById('docDrawerTitle').textContent = "Shifokor qo'shish";
  document.getElementById('docId').value = '';
  document.getElementById('docName').value = '';
  document.getElementById('docSpecialty').value = '';
  document.getElementById('docDept').value = '';
  document.getElementById('docPhone').value = '';
  document.getElementById('docEmail').value = '';
  document.getElementById('docEmail').disabled = false;
  document.getElementById('docStatus').value = 'Available';
  document.getElementById('docEmergency').value = '';
  document.getElementById('docDrawerAlert').innerHTML = '';
  document.getElementById('docCredentialsHint').style.display = 'flex';
  openDrawer('docDrawer');
}

function openEditDoc(id) {
  const doc = allDoctors.find(d => d.id === id);
  if (!doc) return;
  document.getElementById('docDrawerTitle').textContent = 'Shifokorni tahrirlash';
  document.getElementById('docId').value        = doc.id;
  document.getElementById('docName').value      = doc.full_name;
  document.getElementById('docSpecialty').value = doc.specialty;
  document.getElementById('docDept').value      = doc.department;
  document.getElementById('docPhone').value     = doc.phone;
  document.getElementById('docEmail').value     = doc.email;
  document.getElementById('docEmail').disabled  = true;
  document.getElementById('docStatus').value    = doc.available_status;
  document.getElementById('docEmergency').value = doc.emergency_contact || '';
  document.getElementById('docDrawerAlert').innerHTML = '';
  document.getElementById('docCredentialsHint').style.display = 'none';
  openDrawer('docDrawer');
}

async function saveDoctor() {
  const id = document.getElementById('docId').value;
  const data = {
    full_name:         document.getElementById('docName').value.trim(),
    specialty:         document.getElementById('docSpecialty').value.trim(),
    department:        document.getElementById('docDept').value.trim(),
    phone:             document.getElementById('docPhone').value.trim(),
    email:             document.getElementById('docEmail').value.trim(),
    available_status:  document.getElementById('docStatus').value,
    emergency_contact: document.getElementById('docEmergency').value.trim(),
  };
  const alertEl = document.getElementById('docDrawerAlert');
  alertEl.innerHTML = '';
  const btn = document.getElementById('saveDocBtn');
  btn.disabled = true;

  try {
    if (id) {
      await API.updateDoctor(id, data);
      toast("Shifokor ma'lumotlari yangilandi", 'success');
    } else {
      const res = await API.createDoctor(data);
      toast(`Shifokor qo'shildi. Kirish paroli: ${res.defaultPassword}`, 'success');
    }
    closeDrawer('docDrawer');
    await loadDoctors();
  } catch(e) {
    alertEl.innerHTML = `<div class="ct-alert ct-alert-error" style="margin-bottom:12px">${ICONS.alertTriangle.replace("<svg ",`<svg style="width:15px;height:15px;flex-shrink:0" `)} ${e.message}</div>`;
  } finally {
    btn.disabled = false;
  }
}

async function deleteDoctor(id, name) {
  if (!confirm(`"${name}" shifokorini o'chirasizmi?\nUnga bog'liq barcha foydalanuvchi hisobi ham o'chiriladi.`)) return;
  try {
    await API.deleteDoctor(id);
    toast("Shifokor o'chirildi", 'warning');
    await loadDoctors();
  } catch(e) {
    toast(e.message, 'error');
  }
}
