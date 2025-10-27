# Quick Start Guide - Big Two Multiplayer Game

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

### Step 1: Database Setup

Choose one option:

#### Option A: Local MongoDB (Recommended for Development)
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Verify it's running
brew services list | grep mongodb
```

#### Option B: MongoDB Atlas (Cloud - Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (free tier M0)
4. Create database user
5. Whitelist your IP (or use 0.0.0.0/0 for all IPs during development)
6. Get connection string

### Step 2: Configure Environment

The `.env` file has already been created. If using MongoDB Atlas, update the connection string:

```bash
# Open .env file
nano .env

# Update this line with your MongoDB Atlas connection string:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/big2-multiplayer
```

### Step 3: Start the Application

#### Terminal 1 - Backend Server
```bash
# From project root
npm run dev
```

You should see:
```
╔═══════════════════════════════════════╗
║   Big Two Multiplayer Server          ║
║                                        ║
║   Server running on port 3001         ║
║   Environment: development            ║
║                                        ║
║   Ready to accept connections!         ║
╚═══════════════════════════════════════╝
```

#### Terminal 2 - React Client
```bash
# Open new terminal
cd client
npm start
```

Browser should automatically open to http://localhost:3000

### Step 4: Test the Application

1. **Open multiple browsers/tabs** to test multiplayer
2. **Create an account** or use guest mode
3. **Create a game** - will get a room code
4. **Join game** from another browser with the room code
5. **Start game** - creator can start when ready
6. **Play!** - AI will fill empty slots

## 📱 Testing Multiplayer Locally

### Method 1: Multiple Browser Tabs
- Chrome Tab 1: Player 1
- Chrome Tab 2: Player 2
- Firefox Tab: Player 3
- Incognito: Player 4

### Method 2: Multiple Devices
- Connect devices to same WiFi
- Use your computer's IP address instead of localhost
- Example: http://192.168.1.100:3000

To find your IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

## �� Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start if not running
brew services start mongodb-community@7.0

# Or verify your Atlas connection string is correct
```

### Issue: "Port 3001 already in use"
**Solution:**
```bash
# Find and kill the process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change the port in .env file
PORT=3002
```

### Issue: "Client can't connect to server"
**Solution:**
- Verify server is running (check Terminal 1)
- Check `client/src` API URL configuration
- Ensure ports 3000 and 3001 are not blocked by firewall

### Issue: "Module not found" errors
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Do the same for client
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📦 API Testing

### Test Authentication
```bash
# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Create guest account
curl -X POST http://localhost:3001/api/auth/guest
```

### Test Game Creation
```bash
# Save your token from login response
TOKEN="your_jwt_token_here"

# Create a game
curl -X POST http://localhost:3001/api/games/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maxPlayers":4,"aiEnabled":true}'

# Get active games
curl http://localhost:3001/api/games
```

## 🌐 Deploy to Production

### Quick Deploy to Render (Free)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/big2-multiplayer.git
git push -u origin main
```

2. **Set up MongoDB Atlas** (if not already)
   - Create cluster at https://cloud.mongodb.com
   - Get connection string

3. **Deploy on Render**
   - Go to https://dashboard.render.com
   - New → Web Service
   - Connect GitHub repo
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables (especially `MONGODB_URI`)

4. **Deploy Client (Optional - separate deployment)**
   - New → Static Site
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/build`

## 📊 Development Workflow

### Making Changes

```bash
# Server changes are auto-reloaded with nodemon
npm run dev

# Client changes are auto-reloaded by React
cd client && npm start
```

### Adding Features

1. **Add new API endpoint:**
   - Create route in `server/routes/`
   - Add controller in `server/controllers/`
   - Update main `server/index.js` to use the route

2. **Add new Socket event:**
   - Update `server/socket/gameHandler.js`
   - Add client-side handler in React components

3. **Add new database model:**
   - Create model in `server/models/`
   - Add mongoose schema
   - Use in controllers

## 🎮 Game Testing Checklist

- [ ] User can register/login
- [ ] Guest mode works
- [ ] Can create game room
- [ ] Can join existing room with code
- [ ] AI players are added when starting with <4 players
- [ ] Only creator can start game
- [ ] Cards are dealt properly
- [ ] Player with 3♦ starts first round
- [ ] Card plays are validated
- [ ] Passing works correctly
- [ ] Chat messages send/receive
- [ ] Round ends when player empties hand
- [ ] Scores calculated correctly
- [ ] Game ends at 100+ points
- [ ] Stats are updated
- [ ] Leaderboard displays correctly
- [ ] Disconnection is handled
- [ ] Reconnection works

## 💡 Tips

- Use **Chrome DevTools** (F12) → Console to see Socket events
- Check **Network tab** to debug API calls
- Use **React DevTools** extension for component debugging
- Monitor MongoDB with **MongoDB Compass** (GUI tool)
- Test with **ngrok** for remote testing: `ngrok http 3000`

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API Documentation](#) for all endpoints
- Review [Socket Events](#) for real-time communication
- Explore the codebase starting with `server/index.js`

## 🆘 Need Help?

- Check server logs in Terminal 1
- Check browser console for client errors
- Review MongoDB connection status
- Verify all environment variables are set
- Try restarting both server and client

## 🎉 Success Indicators

You've successfully set up the project when you can:
1. ✅ Server starts without errors
2. ✅ Client opens in browser
3. ✅ Can create account/login
4. ✅ Can create and join games
5. ✅ Can play cards and see updates in real-time

---

**Happy Gaming! 🎴**
