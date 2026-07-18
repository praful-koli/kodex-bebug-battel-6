import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    playerX: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    playerO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    board: {
      type: [String],
      default: () => Array(9).fill(null),
    },
    isXTurn: {
      type: Boolean,
      default: true,
    },
    scores: {
      X: { type: Number, default: 0 },
      O: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
    },
    roundsPlayed: {
      type: Number,
      default: 0,
    },
    roundWinner: {
      type: String, // 'X', 'O', 'draw' or null
      default: null,
    },
    winCombo: {
      type: [Number], // indices like [0, 1, 2]
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model('Match', matchSchema);

export default Match;
