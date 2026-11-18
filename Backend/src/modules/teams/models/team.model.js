import mongoose from "mongoose";

const { Schema } = mongoose;

const memberSubdocumentSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["owner", "admin", "moderator", "member"],
    default: "member",
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const teamSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxLength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    password: {
      type: String,
      required: false, // Legacy auth compatibility
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    memberCount: {
      type: Number,
      default: 1,
    },
    settings: {
      allowMemberProjectCreation: { type: Boolean, default: true },
      allowPublicJoin: { type: Boolean, default: false },
    },
    // Retained for backward compatibility with existing team queries
    members: [memberSubdocumentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

teamSchema.pre("save", function (next) {
  if (!this.name && this.teamName) {
    this.name = this.teamName;
  }
  if (!this.teamName && this.name) {
    this.teamName = this.name.toLowerCase().trim();
  }
  this.memberCount = this.members ? this.members.length : 1;
  next();
});

// Backward-compatible instance methods
teamSchema.methods.addMember = function (
  username,
  isAdmin = false,
  userId = null,
) {
  const normalized = username?.toLowerCase();
  const existingMember = this.members.find(
    (m) => m.username?.toLowerCase() === normalized,
  );

  if (!existingMember) {
    this.members.push({
      username,
      userId,
      isAdmin,
      role: isAdmin ? "admin" : "member",
      joinedAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
    });
  } else {
    existingMember.lastLogin = new Date();
    existingMember.isActive = true;
    if (userId && !existingMember.userId) {
      existingMember.userId = userId;
    }
  }

  return this.save();
};

teamSchema.methods.getActiveMembers = function () {
  return (this.members || []).filter((member) => member.isActive);
};

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);
export default Team;
