import api from '../../api/config';

export const getPlatformStats = async () => {
  const res = await api.get('/admin/platform-stats');
  return res.data?.data || res.data;
};

export const getAllUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params });
  return res.data?.data || res.data || [];
};

export const getUserAnalytics = async () => {
  const res = await api.get('/admin/user-analytics');
  return res.data?.data || res.data;
};

export const banUser = async (userId) => {
  const res = await api.put(`/admin/users/${userId}/ban`);
  return res.data;
};

export const unbanUser = async (userId) => {
  const res = await api.put(`/admin/users/${userId}/unban`);
  return res.data;
};

export const updateAllUsersProfileImages = async () => {
  const res = await api.post('/admin/users/update-profile-images');
  return res.data;
};
