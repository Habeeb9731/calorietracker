const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Meal title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  calories: {
    type: Number,
    required: [true, 'Calories is required'],
    min: [0, 'Calories cannot be negative'],
    max: [10000, 'Calories seem too high'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  aiDetected: {
    type: Boolean,
    default: false,
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null,
  },
  protein: { type: Number, min: 0, max: 1000, default: null },
  carbs: { type: Number, min: 0, max: 1000, default: null },
  fat: { type: Number, min: 0, max: 1000, default: null },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: '',
  },
}, { timestamps: true });

// Index for efficient date-based queries
mealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);
