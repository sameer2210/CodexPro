import api from '../../api/config';

export const requestEmailVerificationOTP = async () => {
  const res = await api.post('/auth/send-verification-otp');
  return res.data;
};

export const verifyEmailOTP = async (otp) => {
  const res = await api.post('/auth/verify-email', { otp });
  return res.data;
};

export const getUserProfile = async () => {
  const res = await api.get('/user/profile');
  return res.data?.data || res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await api.put('/user/profile', profileData);
  return res.data;
};

export const changePassword = async (passwordData) => {
  const res = await api.put('/auth/change-password', passwordData);
  return res.data;
};
