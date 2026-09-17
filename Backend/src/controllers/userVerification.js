import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import validator from 'validator';
import redisWrapper from '../config/redis.js';
import User from '../models/user.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const OTP_RATE_LIMIT = {
  windowMs: 10 * 60 * 1000,
  max: 5,
};

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendOTPEmail(email, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[DEV MODE] Verification OTP for ${email}: ${otp}`);
    return;
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for CodeX Verification',
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
    html: `<p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
}

export const requestEmailVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const rateLimitKey = `rate_limit:otp:${email}`;
    const currentCount = parseInt((await redisWrapper.get(rateLimitKey)) || '0');

    if (currentCount >= OTP_RATE_LIMIT.max) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.',
      });
    }

    const user = await User.findOne({ emailId: email.toLowerCase() });
    if (user && user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    const otp = generateOTP();

    await redisWrapper.set(`otp:${email.toLowerCase()}`, otp);
    await redisWrapper.expire(`otp:${email.toLowerCase()}`, 600);

    const newCount = currentCount + 1;
    await redisWrapper.set(rateLimitKey, newCount);
    await redisWrapper.expire(rateLimitKey, OTP_RATE_LIMIT.windowMs / 1000);

    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
    });
  } catch (error) {
    console.error('Error in requestEmailVerificationOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
    });
  }
};

export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    const storedOTP = await redisWrapper.get(`otp:${email.toLowerCase()}`);
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found',
      });
    }

    if (storedOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    let user = await User.findOne({ emailId: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    } else {
      user.emailVerified = true;
    }

    await user.save();
    await redisWrapper.del(`otp:${email.toLowerCase()}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        emailId: user.emailId,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Error in verifyEmailOTP:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
    });
  }
};

export const requestPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const user = await User.findOne({ emailId: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request for CodeX',
        text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset. Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
      };
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV MODE] Password reset link for ${email}: ${resetLink}`);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
    });
  } catch (error) {
    console.error('Error in requestPasswordResetOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset link',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be same as old password',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.result._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old and new passwords are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be same as old password',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};

export default {
  requestEmailVerificationOTP,
  verifyEmailOTP,
  requestPasswordResetOTP,
  resetPassword,
  changePassword,
};
