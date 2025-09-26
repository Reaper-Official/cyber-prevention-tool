#!/bin/bash

#################################################
# Script d'installation complète PhishGuard BASIC
# Installe automatiquement tous les prérequis
#################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

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

# Détecter l'OS et la distribution
detect_os() {
    print_info "Détection du système d'exploitation..."
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
        OS_NAME=$NAME
    elif [ "$(uname)" == "Darwin" ]; then
        OS="macos"
        OS_NAME="macOS"
        OS_VERSION=$(sw_vers -productVersion)
    elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
        OS="linux"
        OS_NAME="Linux"
    else
        OS="unknown"
        OS_NAME="Unknown"
    fi
    
    print_success "OS détecté : $OS_NAME ($OS_VERSION)"
}

# Vérifier les permissions sudo
check_sudo() {
    if [ "$OS" != "macos" ]; then
        if ! sudo -n true 2>/dev/null; then
            print_warning "Ce script nécessite les privilèges sudo"
            sudo -v
        fi
    fi
}

# Installer Git
install_git() {
    print_info "Installation de Git..."
    
    case "$OS" in
        ubuntu|debian|pop)
            sudo apt-get update -qq
            sudo apt-get install -y git
            ;;
        centos|rhel|rocky|alma)
            sudo yum install -y git
            ;;
        fedora)
            sudo dnf install -y git
            ;;
        arch|manjaro)
            sudo pacman -Sy --noconfirm git
            ;;
        opensuse*|sles)
            sudo zypper install -y git
            ;;
        macos)
            if ! command -v brew &> /dev/null; then
                print_info "Installation de Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install git
            ;;
        *)
            print_error "Distribution non supportée pour l'installation automatique de Git"
            exit 1
            ;;
    esac
    
    print_success "Git installé : $(git --version)"
}

# Installer Docker
install_docker() {
    print_info "Installation de Docker..."
    
    case "$OS" in
        ubuntu|debian|pop)
            # Supprimer les anciennes versions
            sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
            
            # Installer les dépendances
            sudo apt-get update -qq
            sudo apt-get install -y \
                ca-certificates \
                curl \
                gnupg \
                lsb-release
            
            # Ajouter la clé GPG de Docker
            sudo install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            sudo chmod a+r /etc/apt/keyrings/docker.gpg
            
            # Ajouter le repository Docker
            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
              $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
              sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # Installer Docker Engine
            sudo apt-get update -qq
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
            
        centos|rhel|rocky|alma)
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
            
        fedora)
            sudo dnf -y install dnf-plugins-core
            sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
            
        arch|manjaro)
            sudo pacman -Sy --noconfirm docker docker-compose
            ;;
            
        opensuse*|sles)
            sudo zypper addrepo https://download.docker.com/linux/sles/docker-ce.repo
            sudo zypper refresh
            sudo zypper install -y docker-ce docker-ce-cli containerd.io
            ;;
            
        macos)
            if command -v brew &> /dev/null; then
                print_info "Installation de Docker Desktop pour macOS..."
                brew install --cask docker
                print_warning "Docker Desktop installé. Veuillez le démarrer manuellement depuis Applications."
                print_info "Appuyez sur Entrée après avoir démarré Docker Desktop..."
                read
            else
                print_error "Homebrew n'est pas installé"
                print_info "Téléchargez Docker Desktop depuis : https://www.docker.com/products/docker-desktop"
                exit 1
            fi
            ;;
            
        *)
            print_error "Distribution non supportée pour l'installation automatique de Docker"
            print_info "Installez Docker manuellement : https://docs.docker.com/engine/install/"
            exit 1
            ;;
    esac
    
    # Démarrer et activer Docker (Linux seulement)
    if [ "$OS" != "macos" ]; then
        sudo systemctl start docker 2>/dev/null || true
        sudo systemctl enable docker 2>/dev/null || true
    fi
    
    # Ajouter l'utilisateur au groupe docker (Linux seulement)
    if [ "$OS" != "macos" ]; then
        sudo usermod -aG docker $USER
        print_warning "Vous avez été ajouté au groupe 'docker'"
    fi
    
    print_success "Docker installé : $(docker --version)"
}

# Installer Docker Compose (si nécessaire)
install_docker_compose() {
    # Vérifier si docker compose (plugin) existe
    if docker compose version &> /dev/null; then
        print_success "Docker Compose (plugin) déjà disponible"
        return
    fi
    
    # Vérifier si docker-compose standalone existe
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose (standalone) déjà disponible"
        return
    fi
    
    print_info "Installation de Docker Compose standalone..."
    
    # Obtenir la dernière version
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d '"' -f 4)
    
    if [ "$OS" == "macos" ]; then
        brew install docker-compose
    else
        sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
             -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    print_success "Docker Compose installé"
}

# Vérifier et installer tous les prérequis
setup_prerequisites() {
    print_header "Configuration des prérequis"
    
    detect_os
    
    if [ "$OS" != "macos" ]; then
        check_sudo
    fi
    
    # Vérifier et installer Git
    if ! command -v git &> /dev/null; then
        install_git
    else
        print_success "Git déjà installé : $(git --version)"
    fi
    
    # Vérifier et installer Docker
    if ! command -v docker &> /dev/null; then
        install_docker
        DOCKER_INSTALLED=true
    else
        print_success "Docker déjà installé : $(docker --version)"
        
        # Vérifier si l'utilisateur est dans le groupe docker (Linux)
        if [ "$OS" != "macos" ] && ! groups | grep -q docker; then
            print_warning "Ajout de l'utilisateur au groupe docker..."
            sudo usermod -aG docker $USER
            DOCKER_INSTALLED=true
        fi
    fi
    
    # Installer Docker Compose si nécessaire
    install_docker_compose
    
    # Si Docker vient d'être installé sur Linux, gérer la reconnexion
    if [ "$DOCKER_INSTALLED" = true ] && [ "$OS" != "macos" ]; then
        print_warning "Docker vient d'être installé et vous avez été ajouté au groupe 'docker'"
        print_info "Tentative d'activation du groupe docker sans reconnexion..."
        
        # Essayer de continuer avec newgrp
        if command -v sg &> /dev/null; then
            exec sg docker "$0 --continue"
        else
            print_warning "Pour que les changements prennent effet :"
            echo -e "${YELLOW}1. Déconnectez-vous et reconnectez-vous${NC}"
            echo -e "${YELLOW}2. OU exécutez : newgrp docker${NC}"
            echo -e "${YELLOW}3. Puis relancez ce script${NC}"
            exit 0
        fi
    fi
    
    print_success "Tous les prérequis sont installés !"
}

# Cloner le repository
clone_repository() {
    print_header "Clonage du repository"
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Le dossier existe déjà"
        read -p "Voulez-vous le supprimer et recommencer ? (oui/non) : " confirm
        if [ "$confirm" = "oui" ]; then
            rm -rf "$INSTALL_DIR"
        else
            print_info "Utilisation du dossier existant"
            cd "$INSTALL_DIR"
            return
        fi
    fi
    
    print_info "Clonage de $REPO_URL (branche: $BRANCH)..."
    git clone -b "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    print_success "Repository cloné avec succès"
}

# Créer le Dockerfile
create_dockerfile() {
    print_header "Création du Dockerfile optimisé"
    
    cat > Dockerfile << 'DOCKERFILE_EOF'
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    bash git curl \
    postgresql-dev postgresql-libs \
    freetype-dev libjpeg-turbo-dev libpng-dev \
    libzip-dev icu-dev icu-libs \
    oniguruma-dev linux-headers \
    autoconf g++ make pkgconf

RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) \
        pdo pdo_pgsql pgsql gd bcmath pcntl intl mbstring zip

RUN pecl install redis-5.3.7 && \
    docker-php-ext-enable redis && \
    php -m | grep -i redis

RUN apk del autoconf g++ make pkgconf

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

RUN if [ -f composer.json ]; then \
        composer install --no-dev --optimize-autoloader --no-interaction; \
    fi

RUN chown -R www-data:www-data /var/www && \
    chmod -R 755 /var/www

EXPOSE 9000
CMD ["php-fpm"]
DOCKERFILE_EOF
    
    print_success "Dockerfile créé"
}

# Créer docker-compose.yml
create_docker_compose() {
    print_header "Création de docker-compose.yml"
    
    cat > docker-compose.yml << 'COMPOSE_EOF'
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

  redis:
    image: redis:7-alpine
    container_name: phishguard_redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - phishguard_network

networks:
  phishguard_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
COMPOSE_EOF
    
    print_success "docker-compose.yml créé"
}

# Créer configuration Nginx
create_nginx_config() {
    print_header "Création de la configuration Nginx"
    
    mkdir -p nginx
    
    cat > nginx/default.conf << 'NGINX_EOF'
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
NGINX_EOF
    
    print_success "Configuration Nginx créée"
}

# Créer fichier .env
create_env_file() {
    print_header "Configuration de l'environnement"
    
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Fichier .env créé depuis .env.example"
    else
        cat > .env << 'ENV_EOF'
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

GEMINI_API_KEY=your_gemini_api_key_here
ENV_EOF
        print_success "Fichier .env créé"
    fi
}

# Construction et démarrage
build_and_start() {
    print_header "Construction et démarrage"
    
    print_info "Construction des images Docker (cela peut prendre plusieurs minutes)..."
    
    # Utiliser la bonne commande docker compose
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    $DOCKER_COMPOSE build --no-cache
    
    print_success "Images construites"
    
    print_info "Démarrage des conteneurs..."
    $DOCKER_COMPOSE up -d
    
    print_success "Conteneurs démarrés"
}

# Initialisation
initialize_app() {
    print_header "Initialisation de l'application"
    
    print_info "Attente du démarrage des services (15 secondes)..."
    sleep 15
    
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    if [ -f artisan ]; then
        print_info "Génération de la clé Laravel..."
        $DOCKER_COMPOSE exec -T app php artisan key:generate 2>/dev/null || true
        
        print_info "Exécution des migrations..."
        $DOCKER_COMPOSE exec -T app php artisan migrate --force 2>/dev/null || true
        
        print_info "Seed de la base de données..."
        $DOCKER_COMPOSE exec -T app php artisan db:seed --force 2>/dev/null || true
        
        print_success "Application initialisée"
    fi
}

# Afficher les infos finales
show_info() {
    print_header "Installation terminée !"
    
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 PhishGuard BASIC installé !       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    
    echo -e "\n${CYAN}🌐 Accès :${NC} ${GREEN}http://localhost:8080${NC}"
    
    echo -e "\n${CYAN}📝 Configuration :${NC}"
    echo -e "   Éditez : ${BLUE}$INSTALL_DIR/.env${NC}"
    echo -e "   Ajoutez votre clé API Gemini"
    
    echo -e "\n${CYAN}🔧 Commandes utiles :${NC}"
    echo -e "   ${BLUE}cd $INSTALL_DIR${NC}"
    echo -e "   ${BLUE}docker-compose logs -f${NC}"
    echo -e "   ${BLUE}docker-compose ps${NC}"
    echo -e "   ${BLUE}docker-compose restart${NC}"
}

# Main
main() {
    clear
    echo -e "${CYAN}"
    cat << "BANNER_EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ██████╗ ██╗  ██╗██╗███████╗██╗  ██╗ ██████╗       ║
║   ██╔══██╗██║  ██║██║██╔════╝██║  ██║██╔════╝       ║
║   ██████╔╝███████║██║███████╗███████║██║  ███╗      ║
║   ██╔═══╝ ██╔══██║██║╚════██║██╔══██║██║   ██║      ║
║   ██║     ██║  ██║██║███████║██║  ██║╚██████╔╝      ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝       ║
║                                                       ║
║        Installation Automatique Complète             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
BANNER_EOF
    echo -e "${NC}\n"
    
    # Si l'argument --continue est passé, sauter la vérification des prérequis
    if [ "$1" != "--continue" ]; then
        setup_prerequisites
    fi
    
    clone_repository
    create_dockerfile
    create_docker_compose
    create_nginx_config
    create_env_file
    build_and_start
    initialize_app
    show_info
    
    echo -e "\n${GREEN}✨ Installation terminée avec succès !${NC}\n"
}

# Gestion des erreurs
trap 'print_error "Une erreur est survenue à la ligne $LINENO"; exit 1' ERR

# Exécution
main "$@"
