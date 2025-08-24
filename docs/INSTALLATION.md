# 📥 Installation Guide

Complete setup instructions for the AI-Powered D&D Game application.

## 🎯 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher)
- **Git** (for cloning the repository)

### Optional Software
- **MongoDB Compass** (for database management)
- **Redis Commander** (for cache management)
- **VS Code** or your preferred code editor

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **Network**: Internet connection for AI API calls

## 🚀 Quick Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BradReaney/AI-Powered-DnD-Game.git
cd ai-powered-dnd-game
```

### 2. Environment Setup

```bash
# Copy the environment template
cp config/env.example .env

# Edit the environment file with your configuration
nano .env  # or use your preferred editor
```

### 3. Configure Environment Variables

Edit the `.env` file with your specific values:

```env
# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
PORT=5001
NODE_ENV=development

# =============================================================================
# MONGODB CONFIGURATION
# =============================================================================
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
MONGODB_URI=mongodb://admin:password@mongodb:27017/ai-dnd-game?authSource=admin

# =============================================================================
# GOOGLE GEMINI AI CONFIGURATION
# =============================================================================
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_FLASH_LITE_MODEL=gemini-2.5-flash-lite
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro

# =============================================================================
# AI MODEL SELECTION CONFIGURATION
# =============================================================================
MODEL_SELECTION_ENABLED=true
FLASH_LITE_QUALITY_THRESHOLD=0.6
FLASH_QUALITY_THRESHOLD=0.7
PRO_FALLBACK_ENABLED=true
FLASH_LITE_RESPONSE_TIME_THRESHOLD=3000
FLASH_RESPONSE_TIME_THRESHOLD=5000

# =============================================================================
# CONTEXT MANAGEMENT
# =============================================================================
MAX_CONTEXT_LENGTH=8000
CONTEXT_COMPRESSION_THRESHOLD=6000

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# =============================================================================
# RATE LIMITING
# =============================================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =============================================================================
# SESSION CONFIGURATION
# =============================================================================
SESSION_MAX_AGE=86400000

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
LOG_LEVEL=info
LOG_FILE=/var/log/dnd-game/app.log

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_PASSWORD=

# =============================================================================
# DOCKER CONFIGURATION
# =============================================================================
BACKEND_URL=http://backend:5001
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_NAME=AI-Powered D&D Game
```

### 4. Get Your Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Replace `your_actual_gemini_api_key_here` in your `.env` file

### 5. Start the Application

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or build and start (recommended for first run)
docker-compose up --build -d
```

### 6. Verify Installation

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test the application
curl http://localhost:5001/health
```

### 7. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🔧 Alternative Installation Methods

### Local Development (Without Docker)

If you prefer to run the application locally without Docker:

#### 1. Install Dependencies

```bash
# Install all dependencies (root, frontend, and backend)
npm run install:all
```

#### 2. Start MongoDB Locally

```bash
# Using Docker for MongoDB only
docker run -d \
  --name dnd-game-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=ai-dnd-game \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

#### 3. Start Redis Locally

```bash
# Using Docker for Redis only
docker run -d \
  --name dnd-game-redis \
  -p 6379:6379 \
  redis:7.2-alpine
```

#### 4. Update Environment Variables

For local development, update these variables in your `.env`:

```env
MONGODB_URI=mongodb://admin:password@localhost:27017/ai-dnd-game?authSource=admin
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:5001
```

#### 5. Start the Application

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on port 3000
npm run dev:backend   # Backend on port 5001
```

### Production Installation

For production deployment:

#### 1. Environment Configuration

```env
NODE_ENV=production
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=50
```

#### 2. Security Hardening

```env
# Use strong, unique secrets
JWT_SECRET=your_very_long_random_secret_here
SESSION_SECRET=another_very_long_random_secret_here

# Restrict CORS to your domain
CORS_ORIGIN=https://yourdomain.com
```

#### 3. Database Configuration

```env
# Use production MongoDB instance
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/ai-dnd-game?authSource=admin

# Use production Redis instance
REDIS_PASSWORD=your_redis_password
```

## 🐛 Troubleshooting

### Common Issues

#### Docker Services Not Starting

```bash
# Check Docker status
docker --version
docker-compose --version

# Check if ports are available
netstat -tulpn | grep :3000
netstat -tulpn | grep :5001
netstat -tulpn | grep :27017

# Check container logs
docker-compose logs [service-name]
```

#### Environment Variable Issues

```bash
# Verify .env file exists
ls -la .env

# Check environment variable loading
docker-compose config

# Restart services after changes
docker-compose restart
```

#### AI Not Responding

```bash
# Check API key configuration
grep GEMINI_API_KEY .env

# Test API connectivity
curl -H "Authorization: Bearer your_api_key" \
  "https://generativelanguage.googleapis.com/v1beta/models"

# Check backend logs
docker-compose logs backend | grep -i gemini
```

#### Database Connection Issues

```bash
# Check MongoDB container health
docker-compose ps mongodb

# Test database connection
docker exec -it dnd-game-mongodb mongosh \
  --username admin --password password \
  --authenticationDatabase admin

# Check MongoDB logs
docker-compose logs mongodb
```

#### Frontend Not Loading

```bash
# Check frontend container status
docker-compose ps frontend

# Check frontend logs
docker-compose logs frontend

# Verify nginx configuration
docker exec -it dnd-game-frontend nginx -t
```

#### CORS Issues

```bash
# Check CORS configuration
grep CORS_ORIGIN .env

# Test CORS headers
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS http://localhost:5001/api/campaigns

# Check backend CORS logs
docker-compose logs backend | grep -i cors
```

### Performance Issues

```bash
# Monitor container resources
docker stats

# Check Redis cache status
docker-compose logs redis

# Monitor backend performance
docker-compose logs backend | grep -i performance
```

### Getting Help

1. **Check the logs**: `docker-compose logs -f [service-name]`
2. **Review the test suite**: `npm test`
3. **Check GitHub issues** for known problems
4. **Verify configuration**: `docker-compose config`

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT and session keys
- Rotate API keys regularly
- Restrict CORS origins to your domain

### Network Security

- Use HTTPS in production
- Configure firewall rules appropriately
- Monitor for suspicious activity
- Keep dependencies updated

### Database Security

- Use strong database passwords
- Restrict database access to application servers
- Enable MongoDB authentication
- Regular security updates

## 📚 Next Steps

After successful installation:

1. **Read the User Guide**: [docs/USER_GUIDE.md](USER_GUIDE.md)
2. **Explore the API**: [docs/API_REFERENCE.md](API_REFERENCE.md)
3. **Learn about AI Integration**: [docs/AI_INTEGRATION.md](AI_INTEGRATION.md)
4. **Check the Troubleshooting Guide**: [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 🆘 Support

If you encounter issues:

- **Check the logs**: `docker-compose logs -f`
- **Review this guide** for common solutions
- **Search GitHub issues** for similar problems
- **Create a new issue** with detailed error information

---

**Happy gaming!** 🎲✨
