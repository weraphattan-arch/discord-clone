# Discord Clone - Full Stack Application

A Discord-like web application built with React, FastAPI, and WebSocket for real-time communication. Supports direct messaging, group chats, voice/video calls (up to 30 people), screen sharing, and game voting.

## Features ✨

- **User Authentication** - Register/login with email (Google OAuth ready)
- **Direct Messaging** - 1-on-1 chat with friends
- **Group Chat** - Create groups and chat with multiple friends
- **Voice/Video Calls** - Up to 30 participants per call
- **Screen Sharing** - Share your screen during calls
- **Game Voting System** - Vote on games to play together
- **Real-time Updates** - WebSocket for instant messaging
- **User Status** - Online/offline/in-call indicators
- **Friend Management** - Add and manage friends list

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **SQLite** - Lightweight database
- **WebSocket** - Real-time communication
- **Socket.io** - Event-based real-time updates

### Frontend
- **React** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Simple Peer** - WebRTC for peer-to-peer calls

## Project Structure

```
discord-clone/
├── main.py                      # FastAPI backend
├── models.py                    # Database models
├── database.py                  # Database setup
├── schemas.py                   # Pydantic schemas
├── requirements.txt             # Python dependencies
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── App.jsx             # Main app component
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── FriendsList.jsx
│   │   │   ├── VoiceCall.jsx
│   │   │   └── GameVoting.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Installation & Setup

### 1. Backend Setup

```bash
cd discord-clone

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

In a new terminal:

```bash
cd discord-clone

# Create React app with Vite
npm create vite@latest frontend -- --template react
cd frontend

# Install dependencies
npm install axios socket.io-client simple-peer
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Copy the component files
# Copy App_component_example.jsx to src/App.jsx
# Copy components_example.jsx content to src/components/

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## How to Implement Components

### Step 1: Create Component Files

In `frontend/src/components/`, create these files:

1. **ChatWindow.jsx** - Display messages
2. **MessageInput.jsx** - Input for sending messages
3. **FriendsList.jsx** - Left sidebar with friends
4. **VoiceCall.jsx** - Voice/video call interface
5. **GameVoting.jsx** - Game voting system

Copy the component code from `components_example.jsx` into these files.

### Step 2: Set Up Main App

Copy the content from `App_component_example.jsx` to `frontend/src/App.jsx`

### Step 3: Create Tailwind Config

The Tailwind setup is already configured by `npx tailwindcss init -p`. Make sure your `tailwind.config.js` looks like:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 4: Add Tailwind to CSS

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import in `src/main.jsx`:

```javascript
import './index.css'
```

## Running the Application

### Terminal 1: Backend
```bash
cd discord-clone
source venv/bin/activate
uvicorn main:app --reload
```

### Terminal 2: Frontend
```bash
cd discord-clone/frontend
npm run dev
```

Then open `http://localhost:5173` in your browser!

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users` - List all users
- `GET /api/users/{user_id}` - Get user details
- `PUT /api/users/{user_id}` - Update user status/avatar
- `POST /api/users/{user_id}/friends/{friend_id}` - Add friend
- `GET /api/users/{user_id}/friends` - Get user's friends

### Messages
- `POST /api/messages/direct` - Send direct message
- `GET /api/messages/direct/{user_id}/{friend_id}` - Get DM history
- `POST /api/messages/group` - Send group message
- `GET /api/messages/group/{group_id}` - Get group messages

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups/{group_id}` - Get group details
- `POST /api/groups/{group_id}/members/{user_id}` - Add member
- `GET /api/groups/{group_id}/members` - Get group members

### Calls
- `POST /api/calls` - Start a call
- `GET /api/calls/{call_id}` - Get call details
- `POST /api/calls/{call_id}/join` - Join a call
- `POST /api/calls/{call_id}/leave` - Leave a call

### Games
- `POST /api/games/vote` - Vote for a game
- `GET /api/games/top-votes` - Get top voted games

### WebSocket
- `WS /ws/{user_id}` - Real-time connection for live updates

## Features to Add Later

1. **Google OAuth** - Implement Google sign-up/login
2. **Persistent WebRTC** - Stable video/audio streaming
3. **File Sharing** - Upload and share files
4. **Voice Messages** - Record and send audio
5. **Emojis & Reactions** - React to messages
6. **Dark/Light Theme** - Theme switcher
7. **Notifications** - Browser notifications for messages
8. **User Search** - Search for users and groups
9. **Call History** - View past calls and duration
10. **Custom Avatars** - Upload profile pictures

## Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed
- Check that port 8000 is available
- Verify all dependencies are installed: `pip list`

### Frontend won't start
- Check that Node.js 16+ is installed
- Delete `node_modules` and `package-lock.json`, then reinstall
- Make sure port 5173 is available

### CORS errors
- Backend has CORS middleware configured for `localhost:3000` and `localhost:5173`
- If using different ports, update `main.py` CORS settings

### WebSocket connection fails
- Ensure backend is running on `http://localhost:8000`
- Check browser console for detailed error messages

## Learning Resources

- **FastAPI Docs** - https://fastapi.tiangolo.com/
- **React Docs** - https://react.dev/
- **SQLAlchemy** - https://docs.sqlalchemy.org/
- **Tailwind CSS** - https://tailwindcss.com/docs
- **WebRTC** - https://webrtc.org/
- **WebSocket** - https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## Next Steps

1. **Test User Flow** - Create accounts, add friends, send messages
2. **Build Components** - Implement each component from examples
3. **Add Features** - Start with messaging, then calls, then games
4. **Deploy** - Consider Vercel (frontend) + Railway/Heroku (backend)

## Tips for Learning

- Start with the messaging features (easiest)
- Then move to group chat (similar to direct messages)
- Voice calls require WebRTC setup (more complex)
- Game voting is simple and fun to build first
- Add features incrementally and test each one

Good luck building! 🚀
