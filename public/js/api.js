function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(Array.from(atob(base64)).map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  return !!payload?.exp && Date.now() / 1000 >= payload.exp;
}

// Central fetch wrapper — all API calls go through here
const API = {
  async request(method, url, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('ct-token');
    if (token) {
      if (isTokenExpired(token)) localStorage.removeItem('ct-token');
      else headers.Authorization = `Bearer ${token}`;
    }
    const opts = {
      method,
      headers,
      credentials: 'same-origin',
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    // Allow an optional global API base URL (set by hosting env or inline script)
    const base = (typeof window !== 'undefined' && window.API_BASE_URL)
      ? window.API_BASE_URL.replace(/\/$/, '')
      : 'https://caretrack-crm.onrender.com';
    const fullUrl = base + url;
    const res = await fetch(fullUrl, opts);
    const data = res.headers.get('content-type')?.includes('json') ? await res.json() : {};
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },
  get:    (url)        => API.request('GET',    url),
  post:   (url, body)  => API.request('POST',   url, body),
  put:    (url, body)  => API.request('PUT',    url, body),
  delete: (url)        => API.request('DELETE', url),

  // Auth
  me:       ()         => API.get('/api/auth/me'),
  login:    (d)        => API.post('/api/auth/login', d),
  logout:   ()         => API.post('/api/auth/logout'),
  register: (d)        => API.post('/api/auth/register', d),

  // Doctors
  getDoctors:    ()    => API.get('/api/doctors'),
  getDoctor:     (id)  => API.get(`/api/doctors/${id}`),
  createDoctor:  (d)   => API.post('/api/doctors', d),
  updateDoctor:  (id,d)=> API.put(`/api/doctors/${id}`, d),
  deleteDoctor:  (id)  => API.delete(`/api/doctors/${id}`),
  getDoctorSlots:(id,dt)=> API.get(`/api/doctors/${id}/slots?date=${dt}`),

  // Patients
  getPatients:   (q)   => API.get('/api/patients' + (q ? '?' + new URLSearchParams(q) : '')),
  getPatient:    (id)  => API.get(`/api/patients/${id}`),
  getProfile:    (id)  => API.get(`/api/patients/${id}/profile`),
  createPatient: (d)   => API.post('/api/patients', d),
  updatePatient: (id,d)=> API.put(`/api/patients/${id}`, d),
  deletePatient: (id)  => API.delete(`/api/patients/${id}`),

  // Diagnoses
  getDiagnoses:    (q)   => API.get('/api/diagnoses' + (q ? '?' + new URLSearchParams(q) : '')),
  getDiagnosis:    (id)  => API.get(`/api/diagnoses/${id}`),
  getMyDiagnoses:  ()    => API.get('/api/diagnoses/my'),
  createDiagnosis: (d)   => API.post('/api/diagnoses', d),
  updateDiagnosis: (id,d)=> API.put(`/api/diagnoses/${id}`, d),
  deleteDiagnosis: (id)  => API.delete(`/api/diagnoses/${id}`),

  // Appointments
  getAppointments:()   => API.get('/api/appointments'),
  createAppointment:(d)=> API.post('/api/appointments', d),
  updateAptStatus:(id,s)=>API.put(`/api/appointments/${id}/status`, { status: s }),
  cancelApt:     (id)  => API.delete(`/api/appointments/${id}`),
  getQueue:      ()    => API.get('/api/appointments/clinician/queue'),

  // Notifications
  getNotifs:     ()    => API.get('/api/notifications'),
  readNotif:     (id)  => API.put(`/api/notifications/${id}/read`),
  readAllNotifs: ()    => API.put('/api/notifications/read-all'),

  // Reports
  getSummary:    ()    => API.get('/api/reports/summary'),
};
