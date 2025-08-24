# 🚀 Production Deployment Guide

## **📋 Overview**

This guide covers the production deployment of the AI-Powered D&D Game application. The application is designed to be deployed using Docker and Docker Compose for easy scaling and management.

## **🏗️ Architecture**

### **Production Stack**
- **Frontend**: React + TypeScript + Vite, served by Nginx
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB 7.0
- **Cache**: Redis (optional, for enhanced performance)
- **Reverse Proxy**: Nginx with SSL termination
- **Containerization**: Docker + Docker Compose
- **Monitoring**: Built-in health checks and performance monitoring

### **Network Architecture**
```
Internet → Nginx (SSL) → Frontend (React) → Backend API → MongoDB
                    ↓
                Redis Cache (optional)
```

## **📋 Prerequisites**

### **System Requirements**
- **OS**: Linux (Ubuntu 20.04+ recommended) or macOS
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB, Recommended 50GB+
- **CPU**: 2+ cores recommended

### **Software Requirements**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Latest version
- **Make**: For build automation (optional)

### **External Services**
- **Google Gemini API Key**: Required for AI functionality
- **Domain Name**: For production deployment
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

## **🔧 Installation & Setup**

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/ai-powered-dnd-game.git
cd ai-powered-dnd-game
```

### **2. Configure Environment**
```bash
# Copy production environment template
cp config/env.production .env

# Edit environment variables
nano .env
```

### **3. Required Environment Variables**
```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://admin:secure_password@localhost:27017/ai-dnd-game-prod?authSource=admin
MONGODB_URI_PROD=mongodb://admin:secure_password@localhost:27017/ai-dnd-game-prod?authSource=admin

# AI Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Security Configuration
JWT_SECRET=your_secure_random_string_here
SESSION_SECRET=your_secure_random_string_here
CORS_ORIGIN=https://yourdomain.com

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/dnd-game/app.log
```

### **4. Generate Secure Secrets**
```bash
# Generate JWT secret
openssl rand -base64 64

# Generate session secret
openssl rand -base64 64

# Generate MongoDB password
openssl rand -base64 32
```

## **🚀 Deployment**

### **Quick Deployment**
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy application
./scripts/deploy.sh deploy
```

### **Manual Deployment**
```bash
# Build and start services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### **Deployment Options**

#### **Option 1: Full Stack (Recommended)**
```bash
# Deploy all services
docker-compose up -d
```

#### **Option 2: Backend Only**
```bash
# Deploy only backend services
docker-compose up -d mongodb backend
```

#### **Option 3: Frontend Only**
```bash
# Deploy only frontend
docker-compose up -d frontend nginx
```

## **🔍 Monitoring & Health Checks**

### **Health Check Endpoints**
- **Backend**: `http://localhost:3000/health`
- **Frontend**: `http://localhost:80/health`
- **MongoDB**: Built-in Docker health check
- **Redis**: Built-in Docker health check

### **Performance Monitoring**
The application includes built-in performance monitoring:
- Request/response times
- Slow request detection
- Error rate tracking
- Cache hit rates

### **Log Monitoring**
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# View application logs
tail -f logs/app.log
```

## **🔒 Security Configuration**

### **Firewall Setup**
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### **SSL Configuration**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Security Headers**
The application includes security headers:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: Comprehensive CSP
- Referrer-Policy: strict-origin-when-cross-origin

## **📊 Performance Optimization**

### **Database Optimization**
- Automatic indexing on common query fields
- Connection pooling
- Query optimization

### **Caching Strategy**
- In-memory caching for frequently accessed data
- Redis caching for distributed deployments
- Static asset caching with Nginx

### **Compression**
- Gzip compression for text-based responses
- Optimized image serving
- Minified JavaScript and CSS

## **🔄 Maintenance & Updates**

### **Regular Maintenance Tasks**
```bash
# Update application
git pull origin main
./scripts/deploy.sh deploy

# Backup database
docker-compose exec mongodb mongodump --out /backup

# Clean up old logs
find logs/ -name "*.log" -mtime +30 -delete

# Monitor disk usage
df -h
docker system df
```

### **Update Procedures**
```bash
# 1. Backup current deployment
./scripts/deploy.sh backup

# 2. Pull latest changes
git pull origin main

# 3. Deploy updates
./scripts/deploy.sh deploy

# 4. Verify deployment
./scripts/deploy.sh status
```

### **Rollback Procedures**
```bash
# Rollback to previous deployment
./scripts/deploy.sh rollback

# Verify rollback
./scripts/deploy.sh status
```

## **🚨 Troubleshooting**

### **Common Issues**

#### **Service Won't Start**
```bash
# Check service logs
docker-compose logs service_name

# Check resource usage
docker stats

# Verify environment variables
docker-compose config
```

#### **Database Connection Issues**
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check network connectivity
docker-compose exec backend ping mongodb
```

#### **Performance Issues**
```bash
# Check performance metrics
curl http://localhost:3000/health

# Monitor resource usage
docker stats

# Check cache performance
docker-compose exec redis redis-cli info memory
```

### **Debug Mode**
```bash
# Enable debug logging
export LOG_LEVEL=debug

# Restart services
docker-compose restart backend

# View detailed logs
docker-compose logs -f backend
```

## **📈 Scaling**

### **Horizontal Scaling**
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale with load balancer
# Add Nginx load balancer configuration
```

### **Vertical Scaling**
```bash
# Increase resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
```

## **💾 Backup & Recovery**

### **Automated Backups**
```bash
# Create backup script
cat > /etc/cron.daily/dnd-game-backup << 'EOF'
#!/bin/bash
cd /path/to/your/app
./scripts/deploy.sh backup
EOF

chmod +x /etc/cron.daily/dnd-game-backup
```

### **Manual Backups**
```bash
# Database backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# File backup
tar -czf backup-$(date +%Y%m%d).tar.gz logs/ uploads/ .env
```

### **Recovery Procedures**
```bash
# Restore database
docker-compose exec mongodb mongorestore /backup/20241201/

# Restore files
tar -xzf backup-20241201.tar.gz
```

## **🔗 External Integrations**

### **Monitoring Services**
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboard
- **Sentry**: Error tracking
- **Logstash**: Log aggregation

### **CI/CD Pipeline**
```yaml
# Example GitHub Actions workflow
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          ssh user@server "cd /app && git pull && ./scripts/deploy.sh deploy"
```

## **📚 Additional Resources**

### **Documentation**
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### **Support**
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Wiki**: Project Wiki

### **Community**
- **Discord**: Join our community server
- **Reddit**: r/AIPoweredDnD
- **Twitter**: @AIPoweredDnD

---

**🎉 Congratulations! Your AI-Powered D&D Game is now deployed in production!**

For additional support or questions, please refer to the troubleshooting section or create an issue on GitHub.
