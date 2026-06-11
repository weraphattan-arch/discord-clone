import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function GameVoting({ currentUserId }) {
  const [topGames, setTopGames] = useState([])
  const [customGame, setCustomGame] = useState('')
  const [loading, setLoading] = useState(false)

  const predefinedGames = [
    'Valorant',
    'League of Legends',
    'CS:GO',
    'Fortnite',
    'Minecraft',
    'Among Us',
    'Rocket League',
    'PUBG',
    'Apex Legends',
    'Dota 2',
  ]

  useEffect(() => {
    loadTopGames()
  }, [])

  const loadTopGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/games/top-votes`)
      setTopGames(response.data)
    } catch (error) {
      console.error('Failed to load game votes:', error)
    }
  }

  const handleVoteGame = async (gameName) => {
    setLoading(true)
    try {
      await axios.post(
        `${API_URL}/games/vote`,
        { game_name: gameName },
        { params: { user_id: currentUserId } }
      )
      await loadTopGames()
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomVote = async () => {
    if (customGame.trim()) {
      await handleVoteGame(customGame)
      setCustomGame('')
    }
  }

  const maxVotes = topGames.length > 0 ? topGames[0].vote_count : 1

  return (
    <div className="flex-1 bg-gray-900 flex flex-col overflow-auto">
      <div className="p-6 max-w-3xl mx-auto w-full">
        <h2 className="text-4xl font-bold mb-8 text-white">🎮 Game Voting</h2>

        {/* Top Games */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-6 text-white">🏆 Top Games</h3>
          <div className="space-y-3">
            {topGames.slice(0, 5).map((game, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-500">#{idx + 1}</span>
                    <span className="text-lg font-semibold text-white">{game.game_name}</span>
                  </div>
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                    {game.vote_count} votes
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(game.vote_count / maxVotes) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predefined Games */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-6 text-white">Vote for a Game</h3>
          <div className="grid grid-cols-2 gap-3">
            {predefinedGames.map((game) => (
              <button
                key={game}
                onClick={() => handleVoteGame(game)}
                disabled={loading}
                className="bg-gray-800 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition border border-gray-700 hover:border-purple-500 disabled:opacity-50"
              >
                {game}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Game */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-2xl font-bold mb-4 text-white">💡 Suggest a Game</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={customGame}
              onChange={(e) => setCustomGame(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCustomVote()
                }
              }}
              placeholder="Enter your favorite game..."
              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
              disabled={loading}
            />
            <button
              onClick={handleCustomVote}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? '⏳' : '🗳️'} Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
