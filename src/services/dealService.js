import apiCall from './api';

const dealService = {
  // Get all deals
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/deals${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get deal by ID
  getById: async (id) => {
    return await apiCall(`/deals/${id}`);
  },

  // Create deal
  create: async (dealData) => {
    return await apiCall('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    });
  },

  // Update deal
  update: async (id, dealData) => {
    return await apiCall(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealData),
    });
  },

  // Delete deal
  delete: async (id) => {
    return await apiCall(`/deals/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk Upload
  bulkUpload: async (formData) => {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    return await fetch(`${API_BASE_URL}/deals/bulk-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      return data;
    });
  },
};

export default dealService;
