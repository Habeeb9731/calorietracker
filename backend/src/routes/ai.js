const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeFood } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Use memory storage — image is only needed for AI analysis, not stored on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.post('/', protect, upload.single('image'), analyzeFood);

module.exports = router;
