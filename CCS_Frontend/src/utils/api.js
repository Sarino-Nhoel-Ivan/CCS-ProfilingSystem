const API_BASE_URL = 'http://localhost:8000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
    getAll: () => fetchApi('/students'),
    get: (id) => fetchApi(`/students/${id}`),
    create: (data) => fetchApi('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/students/${id}`, { method: 'DELETE' }),
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
      return fetch(`${API_BASE_URL}/students/${studentId}/photo`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
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
    getAll: () => fetchApi('/faculties'),
    get: (id) => fetchApi(`/faculties/${id}`),
    create: (data) => fetchApi('/faculties', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/faculties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/faculties/${id}`, { method: 'DELETE' }),
  },
  subjects: {
    getAll: () => fetchApi('/subjects'),
    get: (id) => fetchApi(`/subjects/${id}`),
    create: (data) => fetchApi('/subjects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/subjects/${id}`, { method: 'DELETE' }),
  },
  sections: {
    getAll: () => fetchApi('/sections'),
  },
  schedules: {
    getAll: () => fetchApi('/schedules'),
    get: (id) => fetchApi(`/schedules/${id}`),
    create: (data) => fetchApi('/schedules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/schedules/${id}`, { method: 'DELETE' }),
  },
  events: {
    getAll: () => fetchApi('/events'),
    get: (id) => fetchApi(`/events/${id}`),
    create: (data) => fetchApi('/events', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/events/${id}`, { method: 'DELETE' }),
  },
  skills: {
    getAll: () => fetchApi('/skills'),
  },
  search: {
    query: (q) => fetchApi(`/search?query=${encodeURIComponent(q)}`),
  },
};
