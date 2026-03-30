import apiCall from './api';

const ticketService = {
  // Get all tickets
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/tickets${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get ticket by ID
  getById: async (id) => {
    return await apiCall(`/tickets/${id}`);
  },

  // Create ticket
  create: async (ticketData) => {
    return await apiCall('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  // Update ticket
  update: async (id, ticketData) => {
    return await apiCall(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
  },

  // Delete ticket
  delete: async (id) => {
    return await apiCall(`/tickets/${id}`, {
      method: 'DELETE',
    });
  },

  addComment: async (id, commentData) => {
    return await apiCall(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },
};

export default ticketService;
