# MongoDB Atlas Setup Guide

Since local MongoDB may not be installed, here's how to set up a free MongoDB Atlas cloud database for this project.

## Option 1: MongoDB Atlas (Recommended - Free & Easy)

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create a Free Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select a cloud provider and region (choose one closest to you)
4. Cluster Name: `big2-cluster` (or any name you prefer)
5. Click **"Create"**

### Step 3: Configure Database Access

1. **Create Database User:**
   - Click **"Database Access"** in the left sidebar
   - Click **"Add New Database User"**
   - Authentication Method: **Password**
   - Username: `big2admin` (or any username)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click **"Add User"**

### Step 4: Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, restrict to specific IPs
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your .env File

1. Open the `.env` file in your project root
2. Replace the `MONGODB_URI` line with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://big2admin:YOUR_PASSWORD@cluster.mongodb.net/big2-game?retryWrites=true&w=majority
   ```
3. Replace:
   - `big2admin` with your username
   - `YOUR_PASSWORD` with your actual password
   - Add `/big2-game` before the `?` to specify the database name

### Example .env Configuration

```env
# Server Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://big2admin:MySecurePass123@big2-cluster.mongodb.net/big2-game?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=dev-secret-key-please-change-in-production-12345
JWT_EXPIRE=7d
```

### Step 7: Test Connection

```bash
# Start the server
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
    ╔═══════════════════════════════════════╗
    ║   Big Two Multiplayer Server          ║
    ║   Server running on port 3001         ║
    ╚═══════════════════════════════════════╝
```

## Option 2: Local MongoDB Installation

### macOS (using Homebrew)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list
```

### Windows

1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service
5. Start MongoDB Service from Windows Services

### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update packages
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Verify Local Installation

```bash
# Check if MongoDB is running
mongosh

# You should see MongoDB shell if it's running
# Exit with: exit
```

## Troubleshooting

### Connection Refused Error

**Error:** `Error: connect ECONNREFUSED ::1:27017`

**Solution:**
- MongoDB is not running
- Use MongoDB Atlas (Option 1) OR
- Start local MongoDB: `brew services start mongodb-community` (macOS)

### Authentication Failed

**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Check your username and password in the connection string
- Ensure the password doesn't contain special characters (URL encode them)
- Verify the database user has correct permissions

### Network Access Denied

**Error:** `MongoNetworkError: connection timed out`

**Solution:**
- Add your IP address in MongoDB Atlas Network Access
- Or use "Allow Access from Anywhere" for development

### Invalid Connection String

**Error:** `Invalid connection string`

**Solution:**
- Ensure format is correct
- Check for typos in username/password
- URL encode special characters in password
- Example encoding: `@` becomes `%40`, `#` becomes `%23`

## Database Structure

Once connected, your MongoDB database will automatically create these collections:

- **users** - User accounts and authentication
- **games** - Active and completed game states
- **gamehistories** - Historical game records

## Viewing Your Data

### MongoDB Atlas

1. Go to your cluster in Atlas
2. Click **"Collections"**
3. Browse your databases and collections
4. You can manually view, edit, or delete documents

### Local MongoDB (using Compass)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Browse collections visually

### Command Line (mongosh)

```bash
# Connect to your database
mongosh "mongodb://localhost:27017/big2-game"

# Show all collections
show collections

# View users
db.users.find().pretty()

# View games
db.games.find().pretty()

# View game history
db.gamehistories.find().pretty()
```

## Production Deployment

For production deployment on Render:

1. Use MongoDB Atlas (recommended)
2. Create a separate production cluster
3. Add Render's IP addresses to Network Access
4. Set `MONGODB_URI` in Render's environment variables
5. Never commit .env file to Git!

## Security Best Practices

✅ Use strong passwords for database users
✅ Restrict Network Access to specific IPs in production
✅ Use environment variables for credentials
✅ Never commit .env file to version control
✅ Enable MongoDB Atlas backup for production
✅ Monitor database performance and alerts
✅ Regularly update connection credentials

## Need Help?

- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- MongoDB Community Forums: [community.mongodb.com](https://www.mongodb.com/community/forums)
- Render + MongoDB Guide: [render.com/docs/deploy-mongodb](https://render.com/docs/deploy-mongodb)

---

**Quick Start:** Use MongoDB Atlas (free, no installation needed)!
