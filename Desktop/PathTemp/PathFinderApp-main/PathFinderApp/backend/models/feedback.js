const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'replied', 'resolved', 'archived'],
    default: 'new'
  },
  reply: {
    type: String,
    trim: true
  },
  repliedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ rating: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);