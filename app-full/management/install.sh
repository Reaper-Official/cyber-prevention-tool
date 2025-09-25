#!/bin/bash
# Correctif rapide pour les problèmes Docker Compose

# Fonction pour corriger Docker Compose
fix_docker_compose() {
    echo "🔧 Correction des problèmes Docker Compose..."
    
    # Vérifier si Docker Compose V2 (plugin) est disponible
    if docker compose version &> /dev/null; then
        echo "✅ Docker Compose V2 (plugin) détecté"
        COMPOSE_COMMAND="docker compose"
    else
        echo "⚠️ Installation de Docker Compose standalone..."
        
        # Télécharger et installer Docker Compose standalone
        COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        
        if [ -z "$COMPOSE_VERSION" ]; then
            COMPOSE_VERSION="v2.24.0"
        fi
        
        curl -L "https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        # Créer un lien symbolique
        ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        
        COMPOSE_COMMAND="docker-compose"
        
        # Vérifier l'installation
        if docker-compose --version; then
            echo "✅ Docker Compose standalone installé avec succès"
        else
            echo "❌ Échec de l'installation de Docker Compose"
            exit 1
        fi
    fi
}

# Fonction pour créer un docker-compose.yml corrigé
create_fixed_compose() {
    cat > docker-compose.yml << 'EOF'
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
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secure_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./app-full/management/config/init_db.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    ports:
      - "5432:5432"
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
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - phishguard_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    command: redis-server --appendonly yes

  # Application PHP-FPM
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: phishguard_app
    restart: unless-stopped
    environment:
      - DB_HOST=db
      - DB_NAME=${DB_NAME:-phishguard_basic}
      - DB_USER=${DB_USER:-phishguard}
      - DB_PASSWORD=${DB_PASSWORD:-secure_password}
      - DB_PORT=5432
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SMTP_HOST=${SMTP_HOST:-localhost}
      - SMTP_PORT=${SMTP_PORT:-587}
      - SMTP_USER=${SMTP_USER:-}
      - SMTP_PASS=${SMTP_PASS:-}
      - APP_ENV=${APP_ENV:-production}
      - APP_DEBUG=${APP_DEBUG:-false}
      - APP_URL=${APP_URL:-http://localhost}
      - GEMINI_API_KEY=${GEMINI_API_KEY:-}
    volumes:
      - ./app-full:/var/www/html/app-full
      - ./storage:/var/www/html/storage
      - ./logs:/var/log/phishguard
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - phishguard_network
    healthcheck:
      test: ["CMD-SHELL", "php-fpm -t"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Serveur web Nginx
  nginx:
    image: nginx:alpine
    container_name: phishguard_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites-available:/etc/nginx/conf.d:ro
      - ./ssl:/etc/ssl/phishguard:ro
      - ./app-full:/var/www/html/app-full:ro
      - ./storage/logs/nginx:/var/log/nginx
    depends_on:
      - app
    networks:
      - phishguard_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

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
EOF
}

# Fonction pour créer le script init.sh corrigé
create_init_script() {
    mkdir -p docker
    cat > docker/init.sh << 'EOF'
#!/bin/sh
# Script d'initialisation du conteneur PHP

set -e

echo "🚀 Initialisation du conteneur PhishGuard..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if nc -z db 5432 2>/dev/null; then
        echo "✅ Base de données accessible"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Impossible de se connecter à la base de données après $max_attempts tentatives"
        exit 1
    fi
    
    echo "Tentative $attempt/$max_attempts..."
    sleep 2
    attempt=$((attempt + 1))
done

# Test de connexion à la base
echo "🧪 Test de connexion à la base de données..."
php -r "
try {
    \$pdo = new PDO('pgsql:host=db;port=5432;dbname='.\$_ENV['DB_NAME'], \$_ENV['DB_USER'], \$_ENV['DB_PASSWORD']);
    echo '✅ Connexion base de données: OK' . PHP_EOL;
} catch(Exception \$e) {
    echo '❌ Erreur connexion DB: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"

# Vérification des permissions
echo "🔧 Configuration des permissions..."
chown -R www-data:www-data /var/www/html/storage || true
chmod -R 775 /var/www/html/storage || true

# Création des répertoires manquants
mkdir -p /var/www/html/storage/{logs,cache,uploads,backups,reports}
chown -R www-data:www-data /var/www/html/storage

# Initialisation automatique si nécessaire
if [ ! -f "/var/www/html/.initialized" ]; then
    echo "🔧 Première initialisation détectée..."
    if [ -f "/var/www/html/app-full/management/setup.php" ]; then
        echo "📊 Exécution du script d'initialisation..."
        php /var/www/html/app-full/management/setup.php
        touch /var/www/html/.initialized
        echo "✅ Initialisation terminée"
    fi
fi

# Nettoyage des fichiers temporaires
echo "🧹 Nettoyage des fichiers temporaires..."
find /var/www/html/storage/cache -type f -mtime +7 -delete 2>/dev/null || true
find /var/www/html/storage/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true

echo "🎯 Démarrage de PHP-FPM..."
exec php-fpm
EOF
    
    chmod +x docker/init.sh
}

# Fonction principale de correction
main_fix() {
    echo "🛠️ CORRECTIF PHISHGUARD - Résolution des problèmes"
    echo "=================================================="
    
    # Vérifier les privilèges
    if [[ $EUID -ne 0 ]]; then
        echo "❌ Ce script doit être exécuté en tant que root (sudo)"
        exit 1
    fi
    
    # Se déplacer dans le répertoire d'installation
    cd /opt/phishguard-basic || {
        echo "❌ Répertoire d'installation non trouvé"
        exit 1
    }
    
    echo "📍 Répertoire de travail: $(pwd)"
    
    # Arrêter les services actuels
    echo "⏹️ Arrêt des services existants..."
    systemctl stop phishguard 2>/dev/null || true
    docker stop $(docker ps -q --filter "name=phishguard") 2>/dev/null || true
    docker rm $(docker ps -aq --filter "name=phishguard") 2>/dev/null || true
    
    # Corriger Docker Compose
    fix_docker_compose
    
    # Créer les fichiers corrigés
    echo "📝 Création des fichiers de configuration corrigés..."
    create_fixed_compose
    create_init_script
    
    # Créer le Dockerfile corrigé
    cat > Dockerfile << 'EOF'
FROM php:8.2-fpm-alpine

# Installation des dépendances système et outils de compilation
RUN apk add --no-cache \
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
    netcat-openbsd

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
    && docker-php-ext-enable redis

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Création du répertoire de travail
WORKDIR /var/www/html

# Création des répertoires nécessaires avec permissions
RUN mkdir -p storage/{logs,cache,uploads,backups} \
    && chown -R www-data:www-data storage \
    && chmod -R 775 storage

# Copie du code source
COPY . .

# Installation des dépendances Composer (si composer.json existe)
RUN if [ -f composer.json ]; then \
        composer install --no-dev --optimize-autoloader --no-interaction; \
    fi

# Configuration des permissions finales
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && find . -name "*.sh" -exec chmod +x {} \;

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD php-fpm -t || exit 1

# Port exposé
EXPOSE 9000

# Script d'initialisation
COPY docker/init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

# Commande de démarrage
CMD ["/usr/local/bin/init.sh"]
EOF
    
    # Créer la configuration PHP si elle n'existe pas
    mkdir -p docker/php
    if [ ! -f docker/php/php.ini ]; then
        cat > docker/php/php.ini << 'EOF'
[PHP]
engine = On
short_open_tag = Off
precision = 14
output_buffering = 4096
implicit_flush = Off

max_execution_time = 120
max_input_time = 60
max_input_vars = 3000
memory_limit = 256M

file_uploads = On
upload_max_filesize = 32M
max_file_uploads = 20
post_max_size = 64M

allow_url_fopen = Off
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
EOF
    fi
    
    if [ ! -f docker/php/php-fpm.conf ]; then
        cat > docker/php/php-fpm.conf << 'EOF'
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
pm.max_children = 20
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 5
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
    fi
    
    # Ajuster les permissions
    chown -R phishguard:phishguard . || true
    chmod +x docker/init.sh
    
    # Construire et démarrer les services
    echo "🏗️ Construction des images Docker..."
    sudo -u phishguard $COMPOSE_COMMAND build --no-cache
    
    echo "🚀 Démarrage des services..."
    sudo -u phishguard $COMPOSE_COMMAND up -d
    
    # Attendre que les services soient prêts
    echo "⏳ Attente de l'initialisation des services..."
    sleep 30
    
    # Vérifier l'état des services
    echo "🔍 Vérification de l'état des services..."
    sudo -u phishguard $COMPOSE_COMMAND ps
    
    # Test de connectivité
    echo "🌐 Test de connectivité..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost --connect-timeout 10 | grep -q "200\|301\|302"; then
        echo "✅ Application accessible sur http://localhost"
    else
        echo "⚠️ Application en cours de démarrage..."
    fi
    
    # Redémarrer le service systemd
    echo "🔄 Redémarrage du service systemd..."
    systemctl enable phishguard
    systemctl start phishguard
    
    echo ""
    echo "🎉 CORRECTIF APPLIQUÉ AVEC SUCCÈS!"
    echo "================================="
    echo "✅ Docker Compose installé et configuré"
    echo "✅ Dockerfile corrigé avec autoconf"
    echo "✅ Services redémarrés"
    echo ""
    echo "📊 Accès à PhishGuard:"
    echo "🌐 URL: http://localhost"
    echo "👤 Admin: admin / admin"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "- État des services: systemctl status phishguard"
    echo "- Logs en temps réel: cd /opt/phishguard-basic && sudo -u phishguard $COMPOSE_COMMAND logs -f"
    echo "- Diagnostic: /opt/phishguard-basic/diagnostic.sh"
}

# Exécuter le correctif
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main_fix "$@"
fi
