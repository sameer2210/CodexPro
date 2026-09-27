import api from '../../api/config';

export const fetchUserProfile = async () => {
  const res = await api.get('/user/profile');
  return res.data?.data || res.data;
};

export const fetchProblemsSolved = async () => {
  const res = await api.get('/user/problems-solved');
  return res.data?.data || res.data || [];
};

export const fetchAllProblems = async () => {
  const res = await api.get('/problems');
  return res.data?.data || res.data || [];
};

export const fetchUserStreaks = async () => {
  const res = await api.get('/user/streaks');
  return res.data?.data || res.data || { currentStreak: 0, maxStreak: 0 };
};

export const fetchUserBadges = async () => {
  const res = await api.get('/user/badges');
  return res.data?.data || res.data || [];
};

export const fetchUserRank = async () => {
  const res = await api.get('/user/rank');
  return res.data?.data || res.data || null;
};

export const fetchAllUserSubmissions = async () => {
  const res = await api.get('/submissions/user');
  return res.data?.data || res.data || [];
};

export const fetchHeatmapData = async () => {
  const res = await api.get('/user/heatmap');
  return res.data?.data || res.data || {};
};
