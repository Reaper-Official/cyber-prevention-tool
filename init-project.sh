#!/bin/bash

# Script de création complète de l'arborescence PhishGuard BASIC
# Usage: chmod +x create_structure.sh && ./create_structure.sh

set -e

echo "🌳 Création de l'arborescence complète PhishGuard BASIC..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# 1. CRÉATION DE LA STRUCTURE DE RÉPERTOIRES
# ============================================================================

echo "${BLUE}📁 Création des répertoires...${NC}"

# Répertoires principaux
mkdir -p app-full/management/{api,config,includes,pages,templates,assets,src,vendor,tests}
mkdir -p app-full/management/pages/{campaigns,users,reports,templates,settings}
mkdir -p app-full/management/templates/{emails,landing-pages}
mkdir -p app-full/management/assets/{css,js,images/icons,fonts}
mkdir -p app-full/management/src/{Models,Controllers,Services,Utils}
mkdir -p app-full/management/tests/{unit,integration}

mkdir -p docker/{php,nginx/conf.d,redis}
mkdir -p storage/{logs/nginx,cache,uploads/user-imports,backups,reports/{pdf,excel},sessions,tmp,ssl,postgres,redis}
mkdir -p scripts
mkdir -p docs

echo "${GREEN}✅ Structure de répertoires créée${NC}"

# ============================================================================
# 2. FICHIERS RACINE
# ============================================================================

echo -e "${BLUE}📝 Création des fichiers racine...${NC}"

# .env.example
cat > .env.example << 'EOF'
# ============================================================================
# Configuration PhishGuard BASIC
# ============================================================================

# Base de données PostgreSQL
DB_HOST=db
DB_PORT=5432
DB_NAME=phishguard_basic
DB_USER=phishguard
DB_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE

# Application
APP_NAME="PhishGuard BASIC"
APP_URL=http://localhost
APP_SECRET=CHANGEZ_CETTE_CLE_SECRETE
APP_ENV=production

# Email SMTP
MAIL_HOST=smtp.exemple.com
MAIL_PORT=587
MAIL_USERNAME=phishing@exemple.com
MAIL_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE
MAIL_FROM_ADDRESS=phishing@exemple.com
MAIL_FROM_NAME="PhishGuard Training"

# Ports
HTTP_PORT=80
HTTPS_PORT=443

# Sécurité
SESSION_LIFETIME=7200
RATE_LIMIT=100

# Timezone
TIMEZONE=Europe/Paris
EOF

# .gitignore
cat > .gitignore << 'EOF'
# Environnement
.env
.env.local

# Docker
docker-compose.override.yml

# Logs
*.log
storage/logs/*
!storage/logs/.gitkeep

# Cache
storage/cache/*
!storage/cache/.gitkeep

# Uploads
storage/uploads/*
!storage/uploads/.gitkeep

# Backups
storage/backups/*
!storage/backups/.gitkeep

# PHP
vendor/
composer.lock

# IDE
.vscode/
.idea/
*.swp
.DS_Store
Thumbs.db
EOF

# docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    container_name: phishguard_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-phishguard_basic}
      POSTGRES_USER: ${DB_USER:-phishguard}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./app-full/management/config/init_db.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
      - ./storage/backups:/backups
    ports:
      - "${DB_PORT:-5432}:5432"
    networks:
      - phishguard_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-phishguard} -d ${DB_NAME:-phishguard_basic}"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: phishguard_redis
    restart: unless-stopped
    command: redis-server /etc/redis/redis.conf --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      - ./docker/redis/redis.conf:/etc/redis/redis.conf:ro
    ports:
      - "${REDIS_PORT:-6379}:6379"
    networks:
      - phishguard_network
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: phishguard_app
    restart: unless-stopped
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=${DB_NAME:-phishguard_basic}
      - DB_USER=${DB_USER:-phishguard}
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - APP_SECRET=${APP_SECRET}
      - TIMEZONE=${TIMEZONE:-Europe/Paris}
    volumes:
      - ./app-full:/var/www/html:rw
      - ./storage:/var/www/html/storage:rw
    networks:
      - phishguard_network
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  nginx:
    image: nginx:1.24-alpine
    container_name: phishguard_nginx
    restart: unless-stopped
    ports:
      - "${HTTP_PORT:-80}:80"
      - "${HTTPS_PORT:-443}:443"
    volumes:
      - ./app-full:/var/www/html:ro
      - ./storage:/var/www/html/storage:rw
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./storage/ssl:/etc/nginx/ssl:ro
      - ./storage/logs/nginx:/var/log/nginx:rw
    networks:
      - phishguard_network
    depends_on:
      - app

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  phishguard_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
EOF

# Dockerfile
cat > Dockerfile << 'EOF'
FROM php:8.2-fpm-alpine

LABEL maintainer="Reaper Official <reaper@etik.com>"
LABEL description="PhishGuard BASIC - Phishing Simulation Platform"

# Installation des dépendances système
RUN apk add --no-cache --update \
    postgresql-dev \
    redis \
    curl \
    git \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    autoconf \
    gcc \
    g++ \
    make \
    netcat-openbsd \
    bash

# Configuration et installation des extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        bcmath \
        pcntl \
        intl \
        mbstring

# Installation de l'extension Redis
RUN pecl channel-update pecl.php.net \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && pecl clear-cache

# Installation de Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copie des configurations PHP
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-phishguard.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zzz-phishguard.conf

# Copie de l'application
COPY app-full/ /var/www/html/

# Installation des dépendances Composer
RUN if [ -f management/composer.json ]; then \
        cd management && composer install --no-dev --optimize-autoloader --no-interaction; \
    fi

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Script d'initialisation
COPY docker/init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/init.sh"]
CMD ["php-fpm"]
EOF

echo -e "${GREEN}✅ Fichiers racine créés${NC}"

# ============================================================================
# 3. CONFIGURATION DOCKER
# ============================================================================

echo -e "${BLUE}🐳 Création des configurations Docker...${NC}"

# docker/php/php.ini
cat > docker/php/php.ini << 'EOF'
[PHP]
memory_limit = 512M
upload_max_filesize = 50M
post_max_size = 100M
max_execution_time = 300
max_input_time = 60

[Date]
date.timezone = Europe/Paris

[Session]
session.save_handler = redis
session.save_path = "tcp://redis:6379?auth=${REDIS_PASSWORD}"
session.gc_maxlifetime = 7200

[Extensions]
extension=pdo
extension=pdo_pgsql
extension=pgsql
extension=redis
extension=gd
extension=bcmath
extension=intl
extension=mbstring
EOF

# docker/php/php-fpm.conf
cat > docker/php/php-fpm.conf << 'EOF'
[global]
error_log = /var/log/phishguard/php-fpm.log
daemonize = no

[www]
user = www-data
group = www-data
listen = 9000

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 3
pm.max_spare_servers = 10

access.log = /var/log/phishguard/php-fpm-access.log
slowlog = /var/log/phishguard/php-fpm-slow.log
request_slowlog_timeout = 30s
EOF

# docker/nginx/nginx.conf
cat > docker/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    server_tokens off;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

    upstream php-fpm {
        server app:9000;
    }

    include /etc/nginx/conf.d/*.conf;
}
EOF

# docker/nginx/conf.d/default.conf
cat > docker/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html/management;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass php-fpm;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    location ~ /\.(ht|env|git) {
        deny all;
    }
}
EOF

# docker/redis/redis.conf
cat > docker/redis/redis.conf << 'EOF'
port 6379
bind 0.0.0.0
protected-mode yes
save 900 1
save 300 10
save 60 10000
rdbcompression yes
dbfilename dump.rdb
dir /data
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF

# docker/init.sh
cat > docker/init.sh << 'EOF'
#!/bin/sh
set -e

echo "🚀 Initialisation PhishGuard BASIC..."

# Attendre les services
while ! nc -z db 5432; do sleep 2; done
echo "✅ PostgreSQL prêt"

while ! nc -z redis 6379; do sleep 2; done
echo "✅ Redis prêt"

# Permissions
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage

# Initialisation BDD
if [ ! -f "/var/www/html/.initialized" ]; then
    if [ -f "/var/www/html/management/setup.php" ]; then
        php /var/www/html/management/setup.php
        touch /var/www/html/.initialized
    fi
fi

echo "✅ Initialisation terminée"
exec "${@:-php-fpm}"
EOF

chmod +x docker/init.sh

echo -e "${GREEN}✅ Configurations Docker créées${NC}"

# ============================================================================
# 4. APPLICATION PHP
# ============================================================================

echo -e "${BLUE}🐘 Création des fichiers PHP...${NC}"

# app-full/management/index.php
cat > app-full/management/index.php << 'EOF'
<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/includes/auth.php';

session_start();

if (!isAuthenticated()) {
    header('Location: /management/login.php');
    exit;
}

require_once __DIR__ . '/dashboard.php';
EOF

# app-full/management/login.php
cat > app-full/management/login.php << 'EOF'
<?php
require_once __DIR__ . '/config/database.php';
session_start();

if (isset($_SESSION['user_id'])) {
    header('Location: /management/');
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Connexion - PhishGuard</title>
    <link rel="stylesheet" href="/management/assets/css/login.css">
</head>
<body>
    <div class="login-container">
        <h1>PhishGuard BASIC</h1>
        <form method="POST" action="/management/api/login.php">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Mot de passe" required>
            <button type="submit">Se connecter</button>
        </form>
    </div>
</body>
</html>
EOF

# app-full/management/dashboard.php
cat > app-full/management/dashboard.php << 'EOF'
<?php
require_once __DIR__ . '/includes/header.php';
?>
<div class="dashboard">
    <h1>Tableau de bord</h1>
    <div class="stats">
        <div class="stat-card">
            <h3>Campagnes actives</h3>
            <p class="stat-value">0</p>
        </div>
        <div class="stat-card">
            <h3>Utilisateurs</h3>
            <p class="stat-value">0</p>
        </div>
    </div>
</div>
<?php
require_once __DIR__ . '/includes/footer.php';
?>
EOF

# app-full/management/composer.json
cat > app-full/management/composer.json << 'EOF'
{
    "name": "phishguard/basic",
    "description": "PhishGuard BASIC - Phishing Simulation Platform",
    "type": "project",
    "require": {
        "php": ">=8.1"
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
EOF

# app-full/management/config/database.php
cat > app-full/management/config/database.php << 'EOF'
<?php
return [
    'host' => getenv('DB_HOST') ?: 'db',
    'port' => getenv('DB_PORT') ?: 5432,
    'database' => getenv('DB_NAME') ?: 'phishguard_basic',
    'username' => getenv('DB_USER') ?: 'phishguard',
    'password' => getenv('DB_PASSWORD') ?: '',
];
EOF

# app-full/management/config/init_db.sql
cat > app-full/management/config/init_db.sql << 'EOF'
-- Création des tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    opened BOOLEAN DEFAULT false,
    clicked BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO users (email, password, name, role) 
VALUES ('admin@phishguard.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;
EOF

# app-full/management/includes/auth.php
cat > app-full/management/includes/auth.php << 'EOF'
<?php
function isAuthenticated() {
    return isset($_SESSION['user_id']);
}

function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: /management/login.php');
        exit;
    }
}
EOF

# app-full/management/includes/header.php
cat > app-full/management/includes/header.php << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>PhishGuard BASIC</title>
    <link rel="stylesheet" href="/management/assets/css/main.css">
</head>
<body>
    <nav>
        <h1>PhishGuard</h1>
        <a href="/management/logout.php">Déconnexion</a>
    </nav>
    <main>
EOF

# app-full/management/includes/footer.php
cat > app-full/management/includes/footer.php << 'EOF'
    </main>
    <footer>
        <p>&copy; 2024 PhishGuard BASIC</p>
    </footer>
</body>
</html>
EOF

echo -e "${GREEN}✅ Fichiers PHP créés${NC}"

# ============================================================================
# 5. SCRIPTS
# ============================================================================

echo -e "${BLUE}🔧 Création des scripts...${NC}"

# scripts/install.sh
cat > scripts/install.sh << 'EOF'
#!/bin/bash
echo "🚀 Installation de PhishGuard BASIC..."
cp .env.example .env
docker-compose build
docker-compose up -d
echo "✅ Installation terminée!"
echo "📍 Accès: http://localhost/management/"
EOF

chmod +x scripts/install.sh

# scripts/backup.sh
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_FILE="storage/backups/backup-$(date +%Y%m%d-%H%M%S).sql"
docker-compose exec -T db pg_dump -U phishguard phishguard_basic > $BACKUP_FILE
echo "✅ Sauvegarde créée: $BACKUP_FILE"
EOF

chmod +x scripts/backup.sh

echo -e "${GREEN}✅ Scripts créés${NC}"

# ============================================================================
# 6. FICHIERS .gitkeep
# ============================================================================

echo -e "${BLUE}📌 Création des fichiers .gitkeep...${NC}"

touch storage/logs/.gitkeep
touch storage/cache/.gitkeep
touch storage/uploads/.gitkeep
touch storage/backups/.gitkeep
touch storage/reports/.gitkeep
touch storage/sessions/.gitkeep
touch storage/tmp/.gitkeep
touch storage/ssl/.gitkeep

echo -e "${GREEN}✅ Fichiers .gitkeep créés${NC}"

# ============================================================================
# 7. DOCUMENTATION
# ============================================================================

echo -e "${BLUE}📚 Création de la documentation...${NC}"

cat > README.md << 'EOF'
# PhishGuard BASIC

Plateforme de simulation de phishing pour la formation en cybersécurité.

## Installation Rapide

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

## Accès

- URL: http://localhost/management/
- Admin: admin@phishguard.local / admin123

## Documentation

Voir le dossier `docs/` pour la documentation complète.
EOF

echo -e "${GREEN}✅ Documentation créée${NC}"

# ============================================================================
# RÉSUMÉ
# ============================================================================

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Arborescence complète créée avec succès!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📁 Structure créée:${NC}"
echo "   ├── Configuration Docker (docker-compose.yml, Dockerfile)"
echo "   ├── Application PHP (app-full/management/)"
echo "   ├── Configuration services (docker/)"
echo "   ├── Stockage données (storage/)"
echo "   ├── Scripts utilitaires (scripts/)"
echo "   └── Documentation (docs/)"
echo ""
echo -e "${BLUE}🚀 Prochaines étapes:${NC}"
echo "   1. cp .env.example .env"
echo "   2. nano .env  # Configurer les mots de passe"
echo "   3. ./scripts/install.sh"
echo "   4. Accéder à http://localhost/management/"
echo ""
echo -e "${GREEN}✨ Prêt pour l'installation!${NC}"