const Game = require('../models/Game');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');

// @desc    Get all active games
// @route   GET /api/games
exports.getGames = async (req, res, next) => {
    try {
        const games = await Game.find({ 
            status: { $in: ['waiting', 'in_progress'] } 
        })
        .populate('creator', 'username')
        .select('-gameState.hands')
        .limit(50)
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: games.length,
            games
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get game by room code
// @route   GET /api/games/:roomCode
exports.getGame = async (req, res, next) => {
    try {
        const game = await Game.findOne({ roomCode: req.params.roomCode })
            .populate('creator', 'username')
            .populate('players.userId', 'username');

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        res.status(200).json({
            success: true,
            game
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new game
// @route   POST /api/games/create
exports.createGame = async (req, res, next) => {
    try {
        const { maxPlayers, aiEnabled, turnTimeout } = req.body;

        let roomCode;
        let isUnique = false;

        while (!isUnique) {
            roomCode = Game.generateRoomCode();
            const existing = await Game.findOne({ roomCode });
            if (!existing) isUnique = true;
        }

        const game = await Game.create({
            roomCode,
            creator: req.user._id,
            players: [{
                userId: req.user._id,
                username: req.user.username,
                position: 0,
                isAI: false,
                connected: true
            }],
            settings: {
                maxPlayers: maxPlayers || 4,
                aiEnabled: aiEnabled !== undefined ? aiEnabled : true,
                turnTimeout: turnTimeout || 60000
            }
        });

        res.status(201).json({
            success: true,
            game
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get leaderboard
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res, next) => {
    try {
        const users = await User.find({ isGuest: false })
            .select('username stats')
            .sort({ 'stats.gamesWon': -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            leaderboard: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user game history
// @route   GET /api/games/history
exports.getGameHistory = async (req, res, next) => {
    try {
        const history = await GameHistory.find({
            'players.userId': req.user._id
        })
        .sort({ playedAt: -1 })
        .limit(20);

        res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/user/profile
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};
