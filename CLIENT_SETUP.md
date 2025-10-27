# Client Setup Guide - React Frontend

The backend server is fully functional and ready to use. The React client has been initialized with Create React App and has Socket.IO Client and Axios installed.

## What's Already Done

✅ React app created with Create React App
✅ Socket.IO Client installed (`socket.io-client`)
✅ Axios installed for HTTP requests
✅ Project structure set up

## Client Architecture Overview

```
client/
├── public/
│   └── index.html
└── src/
    ├── components/
    │   ├── Auth/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── GuestLogin.js
    │   ├── Game/
    │   │   ├── GameBoard.js
    │   │   ├── PlayerHand.js
    │   │   ├── PlayArea.js
    │   │   ├── Card.js
    │   │   ├── Scoreboard.js
    │   │   └── Chat.js
    │   ├── Lobby/
    │   │   ├── GameList.js
    │   │   ├── CreateGame.js
    │   │   └── JoinGame.js
    │   └── Leaderboard/
    │       └── Leaderboard.js
    ├── services/
    │   ├── api.js          # Axios API calls
    │   ├── socket.js       # Socket.IO connection
    │   └── auth.js         # Auth helpers
    ├── utils/
    │   ├── gameLogic.js    # Client-side game validation
    │   └── cardHelpers.js  # Card rendering helpers
    ├── styles/
    │   ├── Game.css
    │   ├── Auth.css
    │   └── global.css
    ├── App.js              # Main component with routing
    ├── App.css
    └── index.js            # Entry point
```

## Step-by-Step Client Implementation

### Step 1: Create API Service

Create `client/src/services/api.js`:

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Authentication APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    guest: () => api.post('/auth/guest'),
    getMe: () => api.get('/auth/me')
};

// Game APIs
export const gameAPI = {
    getGames: () => api.get('/games'),
    getGame: (roomCode) => api.get(`/games/${roomCode}`),
    createGame: (data) => api.post('/games/create', data),
    getHistory: () => api.get('/games/history')
};

// User APIs
export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    getLeaderboard: () => api.get('/user/leaderboard')
};

export default api;
```

### Step 2: Create Socket Service

Create `client/src/services/socket.js`:

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    // Game events
    joinGame(data) {
        this.socket.emit('join_game', data);
    }

    startGame(roomCode) {
        this.socket.emit('start_game', { roomCode });
    }

    makeMove(roomCode, cards) {
        this.socket.emit('player_move', { roomCode, cards });
    }

    pass(roomCode) {
        this.socket.emit('player_pass', { roomCode });
    }

    sendMessage(roomCode, message) {
        this.socket.emit('chat_message', { roomCode, message });
    }

    // Event listeners
    on(event, callback) {
        this.socket.on(event, callback);
    }

    off(event, callback) {
        this.socket.off(event, callback);
    }
}

export default new SocketService();
```

### Step 3: Create Auth Context

Create `client/src/context/AuthContext.js`:

```javascript
import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            authAPI.getMe()
                .then(res => {
                    setUser(res.data.user);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (credentials) => {
        const res = await authAPI.login(credentials);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (credentials) => {
        const res = await authAPI.register(credentials);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const guestLogin = async () => {
        const res = await authAPI.guest();
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            guestLogin,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
```

### Step 4: Create Main App Component

Update `client/src/App.js`:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components (create these)
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Lobby from './components/Lobby/Lobby';
import Game from './components/Game/Game';
import Leaderboard from './components/Leaderboard/Leaderboard';
import PrivateRoute from './components/PrivateRoute';

import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/lobby" element={
                            <PrivateRoute>
                                <Lobby />
                            </PrivateRoute>
                        } />
                        <Route path="/game/:roomCode" element={
                            <PrivateRoute>
                                <Game />
                            </PrivateRoute>
                        } />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/" element={<Navigate to="/lobby" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
```

### Step 5: Key Components to Create

#### Login Component
`client/src/components/Auth/Login.js` - Form with email and password, links to register and guest login

#### Game Board Component  
`client/src/components/Game/GameBoard.js` - Main game interface with:
- 4 player positions (North, South, East, West)
- Current trick display
- Player hand management
- Play/Pass buttons
- Score display
- Chat sidebar

#### Card Component
`client/src/components/Game/Card.js` - Visual representation of a card with:
- Suit and rank display
- Click to select/deselect
- Selected state styling

### Step 6: Add React Router

```bash
cd client
npm install react-router-dom
```

### Step 7: Create Environment File

Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

### Step 8: Copy Styles from Original HTML

The original `big2.html` has excellent styling. Extract the CSS and adapt it for React components in `client/src/styles/`.

## Quick Start Template

Here's a minimal working example to get started quickly:

### Minimal App.js

```javascript
import React, { useState, useEffect } from 'react';
import socketService from './services/socket';
import { authAPI, gameAPI } from './services/api';

function App() {
    const [user, setUser] = useState(null);
    const [games, setGames] = useState([]);

    useEffect(() => {
        // Connect socket
        socketService.connect();

        // Try guest login
        authAPI.guest().then(res => {
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
        });

        // Load games
        gameAPI.getGames().then(res => {
            setGames(res.data.games);
        });

        return () => socketService.disconnect();
    }, []);

    const createGame = async () => {
        const res = await gameAPI.createGame({
            maxPlayers: 4,
            aiEnabled: true
        });
        console.log('Game created:', res.data);
    };

    return (
        <div>
            <h1>Big Two Multiplayer</h1>
            {user && <p>Welcome, {user.username}!</p>}
            <button onClick={createGame}>Create Game</button>
            <h2>Active Games</h2>
            <ul>
                {games.map(game => (
                    <li key={game._id}>
                        Room: {game.roomCode} - Players: {game.players.length}/4
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
```

## Testing the Client

1. **Start the server**: `npm run dev` (from root)
2. **Start the client**: `cd client && npm start`
3. **Open browser**: http://localhost:3000
4. **Check console**: Look for Socket connection message
5. **Test API**: Create/join games

## Integration with Existing HTML Game

You can convert the original `big2.html` game logic to React components:

1. **Extract game logic** → `utils/gameLogic.js`
2. **Convert HTML structure** → React components
3. **Replace inline handlers** → React event handlers
4. **Adapt CSS** → Component-specific CSS files
5. **Connect to Socket.IO** → Use socket service
6. **Use server validation** → Remove client-side validation

## Production Build

```bash
cd client
npm run build
```

This creates optimized production files in `client/build/`.

## Next Steps

1. ✅ Complete authentication UI
2. ✅ Build lobby and game list
3. ✅ Create game board interface
4. ✅ Implement card selection logic
5. ✅ Add real-time updates via Socket.IO
6. ✅ Style with CSS from original HTML
7. ✅ Add chat functionality
8. ✅ Test multiplayer with multiple tabs

## Resources

- [React Documentation](https://react.dev)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Router](https://reactrouter.com/)

## Need Help?

The server is fully functional and documented. Focus on:
1. Setting up Socket.IO connection
2. Handling Socket events
3. Making API calls with Axios
4. Managing game state in React
5. Rendering cards and game UI

All Socket events and API endpoints are documented in the main README.md file.

---

**The backend is ready - now build an amazing UI!** 🎨
