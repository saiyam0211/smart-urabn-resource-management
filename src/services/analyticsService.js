import api from "../utils/api"; // Your axios configuration

const analyticsService = {
  getAnalytics: async () => {
    try {
      const response = await api.get("/api/analytics");
      return response.data;
    } catch (error) {
      console.error("Fetching analytics error:", error);
      throw error;
    }
  },
};

export default analyticsService;
