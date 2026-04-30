const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const NUTRIENT = { calories: 1008, protein: 1003, carbs: 1005, fat: 1004 };

// GET /foods/search?q=chicken
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&pageSize=10&dataType=Foundation,SR%20Legacy&api_key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'USDA API request failed' });
    }

    const data = await response.json();

    const foods = (data.foods || []).map((food) => {
      const nm = {};
      (food.foodNutrients || []).forEach((n) => { nm[n.nutrientId] = n.value; });
      return {
        fdcId: food.fdcId,
        name: food.description,
        calories: Math.round(nm[NUTRIENT.calories] || 0),
        protein: Math.round(nm[NUTRIENT.protein] || 0),
        carbs: Math.round(nm[NUTRIENT.carbs] || 0),
        fat: Math.round(nm[NUTRIENT.fat] || 0),
      };
    });

    res.json({ foods });
  } catch (err) {
    console.error('USDA search error:', err);
    res.status(500).json({ error: 'Food search failed' });
  }
});

module.exports = router;
