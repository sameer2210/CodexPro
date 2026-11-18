import api from "../../api/config";

export const fetchUserProfile = async () => {
  const res = await api.get("/user/getProfile");
  return res.data?.user || res.data?.data || res.data;
};

export const fetchProblemsSolved = async () => {
  const res = await api.get("/problem/problemsSolvedByUser");
  return res.data?.data || res.data || [];
};

export const fetchAllProblems = async () => {
  const res = await api.get("/problem/getAllProblems");
  return res.data?.problems || res.data?.data || res.data || [];
};

export const fetchUserStreaks = async () => {
  const res = await api.get("/user/streaks");
  return res.data?.data || res.data || { currentStreak: 0, maxStreak: 0 };
};

export const fetchUserBadges = async () => {
  const res = await api.get("/user/badges");
  return res.data?.data || res.data || [];
};

export const fetchUserRank = async () => {
  const res = await api.get("/user/rank");
  return res.data?.data || res.data || null;
};

export const fetchAllUserSubmissions = async () => {
  const res = await api.get("/user/submissions");
  return res.data?.submissions || res.data?.data || res.data || [];
};

export const fetchHeatmapData = async () => {
  const res = await api.get("/user/heatmap");
  return res.data?.data || res.data || {};
};
