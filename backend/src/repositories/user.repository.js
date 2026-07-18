import User from '../models/User.js';

/**
 * Data access layer — all MongoDB queries for User live here.
 * No business logic, only DB operations.
 */
const userRepository = {
  /**
   * Find a user by their username (includes password field for auth).
   */
  findByUsername: (username) =>
    User.findOne({ username }).select('+password'),

  /**
   * Find a user by their username (excludes password field).
   */
  findOneByUsername: (username) =>
    User.findOne({ username }),

  /**
   * Find a user by their MongoDB _id (password excluded).
   */
  findById: (id) =>
    User.findById(id),

  /**
   * Create and persist a new user document.
   */
  createUser: (userData) =>
    User.create(userData),

  /**
   * Check if a username is already taken.
   */
  existsByUsername: (username) =>
    User.exists({ username }),
};

export default userRepository;
