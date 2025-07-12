import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  updateProgress,
  addReview,
  getEnrolledCourses,
  getInstructorCourses
} from '../controllers/courseController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourseById);

// Protected routes
router.use(protect);

router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.post('/:id/enroll', enrollInCourse);
router.put('/:id/progress', updateProgress);
router.post('/:id/reviews', addReview);
router.get('/enrolled', getEnrolledCourses);
router.get('/instructor', getInstructorCourses);

export default router; 