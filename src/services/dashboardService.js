import api from './api';

const dashboardService = {
  // Get all dashboard statistics
  getStats: async () => {
    try {
      const response = await api('/dashboard/stats', {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  },

    // ✅ Get today's tasks
  getTodayTasks: async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const response = await api(`/tasks?due_date=${today}`, { method: 'GET' });
      return response;
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      throw error;
    }
  }
};

export default dashboardService;
