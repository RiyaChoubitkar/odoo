import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';

dotenv.config();

const seedUsers = [
  {
    name: 'Shreya Rathod',
    email: 'shreya@example.com',
    password: 'password123',
    bio: 'Fashion designer with 5+ years experience. Love teaching design principles and learning new crafts.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Fashion designing', 'Crochet', 'Embroidery'],
    skillsWanted: ['Piano', 'DIY', 'Dance'],
    rating: 4.8,
    totalConnections: 156,
    isOnline: true,
    isVerified: true
  },
  {
    name: 'Arjun Singhania',
    email: 'arjun@example.com',
    password: 'password123',
    bio: 'Guitar instructor and music enthusiast. I can teach various guitar techniques and would love to learn digital art.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Guitar', 'Piano', 'Music Theory'],
    skillsWanted: ['Digital Art', 'Photography', 'Video Editing'],
    rating: 4.9,
    totalConnections: 89,
    isOnline: false,
    isVerified: true
  },
  {
    name: 'Maya Chen',
    email: 'maya@example.com',
    password: 'password123',
    bio: 'Professional chef specializing in Asian cuisine. Happy to share cooking secrets!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Cooking', 'Baking', 'Food Photography'],
    skillsWanted: ['Yoga', 'Meditation', 'Language Learning'],
    rating: 4.7,
    totalConnections: 234,
    isOnline: true,
    isVerified: true
  },
  {
    name: 'David Rodriguez',
    email: 'david@example.com',
    password: 'password123',
    bio: 'Software developer and tech enthusiast. I enjoy teaching programming and learning creative skills.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Programming', 'Web Development', 'Tech Support'],
    skillsWanted: ['Photography', 'Painting', 'Music Production'],
    rating: 4.6,
    totalConnections: 67,
    isOnline: true,
    isVerified: true
  }
];

const seedCourses = [
  {
    title: 'Cooking Basics for Beginners',
    description: 'Learn the fundamentals of cooking with easy-to-follow recipes and techniques.',
    category: 'Culinary',
    subcategory: 'Cooking',
    difficulty: 'beginner',
    duration: '4 weeks',
    lessons: [
      {
        title: 'Kitchen Safety and Equipment',
        description: 'Essential safety tips and kitchen equipment overview',
        duration: 30,
        content: 'Learn about kitchen safety, essential tools, and proper equipment usage.',
        order: 1
      },
      {
        title: 'Basic Knife Skills',
        description: 'Master fundamental knife techniques',
        duration: 45,
        content: 'Practice chopping, dicing, and slicing techniques safely.',
        order: 2
      },
      {
        title: 'Cooking Methods',
        description: 'Understanding different cooking techniques',
        duration: 60,
        content: 'Learn about boiling, frying, baking, and grilling methods.',
        order: 3
      }
    ],
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    price: 0,
    isFree: true,
    status: 'published',
    prerequisites: ['No prior experience required'],
    learningOutcomes: [
      'Understand kitchen safety protocols',
      'Master basic knife skills',
      'Learn fundamental cooking methods',
      'Prepare simple, delicious meals'
    ],
    tags: ['cooking', 'beginner', 'culinary', 'kitchen']
  },
  {
    title: 'Crochet for Beginners',
    description: 'Start your crochet journey with this comprehensive beginner course.',
    category: 'Crafts',
    subcategory: 'Crochet',
    difficulty: 'beginner',
    duration: '3 weeks',
    lessons: [
      {
        title: 'Introduction to Crochet',
        description: 'Understanding crochet basics and materials',
        duration: 30,
        content: 'Learn about different yarns, hooks, and basic terminology.',
        order: 1
      },
      {
        title: 'Basic Stitches',
        description: 'Master chain, single crochet, and double crochet',
        duration: 45,
        content: 'Practice the fundamental crochet stitches.',
        order: 2
      },
      {
        title: 'Your First Project',
        description: 'Create a simple scarf or dishcloth',
        duration: 60,
        content: 'Apply your skills to create a complete project.',
        order: 3
      }
    ],
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
    price: 0,
    isFree: true,
    status: 'published',
    prerequisites: ['No prior experience required'],
    learningOutcomes: [
      'Understand crochet materials and tools',
      'Master basic crochet stitches',
      'Read simple crochet patterns',
      'Complete your first crochet project'
    ],
    tags: ['crochet', 'beginner', 'crafts', 'yarn']
  },
  {
    title: 'Piano Fundamentals',
    description: 'Learn piano from scratch with this comprehensive course.',
    category: 'Music',
    subcategory: 'Piano',
    difficulty: 'beginner',
    duration: '6 weeks',
    lessons: [
      {
        title: 'Piano Basics',
        description: 'Introduction to piano and music theory',
        duration: 45,
        content: 'Learn about piano layout, posture, and basic music theory.',
        order: 1
      },
      {
        title: 'Reading Music',
        description: 'Understanding sheet music and notation',
        duration: 60,
        content: 'Learn to read treble and bass clef notation.',
        order: 2
      },
      {
        title: 'Your First Song',
        description: 'Play a complete song from start to finish',
        duration: 75,
        content: 'Apply your skills to play a simple melody.',
        order: 3
      }
    ],
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&h=200&fit=crop',
    price: 0,
    isFree: true,
    status: 'published',
    prerequisites: ['Access to a piano or keyboard'],
    learningOutcomes: [
      'Understand piano layout and posture',
      'Read basic sheet music',
      'Play simple melodies',
      'Develop proper technique'
    ],
    tags: ['piano', 'beginner', 'music', 'keyboard']
  }
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});

    console.log('Cleared existing data');

    // Seed users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Seed courses
    for (const courseData of seedCourses) {
      // Assign random instructor from created users
      const randomInstructor = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      courseData.instructor = randomInstructor._id;
      
      const course = await Course.create(courseData);
      await course.calculateTotalDuration();
      console.log(`Created course: ${course.title}`);
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users and ${seedCourses.length} courses`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 