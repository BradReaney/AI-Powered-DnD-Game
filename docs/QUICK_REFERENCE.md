# ⚡ Quick Reference

Essential commands, configurations, and shortcuts for the AI-Powered D&D Game.

## 🚀 Quick Start Commands

### Docker Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Build and start
docker-compose up --build -d

# Clean up everything
docker-compose down --volumes --remove-orphans
```

### Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start individually
npm run dev:frontend
npm run dev:backend

# Build both
npm run build

# Run all tests
npm test

# Lint and format
npm run lint
npm run format
npm run quality
```

## 🔧 Environment Configuration

### Essential Environment Variables

```env
# Required
GEMINI_API_KEY=your_api_key_here
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password

# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/ai-dnd-game?authSource=admin

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password
REDIS_HOST_INTERNAL=redis

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### AI Model Configuration

```env
# Model Selection
MODEL_SELECTION_ENABLED=true
FLASH_LITE_QUALITY_THRESHOLD=0.6
FLASH_QUALITY_THRESHOLD=0.7
PRO_FALLBACK_ENABLED=true

# Performance Thresholds
FLASH_LITE_RESPONSE_TIME_THRESHOLD=3000
FLASH_RESPONSE_TIME_THRESHOLD=5000

# Context Management
MAX_CONTEXT_LENGTH=8000
CONTEXT_COMPRESSION_THRESHOLD=6000
```

## 🗄️ Redis Cache Management

### Redis Container Operations

```bash
# Check Redis container status
docker-compose ps redis

# View Redis logs
docker-compose logs redis

# Access Redis CLI
docker-compose exec redis redis-cli

# Redis health check
docker-compose exec redis redis-cli ping

# Monitor Redis operations
docker-compose exec redis redis-cli monitor

# Check Redis info
docker-compose exec redis redis-cli info
```

### Cache Management via API

```bash
# Check Redis health
curl http://localhost:5001/health/redis

# Get cache statistics
curl http://localhost:5001/api/cache/stats

# Warm up cache
curl -X POST http://localhost:5001/api/cache/warm

# Clear all cache
curl -X POST http://localhost:5001/api/cache/clear

# Get performance recommendations
curl http://localhost:5001/api/cache/performance
```

### Redis CLI Commands

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# List all keys
KEYS *

# List cache keys by pattern
KEYS dnd_game:*

# Check specific key
GET dnd_game:campaigns:get:507f1f77bcf86cd799439011

# Check key TTL
TTL dnd_game:campaigns:get:507f1f77bcf86cd799439011

# Delete specific key
DEL dnd_game:campaigns:get:507f1f77bcf86cd799439011

# Delete pattern-based keys
DEL dnd_game:campaigns:*

# Check memory usage
INFO memory

# Check Redis stats
INFO stats
```

### Cache Performance Monitoring

```bash
# Monitor cache hit rate
watch -n 5 'curl -s http://localhost:5001/api/cache/stats | jq ".data.hitRate"'

# Check cache key count
curl -s http://localhost:5001/api/cache/stats | jq ".data.keys"

# Monitor Redis memory usage
watch -n 5 'docker-compose exec redis redis-cli info memory | grep used_memory_human'
```

## 🌐 Service URLs

### Development

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5001 | 5001 |
| MongoDB | localhost:27017 | 27017 |
| Redis | localhost:6379 | 6379 |

### Health Checks

```bash
# Backend health
curl http://localhost:5001/health

# Frontend health
curl http://localhost:3000/health

# MongoDB health
docker exec dnd-game-mongodb mongosh --eval "db.adminCommand('ping')"

# Redis health
docker exec dnd-game-redis redis-cli ping
```

## 🗄️ Database Operations

### MongoDB Commands

```bash
# Connect to MongoDB
docker exec -it dnd-game-mongodb mongosh \
  --username admin --password password \
  --authenticationDatabase admin

# List databases
show dbs

# Use database
use ai-dnd-game

# List collections
show collections

# Find documents
db.campaigns.find()
db.characters.find()
db.sessions.find()

# Count documents
db.campaigns.countDocuments()
```

### Redis Commands

```bash
# Connect to Redis
docker exec -it dnd-game-redis redis-cli

# List keys
keys *

# Get value
get key_name

# Set value
set key_name value

# Delete key
del key_name

# Check memory usage
info memory
```

## 🧪 Testing Commands

### Backend Testing

```bash
# Run all tests
cd backend && npm test

# Run specific test file
npm test -- CharacterService.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch

# Run performance tests
npm test -- --testPathPattern="performance"
```

### Frontend Testing

```bash
# Run linting
cd frontend && npm run lint

# Fix linting issues
npm run lint:fix

# Check TypeScript
npx tsc --noEmit

# Build check
npm run build
```

### Integration Testing

```bash
# Test API endpoints
curl -H "Authorization: Bearer your_token" \
  http://localhost:5001/api/campaigns

# Test AI integration
curl -X POST http://localhost:5001/api/gameplay/story-response \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"message":"Hello AI"}'
```

## 🔍 Debugging Commands

### Log Analysis

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Filter logs by keyword
docker-compose logs backend | grep -i "error"
docker-compose logs backend | grep -i "gemini"
docker-compose logs backend | grep -i "cors"
```

### Container Inspection

```bash
# Check container status
docker-compose ps

# Inspect container
docker inspect dnd-game-backend

# Execute commands in container
docker exec -it dnd-game-backend sh
docker exec -it dnd-game-mongodb mongosh
docker exec -it dnd-game-redis redis-cli

# View container resources
docker stats
```

### Network Diagnostics

```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :5001
netstat -tulpn | grep :27017

# Test connectivity
curl -I http://localhost:3000
curl -I http://localhost:5001

# Check CORS
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:5001/api/campaigns
```

## 🚀 Performance Monitoring

### Resource Usage

```bash
# Monitor containers
docker stats --no-stream

# Check memory usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Monitor specific container
docker stats dnd-game-backend --no-stream
```

### Performance Metrics

```bash
# Check AI performance
curl -H "Authorization: Bearer your_token" \
  http://localhost:5001/api/ai/performance

# Check database performance
docker exec dnd-game-mongodb mongosh \
  --eval "db.currentOp()"

# Check Redis performance
docker exec dnd-game-redis redis-cli info stats
```

## 🔒 Security Commands

### Authentication Testing

```bash
# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Test token verification
curl -H "Authorization: Bearer your_token" \
  http://localhost:5001/api/auth/verify

# Test protected endpoint
curl -H "Authorization: Bearer your_token" \
  http://localhost:5001/api/campaigns
```

### Security Checks

```bash
# Check environment variables
grep -E "(API_KEY|SECRET|PASSWORD)" .env

# Verify CORS configuration
grep CORS_ORIGIN .env

# Check rate limiting
grep RATE_LIMIT .env
```

## 📱 Mobile Development

### Mobile Testing

```bash
# Check mobile responsiveness
# Use browser DevTools device simulation

# Test touch interactions
# Use browser DevTools touch simulation

# Check viewport settings
# Verify meta viewport tag in frontend
```

### Mobile Optimization

```bash
# Check bundle size
cd frontend && npm run build

# Analyze bundle
npx @next/bundle-analyzer

# Check mobile performance
# Use Lighthouse mobile audit
```

## 🗂️ File Management

### Project Structure

```bash
# View project structure
tree -I 'node_modules|.git|.next|dist|logs'

# Check file sizes
du -sh */ | sort -hr

# Find large files
find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*"
```

### Cleanup Commands

```bash
# Clean Docker
docker system prune -f
docker volume prune -f

# Clean Node modules
npm run clean

# Clean logs
rm -rf logs/*.log
rm -rf backend/logs/*.log

# Clean build artifacts
rm -rf frontend/.next
rm -rf backend/dist
```

## 🔄 Common Workflows

### Development Workflow

```bash
# 1. Start services
docker-compose up -d

# 2. Make code changes

# 3. Test changes
npm test

# 4. Build and restart
docker-compose restart backend
docker-compose restart frontend

# 5. Check logs
docker-compose logs -f
```

### Debugging Workflow

```bash
# 1. Check service status
docker-compose ps

# 2. Check logs for errors
docker-compose logs -f [service-name]

# 3. Test endpoints
curl [endpoint-url]

# 4. Check environment
docker-compose config

# 5. Restart if needed
docker-compose restart [service-name]
```

### Production Deployment

```bash
# 1. Set production environment
export NODE_ENV=production

# 2. Update environment variables
# Edit .env with production values

# 3. Build and start
docker-compose up --build -d

# 4. Verify deployment
docker-compose ps
curl [production-url]/health

# 5. Monitor logs
docker-compose logs -f
```

## 📊 Monitoring Commands

### Health Monitoring

```bash
# Continuous health check
watch -n 5 'docker-compose ps && echo "---" && curl -s http://localhost:5001/health'

# Monitor resource usage
watch -n 5 'docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"'

# Monitor logs
docker-compose logs -f --tail=100
```

### Performance Monitoring

```bash
# Monitor response times
watch -n 10 'curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5001/health'

# Monitor database connections
watch -n 5 'docker exec dnd-game-mongodb mongosh --eval "db.serverStatus().connections"'

# Monitor AI performance
watch -n 30 'curl -s -H "Authorization: Bearer your_token" http://localhost:5001/api/ai/performance'
```

## 🆘 Emergency Commands

### Service Recovery

```bash
# Force restart all services
docker-compose down
docker system prune -f
docker-compose up -d

# Reset database (WARNING: Data loss)
docker-compose down -v
docker-compose up -d

# Reset to clean state
git clean -fdx
git reset --hard HEAD
docker-compose down --volumes --remove-orphans
docker-compose up --build -d
```

### Data Backup

```bash
# Backup MongoDB data
docker exec dnd-game-mongodb mongodump --out /backup

# Backup Redis data
docker exec dnd-game-redis redis-cli BGSAVE

# Backup configuration
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup
```

## 📚 Useful Aliases

### Add to ~/.bashrc or ~/.zshrc

```bash
# Docker aliases
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
alias dcrestart='docker-compose restart'

# Development aliases
alias dnd-dev='npm run dev'
alias dnd-test='npm test'
alias dnd-build='npm run build'
alias dnd-clean='npm run clean'

# Log aliases
alias dnd-logs='docker-compose logs -f'
alias dnd-backend-logs='docker-compose logs -f backend'
alias dnd-frontend-logs='docker-compose logs -f frontend'

# Health check aliases
alias dnd-health='curl -s http://localhost:5001/health | jq'
alias dnd-status='docker-compose ps && echo "---" && curl -s http://localhost:5001/health'
```

## 🔧 Configuration Files

### Key Configuration Locations

| File | Purpose | Location |
|------|---------|----------|
| `.env` | Environment variables | Root directory |
| `docker-compose.yml` | Docker services | Root directory |
| `package.json` | Dependencies & scripts | Root, frontend/, backend/ |
| `tsconfig.json` | TypeScript config | frontend/, backend/ |
| `tailwind.config.js` | CSS framework config | frontend/ |
| `next.config.js` | Next.js config | frontend/ |

### Environment File Template

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
# SECURITY CONFIGURATION
# =============================================================================
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

**For detailed information, see the full documentation:**
- [Installation Guide](INSTALLATION.md)
- [User Guide](USER_GUIDE.md)
- [API Reference](API_REFERENCE.md)
- [AI Integration Guide](AI_INTEGRATION.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

**Remember: Most issues can be resolved with `docker-compose restart` and checking the logs!** 🔧
