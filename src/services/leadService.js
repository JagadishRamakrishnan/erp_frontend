import apiCall from './api';

const leadService = {
  // Get all leads
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/leads${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get lead by ID
  getById: async (id) => {
    return await apiCall(`/leads/${id}`);
  },

  // Create lead
  create: async (leadData) => {
    return await apiCall('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  // Update lead
  update: async (id, leadData) => {
    return await apiCall(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  },

  // Delete lead
  delete: async (id) => {
    return await apiCall(`/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // Convert lead to customer
  convertToCustomer: async (id) => {
    return await apiCall(`/leads/${id}/convert`, {
      method: 'POST',
    });
  },

  // Bulk Upload
  bulkUpload: async (formData) => {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-be-giqy.onrender.com/api';
    
    return await fetch(`${API_BASE_URL}/leads/bulk-upload`, {
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

export default leadService;
