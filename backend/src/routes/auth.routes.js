import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import validate from '../validators/validate.js';
import { signupSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// Public routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.me);

export default router;
