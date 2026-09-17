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

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendOTPEmail(email, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
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

export const signupWithVerification = async (req, res) => {
  try {
    const { firstName, emailId, password, confirmPassword } = req.body;

    if (!firstName || !emailId || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!validator.isEmail(emailId)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        const otp = generateOTP();
        await redisWrapper.set(`otp:${emailId.toLowerCase()}`, otp);
        await redisWrapper.expire(`otp:${emailId.toLowerCase()}`, 300);
        await sendOTPEmail(emailId, otp);
        return res.status(200).json({
          success: true,
          message: 'User already registered but not verified. New OTP sent to email for verification.',
          user: {
            _id: existingUser._id,
            firstName: existingUser.firstName,
            emailId: existingUser.emailId,
            emailVerified: existingUser.emailVerified,
          },
        });
      } else {
        return res.status(400).json({ success: false, message: 'User with this email already exists and is verified' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tempUserData = {
      firstName,
      emailId: emailId.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      emailVerified: false,
    };
    await redisWrapper.set(`pending_signup:${emailId.toLowerCase()}`, JSON.stringify(tempUserData));
    await redisWrapper.expire(`pending_signup:${emailId.toLowerCase()}`, 300);

    const otp = generateOTP();
    await redisWrapper.set(`otp:${emailId.toLowerCase()}`, otp);
    await redisWrapper.expire(`otp:${emailId.toLowerCase()}`, 300);

    await sendOTPEmail(emailId, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for verification. Please complete the verification to create your account.',
      needsVerification: true,
      email: emailId,
    });
  } catch (error) {
    console.error('Error in signupWithVerification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'OTP must be 6 digits' });
    }

    const storedOTP = await redisWrapper.get(`otp:${email.toLowerCase()}`);
    if (!storedOTP) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }
    if (storedOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const pendingUserDataString = await redisWrapper.get(`pending_signup:${email.toLowerCase()}`);
    if (!pendingUserDataString) {
      return res.status(400).json({
        success: false,
        message: 'Signup session expired or not found. Please try signing up again.',
      });
    }

    const pendingUserData = JSON.parse(pendingUserDataString);

    let user = await User.findOne({ emailId: email.toLowerCase() });
    if (user) {
      if (user.emailVerified) {
        await redisWrapper.del(`otp:${email.toLowerCase()}`);
        await redisWrapper.del(`pending_signup:${email.toLowerCase()}`);
        return res.status(200).json({
          success: true,
          message: 'Email already verified. Logging in.',
          user: {
            _id: user._id,
            firstName: user.firstName,
            emailId: user.emailId,
            emailVerified: user.emailVerified,
            role: user.role,
          },
          token: jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: 604800 }
          ),
        });
      } else {
        user.emailVerified = true;
        await user.save();
      }
    } else {
      user = new User({
        firstName: pendingUserData.firstName,
        emailId: pendingUserData.emailId,
        password: pendingUserData.password,
        role: pendingUserData.role,
        emailVerified: true,
      });
      await user.save();
    }

    await redisWrapper.del(`otp:${email.toLowerCase()}`);
    await redisWrapper.del(`pending_signup:${email.toLowerCase()}`);

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: 604800 }
    );

    res.cookie('token', token, {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Account created and logged in.',
      user: {
        _id: user._id,
        firstName: user.firstName,
        emailId: user.emailId,
        emailVerified: user.emailVerified,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    console.error('Error in verifySignupOTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default {
  signupWithVerification,
  verifySignupOTP,
};
