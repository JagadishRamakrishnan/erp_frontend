import apiCall from './api';

const reportsService = {
  // Get Reports Data
  getReports: async () => {
    return await apiCall('/reports');
  },
};

export default reportsService;
