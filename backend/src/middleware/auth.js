const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Find or create MongoDB profile for calorieGoal
  let profile = await User.findOne({ supabaseId: user.id });
  if (!profile) {
    const metaGoal = user.user_metadata?.calorieGoal;
    profile = await User.create({
      supabaseId: user.id,
      calorieGoal: metaGoal || parseInt(process.env.DEFAULT_CALORIE_GOAL) || 2000,
    });
  }

  req.user = user;           // Supabase user (id, email, user_metadata)
  req.userProfile = profile; // MongoDB profile (calorieGoal)
  next();
};

module.exports = { protect };
