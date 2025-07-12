import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, bio, skillsOffered, skillsWanted } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    bio,
    skillsOffered,
    skillsWanted
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        rating: user.rating,
        totalConnections: user.totalConnections,
        isOnline: user.isOnline,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      }
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists and password matches
  if (user && (await user.comparePassword(password))) {
    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        rating: user.rating,
        totalConnections: user.totalConnections,
        isOnline: user.isOnline,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user) {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.avatar = req.body.avatar || user.avatar;
    user.skillsOffered = req.body.skillsOffered || user.skillsOffered;
    user.skillsWanted = req.body.skillsWanted || user.skillsWanted;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        skillsOffered: updatedUser.skillsOffered,
        skillsWanted: updatedUser.skillsWanted,
        rating: updatedUser.rating,
        totalConnections: updatedUser.totalConnections,
        isOnline: updatedUser.isOnline,
        isVerified: updatedUser.isVerified,
        token: generateToken(updatedUser._id)
      }
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
// @access  Public
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');

  if (user) {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Search users
// @route   GET /api/auth/users/search
// @access  Public
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, skills, page = 1, limit = 10 } = req.query;
  
  const query = {};
  
  // Text search
  if (q) {
    query.$text = { $search: q };
  }
  
  // Skills filter
  if (skills) {
    const skillsArray = skills.split(',').map(skill => skill.trim());
    query.$or = [
      { skillsOffered: { $in: skillsArray } },
      { skillsWanted: { $in: skillsArray } }
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    select: '-password -verificationToken -resetPasswordToken -resetPasswordExpires',
    sort: { rating: -1, totalConnections: -1 }
  };

  const users = await User.paginate(query, options);

  res.json({
    success: true,
    data: users
  });
}); 