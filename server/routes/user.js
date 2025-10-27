const express = require('express');
const router = express.Router();
const { getUserProfile, getLeaderboard } = require('../controllers/gameController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getUserProfile);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
