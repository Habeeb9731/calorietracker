const User = require('../models/User');

// GET /auth/me
const getMe = async (req, res) => {
  const supabaseUser = req.user;
  const profile = req.userProfile;

  res.json({
    user: {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
      email: supabaseUser.email,
      calorieGoal: profile.calorieGoal,
    },
  });
};

// PATCH /auth/update-goal
const updateGoal = async (req, res) => {
  try {
    const { calorieGoal } = req.body;
    if (!calorieGoal || isNaN(calorieGoal)) {
      return res.status(400).json({ error: 'Valid calorie goal is required' });
    }

    const profile = await User.findOneAndUpdate(
      { supabaseId: req.user.id },
      { calorieGoal: Number(calorieGoal) },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Calorie goal updated', calorieGoal: profile.calorieGoal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

module.exports = { getMe, updateGoal };
