import mongoose from 'mongoose';

const gameInviteSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically remove invite after 5 minutes (300 seconds)
gameInviteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const GameInvite = mongoose.model('GameInvite', gameInviteSchema);

export default GameInvite;
