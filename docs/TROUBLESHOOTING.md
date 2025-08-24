# 🐛 Troubleshooting Guide

Complete guide to resolving common issues with the AI-Powered D&D Game application.

## 🚨 Emergency Issues

### Application Won't Start

#### **Docker Services Not Starting**

**Symptoms:**
- `docker-compose up` fails
- Services show as "unhealthy" or "exited"
- Port conflicts in logs

**Quick Fix:**
```bash
# Stop all services and remove containers
docker-compose down --volumes --remove-orphans

# Clean up Docker system
docker system prune -f

# Restart Docker Desktop (if on Windows/Mac)
# Restart Docker service (if on Linux)
sudo systemctl restart docker

# Try starting again
docker-compose up -d
```

**Detailed Troubleshooting:**
```bash
# Check Docker status
docker --version
docker-compose --version

# Check if ports are available
netstat -tulpn | grep :3000
netstat -tulpn | grep :5001
netstat -tulpn | grep :27017

# Check Docker daemon logs
docker system info
docker info

# Check container logs
docker-compose logs
```

#### **Database Connection Failed**

**Symptoms:**
- Backend service won't start
- MongoDB connection errors
- Authentication failures

**Quick Fix:**
```bash
# Check MongoDB container health
docker-compose ps mongodb

# Restart MongoDB service
docker-compose restart mongodb

# Wait for MongoDB to be healthy
docker-compose ps mongodb
```

**Detailed Troubleshooting:**
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker exec -it dnd-game-mongodb mongosh \
  --username admin --password password \
  --authenticationDatabase admin

# Verify environment variables
docker-compose config | grep -A 10 mongodb

# Check MongoDB data volume
docker volume ls | grep mongodb
```

#### **AI Service Not Responding**

**Symptoms:**
- AI responses timeout
- "AI service unavailable" errors
- No response from story generation

**Quick Fix:**
```bash
# Check backend service health
docker-compose ps backend

# Restart backend service
docker-compose restart backend

# Verify API key configuration
grep GEMINI_API_KEY .env
```

**Detailed Troubleshooting:**
```bash
# Check backend logs
docker-compose logs backend | grep -i gemini

# Test API connectivity
curl -H "Authorization: Bearer your_token" \
  http://localhost:5001/api/ai/models

# Check rate limiting
docker-compose logs backend | grep -i rate

# Verify internet connection
curl -I https://generativelanguage.googleapis.com
```

## 🔧 Common Issues

### Frontend Problems

#### **Frontend Not Loading**

**Symptoms:**
- Browser shows "This site can't be reached"
- Port 3000 not accessible
- Frontend container not running

**Solutions:**
```bash
# Check frontend container status
docker-compose ps frontend

# Check frontend logs
docker-compose logs frontend

# Verify port binding
docker port dnd-game-frontend

# Check if port 3000 is available
lsof -i :3000
```

**Port Conflict Resolution:**
```bash
# Kill process using port 3000
sudo lsof -ti:3000 | xargs kill -9

# Or change frontend port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

#### **CORS Errors**

**Symptoms:**
- Browser console shows CORS errors
- API requests fail with "Access-Control-Allow-Origin" errors
- Frontend can't communicate with backend

**Solutions:**
```bash
# Check CORS configuration in .env
grep CORS_ORIGIN .env

# Verify CORS includes all frontend ports
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Restart backend after CORS changes
docker-compose restart backend

# Check backend CORS logs
docker-compose logs backend | grep -i cors
```

**CORS Configuration:**
```env
# For development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# For production
CORS_ORIGIN=https://yourdomain.com

# Allow all origins (not recommended for production)
CORS_ORIGIN=*
```

#### **Frontend Build Errors**

**Symptoms:**
- `npm run build` fails
- TypeScript compilation errors
- Missing dependencies

**Solutions:**
```bash
# Clean and reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npx tsc --noEmit

# Fix linting issues
npm run lint:fix

# Clear Next.js cache
rm -rf .next
npm run build
```

### Backend Problems

#### **Backend Service Won't Start**

**Symptoms:**
- Backend container exits immediately
- "Cannot find module" errors
- Port 5001 not accessible

**Solutions:**
```bash
# Check backend logs
docker-compose logs backend

# Verify backend build
docker-compose build backend

# Check for missing dependencies
docker exec -it dnd-game-backend npm list

# Verify TypeScript compilation
docker exec -it dnd-game-backend npm run build
```

#### **API Endpoints Not Responding**

**Symptoms:**
- 404 errors on API calls
- Routes not found
- Health check fails

**Solutions:**
```bash
# Test health endpoint
curl http://localhost:5001/health

# Check backend service status
docker-compose ps backend

# Verify route registration
docker-compose logs backend | grep -i "route\|endpoint"

# Check for middleware errors
docker-compose logs backend | grep -i "middleware\|error"
```

#### **Authentication Issues**

**Symptoms:**
- Login fails
- JWT token errors
- "Unauthorized" responses

**Solutions:**
```bash
# Check JWT configuration
grep JWT_SECRET .env

# Verify session configuration
grep SESSION_SECRET .env

# Check authentication logs
docker-compose logs backend | grep -i "auth\|jwt\|session"

# Test authentication endpoint
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Database Problems

#### **MongoDB Connection Issues**

**Symptoms:**
- "Failed to connect to MongoDB" errors
- Database queries timeout
- Authentication failures

**Solutions:**
```bash
# Check MongoDB container health
docker-compose ps mongodb

# Verify connection string
grep MONGODB_URI .env

# Test MongoDB connectivity
docker exec -it dnd-game-mongodb mongosh \
  --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB service
docker-compose restart mongodb
```

**Connection String Format:**
```env
# Correct format for Docker Compose
MONGODB_URI=mongodb://admin:password@mongodb:27017/ai-dnd-game?authSource=admin

# For local development
MONGODB_URI=mongodb://admin:password@localhost:27017/ai-dnd-game?authSource=admin
```

#### **Redis Connection Issues**

**Symptoms:**
- Cache not working
- "Redis connection failed" errors
- Performance degradation

**Solutions:**
```bash
# Check Redis container health
docker-compose ps redis

# Test Redis connectivity
docker exec -it dnd-game-redis redis-cli ping

# Check Redis logs
docker-compose logs redis

# Verify Redis configuration
grep REDIS .env
```

### AI Service Problems

#### **Gemini API Key Issues**

**Symptoms:**
- "Invalid API key" errors
- AI responses fail
- Rate limiting errors

**Solutions:**
```bash
# Verify API key in .env
grep GEMINI_API_KEY .env

# Check API key format
# Should be a long string starting with "AI"

# Test API key validity
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://generativelanguage.googleapis.com/v1beta/models"

# Check API usage limits
# Visit Google AI Studio dashboard
```

**API Key Setup:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy to `.env` file
4. Restart services: `docker-compose restart`

#### **AI Response Quality Issues**

**Symptoms:**
- Poor quality AI responses
- Inappropriate content
- Responses don't match requests

**Solutions:**
```bash
# Check AI model selection
docker-compose logs backend | grep -i "model\|ai"

# Verify model configuration
grep GEMINI .env

# Check response quality settings
grep QUALITY .env

# Monitor AI performance
curl -H "Authorization: Bearer your_token" \
  http://localhost:5001/api/ai/performance
```

**Quality Configuration:**
```env
# Adjust quality thresholds
FLASH_LITE_QUALITY_THRESHOLD=0.7
FLASH_QUALITY_THRESHOLD=0.8
PRO_FALLBACK_ENABLED=true

# Enable model selection
MODEL_SELECTION_ENABLED=true
```

## 🚀 Performance Issues

### Slow Response Times

**Symptoms:**
- AI responses take >10 seconds
- Frontend feels sluggish
- Database queries are slow

**Diagnosis:**
```bash
# Check system resources
docker stats

# Monitor response times
docker-compose logs backend | grep -i "response\|time"

# Check database performance
docker exec -it dnd-game-mongodb mongosh \
  --eval "db.currentOp()"

# Monitor Redis performance
docker exec -it dnd-game-redis redis-cli info memory
```

**Solutions:**
```bash
# Optimize AI model selection
# Use Flash Lite for simple tasks
# Use Pro only for complex tasks

# Enable response caching
# Check Redis configuration

# Optimize database queries
# Add database indexes

# Scale services if needed
docker-compose up -d --scale backend=2
```

### Memory Issues

**Symptoms:**
- Containers crash with "out of memory"
- Slow performance
- High resource usage

**Solutions:**
```bash
# Check memory usage
docker stats --no-stream

# Limit container memory
# Add to docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G

# Optimize Node.js memory
# Add to backend Dockerfile:
ENV NODE_OPTIONS="--max-old-space-size=512"

# Restart with memory limits
docker-compose down
docker-compose up -d
```

### High CPU Usage

**Symptoms:**
- System becomes unresponsive
- High CPU usage in Docker
- Slow AI responses

**Diagnosis:**
```bash
# Check CPU usage
docker stats --no-stream

# Monitor process usage
top -p $(docker inspect --format='{{.State.Pid}}' dnd-game-backend)

# Check for infinite loops
docker-compose logs backend | grep -i "loop\|recursion"
```

**Solutions:**
```bash
# Optimize AI calls
# Reduce context length
# Use appropriate models

# Add rate limiting
# Check rate limit configuration

# Optimize database queries
# Add query timeouts

# Restart services
docker-compose restart
```

## 🔒 Security Issues

### Authentication Failures

**Symptoms:**
- Users can't log in
- JWT token errors
- Session timeouts

**Solutions:**
```bash
# Check JWT configuration
grep JWT .env

# Verify session settings
grep SESSION .env

# Check authentication logs
docker-compose logs backend | grep -i "auth\|login"

# Test authentication flow
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Security Configuration:**
```env
# Use strong secrets
JWT_SECRET=your_very_long_random_secret_here
SESSION_SECRET=another_very_long_random_secret_here

# Set appropriate timeouts
SESSION_MAX_AGE=86400000  # 24 hours

# Enable rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

### CORS Security Issues

**Symptoms:**
- CORS errors in browser
- API requests blocked
- Security warnings

**Solutions:**
```bash
# Restrict CORS origins
CORS_ORIGIN=https://yourdomain.com

# Don't use wildcard in production
# CORS_ORIGIN=*  # NOT RECOMMENDED

# Verify CORS configuration
docker-compose logs backend | grep -i cors

# Test CORS headers
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:5001/api/campaigns
```

## 🧪 Testing and Debugging

### Run Test Suite

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:backend
npm run test:frontend

# Run tests with coverage
cd backend && npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug

# Restart services
docker-compose restart

# Check debug logs
docker-compose logs -f backend | grep -i "debug"

# Enable Node.js debugging
# Add to backend service in docker-compose.yml:
environment:
  NODE_OPTIONS: "--inspect=0.0.0.0:9229"
```

### Health Checks

```bash
# Check all service health
docker-compose ps

# Test health endpoints
curl http://localhost:5001/health
curl http://localhost:3000/health

# Check individual service health
docker exec dnd-game-backend wget --no-verbose --tries=1 --spider http://localhost:5001/health
docker exec dnd-game-frontend wget --no-verbose --tries=1 --spider http://localhost:3000
```

## 📋 Common Error Messages

### Docker Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `port already in use` | Port conflict | Kill process or change port |
| `permission denied` | Docker permissions | Add user to docker group |
| `no space left on device` | Disk full | Clean up Docker system |
| `connection refused` | Service not running | Check container status |

### Backend Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `MongoDB connection failed` | Database down | Restart MongoDB container |
| `JWT malformed` | Invalid token | Check JWT configuration |
| `Rate limit exceeded` | Too many requests | Wait or increase limits |
| `Validation failed` | Invalid input | Check request data |

### Frontend Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Module not found` | Missing dependency | Reinstall node_modules |
| `Build failed` | Compilation error | Check TypeScript errors |
| `CORS error` | Origin not allowed | Update CORS configuration |
| `API timeout` | Backend slow | Check backend health |

## 🆘 Getting Help

### Self-Help Resources

1. **Check the logs**: `docker-compose logs -f [service-name]`
2. **Review this guide** for common solutions
3. **Search GitHub issues** for similar problems
4. **Check the documentation**: [docs/](docs/)

### When to Seek Help

- **Critical errors** that prevent application startup
- **Security issues** or data loss
- **Performance problems** that persist after optimization
- **Bugs** that aren't covered in this guide

### Providing Information

When seeking help, include:

1. **Error messages** and stack traces
2. **Environment details** (OS, Docker version, Node version)
3. **Steps to reproduce** the issue
4. **Logs** from relevant services
5. **Configuration files** (with sensitive data removed)

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this guide and other docs
- **Community**: Join Discord for help and discussion
- **Email Support**: For critical issues (if available)

---

**For additional help, see the [Installation Guide](INSTALLATION.md) or [User Guide](USER_GUIDE.md).**

**Remember: Most issues can be resolved by checking the logs and restarting services!** 🔧
