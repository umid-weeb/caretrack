/* ═══════════════════════════════════════════════════════════
   CareTrack CRM – Layout Engine v2.0
   Collapsible sidebar + topbar + notifications
   ═══════════════════════════════════════════════════════════ */

// SVG icons inline
const ICONS = {
  /* ── Navigation ── */
  dashboard:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  doctors:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg>`,
  patients:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  diagnoses:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  appointments: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  reports:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  bell:         `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  logout:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  chevron:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  menu:         `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  check:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  close:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  profile:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,

  /* ── Actions ── */
  edit:         `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
  plus:         `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  download:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  filter:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  eye:          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  search:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,

  /* ── Contact ── */
  phone:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 0119.21 3.18 2 2 0 0121 2.16v3a2 2 0 01-1.45 1.93 16 16 0 00-3.39 1.39 15.83 15.83 0 00-5.67 5.67 16 16 0 00-1.39 3.39A2 2 0 0114.92 18.89"/></svg>`,
  mail:         `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  mapPin:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,

  /* ── Status ── */
  alertCircle:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  alertTriangle:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  checkCircle:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  clock:        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,

  /* ── Domain ── */
  hospital:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="10" y1="9" x2="14" y2="9"/></svg>`,
  activity:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  stethoscope:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3"/><path d="M8 15v1a6 6 0 006 6 6 6 0 006-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  clipboardList:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
  emergency:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  calendar:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>`,
  barChart:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>`,
  userCheck:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
};

// ── Nav menu per role ────────────────────────────────────────
const NAV_MENU = {
  admin: [
    { section: 'Ana sahifalar' },
    { href: '/dashboard.html',    icon: 'dashboard',    label: 'Boshqaruv paneli' },
    { section: 'Ma\'lumotlar' },
    { href: '/doctors.html',      icon: 'doctors',      label: 'Shifokorlar' },
    { href: '/patients.html',     icon: 'patients',     label: 'Bemorlar' },
    { href: '/diagnoses.html',    icon: 'diagnoses',    label: 'Tashxislar' },
    { href: '/appointments.html', icon: 'appointments', label: 'Qabullar' },
    { section: 'Tahlil' },
    { href: '/reports.html',      icon: 'reports',      label: 'Hisobotlar' },
  ],
  clinician: [
    { section: 'Bosh sahifalar' },
    { href: '/dashboard.html',    icon: 'dashboard',    label: 'Boshqaruv paneli' },
    { section: 'Klinik ish' },
    { href: '/patients.html',     icon: 'patients',     label: 'Bemorlar' },
    { href: '/diagnoses.html',    icon: 'diagnoses',    label: 'Tashxislar' },
    { href: '/appointments.html', icon: 'appointments', label: 'Navbat' },
  ],
  receptionist: [
    { section: 'Bosh sahifalar' },
    { href: '/dashboard.html',    icon: 'dashboard',    label: 'Boshqaruv paneli' },
    { section: 'Qabulxona' },
    { href: '/patients.html',     icon: 'patients',     label: 'Bemorlar' },
    { href: '/appointments.html', icon: 'appointments', label: 'Qabullar' },
    { href: '/doctors.html',      icon: 'doctors',      label: 'Shifokorlar' },
  ],
  patient: [
    { section: 'Mening sahifalarim' },
    { href: '/dashboard.html',    icon: 'dashboard',    label: 'Boshqaruv paneli' },
    { href: '/appointments.html', icon: 'appointments', label: 'Mening qabullarim' },
    { href: '/my-diagnoses.html', icon: 'diagnoses',    label: 'Mening tashxislarim' },
    { href: '/profile.html',      icon: 'profile',      label: 'Profilim' },
  ],
  // Profil barcha rollar uchun
  _shared: [
    { href: '/profile.html', icon: 'profile', label: 'Profilim' },
  ],
};

const ROLE_LABELS = { admin: 'Administrator', clinician: 'Klinitsist', receptionist: 'Qabulxona', patient: 'Bemor' };
const PAGE_TITLES = {
  '/dashboard.html':    'Boshqaruv paneli',
  '/doctors.html':      'Shifokorlar',
  '/patients.html':     'Bemorlar',
  '/diagnoses.html':    'Tashxislar',
  '/appointments.html': 'Qabullar',
  '/reports.html':      'Hisobotlar',
  '/my-diagnoses.html': 'Mening tashxislarim',
  '/profile.html':      'Profil',
};

// ── Main layout render ───────────────────────────────────────
async function renderLayout(activePage) {
  const user = await requireLogin();
  if (!user) return null;

  const collapsed = localStorage.getItem('ct-sidebar-collapsed') === '1';
  const sidebar   = document.getElementById('ct-sidebar');
  const main      = document.getElementById('ct-main');

  // Build sidebar
  const baseItems = (NAV_MENU[user.role] || NAV_MENU.patient);
  // Barcha rollar uchun Profil ni oxirga qo'shamiz (patient menyusida allaqachon bor)
  const items = user.role !== 'patient'
    ? [...baseItems, { section: 'Hisob' }, { href: '/profile.html', icon: 'profile', label: 'Profilim' }]
    : baseItems;
  const navHtml = items.map(item => {
    if (item.section) return `<div class="ct-nav-section">${item.section}</div>`;
    const isActive = activePage === item.href;
    return `<a href="${item.href}" class="ct-nav-link ${isActive ? 'active' : ''}" title="${item.label}">
      ${ICONS[item.icon] || ''}
      <span class="ct-nav-label">${item.label}</span>
    </a>`;
  }).join('');

  const initials = user.full_name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

  sidebar.innerHTML = `
    <div class="ct-brand">
      <div class="ct-brand-icon">🏥</div>
      <span class="ct-brand-name">CareTrack CRM</span>
    </div>
    <div class="ct-collapse-btn" id="collapseBtn" title="Yig'ish">${ICONS.chevron}</div>
    <nav class="ct-nav">${navHtml}</nav>
    <div class="ct-sidebar-footer">
      <div class="ct-user-avatar">${initials}</div>
      <div class="ct-user-info">
        <div class="ct-user-name">${user.full_name}</div>
        <div class="ct-user-role">${ROLE_LABELS[user.role]}</div>
      </div>
    </div>`;

  if (collapsed) { sidebar.classList.add('collapsed'); main.classList.add('expanded'); }

  // Collapse toggle
  document.getElementById('collapseBtn').addEventListener('click', () => {
    const col = sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded', col);
    localStorage.setItem('ct-sidebar-collapsed', col ? '1' : '0');
  });

  // Mobile sidebar
  const overlay = document.getElementById('ct-sidebar-overlay');
  const hamburger = document.getElementById('ct-hamburger');
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      overlay.classList.add('show');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('show');
    });
  }

  // Topbar
  const pageTitle = PAGE_TITLES[activePage] || 'CareTrack';
  let notifHtml = '';
  let unreadCount = 0;

  if (['admin','clinician','receptionist'].includes(user.role)) {
    try {
      const notifs = await API.getNotifs();
      unreadCount = notifs.filter(n => !n.read).length;
    } catch {}
    notifHtml = `
      <div style="position:relative" id="notifWrap">
        <button class="ct-notif-btn" id="notifBtn" title="Bildirishnomalar">
          ${ICONS.bell}
          ${unreadCount > 0 ? `<span class="ct-notif-count" id="notifCount">${unreadCount}</span>` : `<span class="ct-notif-count" id="notifCount" style="display:none">${unreadCount}</span>`}
        </button>
        <div class="ct-notif-dropdown" id="notifDropdown">
          <div class="ct-notif-header">
            <span style="font-size:13px;font-weight:600;color:var(--ct-gray-800)">Bildirishnomalar</span>
            <button class="ct-btn ct-btn-ghost ct-btn-sm" onclick="markAllNotifRead()" style="font-size:11px;padding:3px 6px">Barchasini o'qi</button>
          </div>
          <div id="notifList"><div class="ct-empty" style="padding:20px"><div class="ct-empty-text">Yuklanmoqda…</div></div></div>
        </div>
      </div>`;
  }

  document.getElementById('ct-topbar').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <button class="ct-hamburger" id="ct-hamburger">${ICONS.menu}</button>
      <div class="ct-breadcrumb">
        <span class="ct-breadcrumb-home">CareTrack</span>
        <span class="ct-breadcrumb-sep">›</span>
        <span class="ct-breadcrumb-current">${pageTitle}</span>
      </div>
    </div>
    <div class="ct-topbar-actions">
      ${notifHtml}
      <button class="ct-logout-btn" onclick="logout()">
        ${ICONS.logout} Chiqish
      </button>
    </div>`;

  // Re-wire hamburger after topbar render
  const ham2 = document.getElementById('ct-hamburger');
  if (ham2) {
    ham2.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      if (overlay) overlay.classList.add('show');
    });
  }

  // Notifications dropdown
  const nBtn = document.getElementById('notifBtn');
  if (nBtn) {
    nBtn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = document.getElementById('notifDropdown');
      dd.classList.toggle('open');
      if (dd.classList.contains('open')) loadNotifDropdown(user);
    });
    document.addEventListener('click', e => {
      const dd = document.getElementById('notifDropdown');
      if (dd && !document.getElementById('notifWrap')?.contains(e.target)) {
        dd.classList.remove('open');
      }
    });
  }

  applyRoleVisibility(user);
  return user;
}

// ── Load notification list ───────────────────────────────────
async function loadNotifDropdown(user) {
  const list = document.getElementById('notifList');
  if (!list) return;
  try {
    const notifs = await API.getNotifs();
    if (notifs.length === 0) {
      list.innerHTML = `<div class="ct-empty" style="padding:20px"><div class="ct-empty-icon">🔔</div><div class="ct-empty-text">Bildirishnomalar yo'q</div></div>`;
      return;
    }
    list.innerHTML = notifs.slice(0,10).map(n => `
      <div class="ct-notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead(${n.id}, this)">
        <div style="font-size:18px;flex-shrink:0">📅</div>
        <div class="ct-notif-body">
          <div class="ct-notif-msg">${n.message}</div>
          <div class="ct-notif-time">${timeAgo(n.created_at)}</div>
        </div>
        ${!n.read ? `<button class="ct-btn ct-btn-ghost ct-btn-sm" style="flex-shrink:0;padding:4px 6px" onclick="markNotifRead(${n.id}, this.closest('.ct-notif-item'))">${ICONS.check}</button>` : ''}
      </div>`).join('');
  } catch(e) {
    list.innerHTML = `<div class="ct-empty" style="padding:20px"><div class="ct-empty-text">${e.message}</div></div>`;
  }
}

async function markNotifRead(id, el) {
  try {
    await API.readNotif(id);
    if (el) { el.classList.remove('unread'); el.querySelector('.ct-btn-ghost')?.remove(); }
    const cnt = document.getElementById('notifCount');
    if (cnt) {
      const v = Math.max(0, parseInt(cnt.textContent || '0') - 1);
      cnt.textContent = v;
      cnt.style.display = v > 0 ? '' : 'none';
    }
  } catch {}
}

async function markAllNotifRead() {
  try {
    await API.readAllNotifs();
    document.querySelectorAll('.ct-notif-item.unread').forEach(el => {
      el.classList.remove('unread');
      el.querySelector('.ct-btn-ghost')?.remove();
    });
    const cnt = document.getElementById('notifCount');
    if (cnt) { cnt.textContent = '0'; cnt.style.display = 'none'; }
  } catch {}
}

// ── Helpers ──────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Hozir';
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return new Date(dateStr).toLocaleDateString('uz-UZ');
}

function toast(msg, type = 'default') {
  let wrap = document.getElementById('ct-toasts');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'ct-toasts';
    wrap.className = 'ct-toast-wrap';
    document.body.appendChild(wrap);
  }
  const icons = { default: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `ct-toast ${type !== 'default' ? `ct-toast-${type}` : ''}`;
  el.innerHTML = `<span class="ct-toast-icon">${icons[type] || icons.default}</span>${msg}`;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

// Drawer helpers
function openDrawer(id) {
  document.getElementById(id + '-overlay').classList.add('open');
  document.getElementById(id).classList.add('open');
}

function closeDrawer(id) {
  document.getElementById(id + '-overlay').classList.remove('open');
  document.getElementById(id).classList.remove('open');
}

function initDrawer(id) {
  const overlay = document.getElementById(id + '-overlay');
  if (overlay) overlay.addEventListener('click', () => closeDrawer(id));
}

// Load client socket hook for authenticated pages
(function () {
  try {
    const s = document.createElement('script');
    s.src = '/js/socket.js';
    document.head.appendChild(s);
  } catch (e) {}
})();
