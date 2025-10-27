import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// Components
import Auth from './components/Auth';
import Lobby from './components/Lobby';
import Game from './components/Game';

const SOCKET_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('auth'); // auth, lobby, game
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView('lobby');
      connectSocket(token);
    }
  }, []);

  const connectSocket = (token) => {
    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('game_state_update', (gameState) => {
      setCurrentGame(gameState);
    });

    newSocket.on('game_started', (gameState) => {
      setCurrentGame(gameState);
      setCurrentView('game');
    });

    newSocket.on('player_joined', (data) => {
      console.log('Player joined:', data);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message || 'An error occurred');
    });

    setSocket(newSocket);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setCurrentView('lobby');
    connectSocket(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket) {
      socket.disconnect();
    }
    setUser(null);
    setSocket(null);
    setCurrentView('auth');
    setCurrentGame(null);
  };

  const handleJoinGame = (gameId) => {
    if (socket) {
      socket.emit('join_game', { gameId });
      setCurrentView('game');
    }
  };

  const handleLeaveGame = () => {
    if (socket && currentGame) {
      socket.emit('leave_game', { gameId: currentGame._id });
    }
    setCurrentGame(null);
    setCurrentView('lobby');
  };

  return (
    <div className="App">
      {currentView === 'auth' && (
        <Auth onLogin={handleLogin} />
      )}
      
      {currentView === 'lobby' && (
        <Lobby 
          user={user}
          socket={socket}
          onJoinGame={handleJoinGame}
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'game' && currentGame && (
        <Game 
          user={user}
          socket={socket}
          gameState={currentGame}
          onLeaveGame={handleLeaveGame}
        />
      )}
    </div>
  );
}

export default App;
