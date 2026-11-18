import api from "../api/config";

export const dashboardService = {
  /**
   * Fetch team members for the given team name.
   * Backend endpoint: GET /api/auth/team/:teamName/members
   */
  async getTeamMembers(teamName) {
    if (!teamName) return [];
    try {
      const res = await api.get(`/auth/team/${teamName}/members`);
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },
};
