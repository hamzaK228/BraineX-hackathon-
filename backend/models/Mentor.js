const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
  },
  company: {
    type: String,
    required: [true, 'Please add a company/institution'],
  },
  field: {
    type: String,
    required: [true, 'Please add a field'],
  },
  experience: {
    type: String,
    enum: ['junior', 'mid', 'senior', 'lead'],
    default: 'mid',
  },
  bio: {
    type: String,
    required: [true, 'Please add a bio'],
  },
  expertise: [String],
  rate: {
    type: Number,
    required: [true, 'Please add a hourly rate'],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  mentees: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Mentor', mentorSchema);
