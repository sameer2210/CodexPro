import mongoose from 'mongoose';
const { Schema } = mongoose;

const ContestSubmissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    contestId: {
      type: Schema.Types.ObjectId,
      ref: 'contest',
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'problem',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['cpp', 'c++', 'java', 'javascript'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Accepted', 'Wrong Answer', 'Compiler Error', 'Processing'],
      default: 'Pending',
    },
    runtime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: ' ',
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    submissionTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ContestSubmissionSchema.index({ contestId: 1, userId: 1, problemId: 1 });
ContestSubmissionSchema.index({ contestId: 1, score: -1, runtime: 1 });

const ContestSubmission =
  mongoose.models.contestSubmission || mongoose.model('contestSubmission', ContestSubmissionSchema);
export default ContestSubmission;
