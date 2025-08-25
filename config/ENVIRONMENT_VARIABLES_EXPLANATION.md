# Environment Variables Explanation

## Overview

This document explains how environment variables are used in different contexts and why we need different values for different deployment scenarios.

## Key Environment Variables

### 1. `NEXT_PUBLIC_API_URL`
- **Purpose**: Used by client-side JavaScript code (browser)
- **Usage**: Direct API calls from the browser to the backend
- **Examples**: 
  - Campaign detail component making direct fetch calls
  - Any component that needs to call the backend directly

### 2. `BACKEND_URL`
- **Purpose**: Used by server-side Next.js API routes
- **Usage**: Next.js API routes forwarding requests to the backend
- **Examples**:
  - `/api/campaigns` route forwarding to backend
  - `/api/characters` route forwarding to backend
  - Any server-side API route

## Deployment Scenarios

### Local Development (No Docker)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
BACKEND_URL=http://localhost:5001
```

**Why both are localhost?**
- Browser runs on localhost, so client-side calls need localhost
- Next.js runs on localhost, so server-side calls can use localhost

### Docker Development
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
BACKEND_URL=http://backend:5001
```

**Why different values?**
- **Browser**: Still runs on localhost, so client-side calls need localhost
- **Next.js Container**: Runs inside Docker, so server-side calls use Docker service name `backend:5001`

### Railway Production
```bash
NEXT_PUBLIC_API_URL=https://backend-production-d223.up.railway.app
BACKEND_URL=https://backend-production-d223.up.railway.app
```

**Why both are the same?**
- **Browser**: Makes calls to the Railway domain
- **Next.js**: Also makes calls to the Railway domain (not Docker service names)

## How It Works

### Client-Side API Calls
```typescript
// In campaign-detail.tsx
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaign-settings/${campaign.id}/settings`);
```

### Server-Side API Routes
```typescript
// In /api/campaigns/route.ts
const backendUrl = process.env.BACKEND_URL;
const response = await fetch(`${backendUrl}/api/campaigns`);
```

## Docker Compose Configuration

The docker-compose.yml now properly uses environment variables:

```yaml
frontend:
  build:
    args:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      BACKEND_URL: ${BACKEND_URL}
  environment:
    NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    BACKEND_URL: ${BACKEND_URL}
```

## Migration Benefits

1. **No Hardcoded URLs**: All URLs come from environment variables
2. **Docker Compatible**: Proper service-to-service communication
3. **Railway Ready**: Easy to deploy with different values
4. **Flexible**: Can easily switch between different environments

## Troubleshooting

### Common Issues

1. **"Connection refused" errors**: Check if BACKEND_URL is set correctly for your environment
2. **CORS errors**: Ensure NEXT_PUBLIC_API_URL matches your backend's CORS configuration
3. **API route failures**: Verify BACKEND_URL is accessible from the Next.js container

### Testing

- **Local**: Use localhost URLs
- **Docker**: Use localhost for client, backend:5001 for server
- **Railway**: Use actual service URLs for both

## Current Railway Deployment

The application is currently deployed on Railway with the following configuration:

### Service URLs
- **Backend**: https://backend-production-d223.up.railway.app
- **Frontend**: https://frontend-production-9115.up.railway.app
- **MongoDB**: mongodb.railway.internal:27017
- **Redis**: redis.railway.internal:6379

### Environment Variables Set
- ✅ `NEXT_PUBLIC_API_URL`: https://backend-production-d223.up.railway.app
- ✅ `BACKEND_URL`: https://backend-production-d223.up.railway.app
- ✅ `CORS_ORIGIN`: https://frontend-production-9115.up.railway.app
- ✅ All other required variables configured

## Summary

The key insight is that we need **two different backend URLs** because:
- **Client-side code** runs in the browser and needs to reach the backend from the user's perspective
- **Server-side code** runs in containers and needs to reach the backend from the container's perspective

This setup ensures compatibility across all deployment scenarios while maintaining clean, environment-driven configuration.
