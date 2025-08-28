#!/bin/bash

# Railway Deployment Cache Clear Script
# This script can be used to clear Redis cache during Railway deployments
# It can be called from Railway deployment hooks or manually

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:5001}"
CACHE_CLEAR_ENDPOINT="/api/cache/clear"
CACHE_DEPLOYMENT_ENDPOINT="/api/cache/clear-deployment"
CACHE_STATS_ENDPOINT="/api/cache/stats"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if backend is available
check_backend() {
    print_status "Checking backend availability at ${BACKEND_URL}..."
    
    if curl -s --max-time 10 "${BACKEND_URL}/health" > /dev/null; then
        print_status "Backend is available"
        return 0
    else
        print_error "Backend is not available at ${BACKEND_URL}"
        return 1
    fi
}

# Function to get cache statistics
get_cache_stats() {
    print_status "Getting current cache statistics..."
    
    if response=$(curl -s --max-time 10 "${BACKEND_URL}${CACHE_STATS_ENDPOINT}"); then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        print_warning "Failed to get cache statistics"
    fi
}

# Function to clear all cache
clear_all_cache() {
    print_status "Clearing all cache..."
    
    if response=$(curl -s -X POST --max-time 30 "${BACKEND_URL}${CACHE_CLEAR_ENDPOINT}"); then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        print_status "All cache cleared successfully"
    else
        print_error "Failed to clear all cache"
        return 1
    fi
}

# Function to clear deployment-specific cache
clear_deployment_cache() {
    print_status "Clearing deployment-specific cache..."
    
    if response=$(curl -s -X POST --max-time 30 "${BACKEND_URL}${CACHE_DEPLOYMENT_ENDPOINT}"); then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        print_status "Deployment cache cleared successfully"
    else
        print_error "Failed to clear deployment cache"
        return 1
    fi
}

# Function to warm cache after clearing
warm_cache() {
    print_status "Warming cache..."
    
    if response=$(curl -s -X POST --max-time 60 "${BACKEND_URL}/api/cache/warm"); then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        print_status "Cache warming completed"
    else
        print_warning "Failed to warm cache"
    fi
}

# Main execution
main() {
    print_status "Starting Railway deployment cache management..."
    
    # Check if we're in a Railway environment
    if [ -n "$RAILWAY_ENVIRONMENT" ] || [ -n "$RAILWAY_PROJECT_ID" ] || [ -n "$RAILWAY_SERVICE_ID" ]; then
        print_status "Detected Railway deployment environment"
        print_status "Environment: ${RAILWAY_ENVIRONMENT:-unknown}"
        print_status "Project ID: ${RAILWAY_PROJECT_ID:-unknown}"
        print_status "Service ID: ${RAILWAY_SERVICE_ID:-unknown}"
    else
        print_warning "Not in Railway deployment environment"
    fi
    
    # Check backend availability
    if ! check_backend; then
        print_error "Cannot proceed without backend availability"
        exit 1
    fi
    
    # Show current cache stats
    get_cache_stats
    
    # Clear deployment cache (more selective than clearing all)
    if clear_deployment_cache; then
        print_status "Deployment cache cleared successfully"
    else
        print_warning "Falling back to clearing all cache..."
        if clear_all_cache; then
            print_status "All cache cleared successfully"
        else
            print_error "Failed to clear cache"
            exit 1
        fi
    fi
    
    # Warm cache after clearing
    warm_cache
    
    # Show final cache stats
    print_status "Final cache statistics:"
    get_cache_stats
    
    print_status "Railway deployment cache management completed successfully"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --stats        Only show cache statistics"
        echo "  --clear-all    Clear all cache"
        echo "  --clear-deploy Clear deployment-specific cache"
        echo "  --warm         Only warm cache"
        echo ""
        echo "Environment Variables:"
        echo "  BACKEND_URL    Backend service URL (default: http://localhost:5001)"
        echo "  RAILWAY_*      Railway environment variables"
        echo ""
        echo "Examples:"
        echo "  $0                    # Full deployment cache management"
        echo "  $0 --stats            # Show cache statistics only"
        echo "  $0 --clear-all        # Clear all cache"
        echo "  $0 --clear-deploy     # Clear deployment cache only"
        echo "  $0 --warm             # Warm cache only"
        exit 0
        ;;
    --stats)
        check_backend && get_cache_stats
        exit 0
        ;;
    --clear-all)
        check_backend && clear_all_cache
        exit 0
        ;;
    --clear-deploy)
        check_backend && clear_deployment_cache
        exit 0
        ;;
    --warm)
        check_backend && warm_cache
        exit 0
        ;;
    "")
        # No arguments, run full deployment cache management
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
