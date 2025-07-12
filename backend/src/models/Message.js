import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'location', 'meeting-proposal'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'audio', 'video']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  // For meeting proposals
  meetingProposal: {
    date: Date,
    duration: Number, // in minutes
    location: String,
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'rescheduled'],
      default: 'pending'
    }
  },
  // For system messages
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  systemMessageType: {
    type: String,
    enum: ['match-created', 'match-accepted', 'match-declined', 'meeting-scheduled', 'meeting-completed'],
    default: null
  },
  // Message reactions
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Message editing
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  originalMessage: String,
  // Message deletion
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
messageSchema.index({ matchId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ read: 1, matchId: 1 });

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user if exists
  this.reactions = this.reactions.filter(reaction => 
    reaction.userId.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    userId,
    emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(reaction => 
    reaction.userId.toString() !== userId.toString()
  );
  return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newMessage) {
  this.originalMessage = this.message;
  this.message = newMessage;
  this.edited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function(userId) {
  this.deleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// Static method to get unread count for a user in a match
messageSchema.statics.getUnreadCount = function(matchId, userId) {
  return this.countDocuments({
    matchId,
    senderId: { $ne: userId },
    read: false,
    deleted: false
  });
};

// Static method to mark all messages as read in a match
messageSchema.statics.markAllAsRead = function(matchId, userId) {
  return this.updateMany(
    {
      matchId,
      senderId: { $ne: userId },
      read: false,
      deleted: false
    },
    {
      read: true,
      readAt: new Date()
    }
  );
};

const Message = mongoose.model('Message', messageSchema);

export default Message; 