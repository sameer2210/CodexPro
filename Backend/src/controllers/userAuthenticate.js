import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import multer from "multer";
import redisWrapper from "../config/redis.js";
import Contest from "../models/contest.js";
import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import User from "../models/user.js";
import { generateProfileImage } from "../services/profileImageGenerator.js";
import validate from "../services/validator.js";
import config from "../config/config.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getGoogleClient = () => {
  const clientId = config.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  return new OAuth2Client(clientId);
};

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only images are allowed (jpeg, jpg, png)"));
  },
}).single("profileImage");

export const register = async (req, res) => {
  try {
    const { firstName, emailId, password, confirmPassword } = req.body;

    if (!firstName || !emailId || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
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
      const imageUrl = await generateProfileImage(
        newUser.firstName,
        newUser._id,
      );
      newUser.profileImage = imageUrl;
    }

    await newUser.save();

    const token = jwt.sign(
      { _id: newUser._id, emailId: newUser.emailId, role: newUser.role },
      config.JWT_SECRET,
      { expiresIn: 604800 },
    );
    res.cookie("token", token, {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
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
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) throw new Error("Credentials Missing");

    const normalizedEmail = String(emailId).trim().toLowerCase();
    const user = await User.findOne({ emailId: normalizedEmail });
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Error Invalid Credentials" });
    }

    if (!user.password) {
      return res.status(403).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Email not verified. Please verify your email before logging in.",
        needsVerification: true,
        email: normalizedEmail,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(403)
        .json({ success: false, message: "Error Invalid Credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      config.JWT_SECRET,
      { expiresIn: 604800 },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    res
      .status(200)
      .json({ user: reply, token, message: "Logged In Successfully" });
  } catch (err) {
    res.status(403).json({ success: false, message: "Error " + err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token =
      req.cookies?.token ||
      req.query?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);
    if (token) {
      await redisWrapper.set(`token:${token}`, "Blocked");
      const payload = jwt.decode(token);
      if (payload?.exp) {
        await redisWrapper.expireAt(`token:${token}`, payload.exp);
      }
    }

    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res
      .status(200)
      .json({ success: true, message: "User Logged Out Successfully" });
  } catch (err) {
    res.status(401).json({ success: false, message: "Error: " + err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId)
      .populate({
        path: "problemSolved",
        select: "title difficulty tags createdAt",
        options: { sort: { createdAt: -1 }, limit: 5 },
      })
      .select("-password -confirmPassword -__v");

    if (!user) return res.status(404).json({ message: "User not found" });

    const problemStats = (user.problemSolved || []).reduce(
      (acc, problem) => {
        acc.total++;
        if (problem?.difficulty && acc[problem.difficulty] !== undefined) {
          acc[problem.difficulty]++;
        }
        return acc;
      },
      { total: 0, easy: 0, medium: 0, hard: 0 },
    );

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName || "",
        age: user.age || "",
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
      const allowedFields = ["firstName", "lastName", "age", "socialLinks"];
      const updateData = Object.fromEntries(
        allowedFields
          .filter((field) => req.body[field] !== undefined)
          .map((field) => [field, req.body[field]]),
      );

      if (req.file) {
        const uploadToCloudinary = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "profileImages",
                public_id: userId.toString(),
                overwrite: true,
              },
              (error, result) => (error ? reject(error) : resolve(result)),
            );
            stream.end(req.file.buffer);
          });
        };
        const result = await uploadToCloudinary();
        updateData.profileImage = result.secure_url;
      }

      if (updateData.socialLinks) {
        try {
          if (typeof updateData.socialLinks === "string") {
            updateData.socialLinks = JSON.parse(updateData.socialLinks);
          }
        } catch (e) {
          return res.status(400).json({ error: "Invalid socialLinks format" });
        }
      }

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password -confirmPassword -__v");

      if (!user) return res.status(404).json({ message: "User not found" });

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName || "",
          age: user.age || "",
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
    res
      .status(200)
      .json({ success: true, message: "User Deleted Successfully" });
  } catch (err) {
    res
      .status(403)
      .json({ success: false, message: "Error Occurred: " + err.message });
  }
};

export const activeUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    res
      .status(200)
      .json({ message: "User count fetched successfully", count: userCount });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while fetching user Count", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password -confirmPassword -__v");
    res.status(200).json({
      message: "All users fetched successfully",
      users,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while fetching users", error: err.message });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalContests = await Contest.countDocuments();
    const totalProblems = await Problem.countDocuments();

    res.status(200).json({
      message: "Platform stats fetched successfully",
      stats: {
        totalUsers,
        totalSubmissions,
        totalContests,
        totalProblems,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while fetching platform stats",
      error: err.message,
    });
  }
};

export const updateAllProfileImages = async (req, res) => {
  try {
    const usersWithoutImage = await User.find({
      profileImage: { $in: [null, ""] },
    });
    let updatedCount = 0;

    for (const user of usersWithoutImage) {
      try {
        const imageUrl = await generateProfileImage(user.firstName, user._id);
        await User.findByIdAndUpdate(user._id, { profileImage: imageUrl });
        updatedCount++;
      } catch (error) {
        console.error(
          `Failed to update profile image for user: ${user.emailId}`,
          error,
        );
      }
    }

    res
      .status(200)
      .json({ message: `Updated profile images for ${updatedCount} users.` });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during the update process:",
      error: error.message,
    });
  }
};

/**
 * Academy Google Sign-In — verifies Google ID token (GIS credential).
 * Body: { credential: "<Google ID token>" }
 * Does not silently link to existing password accounts by email alone.
 */
export const googleLogin = async (req, res) => {
  try {
    const clientId = config.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "Google Sign-In is not configured on the server",
      });
    }

    const credential = req.body?.credential || req.body?.idToken;
    if (!credential || typeof credential !== "string") {
      return res.status(400).json({
        success: false,
        message: "Google ID token credential is required",
      });
    }

    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    const issuer = payload?.iss;
    const allowedIssuers = [
      "accounts.google.com",
      "https://accounts.google.com",
    ];
    if (!allowedIssuers.includes(issuer)) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token issuer",
      });
    }

    const sub = payload?.sub;
    const email = payload?.email ? String(payload.email).toLowerCase() : null;
    const emailVerified = payload?.email_verified === true;

    if (!sub) {
      return res.status(401).json({
        success: false,
        message: "Google token missing subject identifier",
      });
    }
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Google token missing email",
      });
    }
    if (!emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    let user = await User.findOne({ googleId: sub });

    if (!user) {
      const existingByEmail = await User.findOne({ emailId: email });
      if (existingByEmail) {
        if (existingByEmail.googleId && existingByEmail.googleId !== sub) {
          return res.status(409).json({
            success: false,
            message: "This email is linked to a different Google account",
          });
        }
        if (!existingByEmail.googleId) {
          return res.status(409).json({
            success: false,
            message:
              "An account with this email already exists. Sign in with your password. Google linking requires an authenticated account flow.",
          });
        }
      }

      const givenName = (payload.given_name || email.split("@")[0] || "User")
        .toString()
        .slice(0, 20);
      const safeFirstName =
        givenName.length >= 3 ? givenName : `${givenName}usr`.slice(0, 20);

      user = new User({
        firstName: safeFirstName,
        lastName: payload.family_name
          ? String(payload.family_name).slice(0, 20)
          : undefined,
        emailId: email,
        googleId: sub,
        profileImage: payload.picture || null,
        emailVerified: true,
        role: "user",
        socialLinks: {},
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      config.JWT_SECRET,
      { expiresIn: 604800 },
    );

    res.cookie("token", jwtToken, {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
      },
      token: jwtToken,
      message: "Logged in with Google successfully",
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    const message =
      error.message?.includes("Wrong recipient") ||
      error.message?.includes("Token used too early") ||
      error.message?.includes("Invalid token signature") ||
      error.message?.includes("jwt")
        ? "Invalid or expired Google credential"
        : "Google login failed";
    res.status(401).json({ success: false, message });
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
