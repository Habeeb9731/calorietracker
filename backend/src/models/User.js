const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  calorieGoal: {
    type: Number,
    default: parseInt(process.env.DEFAULT_CALORIE_GOAL) || 2000,
    min: [500, 'Calorie goal must be at least 500'],
    max: [10000, 'Calorie goal cannot exceed 10000'],
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
