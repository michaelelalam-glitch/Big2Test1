const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    players: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        position: Number, // 0-3
        isAI: Boolean,
        socketId: String,
        connected: Boolean
    }],
    status: {
        type: String,
        enum: ['waiting', 'starting', 'in_progress', 'paused', 'completed', 'abandoned'],
        default: 'waiting'
    },
    gameState: {
        currentPlayer: { type: Number, default: 0 },
        round: { type: Number, default: 1 },
        scores: [Number],
        hands: [[{
            suit: String,
            rank: String
        }]],
        lastPlay: [{
            suit: String,
            rank: String
        }],
        lastPlayType: mongoose.Schema.Types.Mixed,
        lastPlayPlayer: Number,
        currentTrick: mongoose.Schema.Types.Mixed,
        consecutivePasses: { type: Number, default: 0 },
        trickStartPlayer: Number
    },
    settings: {
        maxPlayers: { type: Number, default: 4 },
        aiEnabled: { type: Boolean, default: true },
        turnTimeout: { type: Number, default: 60000 },
        spectatorMode: { type: Boolean, default: true }
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startedAt: Date,
    completedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique room code
gameSchema.statics.generateRoomCode = function() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

module.exports = mongoose.model('Game', gameSchema);
