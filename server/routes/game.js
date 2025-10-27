const express = require('express');
const router = express.Router();
const { 
    getGames, 
    getGame, 
    createGame, 
    getLeaderboard,
    getGameHistory
} = require('../controllers/gameController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getGames);
router.get('/history', protect, getGameHistory);
router.get('/:roomCode', optionalAuth, getGame);
router.post('/create', protect, createGame);

module.exports = router;
