import apiCall from './api';

const serviceCatalogService = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/services${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: async (id) => {
    return await apiCall(`/services/${id}`);
  },

  getCategories: async () => {
    return await apiCall('/services/categories');
  },

  create: async (data) => {
    return await apiCall('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return await apiCall(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return await apiCall(`/services/${id}`, {
      method: 'DELETE',
    });
  },
};

export default serviceCatalogService;
