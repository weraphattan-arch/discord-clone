#!/bin/bash
# This script sets up the React frontend

npm create vite@latest frontend -- --template react
cd frontend

# Install dependencies
npm install axios socket.io-client simple-peer
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

echo "Frontend setup complete! Run 'cd frontend && npm run dev' to start."
