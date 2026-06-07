# Frontend Setup Instructions

## Quick Start

```bash
cd discord-clone

# Create React app with Vite (faster than CRA)
npm create vite@latest frontend -- --template react
cd frontend

# Install dependencies
npm install axios socket.io-client simple-peer
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── components/
│   │   ├── ChatWindow.jsx      # Chat messages display
│   │   ├── MessageInput.jsx    # Input field
│   │   ├── FriendsList.jsx     # Left sidebar with friends
│   │   ├── VoiceCall.jsx       # Voice/video call component
│   │   ├── GameVoting.jsx      # Game voting system
│   │   └── GroupChat.jsx       # Group messaging
│   ├── utils/
│   │   ├── api.js              # API calls
│   │   └── webSocket.js        # WebSocket management
│   ├── App.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features to Build

1. **User Auth** - Register/login with email or Google OAuth
2. **Friends List** - Left sidebar showing online/offline friends
3. **Direct Messages** - 1-on-1 chat with friends
4. **Group Chat** - Create groups and chat with multiple people
5. **Voice/Video Calls** - Up to 30 participants
6. **Screen Sharing** - Share your screen during calls
7. **Game Voting** - Vote for games to play together
8. **User Status** - Show online/offline/in-call status
9. **Real-time Updates** - WebSocket for instant messaging

## Key Technologies

- **Vite** - Fast build tool
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Socket.io** - Real-time communication
- **Simple Peer** - WebRTC for peer-to-peer calls
- **Axios** - HTTP requests
