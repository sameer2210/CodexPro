import api from '../../../api/config';

export const registerForContest = async (contestId) => {
  const res = await api.post(`/contests/${contestId}/register`);
  return res.data;
};

export const getContestDetails = async (contestId) => {
  const res = await api.get(`/contests/${contestId}`);
  return res.data?.data || res.data;
};

export const getContestLeaderboard = async (contestId) => {
  const res = await api.get(`/contests/${contestId}/leaderboard`);
  return res.data?.data || res.data || [];
};

export const submitContestSolution = async (contestId, problemId, payload) => {
  const res = await api.post(`/contests/${contestId}/problems/${problemId}/submit`, payload);
  return res.data;
};

export const createContest = async (contestData) => {
  const res = await api.post('/contests', contestData);
  return res.data;
};

export const getAllProblems = async () => {
  const res = await api.get('/problems');
  return res.data?.data || res.data || [];
};
