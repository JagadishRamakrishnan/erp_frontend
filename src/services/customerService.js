import apiCall from './api';

const customerService = {
  // Get all customers
  getAll: async () => {
    return await apiCall('/customers');
  },

  // Get customer by ID
  getById: async (id) => {
    return await apiCall(`/customers/${id}`);
  },

  // Create customer
  create: async (customerData) => {
    return await apiCall('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  // Update customer
  update: async (id, customerData) => {
    return await apiCall(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },

  // Delete customer
  delete: async (id) => {
    return await apiCall(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk Upload
  bulkUpload: async (formData) => {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    return await fetch(`${API_BASE_URL}/customers/bulk-upload`, {
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

export default customerService;
