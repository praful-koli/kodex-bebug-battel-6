import authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Auth controllers — thin HTTP handlers that delegate to the service layer.
 * No business logic here.
 */
const authController = {
  signup: async (req, res, next) => {
    try {
      const { user, accessToken } = await authService.signup(req.body);
      res
        .status(HTTP_STATUS.CREATED)
        .json(ApiResponse(HTTP_STATUS.CREATED, { user, accessToken }, 'Account created successfully'));
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { user, accessToken } = await authService.login(req.body);
      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, { user, accessToken }, 'Login successful'));
    } catch (error) {
      next(error);
    }
  },

  me: async (req, res, next) => {
    try {
      const user = await authService.getMe(req.user.userId);
      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, { user }, 'User fetched successfully'));
    } catch (error) {
      next(error);
    }
  },

  logout: (_req, res) => {
    // Access token is in-memory on the client; server just acknowledges.
    res
      .status(HTTP_STATUS.OK)
      .json(ApiResponse(HTTP_STATUS.OK, null, 'Logged out successfully'));
  },
};

export default authController;
