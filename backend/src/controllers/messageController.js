import Message from '../models/Message.js';
import Match from '../models/Match.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get messages for a match
// @route   GET /api/messages/:matchId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user._id;

  // Verify user is part of the match
  const match = await Match.findById(matchId);
  if (!match) {
    return res.status(404).json({ message: 'Match not found' });
  }

  if (match.user1Id.toString() !== userId.toString() && 
      match.user2Id.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Not authorized to view these messages' });
  }

  // Get messages
  const messages = await Message.find({
    matchId,
    deleted: false
  })
  .populate('senderId', 'name avatar')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .exec();

  // Mark messages as read
  await Message.markAllAsRead(matchId, userId);

  const total = await Message.countDocuments({
    matchId,
    deleted: false
  });

  res.json({
    success: true,
    data: {
      messages: messages.reverse(), // Return in chronological order
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }
  });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { matchId, message, messageType = 'text', attachments = [] } = req.body;
  const senderId = req.user._id;

  // Verify user is part of the match
  const match = await Match.findById(matchId);
  if (!match) {
    return res.status(404).json({ message: 'Match not found' });
  }

  if (match.user1Id.toString() !== senderId.toString() && 
      match.user2Id.toString() !== senderId.toString()) {
    return res.status(403).json({ message: 'Not authorized to send messages in this match' });
  }

  // Check if match is active
  if (!['accepted', 'active'].includes(match.status)) {
    return res.status(400).json({ message: 'Cannot send messages in this match status' });
  }

  // Create message
  const newMessage = await Message.create({
    matchId,
    senderId,
    message,
    messageType,
    attachments
  });

  // Populate sender details
  await newMessage.populate('senderId', 'name avatar');

  res.status(201).json({
    success: true,
    data: newMessage
  });
});

// @desc    Update a message
// @route   PUT /api/messages/:id
// @access  Private
export const updateMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const messageId = req.params.id;
  const userId = req.user._id;

  const messageDoc = await Message.findById(messageId);
  if (!messageDoc) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Check if user is the sender
  if (messageDoc.senderId.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this message' });
  }

  // Check if message is not too old (e.g., 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (messageDoc.createdAt < fiveMinutesAgo) {
    return res.status(400).json({ message: 'Cannot edit messages older than 5 minutes' });
  }

  // Update message
  await messageDoc.editMessage(message);

  // Populate sender details
  await messageDoc.populate('senderId', 'name avatar');

  res.json({
    success: true,
    data: messageDoc
  });
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Check if user is the sender
  if (message.senderId.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this message' });
  }

  // Soft delete message
  await message.softDelete(userId);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// @desc    Add reaction to message
// @route   POST /api/messages/:id/reactions
// @access  Private
export const addReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const messageId = req.params.id;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Verify user is part of the match
  const match = await Match.findById(message.matchId);
  if (match.user1Id.toString() !== userId.toString() && 
      match.user2Id.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Not authorized to react to this message' });
  }

  // Add reaction
  await message.addReaction(userId, emoji);

  // Populate sender details
  await message.populate('senderId', 'name avatar');

  res.json({
    success: true,
    data: message
  });
});

// @desc    Remove reaction from message
// @route   DELETE /api/messages/:id/reactions
// @access  Private
export const removeReaction = asyncHandler(async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Remove reaction
  await message.removeReaction(userId);

  // Populate sender details
  await message.populate('senderId', 'name avatar');

  res.json({
    success: true,
    data: message
  });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all matches for the user
  const matches = await Match.find({
    $or: [
      { user1Id: userId },
      { user2Id: userId }
    ],
    status: { $in: ['accepted', 'active'] }
  });

  const matchIds = matches.map(match => match._id);

  // Get unread count for each match
  const unreadCounts = await Promise.all(
    matchIds.map(async (matchId) => {
      const count = await Message.getUnreadCount(matchId, userId);
      return { matchId, count };
    })
  );

  const totalUnread = unreadCounts.reduce((sum, item) => sum + item.count, 0);

  res.json({
    success: true,
    data: {
      totalUnread,
      byMatch: unreadCounts
    }
  });
}); 