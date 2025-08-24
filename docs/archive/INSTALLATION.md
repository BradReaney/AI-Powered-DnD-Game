# 🛠️ AI-Powered D&D Game - Installation Guide

## **📋 Table of Contents**

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Testing Installation](#testing-installation)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

## **💻 System Requirements**

### **Docker Deployment (Recommended)**
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Docker**: Version 20.10+ and Docker Compose 2.0+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for AI API access

### **Local Development**
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 18.0.0 or higher
- **MongoDB**: Version 5.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for AI API access

### **Recommended Requirements**
- **Operating System**: Latest stable version
- **Docker**: Latest stable version
- **Node.js**: Version 20.0.0 or higher (LTS) (for local development)
- **MongoDB**: Version 7.0 or higher (for local development)
- **RAM**: 16GB or higher
- **Storage**: SSD with 10GB free space
- **Network**: High-speed internet connection

### **Development Requirements**
- **Git**: Version 2.0 or higher
- **Code Editor**: VS Code, WebStorm, or similar
- **Terminal**: Command line interface
- **Browser**: Chrome, Firefox, Safari, or Edge (latest)

## **🔧 Prerequisites**

### **1. Node.js Installation**

#### **Windows**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### **macOS**
1. **Using Homebrew (Recommended)**:
   ```bash
   brew install node
   ```
2. **Using Official Installer**:
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the .pkg installer
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### **Linux (Ubuntu/Debian)**
```bash
# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### **Linux (CentOS/RHEL)**
```bash
# Install Node.js from NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### **2. MongoDB Installation**

#### **Windows**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Install MongoDB Compass (GUI) if desired
4. Add MongoDB to system PATH
5. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

#### **macOS**
1. **Using Homebrew (Recommended)**:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

2. **Using Official Installer**:
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Run the .tgz installer
   - Follow setup instructions

#### **Linux (Ubuntu/Debian)**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongod --version
```

#### **Linux (CentOS/RHEL)**
```bash
# Create MongoDB repository file
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

# Install MongoDB
sudo yum install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongod --version
```

### **3. Docker Installation (Recommended)**

#### **Windows**
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Run the installer and follow the setup wizard
3. Ensure WSL 2 is enabled if prompted
4. Start Docker Desktop
5. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

#### **macOS**
1. **Using Homebrew (Recommended)**:
   ```bash
   brew install --cask docker
   ```
2. **Using Official Installer**:
   - Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Run the .dmg installer
   - Follow setup instructions
3. Start Docker Desktop
4. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

#### **Linux (Ubuntu/Debian)**
```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

#### **Linux (CentOS/RHEL)**
```bash
# Install prerequisites
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### **4. Git Installation**

#### **Windows**
1. Download Git from [git-scm.com](https://git-scm.com/)
2. Run the installer and follow the setup wizard
3. Verify installation:
   ```bash
   git --version
   ```

#### **macOS**
```bash
# Git is usually pre-installed, but you can update with:
brew install git

# Verify installation
git --version
```

#### **Linux**
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git

# Verify installation
git --version
```

## **📥 Installation Steps**

### **1. Clone the Repository**
```bash
# Clone the repository
git clone https://github.com/your-username/ai-powered-dnd-game.git

# Navigate to the project directory
cd ai-powered-dnd-game
```

### **2. Docker Installation (Recommended)**

#### **Quick Start with Docker**
```bash
# Copy environment template
cp config/env.example .env

# Edit environment variables (see Configuration section)
nano .env

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### **Build and Start**
```bash
# Build and start all services
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:5001
# MongoDB: localhost:27017
# Redis: localhost:6379
```

### **3. Local Development Installation**

### **2. Backend Installation**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment configuration
cp config/env.example .env

# Edit environment variables (see Configuration section)
nano .env
# or use your preferred editor
```

### **3. Frontend Installation**
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Copy environment configuration (if needed)
cp config/env.example .env
```

### **4. Database Setup**
```bash
# Start MongoDB (if not already running)
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod

# Verify MongoDB is running
mongosh --eval "db.serverStatus()"
```

## **⚙️ Configuration**

### **Environment Variables (.env)**

#### **Required Variables**
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
MONGODB_URI=mongodb://admin:password@mongodb:27017/ai-dnd-game?authSource=admin

# Google Gemini AI Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_FLASH_LITE_MODEL=gemini-2.5-flash-lite
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro

# Security Configuration
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=http://localhost:80
```

#### **Optional Variables**
```env
# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/dnd-game/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_MAX_AGE=86400000

# AI Context Configuration
MAX_CONTEXT_LENGTH=8000
CONTEXT_COMPRESSION_THRESHOLD=6000

# Frontend Configuration
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=AI-Powered D&D Game

# Redis Configuration
REDIS_PASSWORD=

# Model Selection Settings
MODEL_SELECTION_ENABLED=true
FLASH_LITE_QUALITY_THRESHOLD=0.6
FLASH_QUALITY_THRESHOLD=0.7
PRO_FALLBACK_ENABLED=true
THREE_MODEL_FALLBACK_ENABLED=true
FLASH_LITE_RESPONSE_TIME_THRESHOLD=3000
FLASH_RESPONSE_TIME_THRESHOLD=5000
```

### **Frontend Environment Variables (.env)**

#### **Required Variables**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# App Configuration
VITE_APP_NAME=AI-Powered D&D Game
VITE_APP_VERSION=1.0.0
```

#### **Optional Variables**
```env
# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# External Services
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=
```

### **MongoDB Configuration**

#### **Create Database and User**
```bash
# Connect to MongoDB
mongosh

# Create database
use ai-dnd-game

# Create user (optional, for production)
db.createUser({
  user: "dnd_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})

# Exit MongoDB shell
exit
```

#### **Update Connection String**
If you created a user, update your `.env` file:
```env
MONGODB_URI=mongodb://dnd_user:secure_password@localhost:27017/ai-dnd-game
```

### **AI API Configuration**

#### **Google Gemini API Setup**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key to your `.env` file
4. Set appropriate usage limits and restrictions

#### **API Key Security**
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Consider using a secrets management service in production

## **🧪 Testing Installation**

### **1. Docker Installation Testing**

#### **Check Service Status**
```bash
# View all running services
docker-compose ps

# Expected output: All services healthy
# dnd-game-mongodb    Up (healthy)
# dnd-game-redis      Up (healthy)  
# dnd-game-backend    Up (healthy)
# dnd-game-frontend   Up (healthy)
```

#### **Test Service Connectivity**
```bash
# Test backend health
curl http://localhost:5001/health

# Expected output: {"status":"ok","timestamp":"...","uptime":...,"environment":"development"}

# Test frontend
curl http://localhost:80

# Expected output: HTML content (frontend loads)

# Test API proxy
curl http://localhost:80/api/campaigns

# Expected output: [] (empty array, but API is accessible)
```

#### **Check Service Logs**
```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
docker-compose logs redis
```

### **2. Local Development Testing**
```bash
# Navigate to backend directory
cd backend

# Run tests
npm test

# Expected output: All tests passing
# Test Suites: 6 passed, 6 total
# Tests: 85 passed, 85 total
```

### **2. Backend Server Testing**
```bash
# Start development server
npm run dev

# Expected output: Server running on port 3000
# Server is running on port 3000
# Connected to MongoDB
```

### **3. Frontend Testing**
```bash
# Navigate to frontend directory
cd ../frontend

# Start development server
npm run dev

# Expected output: Server running on port 5173
# Local:   http://localhost:5173/
# Network: http://192.168.1.100:5173/
```

### **4. Integration Testing**
1. Open browser to `http://localhost:5173`
2. Verify the application loads without errors
3. Check browser console for any error messages
4. Test basic navigation between components

### **5. API Testing**
```bash
# Test backend API health
curl http://localhost:3000/api/health

# Expected output: {"status":"ok","timestamp":"..."}
```

## **🔧 Troubleshooting**

### **Docker Issues**

#### **Services Not Starting**
```bash
# Check Docker status
docker --version
docker-compose --version

# Check if ports are available
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :5001

# macOS/Linux
lsof -i :80
lsof -i :5001

# Check container logs
docker-compose logs [service-name]

# Restart services
docker-compose restart
```

#### **Environment Variable Issues**
```bash
# Verify .env file exists
ls -la .env

# Check environment variables in container
docker exec dnd-game-backend env | grep GEMINI

# Restart after changing .env
docker-compose down
docker-compose up -d
```

#### **Permission Issues**
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Restart Docker service
sudo systemctl restart docker
```

### **Common Installation Issues**

#### **Node.js Issues**
```bash
# Check Node.js version
node --version

# If version is too old, update Node.js
# Windows: Download new installer
# macOS: brew upgrade node
# Linux: Use NodeSource repository

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **MongoDB Issues**
```bash
# Check MongoDB status
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Check MongoDB logs
# Windows: Event Viewer
# macOS: /usr/local/var/log/mongodb/mongo.log
# Linux: /var/log/mongodb/mongod.log

# Restart MongoDB service
# Windows
net stop MongoDB && net start MongoDB

# macOS
brew services restart mongodb/brew/mongodb-community

# Linux
sudo systemctl restart mongod
```

#### **Port Conflicts**
```bash
# Check what's using port 3000
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Kill process using the port
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

#### **Permission Issues**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Fix MongoDB permissions (Linux)
sudo chown -R mongod:mongod /var/lib/mongodb
sudo chown -R mongod:mongod /var/log/mongodb
```

### **Performance Issues**

#### **Slow Installation**
```bash
# Use faster npm registry
npm config set registry https://registry.npmjs.org/

# Use yarn instead of npm
npm install -g yarn
yarn install

# Use pnpm for faster installs
npm install -g pnpm
pnpm install
```

#### **Memory Issues**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or add to package.json scripts
"dev": "NODE_OPTIONS='--max-old-space-size=4096' nodemon src/index.ts"
```

### **Network Issues**

#### **Firewall Configuration**
```bash
# Windows Firewall
netsh advfirewall firewall add rule name="AI D&D Game Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="AI D&D Game Frontend" dir=in action=allow protocol=TCP localport=5173

# macOS Firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/bin/node

# Linux UFW
sudo ufw allow 3000
sudo ufw allow 5173
```

#### **Proxy Configuration**
```bash
# Set npm proxy if behind corporate firewall
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Set Git proxy
git config --global http.proxy http://proxy.company.com:8080
git config --global https.proxy http://proxy.company.com:8080
```

## **🚀 Production Deployment**

### **Environment Preparation**
```bash
# Set production environment
export NODE_ENV=production

# Update environment variables
# .env.production
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://production-server:27017/ai-dnd-game
GEMINI_API_KEY=your_production_api_key
```

### **Build Process**
```bash
# Backend build
cd backend
npm run build

# Frontend build
cd ../frontend
npm run build
```

### **Process Management**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart all
```

### **Docker Deployment**

#### **Production Environment Setup**
```bash
# Copy production environment template
cp config/env.production .env

# Edit production variables
nano .env

# Set production values
NODE_ENV=production
PORT=5001
MONGO_ROOT_PASSWORD=secure_production_password
GEMINI_API_KEY=your_production_api_key
JWT_SECRET=secure_jwt_secret
SESSION_SECRET=secure_session_secret
```

#### **Production Docker Compose**
```bash
# Start production services
docker-compose -f docker-compose.yml up -d

# Monitor services
docker-compose ps
docker-compose logs -f

# Scale services if needed
docker-compose up -d --scale backend=3
```

#### **Individual Container Deployment**
```bash
# Build production images
docker build -t ai-dnd-backend:prod ./backend
docker build -t ai-dnd-frontend:prod ./frontend

# Run production containers
docker run -d -p 5001:5001 --name ai-dnd-backend-prod ai-dnd-backend:prod
docker run -d -p 80:80 --name ai-dnd-frontend-prod ai-dnd-frontend:prod
```

### **Reverse Proxy (Nginx)**
```nginx
# /etc/nginx/sites-available/ai-dnd-game
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## **📚 Next Steps**

### **After Installation**
1. **Read the Documentation**:
   - [User Guide](USER_GUIDE.md)
   - [Quick Reference](QUICK_REFERENCE.md)
   - [Troubleshooting](TROUBLESHOOTING.md)

2. **Explore the Application**:
   - Create your first campaign
   - Build a character
   - Start a game session

3. **Join the Community**:
   - Report bugs on GitHub
   - Request new features
   - Contribute to development

### **Development Setup**
1. **Set up your development environment**:
   - Install VS Code or your preferred editor
   - Configure debugging tools
   - Set up linting and formatting

2. **Learn the codebase**:
   - Review the architecture
   - Understand the service structure
   - Explore the frontend components

3. **Start contributing**:
   - Pick an issue to work on
   - Write tests for new features
   - Submit pull requests

---

**Last Updated**: August 2025  
**Version**: 1.1.0

For additional help, see the [Troubleshooting Guide](TROUBLESHOOTING.md) or create an issue on GitHub.
