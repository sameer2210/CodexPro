import mongoose from "mongoose";

const { Schema } = mongoose;

const projectActivitySchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "created",
        "updated_code",
        "renamed",
        "reviewed",
        "shared",
        "deleted",
      ],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

projectActivitySchema.index({ projectId: 1, createdAt: -1 });

const ProjectActivity =
  mongoose.models.ProjectActivity ||
  mongoose.model("ProjectActivity", projectActivitySchema);
export default ProjectActivity;
