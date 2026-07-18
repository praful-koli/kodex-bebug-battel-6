import Match from '../models/Match.js';

const matchRepository = {
  createMatch: (players, playerX, playerO) =>
    Match.create({
      players,
      playerX,
      playerO,
      board: Array(9).fill(null),
      isXTurn: true,
      scores: { X: 0, O: 0, draws: 0 },
      roundsPlayed: 0,
      roundWinner: null,
      winCombo: null,
      status: 'active',
    }),

  findMatchById: (id) =>
    Match.findById(id)
      .populate('players', 'username fullName avatar isOnline lastActive')
      .populate('playerX', 'username fullName avatar')
      .populate('playerO', 'username fullName avatar'),

  findActiveMatchForUser: (userId) =>
    Match.findOne({
      status: 'active',
      players: userId,
    })
      .populate('players', 'username fullName avatar isOnline lastActive')
      .populate('playerX', 'username fullName avatar')
      .populate('playerO', 'username fullName avatar'),

  updateMatchState: (id, updateObj) =>
    Match.findByIdAndUpdate(id, updateObj, { new: true })
      .populate('players', 'username fullName avatar isOnline lastActive')
      .populate('playerX', 'username fullName avatar')
      .populate('playerO', 'username fullName avatar'),

  completeMatch: (id) =>
    Match.findByIdAndUpdate(id, { status: 'completed' }, { new: true }),
};

export default matchRepository;
