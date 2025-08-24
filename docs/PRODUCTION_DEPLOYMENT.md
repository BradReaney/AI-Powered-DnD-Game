# 🚀 Production Deployment Guide

Complete guide to deploying the AI-Powered D&D Game in production environments.

## 🎯 Overview

This guide covers deploying the application to production with proper security, performance, and monitoring configurations. The application is designed to be containerized and can be deployed to various cloud platforms.

## 🏗️ Architecture

### Production Architecture

```
Internet → Load Balancer → Nginx Reverse Proxy → Frontend/Backend Containers
                                    ↓
                            MongoDB + Redis (Persistent)
```

### Service Components

- **Frontend**: Next.js application with optimized build
- **Backend**: Express.js API server with clustering
- **Database**: MongoDB with replication and backups
- **Cache**: Redis with persistence and clustering
- **Reverse Proxy**: Nginx with SSL termination
- **Load Balancer**: Cloud load balancer or HAProxy

## 🔒 Security Configuration

### Environment Variables

```env
# =============================================================================
# PRODUCTION ENVIRONMENT
# =============================================================================
NODE_ENV=production
PORT=5001

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
# Use strong, unique secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your_very_long_random_secret_here_minimum_64_characters
SESSION_SECRET=another_very_long_random_secret_here_minimum_64_characters

# Restrict CORS to your domain only
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Rate limiting (more restrictive in production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Session security
SESSION_MAX_AGE=86400000
SESSION_SECURE=true
SESSION_HTTPONLY=true

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# Use production MongoDB instance
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/ai-dnd-game?authSource=admin&replicaSet=rs0

# Use production Redis instance
REDIS_PASSWORD=your_strong_redis_password
REDIS_TLS=true

# =============================================================================
# AI CONFIGURATION
# =============================================================================
GEMINI_API_KEY=your_production_gemini_api_key
MODEL_SELECTION_ENABLED=true

# =============================================================================
# LOGGING AND MONITORING
# =============================================================================
LOG_LEVEL=warn
LOG_FILE=/var/log/dnd-game/app.log

# =============================================================================
# PERFORMANCE CONFIGURATION
# =============================================================================
MAX_CONTEXT_LENGTH=8000
CONTEXT_COMPRESSION_THRESHOLD=6000
```

### Security Headers

```typescript
// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

### SSL/TLS Configuration

```nginx
# Nginx SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

## 🐳 Docker Production Configuration

### Production Docker Compose

```yaml
version: '3.8'

services:
  # MongoDB (Production)
  mongodb:
    image: mongo:7.0
    container_name: dnd-game-mongodb-prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ai-dnd-game
    volumes:
      - mongodb_data:/data/db
      - ./config/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - dnd-game-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  # Backend API (Production)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: dnd-game-backend-prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5001
      MONGODB_URI: ${MONGODB_URI}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      LOG_LEVEL: ${LOG_LEVEL}
      LOG_FILE: ${LOG_FILE}
      RATE_LIMIT_WINDOW_MS: ${RATE_LIMIT_WINDOW_MS}
      RATE_LIMIT_MAX_REQUESTS: ${RATE_LIMIT_MAX_REQUESTS}
      SESSION_MAX_AGE: ${SESSION_MAX_AGE}
      MAX_CONTEXT_LENGTH: ${MAX_CONTEXT_LENGTH}
      CONTEXT_COMPRESSION_THRESHOLD: ${CONTEXT_COMPRESSION_THRESHOLD}
    ports:
      - "5001:5001"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - dnd-game-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
      replicas: 2

  # Frontend (Production)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        NEXT_PUBLIC_API_URL: https://yourdomain.com
    container_name: dnd-game-frontend-prod
    restart: unless-stopped
    environment:
      PORT: 3000
      NEXT_PUBLIC_API_URL: https://yourdomain.com
      BACKEND_URL: http://backend:5001
      NEXT_PUBLIC_APP_NAME: ${NEXT_PUBLIC_APP_NAME}
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - dnd-game-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'

  # Redis (Production)
  redis:
    image: redis:7.2-alpine
    container_name: dnd-game-redis-prod
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - dnd-game-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.1'

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: dnd-game-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - dnd-game-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/80"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  dnd-game-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Production Dockerfiles

#### Backend Production Dockerfile

```dockerfile
# Backend production Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build application
RUN npm run build

# Production runtime
FROM node:18-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create log directory
RUN mkdir -p /var/log/dnd-game && chown -R nodejs:nodejs /var/log/dnd-game

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
```

#### Frontend Production Dockerfile

```dockerfile
# Frontend production Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY components/ ./components/
COPY lib/ ./lib/
COPY app/ ./app/

# Build application
RUN npm run build

# Production runtime
FROM node:18-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/next.config.js ./

# Install only production dependencies
RUN npm ci --only=production

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start application
CMD ["npm", "start"]
```

## 🌐 Nginx Configuration

### Main Nginx Configuration

```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # Upstream servers
    upstream backend {
        least_conn;
        server backend:5001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream frontend {
        least_conn;
        server frontend:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;
        ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_stapling on;
        ssl_stapling_verify on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Frontend routes
        location / {
            limit_req zone=general burst=20 nodelay;
            
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=10 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 30s;
            proxy_connect_timeout 5s;
            proxy_send_timeout 30s;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## ☁️ Cloud Deployment

### AWS Deployment

#### ECS Task Definition

```json
{
  "family": "dnd-game",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-ecr-repo/backend:latest",
      "portMappings": [
        {
          "containerPort": 5001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "GEMINI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:gemini-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dnd-game",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

#### RDS Configuration

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier dnd-game-db \
  --db-instance-class db.t3.micro \
  --engine mongodb \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --deletion-protection
```

### Google Cloud Deployment

#### Cloud Run Service

```yaml
# cloud-run.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: dnd-game-backend
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "2"
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - image: gcr.io/your-project/dnd-game-backend:latest
        ports:
        - containerPort: 5001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5001"
        resources:
          limits:
            cpu: "1000m"
            memory: "512Mi"
```

#### Cloud SQL Configuration

```bash
# Create Cloud SQL instance
gcloud sql instances create dnd-game-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=02:00 \
  --enable-backup
```

### Azure Deployment

#### Azure Container Instances

```yaml
# aci-deployment.yaml
apiVersion: 2019-12-01
location: eastus
name: dnd-game-backend
properties:
  containers:
  - name: backend
    properties:
      image: your-registry.azurecr.io/dnd-game-backend:latest
      ports:
      - port: 5001
      environmentVariables:
      - name: NODE_ENV
        value: "production"
      resources:
        requests:
          memoryInGB: 1.0
          cpu: 1.0
        limits:
          memoryInGB: 2.0
          cpu: 2.0
  osType: Linux
  restartPolicy: Always
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 5001
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check Endpoints

```typescript
// Enhanced health check
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION || '1.0.0',
      services: {
        mongodb: await checkMongoDBHealth(),
        redis: await checkRedisHealth(),
        ai: await checkAIHealth()
      },
      metrics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        activeConnections: getActiveConnections()
      }
    };

    const isHealthy = health.services.mongodb && 
                     health.services.redis && 
                     health.services.ai;

    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

#### Performance Monitoring

```typescript
// Performance middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, statusCode } = req;
    
    // Log performance metrics
    logger.info('Request completed', {
      method,
      url,
      statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Send to monitoring service
    metrics.recordRequest(method, url, statusCode, duration);
  });
  
  next();
});
```

### Logging Configuration

#### Winston Logger Setup

```typescript
// Enhanced logging configuration
import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'dnd-game-backend' },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File logging with rotation
    new winston.transports.DailyRotateFile({
      filename: '/var/log/dnd-game/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    
    // Error logging
    new winston.transports.DailyRotateFile({
      filename: '/var/log/dnd-game/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm run install:all
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Build applications
      run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: your-registry.com
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}
    
    - name: Build and push Backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        file: ./backend/Dockerfile.prod
        push: true
        tags: your-registry.com/dnd-game-backend:latest
    
    - name: Build and push Frontend
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        file: ./frontend/Dockerfile.prod
        push: true
        tags: your-registry.com/dnd-game-frontend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to production
      run: |
        # Deploy using your preferred method
        # Example: kubectl, docker-compose, etc.
        echo "Deploying to production..."
```

## 📈 Scaling Strategies

### Horizontal Scaling

```yaml
# Docker Swarm scaling
docker service scale dnd-game-backend=3
docker service scale dnd-game-frontend=2

# Kubernetes scaling
kubectl scale deployment dnd-game-backend --replicas=3
kubectl scale deployment dnd-game-frontend --replicas=2
```

### Load Balancing

```nginx
# Nginx upstream with multiple backend instances
upstream backend {
    least_conn;
    server backend1:5001 max_fails=3 fail_timeout=30s;
    server backend2:5001 max_fails=3 fail_timeout=30s;
    server backend3:5001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

### Database Scaling

```bash
# MongoDB replica set
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb1:27017" },
    { _id: 1, host: "mongodb2:27017" },
    { _id: 2, host: "mongodb3:27017" }
  ]
});

# Redis clustering
redis-cli --cluster create \
  redis1:6379 redis2:6379 redis3:6379 \
  redis4:6379 redis5:6379 redis6:6379 \
  --cluster-replicas 1
```

## 🚨 Disaster Recovery

### Backup Strategy

```bash
# MongoDB backup
mongodump --uri="mongodb://username:password@host:port/database" \
  --out=/backup/$(date +%Y%m%d_%H%M%S)

# Redis backup
redis-cli -a password BGSAVE

# Application backup
tar -czf /backup/app-$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .
```

### Recovery Procedures

```bash
# Database recovery
mongorestore --uri="mongodb://username:password@host:port/database" \
  /backup/backup_directory

# Application recovery
tar -xzf /backup/app-backup.tar.gz
docker-compose up --build -d

# Configuration recovery
cp /backup/.env .env
cp /backup/docker-compose.yml docker-compose.yml
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] **Security Review**
  - [ ] Environment variables secured
  - [ ] SSL certificates valid
  - [ ] Firewall rules configured
  - [ ] Access controls in place

- [ ] **Performance Testing**
  - [ ] Load testing completed
  - [ ] Performance benchmarks established
  - [ ] Resource limits configured
  - [ ] Monitoring alerts set

- [ ] **Backup Verification**
  - [ ] Database backup tested
  - [ ] Recovery procedures documented
  - [ ] Backup automation verified
  - [ ] Retention policies set

### Deployment

- [ ] **Infrastructure**
  - [ ] Cloud resources provisioned
  - [ ] Network configuration complete
  - [ ] SSL certificates installed
  - [ ] Domain DNS configured

- [ ] **Application**
  - [ ] Docker images built and pushed
  - [ ] Environment variables set
  - [ ] Secrets management configured
  - [ ] Health checks passing

- [ ] **Monitoring**
  - [ ] Logging configured
  - [ ] Metrics collection active
  - [ ] Alerting rules set
  - [ ] Dashboard access verified

### Post-Deployment

- [ ] **Verification**
  - [ ] All services running
  - [ ] Health checks passing
  - [ ] Performance metrics normal
  - [ ] Error rates acceptable

- [ ] **Documentation**
  - [ ] Deployment documented
  - [ ] Configuration updated
  - [ ] Runbooks created
  - [ ] Team access verified

---

**For additional deployment guidance, see the [Installation Guide](INSTALLATION.md) and [Troubleshooting Guide](TROUBLESHOOTING.md).**

**Remember: Production deployments require thorough testing and monitoring!** 🚀
