import { Router } from 'express';
import friendshipController from '../controllers/friendship.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = Router();

// All friendship routes require authentication
router.use(authenticate);

router.post('/request', friendshipController.sendRequest);
router.post('/respond', friendshipController.respondToRequest);
router.get('/', friendshipController.getFriends);
router.get('/pending', friendshipController.getPending);
router.post('/heartbeat', friendshipController.heartbeat);

export default router;
