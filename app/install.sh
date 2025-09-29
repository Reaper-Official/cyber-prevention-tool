#!/bin/bash

set -e

echo "🚀 PhishGuard Basic - Installation Script"
echo "=========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_COMPOSE_CMD="docker compose"
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ All prerequisites are installed"
echo ""

# Clone repository if not already present
if [ ! -f "docker-compose.yml" ]; then
    echo "📥 Cloning repository..."
    read -p "Enter repository URL: " REPO_URL
    git clone "$REPO_URL" phishguard-basic
    cd phishguard-basic
fi

# Create .env file
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    
    echo ""
    echo "🔑 AI Provider Configuration"
    echo "Available providers: GEMINI, OPENAI, ANTHROPIC, OLLAMA"
    read -p "Select AI provider (default: GEMINI): " AI_PROVIDER
    AI_PROVIDER=${AI_PROVIDER:-GEMINI}
    
    if [ "$AI_PROVIDER" != "OLLAMA" ]; then
        read -p "Enter your AI API key: " AI_API_KEY
        sed -i.bak "s/AI_API_KEY=.*/AI_API_KEY=$AI_API_KEY/" .env
    fi
    
    sed -i.bak "s/AI_PROVIDER=.*/AI_PROVIDER=$AI_PROVIDER/" .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    
    rm -f .env.bak
    
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists, skipping..."
fi

echo ""
echo "🐳 Building and starting Docker containers..."
$DOCKER_COMPOSE_CMD up -d --build

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

echo ""
echo "🗄️  Running database migrations..."
$DOCKER_COMPOSE_CMD exec -T backend npx prisma migrate deploy

echo ""
echo "🌱 Seeding database..."
$DOCKER_COMPOSE_CMD exec -T backend npm run prisma:seed

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "=========================================="
echo "📋 Access Information"
echo "=========================================="
echo "Frontend URL: http://localhost"
echo "Backend API: http://localhost:4000"
echo ""
echo "Default Admin Credentials:"
echo "  Email: admin@local.test"
echo "  Password: Admin123!"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "  1. Change the default admin password immediately"
echo "  2. This tool is for INTERNAL USE ONLY"
echo "  3. All campaigns require RH/Security approval"
echo "  4. Sandbox mode is enabled by default"
echo "  5. Never use for unauthorized phishing attacks"
echo ""
echo "📚 Documentation: See README.md"
echo "=========================================="
echo ""
echo "To stop the application: $DOCKER_COMPOSE_CMD down"
echo "To view logs: $DOCKER_COMPOSE_CMD logs -f"
echo ""