import mongoose from "mongoose";

const { Schema } = mongoose;

const teamInvitationSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    inviterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    inviteeUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "moderator", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

teamInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
teamInvitationSchema.index({ teamId: 1, inviteeEmail: 1, status: 1 });

const TeamInvitation =
  mongoose.models.TeamInvitation ||
  mongoose.model("TeamInvitation", teamInvitationSchema);
export default TeamInvitation;
