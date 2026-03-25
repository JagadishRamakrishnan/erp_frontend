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
      const response = await api(`/tasks/today`, { method: 'GET' });
      return response;
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      throw error;
    }
  },


    // ✅ Get today's activity
  getTodayActivities: async () => {
    try {
      const response = await api(`/activities/today`, { method: 'GET' });
      return response;
    } catch (error) {
      console.error("Error fetching today's activities:", error);
      throw error;
    }
  },


};

export default dashboardService;
