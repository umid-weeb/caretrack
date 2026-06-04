/* ═══════════════════════════════════════════════
   CareTrack – Patient: My Diagnoses
   ═══════════════════════════════════════════════ */

(async () => {
  const user = await renderLayout('/my-diagnoses.html');
  if (!user) return;

  if (user.role !== 'patient') {
    // Klinitsist va adminni tashxislar sahifasiga yo'naltirish
    window.location = '/diagnoses.html';
    return;
  }

  await loadMyDiagnoses();
})();

async function loadMyDiagnoses() {
  const page = document.getElementById('ct-page');
  try {
    const { diagnoses, found, patient } = await API.getMyDiagnoses();

    if (!found) {
      page.innerHTML = `
        <div class="ct-page-header">
          <div>
            <h1 class="ct-page-title">Mening tashxislarim</h1>
            <p class="ct-page-subtitle">Sizning tibbiy tashxislar tarixi</p>
          </div>
        </div>
        <div class="ct-card">
          <div class="ct-card-body">
            <div class="ct-empty">
              <div class="ct-empty-icon">🩺</div>
              <div class="ct-empty-text">
                Hozircha tashxislar mavjud emas.<br/>
                <span style="font-size:13px;color:var(--ct-gray-400)">
                  Klinikada ko'ringuach, shifokor tashxisni kiritadi.
                </span>
              </div>
            </div>
          </div>
        </div>`;
      return;
    }

    // Severity statistikasi
    const sevCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    diagnoses.forEach(d => { if (sevCounts[d.severity] !== undefined) sevCounts[d.severity]++; });

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Mening tashxislarim</h1>
          <p class="ct-page-subtitle">${diagnoses.length} ta tashxis qayd etilgan</p>
        </div>
        <a href="/appointments.html" class="ct-btn ct-btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Qabul yozish
        </a>
      </div>

      <!-- Severity summary chips -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
        ${Object.entries(sevCounts).filter(([,v]) => v > 0).map(([k, v]) => `
          <div class="ct-stat" style="padding:12px 16px;flex:none">
            <div class="ct-stat-icon ${sevIconClass(k)}" style="width:36px;height:36px;font-size:15px">${sevEmoji(k)}</div>
            <div>
              <div class="ct-stat-val" style="font-size:20px">${v}</div>
              <div class="ct-stat-label">${k}</div>
            </div>
          </div>`).join('')}
        ${diagnoses.length === 0 ? '' : `
          <div class="ct-stat" style="padding:12px 16px;flex:none">
            <div class="ct-stat-icon blue" style="width:36px;height:36px;font-size:15px">📋</div>
            <div>
              <div class="ct-stat-val" style="font-size:20px">${diagnoses.length}</div>
              <div class="ct-stat-label">Jami</div>
            </div>
          </div>`}
      </div>

      <!-- Timeline of diagnoses -->
      <div style="display:grid;grid-template-columns:1fr;gap:12px">
        ${diagnoses.map(d => `
          <div class="ct-card" style="border-left:4px solid ${sevColor(d.severity)}">
            <div class="ct-card-body">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <span class="ct-badge ct-badge-${d.severity?.toLowerCase()}">${d.severity}</span>
                  <span style="font-size:15px;font-weight:600;color:var(--ct-gray-900)">${d.title}</span>
                  <code style="font-size:11.5px;color:var(--ct-gray-400);background:var(--ct-gray-100);padding:2px 6px;border-radius:4px">${d.icd_code}</code>
                </div>
                <div style="font-size:12px;color:var(--ct-gray-400);white-space:nowrap;flex-shrink:0">
                  📅 ${formatDate(d.diagnosis_date)}
                </div>
              </div>

              ${d.description ? `
                <p style="font-size:13.5px;color:var(--ct-gray-600);margin:0 0 8px;line-height:1.6">
                  ${d.description}
                </p>` : ''}

              ${d.notes ? `
                <div style="background:var(--ct-gray-50);border-radius:6px;padding:10px 12px;margin-bottom:8px">
                  <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--ct-gray-400);margin-bottom:4px">Shifokor izohi</div>
                  <div style="font-size:13px;color:var(--ct-gray-600)">${d.notes}</div>
                </div>` : ''}

              <div style="font-size:12px;color:var(--ct-gray-400)">
                👨‍⚕️ ${d.doctor ? d.doctor.full_name + ' · ' + d.doctor.specialty : '—'}
              </div>
            </div>
          </div>`).join('')}

        ${diagnoses.length === 0 ? `
          <div class="ct-card"><div class="ct-card-body">
            <div class="ct-empty">
              <div class="ct-empty-icon">🩺</div>
              <div class="ct-empty-text">Hozircha tashxislar mavjud emas</div>
            </div>
          </div></div>` : ''}
      </div>`;

  } catch (e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error">❌ ${e.message}</div>`;
  }
}

function sevColor(s) {
  return { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Critical: '#7f1d1d' }[s] || '#94a3b8';
}
function sevEmoji(s) {
  return { Low: '🟢', Medium: '🟡', High: '🔴', Critical: '⚫' }[s] || '⚪';
}
function sevIconClass(s) {
  return { Low: 'green', Medium: 'amber', High: 'red', Critical: 'red' }[s] || 'blue';
}
function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
}
