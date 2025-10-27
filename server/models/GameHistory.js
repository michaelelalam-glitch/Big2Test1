const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    players: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        finalScore: Number,
        position: Number,
        isWinner: Boolean
    }],
    winner: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    totalRounds: Number,
    duration: Number, // in seconds
    finalScores: [Number],
    playedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for leaderboard queries
gameHistorySchema.index({ 'winner.userId': 1 });
gameHistorySchema.index({ playedAt: -1 });

module.exports = mongoose.model('GameHistory', gameHistorySchema);
