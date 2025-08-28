#!/bin/bash

# Railway Cache Clearing Setup Script
# This script helps you set up environment variables for automatic Redis cache clearing on Railway deployments

echo "🚀 Setting up Railway Cache Clearing Configuration"
echo "=================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   Then run: railway login"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged into Railway. Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI found and authenticated"

# Get project info
echo ""
echo "📋 Current Railway Projects:"
railway projects

echo ""
echo "🔧 Setting up Cache Clearing Environment Variables"
echo "=================================================="

# Set cache clearing variables
echo "Setting CLEAR_CACHE_ON_DEPLOY=true..."
railway variables set CLEAR_CACHE_ON_DEPLOY=true

echo "Setting CACHE_CLEAR_PATTERNS..."
railway variables set CACHE_CLEAR_PATTERNS="user-sessions:*,game-state:*,ai:response:*,campaign:*,character:*,session:*,quest:*,location:*"

echo "Setting CACHE_CLEAR_ON_STARTUP=true..."
railway variables set CACHE_CLEAR_ON_STARTUP=true

echo "Setting CACHE_PRESERVE_PATTERNS..."
railway variables set CACHE_PRESERVE_PATTERNS="mechanics:*,templates:*,system:*"

echo ""
echo "✅ Cache clearing environment variables configured!"
echo ""
echo "📊 Configuration Summary:"
echo "   • CLEAR_CACHE_ON_DEPLOY: true"
echo "   • CACHE_CLEAR_ON_STARTUP: true"
echo "   • CACHE_CLEAR_PATTERNS: user-sessions:*,game-state:*,ai:response:*,campaign:*,character:*,session:*,quest:*,location:*"
echo "   • CACHE_PRESERVE_PATTERNS: mechanics:*,templates:*,system:*"
echo ""
echo "🔄 What happens now:"
echo "   1. On every Railway deployment, these cache patterns will be automatically cleared"
echo "   2. System templates and mechanics will be preserved"
echo "   3. Cache will be warmed up after clearing"
echo "   4. You can monitor the process via deployment logs"
echo ""
echo "🧪 Test the configuration:"
echo "   • Deploy your app to Railway"
echo "   • Check the deployment logs for cache clearing messages"
echo "   • Use the API endpoint: POST /api/cache/clear-deploy"
echo ""
echo "📚 For more information, see: docs/REDIS_CACHING.md"
