import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema({
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'contest',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const Participation =
  mongoose.models.participation || mongoose.model('participation', participationSchema);
export default Participation;