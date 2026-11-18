import api from "../../../api/config";

export const registerForContest = async (contestId) => {
  const res = await api.post(`/contest/${contestId}/register`);
  return res.data;
};

export const getContestDetails = async (contestId) => {
  const res = await api.get(`/contest/${contestId}`);
  return res.data?.contest || res.data?.data || res.data;
};

export const getContestLeaderboard = async (contestId) => {
  const res = await api.get(`/contest/${contestId}/leaderboard`);
  return res.data?.data || res.data || [];
};

export const submitContestSolution = async (contestId, problemId, payload) => {
  const res = await api.post(
    `/contest/${contestId}/problem/${problemId}/submit`,
    payload,
  );
  return res.data;
};

export const createContest = async (contestData) => {
  const res = await api.post("/contest/create", contestData);
  return res.data;
};

export const getAllProblems = async () => {
  const res = await api.get("/contest/problems");
  return res.data?.problems || res.data?.data || res.data || [];
};

export const getAllContests = async () => {
  const res = await api.get("/contest");
  return res.data;
};

export const updateContest = async (id, contestData) => {
  const res = await api.put(`/contest/update/${id}`, contestData);
  return res.data;
};

export const deleteContest = async (id) => {
  const res = await api.delete(`/contest/delete/${id}`);
  return res.data;
};
