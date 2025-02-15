#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="salesgpt"
NETWORK_NAME="${PROJECT_NAME}-network"

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Check if necessary files exist
if [ ! -f backend/.env ]; then
    print_message "❌ backend/.env file not found! Please create one from backend/.env.example" "$RED"
    exit 1
fi

# Check if frontend package.json exists
if [ ! -f frontend/package.json ]; then
    print_message "❌ frontend/package.json not found! Please ensure the frontend directory is set up correctly" "$RED"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_message "❌ Docker is not running. Please start Docker first!" "$RED"
    exit 1
fi

# Create network if it doesn't exist
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    print_message "🌐 Creating Docker network: $NETWORK_NAME" "$YELLOW"
    docker network create $NETWORK_NAME
fi

# Stop and remove existing containers
print_message "🔍 Checking for running containers..." "$YELLOW"
docker-compose down -v 2>/dev/null

# Remove existing images
print_message "🗑️ Removing existing images..." "$YELLOW"
docker-compose rm -f 2>/dev/null

# Build and start containers
print_message "🏗️ Building and starting containers..." "$YELLOW"
docker-compose up -d --build

# Check if containers are running
if [ $? -eq 0 ]; then
    print_message "✅ Deployment successful!" "$GREEN"
    print_message "📋 Services:" "$GREEN"
    echo "- Frontend: http://localhost:3000"
    echo "- API: http://localhost:8000"
    echo "- API Docs: http://localhost:8000/docs"
    echo "- MongoDB: mongodb://localhost:27017"
    
    print_message "\n📊 Container Status:" "$YELLOW"
    docker-compose ps
    
    print_message "\n📜 Logs will appear below (Ctrl+C to exit):" "$YELLOW"
    docker-compose logs -f
else
    print_message "❌ Deployment failed!" "$RED"
    exit 1
fi