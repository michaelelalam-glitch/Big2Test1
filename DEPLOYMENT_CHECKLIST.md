# Deployment Checklist - Big Two Multiplayer

## ✅ Pre-Deployment Checklist

### 1. Local Testing
- [ ] Server starts without errors (`npm run dev`)
- [ ] Client starts without errors (`npm run client`)
- [ ] MongoDB connection successful
- [ ] User registration works
- [ ] User login works
- [ ] Guest login works
- [ ] Game room creation works
- [ ] Joining game rooms works
- [ ] Game starts with 4 players (human + AI)
- [ ] Cards are dealt properly
- [ ] Turn order is correct
- [ ] Card playing works
- [ ] Pass functionality works
- [ ] Chat messaging works
- [ ] Game end detection works
- [ ] Leaderboard updates
- [ ] Player disconnection handled gracefully

### 2. Code Quality
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] All API endpoints return proper status codes
- [ ] Input validation working on all forms
- [ ] Error messages are user-friendly
- [ ] Loading states display properly

### 3. Security
- [ ] Passwords are hashed (bcrypt)
- [ ] JWT tokens are properly signed
- [ ] Environment variables are not committed to git
- [ ] CORS is configured properly
- [ ] Rate limiting is active
- [ ] Helmet security headers are set
- [ ] Input sanitization is working
- [ ] SQL/NoSQL injection prevention in place

### 4. Performance
- [ ] Game state updates are smooth
- [ ] No memory leaks during long game sessions
- [ ] Socket connections are stable
- [ ] Database queries are optimized
- [ ] Large game lists load quickly

## 🚀 Render Deployment Steps

### Step 1: Prepare MongoDB Atlas
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster (free M0 tier)
3. Create database user with password
4. Whitelist all IPs (0.0.0.0/0) or specific Render IPs
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/big2-multiplayer`

### Step 2: Prepare GitHub Repository
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Big Two multiplayer game"

# Create GitHub repository (via GitHub website)
# Then push:
git remote add origin https://github.com/yourusername/big2-multiplayer.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render

#### A. Deploy Backend (Web Service)
1. Go to https://render.com
2. Sign up / Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `big2-server` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate random string (use: `openssl rand -base64 32`)
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: Will add after deploying client
7. Click "Create Web Service"
8. Wait for deployment (~5 minutes)
9. Copy the service URL (e.g., `https://big2-server.onrender.com`)

#### B. Deploy Frontend (Static Site)
1. In Render Dashboard, click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `big2-client`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
4. Add Environment Variable:
   - `REACT_APP_SERVER_URL`: Your backend URL from Step A (e.g., `https://big2-server.onrender.com`)
5. Click "Create Static Site"
6. Wait for deployment (~3-5 minutes)
7. Copy the static site URL (e.g., `https://big2-client.onrender.com`)

#### C. Update CORS Settings
1. Go back to your backend Web Service on Render
2. Add/Update Environment Variable:
   - `CLIENT_URL`: Your frontend URL from Step B
3. Trigger manual deploy or wait for auto-redeploy

### Step 4: Test Production Deployment
- [ ] Visit your frontend URL
- [ ] Register a new account
- [ ] Login works
- [ ] Create a game room
- [ ] Start a game
- [ ] Play some cards
- [ ] Send chat messages
- [ ] Open in incognito/another browser to test multiplayer
- [ ] Check leaderboard updates

## 📊 Monitoring

### Render Dashboard
- Monitor logs in Render dashboard
- Check for errors or crashes
- Monitor memory and CPU usage

### Database
- Check MongoDB Atlas metrics
- Monitor connection count
- Check storage usage

## 🔧 Common Issues & Solutions

### Issue: Server crashes on startup
**Solution**: Check environment variables are set correctly in Render dashboard

### Issue: Cannot connect to MongoDB
**Solution**: 
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format is correct
- Ensure database user has proper permissions

### Issue: Frontend can't reach backend
**Solution**:
- Verify `REACT_APP_SERVER_URL` in static site settings
- Check CORS `CLIENT_URL` is set in backend
- Ensure both services are deployed and running

### Issue: WebSocket connection fails
**Solution**:
- Socket.IO should work out of the box on Render
- Check browser console for connection errors
- Verify server logs show socket connections

### Issue: Free tier limitations
**Solution**:
- Render free tier sleeps after 15 min inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to paid tier for production

## 🎯 Post-Deployment

### Optional Enhancements
- [ ] Set up custom domain
- [ ] Add SSL certificate (automatic on Render)
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Add analytics (Google Analytics, Mixpanel)
- [ ] Set up automated backups for MongoDB
- [ ] Configure CI/CD pipelines
- [ ] Add end-to-end tests

### Scaling Considerations
- [ ] Consider Redis for session management
- [ ] Implement database indexing for better performance
- [ ] Add caching layer (Redis)
- [ ] Use CDN for static assets
- [ ] Implement load balancing if needed

## 📱 Alternative Deployment Options

### Heroku
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create big2-multiplayer

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Deploy
git push heroku main
```

### Vercel (Frontend) + Render (Backend)
- Deploy React app to Vercel
- Keep backend on Render
- Update CORS and environment variables

### DigitalOcean App Platform
- Similar to Render
- Connect GitHub repo
- Configure build settings
- Deploy both frontend and backend

## 🎉 Success!

Once deployed, share your game URL with friends and enjoy playing Big Two online!

**Your live game**: `https://[your-frontend-url].onrender.com`

---

Need help? Check the README.md for detailed documentation or open an issue on GitHub.
