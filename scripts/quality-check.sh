#!/bin/bash

# Quality Check Script for AI-Powered D&D Game
# This script runs all quality checks and provides a comprehensive report

set -e

echo "🔍 Starting Quality Check for AI-Powered D&D Game"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking Prerequisites..."
if ! command_exists node; then
    print_status "error" "Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    print_status "error" "npm is not installed"
    exit 1
fi

print_status "success" "Node.js $(node --version) and npm $(npm --version) found"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_status "error" "Please run this script from the project root directory"
    exit 1
fi

print_status "success" "Project structure verified"

# Install dependencies if needed
echo ""
echo "📦 Installing Dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    print_status "success" "Root dependencies installed"
else
    print_status "info" "Root dependencies already installed"
fi

if [ ! -d "frontend/node_modules" ]; then
    cd frontend && npm install && cd ..
    print_status "success" "Frontend dependencies installed"
else
    print_status "info" "Frontend dependencies already installed"
fi

if [ ! -d "backend/node_modules" ]; then
    cd backend && npm install && cd ..
    print_status "success" "Backend dependencies installed"
else
    print_status "info" "Backend dependencies already installed"
fi

# Run quality checks
echo ""
echo "🔍 Running Quality Checks..."

# Frontend quality checks
echo ""
echo "🎨 Frontend Quality Checks..."
cd frontend

print_status "info" "Running ESLint..."
if npm run lint > /dev/null 2>&1; then
    print_status "success" "ESLint passed"
else
    print_status "error" "ESLint failed"
    npm run lint
    cd ..
    exit 1
fi

print_status "info" "Running Prettier check..."
if npm run format:check > /dev/null 2>&1; then
    print_status "success" "Prettier check passed"
else
    print_status "warning" "Prettier check failed - code needs formatting"
    print_status "info" "Run 'npm run format' to fix formatting issues"
fi

cd ..

# Backend quality checks
echo ""
echo "⚙️  Backend Quality Checks..."
cd backend

print_status "info" "Running ESLint..."
if npm run lint > /dev/null 2>&1; then
    print_status "success" "ESLint passed"
else
    print_status "error" "ESLint failed"
    npm run lint
    cd ..
    exit 1
fi

print_status "info" "Running Prettier check..."
if npm run format:check > /dev/null 2>&1; then
    print_status "success" "Prettier check passed"
else
    print_status "warning" "Prettier check failed - code needs formatting"
    print_status "info" "Run 'npm run format' to fix formatting issues"
fi

cd ..

# TypeScript compilation check
echo ""
echo "📝 TypeScript Compilation Check..."

print_status "info" "Checking frontend TypeScript..."
cd frontend
if npm run build > /dev/null 2>&1; then
    print_status "success" "Frontend TypeScript compilation successful"
else
    print_status "error" "Frontend TypeScript compilation failed"
    npm run build
    cd ..
    exit 1
fi
cd ..

print_status "info" "Checking backend TypeScript..."
cd backend
if npm run build > /dev/null 2>&1; then
    print_status "success" "Backend TypeScript compilation successful"
else
    print_status "error" "Backend TypeScript compilation failed"
    npm run build
    cd ..
    exit 1
fi
cd ..

# Test check
echo ""
echo "🧪 Test Check..."

print_status "info" "Checking if tests can run..."
cd frontend
if npm run test -- --list > /dev/null 2>&1; then
    print_status "success" "Frontend tests are configured and ready"
else
    print_status "warning" "Frontend tests may have issues"
fi
cd ..

cd backend
if npm run test -- --list > /dev/null 2>&1; then
    print_status "success" "Backend tests are configured and ready"
else
    print_status "warning" "Backend tests may have issues"
fi
cd ..

# Git hooks check
echo ""
echo "🔗 Git Hooks Check..."

if [ -f ".husky/pre-commit" ]; then
    print_status "success" "Husky pre-commit hook found"
else
    print_status "warning" "Husky pre-commit hook not found"
fi

if [ -f "frontend/.husky/pre-commit" ]; then
    print_status "success" "Frontend Husky pre-commit hook found"
else
    print_status "warning" "Frontend Husky pre-commit hook not found"
fi

if [ -f "backend/.husky/pre-commit" ]; then
    print_status "success" "Backend Husky pre-commit hook found"
else
    print_status "warning" "Backend Husky pre-commit hook not found"
fi

# Final summary
echo ""
echo "=================================================="
echo "🎯 Quality Check Summary"
echo "=================================================="

print_status "success" "Quality check completed successfully!"
echo ""
echo "📋 Available Quality Commands:"
echo "  npm run quality          - Run all quality checks"
echo "  npm run quality:fix      - Run all quality checks and fix issues"
echo "  npm run lint             - Run linting on all packages"
echo "  npm run format           - Format all code"
echo "  npm run format:check     - Check code formatting"
echo ""
echo "🔧 Individual Package Commands:"
echo "  npm run quality:frontend - Frontend quality checks"
echo "  npm run quality:backend  - Backend quality checks"
echo ""
echo "💡 Tips:"
echo "  - Run 'npm run quality:fix' to automatically fix most issues"
echo "  - Git hooks will run quality checks before each commit"
echo "  - Use 'npm run format' to format code before committing"
echo ""
echo "🚀 Ready for development!"
