const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
  },
  type: {
    type: String,
    enum: ['scholarship', 'mentorship', 'event'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  data: {
    type: Object, // Flexible storage for form data
    default: {},
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one application per scholarship/mentor per user if needed, or allow multiples
// applicationSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true, partialFilterExpression: { scholarshipId: { $exists: true } } });

module.exports = mongoose.model('Application', applicationSchema);
