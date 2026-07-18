import { Router } from 'express';
import gameInviteController from '../controllers/gameInvite.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = Router();

// Secure all game endpoints
router.use(authenticate);

router.post('/invite', gameInviteController.invite);
router.post('/invite/respond', gameInviteController.respond);
router.get('/invites/pending', gameInviteController.getPending);
router.post('/leave', gameInviteController.leave);
router.get('/match/active', gameInviteController.getActiveMatch);

export default router;
