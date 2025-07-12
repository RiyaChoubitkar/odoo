import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  getUserById,
  searchUsers
} from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/users/search', optionalAuth, searchUsers);
router.get('/users/:id', getUserById);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

export default router; 