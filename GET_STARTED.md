# 🚀 Get Started - Big Two Multiplayer Game

## Quick Navigation

📖 **New to the project?** → Start here!
🔧 **Ready to code?** → See [QUICK_START.md](QUICK_START.md)
🧪 **Want to test?** → See [TESTING_GUIDE.md](TESTING_GUIDE.md)
🗄️ **Database setup?** → See [MONGODB_SETUP.md](MONGODB_SETUP.md)
🚀 **Ready to deploy?** → See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
📚 **Full documentation?** → See [README.md](README.md)

---

## ⚡ 5-Minute Quick Start

### 1. Prerequisites Check

```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

If not installed:
- **Node.js:** Download from [nodejs.org](https://nodejs.org)
- **MongoDB:** See [MONGODB_SETUP.md](MONGODB_SETUP.md)

### 2. Set Up MongoDB Atlas (Free - 2 minutes)

**Don't have local MongoDB?** No problem!

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free)
3. Create a free M0 cluster
4. Create database user
5. Allow access from anywhere (for dev)
6. Get connection string

**Detailed guide:** [MONGODB_SETUP.md](MONGODB_SETUP.md)

### 3. Configure Environment

```bash
# Open .env file and update MONGODB_URI
# Replace with your MongoDB Atlas connection string:

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/big2-game?retryWrites=true&w=majority
```

### 4. Install Dependencies

```bash
npm run install-all
```

This installs both server and client dependencies (~2 minutes).

### 5. Start the Application

**Terminal 1 - Server:**
```bash
npm run dev
```

Wait for: ✅ MongoDB Connected Successfully

**Terminal 2 - Client:**
```bash
npm run client
```

Browser opens automatically at http://localhost:3000

### 6. Play the Game!

1. **Register** a new account
2. **Create a game** room
3. **Open 3 more browser tabs** and register 3 more players
4. **Join the game** from each tab
5. **Start playing!**

---

## 📂 Project Overview

### What You Have

```
✅ Complete Backend Server (Node.js + Express + Socket.IO)
✅ Real-time Multiplayer System
✅ React Frontend with Beautiful UI
✅ MongoDB Database Integration
✅ JWT Authentication
✅ Game Logic (Big Two card game)
✅ Chat System
✅ Leaderboard
✅ Deployment Configuration
✅ Comprehensive Documentation
```

### Technology Stack

- **Backend:** Node.js, Express.js, Socket.IO, MongoDB, Mongoose
- **Frontend:** React, Socket.IO Client, Axios
- **Security:** JWT, bcrypt, Helmet, Rate Limiting
- **Deployment:** Render (configured)

---

## 📋 What's Next?

### Option A: Local Development & Testing

**Follow this path if you want to:**
- Test the game locally
- Modify features
- Learn how it works
- Add enhancements

**👉 Next step:** [TESTING_GUIDE.md](TESTING_GUIDE.md)

### Option B: Deploy to Production

**Follow this path if you want to:**
- Make it live on the internet
- Share with friends
- Host on Render (free tier available)

**👉 Next step:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

### Option C: Understand the Code

**Follow this path if you want to:**
- Learn the architecture
- Modify game rules
- Add new features
- Understand Socket.IO implementation

**👉 Next step:** [CLIENT_SETUP.md](CLIENT_SETUP.md) + [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🎮 Game Rules (Big Two / 大老二)

### Objective
Be the first player to play all your cards.

### Card Rankings
**Rank:** 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3  
**Suit:** ♠ Spades > ♥ Hearts > ♣ Clubs > ♦ Diamonds

### Valid Plays
- **Single:** Any card
- **Pair:** Two cards of same rank
- **Triple:** Three cards of same rank
- **Straight:** 5 consecutive cards
- **Flush:** 5 cards of same suit
- **Full House:** 3 of a kind + pair
- **Four of a Kind:** 4 same rank + 1 other
- **Straight Flush:** 5 consecutive cards, same suit

### Starting
Player with **3♦** (Diamond 3) must play it first.

### Gameplay
1. Play higher cards/combinations than previous player
2. Or **Pass** if you can't/don't want to play
3. When all players pass, the last player who played starts fresh
4. First to empty hand wins!

---

## 🆘 Troubleshooting

### "MongoDB connection refused"
**Solution:** Set up MongoDB Atlas (see [MONGODB_SETUP.md](MONGODB_SETUP.md))

### "Port already in use"
**Solution:** Change PORT in `.env` file

### "Cannot find module"
**Solution:** Run `npm run install-all`

### "Client won't connect to server"
**Solution:** Check CLIENT_URL in `.env` matches http://localhost:3000

### More help?
See [TESTING_GUIDE.md](TESTING_GUIDE.md#troubleshooting) for detailed troubleshooting.

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **GET_STARTED.md** (this file) | Quick overview and navigation |
| **README.md** | Complete project documentation |
| **QUICK_START.md** | Step-by-step setup guide |
| **TESTING_GUIDE.md** | Comprehensive testing instructions |
| **MONGODB_SETUP.md** | Database configuration guide |
| **DEPLOYMENT_CHECKLIST.md** | Production deployment steps |
| **CLIENT_SETUP.md** | Client development guide |
| **PROJECT_SUMMARY.md** | Features and technical overview |
| **NEXT_STEPS.md** | Future enhancements |
| **FINAL_STATUS.md** | Project completion status |
| **LICENSE** | MIT License |

---

## 💡 Quick Tips

### For Development
```bash
# Server with auto-reload
npm run dev

# Client with hot reload
npm run client

# Install new server dependency
npm install <package-name>

# Install new client dependency
cd client && npm install <package-name>
```

### For Production
```bash
# Build client for production
npm run build

# Start production server
npm start
```

### Git Commands
```bash
# Initialize repository
git init

# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main
```

---

## 🎯 Success Criteria

You'll know everything is working when:

✅ Server starts without errors  
✅ Client loads in browser  
✅ You can register/login  
✅ You can create a game room  
✅ 4 players can join and play  
✅ Cards are dealt correctly  
✅ Moves are validated  
✅ Chat works  
✅ Game completes and shows winner  

---

## 🤝 Need Help?

1. **Check documentation** - Most answers are in the guides
2. **Review error messages** - They usually point to the issue
3. **Check server logs** - Terminal 1 shows server activity
4. **Check browser console** - F12 → Console for client errors
5. **Database issues?** - See [MONGODB_SETUP.md](MONGODB_SETUP.md)
6. **Game logic questions?** - See game rules above

---

## 🎊 You're All Set!

Your Big Two multiplayer card game is ready to go. Choose your path:

**🔧 Developer Path:** → [TESTING_GUIDE.md](TESTING_GUIDE.md)  
**🚀 Deployment Path:** → [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)  
**📖 Learning Path:** → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**Ready to play?** Run the 5-minute quick start above! 🎴

---

**Built with ❤️ | Node.js + React + Socket.IO + MongoDB**
