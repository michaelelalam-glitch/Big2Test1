# Big Two (大老二) - Online Multiplayer Card Game

A full-stack, real-time multiplayer implementation of the classic Big Two card game with AI opponents, chat functionality, and comprehensive game statistics.

![Big Two Game](https://img.shields.io/badge/Game-Big%20Two-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6+-010101)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Game Rules](#game-rules)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Socket Events](#socket-events)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Gameplay
- ♠️ Full Big Two game implementation with all card combinations
- 👥 4-player multiplayer support with real-time synchronization
- 🤖 AI opponents to fill empty slots
- 🎮 Smooth, responsive gameplay with instant updates
- 📱 Mobile-responsive design

### User Features
- 🔐 Secure user authentication (register/login)
- 👤 Guest mode for quick play
- 📊 Player statistics and win tracking
- 🏆 Global leaderboard
- 📜 Game history

### Game Features
- 🎯 Room-based matchmaking
- 💬 In-game chat system
- 🔄 Reconnection handling for disconnected players
- ⏱️ Turn timers and game timeouts
- 🎲 Random card dealing with shuffle
- ✅ Server-side validation for all moves

### Technical Features
- 🔌 WebSocket (Socket.IO) for real-time communication
- 🛡️ Rate limiting and security middleware
- 📈 Scalable architecture
- 🗄️ MongoDB database with Mongoose ODM
- 🔒 JWT-based authentication
- 🚀 Ready for production deployment on Render

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - UI framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting
- **Morgan** - HTTP request logging

## 🎴 Game Rules

### Basic Rules
Big Two (also known as Deuces or Chinese Poker) is a card game for 4 players.

### Card Rankings
- **Rank**: 3 (lowest) < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2 (highest)
- **Suit**: ♦ (lowest) < ♣ < ♥ < ♠ (highest)

### Valid Combinations
1. **Single**: Any single card
2. **Pair**: Two cards of the same rank
3. **Triple**: Three cards of the same rank
4. **Five-Card Hands**:
   - **Straight**: Five consecutive ranks (e.g., 3-4-5-6-7)
   - **Flush**: Five cards of the same suit
   - **Full House**: Three of a kind + a pair
   - **Four of a Kind**: Four cards of the same rank + any card
   - **Straight Flush**: Five consecutive cards of the same suit

### How to Play
1. Player with 3♦ starts the first round
2. Players must play a higher combination of the same type
3. Pass if you can't beat the current play
4. After 3 consecutive passes, the last player to play starts a new trick
5. First player to empty their hand wins the round
6. Game ends when a player reaches 100+ points

### Scoring
- **1-4 cards left**: 1 point per card
- **5-9 cards left**: 2 points per card
- **10+ cards left**: 3 points per card

## 📥 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Clone the Repository
```bash
git clone https://github.com/yourusername/big2-multiplayer.git
cd big2-multiplayer
```

### Install Dependencies

#### Server
```bash
npm install
```

#### Client
```bash
cd client
npm install
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/big2-multiplayer
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/big2-multiplayer

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Game Configuration
MAX_PLAYERS_PER_GAME=4
GAME_TIMEOUT_MS=300000
PLAYER_TURN_TIMEOUT_MS=60000
```

### MongoDB Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB (macOS with Homebrew)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# The default connection string is:
# mongodb://localhost:27017/big2-multiplayer
```

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Add to `.env` file

## 🚀 Running Locally

### Development Mode

#### Terminal 1 - Start Backend Server
```bash
npm run dev
```
Server will run on http://localhost:3001

#### Terminal 2 - Start React Client
```bash
cd client
npm start
```
Client will run on http://localhost:3000

### Production Build
```bash
# Build client
cd client
npm run build

# Start server
cd ..
npm start
```

## 🌐 Deployment

### Deploy to Render

#### 1. Prerequisites
- GitHub account
- Render account (free tier available)
- MongoDB Atlas database (or other cloud MongoDB)

#### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/big2-multiplayer.git
git push -u origin main
```

#### 3. Deploy on Render

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: big2-multiplayer-server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Add Environment Variables**
   - Add all variables from `.env.example`
   - Set `MONGODB_URI` to your MongoDB Atlas connection string
   - Set `CLIENT_URL` to your deployed frontend URL

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Deploy Client (Optional)

You can deploy the React client separately or serve it from Express.

#### Option A: Separate Deployment on Render
1. Create new Static Site on Render
2. Build Command: `cd client && npm install && npm run build`
3. Publish Directory: `client/build`

#### Option B: Serve from Express
Add to `server/index.js`:
```javascript
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player1@example.com",
  "password": "password123"
}
```

#### Guest Login
```http
POST /api/auth/guest
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Game Endpoints

#### Get Active Games
```http
GET /api/games
```

#### Get Game by Room Code
```http
GET /api/games/:roomCode
```

#### Create New Game
```http
POST /api/games/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "maxPlayers": 4,
  "aiEnabled": true,
  "turnTimeout": 60000
}
```

#### Get Game History
```http
GET /api/games/history
Authorization: Bearer <token>
```

### User Endpoints

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### Get Leaderboard
```http
GET /api/user/leaderboard
```

## 🔌 Socket Events

### Client to Server

#### Join Game
```javascript
socket.emit('join_game', {
    roomCode: 'ABC123',
    userId: 'user_id',
    username: 'Player1'
});
```

#### Start Game
```javascript
socket.emit('start_game', {
    roomCode: 'ABC123'
});
```

#### Make Move
```javascript
socket.emit('player_move', {
    roomCode: 'ABC123',
    cards: [
        { suit: '♠', rank: '3' }
    ]
});
```

#### Pass Turn
```javascript
socket.emit('player_pass', {
    roomCode: 'ABC123'
});
```

#### Send Chat Message
```javascript
socket.emit('chat_message', {
    roomCode: 'ABC123',
    message: 'Good game!'
});
```

### Server to Client

#### Game Joined
```javascript
socket.on('game_joined', (data) => {
    // data.game contains full game state
});
```

#### Player Joined
```javascript
socket.on('player_joined', (data) => {
    // data.username, data.playersCount
});
```

#### Game Started
```javascript
socket.on('game_started', (data) => {
    // data.players, data.currentPlayer, data.round
});
```

#### Your Hand
```javascript
socket.on('your_hand', (data) => {
    // data.hand contains player's cards
});
```

#### Move Made
```javascript
socket.on('move_made', (data) => {
    // data.player, data.cards, data.cardsLeft, data.currentPlayer
});
```

#### Player Passed
```javascript
socket.on('player_passed', (data) => {
    // data.player, data.username, data.currentPlayer
});
```

#### Round Ended
```javascript
socket.on('round_ended', (data) => {
    // data.winner, data.roundScores, data.totalScores
});
```

#### Game Ended
```javascript
socket.on('game_ended', (data) => {
    // data.winner, data.finalScores
});
```

#### Error
```javascript
socket.on('error', (data) => {
    // data.message
});
```

## 📁 Project Structure

```
big2-multiplayer/
├── server/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Game.js              # Game schema
│   │   └── GameHistory.js       # Game history schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── game.js              # Game routes
│   │   └── user.js              # User routes
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   └── gameController.js    # Game logic
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   └── errorHandler.js      # Error handling
│   ├── socket/
│   │   └── gameHandler.js       # Socket.IO events
│   ├── utils/
│   │   └── gameLogic.js         # Game rules & AI
│   └── index.js                 # Server entry point
├── client/
│   ├── public/
│   └── src/
│       ├── components/          # React components
│       ├── services/            # API & Socket services
│       ├── utils/               # Helper functions
│       ├── styles/              # CSS files
│       └── App.js               # Main component
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore file
├── package.json                 # Server dependencies
├── render.yaml                  # Render deployment config
└── README.md                    # This file
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Big Two game rules and mechanics
- Socket.IO for real-time functionality
- MongoDB for flexible data storage
- React community for excellent documentation

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: your-email@example.com

## 🗺️ Roadmap

- [ ] Add tournament mode
- [ ] Implement friend system
- [ ] Add more AI difficulty levels
- [ ] Create mobile apps (React Native)
- [ ] Add game replay feature
- [ ] Implement achievements and badges
- [ ] Add voice chat support
- [ ] Create spectator mode enhancements

---

**Built with ❤️ for card game enthusiasts**
