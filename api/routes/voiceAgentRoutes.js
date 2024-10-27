import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { getVoiceAgentToken } from '../controllers/voiceAgentController.js';

const router = express.Router();

router.use(protectRoute);
router.get('/token', getVoiceAgentToken);

export default router;
