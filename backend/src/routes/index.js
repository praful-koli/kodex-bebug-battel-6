import { Router } from 'express';
import authRoutes from './auth.routes.js';
import friendshipRoutes from './friendship.routes.js';
import gameInviteRoutes from './gameInvite.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/friends', friendshipRoutes);
router.use('/game', gameInviteRoutes);

export default router;
