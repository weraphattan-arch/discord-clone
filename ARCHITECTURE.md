# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Browser (React)                  │
│  ┌────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  App.jsx   │  │ Components│  │   Utils/API   │  │
│  └────────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────┘
         │                          │
         │ HTTP Requests            │ WebSocket
         │ (Messages, Users, etc)   │ (Real-time)
         ▼                          ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend Server                 │
│  ┌────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  main.py   │  │ Models   │  │  Database     │  │
│  │   (Routes) │  │ (SQLAlchemy) │ (SQLite)    │  │
│  └────────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────┘
         │
         ▼
    ┌─────────────┐
    │   SQLite    │
    │  Database   │
    └─────────────┘
```

## Data Flow Example: Sending a Message

```
1. User types message in ChatWindow
                ↓
2. onClick handler calls onSendMessage()
                ↓
3. axios.post('/api/messages/direct', { recipient_id, content })
                ↓
4. FastAPI backend receives POST request
                ↓
5. main.py create DirectMessage in database
                ↓
6. Return message with ID and timestamp
                ↓
7. Frontend updates UI with new message
                ↓
8. WebSocket broadcasts to recipient
```

## Component Hierarchy

```
App
├── LoginForm
│   └── Register/Login UI
│
├── Sidebar
│   ├── FriendsList
│   │   ├── Add Friend Form
│   │   └── Friend Items
│   │
│   └── Controls
│       ├── Call Button
│       └── Games Button
│
└── MainContent
    ├── ChatWindow
    │   └── Message List
    │
    ├── MessageInput
    │   └── Message Form
    │
    ├── VoiceCall (optional)
    │   ├── Video Display
    │   └── Call Controls
    │
    └── GameVoting (optional)
        └── Game List
```

## Database Schema

### User Table
```
id (Primary Key)
username
email
google_id (for OAuth)
avatar_url
status (online, offline, in_call)
created_at
```

### DirectMessage Table
```
id (Primary Key)
sender_id (Foreign Key → User)
recipient_id (Foreign Key → User)
content
created_at
```

### Group Table
```
id (Primary Key)
name
description
created_by (Foreign Key → User)
created_at
members (Many-to-Many relationship)
```

### GroupMessage Table
```
id (Primary Key)
group_id (Foreign Key → Group)
sender_id (Foreign Key → User)
content
created_at
```

### Call Table
```
id (Primary Key)
initiator_id (Foreign Key → User)
started_at
ended_at
max_participants (default: 30)
is_active
participants (Many-to-Many relationship)
```

### GameVote Table
```
id (Primary Key)
game_name
user_id (Foreign Key → User)
voted_at
```

## Key Technologies & Why

### FastAPI (Backend)
- **Why**: Fast, easy to learn, great async support
- **Used for**: API endpoints, WebSocket management
- **Async**: Handles many WebSocket connections simultaneously

### SQLAlchemy (ORM)
- **Why**: Pythonic way to interact with database
- **Used for**: User, message, group, call management
- **Benefit**: Type-safe queries, automatic SQL generation

### SQLite (Database)
- **Why**: Lightweight, zero-config, great for learning
- **Used for**: Store all application data
- **Limitation**: Single-user, not great for massive scale (upgrade to PostgreSQL later)

### React (Frontend)
- **Why**: Component-based, reactive updates, large ecosystem
- **Used for**: UI rendering, user interactions
- **State Management**: useState hooks (can upgrade to Redux/Zustand later)

### WebSocket
- **Why**: Real-time bidirectional communication
- **Used for**: Live messaging, status updates, call signaling
- **Benefits**: Low latency, persistent connection

### WebRTC (Voice/Video)
- **Why**: Peer-to-peer, no server needed for media
- **Used for**: Audio/video streaming between users
- **Benefits**: Low latency, privacy (data doesn't go through server)

## Request/Response Cycle

### REST API Call
```
Client (React)
  ↓
axios.post('/api/messages/direct', data)
  ↓
FastAPI Route Handler
  ↓
Database Query (SQLAlchemy)
  ↓
Database (SQLite)
  ↓
Response Object
  ↓
JSON Response
  ↓
Client Updates UI
```

### WebSocket Message
```
Client (React)
  ↓
websocket.send(JSON)
  ↓
FastAPI WebSocket Handler
  ↓
Broadcast to connected users
  ↓
Other Clients receive message
  ↓
Update UI in real-time
```

## Authentication Flow

### Current (Basic)
```
User inputs email
  ↓
POST /api/users/login
  ↓
Query database for user
  ↓
Save user ID to localStorage
  ↓
Subsequent requests use this ID
```

### Future (OAuth)
```
User clicks "Login with Google"
  ↓
Redirect to Google OAuth
  ↓
User approves
  ↓
Google redirects with code
  ↓
Backend exchanges code for token
  ↓
Create/update user in database
  ↓
Return JWT token
  ↓
Client stores JWT
  ↓
Include JWT in all requests
```

## Real-Time Features

### Messaging
```
User A sends message
  ↓
FastAPI stores in database
  ↓
WebSocket broadcasts to User B
  ↓
User B's component re-renders
  ↓
Message appears instantly
```

### User Status Updates
```
User goes online
  ↓
WebSocket connect event
  ↓
Update user.status = "online"
  ↓
Broadcast status change
  ↓
All connected users see indicator
```

### Call Signaling
```
User A initiates call
  ↓
Create Peer connection (WebRTC)
  ↓
Send signaling data via WebSocket
  ↓
User B receives signal
  ↓
Create answer Peer connection
  ↓
Exchange continues until connected
  ↓
Direct peer-to-peer connection established
  ↓
Audio/video flows directly
```

## Scaling Considerations

### Current (Single Server)
- Suitable for: < 100 concurrent users
- Database: SQLite (works fine)
- Backend: Single FastAPI instance

### Production Ready (1000+ users)
```
Load Balancer
  ├── FastAPI Server 1
  ├── FastAPI Server 2
  └── FastAPI Server 3
         ↓
    PostgreSQL (replicated)
         ↓
    Redis (session cache)
         ↓
    WebSocket Manager (handles distributed connections)
```

### For 30-Person Calls
- **Local**: WebRTC mesh (everyone ↔ everyone) - works up to ~8 people
- **Scale**: Add media server (Janus, Kurento) for 30+ people
- **Enterprise**: Use Twilio, AWS Chime, or similar SaaS

## File Organization

```
discord-clone/
│
├── Backend Files
│   ├── main.py           # All FastAPI routes
│   ├── models.py         # Database models
│   ├── database.py       # DB connection
│   ├── schemas.py        # Request/response schemas
│   └── requirements.txt  # Python dependencies
│
├── Frontend Files (after npm create vite)
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx
│       │   ├── components/
│       │   ├── utils/
│       │   ├── index.css
│       │   └── main.jsx
│       └── package.json
│
└── Documentation
    ├── README.md              # Full guide
    ├── QUICKSTART.md          # Get started fast
    ├── ARCHITECTURE.md        # This file
    ├── FRONTEND_SETUP.md      # Frontend details
    └── VOICE_CALLS_GUIDE.md   # WebRTC details
```

## Deployment Paths

### Frontend (React)
- **Vercel** - Easiest, free tier available
- **Netlify** - Similar to Vercel
- **GitHub Pages** - Free but limited
- **AWS S3 + CloudFront** - More control

### Backend (FastAPI)
- **Railway** - Easy Flask/FastAPI hosting
- **Heroku** - Simple but paid
- **AWS EC2** - More control, more complex
- **DigitalOcean** - Good middle ground
- **Replit** - Free for learning

### Database (SQLite → PostgreSQL)
- **Railway** - Includes Postgres option
- **AWS RDS** - Managed database
- **Supabase** - PostgreSQL + real-time
- **Firebase** - Simpler alternative

## Performance Tips

1. **Database**: Add indexes on frequently queried columns
2. **WebSocket**: Use rooms/namespaces to avoid broadcasting to all
3. **Frontend**: Lazy load components, memoize expensive renders
4. **Caching**: Use Redis for frequently accessed data
5. **Compression**: Enable gzip compression in FastAPI

## Security Considerations

1. **Authentication**: Implement JWT tokens
2. **CORS**: Already configured, but review in production
3. **Validation**: Pydantic schemas validate all inputs
4. **Database**: Use parameterized queries (SQLAlchemy does this)
5. **HTTPS**: Always use in production
6. **Rate Limiting**: Add to prevent abuse
7. **Input Sanitization**: Sanitize user input before storing

## Learning Path

1. **Start**: Run the application locally ✓
2. **Messages**: Implement direct messaging
3. **Groups**: Add group chat
4. **Calls**: Set up WebRTC calls
5. **Games**: Implement game voting
6. **Deploy**: Put it live!

Each feature builds on previous ones. Good luck! 🚀
