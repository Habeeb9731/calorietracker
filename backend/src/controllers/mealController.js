const Meal = require('../models/Meal');

// GET /meals — with optional date filter
const getMeals = async (req, res) => {
  try {
    const { date, startDate, endDate, limit = 50, page = 1 } = req.query;
    const filter = { user: req.user.id };

    if (date) {
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: day, $lt: nextDay };
    } else if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const meals = await Meal.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Meal.countDocuments(filter);

    res.json({ meals, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};

// POST /meals
const createMeal = async (req, res) => {
  try {
    const { title, calories, protein, carbs, fat, date, notes, imageUrl, aiDetected, aiConfidence } = req.body;

    if (!title || calories === undefined) {
      return res.status(400).json({ error: 'Title and calories are required' });
    }

    const meal = await Meal.create({
      user: req.user.id,
      title,
      calories: Number(calories),
      protein: protein != null ? Number(protein) : null,
      carbs: carbs != null ? Number(carbs) : null,
      fat: fat != null ? Number(fat) : null,
      date: date ? new Date(date) : new Date(),
      notes,
      imageUrl,
      aiDetected: !!aiDetected,
      aiConfidence: aiDetected ? aiConfidence : null,
    });

    res.status(201).json({ message: 'Meal logged', meal });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Failed to create meal' });
  }
};

// DELETE /meals/:id
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    await meal.deleteOne();
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete meal' });
  }
};

// GET /meals/dashboard — daily + weekly summary
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyMeals = await Meal.find({
      user: req.user.id,
      date: { $gte: today, $lt: tomorrow },
    });
    const dailyTotal = dailyMeals.reduce((sum, m) => sum + m.calories, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const weeklyMeals = await Meal.find({
      user: req.user.id,
      date: { $gte: weekAgo, $lt: tomorrow },
    });

    const toLocalDateKey = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const weeklyMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(d.getDate() + i);
      weeklyMap[toLocalDateKey(d)] = 0;
    }

    weeklyMeals.forEach((meal) => {
      const key = toLocalDateKey(meal.date);
      if (weeklyMap[key] !== undefined) weeklyMap[key] += meal.calories;
    });

    const weeklyData = Object.entries(weeklyMap).map(([date, calories]) => ({ date, calories }));

    res.json({
      dailyTotal,
      dailyMeals,
      weeklyData,
      calorieGoal: req.userProfile.calorieGoal,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = { getMeals, createMeal, deleteMeal, getDashboard };
