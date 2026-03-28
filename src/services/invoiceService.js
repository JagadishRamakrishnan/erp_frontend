import apiCall from './api';

const invoiceService = {
  // Get all invoices
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/invoices${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get invoice by ID
  getById: async (id) => {
    return await apiCall(`/invoices/${id}`);
  },

  // Create invoice
  create: async (invoiceData) => {
    return await apiCall('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  },

  // Update invoice
  update: async (id, invoiceData) => {
    return await apiCall(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  },

  // Delete invoice
  delete: async (id) => {
    return await apiCall(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },

  // Generate invoice from quotation
  generateFromQuotation: async (quotationId) => {
    return await apiCall('/invoices/generate-from-quotation', {
      method: 'POST',
      body: JSON.stringify({ quotationId }),
    });
  },
};

export default invoiceService;
