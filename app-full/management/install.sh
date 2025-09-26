#!/bin/bash

#################################################
# Script d'installation PhishGuard BASIC
# Outil de simulation de phishing pour formation
#################################################

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
PROJECT_NAME="PhishGuard BASIC"
REPO_URL="https://github.com/Reaper-Official/cyber-prevention-tool.git"
BRANCH="dev"
INSTALL_DIR="$(pwd)/cyber-prevention-tool"

# Fonctions utilitaires
print_header() {
    echo -e "\n${CYAN}════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    print_header "Vérification des prérequis"
    
    local missing_deps=()
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
        print_error "Docker n'est pas installé"
    else
        print_success "Docker est installé ($(docker --version))"
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing_deps+=("docker-compose")
        print_error "Docker Compose n'est pas installé"
    else
        print_success "Docker Compose est installé"
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
        print_error "Git n'est pas installé"
    else
        print_success "Git est installé ($(git --version))"
    fi
    
    # Si des dépendances manquent
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Dépendances manquantes : ${missing_deps[*]}"
        echo -e "\n${YELLOW}Instructions d'installation :${NC}"
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "Ubuntu/Debian:"
            echo "  sudo apt-get update"
            echo "  sudo apt-get install -y docker.io docker-compose git"
            echo "  sudo systemctl start docker"
            echo "  sudo usermod -aG docker \$USER"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            echo "macOS:"
            echo "  brew install docker docker-compose git"
            echo "  ou téléchargez Docker Desktop depuis https://www.docker.com/products/docker-desktop"
        fi
        
        exit 1
    fi
    
    print_success "Tous les prérequis sont installés !"
}

# Cloner le repository
clone_repository() {
    print_header "Clonage du repository"
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Le dossier existe déjà. Suppression..."
        rm -rf "$INSTALL_DIR"
    fi
    
    print_info "Clonage depuis $REPO_URL (branche: $BRANCH)"
    git clone -b "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
    
    if [ $? -eq 0 ]; then
        print_success "Repository cloné avec succès"
        cd "$INSTALL_DIR"
    else
        print_error "Échec du clonage du repository"
        exit 1
    fi
}

# Créer le Dockerfile optimisé
create_dockerfile() {
    print_header "Création du Dockerfile optimisé"
    
    cat > Dockerfile << 'EOF'
FROM php:8.2-fpm-alpine

# Installer toutes les dépendances
RUN apk add --no-cache \
    bash git curl \
    postgresql-dev postgresql-libs \
    freetype-dev libjpeg-turbo-dev libpng-dev \
    libzip-dev icu-dev icu-libs \
    oniguruma-dev linux-headers \
    autoconf g++ make pkgconf

# Configurer et installer les extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) \
        pdo pdo_pgsql pgsql gd bcmath pcntl intl mbstring zip

# Installer Redis
RUN pecl install redis-5.3.7 && \
    docker-php-ext-enable redis

# Vérifier que Redis est installé
RUN php -m | grep -i redis

# Nettoyer les dépendances de build
RUN apk del autoconf g++ make pkgconf

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copier les fichiers de l'application
COPY . .

# Installer les dépendances PHP
RUN if [ -f composer.json ]; then \
        composer install --no-dev --optimize-autoloader --no-interaction; \
    fi

# Permissions
RUN chown -R www-data:www-data /var/www && \
    chmod -R 755 /var/www

EXPOSE 9000

CMD ["php-fpm"]
EOF
    
    print_success "Dockerfile créé"
}

# Créer docker-compose.yml
create_docker_compose() {
    print_header "Création du docker-compose.yml"
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: phishguard_app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
      - ./storage:/var/www/storage
    networks:
      - phishguard_network
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    container_name: phishguard_nginx
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./:/var/www
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    networks:
      - phishguard_network
    depends_on:
      - app

  db:
    image: postgres:14-alpine
    container_name: phishguard_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_DATABASE:-phishguard}
      POSTGRES_USER: ${DB_USERNAME:-phishguard_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - phishguard_network
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: phishguard_redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - phishguard_network
    ports:
      - "6379:6379"

networks:
  phishguard_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
EOF
    
    print_success "docker-compose.yml créé"
}

# Créer configuration Nginx
create_nginx_config() {
    print_header "Création de la configuration Nginx"
    
    mkdir -p nginx
    
    cat > nginx/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /var/www/public;
    index index.php index.html;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF
    
    print_success "Configuration Nginx créée"
}

# Créer fichier .env
create_env_file() {
    print_header "Configuration de l'environnement"
    
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Fichier .env créé depuis .env.example"
    else
        cat > .env << 'EOF'
APP_NAME="PhishGuard BASIC"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=phishguard
DB_USERNAME=phishguard_user
DB_PASSWORD=secret_password

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@phishguard.local"
MAIL_FROM_NAME="${APP_NAME}"

# Gemini AI API Key (obligatoire pour le contenu IA)
GEMINI_API_KEY=your_gemini_api_key_here
EOF
        print_success "Fichier .env créé"
    fi
    
    print_warning "N'oubliez pas de configurer votre clé API Gemini dans le fichier .env"
}

# Construction et démarrage
build_and_start() {
    print_header "Construction et démarrage des conteneurs"
    
    print_info "Construction des images Docker..."
    docker-compose build --no-cache
    
    if [ $? -ne 0 ]; then
        print_error "Échec de la construction"
        exit 1
    fi
    
    print_success "Images construites avec succès"
    
    print_info "Démarrage des conteneurs..."
    docker-compose up -d
    
    if [ $? -ne 0 ]; then
        print_error "Échec du démarrage"
        exit 1
    fi
    
    print_success "Conteneurs démarrés"
}

# Initialisation de l'application
initialize_app() {
    print_header "Initialisation de l'application"
    
    # Attendre que les services soient prêts
    print_info "Attente du démarrage de la base de données..."
    sleep 10
    
    # Générer la clé d'application (Laravel)
    if [ -f artisan ]; then
        print_info "Génération de la clé d'application..."
        docker-compose exec -T app php artisan key:generate
        
        print_info "Exécution des migrations..."
        docker-compose exec -T app php artisan migrate --force
        
        print_info "Création des données de test..."
        docker-compose exec -T app php artisan db:seed --force
        
        print_success "Application initialisée"
    else
        print_warning "Fichier artisan non trouvé, application non Laravel"
    fi
}

# Afficher les informations finales
show_final_info() {
    print_header "Installation terminée !"
    
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║  ${CYAN}🎉 PhishGuard BASIC installé avec succès !${GREEN}          ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    
    echo -e "\n${CYAN}📍 Accès à l'application :${NC}"
    echo -e "   🌐 Interface web : ${GREEN}http://localhost:8080${NC}"
    
    echo -e "\n${CYAN}🔧 Commandes utiles :${NC}"
    echo -e "   ${BLUE}cd $INSTALL_DIR${NC}"
    echo -e "   ${BLUE}docker-compose logs -f${NC}        # Voir les logs"
    echo -e "   ${BLUE}docker-compose ps${NC}             # État des conteneurs"
    echo -e "   ${BLUE}docker-compose stop${NC}           # Arrêter"
    echo -e "   ${BLUE}docker-compose start${NC}          # Démarrer"
    echo -e "   ${BLUE}docker-compose down${NC}           # Tout supprimer"
    echo -e "   ${BLUE}docker-compose exec app bash${NC}  # Accéder au conteneur"
    
    echo -e "\n${CYAN}📝 Configuration requise :${NC}"
    echo -e "   ${YELLOW}⚠️  Configurez votre clé API Gemini dans :${NC}"
    echo -e "   ${BLUE}$INSTALL_DIR/.env${NC}"
    echo -e "   ${BLUE}GEMINI_API_KEY=votre_clé_api${NC}"
    
    echo -e "\n${CYAN}🔐 Services démarrés :${NC}"
    docker-compose ps
    
    echo -e "\n${CYAN}📚 Documentation :${NC}"
    echo -e "   ${BLUE}Français : https://github.com/Reaper-Official/cyber-prevention-tool/blob/dev/readme-fr.md${NC}"
    echo -e "   ${BLUE}English  : https://github.com/Reaper-Official/cyber-prevention-tool/blob/dev/readme-eng.md${NC}"
    
    echo -e "\n${YELLOW}⚠️  IMPORTANT :${NC}"
    echo -e "   Cet outil est destiné uniquement à la formation interne en cybersécurité."
    echo -e "   Toute utilisation malveillante est strictement interdite.\n"
}

# Menu principal
main() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ██████╗ ██╗  ██╗██╗███████╗██╗  ██╗ ██████╗       ║
║   ██╔══██╗██║  ██║██║██╔════╝██║  ██║██╔════╝       ║
║   ██████╔╝███████║██║███████╗███████║██║  ███╗      ║
║   ██╔═══╝ ██╔══██║██║╚════██║██╔══██║██║   ██║      ║
║   ██║     ██║  ██║██║███████║██║  ██║╚██████╔╝      ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝       ║
║                                                       ║
║             Installation automatique                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    check_prerequisites
    clone_repository
    create_dockerfile
    create_docker_compose
    create_nginx_config
    create_env_file
    build_and_start
    initialize_app
    show_final_info
}

# Gestion des erreurs
trap 'print_error "Une erreur est survenue. Installation interrompue."; exit 1' ERR

# Exécution
main "$@"
