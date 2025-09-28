#!/bin/bash
set -e

echo "🚀 PhishGuard Basic - Installation Script"
echo "========================================="

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is required but not installed."
        exit 1
    fi
}

echo "📋 Checking prerequisites..."
check_command docker
check_command git
check_command openssl

# Check Docker Compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose is required but not installed."
    exit 1
fi

echo "✅ All prerequisites met"

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    # Generate secure JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
    
    # Ask for AI configuration
    echo ""
    echo "🤖 AI Provider Configuration"
    echo "Available providers: GEMINI, OPENAI, CLAUDE, OLLAMA"
    read -p "Enter AI provider (default: GEMINI): " AI_PROVIDER
    AI_PROVIDER=${AI_PROVIDER:-GEMINI}
    
    read -p "Enter AI API key (leave empty for sandbox mode): " AI_API_KEY
    AI_API_KEY=${AI_API_KEY:-sandbox-key}
    
    sed -i.bak "s|AI_PROVIDER=.*|AI_PROVIDER=${AI_PROVIDER}|" .env
    sed -i.bak "s|AI_API_KEY=.*|AI_API_KEY=${AI_API_KEY}|" .env
    
    # Ask for SMTP configuration
    echo ""
    echo "📧 Email Configuration (optional, press Enter to skip)"
    read -p "SMTP Host: " SMTP_HOST
    if [ ! -z "$SMTP_HOST" ]; then
        read -p "SMTP Port (587): " SMTP_PORT
        SMTP_PORT=${SMTP_PORT:-587}
        read -p "SMTP User: " SMTP_USER
        read -sp "SMTP Password: " SMTP_PASS
        echo ""
        
        sed -i.bak "s|SMTP_HOST=.*|SMTP_HOST=${SMTP_HOST}|" .env
        sed -i.bak "s|SMTP_PORT=.*|SMTP_PORT=${SMTP_PORT}|" .env
        sed -i.bak "s|SMTP_USER=.*|SMTP_USER=${SMTP_USER}|" .env
        sed -i.bak "s|SMTP_PASS=.*|SMTP_PASS=${SMTP_PASS}|" .env
    fi
    
    # Clean up backup files
    rm -f .env.bak
    
    echo "✅ Environment configured"
else
    echo "ℹ️ .env file already exists, skipping configuration"
fi

# Build and start containers
echo ""
echo "🐳 Building Docker containers..."
$DOCKER_COMPOSE build

echo ""
echo "🚀 Starting services..."
$DOCKER_COMPOSE up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Run database migrations
echo ""
echo "🗃️ Running database migrations..."
$DOCKER_COMPOSE exec -T backend npx prisma migrate deploy || \
    $DOCKER_COMPOSE exec -T backend npx prisma migrate dev --name init

# Seed database
echo ""
echo "🌱 Seeding database with initial data..."
$DOCKER_COMPOSE exec -T backend npx prisma db seed

# Get admin credentials
ADMIN_EMAIL=$(grep DEFAULT_ADMIN_EMAIL .env | cut -d '=' -f2)
ADMIN_PASSWORD=$(grep DEFAULT_ADMIN_PASSWORD .env | cut -d '=' -f2)

# Health check
echo ""
echo "🔍 Running health check..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "⚠️ Backend health check failed"
fi

if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "⚠️ Frontend health check failed"
fi

# Display success message
echo ""
echo "========================================="
echo "✨ PhishGuard Basic installed successfully!"
echo "========================================="
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3000"
echo ""
echo "🔐 Admin Credentials:"
echo "   Email: ${ADMIN_EMAIL}"
echo "   Password: ${ADMIN_PASSWORD}"
echo ""
echo "⚠️ IMPORTANT:"
echo "   1. Change the admin password after first login"
echo "   2. Configure SMTP for email sending (currently in SANDBOX mode)"
echo "   3. Review security settings in .env file"
echo ""
echo "📚 Next steps:"
echo "   1. Login to the dashboard"
echo "   2. Import employee list (CSV)"
echo "   3. Create your first campaign"
echo "   4. Review documentation in /docs"
echo ""
echo "🛑 To stop services: $DOCKER_COMPOSE down"
echo "📊 To view logs: $DOCKER_COMPOSE logs -f"
echo ""