import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Lobby.css';

// In production, API is served from same domain. In dev, use localhost:3001
const API_URL = process.env.REACT_APP_SERVER_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');

function Lobby({ user, socket, onJoinGame, onLogout }) {
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGames();
    fetchLeaderboard();

    if (socket) {
      socket.on('game_created', (game) => {
        setGames(prev => [...prev, game]);
      });

      socket.on('game_list_update', (updatedGames) => {
        setGames(updatedGames);
      });
    }

    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, [socket]);

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/games`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGames(response.data.filter(g => g.status === 'waiting'));
    } catch (err) {
      console.error('Failed to fetch games:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/leaderboard`);
      setLeaderboard(response.data.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  const handleCreateGame = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/games/create`,
        { roomName: roomName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onJoinGame(response.data._id);
      setShowCreate(false);
      setRoomName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = (gameId) => {
    onJoinGame(gameId);
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>🃏 Big Two Lobby</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      <div className="lobby-content">
        <div className="games-section">
          <div className="section-header">
            <h2>Active Games</h2>
            <button onClick={() => setShowCreate(!showCreate)} className="btn-create">
              {showCreate ? 'Cancel' : '+ Create Room'}
            </button>
          </div>

          {showCreate && (
            <div className="create-game-form">
              <input
                type="text"
                placeholder="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                maxLength={30}
              />
              <button onClick={handleCreateGame} disabled={loading} className="btn-primary">
                {loading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          )}

          <div className="games-list">
            {games.length === 0 ? (
              <div className="no-games">
                <p>No active games. Create one to start playing!</p>
              </div>
            ) : (
              games.map(game => (
                <div key={game._id} className="game-card">
                  <div className="game-info">
                    <h3>{game.roomName || 'Game Room'}</h3>
                    <p>Players: {game.players.length}/4</p>
                    <p>Status: {game.status}</p>
                  </div>
                  <button 
                    onClick={() => handleJoinGame(game._id)}
                    className="btn-join"
                    disabled={game.players.length >= 4}
                  >
                    {game.players.length >= 4 ? 'Full' : 'Join'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="leaderboard-section">
          <h2>🏆 Leaderboard</h2>
          <div className="leaderboard-list">
            {leaderboard.map((player, index) => (
              <div key={player._id} className="leaderboard-item">
                <span className="rank">#{index + 1}</span>
                <span className="username">{player.username}</span>
                <span className="wins">{player.wins} wins</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
