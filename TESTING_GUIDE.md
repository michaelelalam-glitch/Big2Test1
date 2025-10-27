# Testing Guide - Big Two Multiplayer Game

## 🧪 Complete Testing Workflow

This guide will walk you through testing the entire application locally.

## Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js v18+ installed (`node --version`)
- ✅ npm v9+ installed (`npm --version`)
- ✅ Git installed (`git --version`)
- ✅ MongoDB Atlas account OR local MongoDB installed
- ✅ All dependencies installed (`npm run install-all`)
- ✅ Environment variables configured (`.env` file)

## Step-by-Step Testing Process

### 1. Database Setup

#### Option A: MongoDB Atlas (Recommended)

Follow the complete guide in `MONGODB_SETUP.md` to:
1. Create a free MongoDB Atlas account
2. Set up a cluster
3. Get your connection string
4. Update `.env` with the connection string

#### Option B: Local MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

### 2. Verify Environment Configuration

Check your `.env` file contains:

```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://... (or mongodb://localhost:27017/big2-game)
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

### 3. Start the Server

Open Terminal 1:

```bash
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node server/index.js`
✅ MongoDB Connected Successfully

    ╔═══════════════════════════════════════╗
    ║   Big Two Multiplayer Server          ║
    ║                                        ║
    ║   Server running on port 3001         ║
    ║   Environment: development            ║
    ║                                        ║
    ║   Ready to accept connections!         ║
    ╚═══════════════════════════════════════╝
```

**Troubleshooting:**
- ❌ "ECONNREFUSED" → MongoDB not running (see MONGODB_SETUP.md)
- ❌ "Port already in use" → Change PORT in .env
- ❌ "Cannot find module" → Run `npm install`

### 4. Start the Client

Open Terminal 2:

```bash
npm run client
```

**Expected Output:**
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

webpack compiled with 0 errors
```

**Browser Opens Automatically** → http://localhost:3000

### 5. Test User Registration

1. **Open Browser:** http://localhost:3000
2. **You Should See:** Login/Register form with gradient background
3. **Click:** "Register" tab
4. **Fill Form:**
   - Username: `testplayer1`
   - Email: `test1@example.com`
   - Password: `password123`
5. **Click:** "Register" button
6. **Expected:** Redirects to Lobby, shows username in header

**Check Server Logs:**
```
POST /api/auth/register 201 - response time
✅ New user registered: testplayer1
```

### 6. Test User Login (Multiple Tabs/Windows)

Open 3 more browser tabs/windows (for multiplayer testing):

**Tab 2:**
- Register as `testplayer2` / `test2@example.com`

**Tab 3:**
- Register as `testplayer3` / `test3@example.com`

**Tab 4:**
- Register as `testplayer4` / `test4@example.com`

### 7. Test Game Room Creation

**In Tab 1 (testplayer1):**

1. **You Should See:** Lobby with "Create Game" button
2. **Click:** "Create Game"
3. **Expected:** 
   - New game room appears
   - You're in the room as Player 1
   - Status: "Waiting for players..."
   - "Start Game" button visible (disabled until 4 players)

**Check Server Logs:**
```
Socket connected: <socket-id>
User testplayer1 created game: <room-id>
```

### 8. Test Joining Game Room

**In Tab 2 (testplayer2):**

1. **You Should See:** Game room in lobby list
2. **Shows:** "testplayer1's Game - 1/4 players"
3. **Click:** "Join Game"
4. **Expected:**
   - You join as Player 2
   - Tab 1 updates showing Player 2 joined

**In Tab 3 & 4:** Repeat to join as Player 3 & 4

**All Tabs Should Show:**
- 4/4 players
- All player names visible
- "Start Game" button enabled (only for testplayer1)

### 9. Test Game Start

**In Tab 1 (room creator):**

1. **Click:** "Start Game" button
2. **Expected (All Tabs):**
   - Game board appears
   - 13 cards dealt to each player
   - Player with Diamond 3 has glowing "Your Turn" indicator
   - Cards are rendered with suits and ranks
   - Chat panel visible
   - "Play Cards" and "Pass" buttons visible

**Server Logs:**
```
Game <room-id> started by testplayer1
Cards dealt to 4 players
```

### 10. Test Gameplay - First Move

**Find the tab with Diamond 3:**

1. **Identify:** Look for 3♦ in your hand
2. **Click:** The 3♦ card (it should lift up when selected)
3. **Click:** "Play Cards" button
4. **Expected:**
   - Card moves to play area
   - "Last Play: Single - 3 of Diamonds" appears
   - Turn passes to next player
   - Next player's turn indicator lights up

### 11. Test Different Card Combinations

**Next Player's Turn:**

**Test Single Card:**
- Select any card higher than 3♦
- Click "Play Cards"

**Test Pair:**
- Select two cards of same rank (e.g., two 5s)
- Click "Play Cards"
- Expected: "Last Play: Pair - 5s"

**Test Triple:**
- Select three cards of same rank
- Click "Play Cards"

**Test Invalid Move:**
- Select a card lower than current play
- Click "Play Cards"
- Expected: Error message "Invalid move!"

### 12. Test Pass Functionality

**Any Player's Turn:**

1. **Click:** "Pass" button
2. **Expected:**
   - Turn immediately passes to next player
   - Status shows "Player X passed"
   - No cards played

### 13. Test Chat System

**In Any Tab:**

1. **Type Message:** "Hello everyone!" in chat input
2. **Press:** Enter or click Send
3. **Expected (All Tabs):**
   - Message appears in chat
   - Format: "testplayer1: Hello everyone!"
   - Timestamp visible
   - Auto-scrolls to bottom

### 14. Test Player Disconnect/Reconnect

**In Tab 2:**

1. **Refresh** the browser (F5)
2. **Expected:**
   - Login screen appears
   - Login with same credentials
   - Can rejoin the game OR start new game

**In Other Tabs:**
- Should show "Player X left the game"

### 15. Test Game Completion

**Continue Playing Until One Player Wins:**

1. **Play cards** until one player has no cards left
2. **Expected:**
   - "Game Over" modal appears
   - Shows winner name
   - Shows final scores
   - "Back to Lobby" button

**Check Server Logs:**
```
Game <room-id> completed
Winner: testplayer1
Scores saved to database
```

### 16. Test Leaderboard (If Implemented)

**In Lobby:**

1. Look for leaderboard section
2. **Expected:**
   - Shows top players
   - Displays wins, games played
   - Sorted by wins or score

### 17. Test API Endpoints Directly

**Using curl or Postman:**

```bash
# Health check
curl http://localhost:3001/

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"apitest","email":"api@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"test123"}'

# Get games (with token)
curl http://localhost:3001/api/games \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 18. Test Error Handling

**Test Invalid Login:**
- Email: `wrong@example.com`
- Password: `wrongpass`
- Expected: Error message "Invalid credentials"

**Test Duplicate Registration:**
- Use same username/email as existing user
- Expected: Error "User already exists"

**Test Network Errors:**
- Stop server (Ctrl+C in server terminal)
- Try to play cards
- Expected: "Connection lost" or error message
- Restart server → Should reconnect

## Performance Testing

### Load Testing (Optional)

Test with multiple games simultaneously:

```bash
# Open 8 tabs total
# Create 2 separate game rooms
# 4 players in each room
# Play both games simultaneously
```

**Monitor:**
- Server CPU/memory usage
- Response times
- Socket connection stability

## Database Verification

### Check MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Collections"
3. **Verify:**
   - `users` collection has your test users
   - `games` collection has active game
   - `gamehistories` collection has completed games

### Using MongoDB Compass or CLI

```bash
# Connect to database
mongosh "your-connection-string"

# Check users
use big2-game
db.users.find().pretty()

# Check active games
db.games.find({status: 'playing'}).pretty()

# Check game history
db.gamehistories.find().sort({createdAt: -1}).limit(5).pretty()
```

## Security Testing

### Test JWT Authentication

1. **Login** and save JWT token (from browser DevTools → Network)
2. **Clear browser storage** (Application → Clear storage)
3. **Try to access API** with old token
4. **Expected:** Valid token works, invalid/expired fails

### Test Rate Limiting

```bash
# Send 100+ requests quickly
for i in {1..110}; do
  curl http://localhost:3001/api/games
done
```

**Expected:** After 100 requests, get "Too many requests" error

## Test Checklist Summary

Use this checklist to verify all features:

### Authentication
- [ ] User registration works
- [ ] User login works  
- [ ] Duplicate username/email rejected
- [ ] Invalid credentials rejected
- [ ] JWT token persists in browser
- [ ] Logout works
- [ ] Guest play option works

### Game Lobby
- [ ] Game list displays correctly
- [ ] Player count updates in real-time
- [ ] Create game button works
- [ ] Join game button works
- [ ] Can't join full games
- [ ] Room creator can start game

### Gameplay
- [ ] Cards dealt correctly (13 per player)
- [ ] Diamond 3 player starts first
- [ ] Card selection works (visual feedback)
- [ ] Single card play works
- [ ] Pair play works
- [ ] Triple play works
- [ ] Five-card combos work
- [ ] Invalid moves rejected
- [ ] Pass button works
- [ ] Turn indicator accurate
- [ ] Last play display updates
- [ ] Win detection works
- [ ] Score calculation correct

### Real-time Features
- [ ] Players join in real-time
- [ ] Game state syncs across clients
- [ ] Chat messages broadcast
- [ ] Turn updates immediate
- [ ] Player disconnect handled
- [ ] Reconnection works

### UI/UX
- [ ] Responsive design (resize browser)
- [ ] Cards render correctly
- [ ] Animations smooth
- [ ] Active player highlighted
- [ ] Error messages clear
- [ ] Loading states present
- [ ] Mobile view works

### Database
- [ ] Users saved to database
- [ ] Games saved to database
- [ ] History recorded
- [ ] Stats updated
- [ ] Leaderboard accurate

### Security
- [ ] Passwords hashed
- [ ] JWT authentication works
- [ ] Rate limiting active
- [ ] CORS configured
- [ ] No sensitive data in client
- [ ] Server validates all moves

## Known Issues & Limitations

Document any issues found during testing:

- [ ] Issue 1: ...
- [ ] Issue 2: ...

## Next Steps After Testing

Once all tests pass:

1. ✅ **Code Review:** Review all code for improvements
2. ✅ **Optimize Performance:** Identify bottlenecks
3. ✅ **Add Tests:** Write unit/integration tests
4. ✅ **Deploy to Render:** Follow DEPLOYMENT_CHECKLIST.md
5. ✅ **Production Testing:** Test on live deployment
6. ✅ **Monitor Logs:** Check for errors in production
7. ✅ **User Feedback:** Gather feedback from real users

## Debugging Tips

### Server-side Debugging

```javascript
// Add console.logs in server code
console.log('Game state:', gameState);
console.log('Player move:', playerMove);
```

### Client-side Debugging

```javascript
// In browser DevTools Console
localStorage.getItem('token')  // Check JWT
console.log(gameState)  // Check React state
```

### Socket.IO Debugging

```bash
# Server - add debug
DEBUG=socket.io:* npm run dev

# Client - in browser console
socket.on('*', (event, data) => console.log(event, data));
```

### MongoDB Debugging

```bash
# Enable MongoDB logging
# Add to server/config/database.js
mongoose.set('debug', true);
```

## Test Results Template

Record your test results:

```
Test Date: ___________
Tester: ___________
Environment: Local Development

✅ Authentication: PASSED
✅ Game Creation: PASSED
✅ Multiplayer Join: PASSED
✅ Gameplay: PASSED
⚠️ Chat: PARTIAL (emoji not working)
❌ Leaderboard: FAILED (not displaying)

Notes:
- All core features working
- Minor UI issues found
- Performance good with 4 players
```

## Automated Testing (Future Enhancement)

Consider adding:
- Jest for unit tests
- React Testing Library for component tests
- Supertest for API tests
- Socket.IO client for socket tests

---

**Ready to Test!** Follow this guide step-by-step to ensure your game works perfectly.

**After testing, proceed to deployment:** See `DEPLOYMENT_CHECKLIST.md`
