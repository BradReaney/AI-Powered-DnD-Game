# 🔧 AI-Powered D&D Game - Troubleshooting Guide

## **📋 Table of Contents**

1. [Quick Diagnosis](#quick-diagnosis)
2. [Common Issues](#common-issues)
3. [Backend Problems](#backend-problems)
4. [Frontend Problems](#frontend-problems)
5. [Database Issues](#database-issues)
6. [AI Integration Issues](#ai-integration-issues)
7. [Performance Problems](#performance-problems)
8. [Network Issues](#network-issues)
9. [Getting Help](#getting-help)

## **🔍 Quick Diagnosis**

### **Symptom Checklist**
- [ ] **Application won't start**
- [ ] **Database connection failed**
- [ ] **AI not responding**
- [ ] **Frontend not loading**
- [ ] **Tests failing**
- [ ] **Performance issues**
- [ ] **Network errors**

### **Quick Health Check**
```bash
# Check if services are running
ps aux | grep node
ps aux | grep mongod

# Check network ports
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :27017 # MongoDB

# Check logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

## **🚨 Common Issues**

### **1. "Module not found" Errors**

#### **Symptoms**
```
Error: Cannot find module 'express'
Error: Cannot find module '../models/Character'
```

#### **Causes**
- Dependencies not installed
- Incorrect import paths
- TypeScript compilation issues

#### **Solutions**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check import paths
# Ensure paths match actual file structure

# Rebuild TypeScript
npm run build
```

### **2. "Port already in use" Errors**

#### **Symptoms**
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### **Solutions**
```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### **3. "MongoDB connection failed"**

#### **Symptoms**
```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

#### **Solutions**
```bash
# Start MongoDB service
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod

# Check MongoDB status
mongosh --eval "db.serverStatus()"
```

## **🔧 Backend Problems**

### **Server Won't Start**

#### **Check Environment Variables**
```bash
# Verify .env file exists
ls -la .env

# Check required variables
cat .env | grep -E "(PORT|MONGODB_URI|GEMINI_API_KEY)"
```

#### **Check Dependencies**
```bash
# Verify package.json
cat package.json

# Check installed modules
npm list --depth=0

# Reinstall if needed
npm install
```

#### **Check TypeScript Compilation**
```bash
# Compile TypeScript
npm run build

# Check for compilation errors
npx tsc --noEmit
```

### **API Endpoints Not Working**

#### **Check Route Registration**
```bash
# Look for route registration in app.ts
grep -r "app.use" src/

# Check if routes are properly imported
grep -r "import.*routes" src/
```

#### **Check Middleware Order**
```bash
# Ensure CORS is before routes
# Ensure body parser is before routes
# Ensure authentication is in correct order
```

#### **Test Individual Endpoints**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test with verbose output
curl -v http://localhost:3000/api/campaigns
```

### **Authentication Issues**

#### **JWT Token Problems**
```bash
# Check JWT secret in .env
echo $JWT_SECRET

# Verify token format
# Should be: header.payload.signature

# Check token expiration
# Decode token at jwt.io
```

#### **Session Issues**
```bash
# Check session configuration
# Verify SESSION_SECRET is set
# Check session store configuration
```

### **Logging Issues**

#### **No Logs Generated**
```bash
# Check log directory exists
ls -la logs/

# Check log level in .env
echo $LOG_LEVEL

# Verify logger configuration
grep -r "LoggerService" src/
```

#### **Log File Permissions**
```bash
# Fix log directory permissions
sudo chown -R $USER:$USER logs/
chmod 755 logs/
```

## **🎨 Frontend Problems**

### **Page Won't Load**

#### **Check Browser Console**
```bash
# Open Developer Tools (F12)
# Check Console tab for errors
# Check Network tab for failed requests
```

#### **Check Build Process**
```bash
# Rebuild frontend
cd frontend
npm run build

# Check for build errors
# Verify dist/ directory created
```

#### **Check Environment Variables**
```bash
# Verify .env file
cat .env

# Check VITE_API_BASE_URL
echo $VITE_API_BASE_URL
```

### **Component Not Rendering**

#### **Check React DevTools**
```bash
# Install React DevTools browser extension
# Check component tree
# Verify props and state
```

#### **Check Component Imports**
```bash
# Verify import statements
# Check file paths
# Ensure components are exported
```

### **State Management Issues**

#### **Check Context Providers**
```bash
# Verify context is wrapped around app
# Check context values
# Ensure context is not undefined
```

#### **Check Local State**
```bash
# Use React DevTools
# Check component state
# Verify state updates
```

### **Styling Issues**

#### **CSS Not Loading**
```bash
# Check CSS imports
# Verify CSS file paths
# Check for CSS compilation errors
```

#### **Responsive Design Issues**
```bash
# Test on different screen sizes
# Check CSS media queries
# Verify viewport meta tag
```

## **🗄️ Database Issues**

### **Connection Problems**

#### **MongoDB Service Status**
```bash
# Check service status
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

#### **Connection String Issues**
```bash
# Verify connection string format
# Local: mongodb://localhost:27017/ai-dnd-game
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/db

# Check for special characters in password
# URL encode special characters
```

#### **Network Issues**
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/ai-dnd-game"

# Check firewall settings
# Verify MongoDB port is open
```

### **Data Issues**

#### **Collections Not Found**
```bash
# List all collections
mongosh --eval "use ai-dnd-game; show collections"

# Check if database exists
mongosh --eval "show dbs"
```

#### **Document Not Found**
```bash
# Check document ID format
# Verify ObjectId conversion
# Check query filters
```

#### **Data Corruption**
```bash
# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Run database repair
mongosh --eval "use ai-dnd-game; db.repairDatabase()"
```

### **Performance Issues**

#### **Slow Queries**
```bash
# Check query performance
# Use MongoDB explain()
db.collection.find().explain("executionStats")

# Check indexes
db.collection.getIndexes()
```

#### **Memory Issues**
```bash
# Check MongoDB memory usage
mongosh --eval "db.serverStatus().mem"

# Monitor system memory
free -h
top
```

## **🤖 AI Integration Issues**

### **API Key Problems**

#### **Invalid API Key**
```bash
# Verify API key format
# Check for extra spaces or characters
# Ensure key is active in Google AI Studio
```

#### **API Key Permissions**
```bash
# Check API key restrictions
# Verify IP address allowlist
# Check usage quotas
```

#### **API Key Security**
```bash
# Never log API keys
# Use environment variables
# Check for key exposure in logs
```

### **API Response Issues**

#### **Rate Limiting**
```bash
# Check API quotas
# Implement request throttling
# Add retry logic with exponential backoff
```

#### **Timeout Issues**
```bash
# Increase timeout values
# Implement request cancellation
# Add loading states
```

#### **Response Format Issues**
```bash
# Verify response structure
# Check for API changes
# Implement response validation
```

### **Model Selection Issues**

#### **Wrong Model Selected**
```bash
# Check model selection logic
# Verify task type classification
# Test with different task types
```

#### **Model Performance Issues**
```bash
# Monitor response times
# Check model availability
# Implement fallback models
```

## **⚡ Performance Problems**

### **Slow Response Times**

#### **Backend Performance**
```bash
# Check server resources
top
htop
iostat

# Monitor API response times
# Add performance logging
# Check database query performance
```

#### **Frontend Performance**
```bash
# Check bundle size
npm run build -- --analyze

# Monitor component render times
# Check for unnecessary re-renders
# Implement code splitting
```

### **Memory Leaks**

#### **Backend Memory Issues**
```bash
# Monitor memory usage
# Check for memory leaks in services
# Implement proper cleanup
```

#### **Frontend Memory Issues**
```bash
# Check for event listener leaks
# Verify component cleanup
# Monitor memory usage in DevTools
```

### **Database Performance**

#### **Slow Queries**
```bash
# Analyze query performance
# Add database indexes
# Optimize query patterns
```

#### **Connection Pool Issues**
```bash
# Check connection pool size
# Monitor connection usage
# Implement connection pooling
```

## **🌐 Network Issues**

### **CORS Errors**

#### **Cross-Origin Issues**
```bash
# Check CORS configuration
# Verify allowed origins
# Test with different domains
```

#### **CORS Configuration**
```bash
# Backend CORS setup
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### **Proxy Issues**

#### **Development Proxy**
```bash
# Check Vite proxy configuration
# Verify proxy rules
# Test proxy endpoints
```

#### **Production Proxy**
```bash
# Check Nginx configuration
# Verify proxy_pass settings
# Check SSL configuration
```

### **WebSocket Issues**

#### **Connection Problems**
```bash
# Check WebSocket server
# Verify client connection
# Monitor connection events
```

#### **Message Delivery Issues**
```bash
# Check message format
# Verify event handlers
# Monitor WebSocket traffic
```

## **🆘 Getting Help**

### **Before Asking for Help**

#### **Gather Information**
```bash
# System information
uname -a
node --version
npm --version
mongod --version

# Application logs
tail -n 100 backend/logs/error.log
tail -n 100 backend/logs/combined.log

# Environment variables (remove sensitive data)
cat .env | grep -v -E "(API_KEY|SECRET|PASSWORD)"

# Error messages (exact text)
# Steps to reproduce
# Expected vs actual behavior
```

#### **Check Existing Issues**
```bash
# Search GitHub issues
# Check closed issues
# Look for similar problems
```

### **Creating a Good Issue Report**

#### **Issue Template**
```markdown
## Bug Description
Brief description of the problem

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Node.js: [e.g., 18.0.0]
- MongoDB: [e.g., 6.0]
- Application Version: [e.g., 1.0.0]

## Error Messages
```
Exact error message here
```

## Logs
```
Relevant log entries
```

## Additional Context
Any other information that might be helpful
```

### **Support Channels**

#### **GitHub Issues**
- **Bug Reports**: Create detailed issue reports
- **Feature Requests**: Suggest new functionality
- **Documentation**: Report documentation issues

#### **Community Support**
- **Discord Server**: Real-time help and discussion
- **GitHub Discussions**: Q&A and general discussion
- **Stack Overflow**: Tag with project-specific tags

#### **Direct Support**
- **Email**: For security issues or private matters
- **Contributor Contact**: Reach out to active contributors

### **Escalation Process**

#### **When to Escalate**
- **Security Issues**: Immediate escalation
- **Data Loss**: High priority escalation
- **Production Outages**: Emergency escalation
- **Feature Blockers**: Normal escalation

#### **Escalation Steps**
1. **Document the issue** thoroughly
2. **Contact maintainers** directly
3. **Provide all relevant information**
4. **Follow up** on resolution

## **🔧 Maintenance and Prevention**

### **Regular Maintenance**

#### **Daily Tasks**
```bash
# Check application status
# Monitor error logs
# Verify service health
```

#### **Weekly Tasks**
```bash
# Review error patterns
# Check performance metrics
# Update dependencies
```

#### **Monthly Tasks**
```bash
# Security updates
# Performance optimization
# Database maintenance
```

### **Prevention Strategies**

#### **Monitoring**
```bash
# Set up health checks
# Monitor error rates
# Track performance metrics
```

#### **Testing**
```bash
# Run tests regularly
# Test critical paths
# Verify integrations
```

#### **Backup**
```bash
# Regular database backups
# Configuration backups
# Code repository backups
```

---

**Last Updated**: December 2024  
**Version**: 1.0.0

For additional help, see the [Installation Guide](INSTALLATION.md) or [User Guide](USER_GUIDE.md).
