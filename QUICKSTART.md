# Quick Start Guide - Get Running in 5 Minutes

## Prerequisites
- Python 3.8+
- Node.js 16+
- A terminal with `bash` or similar

## Step-by-Step

### Step 1: Start the Backend (Terminal 1)

```bash
cd /Users/coach2/discord-clone

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload
```

✅ You should see: "Uvicorn running on http://127.0.0.1:8000"

### Step 2: Create Frontend (Terminal 2)

```bash
cd /Users/coach2/discord-clone

# Create Vite React app
npm create vite@latest frontend -- --template react

# Go into frontend
cd frontend

# Install all dependencies
npm install axios socket.io-client simple-peer
npm install -D tailwindcss postcss autoprefixer

# Setup Tailwind
npx tailwindcss init -p

# Copy example components
# Manually copy from:
# - App_component_example.jsx → src/App.jsx
# - components_example.jsx → src/components/*.jsx

# Start dev server
npm run dev
```

✅ You should see: "VITE v... ready in ... ms"

### Step 3: Test in Browser

Open: http://localhost:5173

You should see the Discord Clone login page!

## Test It Out

### Create 2 Test Accounts:
1. Register as "User1" with email `user1@test.com`
2. Register as "User2" with email `user2@test.com`

### Try These Features:
1. **Messaging** - Send a direct message to the other user
2. **Add Friend** - Click "+ Add Friend" and add user2's email
3. **Start Call** - Click the "📞 Call" button
4. **Games** - Click "🎮 Games" and vote for a game

## File Structure Created

```
/Users/coach2/discord-clone/
├── main.py                  ← Backend API
├── models.py               ← Database models
├── database.py             ← DB setup
├── schemas.py              ← Data validation
├── requirements.txt        ← Python packages
│
├── App_component_example.jsx      ← Copy to frontend/src/App.jsx
├── components_example.jsx         ← Copy to frontend/src/components/
│
├── frontend/               ← React app (after you create it)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── README.md               ← Full documentation
└── QUICKSTART.md          ← This file
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'fastapi'"
```bash
# Make sure venv is activated
source venv/bin/activate
# Then try again
pip install -r requirements.txt
```

### "npm: command not found"
- Install Node.js from https://nodejs.org/

### Port 8000/5173 already in use
```bash
# Change port in backend:
uvicorn main:app --reload --port 8001

# Change port in frontend (vite.config.js):
export default {
  server: {
    port: 5174
  }
}
```

### Components not showing correctly
- Make sure you copied `components_example.jsx` content to individual files in `frontend/src/components/`
- Verify imports in App.jsx match your file structure

## Next: Add More Features

Once messaging works:

1. **Groups** - Create and join group chats
2. **Calls** - Implement basic video call UI
3. **Screen Share** - Add screen sharing button
4. **Game Voting** - Full voting system
5. **Google OAuth** - Add Google login

## Pro Tips

- Use React DevTools browser extension to debug
- Open browser console (F12) to see errors
- Backend logs show API requests - helpful for debugging
- Reload browser (Ctrl+R or Cmd+R) if something breaks

## Documentation Files

- `README.md` - Complete guide with all features
- `FRONTEND_SETUP.md` - Detailed frontend setup
- `QUICKSTART.md` - This file (fastest way to get running)

---

**Stuck?** Check the terminal output - it usually tells you what's wrong! 🚀
