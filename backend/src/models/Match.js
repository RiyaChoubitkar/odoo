import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'active', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Skill exchange details
  exchangeDetails: {
    user1SkillOffered: {
      type: String,
      required: true
    },
    user2SkillOffered: {
      type: String,
      required: true
    },
    user1SkillWanted: {
      type: String,
      required: true
    },
    user2SkillWanted: {
      type: String,
      required: true
    }
  },
  // Meeting details
  meetings: [{
    date: Date,
    duration: Number, // in minutes
    location: String,
    notes: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  // Ratings and feedback
  ratings: {
    user1Rating: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: Date
    },
    user2Rating: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: Date
    }
  },
  // Communication preferences
  communicationPreferences: {
    preferredMethod: {
      type: String,
      enum: ['in-person', 'video-call', 'chat', 'mixed'],
      default: 'mixed'
    },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'flexible'],
      default: 'flexible'
    }
  },
  // Status tracking
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'accepted', 'active', 'declined', 'completed', 'cancelled']
    },
    date: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }],
  // Expiration
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if match is expired
matchSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Method to update status with history tracking
matchSchema.methods.updateStatus = function(newStatus, updatedBy, reason = '') {
  this.statusHistory.push({
    status: this.status,
    date: new Date(),
    updatedBy: updatedBy,
    reason: reason
  });
  this.status = newStatus;
  return this.save();
};

// Method to calculate compatibility score
matchSchema.methods.calculateCompatibilityScore = function() {
  // This is a simplified scoring algorithm
  // In a real app, you might want more sophisticated matching logic
  let score = 0;
  
  // Check if skills match (user1 offers what user2 wants and vice versa)
  if (this.exchangeDetails.user1SkillOffered === this.exchangeDetails.user2SkillWanted) {
    score += 40;
  }
  if (this.exchangeDetails.user2SkillOffered === this.exchangeDetails.user1SkillWanted) {
    score += 40;
  }
  
  // Additional scoring based on other factors could be added here
  // For example: location proximity, availability, rating compatibility, etc.
  
  this.compatibilityScore = Math.min(score, 100);
  return this.save();
};

// Ensure virtual fields are serialized
matchSchema.set('toJSON', { virtuals: true });

const Match = mongoose.model('Match', matchSchema);

export default Match; 