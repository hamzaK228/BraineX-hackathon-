const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    default: 'Online',
  },
  type: {
    // e.g., 'Webinar', 'Workshop', 'Conference'
    type: String,
    default: 'Webinar',
  },
  description: String,
  image: String,
  link: String,
  speakers: [String],
  attendees: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['upcoming', 'past', 'cancelled'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for easier searching
eventSchema.index({ title: 'text', description: 'text', type: 1 });

module.exports = mongoose.model('Event', eventSchema);
