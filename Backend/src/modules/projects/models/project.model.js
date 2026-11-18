import mongoose from "mongoose";

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxLength: [100, "Project name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
      index: true,
    },
    teamName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: ["public", "team", "private"],
      default: "team",
      index: true,
    },
    language: {
      type: String,
      default: "javascript",
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      default: "",
    },
    review: {
      type: String,
      default: "",
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

projectSchema.index({ teamName: 1, isDeleted: 1 });
projectSchema.index({ ownerId: 1, isDeleted: 1 });
projectSchema.index({ teamId: 1, isDeleted: 1 });

const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
export default Project;
