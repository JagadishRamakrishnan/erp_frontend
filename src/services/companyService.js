import apiCall from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const companyService = {
  getAll: () => apiCall('/companies'),

  getById: (id) => apiCall(`/companies/${id}`),

  create: (data) => apiCall('/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiCall(`/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiCall(`/companies/${id}`, {
    method: 'DELETE',
  }),

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await fetch(`${API_BASE_URL}/companies/upload/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    return res.json();
  },
};

export default companyService;
