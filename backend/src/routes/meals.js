const express = require('express');
const router = express.Router();
const { getMeals, createMeal, deleteMeal, getDashboard } = require('../controllers/mealController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/', getMeals);
router.post('/', createMeal);
router.delete('/:id', deleteMeal);

module.exports = router;
