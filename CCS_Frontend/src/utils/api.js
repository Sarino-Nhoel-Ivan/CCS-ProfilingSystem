const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ccs-profilingsystem-production.up.railway.app/api';

// ── In-memory cache ────────────────────────────────────────────────────────
// Stores fetched list data so switching tabs never re-fetches or shows blank.
// Mutations (create/update/delete) call cache.bust(key) to force a fresh load.
export const cache = {
  _store: {},
  get(key)       { return this._store[key]; },
  set(key, data) { this._store[key] = data; },
  bust(key)      { delete this._store[key]; },
  bustAll()      { this._store = {}; },
};

// Wraps a getAll fetch with cache-aside logic.
// Returns cached data immediately if available, otherwise fetches and caches.
const cachedGet = async (key, fetcher) => {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const data = await fetcher();
  cache.set(key, data);
  return data;
};

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  const config = { ...options, headers: { ...defaultHeaders, ...options.headers } };
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      // Laravel validation errors come back as { errors: { field: ['msg'] } }
      if (data?.errors) {
        const first = Object.values(data.errors).flat()[0];
        throw new Error(first || data.message || `Error ${response.status}`);
      }
      throw new Error(data?.message || `API Error: ${response.status} ${response.statusText}`);
    }
    return data;
  } catch (error) {
    console.error(`Fetch API Error on ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  students: {
    getAll: () => cachedGet('students', () => fetchApi('/students')),
    get: (id) => fetchApi(`/students/${id}`),
    create: (data) => { cache.bust('students'); return fetchApi('/students', { method: 'POST', body: JSON.stringify(data) }); },
    update: (id, data) => { cache.bust('students'); return fetchApi(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    delete: (id) => { cache.bust('students'); return fetchApi(`/students/${id}`, { method: 'DELETE' }); },
    advancedSearch: (filters) => fetchApi('/students/advanced-search', { method: 'POST', body: JSON.stringify(filters) }),

    // Medical Histories
    addMedical: (studentId, data) => fetchApi(`/students/${studentId}/medical-histories`, { method: 'POST', body: JSON.stringify(data) }),
    updateMedical: (studentId, medicalId, data) => fetchApi(`/students/${studentId}/medical-histories/${medicalId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMedical: (studentId, medicalId) => fetchApi(`/students/${studentId}/medical-histories/${medicalId}`, { method: 'DELETE' }),

    // Violations
    addViolation: (studentId, data) => fetchApi(`/students/${studentId}/violations`, { method: 'POST', body: JSON.stringify(data) }),
    updateViolation: (studentId, violationId, data) => fetchApi(`/students/${studentId}/violations/${violationId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteViolation: (studentId, violationId) => fetchApi(`/students/${studentId}/violations/${violationId}`, { method: 'DELETE' }),

    // Skills (full sync)
    syncSkills: (studentId, skills) => fetchApi(`/students/${studentId}/skills`, { method: 'PUT', body: JSON.stringify({ skills }) }),

    // Affiliations
    getAffiliations: (studentId) => fetchApi(`/students/${studentId}/affiliations`),
    addAffiliation: (studentId, data) => fetchApi(`/students/${studentId}/affiliations`, { method: 'POST', body: JSON.stringify(data) }),
    updateAffiliation: (studentId, affiliationId, data) => fetchApi(`/students/${studentId}/affiliations/${affiliationId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAffiliation: (studentId, affiliationId) => fetchApi(`/students/${studentId}/affiliations/${affiliationId}`, { method: 'DELETE' }),

    // Guardians
    getGuardians: (studentId) => fetchApi(`/students/${studentId}/guardians`),
    addGuardian: (studentId, data) => fetchApi(`/students/${studentId}/guardians`, { method: 'POST', body: JSON.stringify(data) }),
    updateGuardian: (studentId, guardianId, data) => fetchApi(`/students/${studentId}/guardians/${guardianId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteGuardian: (studentId, guardianId) => fetchApi(`/students/${studentId}/guardians/${guardianId}`, { method: 'DELETE' }),

    // Academic Histories
    getAcademicHistories: (studentId) => fetchApi(`/students/${studentId}/academic-histories`),
    addAcademicHistory: (studentId, data) => fetchApi(`/students/${studentId}/academic-histories`, { method: 'POST', body: JSON.stringify(data) }),
    updateAcademicHistory: (studentId, historyId, data) => fetchApi(`/students/${studentId}/academic-histories/${historyId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAcademicHistory: (studentId, historyId) => fetchApi(`/students/${studentId}/academic-histories/${historyId}`, { method: 'DELETE' }),

    // Profile Photo
    uploadPhoto: (studentId, file) => {
      const form = new FormData();
      form.append('photo', file);
      const token = localStorage.getItem('auth_token');
      return fetch(`${API_BASE_URL}/students/${studentId}/photo`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: form,
      }).then(async r => {
        const data = await r.json().catch(() => null);
        if (!r.ok) throw new Error(data?.message || 'Upload failed');
        return data;
      });
    },
  },
  departments: {
    getAll: () => fetchApi('/departments'),
  },
  courses: {
    getAll: () => fetchApi('/courses'),
  },
  faculties: {
    getAll: () => cachedGet('faculties', () => fetchApi('/faculties')),
    get: (id) => fetchApi(`/faculties/${id}`),
    create: (data) => { cache.bust('faculties'); return fetchApi('/faculties', { method: 'POST', body: JSON.stringify(data) }); },
    update: (id, data) => { cache.bust('faculties'); return fetchApi(`/faculties/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    delete: (id) => { cache.bust('faculties'); return fetchApi(`/faculties/${id}`, { method: 'DELETE' }); },
    uploadPhoto: (id, file) => {
      const form = new FormData();
      form.append('photo', file);
      const token = localStorage.getItem('auth_token');
      return fetch(`${API_BASE_URL}/faculties/${id}/photo`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: form,
      }).then(async r => {
        const data = await r.json().catch(() => null);
        if (!r.ok) throw new Error(data?.message || 'Upload failed');
        return data;
      });
    },
  },
  subjects: {
    getAll: () => cachedGet('subjects', () => fetchApi('/subjects')),
    get: (id) => fetchApi(`/subjects/${id}`),
    create: (data) => { cache.bust('subjects'); return fetchApi('/subjects', { method: 'POST', body: JSON.stringify(data) }); },
    update: (id, data) => { cache.bust('subjects'); return fetchApi(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    delete: (id) => { cache.bust('subjects'); return fetchApi(`/subjects/${id}`, { method: 'DELETE' }); },
  },
  sections: {
    getAll: () => cachedGet('sections', () => fetchApi('/sections')),
  },
  schedules: {
    getAll: () => cachedGet('schedules', () => fetchApi('/schedules')),
    get: (id) => fetchApi(`/schedules/${id}`),
    create: (data) => { cache.bust('schedules'); return fetchApi('/schedules', { method: 'POST', body: JSON.stringify(data) }); },
    update: (id, data) => { cache.bust('schedules'); return fetchApi(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    delete: (id) => { cache.bust('schedules'); return fetchApi(`/schedules/${id}`, { method: 'DELETE' }); },
  },
  events: {
    getAll: () => cachedGet('events', () => fetchApi('/events')),
    get: (id) => fetchApi(`/events/${id}`),
    create: (data) => { cache.bust('events'); return fetchApi('/events', { method: 'POST', body: JSON.stringify(data) }); },
    update: (id, data) => { cache.bust('events'); return fetchApi(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    delete: (id) => { cache.bust('events'); return fetchApi(`/events/${id}`, { method: 'DELETE' }); },
  },
  skills: {
    getAll: () => fetchApi('/skills'),
  },
  search: {
    query: (q) => fetchApi(`/search?query=${encodeURIComponent(q)}`),
  },
  auth: {
    changePassword: (data) => fetchApi('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  },
};
