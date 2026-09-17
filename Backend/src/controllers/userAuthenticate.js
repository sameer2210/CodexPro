import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import redisWrapper from '../config/redis.js';
import Contest from '../models/contest.js';
import Problem from '../models/problem.js';
import Submission from '../models/submission.js';
import User from '../models/user.js';
import { generateProfileImage } from '../services/profileImageGenerator.js';
import validate from '../services/validator.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Only images are allowed (jpeg, jpg, png)'));
  },
}).single('profileImage');

export const register = async (req, res) => {
  try {
    const { firstName, emailId, password, confirmPassword } = req.body;

    if (!firstName || !emailId || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      emailId: emailId.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
    });

    if (!newUser.profileImage) {
      const imageUrl = await generateProfileImage(newUser.firstName, newUser._id);
      newUser.profileImage = imageUrl;
    }

    await newUser.save();

    const token = jwt.sign(
      { _id: newUser._id, emailId: newUser.emailId, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: 604800 }
    );
    res.cookie('token', token, {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        emailId: newUser.emailId,
        emailVerified: newUser.emailVerified,
        profileImage: newUser.profileImage,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) throw new Error('Credentials Missing');

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(403).json({ success: false, message: 'Error Invalid Credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.',
        needsVerification: true,
        email: emailId,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(403).json({ success: false, message: 'Error Invalid Credentials' });
    }

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: 604800 }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    res.status(200).json({ user: reply, token, message: 'Logged In Successfully' });
  } catch (err) {
    res.status(403).json({ success: false, message: 'Error ' + err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.token || req.query?.token;
    if (token) {
      await redisWrapper.set(`token:${token}`, 'Blocked');
      const payload = jwt.decode(token);
      if (payload?.exp) {
        await redisWrapper.expireAt(`token:${token}`, payload.exp);
      }
    }

    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ success: true, message: 'User Logged Out Successfully' });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Error: ' + err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId)
      .populate({
        path: 'problemSolved',
        select: 'title difficulty tags createdAt',
        options: { sort: { createdAt: -1 }, limit: 5 },
      })
      .select('-password -confirmPassword -__v');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const problemStats = (user.problemSolved || []).reduce(
      (acc, problem) => {
        acc.total++;
        if (problem?.difficulty && acc[problem.difficulty] !== undefined) {
          acc[problem.difficulty]++;
        }
        return acc;
      },
      { total: 0, easy: 0, medium: 0, hard: 0 }
    );

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName || '',
        age: user.age || '',
        emailId: user.emailId,
        role: user.role,
        createdAt: user.createdAt,
        problemStats,
        recentSubmissions: user.problemSolved,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        socialLinks: user.socialLinks || {},
        streak: user.streak || 0,
        isPremium: user.isPremium,
        tokensLeft: user.tokensLeft,
        paymentHistory: user.paymentHistory || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const userId = req.result._id;
      const updateData = { ...req.body };

      if (req.file) {
        const uploadToCloudinary = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'profileImages',
                public_id: userId.toString(),
                overwrite: true,
              },
              (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(req.file.buffer);
          });
        };
        const result = await uploadToCloudinary();
        updateData.profileImage = result.secure_url;
      }

      if (updateData.socialLinks) {
        try {
          if (typeof updateData.socialLinks === 'string') {
            updateData.socialLinks = JSON.parse(updateData.socialLinks);
          }
        } catch (e) {
          return res.status(400).json({ error: 'Invalid socialLinks format' });
        }
      }

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select('-password -confirmPassword -__v');

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName || '',
          age: user.age || '',
          emailId: user.emailId,
          role: user.role,
          createdAt: user.createdAt,
          profileImage: user.profileImage,
          emailVerified: user.emailVerified,
          socialLinks: user.socialLinks || {},
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, message: 'User Deleted Successfully' });
  } catch (err) {
    res.status(403).json({ success: false, message: 'Error Occurred: ' + err.message });
  }
};

export const activeUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    res.status(200).json({ message: 'User count fetched successfully', count: userCount });
  } catch (err) {
    res.status(500).json({ message: 'Error while fetching user Count', error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password -confirmPassword -__v');
    res.status(200).json({
      message: 'All users fetched successfully',
      users,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error while fetching users', error: err.message });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalContests = await Contest.countDocuments();
    const totalProblems = await Problem.countDocuments();

    res.status(200).json({
      message: 'Platform stats fetched successfully',
      stats: {
        totalUsers,
        totalSubmissions,
        totalContests,
        totalProblems,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error while fetching platform stats',
      error: err.message,
    });
  }
};

export const updateAllProfileImages = async (req, res) => {
  try {
    const usersWithoutImage = await User.find({
      profileImage: { $in: [null, ''] },
    });
    let updatedCount = 0;

    for (const user of usersWithoutImage) {
      try {
        const imageUrl = await generateProfileImage(user.firstName, user._id);
        await User.findByIdAndUpdate(user._id, { profileImage: imageUrl });
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update profile image for user: ${user.emailId}`, error);
      }
    }

    res.status(200).json({ message: `Updated profile images for ${updatedCount} users.` });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred during the update process:',
      error: error.message,
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { sub, email, given_name, family_name, picture } = response.data;

    let user = await User.findOne({ emailId: email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(sub, salt);

      user = new User({
        firstName: given_name,
        lastName: family_name || '',
        emailId: email,
        password: hashedPassword,
        profileImage: picture,
        emailVerified: true,
        role: 'user',
        socialLinks: {},
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: 604800 }
    );

    res.cookie('token', jwtToken, {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
        profileImage: user.profileImage,
      },
      token: jwtToken,
      message: 'Logged in with Google successfully',
    });
  } catch (error) {
    console.error('Google login error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};

export default {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteProfile,
  activeUsers,
  googleLogin,
  getAllUsers,
  getPlatformStats,
  updateAllProfileImages,
};
