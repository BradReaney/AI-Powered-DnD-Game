# 🚀 Deployment-Triggered Redis Cache Clearing

## Overview

This document describes the implementation of automatic Redis cache clearing during Railway deployments for the AI-Powered D&D Game. This feature ensures that stale cache data is automatically cleared when new deployments are rolled out, maintaining data consistency and performance.

## ✨ Features

### 🔄 Automatic Cache Clearing
- **Deployment-Triggered**: Cache is cleared automatically on every Railway deployment
- **Startup-Triggered**: Cache can be cleared on application startup
- **Smart Pattern Matching**: Uses glob patterns to selectively clear specific cache keys
- **Preservation Logic**: Protects system templates and mechanics from being cleared

### 🎯 Configurable Patterns
- **Clear Patterns**: Define which cache keys to clear (e.g., `user-sessions:*,game-state:*`)
- **Preserve Patterns**: Define which cache keys to keep (e.g., `mechanics:*,templates:*`)
- **Environment-Driven**: All behavior controlled via environment variables

### 📊 Monitoring & Control
- **API Endpoints**: Manual trigger endpoints for testing and control
- **Comprehensive Logging**: Detailed logging of all cache clearing operations
- **Configuration Visibility**: API responses include current configuration

## 🏗️ Architecture

### Implementation Components

1. **Environment Variables**: Control cache clearing behavior
2. **CacheService Methods**: New methods for deployment and startup clearing
3. **Application Startup**: Integration with app initialization
4. **API Endpoints**: Manual control and monitoring endpoints
5. **Configuration**: Centralized configuration management

### Data Flow

```
Railway Deployment → App Startup → Check Environment Variables → Clear Cache → Warm Cache → Ready
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLEAR_CACHE_ON_DEPLOY` | `false` | Enable cache clearing on deployment |
| `CACHE_CLEAR_ON_STARTUP` | `false` | Enable cache clearing on startup |
| `CACHE_CLEAR_PATTERNS` | `user-sessions:*,game-state:*,ai:response:*` | Patterns to clear |
| `CACHE_PRESERVE_PATTERNS` | `mechanics:*,templates:*,system:*` | Patterns to preserve |

### Railway Production Configuration

```bash
# Enable for production deployments
CLEAR_CACHE_ON_DEPLOY=true
CACHE_CLEAR_ON_STARTUP=true

# Clear game data cache
CACHE_CLEAR_PATTERNS=user-sessions:*,game-state:*,ai:response:*,campaign:*,character:*,session:*,quest:*,location:*

# Preserve system data
CACHE_PRESERVE_PATTERNS=mechanics:*,templates:*,system:*
```

### Local Development Configuration

```bash
# Disable for development
CLEAR_CACHE_ON_DEPLOY=false
CACHE_CLEAR_ON_STARTUP=false

# Minimal clear patterns for testing
CACHE_CLEAR_PATTERNS=user-sessions:*,game-state:*
CACHE_PRESERVE_PATTERNS=mechanics:*,templates:*
```

## 🚀 Quick Setup

### 1. Automated Setup (Recommended)

```bash
# Run the setup script
./scripts/setup-railway-cache-clearing.sh
```

The script will:
- Check Railway CLI installation
- Set all required environment variables
- Provide configuration summary
- Give testing instructions

### 2. Manual Setup

```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Set environment variables
railway variables set CLEAR_CACHE_ON_DEPLOY=true
railway variables set CACHE_CLEAR_ON_STARTUP=true
railway variables set CACHE_CLEAR_PATTERNS="user-sessions:*,game-state:*,ai:response:*,campaign:*,character:*,session:*,quest:*,location:*"
railway variables set CACHE_PRESERVE_PATTERNS="mechanics:*,templates:*,system:*"
```

## 📡 API Endpoints

### Cache Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cache/clear-deploy` | POST | Trigger deployment cache clearing |
| `/api/cache/clear-startup` | POST | Trigger startup cache clearing |
| `/api/cache/stats` | GET | Get cache statistics |
| `/api/cache/warm` | POST | Warm up cache |
| `/api/cache/clear` | POST | Clear all cache |

### Example Usage

```bash
# Trigger deployment cache clearing
curl -X POST https://your-app.railway.app/api/cache/clear-deploy

# Check cache statistics
curl https://your-app.railway.app/api/cache/stats

# Warm up cache
curl -X POST https://your-app.railway.app/api/cache/warm
```

## 🔍 Monitoring & Debugging

### Deployment Logs

Look for these log messages during deployment:

```
[INFO] Starting deployment-triggered cache clearing...
[INFO] Deployment cache clearing completed. Cleared X keys.
[INFO] Starting startup-triggered cache clearing...
[INFO] Startup cache clearing completed. Cleared X keys.
[INFO] Cache warming completed
```

### Health Checks

```bash
# Check Redis health
curl https://your-app.railway.app/health/redis

# Check cache performance
curl https://your-app.railway.app/api/cache/performance
```

### Common Issues

#### Cache Not Clearing
1. Check environment variables are set correctly
2. Verify `CLEAR_CACHE_ON_DEPLOY=true`
3. Check deployment logs for errors
4. Ensure Redis is accessible

#### Performance Issues
1. Monitor cache hit rates via `/api/cache/stats`
2. Check if cache warming is completing
3. Review cache patterns for over-aggressive clearing
4. Monitor Redis memory usage

## 🧪 Testing

### Local Testing

```bash
# Set environment variables locally
export CLEAR_CACHE_ON_DEPLOY=true
export CACHE_CLEAR_PATTERNS="test:*,demo:*"
export CACHE_PRESERVE_PATTERNS="system:*"

# Start the application
npm run dev:backend

# Check logs for cache clearing messages
```

### Railway Testing

1. **Deploy with cache clearing enabled**
2. **Monitor deployment logs** for cache clearing messages
3. **Test API endpoints** to verify functionality
4. **Check cache statistics** to confirm clearing occurred

### Test Scenarios

- **Fresh Deployment**: Cache should be cleared and warmed
- **Configuration Change**: Cache should be cleared on restart
- **Manual Trigger**: API endpoints should work correctly
- **Error Handling**: Graceful degradation if Redis unavailable

## 📊 Performance Impact

### Benefits

- **Data Consistency**: Ensures fresh data after deployments
- **Reduced Bugs**: Eliminates stale cache data issues
- **Predictable Behavior**: Consistent cache state across deployments
- **Automated Maintenance**: No manual cache clearing required

### Considerations

- **Deployment Time**: Slight increase due to cache clearing and warming
- **Memory Usage**: Temporary spike during cache warming
- **Database Load**: Initial requests may hit database until cache is populated

### Optimization Tips

- **Selective Clearing**: Only clear necessary cache patterns
- **Efficient Warming**: Warm most important data first
- **Monitor Performance**: Track cache hit rates and adjust patterns
- **Preserve Critical Data**: Keep frequently accessed system data

## 🔮 Future Enhancements

### Planned Features

- **Conditional Clearing**: Clear cache only when specific files change
- **Incremental Warming**: Smart cache warming based on usage patterns
- **Performance Metrics**: Detailed performance impact analysis
- **Rollback Support**: Cache restoration on failed deployments

### Advanced Patterns

- **Time-Based Clearing**: Clear cache based on deployment time
- **User Impact Analysis**: Clear cache during low-usage periods
- **A/B Testing**: Different cache strategies for different deployments

## 📚 Related Documentation

- [Redis Caching Guide](REDIS_CACHING.md) - Comprehensive Redis implementation details
- [Railway Deployment](RAILWAY_DEPLOYMENT.md) - Railway deployment configuration
- [Environment Variables](ENV_STRUCTURE.md) - Environment configuration guide
- [API Reference](API_REFERENCE.md) - Complete API documentation

## 🆘 Support

### Troubleshooting

1. **Check this guide** for common solutions
2. **Review deployment logs** for error messages
3. **Verify environment variables** are set correctly
4. **Test API endpoints** to isolate issues

### Getting Help

- **Documentation**: Review related guides
- **Logs**: Check application and Railway logs
- **Testing**: Use provided test endpoints
- **Configuration**: Verify environment variable setup

---

*Last updated: Deployment cache clearing implementation complete*
