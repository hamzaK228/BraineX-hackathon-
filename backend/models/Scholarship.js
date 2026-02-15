const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  id: {
    type: Number, // Keeping numeric ID for compatibility with frontend/demo data
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a scholarship name'],
    trim: true,
  },
  organization: {
    type: String,
    required: [true, 'Please add an organization'],
    trim: true,
  },
  amount: {
    type: String,
    required: [true, 'Please add funding amount'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['undergraduate', 'graduate', 'research', 'other'],
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline'],
  },
  country: {
    type: String,
    required: [true, 'Please add a country'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  website: {
    type: String,
    required: [true, 'Please add a website URL'],
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please use a valid URL',
    ],
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'upcoming'],
    default: 'active',
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate numeric ID if missing (simple counter implementation for MongoDB would be better, but we stick to simpler approach for now or rely on client/controller to set it for demo consistency)
// For a real production app we'd use _id or a counter collection.
// For this hybrid mode, we will allow id to be passed or we can use _id for Mongo.
// However, the current frontend relies on numeric `id`.

module.exports = mongoose.model('Scholarship', scholarshipSchema);
