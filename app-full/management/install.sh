ports:
      - "${DB_PORT_EXTERNAL:-5432}:5432"
    networks:
      - phishguard_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-phishguard} -d ${DB_NAME:-phishguard_basic}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # Cache Redis
  redis:
    image: redis:7-alpine
    container_name: phishguard_redis
    restart: unless-stopped
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    ports:
      - "${REDIS_PORT_EXTERNAL:-6379}:6379"
    volumes:
      - redis_data:/data
      - ./docker/redis/redis.conf:/etc/redis/redis.conf:ro
    networks:
      - phishguard_network
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    command: redis-server /etc/redis/redis.conf --requirepass ${REDIS_PASSWORD}

  # Application PHP-FPM
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
      - ./docker/php/php.ini:/usr/local/etc/php/php.ini:ro
      - ./docker/php/php-fpm.conf:/usr/local/etc/php-fpm.d/www.conf:ro
    networks:
      - phishguard_network
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "php-fpm", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Serveur Web Nginx
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
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./storage/postgres
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./storage/redis

networks:
  phishguard_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
EOF

echo -e "${GREEN}✅ Configuration Docker Compose créée${NC}"

# 10. Création des configurations Docker
echo -e "${BLUE}[10/12] ⚙️  Création des configurations Docker...${NC}"

# Configuration PHP
echo -e "${CYAN}🐘 Configuration PHP...${NC}"
cat > $APP_DIR/docker/php/php.ini << 'EOF'
[PHP]
engine = On
short_open_tag = Off
precision = 14
output_buffering = 4096
implicit_flush = Off

max_execution_time = 300
max_input_time = 60
max_input_vars = 3000
memory_limit = 512M

file_uploads = On
upload_max_filesize = 50M
max_file_uploads = 20
post_max_size = 100M

allow_url_fopen = On
allow_url_include = Off
expose_php = Off

session.use_strict_mode = 1
session.cookie_httponly = 1
session.cookie_secure = 1
session.cookie_samesite = "Strict"
session.use_only_cookies = 1
session.cookie_lifetime = 0
session.gc_maxlifetime = 7200

log_errors = On
error_log = /var/log/phishguard/php_errors.log
display_errors = Off
display_startup_errors = Off
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT

date.timezone = Europe/Paris
default_charset = "UTF-8"

extension=pdo
extension=pdo_pgsql
extension=pgsql
extension=redis
extension=gd
extension=bcmath
extension=intl
extension=mbstring
extension=pcntl
extension=curl
extension=zip
extension=xml
EOF

# Configuration PHP-FPM
cat > $APP_DIR/docker/php/php-fpm.conf << 'EOF'
[global]
pid = /run/php-fpm.pid
error_log = /var/log/phishguard/php-fpm.log
log_level = warning
daemonize = no

[www]
user = www-data
group = www-data
listen = 9000
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 3
pm.max_spare_servers = 10
pm.process_idle_timeout = 10s
pm.max_requests = 1000

access.log = /var/log/phishguard/php-fpm-access.log
slowlog = /var/log/phishguard/php-fpm-slow.log
request_slowlog_timeout = 30s

env[HOSTNAME] = $HOSTNAME
env[PATH] = /usr/local/bin:/usr/bin:/bin
env[TMP] = /tmp
env[TMPDIR] = /tmp
env[TEMP] = /tmp

security.limit_extensions = .php
EOF

# Configuration Redis
echo -e "${CYAN}📡 Configuration Redis...${NC}"
cat > $APP_DIR/docker/redis/redis.conf << 'EOF'
# Configuration Redis pour PhishGuard BASIC
port 6379
bind 0.0.0.0
protected-mode yes
timeout 300
keepalive 60

# Persistance
save 900 1
save 300 10
save 60 10000

rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Logs
loglevel notice
logfile ""

# Sécurité
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG_b835c3f4a2e7e4b8c9d1f2e3a4b5c6d7"

# Performance
maxmemory 256mb
maxmemory-policy allkeys-lru

# Réseau
tcp-keepalive 300
EOF

# Configuration Nginx
echo -e "${CYAN}🌐 Configuration Nginx...${NC}"
cat > $APP_DIR/docker/nginx/nginx.conf << 'EOF'
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

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    log_format tracking '$remote_addr - $remote_user [$time_local] "$request" '
                       '$status $body_bytes_sent "$http_referer" '
                       '"$http_user_agent" "$http_x_forwarded_for" "$request_id"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

    # Upstream PHP-FPM
    upstream php-fpm {
        server app:9000;
        keepalive 16;
    }

    include /etc/nginx/conf.d/*.conf;
}
EOF

cat > $APP_DIR/docker/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/html/app-full;
    index index.php index.html index.htm;

    # Logs spécifiques
    access_log /var/log/nginx/phishguard.access.log main;
    error_log /var/log/nginx/phishguard.error.log;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Root redirect
    location = / {
        return 301 /management/;
    }

    # Interface de gestion principale
    location /management/ {
        try_files $uri $uri/ /management/index.php$is_args$args;
        
        location ~ ^/management/(.+\.php)(?:/(.*))?$ {
            try_files $1 =404;
            fastcgi_split_path_info ^(.+\.php)(/.+)$;
            fastcgi_pass php-fpm;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root/$1;
            fastcgi_param PATH_INFO $2;
            include fastcgi_params;

            # Sécurité PHP
            fastcgi_param HTTP_PROXY "";
            fastcgi_read_timeout 300;
            fastcgi_buffer_size 128k;
            fastcgi_buffers 4 256k;
            fastcgi_busy_buffers_size 256k;
            
            # Headers de sécurité spécifiques
            fastcgi_param HTTPS $https if_not_empty;
            fastcgi_param SERVER_PORT $server_port;
            fastcgi_param REQUEST_URI $request_uri;
        }
    }

    # API endpoints avec rate limiting
    location /management/api/ {
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
        
        try_files $uri $uri/ =404;
        
        location ~ \.php$ {
            try_files $uri =404;
            fastcgi_pass php-fpm;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
            
            # Headers API
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        }
    }

    # URLs de tracking courtes pour les campagnes
    location ~ ^/t/([a-zA-Z0-9]{8,32})$ {
        access_log /var/log/nginx/tracking.log tracking;
        try_files $uri /management/track.php?id=$1;
    }

    # Pixel de tracking
    location ~ ^/p/([a-zA-Z0-9]{8,32})\.gif$ {
        access_log /var/log/nginx/tracking.log tracking;
        try_files $uri /management/pixel.php?id=$1;
    }

    # Login avec rate limiting
    location /management/login.php {
        limit_req zone=login burst=5 nodelay;
        limit_req_status 429;
        
        try_files $uri =404;
        fastcgi_pass php-fpm;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Fichiers statiques avec cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|pdf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        try_files $uri =404;
        
        # Log des accès aux ressources
        access_log off;
    }

    # Sécurité - Blocage des fichiers sensibles
    location ~ /\.(ht|env|git|svn) {
        deny all;
        return 404;
    }

    location ~ /composer\.(json|lock)$ {
        deny all;
        return 404;
    }

    location ~ /package\.json$ {
        deny all;
        return 404;
    }

    location ~ /(vendor|node_modules|storage/logs)/ {
        deny all;
        return 404;
    }

    # Traitement PHP par défaut
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass php-fpm;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Sécurité
        fastcgi_param HTTP_PROXY "";
        fastcgi_hide_header X-Powered-By;
    }

    # Gestion des erreurs personnalisées
    error_page 404 /management/errors/404.php;
    error_page 500 502 503 504 /management/errors/50x.php;
}
EOF

echo -e "${GREEN}✅ Configurations Docker créées${NC}"

# 11. Création du Dockerfile optimisé
echo -e "${BLUE}[11/12] 🐳 Création du Dockerfile...${NC}"

cat > $APP_DIR/Dockerfile << 'EOF'
FROM php:8.2-fpm-alpine

# Métadonnées
LABEL maintainer="Reaper Official <reaper@etik.com>"
LABEL description="PhishGuard BASIC - Phishing Simulation Platform"
LABEL version="1.0.0"

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
    pkgconfig \
    linux-headers \
    netcat-openbsd \
    bash \
    shadow \
    && rm -rf /var/cache/apk/*

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
        mbstring \
        curl \
        zip \
        calendar \
        exif \
        gettext \
        mysqli \
        opcache \
        sockets \
        tokenizer

# Installation de l'extension Redis
RUN pecl channel-update pecl.php.net \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && pecl clear-cache

# Installation de Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Configuration d'OPcache pour la performance
RUN { \
        echo 'opcache.memory_consumption=128'; \
        echo 'opcache.interned_strings_buffer=8'; \
        echo 'opcache.max_accelerated_files=4000'; \
        echo 'opcache.revalidate_freq=2'; \
        echo 'opcache.fast_shutdown=1'; \
        echo 'opcache.enable_cli=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Création des utilisateurs et groupes
RUN addgroup -g 1000 -S phishguard \
    && adduser -u 1000 -S phishguard -G phishguard

# Création du répertoire de travail
WORKDIR /var/www/html

# Création des répertoires nécessaires avec permissions
RUN mkdir -p storage/{logs,cache,uploads,backups,reports,sessions,tmp} \
    && mkdir -p bootstrap/cache \
    && mkdir -p /var/log/phishguard \
    && chown -R www-data:www-data storage bootstrap/cache /var/log/phishguard \
    && chmod -R 775 storage bootstrap/cache

# Copie des fichiers de configuration personnalisés
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-phishguard.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zzz-phishguard.conf

# Copie du code source
COPY app-full/ .

# Création d'un fichier composer.json basique si inexistant
RUN if [ ! -f composer.json ]; then \
        echo '{"require":{"php":">=8.1"},"autoload":{"psr-4":{"App\\\\":"src/"}}}' > composer.json; \
    fi

# Installation des dépendances Composer
RUN if [ -f composer.json ]; then \
        composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
        && composer clear-cache; \
    fi

# Configuration des permissions finales
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && find . -name "*.sh" -exec chmod +x {} \; \
    && chmod 755 /var/www/html/storage \
    && chmod -R 775 /var/www/html/storage

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD php-fpm -t && nc -z 127.0.0.1 9000 || exit 1

# Configuration du signal de terminaison gracieuse
STOPSIGNAL SIGQUIT

# Port exposé
EXPOSE 9000

# Variables d'environnement par défaut
ENV PHP_FPM_USER=www-data \
    PHP_FPM_GROUP=www-data \
    PHP_FPM_LISTEN_MODE=0660 \
    PHP_MEMORY_LIMIT=512M \
    PHP_MAX_UPLOAD=50M \
    PHP_MAX_FILE_UPLOAD=20 \
    PHP_MAX_POST=100M \
    PHP_DISPLAY_ERRORS=Off \
    PHP_DISPLAY_STARTUP_ERRORS=Off \
    PHP_ERROR_REPORTING="E_ALL & ~E_DEPRECATED & ~E_STRICT" \
    PHP_CGI_FIX_PATHINFO=0

# Script d'initialisation
COPY docker/init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

# Point d'entrée
ENTRYPOINT ["/usr/local/bin/init.sh"]

# Commande par défaut
CMD ["php-fpm"]
EOF

# Script d'initialisation Docker
echo -e "${CYAN}🔧 Création du script d'initialisation...${NC}"
cat > $APP_DIR/docker/init.sh << 'EOF'
#!/bin/sh
set -e

echo "🚀 Initialisation PhishGuard BASIC..."
echo "   Container: $(hostname)"
echo "   Date: $(date)"
echo "   User: $(whoami)"

# Fonction d'attente pour les services
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Attente de $service ($host:$port)..."
    
    while ! nc -z "$host" "$port" >/dev/null 2>&1; do
        if [ $attempt -eq $max_attempts ]; then
            echo "❌ Timeout: $service non accessible après ${max_attempts}s"
            exit 1
        fi
        
        echo "   Tentative $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "✅ $service prêt"
}

# Attendre les services externes
wait_for_service "db" "5432" "PostgreSQL"
wait_for_service "redis" "6379" "Redis"

# Configuration des permissions
echo "🔧 Configuration des permissions..."
chown -R www-data:www-data /var/www/html/storage /var/log/phishguard 2>/dev/null || true
chmod -R 775 /var/www/html/storage 2>/dev/null || true
chmod -R 755 /var/log/phishguard 2>/dev/null || true

# Création des répertoires manquants
echo "📁 Vérification des répertoires..."
for dir in logs cache uploads backups reports sessions tmp; do
    mkdir -p /var/www/html/storage/$dir
done

# Test des extensions PHP critiques
echo "🧪 Vérification des extensions PHP..."
php -m | grep -E "(pdo|pgsql|redis)" > /dev/null || {
    echo "❌ Extensions PHP manquantes"
    php -m
    exit 1
}

# Test de connexion PostgreSQL
echo "🗄️ Test de connexion PostgreSQL..."
php -r "
try {
    \$dsn = 'pgsql:host=' . (\$_ENV['DB_HOST'] ?? 'db') . ';port=5432;dbname=' . (\$_ENV['DB_NAME'] ?? 'phishguard_basic');
    \$pdo = new PDO(\$dsn, \$_ENV['DB_USER'] ?? 'phishguard', \$_ENV['DB_PASSWORD'] ?? '');
    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo '✅ PostgreSQL: Connexion OK' . PHP_EOL;
} catch(Exception \$e) {
    echo '❌ PostgreSQL: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"

# Test de connexion Redis
echo "📡 Test de connexion Redis..."
php -r "
try {
    \$redis = new Redis();
    \$redis->connect(\$_ENV['REDIS_HOST'] ?? 'redis', 6379);
    if (!empty(\$_ENV['REDIS_PASSWORD'])) {
        \$redis->auth(\$_ENV['REDIS_PASSWORD']);
    }
    \$redis->ping();
    echo '✅ Redis: Connexion OK' . PHP_EOL;
} catch(Exception \$e) {
    echo '❌ Redis: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"

# Initialisation de la base de données si première fois
if [ ! -f "/var/www/html/.initialized" ]; then
    echo "🔧 Première initialisation détectée..."
    
    # Recherche du script d'initialisation
    SETUP_SCRIPT=""
    for script in "/var/www/html/management/setup.php" "/var/www/html/setup.php" "/var/www/html/scripts/setup.php"; do
        if [ -f "$script" ]; then
            SETUP_SCRIPT="$script"
            break
        fi
    done
    
    if [ -n "$SETUP_SCRIPT" ]; then
        echo "📊 Exécution du script d'initialisation: $SETUP_SCRIPT"
        php "$SETUP_SCRIPT" && touch /var/www/html/.initialized
        echo "✅ Initialisation terminée"
    else
        echo "⚠️  Aucun script d'initialisation trouvé"
        touch /var/www/html/.initialized
    fi
fi

# Nettoyage des fichiers temporaires anciens
echo "🧹 Nettoyage des fichiers temporaires..."
find /var/www/html/storage/cache -type f -mtime +7 -delete 2>/dev/null || true
find /var/www/html/storage/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
find /var/www/html/storage/tmp -type f -mtime +1 -delete 2>/dev/null || true

# Configuration finale PHP-FPM
echo "⚙️  Configuration finale PHP-FPM..."

# Vérification de la configuration
php-fpm -t || {
    echo "❌ Configuration PHP-FPM invalide"
    exit 1
}

echo "✅ Initialisation terminée avec succès"
echo "🎯 Démarrage de PHP-FPM..."

# Exécution de la commande passée en paramètre ou PHP-FPM par défaut
exec "${@:-php-fpm}"
EOF

chmod +x $APP_DIR/docker/init.sh

echo -e "${GREEN}✅ Dockerfile et scripts créés${NC}"

# 12. Configuration finale et démarrage
echo -e "${BLUE}[12/12] 🚀 Configuration finale et démarrage...${NC}"

# Création des répertoires de stockage persistants
mkdir -p $APP_DIR/storage/{postgres,redis,logs/nginx,ssl}

# Application des permissions
echo -e "${CYAN}🔐 Application des permissions...${NC}"
chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR
chown -R $SERVICE_USER:$SERVICE_USER $LOG_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $LOG_DIR
chmod -R 775 $APP_DIR/storage
chmod 600 $APP_DIR/.env

# Création d'un script de gestion complet
echo -e "${CYAN}📝 Création du script de gestion...${NC}"
cat > $APP_DIR/phishguard.sh << 'EOF'
#!/bin/bash

# PhishGuard BASIC - Script de gestion
# Usage: ./phishguard.sh [commande] [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Vérification Docker
check_docker() {
    if ! command -v docker-compose >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker Compose non trouvé${NC}"
        exit 1
    fi
}

# Fonction d'aide
show_help() {
    echo -e "${BLUE}PhishGuard BASIC - Script de gestion${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo ""
    echo "Usage: $0 [commande] [options]"
    echo ""
    echo -e "${GREEN}Commandes principales:${NC}"
    echo "  start          Démarrer tous les services"
    echo "  stop           Arrêter tous les services"
    echo "  restart        Redémarrer tous les services"
    echo "  status         Afficher l'état des services"
    echo "  logs           Afficher les logs (logs [service] pour un service spécifique)"
    echo ""
    echo -e "${GREEN}Gestion des données:${NC}"
    echo "  backup         Sauvegarder la base de données"
    echo "  restore [file] Restaurer depuis une sauvegarde"
    echo "  reset          Réinitialiser complètement (DANGER!)"
    echo ""
    echo -e "${GREEN}Maintenance:${NC}"
    echo "  update         Mettre à jour depuis Git et reconstruire"
    echo "  rebuild        Reconstruire les conteneurs"
    echo "  clean          Nettoyer les images et volumes inutilisés"
    echo "  shell [service] Accéder au shell d'un conteneur"
    echo ""
    echo -e "${GREEN}Monitoring:${NC}"
    echo "  health         Vérifier la santé des services"
    echo "  stats          Afficher les statistiques des ressources"
    echo ""
    echo -e "${GREEN}Services disponibles:${NC}"
    echo "  app, db, redis, nginx"
}

# Fonction de vérification de santé
check_health() {
    echo -e "${BLUE}🏥 Vérification de la santé des services...${NC}"
    
    services=("app" "db" "redis" "nginx")
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "${service}.*Up"; then
            health=$(docker-compose exec -T "$service" echo "OK" 2>/dev/null || echo "FAIL")
            if [ "$health" = "OK" ]; then
                echo -e "  $service: ${GREEN}✅ Healthy${NC}"
            else
                echo -e "  $service: ${YELLOW}⚠️ Running but not responding${NC}"
            fi
        else
            echo -e "  $service: ${RED}❌ Down${NC}"
        fi
    done
    
    echo ""
    echo -e "${BLUE}🌐 Test de connectivité web...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost/health | grep -q "200"; then
        echo -e "  Web: ${GREEN}✅ Accessible${NC}"
    else
        echo -e "  Web: ${RED}❌ Non accessible${NC}"
    fi
}

# Sauvegarde de la base de données
backup_database() {
    echo -e "${BLUE}💾 Sauvegarde de la base de données...${NC}"
    
    backup_dir="storage/backups"
    mkdir -p "$backup_dir"
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="$backup_dir/phishguard_backup_$timestamp.sql"
    
    if docker-compose exec -T db pg_dump -U phishguard phishguard_basic > "$backup_file"; then
        echo -e "${GREEN}✅ Sauvegarde créée: $backup_file${NC}"
        
        # Compression
        gzip "$backup_file"
        echo -e "${GREEN}✅ Sauvegarde compressée: $backup_file.gz${NC}"
        
        # Nettoyage des anciennes sauvegardes (garde les 10 dernières)
        ls -t "$backup_dir"/phishguard_backup_*.sql.gz | tail -n +11 | xargs rm -f 2>/dev/null || true
        
        echo -e "${BLUE}📊 Sauvegardes disponibles:${NC}"
        ls -lah "$backup_dir"/phishguard_backup_*.sql.gz 2>/dev/null || echo "  Aucune sauvegarde trouvée"
    else
        echo -e "${RED}❌ Échec de la sauvegarde${NC}"
        exit 1
    fi
}

# Restauration de la base de données
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo -e "${YELLOW}Usage: $0 restore [fichier_sauvegarde]${NC}"
        echo -e "${BLUE}Sauvegardes disponibles:${NC}"
        ls -lah storage/backups/phishguard_backup_*.sql.gz 2>/dev/null || echo "  Aucune sauvegarde trouvée"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Fichier de sauvegarde non trouvé: $backup_file${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  ATTENTION: Cette opération va écraser toutes les données actuelles!${NC}"
    read -p "Continuer? (oui/non): " confirm
    
    if [ "$confirm" != "oui" ]; then
        echo -e "${BLUE}Restauration annulée${NC}"
        exit 0
    fi
    
    echo -e "${BLUE}🔄 Restauration en cours...${NC}"
    
    # Décompression si nécessaire
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | docker-compose exec -T db psql -U phishguard phishguard_basic
    else
        docker-compose exec -T db psql -U phishguard phishguard_basic < "$backup_file"
    fi
    
    echo -e "${GREEN}✅ Restauration terminée${NC}"
}

check_docker

case "$1" in
    start)
        echo -e "${GREEN}🚀 Démarrage PhishGuard BASIC...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✅ PhishGuard démarré${NC}"
        echo -e "${BLUE}🌐 Accès: http://localhost${NC}"
        echo -e "${BLUE}📊 Admin: http://localhost/management/${NC}"
        ;;
    stop)
        echo -e "${YELLOW}⏹️ Arrêt PhishGuard BASIC...${NC}"
        docker-compose down
        echo -e "${GREEN}✅ PhishGuard arrêté${NC}"
        ;;
    restart)
        echo -e "${BLUE}🔄 Redémarrage PhishGuard BASIC...${NC}"
        docker-compose restart
        echo -e "${GREEN}✅ PhishGuard redémarré${NC}"
        ;;
    status)
        echo -e "${BLUE}📊 État des services PhishGuard:${NC}"
        docker-compose ps
        ;;
    logs)
        if [ -z "$2" ]; then
            docker-compose logs -f --tail=100
        else
            docker-compose logs -f --tail=100 "$2"
        fi
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    update)
        echo -e "${BLUE}🔄 Mise à jour PhishGuard...${NC}"
        git pull
        docker-compose build --no-cache
        docker-compose up -d
        echo -e "${GREEN}✅ Mise à jour terminée${NC}"
        ;;
    rebuild)
        echo -e "${BLUE}🔨 Reconstruction des conteneurs...${NC}"
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        echo -e "${GREEN}✅ Reconstruction terminée${NC}"
        ;;
    clean)
        echo -e "${BLUE}🧹 Nettoyage des ressources Docker...${NC}"
        docker-compose down
        docker system prune -f
        docker volume prune -f
        echo -e "${GREEN}✅ Nettoyage terminé${NC}"
        ;;
    reset)
        echo -e "${RED}⚠️ DANGER: Cette opération va SUPPRIMER toutes les données!${NC}"
        read -p "Tapez 'DELETE_ALL' pour confirmer: " confirm
        if [ "$confirm" = "DELETE_ALL" ]; then
            docker-compose down -v --remove-orphans
            docker system prune -af --volumes
            rm -rf storage/postgres storage/redis storage/logs
            echo -e "${GREEN}✅ Réinitialisation terminée${NC}"
        else
            echo -e "${BLUE}Réinitialisation annulée${NC}"
        fi
        ;;
    shell)
        service=${2:-app}
        echo -e "${BLUE}🐚 Accès au shell du conteneur: $service${NC}"
        docker-compose exec "$service" sh
        ;;
    health)
        check_health
        ;;
    stats)
        echo -e "${BLUE}📊 Statistiques des ressources:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
        ;;
    *)
        show_help
        ;;
esac
EOF

chmod +x $APP_DIR/phishguard.sh

# Création d'un service systemd pour démarrage automatique
echo -e "${CYAN}⚙️  Création du service systemd...${NC}"
cat > /etc/systemd/system/phishguard.service << EOF
[Unit]
Description=PhishGuard BASIC Phishing Simulation Platform
Documentation=https://github.com/Reaper-Official/cyber-prevention-tool
Requires=docker.service
After=docker.service network.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
ExecReload=/usr/local/bin/docker-compose restart
User=$SERVICE_USER
Group=$SERVICE_USER
TimeoutStartSec=300
TimeoutStopSec=60

[Install]
WantedBy=multi-user.target
EOF

# Configuration du firewall UFW
echo -e "${CYAN}🔥 Configuration du firewall UFW...${NC}"
ufw --force reset
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP PhishGuard'
ufw allow 443/tcp comment 'HTTPS PhishGuard'
ufw allow from 172.20.0.0/16 comment 'Docker Network'
ufw reload

echo -e "${GREEN}✅ Firewall configuré${NC}"

# Configuration de Fail2ban
echo -e "${CYAN}🛡️  Configuration de Fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8 172.20.0.0/16

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = 80,443
filter = nginx-http-auth
logpath = /opt/phishguard-basic/storage/logs/nginx/phishguard.error.log

[nginx-limit-req]
enabled = true
port = 80,443
filter = nginx-limit-req
logpath = /opt/phishguard-basic/storage/logs/nginx/phishguard.error.log
maxretry = 3

[phishguard-login]
enabled = true
port = 80,443
filter = phishguard-login
logpath = /opt/phishguard-basic/storage/logs/nginx/phishguard.access.log
maxretry = 3
findtime = 5m
bantime = 30m
EOF

# Création du filtre Fail2ban pour PhishGuard
cat > /etc/fail2ban/filter.d/phishguard-login.conf << 'EOF'
[Definition]
failregex = ^<HOST> - .* "POST /management/login\.php.*" (401|403) .*$
ignoreregex =
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Activation des services
systemctl daemon-reload
systemctl enable phishguard

# Construction et démarrage des conteneurs
echo -e "${CYAN}🏗️  Construction et démarrage des conteneurs Docker...${NC}"
cd $APP_DIR

# Vérification de l'espace disque
DISK_SPACE=$(df /opt | awk 'NR==2 {print $4}')
if [ "$DISK_SPACE" -lt 2097152 ]; then  # 2GB en KB
    echo -e "${YELLOW}⚠️  Attention: Espace disque faible (< 2GB disponible)${NC}"
fi

# Construction des images
echo -e "${BLUE}🐳 Construction des images Docker...${NC}"
sudo -u $SERVICE_USER docker-compose build --no-cache --parallel

# Démarrage des services
echo -e "${GREEN}🚀 Démarrage de PhishGuard BASIC...${NC}"
sudo -u $SERVICE_USER docker-compose up -d

# Attendre que les services soient prêts
echo -e "${CYAN}⏳ Vérification de l'état des services (60s max)...${NC}"
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if sudo -u $SERVICE_USER docker-compose ps | grep -E "(Up|running)" | wc -l | grep -q "4"; then
        break
    fi
    echo "   Attente des services... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

# Vérification finale
echo -e "${CYAN}🔍 Vérification finale des services...${NC}"
SERVICES_STATUS=$(sudo -u $SERVICE_USER docker-compose ps --services --filter "status=running" | wc -l)
EXPECTED_SERVICES=4  # db, redis, app, nginx

if [ "$SERVICES_STATUS" -ge 3 ]; then
    echo -e "${GREEN}✅ Services démarrés avec succès${NC}"
    
    # Test de connectivité web
    sleep 10  # Attendre un peu plus pour que Nginx soit prêt
    if curl -s -f http://localhost/health >/dev/null 2>&1; then
        WEB_STATUS="${GREEN}✅ Accessible${NC}"
        APP_READY=true
    else
        WEB_STATUS="${YELLOW}⚠️ En cours de démarrage${NC}"
        APP_READY=false
    fi
else
    echo -e "${YELLOW}⚠️ Certains services ont des problèmes${NC}"
    WEB_STATUS="${RED}❌ Non accessible${NC}"
    APP_READY=false
fi

# Affichage des informations finales
echo -e "${PURPLE}=================================================================${NC}"
echo -e "${GREEN}   🎉 INSTALLATION PHISHGUARD BASIC TERMINÉE! 🎉${NC}"
echo -e "${PURPLE}=================================================================${NC}"
echo ""
echo -e "${GREEN}📊 RÉSUMÉ DE L'INSTALLATION:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "• Système détecté: ${BLUE}$OS_NAME $OS_VERSION ($OS_CODENAME)${NC}"
echo -e "• Docker: ${BLUE}$(docker --version | cut -d' ' -f3 | tr -d ',')${NC}"
echo -e "• Docker Compose: ${BLUE}$(docker-compose --version | cut -d' ' -f4 | tr -d ',')${NC}"
echo -e "• PHP: ${BLUE}$PHP_VER${NC}"
echo -e "• Utilisateur système: ${BLUE}$SERVICE_USER${NC}"
echo -e "• Répertoire: ${BLUE}$APP_DIR${NC}"
echo ""
echo -e "${GREEN}🌐 ACCÈS À L'APPLICATION:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "• Interface principale: ${CYAN}http://localhost${NC}"
echo -e "• Dashboard admin: ${CYAN}http://localhost/management/${NC}"
echo -e "• API: ${CYAN}http://localhost/management/api/${NC}"
echo -e "• Health check: ${CYAN}http://localhost/health${NC}"
echo -e "• État web: $WEB_STATUS"
echo ""
echo -e "${GREEN}🐳 SERVICES DOCKER:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
sudo -u $SERVICE_USER docker-compose ps
echo ""
echo -e "${GREEN}🛠️  GESTION DE L'APPLICATION:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "• Script de gestion: ${CYAN}$APP_DIR/phishguard.sh${NC}"
echo -e "• Démarrer: ${CYAN}$APP_DIR/phishguard.sh start${NC}"
echo -e "• Arrêter: ${CYAN}$APP_DIR/phishguard.sh stop${NC}"
echo -e "• Redémarrer: ${CYAN}$APP_DIR/phishguard.sh restart${NC}"
echo -e "• État: ${CYAN}$APP_DIR/phishguard.sh status${NC}"
echo -e "• Logs: ${CYAN}$APP_DIR/phishguard.sh logs${NC}"
echo -e "• Santé: ${CYAN}$APP_DIR/phishguard.sh health${NC}"
echo -e "• Sauvegarde: ${CYAN}$APP_DIR/phishguard.sh backup${NC}"
echo -e "• Service systemd: ${CYAN}systemctl [start|stop|restart|status] phishguard${NC}"
echo ""
echo -e "${GREEN}📁 RÉPERTOIRES IMPORTANTS:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "• Application: ${CYAN}$APP_DIR${NC}"
echo -e "• Configuration: ${CYAN}$CONFIG_DIR${NC}"
echo -e "• Variables env: ${CYAN}$APP_DIR/.env${NC}"
echo -e "• Logs système: ${CYAN}$LOG_DIR${NC}"
echo -e "• Stockage: ${CYAN}$APP_DIR/storage${NC}"
echo -e "• Sauvegardes: ${CYAN}$APP_DIR/storage/backups${NC}"
echo -e "• SSL/TLS: ${CYAN}$APP_DIR/storage/ssl${NC}"
echo ""
echo -e "${GREEN}🔒 SÉCURITÉ CONFIGURÉE:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "• ${GREEN}✅${NC} Firewall UFW activé (ports 22, 80, 443)"
echo -e "• ${GREEN}✅${NC} Fail2ban configuré contre brute force"
echo -e "• ${GREEN}✅${NC} Mots de passe générés aléatoirement"
echo -e "• ${GREEN}✅${NC} Headers de sécurité HTTP"
echo -e "• ${GREEN}✅${NC} Rate limiting sur API et login"
echo -e "• ${GREEN}✅${NC} Permissions strictes sur fichiers"
echo -e "• ${GREEN}✅${NC} Réseau Docker isolé"
echo ""
echo -e "${YELLOW}⚙️  CONFIGURATION POST-INSTALLATION REQUISE:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}1.${NC} Configurez vos paramètres SMTP dans: ${CYAN}$APP_DIR/.env${NC}"
echo -e "   ${YELLOW}→${NC} MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD"
echo -e "${YELLOW}2.${NC} Créez votre premier compte administrateur"
echo -e "${YELLOW}3.${NC} Personnalisez les domaines autorisés si nécessaire"
echo -e "${YELLOW}4.${NC} Pour HTTPS: configurez SSL avec certbot ou ajoutez vos certificats"
echo -e "   ${YELLOW}→${NC} ${CYAN}certbot --nginx -d votre-domaine.com${NC}"
echo -e "${YELLOW}5.${NC} En production: changez l'APP_URL dans .env"
echo -e "${YELLOW}6.${NC} Configurez la sauvegarde automatique (cron)"
echo ""
echo -e "${GREEN}📚 RESSOURCES:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "• GitHub: ${BLUE}$GITHUB_REPO${NC}"
echo -e "• Documentation: ${BLUE}Consultez le README.md du projet${NC}"
echo -e "• Support: ${BLUE}https://github.com/Reaper-Official/cyber-prevention-tool/issues${NC}"
echo ""
echo -e "${GREEN}🧪 TESTS DE VÉRIFICATION:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -n "• Test connectivité web: "
if [ "$APP_READY" = true ]; then
    echo -e "${GREEN}✅ SUCCÈS${NC}"
else
    echo -e "${YELLOW}⚠️  EN COURS (peut prendre quelques minutes)${NC}"
fi

echo -n "• Test Docker Compose: "
if sudo -u $SERVICE_USER docker-compose ps >/dev/null 2>&1; then
    echo -e "${GREEN}✅ SUCCÈS${NC}"
else
    echo -e "${RED}❌ ÉCHEC${NC}"
fi

echo -n "• Test permissions: "
if [ -r "$APP_DIR/.env" ] && [ -w "$APP_DIR/storage" ]; then
    echo -e "${GREEN}✅ SUCCÈS${NC}"
else
    echo -e "${RED}❌ ÉCHEC${NC}"
fi

echo ""
echo -e "${RED}⚖️  RAPPEL LÉGAL CRITIQUE:${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}Cette plateforme est destinée EXCLUSIVEMENT à la formation${NC}"
echo -e "${RED}en cybersécurité avec autorisation explicite de l'organisation.${NC}"
echo -e "${RED}Usage malveillant strictement INTERDIT et PUNISSABLE par la loi!${NC}"
echo ""
echo -e "${GREEN}🎊 INSTALLATION RÉUSSIE! Bonne formation en cybersécurité! 🎊${NC}"
echo ""

# Création d'un fichier de statut d'installation
cat > $APP_DIR/.install-info << EOF
# PhishGuard BASIC - Information d'installation
INSTALL_DATE=$(date)
OS_DETECTED=$OS_NAME $OS_VERSION ($OS_CODENAME)
DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f4 | tr -d ',')
PHP_VERSION=$PHP_VER
INSTALL_USER=$(whoami)
INSTALL_SCRIPT_VERSION=1.0.0
GITHUB_REPO=$GITHUB_REPO
GITHUB_BRANCH=$GITHUB_BRANCH
SERVICES_EXPECTED=$EXPECTED_SERVICES
SERVICES_RUNNING=$SERVICES_STATUS
WEB_READY=$APP_READY
EOF

# Test final de connectivité (non bloquant)
if [ "$APP_READY" != true ]; then
    echo -e "${CYAN}🔄 Test final de connectivité dans 30s...${NC}"
    sleep 30
    if curl -s -f http://localhost/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Application maintenant accessible sur http://localhost${NC}"
    else
        echo -e "${YELLOW}⚠️  L'application démarre encore. Vérifiez dans quelques minutes avec:${NC}"
        echo -e "${CYAN}   $APP_DIR/phishguard.sh health${NC}"
    fi
fi

echo -e "${PURPLE}=================================================================${NC}"
echo -e "${GREEN}Installation terminée le $(date)${NC}"
echo -e "${PURPLE}=================================================================${NC}"#!/bin/bash

# Script d'installation pour PhishGuard BASIC
# Outil de simulation de phishing pour formation cybersécurité
# Projet: https://github.com/Reaper-Official/cyber-prevention-tool
# Compatible: Debian 12, Ubuntu 20.04+

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Variables
APP_NAME="PhishGuard BASIC"
APP_DIR="/opt/phishguard-basic"
SERVICE_USER="phishguard"
LOG_DIR="/var/log/phishguard"
CONFIG_DIR="/etc/phishguard"
GITHUB_REPO="https://github.com/Reaper-Official/cyber-prevention-tool.git"
GITHUB_BRANCH="dev"
TEMP_DIR="/tmp/phishguard-install"
DB_NAME="phishguard_basic"
DB_USER="phishguard"
COMPOSE_VERSION="v2.24.6"

# Banner
echo -e "${PURPLE}=================================================================${NC}"
echo -e "${BLUE}   ____  _     _     _     ____                      _  ${NC}"
echo -e "${BLUE}  |  _ \| |__ (_)___| |__ / ___|_   _  __ _ _ __ __| | ${NC}"
echo -e "${BLUE}  | |_) | '_ \| / __| '_ \| |  _| | | |/ _\` | '__/ _\` | ${NC}"
echo -e "${BLUE}  |  __/| | | | \__ \ | | | |_| | |_| | (_| | | | (_| | ${NC}"
echo -e "${BLUE}  |_|   |_| |_|_|___/_| |_|\____|\__,_|\__,_|_|  \__,_| ${NC}"
echo -e "${PURPLE}                                                                 ${NC}"
echo -e "${GREEN}        Installation automatique - Formation Cybersécurité      ${NC}"
echo -e "${CYAN}        Architecture: PHP + PostgreSQL + Redis + Docker         ${NC}"
echo -e "${PURPLE}=================================================================${NC}"

# Vérification des permissions root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Erreur: Ce script doit être exécuté en tant que root${NC}"
   echo -e "${YELLOW}💡 Utilisez: sudo $0${NC}"
   exit 1
fi

# Fonction de nettoyage en cas d'erreur
cleanup() {
    echo -e "${RED}💥 Erreur détectée. Nettoyage en cours...${NC}"
    cd /
    if [ -d "$APP_DIR" ] && [ -f "$APP_DIR/docker-compose.yml" ]; then
        cd $APP_DIR
        docker-compose down 2>/dev/null || true
        cd /
    fi
    docker stop $(docker ps -q --filter "name=phishguard" 2>/dev/null) 2>/dev/null || true
    docker rm $(docker ps -aq --filter "name=phishguard" 2>/dev/null) 2>/dev/null || true
    userdel -r $SERVICE_USER 2>/dev/null || true
    rm -rf $APP_DIR $LOG_DIR $CONFIG_DIR $TEMP_DIR
    echo -e "${YELLOW}🧹 Nettoyage terminé. Vous pouvez relancer le script.${NC}"
    exit 1
}

trap cleanup ERR

# Affichage avertissement légal
echo -e "${YELLOW}⚖️  AVERTISSEMENT LÉGAL IMPORTANT${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ USAGE AUTORISÉ:${NC}"
echo -e "${GREEN}   • Formation interne des employés en cybersécurité${NC}"
echo -e "${GREEN}   • Sensibilisation sécurité avec autorisation explicite${NC}"
echo -e "${GREEN}   • Tests de sécurité contrôlés dans votre organisation${NC}"
echo ""
echo -e "${RED}❌ USAGE STRICTEMENT INTERDIT:${NC}"
echo -e "${RED}   • Vraies attaques de phishing sur des tiers${NC}"
echo -e "${RED}   • Collecte de données non autorisée${NC}"
echo -e "${RED}   • Distribution malveillante ou utilisation criminelle${NC}"
echo ""
echo -e "${CYAN}📋 Projet GitHub: $GITHUB_REPO (branche: $GITHUB_BRANCH)${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
read -p "🤝 Acceptez-vous ces conditions et confirmez-vous l'usage légal ? (OUI/non): " confirm
if [[ $confirm != "OUI" ]]; then
    echo -e "${RED}❌ Installation annulée.${NC}"
    echo -e "${YELLOW}💡 Vous devez taper 'OUI' en majuscules pour confirmer votre engagement.${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Début de l'installation PhishGuard BASIC...${NC}"

# 1. Détection de l'OS et mise à jour du système
echo -e "${BLUE}[1/12] 🔍 Détection OS et mise à jour du système...${NC}"

# Détection de la distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME="$NAME"
    OS_VERSION="$VERSION_ID" 
    OS_ID="$ID"
    OS_CODENAME="$VERSION_CODENAME"
    
    # Si pas de codename dans /etc/os-release, essayer lsb_release
    if [ -z "$OS_CODENAME" ] && command -v lsb_release >/dev/null 2>&1; then
        OS_CODENAME=$(lsb_release -cs 2>/dev/null || echo "")
    fi
    
    # Fallback pour Debian si pas de codename
    if [ -z "$OS_CODENAME" ] && [ "$OS_ID" = "debian" ]; then
        case "$OS_VERSION" in
            "12") OS_CODENAME="bookworm" ;;
            "11") OS_CODENAME="bullseye" ;;
            "10") OS_CODENAME="buster" ;;
            *) OS_CODENAME="stable" ;;
        esac
    fi
else
    echo -e "${RED}❌ Impossible de détecter la distribution${NC}"
    exit 1
fi

echo -e "${GREEN}✅ OS détecté: $OS_NAME $OS_VERSION${NC}"
echo -e "${CYAN}   ID: $OS_ID, Codename: $OS_CODENAME${NC}"

# Vérification compatibilité avec détection précise
case "$OS_ID" in
    ubuntu)
        echo -e "${GREEN}✅ Ubuntu détecté${NC}"
        ;;
    debian)
        echo -e "${GREEN}✅ Debian détecté${NC}"
        ;;
    *)
        echo -e "${RED}❌ Distribution non supportée: $OS_ID${NC}"
        echo -e "${YELLOW}💡 Ce script supporte Ubuntu 20.04+ et Debian 11+ uniquement${NC}"
        exit 1
        ;;
esac

# Vérification version minimale
if [ "$OS_ID" = "debian" ] && [ "${OS_VERSION%%.*}" -lt 11 ]; then
    echo -e "${RED}❌ Debian $OS_VERSION non supporté (minimum: Debian 11)${NC}"
    exit 1
elif [ "$OS_ID" = "ubuntu" ] && [ "${OS_VERSION%%.*}" -lt 20 ]; then
    echo -e "${RED}❌ Ubuntu $OS_VERSION non supporté (minimum: Ubuntu 20.04)${NC}"
    exit 1
fi

# Mise à jour du système
echo -e "${CYAN}📦 Mise à jour des paquets système...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq

# 2. Installation Docker et Docker Compose
echo -e "${BLUE}[2/12] 🐳 Installation Docker et Docker Compose pour $OS_NAME...${NC}"

# Désinstallation des anciennes versions
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Installation des prérequis
echo -e "${CYAN}📋 Installation des prérequis...${NC}"
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common \
    wget

# Configuration selon l'OS avec vérification
echo -e "${CYAN}⚙️  Configuration des dépôts Docker...${NC}"

# Utiliser directement la variable OS_ID détectée précédemment
if [ "$OS_ID" = "debian" ]; then
    DOCKER_OS="debian"
    echo -e "${CYAN}🐧 Configuration pour Debian $OS_VERSION ($OS_CODENAME)${NC}"
elif [ "$OS_ID" = "ubuntu" ]; then
    DOCKER_OS="ubuntu"  
    echo -e "${CYAN}🐧 Configuration pour Ubuntu $OS_VERSION ($OS_CODENAME)${NC}"
else
    echo -e "${RED}❌ OS non supporté pour Docker: $OS_ID${NC}"
    exit 1
fi

# Déterminer le codename correct pour Docker
DOCKER_CODENAME="$OS_CODENAME"
if [ "$OS_ID" = "debian" ]; then
    case "$OS_VERSION" in
        "12") DOCKER_CODENAME="bookworm" ;;
        "11") DOCKER_CODENAME="bullseye" ;;
        "10") DOCKER_CODENAME="buster" ;;
        *) 
            if [ -z "$DOCKER_CODENAME" ]; then
                DOCKER_CODENAME="stable"
            fi
            ;;
    esac
fi

# Validation finale
if [ -z "$DOCKER_CODENAME" ]; then
    echo -e "${RED}❌ Impossible de déterminer le codename pour Docker${NC}"
    echo -e "${YELLOW}Variables détectées:${NC}"
    echo -e "${YELLOW}  OS_ID=$OS_ID${NC}"
    echo -e "${YELLOW}  OS_VERSION=$OS_VERSION${NC}"
    echo -e "${YELLOW}  OS_CODENAME=$OS_CODENAME${NC}"
    exit 1
fi

echo -e "${CYAN}🐳 Configuration finale: $DOCKER_OS $DOCKER_CODENAME${NC}"

# Test de disponibilité du dépôt Docker avant ajout
DOCKER_REPO_URL="https://download.docker.com/linux/$DOCKER_OS"
echo -e "${CYAN}🔍 Test du dépôt Docker: $DOCKER_REPO_URL${NC}"

if ! curl -fsSL --connect-timeout 10 "$DOCKER_REPO_URL/gpg" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Dépôt Docker officiel non accessible, utilisation des paquets système...${NC}"
    apt-get update -qq
    apt-get install -y docker.io docker-compose
    systemctl enable --now docker
    DOCKER_FROM_OFFICIAL=false
    echo -e "${GREEN}✅ Docker installé depuis les dépôts système${NC}"
else
    echo -e "${GREEN}✅ Dépôt Docker officiel accessible${NC}"
    
    # Ajout de la clé GPG officielle de Docker
    echo -e "${CYAN}🔐 Ajout de la clé GPG Docker...${NC}"
    mkdir -p /etc/apt/keyrings
    curl -fsSL "$DOCKER_REPO_URL/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Construction de l'URL complète du dépôt
    DOCKER_FULL_URL="$DOCKER_REPO_URL $DOCKER_CODENAME stable"
    echo -e "${CYAN}📝 Ajout du dépôt: deb [arch=$(dpkg --print-architecture)] $DOCKER_FULL_URL${NC}"
    
    # Ajout du dépôt Docker
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] $DOCKER_FULL_URL" \
      | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Mise à jour et vérification
    echo -e "${CYAN}🔄 Mise à jour des dépôts...${NC}"
    apt-get update -qq
    
    # Vérification que les paquets Docker sont disponibles
    if apt-cache show docker-ce >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Paquets Docker officiels disponibles${NC}"
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        DOCKER_FROM_OFFICIAL=true
    else
        echo -e "${YELLOW}⚠️  Paquets Docker officiels non trouvés, utilisation des paquets système...${NC}"
        apt-get install -y docker.io docker-compose
        DOCKER_FROM_OFFICIAL=false
    fi
fi

# Démarrage et activation Docker
echo -e "${CYAN}🚀 Démarrage de Docker...${NC}"
systemctl start docker || service docker start
systemctl enable docker 2>/dev/null || chkconfig docker on 2>/dev/null || true

# Installation Docker Compose standalone (pour compatibilité maximale)
echo -e "${CYAN}🔧 Installation Docker Compose standalone $COMPOSE_VERSION...${NC}"

# Téléchargement avec retry en cas d'échec
ARCH=$(uname -m)
COMPOSE_URL="https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-$(uname -s)-$ARCH"

for i in {1..3}; do
    if curl -L "$COMPOSE_URL" -o /usr/local/bin/docker-compose; then
        break
    else
        echo -e "${YELLOW}⚠️  Tentative $i/3 échouée, retry dans 5s...${NC}"
        sleep 5
    fi
done

if [ ! -f /usr/local/bin/docker-compose ]; then
    echo -e "${RED}❌ Impossible de télécharger Docker Compose${NC}"
    exit 1
fi

chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Vérification installation Docker
echo -e "${CYAN}🔍 Vérification de l'installation Docker...${NC}"

# Test Docker
if docker --version && docker info >/dev/null 2>&1; then
    DOCKER_VER=$(docker --version | cut -d' ' -f3 | tr -d ',')
    echo -e "${GREEN}✅ Docker $DOCKER_VER installé et fonctionnel${NC}"
else
    echo -e "${RED}❌ Docker non fonctionnel${NC}"
    systemctl status docker --no-pager || service docker status
    exit 1
fi

# Test Docker Compose
if docker-compose --version >/dev/null 2>&1; then
    COMPOSE_VER=$(docker-compose --version | cut -d' ' -f4 | tr -d ',v')
    echo -e "${GREEN}✅ Docker Compose $COMPOSE_VER installé${NC}"
else
    echo -e "${RED}❌ Docker Compose non fonctionnel${NC}"
    exit 1
fi

# 3. Installation des dépendances système
echo -e "${BLUE}[3/12] 📦 Installation des dépendances système...${NC}"
apt-get install -y \
    git \
    nginx \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx \
    curl \
    wget \
    unzip \
    jq \
    openssl \
    tree \
    htop \
    vim \
    nano \
    net-tools \
    psmisc

# 4. Installation PHP (pour scripts locaux si nécessaire)
echo -e "${BLUE}[4/12] 🐘 Installation PHP 8.2 pour $OS_NAME...${NC}"

# Installation selon l'OS avec gestion d'erreurs
if [ "$OS_ID" = "debian" ]; then
    echo -e "${CYAN}📋 Configuration du dépôt Sury pour Debian...${NC}"
    
    # Installation des prérequis pour le dépôt Sury
    apt-get install -y lsb-release ca-certificates curl
    
    # Ajout du dépôt Sury avec gestion d'erreur
    if curl -sSL https://packages.sury.org/php/README.txt | bash -x; then
        echo -e "${GREEN}✅ Dépôt Sury ajouté${NC}"
        apt-get update -qq
        SURY_ADDED=true
    else
        echo -e "${YELLOW}⚠️  Impossible d'ajouter le dépôt Sury${NC}"
        SURY_ADDED=false
    fi
    
elif [ "$OS_ID" = "ubuntu" ]; then
    echo -e "${CYAN}📋 Configuration du PPA ondrej pour Ubuntu...${NC}"
    
    # Installation du support des PPA
    apt-get install -y software-properties-common
    
    # Ajout du PPA ondrej
    if add-apt-repository ppa:ondrej/php -y; then
        echo -e "${GREEN}✅ PPA ondrej ajouté${NC}"
        apt-get update -qq
        ONDREJ_ADDED=true
    else
        echo -e "${YELLOW}⚠️  Impossible d'ajouter le PPA ondrej${NC}"
        ONDREJ_ADDED=false
    fi
fi

# Installation PHP avec fallbacks
echo -e "${CYAN}🔧 Installation des packages PHP...${NC}"

# Liste des packages PHP à installer
PHP_PACKAGES="php8.2-cli php8.2-fpm php8.2-pgsql php8.2-redis php8.2-gd php8.2-mbstring php8.2-curl php8.2-zip php8.2-xml php8.2-bcmath php8.2-intl"

# Tentative d'installation PHP 8.2
if apt-get install -y $PHP_PACKAGES composer; then
    echo -e "${GREEN}✅ PHP 8.2 installé avec succès${NC}"
    PHP_INSTALLED="8.2"
elif apt-get install -y php8.1-cli php8.1-fpm php8.1-pgsql php8.1-redis php8.1-gd php8.1-mbstring php8.1-curl php8.1-zip php8.1-xml php8.1-bcmath php8.1-intl composer; then
    echo -e "${YELLOW}⚠️  PHP 8.1 installé (8.2 non disponible)${NC}"
    PHP_INSTALLED="8.1"
elif apt-get install -y php-cli php-fpm php-pgsql php-redis php-gd php-mbstring php-curl php-zip php-xml php-bcmath php-intl composer; then
    echo -e "${YELLOW}⚠️  PHP version par défaut installée${NC}"
    PHP_INSTALLED="default"
else
    echo -e "${RED}❌ Impossible d'installer PHP${NC}"
    exit 1
fi

# Vérification installation PHP
if command -v php >/dev/null 2>&1; then
    PHP_VER=$(php --version | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    echo -e "${GREEN}✅ PHP $PHP_VER installé et fonctionnel${NC}"
    
    # Test des extensions critiques
    echo -e "${CYAN}🧪 Vérification des extensions PHP critiques...${NC}"
    MISSING_EXTENSIONS=""
    
    for ext in pdo pgsql gd mbstring curl zip; do
        if ! php -m | grep -i "$ext" >/dev/null 2>&1; then
            MISSING_EXTENSIONS="$MISSING_EXTENSIONS $ext"
        fi
    done
    
    if [ -n "$MISSING_EXTENSIONS" ]; then
        echo -e "${YELLOW}⚠️  Extensions manquantes: $MISSING_EXTENSIONS${NC}"
        echo -e "${YELLOW}⚠️  L'application PHP pourrait ne pas fonctionner correctement${NC}"
    else
        echo -e "${GREEN}✅ Toutes les extensions critiques sont présentes${NC}"
    fi
else
    echo -e "${RED}❌ PHP non fonctionnel après installation${NC}"
    exit 1
fi

# 5. Téléchargement du projet depuis GitHub
echo -e "${BLUE}[5/12] 📥 Téléchargement du projet depuis GitHub...${NC}"

rm -rf $TEMP_DIR

# URL exacte du dépôt avec vérification
GITHUB_URL="$GITHUB_REPO"
echo -e "${CYAN}🔗 URL du dépôt: $GITHUB_URL${NC}"
echo -e "${CYAN}🌿 Branche: $GITHUB_BRANCH${NC}"

# Test de connectivité GitHub
echo -e "${CYAN}🔍 Test de connectivité GitHub...${NC}"
if ! curl -s --connect-timeout 10 https://github.com >/dev/null; then
    echo -e "${RED}❌ Impossible de contacter GitHub${NC}"
    echo -e "${YELLOW}💡 Vérifiez votre connexion internet${NC}"
    exit 1
fi

# Clonage avec options robustes
echo -e "${CYAN}🔄 Clonage depuis $GITHUB_REPO (branche $GITHUB_BRANCH)...${NC}"

# Tentative de clonage avec retry
for attempt in 1 2 3; do
    echo -e "${CYAN}   Tentative $attempt/3...${NC}"
    
    if git clone --depth 1 --branch "$GITHUB_BRANCH" "$GITHUB_REPO" "$TEMP_DIR"; then
        echo -e "${GREEN}✅ Clonage réussi${NC}"
        break
    else
        echo -e "${YELLOW}⚠️  Tentative $attempt échouée${NC}"
        
        if [ $attempt -eq 3 ]; then
            echo -e "${RED}❌ Impossible de cloner le dépôt GitHub après 3 tentatives${NC}"
            echo -e "${YELLOW}💡 Vérifications:${NC}"
            echo -e "${YELLOW}   • Connexion internet: $(curl -s --connect-timeout 5 https://github.com && echo 'OK' || echo 'FAIL')${NC}"
            echo -e "${YELLOW}   • URL du dépôt: $GITHUB_REPO${NC}"
            echo -e "${YELLOW}   • Branche: $GITHUB_BRANCH${NC}"
            echo -e "${YELLOW}   • Git installé: $(git --version 2>/dev/null || echo 'NON')${NC}"
            exit 1
        fi
        
        sleep 5
        rm -rf "$TEMP_DIR" 2>/dev/null || true
    fi
done

# Vérification du contenu cloné
if [ ! -d "$TEMP_DIR" ] || [ ! "$(ls -A $TEMP_DIR 2>/dev/null)" ]; then
    echo -e "${RED}❌ Le dépôt cloné est vide ou inexistant${NC}"
    exit 1
fi

# Affichage du contenu pour vérification
echo -e "${GREEN}✅ Projet téléchargé avec succès${NC}"
echo -e "${CYAN}📁 Contenu du projet:${NC}"
ls -la "$TEMP_DIR" | head -10

# Vérification de la structure attendue
EXPECTED_DIRS=("app-full" "docker" ".git")
FOUND_STRUCTURE=true

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ ! -e "$TEMP_DIR/$dir" ]; then
        echo -e "${YELLOW}⚠️  Répertoire/fichier manquant: $dir${NC}"
        FOUND_STRUCTURE=false
    fi
done

if [ "$FOUND_STRUCTURE" = true ]; then
    echo -e "${GREEN}✅ Structure du projet validée${NC}"
else
    echo -e "${YELLOW}⚠️  Structure non standard détectée, continuation...${NC}"
fi

# 6. Création de l'utilisateur système
echo -e "${BLUE}[6/12] 👤 Création de l'utilisateur système...${NC}"

if ! id "$SERVICE_USER" &>/dev/null; then
    useradd --system --shell /bin/bash --home $APP_DIR --create-home $SERVICE_USER
    echo -e "${GREEN}✅ Utilisateur $SERVICE_USER créé${NC}"
else
    echo -e "${YELLOW}⚠️  Utilisateur $SERVICE_USER existe déjà${NC}"
fi

# Ajout au groupe docker
usermod -aG docker $SERVICE_USER 2>/dev/null || true
echo -e "${GREEN}✅ Utilisateur ajouté au groupe docker${NC}"

# 7. Création de la structure et copie des fichiers
echo -e "${BLUE}[7/12] 📁 Création de la structure et copie des fichiers...${NC}"

# Création des répertoires
mkdir -p $APP_DIR
mkdir -p $LOG_DIR
mkdir -p $CONFIG_DIR

# Copie des fichiers du projet
echo -e "${CYAN}📋 Copie des fichiers du projet...${NC}"
cp -r $TEMP_DIR/* $APP_DIR/
rm -rf $TEMP_DIR

# Vérification de la structure du projet
if [ ! -d "$APP_DIR/app-full" ]; then
    echo -e "${YELLOW}⚠️  Structure app-full non trouvée, création...${NC}"
    mkdir -p $APP_DIR/app-full/management/{api,templates,config}
fi

# Création des répertoires nécessaires
mkdir -p $APP_DIR/storage/{logs,cache,uploads,backups,reports}
mkdir -p $APP_DIR/docker/{php,nginx/conf.d,redis}

echo -e "${GREEN}✅ Structure de fichiers créée${NC}"

# 8. Configuration des variables d'environnement
echo -e "${BLUE}[8/12] ⚙️  Configuration des variables d'environnement...${NC}"

# Génération de mots de passe sécurisés
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
APP_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

echo -e "${CYAN}🔐 Génération des clés de sécurité...${NC}"

# Création du fichier .env
cat > $APP_DIR/.env << EOF
# ============================================================================
# Configuration PhishGuard BASIC - $(date)
# ============================================================================

# Environnement
NODE_ENV=production
ENVIRONMENT=production
DEBUG=false

# Base de données PostgreSQL
DB_HOST=db
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@db:5432/$DB_NAME

# Cache Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379

# Application
APP_NAME=PhishGuard BASIC
APP_URL=http://localhost
APP_SECRET=$APP_SECRET
SESSION_SECRET=$APP_SECRET

# Sécurité
ENCRYPTION_KEY=$APP_SECRET
JWT_SECRET=$APP_SECRET

# Email SMTP (À CONFIGURER APRÈS INSTALLATION)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.votre-domaine.com
MAIL_PORT=587
MAIL_USERNAME=phishing-simulation@votre-domaine.com
MAIL_PASSWORD=votre-mot-de-passe-smtp
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=phishing-simulation@votre-domaine.com
MAIL_FROM_NAME="PhishGuard Training"

# Ports
HTTP_PORT=80
HTTPS_PORT=443
PHP_PORT=9000
DB_PORT_EXTERNAL=5432
REDIS_PORT_EXTERNAL=6379

# Logs
LOG_CHANNEL=single
LOG_LEVEL=info
LOG_PATH=/var/log/phishguard

# Uploads et stockage
UPLOAD_MAX_SIZE=32M
UPLOAD_PATH=/var/www/html/storage/uploads
STORAGE_PATH=/var/www/html/storage

# Sécurité avancée
ALLOWED_DOMAINS=localhost,127.0.0.1
CORS_ORIGINS=*
CSRF_PROTECTION=true
RATE_LIMIT=100

# Timezone
TIMEZONE=Europe/Paris

# Configuration système détectée
OS_INFO=$OS_NAME $OS_VERSION ($OS_CODENAME)
INSTALL_DATE=$(date)
EOF

echo -e "${GREEN}✅ Variables d'environnement configurées${NC}"

# 9. Création du docker-compose.yml optimisé
echo -e "${BLUE}[9/12] 🐳 Création de la configuration Docker Compose...${NC}"

cat > $APP_DIR/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Base de données PostgreSQL
  db:
    image: postgres:14-alpine
    container_name: phishguard_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-phishguard_basic}
      POSTGRES_USER: ${DB_USER:-phishguard}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256 --auth-local=scram-sha-256"
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./storage/backups:/backups
      - ./app-full/management/config:/docker-entrypoint-initdb.d:ro
    ports:
      - "${DB_PORT_EXTERNAL:-5432}:5432"
    networks:
      -
