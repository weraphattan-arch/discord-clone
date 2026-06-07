import { useState } from 'react'

export default function FriendsList({
  friends,
  selectedFriend,
  onSelectFriend,
  onAddFriend,
}) {
  const [addingFriend, setAddingFriend] = useState(false)
  const [friendEmail, setFriendEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddFriend = async (e) => {
    e.preventDefault()
    if (friendEmail.trim()) {
      setLoading(true)
      try {
        await onAddFriend(friendEmail)
        setFriendEmail('')
        setAddingFriend(false)
      } catch (error) {
        console.error('Error adding friend:', error)
      } finally {
        setLoading(false)
      }
    }
  }

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
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm px-2 py-1 rounded transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingFriend(false)
                  setFriendEmail('')
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-sm px-2 py-1 rounded transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!addingFriend && (
          <button
            onClick={() => setAddingFriend(true)}
            className="w-full mb-4 bg-gray-700 hover:bg-gray-600 text-white text-sm px-2 py-1 rounded transition"
          >
            + Add Friend
          </button>
        )}

        <div className="space-y-1">
          {friends.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No friends yet</p>
          ) : (
            friends.map((friend) => (
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
                  <div
                    className={`w-2 h-2 rounded-full ${
                      friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  ></div>
                  <span className="text-sm font-medium">{friend.username}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
