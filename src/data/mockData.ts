
import { User, Match, Message, Course } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Shreya Rathod',
    email: 'shreya@example.com',
    bio: 'Fashion designer with 5+ years experience. Love teaching design principles and learning new crafts.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Fashion designing', 'Crochet', 'Embroidery'],
    skillsWanted: ['Piano', 'DIY', 'Dance'],
    rating: 4.8,
    totalConnections: 156,
    isOnline: true,
    joinedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Arjun Singhania',
    email: 'arjun@example.com',
    bio: 'Guitar instructor and music enthusiast. I can teach various guitar techniques and would love to learn digital art.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Guitar', 'Piano', 'Music Theory'],
    skillsWanted: ['Digital Art', 'Photography', 'Video Editing'],
    rating: 4.9,
    totalConnections: 89,
    isOnline: false,
    joinedAt: '2024-02-10'
  },
  {
    id: '3',
    name: 'Maya Chen',
    email: 'maya@example.com',
    bio: 'Professional chef specializing in Asian cuisine. Happy to share cooking secrets!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Cooking', 'Baking', 'Food Photography'],
    skillsWanted: ['Yoga', 'Meditation', 'Language Learning'],
    rating: 4.7,
    totalConnections: 234,
    isOnline: true,
    joinedAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'David Rodriguez',
    email: 'david@example.com',
    bio: 'Software developer and tech enthusiast. I enjoy teaching programming and learning creative skills.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    skillsOffered: ['Programming', 'Web Development', 'Tech Support'],
    skillsWanted: ['Photography', 'Painting', 'Music Production'],
    rating: 4.6,
    totalConnections: 67,
    isOnline: true,
    joinedAt: '2024-03-05'
  }
];

export const mockMatches: Match[] = [
  {
    id: '1',
    user1Id: '1',
    user2Id: '2',
    status: 'active',
    createdAt: '2024-07-10T10:00:00Z',
    user1: mockUsers[0],
    user2: mockUsers[1],
    compatibilityScore: 85
  },
  {
    id: '2',
    user1Id: '1',
    user2Id: '3',
    status: 'pending',
    createdAt: '2024-07-11T14:30:00Z',
    user1: mockUsers[0],
    user2: mockUsers[2],
    compatibilityScore: 72
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    matchId: '1',
    senderId: '2',
    message: 'Hey Aranya! I saw you\'re into illustration, I\'d love to learn some basic guitar playing from you. Want to swap?',
    timestamp: '2024-07-10T10:15:00Z',
    read: true
  },
  {
    id: '2',
    matchId: '1',
    senderId: '1',
    message: 'Hi Rahul! That sounds perfect! I\'ve been wanting to learn guitar for months. I\'d be happy to help you get started on a swap!',
    timestamp: '2024-07-10T10:45:00Z',
    read: true
  },
  {
    id: '3',
    matchId: '1',
    senderId: '2',
    message: 'Perfect! I\'ve been wanting to learn guitar for months. When would be a good time to start?',
    timestamp: '2024-07-10T11:00:00Z',
    read: false
  }
];

export const trendingCourses: Course[] = [
  {
    id: '1',
    title: 'Cooking',
    instructor: 'Chef Maria',
    duration: '4 weeks',
    lessons: 12,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    category: 'Culinary'
  },
  {
    id: '2',
    title: 'Crochet',
    instructor: 'Sarah Johnson',
    duration: '3 weeks',
    lessons: 8,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
    category: 'Crafts'
  },
  {
    id: '3',
    title: 'Piano',
    instructor: 'Michael Thompson',
    duration: '6 weeks',
    lessons: 18,
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&h=200&fit=crop',
    category: 'Music'
  }
];

export const onlineCourses: Course[] = [
  {
    id: '4',
    title: 'Yoga and Meditation for Beginners',
    instructor: 'Priya Sharma',
    duration: '30 mins',
    lessons: 9,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=200&fit=crop',
    category: 'Wellness'
  }
];
