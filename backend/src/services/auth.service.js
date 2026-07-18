import userRepository from '../repositories/user.repository.js';
import { signAccessToken } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Business logic layer for authentication.
 * Orchestrates repository calls and token generation.
 */
const authService = {
  /**
   * Register a new user.
   * Throws 409 if the username is already taken.
   */
  signup: async ({ username, fullName, password, avatar }) => {
    const exists = await userRepository.existsByUsername(username);
    if (exists) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Username is already taken');
    }

    const user = await userRepository.createUser({ username, fullName, password, avatar });

    const accessToken = signAccessToken({ userId: user._id });

    return { user, accessToken };
  },

  /**
   * Authenticate an existing user with username + password.
   * Throws 401 on invalid credentials (intentionally vague for security).
   */
  login: async ({ username, password }) => {
    const user = await userRepository.findByUsername(username);

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid username or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid username or password');
    }

    const accessToken = signAccessToken({ userId: user._id });

    // Strip password from the response object
    const safeUser = user.toJSON();

    return { user: safeUser, accessToken };
  },

  /**
   * Fetch authenticated user by their id.
   */
  getMe: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  },
};

export default authService;
