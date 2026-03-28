import apiCall from './api';

const quotationService = {
  // Get all quotations
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/quotations${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get quotation by ID
  getById: async (id) => {
    return await apiCall(`/quotations/${id}`);
  },

  // Create quotation
  create: async (quotationData) => {
    return await apiCall('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotationData),
    });
  },

  // Update quotation
  update: async (id, quotationData) => {
    return await apiCall(`/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quotationData),
    });
  },

  // Delete quotation
  delete: async (id) => {
    return await apiCall(`/quotations/${id}`, {
      method: 'DELETE',
    });
  },

  // Generate quotation from service template
  generateFromTemplate: async (data) => {
    return await apiCall('/quotations/generate-from-template', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default quotationService;
