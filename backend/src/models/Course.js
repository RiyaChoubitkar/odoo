import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'Culinary', 'Crafts', 'Music', 'Wellness', 'Technology', 
      'Art', 'Language', 'Business', 'Sports', 'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: String,
    required: [true, 'Course duration is required']
  },
  lessons: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: Number, // in minutes
    content: String,
    videoUrl: String,
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    order: {
      type: Number,
      required: true
    }
  }],
  totalLessons: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  image: {
    type: String,
    required: [true, 'Course image is required']
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  isFree: {
    type: Boolean,
    default: true
  },
  // Course status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  // Course ratings and reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    reviews: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Course enrollment
  enrolledStudents: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [{
      lessonId: mongoose.Schema.Types.ObjectId,
      completedAt: Date
    }],
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateIssuedAt: Date
  }],
  totalEnrollments: {
    type: Number,
    default: 0
  },
  // Course requirements
  prerequisites: [String],
  learningOutcomes: [String],
  // Course tags for search
  tags: [String],
  // Course visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  // Course completion certificate
  certificateTemplate: {
    enabled: {
      type: Boolean,
      default: true
    },
    template: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ 'rating.average': -1, totalEnrollments: -1 });

// Virtual for average rating
courseSchema.virtual('averageRating').get(function() {
  return this.rating.average;
});

// Method to add review
courseSchema.methods.addReview = function(userId, rating, comment = '') {
  // Remove existing review from this user if exists
  this.rating.reviews = this.rating.reviews.filter(review => 
    review.userId.toString() !== userId.toString()
  );
  
  // Add new review
  this.rating.reviews.push({
    userId,
    rating,
    comment,
    createdAt: new Date()
  });
  
  // Recalculate average rating
  const totalRating = this.rating.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.rating.reviews.length;
  this.rating.totalRatings = this.rating.reviews.length;
  
  return this.save();
};

// Method to enroll student
courseSchema.methods.enrollStudent = function(userId) {
  // Check if already enrolled
  const existingEnrollment = this.enrolledStudents.find(
    enrollment => enrollment.userId.toString() === userId.toString()
  );
  
  if (existingEnrollment) {
    return Promise.resolve(this);
  }
  
  // Add new enrollment
  this.enrolledStudents.push({
    userId,
    enrolledAt: new Date(),
    progress: 0,
    completedLessons: []
  });
  
  this.totalEnrollments = this.enrolledStudents.length;
  return this.save();
};

// Method to update lesson progress
courseSchema.methods.updateLessonProgress = function(userId, lessonId) {
  const enrollment = this.enrolledStudents.find(
    enrollment => enrollment.userId.toString() === userId.toString()
  );
  
  if (!enrollment) {
    throw new Error('User not enrolled in this course');
  }
  
  // Check if lesson already completed
  const lessonCompleted = enrollment.completedLessons.find(
    lesson => lesson.lessonId.toString() === lessonId.toString()
  );
  
  if (!lessonCompleted) {
    enrollment.completedLessons.push({
      lessonId,
      completedAt: new Date()
    });
    
    // Calculate progress
    enrollment.progress = Math.round((enrollment.completedLessons.length / this.totalLessons) * 100);
    
    // Issue certificate if course completed
    if (enrollment.progress >= 100 && !enrollment.certificateIssued && this.certificateTemplate.enabled) {
      enrollment.certificateIssued = true;
      enrollment.certificateIssuedAt = new Date();
    }
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to calculate total duration
courseSchema.methods.calculateTotalDuration = function() {
  this.totalDuration = this.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  this.totalLessons = this.lessons.length;
  return this.save();
};

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

const Course = mongoose.model('Course', courseSchema);

export default Course; 