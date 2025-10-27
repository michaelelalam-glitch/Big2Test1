import React, { useState, useEffect } from 'react';
import './Game.css';

function Game({ user, socket, gameState, onLeaveGame }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    if (socket) {
      socket.on('chat_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socket.on('player_move', (data) => {
        console.log('Player made move:', data);
      });

      socket.on('game_ended', (data) => {
        alert(`Game Over! Winner: ${data.winner?.username || 'Unknown'}`);
      });
    }

    return () => {
      if (socket) {
        socket.off('chat_message');
        socket.off('player_move');
        socket.off('game_ended');
      }
    };
  }, [socket]);

  const getPlayerHand = () => {
    const playerData = gameState.players.find(p => p.userId?._id === user._id || p.userId === user._id);
    return playerData?.hand || [];
  };

  const isMyTurn = () => {
    return gameState.currentPlayer === gameState.players.findIndex(
      p => p.userId?._id === user._id || p.userId === user._id
    );
  };

  const handleCardClick = (card) => {
    if (!isMyTurn()) return;

    const cardStr = `${card.rank}${card.suit}`;
    const index = selectedCards.findIndex(c => `${c.rank}${c.suit}` === cardStr);
    
    if (index > -1) {
      setSelectedCards(selectedCards.filter((_, i) => i !== index));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handlePlay = () => {
    if (selectedCards.length === 0 || !isMyTurn()) return;

    socket.emit('player_move', {
      gameId: gameState._id,
      cards: selectedCards
    });

    setSelectedCards([]);
  };

  const handlePass = () => {
    if (!isMyTurn()) return;

    socket.emit('player_pass', {
      gameId: gameState._id
    });
  };

  const handleStart = () => {
    socket.emit('start_game', {
      gameId: gameState._id
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socket.emit('chat_message', {
      gameId: gameState._id,
      message: chatInput.trim()
    });

    setChatInput('');
  };

  const renderCard = (card, onClick = null, selected = false) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div
        className={`card ${isRed ? 'red' : 'black'} ${selected ? 'selected' : ''}`}
        onClick={onClick}
        key={`${card.rank}${card.suit}`}
      >
        <div className="rank">{card.rank}</div>
        <div className="suit">{card.suit}</div>
        <div className="suit bottom">{card.suit}</div>
      </div>
    );
  };

  const renderPlayerArea = (playerIndex) => {
    const player = gameState.players[playerIndex];
    if (!player) return null;

    const isCurrentPlayer = gameState.currentPlayer === playerIndex;
    const isMe = player.userId?._id === user._id || player.userId === user._id;

    return (
      <div className={`player-area ${isCurrentPlayer ? 'active' : ''} ${isMe ? 'me' : ''}`}>
        <div className="player-info">
          <div className="player-name">
            {player.userId?.username || 'AI Player'}
            {isMe && ' (You)'}
          </div>
          <div className="card-count">Cards: {player.hand?.length || 0}</div>
        </div>
        {isMe && (
          <div className="hand">
            {player.hand?.map((card, idx) => 
              renderCard(
                card,
                () => handleCardClick(card),
                selectedCards.some(c => `${c.rank}${c.suit}` === `${card.rank}${card.suit}`)
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const canPlay = isMyTurn() && gameState.status === 'active';

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>{gameState.roomName || 'Big Two Game'}</h2>
        <div className="game-controls">
          {gameState.status === 'waiting' && (
            <button onClick={handleStart} className="btn-start">
              Start Game
            </button>
          )}
          <button onClick={onLeaveGame} className="btn-leave">
            Leave Game
          </button>
        </div>
      </div>

      <div className="game-board">
        {/* North Player */}
        <div className="position-north">
          {renderPlayerArea(2)}
        </div>

        {/* West Player */}
        <div className="position-west">
          {renderPlayerArea(1)}
        </div>

        {/* Center Play Area */}
        <div className="center-area">
          <div className="game-info">
            <div>Status: {gameState.status}</div>
            <div>Current Player: {gameState.players[gameState.currentPlayer]?.userId?.username || 'Waiting...'}</div>
          </div>

          <div className="play-area">
            <h3>Last Play</h3>
            {gameState.lastPlay && gameState.lastPlay.length > 0 ? (
              <div className="played-cards">
                {gameState.lastPlay.map((card, idx) => (
                  <div key={idx}>{renderCard(card)}</div>
                ))}
              </div>
            ) : (
              <div className="no-cards">No cards played yet</div>
            )}
          </div>

          {canPlay && (
            <div className="selected-cards-area">
              <h4>Selected Cards</h4>
              <div className="selected-cards">
                {selectedCards.map((card, idx) => (
                  <div key={idx}>{renderCard(card)}</div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button 
              onClick={handlePlay} 
              disabled={!canPlay || selectedCards.length === 0}
              className="btn-play"
            >
              Play Cards
            </button>
            <button 
              onClick={handlePass} 
              disabled={!canPlay}
              className="btn-pass"
            >
              Pass
            </button>
            <button 
              onClick={() => setSelectedCards([])}
              className="btn-clear"
            >
              Clear
            </button>
          </div>
        </div>

        {/* East Player */}
        <div className="position-east">
          {renderPlayerArea(3)}
        </div>

        {/* South Player (Me) */}
        <div className="position-south">
          {renderPlayerArea(0)}
        </div>
      </div>

      {/* Chat */}
      {showChat && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>Chat</h3>
            <button onClick={() => setShowChat(false)}>×</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className="chat-message">
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={200}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}

      {!showChat && (
        <button onClick={() => setShowChat(true)} className="chat-toggle">
          💬
        </button>
      )}
    </div>
  );
}

export default Game;
