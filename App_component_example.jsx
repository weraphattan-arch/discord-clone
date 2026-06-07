import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from './components/ChatWindow';
import FriendsList from './components/FriendsList';
import VoiceCall from './components/VoiceCall';
import GameVoting from './components/GameVoting';
import MessageInput from './components/MessageInput';

const API_URL = 'http://localhost:8000/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [showGaming, setShowGaming] = useState(false);
  const [userStatus, setUserStatus] = useState('online');

  // Initialize app - load current user
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check localStorage for logged-in user
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await axios.get(`${API_URL}/users/${userId}`);
          setCurrentUser(response.data);
          loadFriendsAndGroups(userId);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    initializeApp();
  }, []);

  const loadFriendsAndGroups = async (userId) => {
    try {
      const friendsRes = await axios.get(`${API_URL}/users/${userId}/friends`);
      setFriends(friendsRes.data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const handleLogin = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, null, {
        params: { email }
      });
      setCurrentUser(response.data);
      localStorage.setItem('userId', response.data.id);
      loadFriendsAndGroups(response.data.id);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your email.');
    }
  };

  const handleRegister = async (username, email) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        username,
        email
      });
      setCurrentUser(response.data);
      localStorage.setItem('userId', response.data.id);
      loadFriendsAndGroups(response.data.id);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Email might already be in use.');
    }
  };

  const handleSelectFriend = async (friend) => {
    setSelectedFriend(friend);
    setSelectedGroup(null);
    try {
      const response = await axios.get(
        `${API_URL}/messages/direct/${currentUser.id}/${friend.id}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setSelectedFriend(null);
    try {
      const response = await axios.get(`${API_URL}/messages/group/${group.id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load group messages:', error);
    }
  };

  const handleSendMessage = async (content) => {
    if (!currentUser) return;

    try {
      if (selectedFriend) {
        // Send direct message
        await axios.post(`${API_URL}/messages/direct`, {
          recipient_id: selectedFriend.id,
          content
        });
      } else if (selectedGroup) {
        // Send group message
        await axios.post(`${API_URL}/messages/group`,
          {
            group_id: selectedGroup.id,
            content
          },
          { params: { sender_id: currentUser.id } }
        );
      }
      // Reload messages
      if (selectedFriend) {
        handleSelectFriend(selectedFriend);
      } else if (selectedGroup) {
        handleSelectGroup(selectedGroup);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleStartCall = async () => {
    if (!currentUser) return;
    try {
      const response = await axios.post(`${API_URL}/calls`,
        { max_participants: 30 },
        { params: { initiator_id: currentUser.id } }
      );
      setInCall(true);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const handleAddFriend = async (email) => {
    try {
      const friendRes = await axios.get(`${API_URL}/users`, {
        params: { email }
      });
      if (friendRes.data.length > 0) {
        await axios.post(
          `${API_URL}/users/${currentUser.id}/friends/${friendRes.data[0].id}`
        );
        loadFriendsAndGroups(currentUser.id);
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  // Login screen
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="bg-white rounded-lg shadow-xl p-8 w-96">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Discord Clone</h1>
          <LoginForm onLogin={handleLogin} onRegister={handleRegister} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">Discord Clone</h2>
          <p className="text-sm text-gray-400">{currentUser.username}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setUserStatus('online')}
              className={`px-2 py-1 rounded text-xs ${
                userStatus === 'online' ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setUserStatus('away')}
              className={`px-2 py-1 rounded text-xs ${
                userStatus === 'away' ? 'bg-yellow-600' : 'bg-gray-700'
              }`}
            >
              Away
            </button>
          </div>
        </div>

        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={handleSelectFriend}
          onAddFriend={handleAddFriend}
        />

        <div className="mt-auto p-4 border-t border-gray-700 flex gap-2">
          <button
            onClick={handleStartCall}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded"
          >
            📞 Call
          </button>
          <button
            onClick={() => setShowGaming(!showGaming)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded"
          >
            🎮 Games
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {inCall ? (
          <VoiceCall
            currentUser={currentUser}
            onEndCall={() => setInCall(false)}
          />
        ) : showGaming ? (
          <GameVoting currentUserId={currentUser.id} />
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              <h2 className="text-xl font-bold">
                {selectedFriend ? `Chat with ${selectedFriend.username}` : selectedGroup ? selectedGroup.name : 'Select a chat'}
              </h2>
              <p className="text-sm text-gray-400">
                {selectedFriend?.status === 'online' ? '🟢 Online' : '⚫ Offline'}
              </p>
            </div>

            {/* Messages */}
            <ChatWindow messages={messages} currentUserId={currentUser.id} />

            {/* Message Input */}
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        )}
      </div>
    </div>
  );
}

function LoginForm({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      onRegister(username, email);
    } else {
      onLogin(email);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {isRegister && (
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
        required
      />
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
      >
        {isRegister ? 'Register' : 'Login'}
      </button>
      <button
        type="button"
        onClick={() => setIsRegister(!isRegister)}
        className="w-full mt-2 text-indigo-600 text-sm"
      >
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </form>
  );
}
