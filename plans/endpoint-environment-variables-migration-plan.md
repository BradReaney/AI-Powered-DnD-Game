# Endpoint Environment Variables Migration Plan

## Overview
This plan addresses the issue where hardcoded localhost URLs prevent the application from working properly in Railway's containerized environment. The goal is to replace all hardcoded URLs with environment variables that can be configured for both local development and production deployment.

## Current Issues Identified

### Frontend Issues
1. **Hardcoded localhost URLs in components**: `campaign-detail.tsx` has direct calls to `http://localhost:5001`
2. **Inconsistent API usage**: Some components use the API service, others make direct fetch calls
3. **Mixed environment variable usage**: Some parts use `NEXT_PUBLIC_API_URL`, others use `BACKEND_URL`

### Backend Issues
1. **Hardcoded localhost in config defaults**: MongoDB and Redis connection strings default to localhost
2. **Development-specific logging**: Health check URLs logged with localhost

### Docker Compose Issues
1. **Frontend build args**: Hardcoded `http://localhost:5001` in Docker build
2. **Environment variable conflicts**: Frontend has both `NEXT_PUBLIC_API_URL` and `BACKEND_URL`

## Migration Strategy

### Phase 1: Environment Variable Standardization

#### 1.1 Frontend Environment Variables
- **`NEXT_PUBLIC_API_URL`**: For client-side API calls (must be accessible from browser)
- **`BACKEND_URL`**: For server-side API routes (uses Docker service names)
- **`NEXT_PUBLIC_APP_NAME`**: Application name for display

#### 1.2 Backend Environment Variables
- **`MONGODB_URI`**: MongoDB connection string
- **`REDIS_HOST`**: Redis host address
- **`CORS_ORIGIN`**: Allowed CORS origins
- **`FRONTEND_URL`**: Frontend URL for CORS and redirects

### Phase 2: Frontend Component Updates

#### 2.1 Campaign Detail Component
- Replace hardcoded `http://localhost:5001` with environment variable
- Use consistent API service pattern
- Add error handling for missing environment variables

#### 2.2 API Service Layer
- Standardize all API calls through the service layer
- Remove direct fetch calls from components
- Add environment variable validation

#### 2.3 Next.js API Routes
- Ensure all routes use `BACKEND_URL` environment variable
- Add fallback handling for missing environment variables
- Standardize error handling

### Phase 3: Backend Configuration Updates

#### 3.1 Configuration Files
- Update default values to use environment variables
- Remove hardcoded localhost references
- Add validation for required environment variables

#### 3.2 Service Layer
- Update Redis connection to use environment variables
- Ensure MongoDB connection uses environment variables
- Update logging to use environment variables

### Phase 4: Docker and Railway Configuration

#### 4.1 Docker Compose
- Update frontend build args to use environment variables
- Ensure consistent environment variable naming
- Add validation for required variables

#### 4.2 Railway Deployment
- Set environment variables in Railway dashboard
- Ensure proper service-to-service communication
- Test all endpoints in production environment

### Phase 5: Environment File Updates ✅ COMPLETED

#### 5.1 Update `config/env.example` ✅
- ✅ Remove all localhost default values
- ✅ Add new required environment variables
- ✅ Include clear descriptions and examples
- ✅ Add Railway-specific configuration examples

#### 5.2 Create Railway Environment Template ✅
- ✅ Create a separate template for Railway deployment
- ✅ Include all production-ready values
- ✅ Document Railway-specific considerations

## Implementation Details

### Frontend Changes Required

#### 1. Update `frontend/lib/api.ts`
```typescript
// Current
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Updated
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}
```

#### 2. Update `frontend/components/campaign-detail.tsx`
```typescript
// Current
const response = await fetch(`http://localhost:5001/api/campaign-settings/${campaign.id}/settings`);

// Updated
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaign-settings/${campaign.id}/settings`);
```

#### 3. Update `frontend/app/api/*/route.ts` files
```typescript
// Current
const backendUrl = process.env.BACKEND_URL || "http://backend:5001";

// Updated
const backendUrl = process.env.BACKEND_URL;
if (!backendUrl) {
  throw new Error('BACKEND_URL environment variable is required');
}
```

### Backend Changes Required

#### 1. Update `backend/src/config.ts`
```typescript
// Current
mongodb: {
  uri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/ai-dnd-game',
  uriProd: process.env['MONGODB_URI_PROD'] || 'mongodb://localhost:27017/ai-dnd-game-prod',
},

// Updated
mongodb: {
  uri: process.env['MONGODB_URI'],
  uriProd: process.env['MONGODB_URI_PROD'],
},
```

#### 2. Update `backend/src/services/CacheService.ts`
```typescript
// Current
host: process.env.REDIS_HOST || 'localhost',

// Updated
host: process.env.REDIS_HOST,
```

### Docker Compose Changes Required

#### 1. Update `docker-compose.yml`
```yaml
# Frontend build args
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      BACKEND_URL: ${BACKEND_URL}
```

#### 2. Environment variable validation
```yaml
# Add required environment variables
environment:
  NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
  BACKEND_URL: ${BACKEND_URL}
  # ... other variables
```

## Environment Variable Configuration

### Local Development (.env)
```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5001
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_APP_NAME=AI-Powered D&D Game

# Backend
MONGODB_URI=mongodb://localhost:27017/ai-dnd-game
REDIS_HOST=localhost
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Railway Production
```bash
# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
BACKEND_URL=https://your-backend-service.railway.app
NEXT_PUBLIC_APP_NAME=AI-Powered D&D Game

# Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-dnd-game
REDIS_HOST=your-redis-service.railway.app
CORS_ORIGIN=https://your-frontend-service.railway.app
FRONTEND_URL=https://your-frontend-service.railway.app
```

## Testing Strategy

### 1. Local Development Testing
- Verify all endpoints work with localhost URLs
- Test environment variable fallbacks
- Ensure Docker Compose works correctly

### 2. Railway Deployment Testing
- Deploy with environment variables set
- Test all API endpoints
- Verify service-to-service communication
- Test CORS and authentication

### 3. Regression Testing
- Verify all existing functionality works
- Test error handling for missing environment variables
- Ensure proper fallback behavior

## Rollback Plan

### 1. Immediate Rollback
- Revert to previous commit if critical issues arise
- Keep backup of working configuration

### 2. Gradual Rollback
- Deploy with old configuration if needed
- Maintain backward compatibility during transition

## Success Criteria

1. **No hardcoded localhost URLs** in the codebase
2. **All endpoints use environment variables** consistently
3. **Application works in both local and Railway environments**
4. **Environment variable validation** prevents deployment issues
5. **Consistent error handling** for missing environment variables
6. **All tests pass** in both environments

## Timeline

- **Phase 1**: Environment variable standardization (1-2 days)
- **Phase 2**: Frontend component updates (2-3 days)
- **Phase 3**: Backend configuration updates (1-2 days)
- **Phase 4**: Docker and Railway configuration (1-2 days)
- **Phase 5**: Environment file updates (1 day)
- **Testing and validation**: (2-3 days)

**Total estimated time**: 8-13 days

## Risk Assessment

### High Risk
- **Breaking changes**: Environment variable changes could break existing functionality
- **Deployment issues**: Railway deployment might fail if variables are missing

### Medium Risk
- **Testing complexity**: Need to test in multiple environments
- **Configuration management**: Multiple environment files to maintain

### Low Risk
- **Code quality**: Changes improve maintainability
- **Future deployments**: Easier to deploy to new environments

## Next Steps

1. **Review and approve** this migration plan
2. **Update environment variable templates** for both local and Railway
3. **Update `config/env.example`** with new required variables and remove localhost defaults
4. **Begin Phase 1** implementation
5. **Set up testing environment** for Railway deployment
6. **Execute migration** following the phased approach
7. **Validate deployment** in Railway environment
8. **Update documentation** with new environment variable requirements
