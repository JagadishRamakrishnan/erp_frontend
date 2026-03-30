import apiCall from './api';

const reportsService = {
  // Get Reports Data
  getReports: async () => {
    return await apiCall('/reports');
  },

  export: async (type) => {
    return await apiCall(`/reports/export?type=${type}`, { responseType: 'blob' });
  },
};

export default reportsService;
