import api from "../../api/config";

export const requestEmailVerificationOTP = async (email) => {
  const res = await api.post("/user/requestEmailVerificationOTP", { email });
  return res.data;
};

export const verifyEmailOTP = async (email, otp) => {
  const res = await api.post("/user/verifyEmailOTP", { email, otp });
  return res.data;
};

export const getUserProfile = async () => {
  const res = await api.get("/user/getProfile");
  return res.data?.user || res.data?.data || res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await api.put("/user/updateProfile", profileData);
  return res.data;
};

export const changePassword = async (passwordData) => {
  const res = await api.post("/user/changePassword", passwordData);
  return res.data;
};
