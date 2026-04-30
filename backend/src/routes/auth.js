const express = require('express');
const router = express.Router();
const { getMe, updateGoal } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.patch('/update-goal', protect, updateGoal);

module.exports = router;
