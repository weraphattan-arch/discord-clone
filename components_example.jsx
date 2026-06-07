// ============ ChatWindow.jsx ============
export function ChatWindow({ messages, currentUserId }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === currentUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {msg.sender_id !== currentUserId && (
                  <p className="text-xs font-bold mb-1">User {msg.sender_id}</p>
                )}
                <p>{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MessageInput.jsx ============
import { useState } from 'react';

export function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
        >
          Send
        </button>
      </div>
    </form>
  );
}

// ============ FriendsList.jsx ============
import { useState } from 'react';

export function FriendsList({ friends, selectedFriend, onSelectFriend, onAddFriend }) {
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (friendEmail.trim()) {
      onAddFriend(friendEmail);
      setFriendEmail('');
      setAddingFriend(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h3 className="font-bold mb-4 text-sm uppercase text-gray-400">Friends</h3>

        {addingFriend && (
          <form onSubmit={handleAddFriend} className="mb-4 p-2 bg-gray-700 rounded">
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="Friend's email"
              className="w-full bg-gray-600 text-white px-2 py-1 rounded mb-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white text-sm px-2 py-1 rounded"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddingFriend(false)}
                className="flex-1 bg-gray-600 text-white text-sm px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!addingFriend && (
          <button
            onClick={() => setAddingFriend(true)}
            className="w-full mb-4 bg-gray-700 hover:bg-gray-600 text-white text-sm px-2 py-1 rounded"
          >
            + Add Friend
          </button>
        )}

        <div className="space-y-1">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className={`p-2 rounded cursor-pointer transition ${
                selectedFriend?.id === friend.id
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-sm">{friend.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ VoiceCall.jsx ============
import { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';

export function VoiceCall({ currentUser, onEndCall }) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([currentUser]);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' }
      });
      screenStreamRef.current = stream;
      setIsScreenSharing(true);
    } catch (error) {
      console.error('Failed to share screen:', error);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-black flex flex-col">
      {/* Call Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">In Call</h3>
          <p className="text-sm text-gray-400">{formatDuration(callDuration)}</p>
        </div>
        <button
          onClick={onEndCall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
        >
          End Call
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex items-center justify-center gap-4 p-4 overflow-auto">
        {/* Main Video Stream */}
        <div className="bg-gray-800 rounded-lg w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🎤</span>
            </div>
            <p className="text-white font-bold">{currentUser.username}</p>
            <p className="text-gray-400 text-sm">Your Video Feed</p>
          </div>
        </div>

        {/* Screen Share View */}
        {isScreenSharing && (
          <div className="bg-gray-700 rounded-lg w-96 h-auto flex items-center justify-center absolute bottom-4 right-4 border-2 border-blue-500">
            <p className="text-white text-center">🖥️ Screen Being Shared</p>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="bg-gray-900 border-t border-gray-700 p-4 flex justify-center gap-4">
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
          🎤 Mute
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
          📹 Camera
        </button>
        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`${isScreenSharing ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-opacity-80 text-white px-4 py-2 rounded`}
        >
          🖥️ {isScreenSharing ? 'Stop Share' : 'Share Screen'}
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
          👥 Participants ({participants.length})
        </button>
      </div>
    </div>
  );
}

// ============ GameVoting.jsx ============
import { useState, useEffect } from 'react';
import axios from 'axios';

export function GameVoting({ currentUserId }) {
  const [games, setGames] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [customGame, setCustomGame] = useState('');

  const predefinedGames = [
    'Valorant',
    'League of Legends',
    'CS:GO',
    'Fortnite',
    'Minecraft',
    'Among Us',
    'Rocket League',
    'PUBG'
  ];

  useEffect(() => {
    loadTopGames();
  }, []);

  const loadTopGames = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/games/top-votes');
      setTopGames(response.data);
    } catch (error) {
      console.error('Failed to load game votes:', error);
    }
  };

  const handleVoteGame = async (gameName) => {
    try {
      await axios.post('http://localhost:8000/api/games/vote',
        { game_name: gameName },
        { params: { user_id: currentUserId } }
      );
      loadTopGames();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleCustomVote = () => {
    if (customGame.trim()) {
      handleVoteGame(customGame);
      setCustomGame('');
    }
  };

  return (
    <div className="flex-1 bg-gray-900 flex flex-col overflow-auto">
      <div className="p-6 max-w-2xl">
        <h2 className="text-3xl font-bold mb-8 text-white">🎮 Game Voting</h2>

        {/* Top Games */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-white">Top Games</h3>
          <div className="space-y-2">
            {topGames.slice(0, 5).map((game, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">{game.game_name}</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
                    {game.vote_count} votes
                  </span>
                </div>
                <div className="mt-2 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(game.vote_count / (topGames[0]?.vote_count || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predefined Games */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-white">Vote for a Game</h3>
          <div className="grid grid-cols-2 gap-3">
            {predefinedGames.map((game) => (
              <button
                key={game}
                onClick={() => handleVoteGame(game)}
                className="bg-gray-800 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition"
              >
                {game}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Game */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-white">Suggest a Game</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customGame}
              onChange={(e) => setCustomGame(e.target.value)}
              placeholder="Enter game name..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleCustomVote}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-semibold"
            >
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
