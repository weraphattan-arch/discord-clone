# Discord Clone - Complete Setup & Run Guide

## ✅ What's Already Done

I've created **everything for you**:
- ✅ Backend (FastAPI) - Ready to run
- ✅ Frontend (React) - All components built
- ✅ HTML files
- ✅ CSS (Tailwind)
- ✅ Database setup

## 📋 What You Need to Do

### Step 1: Install Node.js

You need **Node.js** to run the React app.

**Go to:** https://nodejs.org/
- Download **LTS** (Long Term Support) version
- Install it
- Verify: Open terminal and run:
  ```bash
  node --version
  npm --version
  ```

---

## 🚀 Running the Discord Clone

### IMPORTANT: Run in 2 Different Terminals

---

## Terminal 1: Start Backend Server

```bash
cd /Users/coach2/discord-clone

# Make sure venv is set up (should already be)
source venv/bin/activate

# Start the API server
uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

✅ Leave this running! Keep this terminal open.

---

## Terminal 2: Start Frontend Server

Open a **new terminal** and run:

```bash
cd /Users/coach2/discord-clone/frontend

# Install npm packages (first time only)
npm install

# Start the dev server
npm run dev
```

**Expected output:**
```
  VITE v4.5.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Copy the URL and open it in your browser!

---

## 🌐 Open in Browser

Copy and paste this in your browser:
```
http://localhost:5173
```

You should see the Discord Clone login page! 🎉

---

## 💬 Test It Out

### Create 2 Test Accounts

1. **First account:**
   - Username: `testuser1`
   - Email: `user1@test.com`
   - Click: Register

2. **Second account (in different browser or incognito):**
   - Username: `testuser2`
   - Email: `user2@test.com`
   - Click: Register

### Test Features

1. **Direct Messages**
   - Log in as user1
   - Click "+ Add Friend"
   - Enter: `user2@test.com`
   - Click: "Add"
   - Click the friend name
   - Send a message!

2. **Games**
   - Click "🎮 Games" button
   - Vote for games
   - See votes update in real-time

3. **Voice Call** (visual only in this version)
   - Click "📞 Call"
   - See the call interface
   - Click "☎️ End Call" to exit

---

## 🛠️ If Something Goes Wrong

### Backend won't start
```
Error: ModuleNotFoundError: No module named 'fastapi'
→ Run: source venv/bin/activate
→ Then: uvicorn main:app --reload
```

### Frontend won't install
```
Error: npm: command not found
→ Install Node.js from nodejs.org
→ Restart your computer
→ Try again
```

### Can't see the app
```
Error: Connection refused or CORS error
→ Make sure backend is running on Terminal 1
→ Make sure frontend is running on Terminal 2
→ Open http://localhost:5173 (not localhost:8000)
```

### Port 5173 already in use
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port:
npm run dev -- --port 5174
```

---

## 📁 File Structure

```
/Users/coach2/discord-clone/
├── main.py                 ← Backend API
├── models.py              ← Database models
├── database.py            ← DB connection
├── schemas.py             ← Data validation
├── requirements.txt       ← Python packages
│
└── frontend/              ← React App (all created)
    ├── src/
    │   ├── App.jsx           ← Main app
    │   ├── main.jsx          ← Entry point
    │   ├── index.css         ← Styles
    │   └── components/
    │       ├── ChatWindow.jsx
    │       ├── MessageInput.jsx
    │       ├── FriendsList.jsx
    │       ├── VoiceCall.jsx
    │       └── GameVoting.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html        ← Main HTML page
    └── .gitignore
```

---

## 🎯 Features Included

- ✅ User registration & login
- ✅ Direct messaging (1-on-1 chat)
- ✅ Friend management
- ✅ Game voting system
- ✅ Voice call interface
- ✅ Screen sharing button
- ✅ Real-time message updates
- ✅ User status indicators
- ✅ Beautiful UI with Tailwind CSS

---

## 📚 How It Works

### Backend (FastAPI)
- Runs on `http://localhost:8000`
- Handles all API requests
- Stores data in SQLite database
- File: `main.py`

### Frontend (React)
- Runs on `http://localhost:5173`
- Beautiful user interface
- All components in `frontend/src/components/`
- Styled with Tailwind CSS

### Communication
- Frontend sends HTTP requests to backend
- Backend responds with data
- Everything is real-time!

---

## 🔒 Login Credentials

For testing, you can create any account with:
- Any username
- Any email (example: test@test.com)
- Just click Register

No password needed for this basic version!

---

## ⚡ Next Steps (After Getting It Running)

1. ✅ Get both servers running
2. ✅ Create 2 test accounts
3. ✅ Send messages between them
4. ✅ Test the game voting
5. ✅ Test the call interface
6. Later: Add Google OAuth, real WebRTC calls, etc.

---

## 💡 Tips

- **Restart needed?** Use Ctrl+C to stop servers, then run again
- **Want to edit code?** Edit files and they auto-reload!
- **Having fun?** You can customize colors and features
- **Deploy later?** We can deploy to the internet

---

## 🎓 Learning Points

This project teaches you:
- How to build a React app
- How to create a Python API
- How databases work
- How frontend and backend communicate
- How to build real-time features

---

## 👨‍💼 Show Your Teacher!

Once it's running, take a screenshot and show your teacher:
1. The login page
2. The chat interface
3. Friend list working
4. Sending messages
5. Game voting

---

## ❓ Questions?

All the code is well-commented. You can:
- Read `main.py` to understand the backend
- Read `App.jsx` to understand the frontend
- Check `components/` for UI components

---

**You're all set! Follow the steps above and you'll have a working Discord clone!** 🚀

Next: Open 2 terminals and follow "Running the Discord Clone" section.
