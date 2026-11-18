import mongoose from "mongoose";

const { Schema } = mongoose;

const projectFileSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    isDirectory: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

projectFileSchema.index({ projectId: 1, path: 1 }, { unique: true });

const ProjectFile =
  mongoose.models.ProjectFile ||
  mongoose.model("ProjectFile", projectFileSchema);
export default ProjectFile;
