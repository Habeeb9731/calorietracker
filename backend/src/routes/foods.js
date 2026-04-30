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

// GET /foods/barcode/:code
router.get('/barcode/:code', protect, async (req, res) => {
  const { code } = req.params;

  // 1. Try Nutritionix (best coverage for branded foods)
  const nxId = process.env.NUTRITIONIX_APP_ID;
  const nxKey = process.env.NUTRITIONIX_APP_KEY;
  if (nxId && nxKey) {
    try {
      const r = await fetch(`https://trackapi.nutritionix.com/v2/search/item?upc=${code}`, {
        headers: { 'x-app-id': nxId, 'x-app-key': nxKey },
      });
      if (r.ok) {
        const data = await r.json();
        const food = data.foods?.[0];
        if (food && food.serving_weight_grams > 0) {
          const w = food.serving_weight_grams;
          return res.json({
            name: food.food_name,
            brand: food.brand_name || '',
            caloriesPer100g: Math.round((food.nf_calories / w) * 100),
            proteinPer100g: Math.round(((food.nf_protein || 0) / w) * 1000) / 10,
            carbsPer100g: Math.round(((food.nf_total_carbohydrate || 0) / w) * 1000) / 10,
            fatPer100g: Math.round(((food.nf_total_fat || 0) / w) * 1000) / 10,
            image: food.photo?.thumb || '',
          });
        }
      }
    } catch (e) {
      console.error('Nutritionix barcode error:', e.message);
    }
  }

  // 2. Fallback: Open Food Facts
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
    const data = await response.json();
    if (data.status === 1 && data.product) {
      const p = data.product;
      const n = p.nutriments || {};
      const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0);
      return res.json({
        name: p.product_name || p.abbreviated_product_name || 'Unknown Product',
        brand: p.brands || '',
        caloriesPer100g: Math.round(kcal),
        proteinPer100g: Math.round((n.proteins_100g || 0) * 10) / 10,
        carbsPer100g: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
        fatPer100g: Math.round((n.fat_100g || 0) * 10) / 10,
        image: p.image_front_small_url || '',
      });
    }
  } catch (e) {
    console.error('Open Food Facts barcode error:', e.message);
  }

  res.status(404).json({ error: 'Product not found in database' });
});

module.exports = router;
