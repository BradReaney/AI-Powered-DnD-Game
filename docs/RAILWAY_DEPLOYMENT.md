# 🚂 Railway Deployment Guide

Complete guide to deploying the AI-Powered D&D Game on Railway platform.

## 🎯 Overview

Railway is the **recommended deployment platform** for this application. It provides:
- **Automatic SSL certificates** and HTTPS
- **Built-in MongoDB and Redis services**
- **Automatic scaling** and load balancing
- **Zero-downtime deployments**
- **Environment variable management**
- **GitHub integration** for automatic deployments

## 🏗️ Railway Architecture

### Service Structure
```
Railway Project
├── Frontend Service (Next.js)
├── Backend Service (Express.js)
├── MongoDB Service
└── Redis Service
```

### Communication Flow
```
Internet → Railway Load Balancer → Frontend/Backend Services
                                    ↓
                            MongoDB + Redis (Railway Services)
```

## 🚀 Quick Deployment

### 1. Prerequisites
- GitHub repository with your code
- Railway account (free tier available)
- Google Gemini API key

### 2. Create Railway Project
1. **Sign in to Railway**: [railway.app](https://railway.app)
2. **Create New Project**: Click "New Project"
3. **Connect Repository**: Select "Deploy from GitHub repo"
4. **Choose Repository**: Select your AI-Powered D&D Game repo

### 3. Add Services

#### Frontend Service
1. **Add Service**: Click "New Service" → "GitHub Repo"
2. **Select Repository**: Choose your repo
3. **Set Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Start Command**: `npm start`

#### Backend Service
1. **Add Service**: Click "New Service" → "GitHub Repo"
2. **Select Repository**: Choose your repo
3. **Set Root Directory**: `backend`
4. **Build Command**: `npm run build`
5. **Start Command**: `npm start`

#### MongoDB Service
1. **Add Service**: Click "New Service" → "Database"
2. **Select Database**: MongoDB
3. **Choose Plan**: Free tier (512MB) or paid plan

#### Redis Service
1. **Add Service**: Click "New Service" → "Database"
2. **Select Database**: Redis
3. **Choose Plan**: Free tier (100MB) or paid plan

## ⚙️ Environment Configuration

### 1. Use Railway Environment Template
```bash
# In your local repository
cp config/env.railway .env
```

### 2. Update Environment Variables
Edit the `.env` file with your Railway service URLs:

```env
# Frontend Configuration
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
NEXT_PUBLIC_APP_NAME=AI-Powered D&D Game

# Backend Configuration
BACKEND_URL=https://your-backend-service.railway.app
FRONTEND_URL=https://your-frontend-service.railway.app

# Database Configuration
MONGODB_URI=mongodb://username:password@your-mongodb-service.railway.app:27017/ai-dnd-game
REDIS_HOST=your-redis-service.railway.app

# Security Configuration
CORS_ORIGIN=https://your-frontend-service.railway.app
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Set Railway Variables
Use the Railway dashboard or CLI to set environment variables:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Set variables for backend service
railway variables set MONGODB_URI="mongodb://username:password@your-mongodb-service.railway.app:27017/ai-dnd-game"
railway variables set REDIS_HOST="your-redis-service.railway.app"
railway variables set GEMINI_API_KEY="your_gemini_api_key_here"

# Set variables for frontend service
railway variables set NEXT_PUBLIC_API_URL="https://your-backend-service.railway.app"
railway variables set NEXT_PUBLIC_APP_NAME="AI-Powered D&D Game"
```

## 🔧 Service Configuration

### Frontend Service Settings
```yaml
# Railway service configuration
Build Command: npm run build
Start Command: npm start
Health Check Path: /
Health Check Timeout: 300
```

### Backend Service Settings
```yaml
# Railway service configuration
Build Command: npm run build
Start Command: npm start
Health Check Path: /health
Health Check Timeout: 300
```

### MongoDB Service Settings
```yaml
# Railway MongoDB configuration
Database Name: ai-dnd-game
Username: admin
Password: [auto-generated]
Connection String: [auto-generated]
```

### Redis Service Settings
```yaml
# Railway Redis configuration
Database: 0
Password: [auto-generated]
Connection String: [auto-generated]
```

## 🌐 Domain Configuration

### 1. Generate Custom Domain
1. **Go to Frontend Service**: Click on your frontend service
2. **Settings Tab**: Click "Settings"
3. **Custom Domains**: Click "Generate Domain"
4. **Choose Domain**: Select your preferred domain name

### 2. Update CORS Configuration
After generating domains, update your CORS settings:

```env
# Update CORS_ORIGIN with your new domain
CORS_ORIGIN=https://your-custom-domain.railway.app
FRONTEND_URL=https://your-custom-domain.railway.app
```

## 📊 Monitoring and Logs

### View Service Logs
```bash
# View logs for specific service
railway logs --service frontend
railway logs --service backend

# Follow logs in real-time
railway logs --service backend --follow
```

### Service Health Checks
- **Frontend**: `https://your-frontend-service.railway.app/`
- **Backend**: `https://your-backend-service.railway.app/health`
- **MongoDB**: Connection status in Railway dashboard
- **Redis**: Connection status in Railway dashboard

## 🔄 Deployment Workflow

### 1. Automatic Deployment
- **Push to Main**: Automatically deploys to Railway
- **Pull Request**: Creates preview deployments
- **Branch Protection**: Ensures main branch stability

### 2. Manual Deployment
```bash
# Deploy specific service
railway up --service frontend

# Deploy all services
railway up

# View deployment status
railway status
```

### 3. Rollback Deployment
```bash
# List deployments
railway deployments

# Rollback to previous deployment
railway rollback --deployment-id <id>
```

## 🧪 Testing Deployment

### 1. Health Check Endpoints
```bash
# Test frontend
curl https://your-frontend-service.railway.app/

# Test backend
curl https://your-backend-service.railway.app/health

# Test API endpoints
curl https://your-backend-service.railway.app/api/campaigns
```

### 2. Database Connectivity
```bash
# Test MongoDB connection
curl https://your-backend-service.railway.app/api/health/db

# Test Redis connection
curl https://your-backend-service.railway.app/api/health/cache
```

### 3. AI Integration Test
```bash
# Test AI story generation
curl -X POST https://your-backend-service.railway.app/api/gameplay/story-response \
  -H "Content-Type: application/json" \
  -d '{"prompt": "I look around the tavern"}'
```

## 🚨 Troubleshooting

### Common Issues

#### Frontend Build Failures
```bash
# Check build logs
railway logs --service frontend

# Common solutions:
# 1. Ensure all dependencies are in package.json
# 2. Check Node.js version compatibility
# 3. Verify build commands are correct
```

#### Backend Connection Issues
```bash
# Check backend logs
railway logs --service backend

# Common solutions:
# 1. Verify environment variables are set
# 2. Check MongoDB and Redis connection strings
# 3. Ensure CORS_ORIGIN is correct
```

#### Database Connection Problems
```bash
# Check service variables
railway variables --service backend

# Verify connection strings
# Ensure services are in same project
```

### Performance Issues

#### High Response Times
1. **Check Service Resources**: Ensure adequate CPU/memory allocation
2. **Database Indexing**: Verify MongoDB indexes are created
3. **Caching**: Check Redis connection and cache hit rates
4. **AI API Limits**: Monitor Gemini API usage and quotas

#### Memory Issues
1. **Increase Memory**: Upgrade service plan if needed
2. **Optimize Build**: Reduce bundle sizes
3. **Database Queries**: Optimize MongoDB queries
4. **Cache Management**: Implement proper cache eviction

## 💰 Cost Optimization

### Free Tier Limits
- **Frontend**: 512MB RAM, 0.5 CPU
- **Backend**: 512MB RAM, 0.5 CPU
- **MongoDB**: 512MB storage
- **Redis**: 100MB storage

### Paid Plans
- **Starter**: $5/month per service
- **Standard**: $20/month per service
- **Pro**: $50/month per service

### Cost-Saving Tips
1. **Use Free Tier**: Start with free tier for development
2. **Scale Down**: Scale down during low usage periods
3. **Database Optimization**: Use appropriate database sizes
4. **CDN**: Use Railway's built-in CDN for static assets

## 🔐 Security Best Practices

### Environment Variables
- **Never commit secrets**: Use Railway variables for sensitive data
- **Rotate secrets**: Regularly update JWT and session secrets
- **Limit access**: Restrict who can view/modify variables

### CORS Configuration
```env
# Restrict to your domains only
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

### Rate Limiting
```env
# Production rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

## 📚 Additional Resources

### Railway Documentation
- [Railway Docs](https://docs.railway.app/)
- [CLI Reference](https://docs.railway.app/reference/cli)
- [Environment Variables](https://docs.railway.app/develop/variables)

### Application Documentation
- [Installation Guide](../INSTALLATION.md)
- [Environment Structure](../ENV_STRUCTURE.md)
- [Production Deployment](../PRODUCTION_DEPLOYMENT.md)

### Support
- **Railway Support**: [support.railway.app](https://support.railway.app/)
- **GitHub Issues**: Report bugs and request features
- **Community**: Join our Discord server for help

## ✅ Deployment Checklist

- [ ] **Railway project created** and connected to GitHub
- [ ] **All services added** (Frontend, Backend, MongoDB, Redis)
- [ ] **Environment variables set** for all services
- [ ] **Custom domains configured** (optional)
- [ ] **Health checks passing** for all services
- [ ] **API endpoints tested** and working
- [ ] **AI integration verified** with Gemini API
- [ ] **Database connections** established
- [ ] **CORS configuration** updated with production URLs
- [ ] **SSL certificates** automatically generated
- [ ] **Monitoring and logging** configured
- [ ] **Deployment workflow** tested

---

**Ready to deploy?** 🚀

Follow this guide to get your AI-Powered D&D Game running on Railway in minutes!
