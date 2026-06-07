import { useState, useEffect } from 'react'

export default function VoiceCall({ currentUser, onEndCall }) {
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [participants, setParticipants] = useState([currentUser])

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
      })
      setIsScreenSharing(true)
      stream.getTracks().forEach((track) => {
        track.onended = () => {
          setIsScreenSharing(false)
        }
      })
    } catch (error) {
      console.error('Failed to share screen:', error)
    }
  }

  const stopScreenShare = () => {
    setIsScreenSharing(false)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-1 bg-black flex flex-col">
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">In Call</h3>
          <p className="text-sm text-gray-400">{formatDuration(callDuration)}</p>
        </div>
        <button
          onClick={onEndCall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition"
        >
          ☎️ End Call
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4 p-4 overflow-auto bg-gray-900">
        <div className="bg-gray-800 rounded-lg w-full h-96 flex items-center justify-center border-2 border-gray-700">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-5xl">🎤</span>
            </div>
            <p className="text-white font-bold text-lg">{currentUser.username}</p>
            <p className="text-gray-400 text-sm">Your Video Feed</p>
          </div>
        </div>

        {isScreenSharing && (
          <div className="absolute bottom-20 right-4 bg-blue-600 rounded-lg w-80 h-48 flex items-center justify-center border-4 border-blue-500 shadow-lg">
            <p className="text-white text-center font-semibold">🖥️ Sharing Screen</p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border-t border-gray-700 p-4 flex justify-center gap-4 flex-wrap">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          {isMuted ? '🔇' : '🎤'} {isMuted ? 'Unmute' : 'Mute'}
        </button>

        <button
          onClick={() => setIsCameraOn(!isCameraOn)}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            !isCameraOn
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          {isCameraOn ? '📹' : '❌'} Camera
        </button>

        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          🖥️ {isScreenSharing ? 'Stop Share' : 'Share Screen'}
        </button>

        <button className="px-6 py-3 rounded-full font-semibold bg-gray-700 hover:bg-gray-600 text-white transition">
          👥 {participants.length}
        </button>
      </div>
    </div>
  )
}
