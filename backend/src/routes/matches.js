import express from 'express';
import {
  createMatch,
  getMatches,
  getMatchById,
  updateMatchStatus,
  getPotentialMatches,
  rateMatch
} from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createMatch);
router.get('/', getMatches);
router.get('/potential', getPotentialMatches);
router.get('/:id', getMatchById);
router.put('/:id/status', updateMatchStatus);
router.post('/:id/rate', rateMatch);

export default router; 