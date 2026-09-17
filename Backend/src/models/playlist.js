import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  problems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'problem',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema);
export default Playlist;