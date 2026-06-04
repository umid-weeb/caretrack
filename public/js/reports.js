/* ═══════════════════════════════════════════════
   CareTrack – Reports page
   ═══════════════════════════════════════════════ */

(async () => {
  const user = await renderLayout('/reports.html');
  if (!user) return;
  if (user.role !== 'admin') {
    document.getElementById('ct-page').innerHTML = `
      <div class="ct-alert ct-alert-warning" style="display:flex;align-items:center;gap:8px">${ICONS.alertTriangle.replace('<svg ',`<svg style="width:15px;height:15px;flex-shrink:0" `)} Bu sahifa faqat administratorlar uchun mo'ljallangan.</div>`;
    return;
  }
  await loadReports();
})();

async function loadReports() {
  const page = document.getElementById('ct-page');
  try {
    const { totals, severityCounts, patientsByDepartment, criticalAndHigh, aptStats } = await API.getSummary();
    const total = totals.diagnoses || 1;

    const sevData = [
      { key:'Critical', cls:'critical', val:severityCounts.Critical, color:'#7f1d1d' },
      { key:'High',     cls:'high',     val:severityCounts.High,     color:'#ef4444' },
      { key:'Medium',   cls:'medium',   val:severityCounts.Medium,   color:'#f59e0b' },
      { key:'Low',      cls:'low',      val:severityCounts.Low,      color:'#10b981' },
    ];

    const deptEntries = Object.entries(patientsByDepartment).sort((a,b)=>b[1]-a[1]);
    const maxDept = Math.max(...deptEntries.map(e=>e[1]), 1);

    page.innerHTML = `
      <div class="ct-page-header">
        <div>
          <h1 class="ct-page-title">Hisobotlar va tahlil</h1>
          <p class="ct-page-subtitle">Klinika umumiy statistikasi</p>
        </div>
        <button class="ct-btn ct-btn-outline" onclick="exportCSV()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV yuklab olish
        </button>
      </div>

      <!-- KPI Cards -->
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
          <div><div class="ct-stat-val">${totals.critical}</div><div class="ct-stat-label">Kritik tashxislar</div></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
        <!-- Severity distribution -->
        <div class="ct-card">
          <div class="ct-card-header">
            <h3 class="ct-card-title">${ICONS.barChart.replace('<svg ',`<svg style="width:15px;height:15px" `)} Tashxis og'irligi taqsimoti</h3>
            <span style="font-size:12px;color:var(--ct-gray-400)">Jami: ${totals.diagnoses}</span>
          </div>
          <div class="ct-card-body">
            <div class="ct-bar-chart">
              ${sevData.map(s => `
                <div class="ct-bar-row">
                  <div style="min-width:100px">
                    <span class="ct-badge ct-badge-${s.cls}">${s.key}</span>
                  </div>
                  <div class="ct-bar-track">
                    <div class="ct-bar-fill" style="background:${s.color};width:${Math.round(s.val/total*100)}%"></div>
                  </div>
                  <div class="ct-bar-val">${s.val}</div>
                  <div style="font-size:11px;color:var(--ct-gray-400);min-width:32px;text-align:right">${Math.round(s.val/total*100)}%</div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Appointments stats -->
        <div class="ct-card">
          <div class="ct-card-header">
            <h3 class="ct-card-title">${ICONS.calendar.replace('<svg ',`<svg style="width:15px;height:15px" `)} Qabullar statistikasi</h3>
            <span class="ct-badge ct-badge-booked">${aptStats.today} bugun</span>
          </div>
          <div class="ct-card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;text-align:center">
              <div style="padding:12px;background:var(--ct-gray-50);border-radius:8px">
                <div style="font-size:22px;font-weight:700;color:var(--ct-warning)">${aptStats.booked}</div>
                <div style="font-size:11px;color:var(--ct-gray-500)">Kutilmoqda</div>
              </div>
              <div style="padding:12px;background:var(--ct-gray-50);border-radius:8px">
                <div style="font-size:22px;font-weight:700;color:var(--ct-success)">${aptStats.completed}</div>
                <div style="font-size:11px;color:var(--ct-gray-500)">Yakunlangan</div>
              </div>
              <div style="padding:12px;background:var(--ct-gray-50);border-radius:8px">
                <div style="font-size:22px;font-weight:700;color:var(--ct-danger)">${aptStats.cancelled}</div>
                <div style="font-size:11px;color:var(--ct-gray-500)">Bekor</div>
              </div>
            </div>
            <div class="ct-bar-chart">
              <div class="ct-bar-row">
                <div style="min-width:100px;font-size:12.5px;color:var(--ct-gray-600)">Bajarilish</div>
                <div class="ct-bar-track">
                  <div class="ct-bar-fill" style="background:var(--ct-success);width:${aptStats.total?Math.round(aptStats.completed/aptStats.total*100):0}%"></div>
                </div>
                <div class="ct-bar-val">${aptStats.total?Math.round(aptStats.completed/aptStats.total*100):0}%</div>
              </div>
              <div class="ct-bar-row">
                <div style="min-width:100px;font-size:12.5px;color:var(--ct-gray-600)">Bekor qilish</div>
                <div class="ct-bar-track">
                  <div class="ct-bar-fill" style="background:var(--ct-danger);width:${aptStats.total?Math.round(aptStats.cancelled/aptStats.total*100):0}%"></div>
                </div>
                <div class="ct-bar-val">${aptStats.total?Math.round(aptStats.cancelled/aptStats.total*100):0}%</div>
              </div>
            </div>
            <div style="text-align:center;padding-top:12px;border-top:1px solid var(--ct-gray-100);margin-top:12px">
              <span style="font-size:24px;font-weight:700;color:var(--ct-gray-900)">${aptStats.total}</span>
              <span style="font-size:13px;color:var(--ct-gray-500);margin-left:6px">jami qabul</span>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <!-- Department chart -->
        <div class="ct-card">
          <div class="ct-card-header">
            <h3 class="ct-card-title">${ICONS.hospital.replace('<svg ',`<svg style="width:15px;height:15px" `)} Bo'lim bo'yicha bemorlar</h3>
          </div>
          <div class="ct-card-body">
            <div class="ct-bar-chart">
              ${deptEntries.map(([dept, cnt]) => `
                <div class="ct-bar-row">
                  <div style="min-width:160px;font-size:12.5px;color:var(--ct-gray-600);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${dept}">${dept}</div>
                  <div class="ct-bar-track">
                    <div class="ct-bar-fill ct-bar-accent" style="width:${Math.round(cnt/maxDept*100)}%"></div>
                  </div>
                  <div class="ct-bar-val">${cnt}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Critical & High diagnoses list -->
        <div class="ct-card">
          <div class="ct-card-header">
            <h3 class="ct-card-title">${ICONS.alertTriangle.replace('<svg ',`<svg style="width:15px;height:15px" `)} Kritik va Yuqori tashxislar</h3>
            <a href="/diagnoses.html" class="ct-btn ct-btn-ghost ct-btn-sm">Barchasi</a>
          </div>
          <div class="ct-card-body-flush">
            <table class="ct-table">
              <thead><tr><th>Daraja</th><th>Tashxis</th><th>Sana</th></tr></thead>
              <tbody>
                ${criticalAndHigh.slice(0,8).map(d => `
                  <tr>
                    <td style="width:80px"><span class="ct-badge ct-badge-${d.severity?.toLowerCase()}">${d.severity}</span></td>
                    <td>
                      <div style="font-size:13px;font-weight:500">${d.title}</div>
                      <code style="font-size:11px;color:var(--ct-gray-400)">${d.icd_code}</code>
                    </td>
                    <td style="font-size:12px;color:var(--ct-gray-400);white-space:nowrap">${d.diagnosis_date}</td>
                  </tr>`).join('')}
                ${criticalAndHigh.length===0 ? `
                  <tr><td colspan="3">
                    <div class="ct-empty" style="padding:20px"><div class="ct-empty-text">Hozircha bunday holatlar yo'q</div></div>
                  </td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    // Responsive grid adjustment
    if (window.innerWidth < 900) {
      document.querySelectorAll('[style*="grid-template-columns:1fr 1fr"]').forEach(el => {
        el.style.gridTemplateColumns = '1fr';
      });
      const statGrid = document.querySelector('[style*="grid-template-columns:repeat(4,1fr)"]');
      if (statGrid) statGrid.style.gridTemplateColumns = 'repeat(2,1fr)';
    }

  } catch(e) {
    page.innerHTML = `<div class="ct-alert ct-alert-error" style="display:flex;align-items:center;gap:8px">${ICONS.xCircle.replace('<svg ',`<svg style="width:16px;height:16px;flex-shrink:0" `)} ${e.message}</div>`;
  }
}

async function exportCSV() {
  try {
    const [diagnoses] = await Promise.all([API.getDiagnoses()]);
    const rows = [
      ['ID', 'Bemor ismi', 'Tashxis sanasi', 'ICD kodi', 'Tashxis nomi', 'Og\'irlik darajasi', 'Shifokor', 'Izohlar']
    ];
    diagnoses.forEach(d => rows.push([
      d.id,
      d.patient?.full_name || '',
      d.diagnosis_date,
      d.icd_code,
      d.title,
      d.severity,
      d.doctor?.full_name || '',
      (d.notes || '').replace(/,/g, ';'),
    ]));
    const csv = '﻿' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `caretrack-tashxislar-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast('CSV fayl yuklab olindi', 'success');
  } catch(e) {
    toast(e.message, 'error');
  }
}
