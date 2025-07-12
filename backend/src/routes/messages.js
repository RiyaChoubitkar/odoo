import express from 'express';
import {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  getUnreadCount
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/unread/count', getUnreadCount);
router.get('/:matchId', getMessages);
router.post('/', sendMessage);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/reactions', addReaction);
router.delete('/:id/reactions', removeReaction);

export default router; 