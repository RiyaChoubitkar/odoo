import Course from '../models/Course.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  const { 
    category, 
    difficulty, 
    instructor, 
    search, 
    page = 1, 
    limit = 10,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  const query = { status: 'published', isPublic: true };

  // Apply filters
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (instructor) query.instructor = instructor;
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort object
  const sort = {};
  if (sortBy === 'rating') {
    sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
  } else if (sortBy === 'enrollments') {
    sort.totalEnrollments = sortOrder === 'desc' ? -1 : 1;
  } else if (sortBy === 'created') {
    sort.createdAt = sortOrder === 'desc' ? -1 : 1;
  }

  const courses = await Course.find(query)
    .populate('instructor', 'name avatar rating')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Course.countDocuments(query);

  res.json({
    success: true,
    data: {
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }
  });
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email bio avatar rating totalConnections')
    .populate('rating.reviews.userId', 'name avatar');

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Check if user is enrolled (if authenticated)
  let isEnrolled = false;
  let userProgress = null;
  
  if (req.user) {
    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.userId.toString() === req.user._id.toString()
    );
    
    if (enrollment) {
      isEnrolled = true;
      userProgress = {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons.length,
        certificateIssued: enrollment.certificateIssued
      };
    }
  }

  res.json({
    success: true,
    data: {
      course,
      isEnrolled,
      userProgress
    }
  });
});

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private
export const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    subcategory,
    difficulty,
    duration,
    lessons,
    image,
    price,
    prerequisites,
    learningOutcomes,
    tags
  } = req.body;

  const course = await Course.create({
    title,
    description,
    instructor: req.user._id,
    category,
    subcategory,
    difficulty,
    duration,
    lessons,
    image,
    price: price || 0,
    isFree: !price || price === 0,
    prerequisites,
    learningOutcomes,
    tags
  });

  // Calculate total duration and lessons
  await course.calculateTotalDuration();

  // Populate instructor details
  await course.populate('instructor', 'name avatar rating');

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Check if user is the instructor
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this course' });
  }

  // Update fields
  const updateFields = [
    'title', 'description', 'category', 'subcategory', 'difficulty',
    'duration', 'lessons', 'image', 'price', 'prerequisites',
    'learningOutcomes', 'tags', 'status'
  ];

  updateFields.forEach(field => {
    if (req.body[field] !== undefined) {
      course[field] = req.body[field];
    }
  });

  // Update isFree based on price
  if (req.body.price !== undefined) {
    course.isFree = !req.body.price || req.body.price === 0;
  }

  await course.save();

  // Recalculate total duration and lessons
  await course.calculateTotalDuration();

  // Populate instructor details
  await course.populate('instructor', 'name avatar rating');

  res.json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Check if user is the instructor
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this course' });
  }

  await course.remove();

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
export const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (course.status !== 'published') {
    return res.status(400).json({ message: 'Course is not available for enrollment' });
  }

  // Enroll student
  await course.enrollStudent(req.user._id);

  res.json({
    success: true,
    message: 'Successfully enrolled in course'
  });
});

// @desc    Update lesson progress
// @route   PUT /api/courses/:id/progress
// @access  Private
export const updateProgress = asyncHandler(async (req, res) => {
  const { lessonId } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Update progress
  await course.updateLessonProgress(req.user._id, lessonId);

  // Get updated enrollment info
  const enrollment = course.enrolledStudents.find(
    enrollment => enrollment.userId.toString() === req.user._id.toString()
  );

  res.json({
    success: true,
    data: {
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons.length,
      certificateIssued: enrollment.certificateIssued
    }
  });
});

// @desc    Add course review
// @route   POST /api/courses/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Check if user is enrolled
  const isEnrolled = course.enrolledStudents.some(
    enrollment => enrollment.userId.toString() === req.user._id.toString()
  );

  if (!isEnrolled) {
    return res.status(400).json({ message: 'Must be enrolled to review this course' });
  }

  // Add review
  await course.addReview(req.user._id, rating, comment);

  // Populate instructor details
  await course.populate('instructor', 'name avatar rating');

  res.json({
    success: true,
    data: course
  });
});

// @desc    Get user's enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
export const getEnrolledCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const courses = await Course.find({
    'enrolledStudents.userId': req.user._id
  })
  .populate('instructor', 'name avatar rating')
  .sort({ 'enrolledStudents.enrolledAt': -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .exec();

  // Add enrollment info to each course
  const coursesWithEnrollment = courses.map(course => {
    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.userId.toString() === req.user._id.toString()
    );
    
    return {
      ...course.toObject(),
      enrollment: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons.length,
        certificateIssued: enrollment.certificateIssued,
        enrolledAt: enrollment.enrolledAt
      }
    };
  });

  const total = await Course.countDocuments({
    'enrolledStudents.userId': req.user._id
  });

  res.json({
    success: true,
    data: {
      courses: coursesWithEnrollment,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }
  });
});

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor
// @access  Private
export const getInstructorCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const courses = await Course.find({ instructor: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Course.countDocuments({ instructor: req.user._id });

  res.json({
    success: true,
    data: {
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }
  });
}); 