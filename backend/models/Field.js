const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a field name'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['stem', 'humanities', 'business', 'arts', 'other'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  icon: {
    type: String,
    default: '🎓',
  },
  salary: {
    type: String,
  },
  careers: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Field', fieldSchema);
