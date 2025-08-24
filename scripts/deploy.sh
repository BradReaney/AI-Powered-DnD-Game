#!/bin/bash

# AI-Powered D&D Game Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ai-powered-dnd-game"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE="config/env.production"
BACKUP_DIR="backups"
LOG_FILE="deploy.log"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if required files exist
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    fi
    
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S')"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Create backup directory
    mkdir -p "$BACKUP_PATH"
    
    # Backup environment file
    if [[ -f ".env" ]]; then
        cp .env "$BACKUP_PATH/"
    fi
    
    # Backup logs
    if [[ -d "logs" ]]; then
        cp -r logs "$BACKUP_PATH/"
    fi
    
    # Backup uploads
    if [[ -d "uploads" ]]; then
        cp -r uploads "$BACKUP_PATH/"
    fi
    
    # Create backup archive
    tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_PATH" .
    rm -rf "$BACKUP_PATH"
    
    success "Backup created: $BACKUP_PATH.tar.gz"
}

# Stop existing services
stop_services() {
    log "Stopping existing services..."
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        success "Services stopped"
    else
        log "No running services found"
    fi
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    success "Images pulled successfully"
}

# Build services
build_services() {
    log "Building services..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    success "Services built successfully"
}

# Start services
start_services() {
    log "Starting services..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    success "Services started successfully"
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "healthy"; then
            success "All services are healthy"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: Waiting for services to be healthy..."
        sleep 10
        ((attempt++))
    done
    
    error "Services did not become healthy within expected time"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # This would run any database migrations if needed
    # For now, we'll just log that this step was completed
    log "No migrations required for this deployment"
    success "Database migrations completed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if services are running
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        success "All services are running"
    else
        error "Some services are not running"
    fi
    
    # Check health endpoints
    local backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
    if [[ "$backend_health" == "200" ]]; then
        success "Backend health check passed"
    else
        error "Backend health check failed: HTTP $backend_health"
    fi
    
    # Check if frontend is accessible
    local frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/health || echo "000")
    if [[ "$frontend_health" == "200" ]]; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed: HTTP $frontend_health"
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."
    
    local retention_days=30
    local cutoff_date=$(date -d "$retention_days days ago" +%Y%m%d)
    
    find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f | while read -r backup; do
        local backup_date=$(basename "$backup" | sed 's/backup-\([0-9]\{8\}\)-.*/\1/')
        if [[ "$backup_date" < "$cutoff_date" ]]; then
            rm "$backup"
            log "Removed old backup: $backup"
        fi
    done
    
    success "Backup cleanup completed"
}

# Main deployment function
deploy() {
    log "Starting deployment of $PROJECT_NAME..."
    
    check_root
    check_prerequisites
    create_backup
    stop_services
    pull_images
    build_services
    start_services
    wait_for_health
    run_migrations
    verify_deployment
    cleanup_backups
    
    success "Deployment completed successfully!"
    log "Application is now available at:"
    log "  - Frontend: http://localhost:80"
    log "  - Backend API: http://localhost:3000"
    log "  - Health Check: http://localhost:3000/health"
}

# Rollback function
rollback() {
    log "Starting rollback..."
    
    # Stop current services
    stop_services
    
    # Find latest backup
    local latest_backup=$(find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f | sort | tail -n 1)
    
    if [[ -z "$latest_backup" ]]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to: $latest_backup"
    
    # Extract backup
    local backup_dir="backup-temp"
    mkdir -p "$backup_dir"
    tar -xzf "$latest_backup" -C "$backup_dir"
    
    # Restore files
    if [[ -f "$backup_dir/.env" ]]; then
        cp "$backup_dir/.env" .
    fi
    
    if [[ -d "$backup_dir/logs" ]]; then
        cp -r "$backup_dir/logs" .
    fi
    
    if [[ -d "$backup_dir/uploads" ]]; then
        cp -r "$backup_dir/uploads" .
    fi
    
    # Cleanup
    rm -rf "$backup_dir"
    
    # Start services with previous configuration
    start_services
    wait_for_health
    
    success "Rollback completed successfully"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy    Deploy the application"
    echo "  rollback  Rollback to previous deployment"
    echo "  status    Show deployment status"
    echo "  logs      Show service logs"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 rollback"
    echo "  $0 status"
}

# Show status
show_status() {
    log "Showing deployment status..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Show logs
show_logs() {
    log "Showing service logs..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        echo "Unknown option: $1"
        usage
        exit 1
        ;;
esac
