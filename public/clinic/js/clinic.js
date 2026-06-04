/* ═══════════════════════════════════════════════════════
   CareTrack Clinic – Public Website JavaScript
   Booking flow: Doctor → Date → Slot → Confirm
   ═══════════════════════════════════════════════════════ */

'use strict';

// ── State ─────────────────────────────────────────────────
const state = {
  step: 1,
  doctors: [],
  selectedDoctor: null,
  selectedDate: null,
  selectedTime: null,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
};

const DAYS_UZ = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const MONTHS_UZ = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initScrollReveal();
  loadDoctors();
});

// ── Header scroll effect ──────────────────────────────────
function initHeader() {
  const hdr = document.getElementById('w-header');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        hdr.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Active nav on scroll
  const sections = document.querySelectorAll('section[id], div[id="home"]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    document.querySelectorAll('.w-nav a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
}

// ── Mobile nav ────────────────────────────────────────────
function toggleMobileNav() {
  const nav = document.getElementById('w-mobile-nav');
  nav.classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('w-mobile-nav').classList.remove('open');
}

// ── Scroll reveal ─────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.w-reveal').forEach(el => obs.observe(el));
}

// ── Load doctors from API ─────────────────────────────────
async function loadDoctors() {
  try {
    const res = await fetch('/api/doctors');
    if (!res.ok) throw new Error('API');
    state.doctors = await res.json();
    renderDoctorsSection();
    renderDocList(state.doctors);
    populateSpecFilter();
    updateHeroStats();
  } catch {
    // Use fallback demo data if API is unreachable
    state.doctors = DEMO_DOCTORS;
    renderDoctorsSection();
    renderDocList(state.doctors);
    populateSpecFilter();
  }
}

const DEMO_DOCTORS = [
  { id: 1, full_name: 'Jasur Yusupov',     specialty: 'Kardiolog',                department: 'Kardiologiya',   available_status: 'Available' },
  { id: 2, full_name: 'Malika Karimova',    specialty: 'Klinik Nevropatolog',      department: 'Nevrologiya',    available_status: 'Available' },
  { id: 3, full_name: 'Bekzod Sattorov',    specialty: 'Dermatolog',               department: 'Dermatologiya',  available_status: 'Available' },
  { id: 4, full_name: 'Nilufar Tursunova',  specialty: 'Ortopediya Jarrohi',       department: 'Ortopediya',     available_status: 'Available' },
  { id: 5, full_name: 'Akmal Rashidov',     specialty: 'Umumiy Amaliyot Shifokori',department: 'Umumiy Amaliyot',available_status: 'Available' },
  { id: 6, full_name: 'Dilnoza Abdullaeva', specialty: 'Radiolog',                 department: 'Diagnostika',    available_status: 'Available' },
  { id: 7, full_name: 'Sherzod Mirzaev',    specialty: 'Yurak Elektrofiziologi',   department: 'Kardiologiya',   available_status: 'Off-duty' },
  { id: 8, full_name: 'Gulnora Hamidova',   specialty: 'Bolalar Nevropatologa',    department: 'Nevrologiya',    available_status: 'Available' },
];

function ini(name) { return (name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }

function updateHeroStats() {
  const avail = state.doctors.filter(d => d.available_status === 'Available').length;
  document.getElementById('stat-doctors').textContent = state.doctors.length + '+';
}

function renderDoctorsSection() {
  const grid = document.getElementById('doctors-grid');
  if (!grid) return;
  const show = state.doctors.slice(0, 8);
  grid.innerHTML = show.map(d => `
    <div class="w-doctor-card w-reveal">
      <div class="w-doctor-card-header">
        <div class="w-doctor-avatar">${ini(d.full_name)}</div>
        <div class="w-doctor-name">${d.full_name}</div>
        <div class="w-doctor-spec">${d.specialty}</div>
      </div>
      <div class="w-doctor-card-body">
        <span class="w-doctor-dept">${d.department}</span>
        <div class="w-doctor-avail">
          <div class="w-avail-dot ${d.available_status === 'Available' ? 'green' : 'gray'}"></div>
          <span style="font-size:12px;color:var(--w-gray-600)">${d.available_status === 'Available' ? 'Qabul qilmoqda' : 'Hozir qabul yo\'q'}</span>
        </div>
        <button class="w-btn w-btn-primary w-btn-sm" style="width:100%;justify-content:center"
          onclick="openBookingForDoctor(${d.id})">
          <i class="fas fa-calendar-plus"></i> Qabul yozish
        </button>
      </div>
    </div>`).join('');

  // Re-observe new elements
  document.querySelectorAll('.w-reveal:not(.visible)').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    obs.observe(el);
  });
}

function populateSpecFilter() {
  const sel = document.getElementById('doc-filter-spec');
  if (!sel) return;
  const specs = [...new Set(state.doctors.map(d => d.specialty))];
  sel.innerHTML = '<option value="">Barcha mutaxassisliklar</option>' +
    specs.map(s => `<option value="${s}">${s}</option>`).join('');
}

function renderDocList(docs) {
  const list = document.getElementById('doc-list');
  if (!list) return;
  if (docs.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--w-gray-400)">Shifokorlar topilmadi</div>';
    return;
  }
  list.innerHTML = docs.map(d => `
    <div class="w-doc-item ${state.selectedDoctor?.id === d.id ? 'selected' : ''}"
      onclick="selectDoctor(${d.id})" role="button" tabindex="0"
      onkeydown="if(event.key==='Enter')selectDoctor(${d.id})">
      <div class="w-doc-item-av">${ini(d.full_name)}</div>
      <div>
        <div class="w-doc-item-name">${d.full_name}</div>
        <div class="w-doc-item-spec">${d.specialty}</div>
        <div class="w-doc-item-dept">${d.department} · ${d.available_status === 'Available' ? '<span style="color:var(--w-green)">Mavjud</span>' : '<span style="color:var(--w-gray-400)">Qabul yo\'q</span>'}</div>
      </div>
      <div class="w-doc-item-check">✓</div>
    </div>`).join('');
}

function filterDocList(val) {
  const q    = (val ?? document.getElementById('doc-search')?.value ?? '').toLowerCase();
  const spec = document.getElementById('doc-filter-spec')?.value;
  const filtered = state.doctors.filter(d =>
    (!q    || d.full_name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)) &&
    (!spec || d.specialty === spec)
  );
  renderDocList(filtered);
}

function selectDoctor(id) {
  state.selectedDoctor = state.doctors.find(d => d.id === id);
  renderDocList(state.doctors.filter(d => {
    const q    = document.getElementById('doc-search')?.value?.toLowerCase() || '';
    const spec = document.getElementById('doc-filter-spec')?.value || '';
    return (!q || d.full_name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)) &&
           (!spec || d.specialty === spec);
  }));
}

// ── Booking Panel ─────────────────────────────────────────
function openBooking() {
  document.getElementById('w-booking-overlay').classList.add('open');
  document.getElementById('w-booking-panel').classList.add('open');
  document.body.style.overflow = 'hidden';
  goToStep(1);
}

function openBookingForDoctor(id) {
  state.selectedDoctor = state.doctors.find(d => d.id === id);
  openBooking();
  if (state.selectedDoctor) goToStep(2);
}

function closeBooking() {
  document.getElementById('w-booking-overlay').classList.remove('open');
  document.getElementById('w-booking-panel').classList.remove('open');
  document.body.style.overflow = '';
}

function resetBooking() {
  state.step = 1;
  state.selectedDoctor = null;
  state.selectedDate   = null;
  state.selectedTime   = null;
  goToStep(1);
  renderDocList(state.doctors);
}

// ── Stepper ───────────────────────────────────────────────
function goToStep(n) {
  state.step = n;
  // Hide all steps
  document.querySelectorAll('.w-step-content').forEach(el => el.classList.remove('active'));
  document.getElementById(n < 5 ? `step-${n}` : 'step-success').classList.add('active');

  // Update stepper indicators
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById(`step-ind-${i}`);
    if (!ind) continue;
    ind.classList.remove('active', 'done');
    if (i < n) ind.classList.add('done');
    if (i === n) ind.classList.add('active');
    ind.querySelector('.w-step-num').textContent = i < n ? '✓' : i;
  }

  // Footer buttons
  const back   = document.getElementById('btn-back');
  const next   = document.getElementById('btn-next');
  const footer = document.getElementById('booking-footer');

  if (n >= 5) { footer.style.display = 'none'; return; } else footer.style.display = '';

  back.style.display = n > 1 ? '' : 'none';
  const labels = { 1: 'Davom etish', 2: 'Sana tanlandi', 3: 'Vaqt tanlandi', 4: 'Qabul yozish' };
  next.innerHTML = (n < 4 ? `${labels[n] || 'Davom etish'} <i class="fas fa-arrow-right"></i>` : '<i class="fas fa-check"></i> Tasdiqlash');

  // Subtitles
  const subs = {
    1: 'Shifokor tanlang',
    2: 'Sana tanlang',
    3: 'Bo\'sh vaqtni belgilang',
    4: 'Ma\'lumotlar va tasdiqlash',
  };
  document.getElementById('booking-subtitle').textContent = subs[n] || '';

  // Step-specific init
  if (n === 2) renderCalendar();
  if (n === 3) loadSlots();
  if (n === 4) renderConfirmSummary();
}

function nextStep() {
  const n = state.step;
  if (n === 1) {
    if (!state.selectedDoctor) { wToast('Iltimos, shifokorni tanlang', 'error'); return; }
    goToStep(2);
  } else if (n === 2) {
    if (!state.selectedDate) { wToast('Iltimos, sanani tanlang', 'error'); return; }
    goToStep(3);
  } else if (n === 3) {
    if (!state.selectedTime) { wToast('Iltimos, vaqtni tanlang', 'error'); return; }
    goToStep(4);
  } else if (n === 4) {
    submitBooking();
  }
}

function prevStep() {
  if (state.step > 1) goToStep(state.step - 1);
}

// ── Calendar ──────────────────────────────────────────────
function renderCalendar() {
  const y = state.calYear, m = state.calMonth;
  document.getElementById('cal-month').textContent = `${MONTHS_UZ[m]} ${y}`;

  const first = new Date(y, m, 1).getDay(); // 0=Sun
  const days  = new Date(y, m + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  // Mon-first grid: shift Sunday (0) to 7
  const offset = (first === 0 ? 6 : first - 1);

  let html = DAYS_UZ.slice(1).concat(DAYS_UZ[0]).map(d =>
    `<div class="w-cal-day-name">${d}</div>`).join('');

  for (let i = 0; i < offset; i++) html += `<div class="w-cal-day empty"></div>`;

  for (let d = 1; d <= days; d++) {
    const date  = new Date(y, m, d);
    const isSun = date.getDay() === 0;
    const isPast= date < today;
    const isToday = date.getTime() === today.getTime();
    const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isSel = state.selectedDate === dateStr;

    let cls = 'w-cal-day';
    if (isSun || isPast) cls += ' disabled sunday';
    else if (isToday)     cls += ' today';
    if (isSel)            cls += ' selected';

    const onclick = (isSun || isPast) ? '' : `onclick="selectDate('${dateStr}')"`;
    html += `<div class="${cls}" ${onclick}>${d}</div>`;
  }

  document.getElementById('cal-grid').innerHTML = html;
}

function changeMonth(dir) {
  state.calMonth += dir;
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  if (state.calMonth < 0)  { state.calMonth = 11; state.calYear--; }
  renderCalendar();
}

function selectDate(dateStr) {
  state.selectedDate = dateStr;
  state.selectedTime = null;
  renderCalendar();
  const dateFmt = new Date(dateStr+'T00:00:00').toLocaleDateString('uz-UZ',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('btn-next').innerHTML = `${dateFmt} <i class="fas fa-arrow-right"></i>`;
}

// ── Slots ─────────────────────────────────────────────────
async function loadSlots() {
  const cont = document.getElementById('slots-container');
  const lbl  = document.getElementById('slots-date-label');
  if (lbl && state.selectedDate) {
    lbl.textContent = new Date(state.selectedDate+'T00:00:00').toLocaleDateString('uz-UZ',{weekday:'long',day:'numeric',month:'long'}) + ' · ' + (state.selectedDoctor?.full_name||'');
  }
  cont.innerHTML = '<div style="text-align:center;padding:20px;color:var(--w-gray-400)">Yuklanmoqda…</div>';

  // Generate all slots locally (fallback if API not available)
  const allSlots = generateAllSlots();
  let bookedSlots = [];

  try {
    const res = await fetch(`/api/doctors/${state.selectedDoctor.id}/slots?date=${state.selectedDate}`);
    if (res.ok) {
      const data = await res.json();
      if (!data.isWorkday) {
        cont.innerHTML = `<div class="w-alert-error">Bu kun qabul qabul qilinmaydi (dam olish kuni)</div>`;
        return;
      }
      bookedSlots = data.bookedSlots || [];
    }
  } catch {}

  const now    = new Date();
  const today  = now.toISOString().slice(0,10);
  const groups = {
    'Ertalab (08:00–12:00)': [],
    'Tushdan keyin (13:00–17:00)': [],
    'Kechqurun (17:00–20:00)': [],
  };

  allSlots.forEach(s => {
    const h = parseInt(s.split(':')[0]);
    if (h >= 12 && h < 13) return; // lunch – skip for available
    const isBooked = bookedSlots.includes(s);
    const isPast   = state.selectedDate === today && (() => {
      const [sh,sm] = s.split(':').map(Number);
      return sh * 60 + sm <= now.getHours() * 60 + now.getMinutes();
    })();
    const obj = { time: s, booked: isBooked || isPast };
    if (h < 12)       groups['Ertalab (08:00–12:00)'].push(obj);
    else if (h < 17)  groups['Tushdan keyin (13:00–17:00)'].push(obj);
    else              groups['Kechqurun (17:00–20:00)'].push(obj);
  });

  let html = '';
  for (const [label, list] of Object.entries(groups)) {
    if (list.length === 0) continue;
    html += `<div class="w-slots-section-title">${label}</div>`;
    html += `<div class="w-slots-row">`;
    html += list.map(s => {
      const isSel = state.selectedTime === s.time;
      const cls = s.booked ? 'booked' : (isSel ? 'selected' : '');
      const click = s.booked ? '' : `onclick="selectSlot('${s.time}')"`;
      return `<div class="w-slot ${cls}" ${click}>${s.time}</div>`;
    }).join('');
    html += `</div>`;
  }

  // Add lunch row info
  html += `<div class="w-slots-section-title">Tushlik (12:00–13:00)</div>`;
  html += `<div class="w-slots-row">`;
  ['12:00','12:30'].forEach(t => {
    html += `<div class="w-slot lunch" title="Tushlik tanaffusi">${t}</div>`;
  });
  html += `</div>`;

  cont.innerHTML = html || `<div class="w-alert-error">Mavjud vaqtlar topilmadi</div>`;
}

function generateAllSlots() {
  const slots = [];
  for (let h = 8; h < 20; h++) {
    if (h >= 12 && h < 13) continue;
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  return slots;
}

function selectSlot(time) {
  state.selectedTime = time;
  loadSlots(); // re-render with selection
  document.getElementById('btn-next').innerHTML = `${time} tanlandi <i class="fas fa-arrow-right"></i>`;
}

// ── Confirm summary ───────────────────────────────────────
function renderConfirmSummary() {
  const el = document.getElementById('confirm-summary');
  const dateStr = state.selectedDate
    ? new Date(state.selectedDate+'T00:00:00').toLocaleDateString('uz-UZ',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
    : '—';
  el.innerHTML = `
    <div style="font-size:13px;font-weight:600;color:var(--w-gray-700);margin-bottom:8px">📋 Qabul ma'lumotlari</div>
    <div class="w-confirm-row"><span>Shifokor:</span><b>${state.selectedDoctor?.full_name||'—'}</b></div>
    <div class="w-confirm-row"><span>Mutaxassislik:</span><b>${state.selectedDoctor?.specialty||'—'}</b></div>
    <div class="w-confirm-row"><span>Sana:</span><b>${dateStr}</b></div>
    <div class="w-confirm-row"><span>Vaqt:</span><b style="color:var(--w-primary)">${state.selectedTime||'—'}</b></div>`;

  // Check if already logged in
  fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(u => {
    const notice = document.getElementById('auth-notice');
    if (u?.id) {
      document.getElementById('b-name').value  = u.full_name || '';
      if (notice) notice.style.display = 'none';
    }
  }).catch(()=>{});
}

// ── Submit booking ────────────────────────────────────────
async function submitBooking() {
  const name  = document.getElementById('b-name').value.trim();
  const phone = document.getElementById('b-phone').value.trim();
  const email = document.getElementById('b-email').value.trim();
  const notes = document.getElementById('b-notes').value.trim();
  const alertEl = document.getElementById('booking-alert');
  alertEl.innerHTML = '';

  if (!name || !phone) {
    alertEl.innerHTML = `<div class="w-alert-error"><i class="fas fa-exclamation-circle"></i> Ism va telefon majburiy</div>`;
    return;
  }

  const btn = document.getElementById('btn-next');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuborilmoqda…';

  try {
    // Try to book via API (will require auth for /api/appointments)
    // First check if logged in
    const meRes = await fetch('/api/auth/me');
    let cookie = null;

    if (!meRes.ok) {
      // Auto-register as patient
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: phone.replace(/[^0-9]/g,'') + '_' + Date.now().toString(36).slice(-4),
          password: phone.replace(/[^0-9]/g,'').slice(-6) || 'pass123',
          full_name: name,
          phone,
        }),
      });
      if (!regRes.ok) {
        const err = await regRes.json();
        // If already registered just proceed
        if (!err.error?.includes('band')) throw new Error(err.error || 'Ro\'yxatdan o\'tishda xato');
      }
    }

    // Book appointment
    const aptRes = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        doctor_id:    state.selectedDoctor.id,
        date:         state.selectedDate,
        time:         state.selectedTime,
        notes:        notes,
        patient_name: name,
      }),
    });
    const aptData = await aptRes.json();
    if (!aptRes.ok) throw new Error(aptData.error || 'Qabul yozishda xato');

    // Show success
    const dateStr = new Date(state.selectedDate+'T00:00:00').toLocaleDateString('uz-UZ',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    document.getElementById('success-details').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--w-gray-500)">Shifokor:</span><b>${state.selectedDoctor.full_name}</b></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--w-gray-500)">Sana:</span><b>${dateStr}</b></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--w-gray-500)">Vaqt:</span><b style="color:var(--w-primary)">${state.selectedTime}</b></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--w-gray-500)">Bemor:</span><b>${name}</b></div>
      </div>`;
    document.getElementById('success-msg').textContent = `${name}, qabulingiz muvaffaqiyatli yozildi!`;
    goToStep(5);
    wToast('Qabul muvaffaqiyatli yozildi!', 'success');
  } catch(e) {
    alertEl.innerHTML = `<div class="w-alert-error"><i class="fas fa-exclamation-circle"></i> ${e.message}</div>`;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> Tasdiqlash';
  }
}

// ── Toast ─────────────────────────────────────────────────
function wToast(msg, type = '') {
  const wrap = document.getElementById('w-toasts');
  const el   = document.createElement('div');
  el.className = `w-toast ${type}`;
  el.innerHTML = `<i class="fas ${type==='success'?'fa-check-circle':type==='error'?'fa-exclamation-circle':'fa-info-circle'}"></i>${msg}`;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(()=>el.remove(), 300); }, 3500);
}
