import api from "../../api/config";

export const getPlatformStats = async () => {
  const res = await api.get("/user/platform-stats");
  return res.data?.stats || res.data?.data || res.data;
};

export const getAllUsers = async (params = {}) => {
  const res = await api.get("/user/users", { params });
  return res.data || [];
};

export const getUserAnalytics = async () => {
  const res = await api.get("/user/platform-stats");
  return res.data?.stats || res.data?.data || res.data;
};

export const getActiveUserCount = async () => {
  const res = await api.get("/user/activeuser");
  return res.data?.count || 0;
};

export const updateAllUsersProfileImages = async () => {
  const res = await api.put("/user/admin/update-all-profile-images");
  return res.data;
};
