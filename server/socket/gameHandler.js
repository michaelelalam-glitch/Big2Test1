const Game = require('../models/Game');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');
const GameLogic = require('../utils/gameLogic');

// Store active games in memory for quick access
const activeGames = new Map();

const gameHandler = (io, socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join game room
    socket.on('join_game', async (data) => {
        try {
            const { roomCode, userId, username } = data;

            const game = await Game.findOne({ roomCode });

            if (!game) {
                return socket.emit('error', { message: 'Game not found' });
            }

            if (game.status === 'completed') {
                return socket.emit('error', { message: 'Game has ended' });
            }

            // Check if player is already in game
            const existingPlayer = game.players.find(p => p.userId && p.userId.toString() === userId);

            if (!existingPlayer) {
                // Add new player if room has space
                if (game.players.length >= game.settings.maxPlayers) {
                    return socket.emit('error', { message: 'Game is full' });
                }

                game.players.push({
                    userId,
                    username,
                    position: game.players.length,
                    isAI: false,
                    socketId: socket.id,
                    connected: true
                });
            } else {
                // Reconnect existing player
                existingPlayer.socketId = socket.id;
                existingPlayer.connected = true;
            }

            await game.save();

            // Join socket room
            socket.join(roomCode);
            socket.roomCode = roomCode;
            socket.userId = userId;

            // Send game state to joining player
            socket.emit('game_joined', {
                game: sanitizeGameForPlayer(game, userId)
            });

            // Notify other players
            socket.to(roomCode).emit('player_joined', {
                username,
                playersCount: game.players.filter(p => !p.isAI).length
            });

            console.log(`${username} joined game ${roomCode}`);

        } catch (error) {
            console.error('Error joining game:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    });

    // Start game (only creator can start)
    socket.on('start_game', async (data) => {
        try {
            const { roomCode } = data;

            const game = await Game.findOne({ roomCode });

            if (!game) {
                return socket.emit('error', { message: 'Game not found' });
            }

            // Check if user is creator
            if (game.creator.toString() !== socket.userId) {
                return socket.emit('error', { message: 'Only creator can start the game' });
            }

            if (game.status !== 'waiting') {
                return socket.emit('error', { message: 'Game already started' });
            }

            // Fill remaining slots with AI if enabled
            if (game.settings.aiEnabled) {
                while (game.players.length < game.settings.maxPlayers) {
                    game.players.push({
                        username: `AI Player ${game.players.length}`,
                        position: game.players.length,
                        isAI: true,
                        connected: true
                    });
                }
            }

            // Deal cards
            const { hands, startPlayer } = GameLogic.dealCards(true);

            game.status = 'in_progress';
            game.startedAt = new Date();
            game.gameState = {
                currentPlayer: startPlayer,
                round: 1,
                scores: [0, 0, 0, 0],
                hands: hands,
                lastPlay: null,
                lastPlayType: null,
                lastPlayPlayer: -1,
                currentTrick: [],
                consecutivePasses: 0,
                trickStartPlayer: startPlayer
            };

            await game.save();

            // Store in active games
            activeGames.set(roomCode, game);

            // Notify all players
            io.to(roomCode).emit('game_started', {
                players: game.players.map(p => ({
                    username: p.username,
                    position: p.position,
                    isAI: p.isAI
                })),
                currentPlayer: startPlayer,
                round: 1
            });

            // Send individual hands to each player
            game.players.forEach((player, index) => {
                if (!player.isAI && player.socketId) {
                    io.to(player.socketId).emit('your_hand', {
                        hand: hands[index]
                    });
                }
            });

            console.log(`Game ${roomCode} started`);

            // If AI starts, trigger AI move
            if (game.players[startPlayer].isAI) {
                setTimeout(() => processAITurn(io, roomCode), 2000);
            }

        } catch (error) {
            console.error('Error starting game:', error);
            socket.emit('error', { message: 'Failed to start game' });
        }
    });

    // Player makes a move
    socket.on('player_move', async (data) => {
        try {
            const { roomCode, cards } = data;

            const game = await Game.findOne({ roomCode });

            if (!game || game.status !== 'in_progress') {
                return socket.emit('error', { message: 'Game not found or not in progress' });
            }

            // Find player position
            const playerIndex = game.players.findIndex(p => 
                p.userId && p.userId.toString() === socket.userId
            );

            if (playerIndex === -1) {
                return socket.emit('error', { message: 'Player not in game' });
            }

            // Check if it's player's turn
            if (game.gameState.currentPlayer !== playerIndex) {
                return socket.emit('error', { message: 'Not your turn' });
            }

            // Validate move
            const isValid = GameLogic.isValidPlay(
                cards,
                game.gameState.lastPlay,
                game.gameState.lastPlayType,
                playerIndex === game.gameState.trickStartPlayer,
                game.gameState.round > 1 || game.gameState.lastPlay !== null
            );

            if (!isValid) {
                return socket.emit('error', { message: 'Invalid play' });
            }

            // Remove cards from player's hand
            const hand = game.gameState.hands[playerIndex];
            for (const card of cards) {
                const index = hand.findIndex(c => 
                    c.suit === card.suit && c.rank === card.rank
                );
                if (index !== -1) {
                    hand.splice(index, 1);
                }
            }

            // Update game state
            game.gameState.lastPlay = cards;
            game.gameState.lastPlayType = GameLogic.getCombinationType(cards);
            game.gameState.lastPlayPlayer = playerIndex;
            game.gameState.consecutivePasses = 0;

            // Add to current trick
            if (!game.gameState.currentTrick) game.gameState.currentTrick = [];
            game.gameState.currentTrick.push({
                player: playerIndex,
                cards: cards
            });

            // Check if player won
            if (hand.length === 0) {
                await handleRoundEnd(io, game, playerIndex);
                return;
            }

            // Next player
            game.gameState.currentPlayer = (game.gameState.currentPlayer + 1) % 4;

            await game.save();

            // Broadcast move to all players
            io.to(roomCode).emit('move_made', {
                player: playerIndex,
                username: game.players[playerIndex].username,
                cards: cards,
                cardsLeft: hand.length,
                currentPlayer: game.gameState.currentPlayer,
                lastPlayType: game.gameState.lastPlayType
            });

            // Update player's hand
            if (game.players[playerIndex].socketId) {
                io.to(game.players[playerIndex].socketId).emit('your_hand', {
                    hand: hand
                });
            }

            // Process AI turn if next player is AI
            if (game.players[game.gameState.currentPlayer].isAI) {
                setTimeout(() => processAITurn(io, roomCode), 1500);
            }

        } catch (error) {
            console.error('Error processing move:', error);
            socket.emit('error', { message: 'Failed to process move' });
        }
    });

    // Player passes
    socket.on('player_pass', async (data) => {
        try {
            const { roomCode } = data;

            const game = await Game.findOne({ roomCode });

            if (!game || game.status !== 'in_progress') {
                return socket.emit('error', { message: 'Game not found or not in progress' });
            }

            const playerIndex = game.players.findIndex(p => 
                p.userId && p.userId.toString() === socket.userId
            );

            if (playerIndex === -1 || game.gameState.currentPlayer !== playerIndex) {
                return socket.emit('error', { message: 'Not your turn' });
            }

            game.gameState.consecutivePasses++;

            // If 3 consecutive passes, start new trick
            if (game.gameState.consecutivePasses >= 3) {
                game.gameState.currentTrick = [];
                game.gameState.lastPlay = null;
                game.gameState.lastPlayType = null;
                game.gameState.consecutivePasses = 0;
                game.gameState.currentPlayer = game.gameState.lastPlayPlayer;
                game.gameState.trickStartPlayer = game.gameState.lastPlayPlayer;
                game.gameState.lastPlayPlayer = -1;

                io.to(roomCode).emit('new_trick', {
                    startPlayer: game.gameState.currentPlayer
                });
            } else {
                game.gameState.currentPlayer = (game.gameState.currentPlayer + 1) % 4;
            }

            await game.save();

            io.to(roomCode).emit('player_passed', {
                player: playerIndex,
                username: game.players[playerIndex].username,
                currentPlayer: game.gameState.currentPlayer
            });

            // Process AI turn if next player is AI
            if (game.players[game.gameState.currentPlayer].isAI) {
                setTimeout(() => processAITurn(io, roomCode), 1500);
            }

        } catch (error) {
            console.error('Error processing pass:', error);
            socket.emit('error', { message: 'Failed to process pass' });
        }
    });

    // Chat message
    socket.on('chat_message', async (data) => {
        try {
            const { roomCode, message } = data;

            const game = await Game.findOne({ roomCode });
            if (!game) return;

            const player = game.players.find(p => 
                p.userId && p.userId.toString() === socket.userId
            );

            if (!player) return;

            io.to(roomCode).emit('chat_message', {
                username: player.username,
                message,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error sending chat message:', error);
        }
    });

    // Player disconnects
    socket.on('disconnect', async () => {
        try {
            if (socket.roomCode) {
                const game = await Game.findOne({ roomCode: socket.roomCode });

                if (game) {
                    const player = game.players.find(p => p.socketId === socket.id);

                    if (player) {
                        player.connected = false;

                        await game.save();

                        socket.to(socket.roomCode).emit('player_disconnected', {
                            username: player.username
                        });

                        console.log(`${player.username} disconnected from game ${socket.roomCode}`);
                    }
                }
            }

            console.log(`User disconnected: ${socket.id}`);
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
};

// Helper function to process AI turn
async function processAITurn(io, roomCode) {
    try {
        const game = await Game.findOne({ roomCode });

        if (!game || game.status !== 'in_progress') return;

        const currentPlayer = game.gameState.currentPlayer;
        const player = game.players[currentPlayer];

        if (!player.isAI) return;

        const hand = game.gameState.hands[currentPlayer];

        // Get AI move
        const aiMove = GameLogic.getAIPlay(
            hand,
            game.gameState.lastPlay,
            game.gameState.lastPlayType
        );

        if (aiMove) {
            // Remove cards from AI hand
            for (const card of aiMove) {
                const index = hand.findIndex(c => 
                    c.suit === card.suit && c.rank === card.rank
                );
                if (index !== -1) {
                    hand.splice(index, 1);
                }
            }

            game.gameState.lastPlay = aiMove;
            game.gameState.lastPlayType = GameLogic.getCombinationType(aiMove);
            game.gameState.lastPlayPlayer = currentPlayer;
            game.gameState.consecutivePasses = 0;

            if (!game.gameState.currentTrick) game.gameState.currentTrick = [];
            game.gameState.currentTrick.push({
                player: currentPlayer,
                cards: aiMove
            });

            // Check if AI won
            if (hand.length === 0) {
                await handleRoundEnd(io, game, currentPlayer);
                return;
            }

            game.gameState.currentPlayer = (currentPlayer + 1) % 4;

            await game.save();

            io.to(roomCode).emit('move_made', {
                player: currentPlayer,
                username: player.username,
                cards: aiMove,
                cardsLeft: hand.length,
                currentPlayer: game.gameState.currentPlayer,
                lastPlayType: game.gameState.lastPlayType
            });

            // If next player is also AI, continue
            if (game.players[game.gameState.currentPlayer].isAI) {
                setTimeout(() => processAITurn(io, roomCode), 1500);
            }

        } else {
            // AI passes
            game.gameState.consecutivePasses++;

            if (game.gameState.consecutivePasses >= 3) {
                game.gameState.currentTrick = [];
                game.gameState.lastPlay = null;
                game.gameState.lastPlayType = null;
                game.gameState.consecutivePasses = 0;
                game.gameState.currentPlayer = game.gameState.lastPlayPlayer;
                game.gameState.trickStartPlayer = game.gameState.lastPlayPlayer;
                game.gameState.lastPlayPlayer = -1;

                io.to(roomCode).emit('new_trick', {
                    startPlayer: game.gameState.currentPlayer
                });
            } else {
                game.gameState.currentPlayer = (currentPlayer + 1) % 4;
            }

            await game.save();

            io.to(roomCode).emit('player_passed', {
                player: currentPlayer,
                username: player.username,
                currentPlayer: game.gameState.currentPlayer
            });

            // Continue if next player is AI
            if (game.players[game.gameState.currentPlayer].isAI) {
                setTimeout(() => processAITurn(io, roomCode), 1500);
            }
        }

    } catch (error) {
        console.error('Error processing AI turn:', error);
    }
}

// Handle round end
async function handleRoundEnd(io, game, winnerIndex) {
    try {
        // Calculate scores
        const roundScores = GameLogic.calculateRoundScores(
            game.players.map((p, i) => ({ hand: game.gameState.hands[i] })),
            winnerIndex
        );

        // Update total scores
        for (let i = 0; i < 4; i++) {
            game.gameState.scores[i] += roundScores[i];
        }

        io.to(game.roomCode).emit('round_ended', {
            winner: winnerIndex,
            winnerName: game.players[winnerIndex].username,
            roundScores,
            totalScores: game.gameState.scores
        });

        // Check if game is over (any player over 100 points)
        if (Math.max(...game.gameState.scores) >= 100) {
            await handleGameEnd(io, game);
        } else {
            // Start new round
            game.gameState.round++;
            const { hands, startPlayer } = GameLogic.dealCards(false);
            
            game.gameState.hands = hands;
            game.gameState.currentPlayer = winnerIndex; // Winner starts next round
            game.gameState.trickStartPlayer = winnerIndex;
            game.gameState.lastPlay = null;
            game.gameState.lastPlayType = null;
            game.gameState.lastPlayPlayer = -1;
            game.gameState.currentTrick = [];
            game.gameState.consecutivePasses = 0;

            await game.save();

            io.to(game.roomCode).emit('new_round', {
                round: game.gameState.round,
                startPlayer: winnerIndex
            });

            // Send new hands
            game.players.forEach((player, index) => {
                if (!player.isAI && player.socketId) {
                    io.to(player.socketId).emit('your_hand', {
                        hand: hands[index]
                    });
                }
            });

            // If AI starts, trigger AI
            if (game.players[winnerIndex].isAI) {
                setTimeout(() => processAITurn(io, game.roomCode), 2000);
            }
        }

    } catch (error) {
        console.error('Error handling round end:', error);
    }
}

// Handle game end
async function handleGameEnd(io, game) {
    try {
        const lowestScore = Math.min(...game.gameState.scores);
        const winnerIndex = game.gameState.scores.indexOf(lowestScore);

        game.status = 'completed';
        game.completedAt = new Date();
        game.winner = game.players[winnerIndex].userId;

        // Create game history
        const gameHistory = await GameHistory.create({
            gameId: game._id,
            players: game.players.map((p, i) => ({
                userId: p.userId,
                username: p.username,
                finalScore: game.gameState.scores[i],
                position: i,
                isWinner: i === winnerIndex
            })),
            winner: {
                userId: game.players[winnerIndex].userId,
                username: game.players[winnerIndex].username
            },
            totalRounds: game.gameState.round,
            duration: Math.floor((game.completedAt - game.startedAt) / 1000),
            finalScores: game.gameState.scores
        });

        // Update user stats
        for (let i = 0; i < game.players.length; i++) {
            const player = game.players[i];
            if (player.userId && !player.isAI) {
                const user = await User.findById(player.userId);
                if (user) {
                    user.stats.gamesPlayed++;
                    user.stats.totalScore += game.gameState.scores[i];
                    if (i === winnerIndex) {
                        user.stats.gamesWon++;
                    }
                    user.updateWinRate();
                    await user.save();
                }
            }
        }

        await game.save();

        io.to(game.roomCode).emit('game_ended', {
            winner: winnerIndex,
            winnerName: game.players[winnerIndex].username,
            finalScores: game.gameState.scores,
            totalRounds: game.gameState.round
        });

        // Remove from active games
        activeGames.delete(game.roomCode);

        console.log(`Game ${game.roomCode} ended. Winner: ${game.players[winnerIndex].username}`);

    } catch (error) {
        console.error('Error handling game end:', error);
    }
}

// Sanitize game data for a specific player (hide other players' hands)
function sanitizeGameForPlayer(game, userId) {
    const playerIndex = game.players.findIndex(p => 
        p.userId && p.userId.toString() === userId
    );

    const sanitized = game.toObject();

    if (sanitized.gameState && sanitized.gameState.hands) {
        sanitized.gameState.hands = sanitized.gameState.hands.map((hand, index) => {
            if (index === playerIndex) {
                return hand; // Show player's own hand
            } else {
                return Array(hand.length).fill({ hidden: true }); // Hide other hands
            }
        });
    }

    return sanitized;
}

module.exports = gameHandler;
