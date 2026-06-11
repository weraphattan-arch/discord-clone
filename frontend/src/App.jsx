import { useState, useEffect } from 'react'
import axios from 'axios'
import ChatWindow from './components/ChatWindow'
import FriendsList from './components/FriendsList'
import VoiceCall from './components/VoiceCall'
import GameVoting from './components/GameVoting'
import MessageInput from './components/MessageInput'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [messages, setMessages] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [inCall, setInCall] = useState(false)
  const [showGaming, setShowGaming] = useState(false)
  const [userStatus, setUserStatus] = useState('online')
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allUsers, setAllUsers] = useState([])

  // Load current user on app start
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (userId) {
      loadCurrentUser(userId)
    }
  }, [])

  // Load friends when user is logged in
  useEffect(() => {
    if (currentUser) {
      loadFriends()
      loadAllUsers()
      // Auto-reload friends every 5 seconds for status updates
      const interval = setInterval(loadFriends, 5000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const loadCurrentUser = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`)
      setCurrentUser(response.data)
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('userId')
    }
  }

  const loadFriends = async () => {
    if (!currentUser) return
    try {
      const response = await axios.get(`${API_URL}/users`)
      setFriends(response.data.filter((user) => user.id !== currentUser.id))
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }

  const loadAllUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`)
      setAllUsers(response.data.filter((user) => user.id !== currentUser.id))
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/users/login`, null, {
        params: { email },
      })
      setCurrentUser(response.data)
      localStorage.setItem('userId', response.data.id)
      setEmail('')
    } catch (error) {
      setError('Login failed. Please check your email.')
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        username,
        email,
      })
      setCurrentUser(response.data)
      localStorage.setItem('userId', response.data.id)
      setUsername('')
      setEmail('')
    } catch (error) {
      setError('Registration failed. Email might already be in use.')
      console.error('Registration failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('userId')
    setMessages([])
    setSelectedFriend(null)
    setSelectedGroup(null)
  }

  const handleSelectFriend = async (friend) => {
    setSelectedFriend(friend)
    setSelectedGroup(null)
    setShowGaming(false)

    try {
      const response = await axios.get(
        `${API_URL}/messages/direct/${currentUser.id}/${friend.id}`
      )
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group)
    setSelectedFriend(null)
    setShowGaming(false)

    try {
      const response = await axios.get(`${API_URL}/messages/group/${group.id}`)
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to load group messages:', error)
    }
  }

  const handleSendMessage = async (content) => {
    if (!currentUser) return

    try {
      if (selectedFriend) {
        await axios.post(`${API_URL}/messages/direct`, {
          sender_id: currentUser.id,
          recipient_id: selectedFriend.id,
          content,
        })
        handleSelectFriend(selectedFriend)
      } else if (selectedGroup) {
        await axios.post(
          `${API_URL}/messages/group`,
          {
            group_id: selectedGroup.id,
            content,
          },
          { params: { sender_id: currentUser.id } }
        )
        handleSelectGroup(selectedGroup)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleStartCall = async () => {
    if (!currentUser) return
    try {
      await axios.post(
        `${API_URL}/calls`,
        { max_participants: 30 },
        { params: { initiator_id: currentUser.id } }
      )
      setInCall(true)
    } catch (error) {
      console.error('Failed to start call:', error)
    }
  }

  const handleAddFriend = async (friendEmail) => {
    try {
      const response = await axios.get(`${API_URL}/users`)
      const friend = response.data.find((u) => u.email === friendEmail)

      if (!friend) {
        setError('User not found')
        return
      }

      if (friend.id === currentUser.id) {
        setError("You can't add yourself as a friend")
        return
      }

      await axios.post(
        `${API_URL}/users/${currentUser.id}/friends/${friend.id}`
      )

      setError('')
      loadFriends()
    } catch (error) {
      setError('Failed to add friend')
      console.error('Failed to add friend:', error)
    }
  }

  // Login/Register Screen
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-96 border border-gray-700">
          <h1 className="text-4xl font-bold mb-2 text-center text-white">
            Discord Clone
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Chat with friends, voice calls & game voting
          </p>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required={isRegister}
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition"
            >
              {loading
                ? 'Loading...'
                : isRegister
                ? 'Create Account'
                : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="w-full mt-2 text-blue-400 hover:text-blue-300 text-sm transition"
            >
              {isRegister
                ? '✓ Already have an account? Login'
                : '✗ No account? Create one'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-center text-xs">
              For testing: user1@test.com & user2@test.com
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main App
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Discord</h2>
              <p className="text-sm text-gray-400">{currentUser.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 text-sm transition"
              title="Logout"
            >
              ↗️
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setUserStatus('online')}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition ${
                userStatus === 'online'
                  ? 'bg-green-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              🟢 Online
            </button>
            <button
              onClick={() => setUserStatus('away')}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition ${
                userStatus === 'away'
                  ? 'bg-yellow-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              🟡 Away
            </button>
          </div>
        </div>

        {/* Friends List */}
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={handleSelectFriend}
          onAddFriend={handleAddFriend}
        />

        {/* Action Buttons */}
        <div className="mt-auto p-4 border-t border-gray-700 flex gap-2">
          <button
            onClick={handleStartCall}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded font-semibold transition"
          >
            📞 Call
          </button>
          <button
            onClick={() => setShowGaming(!showGaming)}
            className={`flex-1 px-3 py-2 rounded font-semibold transition ${
              showGaming
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            🎮 Games
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {inCall ? (
          <VoiceCall currentUser={currentUser} onEndCall={() => setInCall(false)} />
        ) : showGaming ? (
          <GameVoting currentUserId={currentUser.id} />
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              {selectedFriend ? (
                <div>
                  <h2 className="text-xl font-bold">
                    💬 Chat with {selectedFriend.username}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedFriend.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                  </p>
                </div>
              ) : selectedGroup ? (
                <div>
                  <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                  <p className="text-sm text-gray-400">
                    {selectedGroup.members?.length || 0} members
                  </p>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-gray-400">
                  👉 Select a chat to start
                </h2>
              )}
            </div>

            {/* Messages */}
            {selectedFriend || selectedGroup ? (
              <>
                <ChatWindow messages={messages} currentUserId={currentUser.id} />
                <MessageInput onSendMessage={handleSendMessage} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-2xl mb-4">👋 Welcome to Discord Clone!</p>
                  <p>Select a friend from the left to start chatting</p>
                  <p className="text-sm mt-4 text-gray-600">
                    📞 Click "Call" to start a voice call
                  </p>
                  <p className="text-sm text-gray-600">
                    🎮 Click "Games" to vote on games to play
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
