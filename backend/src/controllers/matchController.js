import Match from '../models/Match.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Create a new match
// @route   POST /api/matches
// @access  Private
const createMatch = asyncHandler(async (req, res) => {
  const { targetUserId, userSkillOffered, userSkillWanted } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!targetUserId || !userSkillOffered || !userSkillWanted) {
    return res.status(400).json({
      success: false,
      message: 'targetUserId, userSkillOffered, and userSkillWanted are required'
    });
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'Target user not found'
    });
  }

  // Check if match already exists
  const existingMatch = await Match.findOne({
    $or: [
      { user1Id: userId, user2Id: targetUserId },
      { user1Id: targetUserId, user2Id: userId }
    ]
  });

  if (existingMatch) {
    return res.status(400).json({
      success: false,
      message: 'Match already exists between these users'
    });
  }

  // Create the match
  const match = await Match.create({
    user1Id: userId,
    user2Id: targetUserId,
    exchangeDetails: {
      user1SkillOffered: userSkillOffered,
      user1SkillWanted: userSkillWanted,
      user2SkillOffered: '', // Will be filled when user2 accepts
      user2SkillWanted: ''   // Will be filled when user2 accepts
    },
    status: 'pending'
  });

  // Populate user details
  await match.populate([
    { path: 'user1Id', select: 'name email avatar skillsOffered skillsWanted rating' },
    { path: 'user2Id', select: 'name email avatar skillsOffered skillsWanted rating' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Match created successfully',
    data: match
  });
});

// @desc    Get user's matches
// @route   GET /api/matches
// @access  Private
const getMatches = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = {
    $or: [{ user1Id: userId }, { user2Id: userId }]
  };

  if (status) {
    query.status = status;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'user1Id', select: 'name email avatar skillsOffered skillsWanted rating isOnline' },
      { path: 'user2Id', select: 'name email avatar skillsOffered skillsWanted rating isOnline' }
    ],
    sort: { createdAt: -1 }
  };

  const matches = await Match.paginate(query, options);

  // Add compatibility scores and determine other user
  const matchesWithCompatibility = matches.docs.map(match => {
    const otherUser = match.user1Id._id.toString() === userId ? match.user2Id : match.user1Id;
    const currentUser = match.user1Id._id.toString() === userId ? match.user1Id : match.user2Id;
    
    // Calculate compatibility score
    const matchingSkills = otherUser.skillsOffered.filter(skill =>
      currentUser.skillsWanted.includes(skill)
    ).length;
    const compatibilityScore = Math.min(95, 60 + (matchingSkills * 15));

    return {
      ...match.toObject(),
      otherUser,
      compatibilityScore,
      isUser1: match.user1Id._id.toString() === userId
    };
  });

  res.json({
    success: true,
    data: {
      matches: matchesWithCompatibility,
      pagination: {
        page: matches.page,
        limit: matches.limit,
        totalDocs: matches.totalDocs,
        totalPages: matches.totalPages,
        hasNextPage: matches.hasNextPage,
        hasPrevPage: matches.hasPrevPage
      }
    }
  });
});

// @desc    Get potential matches
// @route   GET /api/matches/potential
// @access  Private
const getPotentialMatches = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10, skills } = req.query;

  // Get current user with skills
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Build query for potential matches
  const query = {
    _id: { $ne: userId },
    $or: [
      // Users who want skills that current user offers
      { skillsWanted: { $in: currentUser.skillsOffered } },
      // Users who offer skills that current user wants
      { skillsOffered: { $in: currentUser.skillsWanted } }
    ]
  };

  // Filter by specific skills if provided
  if (skills) {
    const skillArray = skills.split(',');
    query.$or = [
      { skillsWanted: { $in: skillArray } },
      { skillsOffered: { $in: skillArray } }
    ];
  }

  // Get potential matches
  const potentialUsers = await User.find(query)
    .select('name email avatar bio skillsOffered skillsWanted rating totalConnections isOnline joinedAt')
    .limit(parseInt(limit))
    .sort({ rating: -1, totalConnections: -1 });

  // Calculate compatibility scores and check for existing matches
  const matchesWithCompatibility = await Promise.all(
    potentialUsers.map(async (user) => {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        $or: [
          { user1Id: userId, user2Id: user._id },
          { user1Id: user._id, user2Id: userId }
        ]
      });

      // Calculate compatibility score
      const matchingOffered = user.skillsOffered.filter(skill =>
        currentUser.skillsWanted.includes(skill)
      ).length;
      const matchingWanted = user.skillsWanted.filter(skill =>
        currentUser.skillsOffered.includes(skill)
      ).length;
      const totalMatches = matchingOffered + matchingWanted;
      const compatibilityScore = Math.min(95, 45 + (totalMatches * 12));

      return {
        user: user.toObject(),
        compatibilityScore,
        matchingSkills: {
          offered: user.skillsOffered.filter(skill => currentUser.skillsWanted.includes(skill)),
          wanted: user.skillsWanted.filter(skill => currentUser.skillsOffered.includes(skill))
        },
        hasExistingMatch: !!existingMatch,
        existingMatchStatus: existingMatch ? existingMatch.status : null
      };
    })
  );

  // Sort by compatibility score
  matchesWithCompatibility.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  res.json({
    success: true,
    data: {
      matches: matchesWithCompatibility,
      total: matchesWithCompatibility.length
    }
  });
});

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Private
const getMatchById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const match = await Match.findOne({
    _id: id,
    $or: [{ user1Id: userId }, { user2Id: userId }]
  }).populate([
    { path: 'user1Id', select: 'name email avatar skillsOffered skillsWanted rating' },
    { path: 'user2Id', select: 'name email avatar skillsOffered skillsWanted rating' }
  ]);

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Match not found'
    });
  }

  // Calculate compatibility score
  const otherUser = match.user1Id._id.toString() === userId ? match.user2Id : match.user1Id;
  const currentUser = match.user1Id._id.toString() === userId ? match.user1Id : match.user2Id;
  
  const matchingSkills = otherUser.skillsOffered.filter(skill =>
    currentUser.skillsWanted.includes(skill)
  ).length;
  const compatibilityScore = Math.min(95, 60 + (matchingSkills * 15));

  const matchData = {
    ...match.toObject(),
    otherUser,
    compatibilityScore,
    isUser1: match.user1Id._id.toString() === userId
  };

  res.json({
    success: true,
    data: matchData
  });
});

// @desc    Update match status
// @route   PUT /api/matches/:id/status
// @access  Private
const updateMatchStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const userId = req.user.id;

  if (!status || !['pending', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Valid status is required (pending, accepted, rejected, completed, cancelled)'
    });
  }

  const match = await Match.findOne({
    _id: id,
    $or: [{ user1Id: userId }, { user2Id: userId }]
  });

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Match not found'
    });
  }

  // Only allow status updates if match is pending or accepted
  if (!['pending', 'accepted'].includes(match.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update status of a completed or cancelled match'
    });
  }

  // Update match status
  match.status = status;
  if (reason) {
    match.statusReason = reason;
  }
  match.updatedAt = new Date();

  await match.save();

  // Populate user details
  await match.populate([
    { path: 'user1Id', select: 'name email avatar' },
    { path: 'user2Id', select: 'name email avatar' }
  ]);

  res.json({
    success: true,
    message: 'Match status updated successfully',
    data: match
  });
});

// @desc    Rate a match
// @route   POST /api/matches/:id/rate
// @access  Private
const rateMatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  const match = await Match.findOne({
    _id: id,
    $or: [{ user1Id: userId }, { user2Id: userId }],
    status: 'completed'
  });

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Completed match not found'
    });
  }

  // Check if user has already rated this match
  const existingRating = match.ratings.find(r => r.user.toString() === userId);
  if (existingRating) {
    return res.status(400).json({
      success: false,
      message: 'You have already rated this match'
    });
  }

  // Add rating
  match.ratings.push({
    user: userId,
    rating,
    comment: comment || '',
    createdAt: new Date()
  });

  // Calculate average rating
  const totalRating = match.ratings.reduce((sum, r) => sum + r.rating, 0);
  match.averageRating = totalRating / match.ratings.length;

  await match.save();

  res.json({
    success: true,
    message: 'Match rated successfully',
    data: {
      rating,
      comment,
      averageRating: match.averageRating
    }
  });
});

// @desc    Get match statistics
// @route   GET /api/matches/stats
// @access  Private
const getMatchStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await Match.aggregate([
    {
      $match: {
        $or: [{ user1Id: userId }, { user2Id: userId }]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statsObject = stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  const totalMatches = await Match.countDocuments({
    $or: [{ user1Id: userId }, { user2Id: userId }]
  });

  const completedMatches = await Match.countDocuments({
    $or: [{ user1Id: userId }, { user2Id: userId }],
    status: 'completed'
  });

  const averageRating = await Match.aggregate([
    {
      $match: {
        $or: [{ user1Id: userId }, { user2Id: userId }],
        status: 'completed',
        'ratings.0': { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$averageRating' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalMatches,
      completedMatches,
      averageRating: averageRating.length > 0 ? averageRating[0].avgRating : 0,
      statusBreakdown: statsObject
    }
  });
});

export {
  createMatch,
  getMatches,
  getPotentialMatches,
  getMatchById,
  updateMatchStatus,
  rateMatch,
  getMatchStats
};
