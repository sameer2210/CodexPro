import express from 'express';
import adminRegister from '../controllers/adminAuthenticate.js';
import dashboardController from '../controllers/dashboardController.js';
import {
  activeUsers,
  deleteProfile,
  getAllUsers,
  getPlatformStats,
  getProfile,
  googleLogin,
  login,
  logout,
  register,
  updateAllProfileImages,
  updateProfile,
} from '../controllers/userAuthenticate.js';
import { signupWithVerification, verifySignupOTP } from '../controllers/userSignupVerification.js';
import {
  changePassword,
  requestEmailVerificationOTP,
  requestPasswordResetOTP,
  resetPassword,
  verifyEmailOTP,
} from '../controllers/userVerification.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { userMiddleware } from '../middlewares/userMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.get('/getProfile', userMiddleware, getProfile);
authRouter.put('/updateProfile', userMiddleware, updateProfile);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/activeuser', adminMiddleware, activeUsers);
authRouter.get('/users', adminMiddleware, getAllUsers);
authRouter.get('/platform-stats', adminMiddleware, getPlatformStats);
authRouter.put('/admin/update-all-profile-images', adminMiddleware, updateAllProfileImages);

authRouter.post('/googleLogin', googleLogin);

authRouter.post('/requestEmailVerificationOTP', requestEmailVerificationOTP);
authRouter.post('/verifyEmailOTP', verifyEmailOTP);

authRouter.post('/signupWithVerification', signupWithVerification);
authRouter.post('/verifySignupOTP', verifySignupOTP);
authRouter.post('/forgot-password', requestPasswordResetOTP);
authRouter.post('/reset-password/:token', resetPassword);
authRouter.post('/changePassword', userMiddleware, changePassword);

authRouter.get('/streaks', userMiddleware, dashboardController.getUserStreaks);
authRouter.get('/badges', userMiddleware, dashboardController.getUserBadges);
authRouter.get('/rank', userMiddleware, dashboardController.getUserRank);
authRouter.get('/submissions', userMiddleware, dashboardController.getAllUserSubmissions);
authRouter.get('/heatmap', userMiddleware, dashboardController.getHeatmapData);

authRouter.get('/check', userMiddleware, (req, res) => {
  try {
    const reply = {
      firstName: req.result.firstName,
      emailId: req.result.emailId,
      _id: req.result._id,
      role: req.result.role,
      profileImage: req.result.profileImage || null,
    };

    res.status(200).json({
      user: reply,
      message: 'Valid User',
    });
  } catch (err) {
    res.status(500).send(' Error Occurred ' + err.message);
  }
});

export default authRouter;
