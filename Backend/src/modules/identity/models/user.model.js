import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minLength: [2, "First name must be at least 2 characters"],
      maxLength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"],
      default: "",
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      minLength: [2, "Username must be at least 2 characters"],
      maxLength: [30, "Username cannot exceed 30 characters"],
      index: true,
      sparse: true,
    },
    emailId: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      immutable: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    age: {
      type: Number,
      min: [6, "Age must be at least 6"],
      max: [120, "Age cannot exceed 120"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deactivated"],
      default: "active",
      index: true,
    },
    bio: {
      type: String,
      maxLength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      maxLength: [100, "Location cannot exceed 100 characters"],
      default: "",
    },
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    profileImage: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    points: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    tokensLeft: {
      type: Number,
      default: 10,
    },
    premiumExpiry: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    // Backwards compatibility references
    problemSolved: [
      {
        type: Schema.Types.ObjectId,
        ref: "problem",
      },
    ],
    contestsCompleted: [
      {
        type: Schema.Types.ObjectId,
        ref: "contest",
      },
    ],
    lastContestCompletion: {
      type: Date,
      default: null,
    },
    contestHistory: [
      {
        contestId: {
          type: Schema.Types.ObjectId,
          ref: "contest",
        },
        rank: Number,
        score: Number,
        problemsSolved: Number,
        totalRuntime: Number,
      },
    ],
    paymentHistory: [
      {
        orderId: { type: String },
        paymentId: { type: String },
        amount: { type: Number },
        plan: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// Virtual for unified email access
userSchema
  .virtual("email")
  .get(function () {
    return this.emailId;
  })
  .set(function (val) {
    this.emailId = val;
  });

// Virtual for unified name access
userSchema.virtual("name").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

// Pre-save hook to ensure username fallback
userSchema.pre("save", async function (next) {
  if (!this.username && this.emailId) {
    const baseUsername = this.emailId
      .split("@")[0]
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();
    this.username = baseUsername.slice(0, 25);
  }
  next();
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user is active
userSchema.methods.isActive = function () {
  return this.status === "active";
};

// Ensure both 'User' and 'user' work in Mongoose model registry
const UserModel =
  mongoose.models.User ||
  mongoose.models.user ||
  mongoose.model("User", userSchema);

if (!mongoose.models.user) {
  mongoose.model("user", userSchema);
}

export default UserModel;
