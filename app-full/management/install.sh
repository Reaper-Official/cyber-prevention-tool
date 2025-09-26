#!/bin/bash

#################################################
# PhishGuard BASIC - Installation Complète
# Avec vérifications de ressources et dépendances
#################################################

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration minimale requise
MIN_RAM_MB=1024          # 1GB minimum
RECOMMENDED_RAM_MB=2048  # 2GB recommandé
MIN_DISK_GB=5            # 5GB minimum
RECOMMENDED_DISK_GB=10   # 10GB recommandé

# Variables
REPO_URL="https://github.com/Reaper-Official/cyber-prevention-tool.git"
BRANCH="dev"
INSTALL_DIR="$HOME/phishguard"
WARNINGS=()
ERRORS=()

# ==================== FONCTIONS UTILITAIRES ====================

print_banner() {
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
║              Installation Complète                    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
}

print_section() { echo -e "\n${CYAN}═══ $1 ═══${NC}\n"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; ERRORS+=("$1"); }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; WARNINGS+=("$1"); }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# ==================== DÉTECTION SYSTÈME ====================

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
        OS_NAME=$NAME
    elif [ "$(uname)" == "Darwin" ]; then
        OS="macos"
        OS_NAME="macOS"
        OS_VERSION=$(sw_vers -productVersion)
    else
        OS="unknown"
        OS_NAME="Unknown"
    fi
}

# ==================== VÉRIFICATION RESSOURCES ====================

check_ram() {
    print_section "Vérification de la mémoire RAM"
    
    if [ "$OS" == "macos" ]; then
        TOTAL_RAM_MB=$(($(sysctl -n hw.memsize) / 1024 / 1024))
    else
        TOTAL_RAM_MB=$(free -m | awk 'NR==2 {print $2}')
    fi
    
    AVAILABLE_RAM_MB=$(free -m 2>/dev/null | awk 'NR==2 {print $7}' || echo $TOTAL_RAM_MB)
    
    echo -e "${BLUE}RAM totale     : ${MAGENTA}${TOTAL_RAM_MB}MB${NC}"
    echo -e "${BLUE}RAM disponible : ${MAGENTA}${AVAILABLE_RAM_MB}MB${NC}"
    echo ""
    
    if [ "$AVAILABLE_RAM_MB" -lt "$MIN_RAM_MB" ]; then
        print_error "RAM insuffisante (${AVAILABLE_RAM_MB}MB < ${MIN_RAM_MB}MB requis)"
        return 1
    elif [ "$AVAILABLE_RAM_MB" -lt "$RECOMMENDED_RAM_MB" ]; then
        print_warning "RAM faible (${AVAILABLE_RAM_MB}MB < ${RECOMMENDED_RAM_MB}MB recommandé)"
        return 2
    else
        print_success "RAM suffisante (${AVAILABLE_RAM_MB}MB disponible)"
        return 0
    fi
}

check_disk_space() {
    print_section "Vérification de l'espace disque"
    
    AVAILABLE_DISK_GB=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    
    echo -e "${BLUE}Espace disponible : ${MAGENTA}${AVAILABLE_DISK_GB}GB${NC}"
    echo ""
    
    if [ "$AVAILABLE_DISK_GB" -lt "$MIN_DISK_GB" ]; then
        print_error "Espace disque insuffisant (${AVAILABLE_DISK_GB}GB < ${MIN_DISK_GB}GB requis)"
        return 1
    elif [ "$AVAILABLE_DISK_GB" -lt "$RECOMMENDED_DISK_GB" ]; then
        print_warning "Espace disque limité (${AVAILABLE_DISK_GB}GB < ${RECOMMENDED_DISK_GB}GB recommandé)"
        return 2
    else
        print_success "Espace disque suffisant (${AVAILABLE_DISK_GB}GB disponible)"
        return 0
    fi
}

check_swap() {
    print_section "Vérification du SWAP"
    
    SWAP_TOTAL=$(free -m 2>/dev/null | awk 'NR==3 {print $2}' || echo "0")
    
    if [ "$SWAP_TOTAL" -eq 0 ]; then
        print_warning "Aucun SWAP configuré"
        echo -e "${YELLOW}Un fichier SWAP est recommandé pour les systèmes avec peu de RAM${NC}"
        
        read -p "Voulez-vous créer un fichier SWAP de 2GB ? (oui/non) : " create_swap
        if [ "$create_swap" = "oui" ]; then
            create_swap_file
        fi
    else
        print_success "SWAP configuré : ${SWAP_TOTAL}MB"
    fi
}

create_swap_file() {
    print_info "Création d'un fichier SWAP de 2GB..."
    
    if [ "$EUID" -ne 0 ]; then
        print_warning "Privilèges root requis pour créer un SWAP"
        return
    fi
    
    if [ -f /swapfile ]; then
        print_warning "Un fichier swap existe déjà"
        return
    fi
    
    sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    
    print_success "SWAP de 2GB créé et activé"
}

# ==================== VÉRIFICATION DÉPENDANCES ====================

check_git() {
    print_section "Vérification de Git"
    
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        print_success "Git installé (version ${GIT_VERSION})"
        return 0
    else
        print_error "Git n'est pas installé"
        return 1
    fi
}

check_docker() {
    print_section "Vérification de Docker"
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
        print_success "Docker installé (version ${DOCKER_VERSION})"
        
        # Vérifier que Docker fonctionne
        if docker ps &> /dev/null; then
            print_success "Docker est opérationnel"
        else
            print_error "Docker n'est pas démarré ou vous n'avez pas les permissions"
            return 1
        fi
        return 0
    else
        print_error "Docker n'est pas installé"
        return 1
    fi
}

check_docker_compose() {
    print_section "Vérification de Docker Compose"
    
    if docker compose version &> /dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version | awk '{print $4}')
        print_success "Docker Compose (plugin) installé (${COMPOSE_VERSION})"
        return 0
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | awk '{print $4}' | sed 's/,//')
        print_success "Docker Compose (standalone) installé (${COMPOSE_VERSION})"
        return 0
    else
        print_error "Docker Compose n'est pas installé"
        return 1
    fi
}

check_ports() {
    print_section "Vérification des ports"
    
    PORTS_OK=true
    
    for port in 8080 5432 6379; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_warning "Port $port déjà utilisé"
            PORTS_OK=false
        else
            print_success "Port $port disponible"
        fi
    done
    
    if [ "$PORTS_OK" = false ]; then
        return 1
    fi
    return 0
}

# ==================== INSTALLATION DÉPENDANCES ====================

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
        macos)
            if command -v brew &> /dev/null; then
                brew install git
            else
                xcode-select --install
            fi
            ;;
        *)
            print_error "OS non supporté pour l'installation automatique de Git"
            return 1
            ;;
    esac
    
    print_success "Git installé avec succès"
}

install_docker() {
    print_info "Installation de Docker..."
    
    case "$OS" in
        ubuntu|debian|pop|centos|rhel|fedora)
            curl -fsSL https://get.docker.com | sudo sh
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
            ;;
        macos)
            print_error "Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop"
            return 1
            ;;
        *)
            print_error "OS non supporté"
            return 1
            ;;
    esac
    
    print_success "Docker installé"
    print_warning "Vous devrez peut-être vous reconnecter pour que les changements prennent effet"
}

install_docker_compose() {
    print_info "Installation de Docker Compose..."
    
    if docker compose version &> /dev/null 2>&1; then
        print_success "Docker Compose (plugin) déjà disponible"
        return 0
    fi
    
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d '"' -f 4)
    
    if [ "$OS" == "macos" ]; then
        brew install docker-compose
    else
        sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    print_success "Docker Compose installé"
}

# ==================== RÉSUMÉ ET CONFIRMATION ====================

show_summary() {
    print_section "Résumé de la vérification"
    
    echo -e "${CYAN}📊 Configuration système :${NC}"
    echo -e "   OS           : ${OS_NAME}"
    echo -e "   RAM totale   : ${TOTAL_RAM_MB}MB"
    echo -e "   RAM dispo    : ${AVAILABLE_RAM_MB}MB"
    echo -e "   Espace disque: ${AVAILABLE_DISK_GB}GB"
    echo ""
    
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo -e "${RED}❌ Erreurs critiques :${NC}"
        for error in "${ERRORS[@]}"; do
            echo -e "   - $error"
        done
        echo ""
    fi
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Avertissements :${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo -e "   - $warning"
        done
        echo ""
    fi
    
    if [ ${#ERRORS[@]} -eq 0 ] && [ ${#WARNINGS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Tous les prérequis sont satisfaits !${NC}\n"
        return 0
    elif [ ${#ERRORS[@]} -gt 0 ]; then
        echo -e "${RED}⛔ Installation impossible en raison d'erreurs critiques${NC}\n"
        return 2
    else
        echo -e "${YELLOW}⚠️  Des avertissements ont été détectés${NC}\n"
        return 1
    fi
}

ask_confirmation() {
    local status=$1
    
    if [ $status -eq 0 ]; then
        read -p "Continuer l'installation ? (oui/non) : " confirm
    elif [ $status -eq 1 ]; then
        echo -e "${YELLOW}L'installation peut être instable avec ces ressources limitées.${NC}"
        read -p "Voulez-vous prendre le risque et continuer ? (oui/non) : " confirm
    else
        echo -e "${RED}Veuillez résoudre les erreurs avant de continuer.${NC}"
        exit 1
    fi
    
    if [ "$confirm" != "oui" ]; then
        print_info "Installation annulée par l'utilisateur"
        exit 0
    fi
}

# ==================== INSTALLATION ====================

clone_repository() {
    print_section "Clonage du repository depuis GitHub"
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Le dossier $INSTALL_DIR existe déjà"
        read -p "Supprimer et réinstaller ? (oui/non) : " choice
        if [ "$choice" = "oui" ]; then
            rm -rf "$INSTALL_DIR"
        else
            print_info "Utilisation du dossier existant"
            cd "$INSTALL_DIR"
            return
        fi
    fi
    
    print_info "Clonage depuis $REPO_URL (branche: $BRANCH)..."
    git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    print_success "Repository cloné depuis GitHub"
    
    # Afficher le contenu récupéré
    print_info "Contenu du repository :"
    ls -la | head -20
}

verify_repository_structure() {
    print_section "Vérification de la structure du projet"
    
    # Vérifier les fichiers essentiels depuis le repo
    local files_ok=true
    
    echo "Vérification des fichiers du repository :"
    
    # Fichiers Laravel/PHP attendus
    if [ -f "composer.json" ]; then
        print_success "composer.json trouvé"
    else
        print_warning "composer.json non trouvé"
    fi
    
    if [ -f "artisan" ]; then
        print_success "artisan trouvé (Laravel détecté)"
    else
        print_warning "artisan non trouvé (pas Laravel)"
    fi
    
    # Vérifier si les fichiers Docker existent déjà
    if [ -f "Dockerfile" ]; then
        print_success "Dockerfile trouvé dans le repo"
    else
        print_info "Dockerfile non trouvé, sera créé"
    fi
    
    if [ -f "docker-compose.yml" ]; then
        print_success "docker-compose.yml trouvé dans le repo"
    else
        print_info "docker-compose.yml non trouvé, sera créé"
    fi
}

setup_docker_files() {
    print_section "Configuration des fichiers Docker"
    
    # Utiliser les fichiers du repo s'ils existent, sinon les créer
    if [ ! -f "Dockerfile" ]; then
        print_info "Création du Dockerfile..."
        cat > Dockerfile << 'DOCKERFILE'
FROM php:8.2-fpm-alpine
RUN apk add --no-cache bash git curl postgresql-dev postgresql-libs \
    freetype-dev libjpeg-turbo-dev libpng-dev libzip-dev icu-dev icu-libs \
    oniguruma-dev linux-headers autoconf g++ make pkgconf
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) pdo pdo_pgsql pgsql gd bcmath pcntl intl mbstring zip
RUN pecl install redis-5.3.7 && docker-php-ext-enable redis
RUN apk del autoconf g++ make pkgconf && rm -rf /tmp/* /var/cache/apk/*
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY . .
RUN if [ -f composer.json ]; then \
        COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --optimize-autoloader --no-cache; \
    fi
RUN chown -R www-data:www-data /var/www
EXPOSE 9000
CMD ["php-fpm"]
DOCKERFILE
        print_success "Dockerfile créé"
    else
        print_success "Utilisation du Dockerfile du repository"
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        print_info "Création du docker-compose.yml..."
        cat > docker-compose.yml << 'COMPOSE'
version: '3.8'
services:
  app:
    build: .
    container_name: phishguard_app
    restart: unless-stopped
    working_dir: /var/www
    volumes: [./:/var/www]
    networks: [phishguard]
    depends_on: [db, redis]
    mem_limit: 512m
  nginx:
    image: nginx:alpine
    container_name: phishguard_nginx
    restart: unless-stopped
    ports: ["8080:80"]
    volumes: [./:/var/www, ./nginx/default.conf:/etc/nginx/conf.d/default.conf]
    networks: [phishguard]
    depends_on: [app]
    mem_limit: 128m
  db:
    image: postgres:14-alpine
    container_name: phishguard_db
    restart: unless-stopped
    environment: {POSTGRES_DB: phishguard, POSTGRES_USER: phishguard_user, POSTGRES_PASSWORD: secret_password}
    volumes: [postgres_data:/var/lib/postgresql/data]
    networks: [phishguard]
    mem_limit: 256m
  redis:
    image: redis:7-alpine
    container_name: phishguard_redis
    restart: unless-stopped
    volumes: [redis_data:/data]
    networks: [phishguard]
    mem_limit: 128m
networks:
  phishguard:
volumes:
  postgres_data:
  redis_data:
COMPOSE
        print_success "docker-compose.yml créé"
    else
        print_success "Utilisation du docker-compose.yml du repository"
    fi
    
    # Configuration Nginx
    if [ ! -d "nginx" ] || [ ! -f "nginx/default.conf" ]; then
        print_info "Création de la configuration Nginx..."
        mkdir -p nginx
        cat > nginx/default.conf << 'NGINX'
server {
    listen 80;
    root /var/www/public;
    index index.php index.html;
    client_max_body_size 100M;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
NGINX
        print_success "Configuration Nginx créée"
    else
        print_success "Utilisation de la configuration Nginx du repository"
    fi
}

setup_environment() {
    print_section "Configuration de l'environnement"
    
    # Utiliser .env.example du repo ou créer un .env
    if [ -f ".env.example" ] && [ ! -f ".env" ]; then
        print_info "Copie de .env.example vers .env..."
        cp .env.example .env
        print_success ".env créé depuis .env.example"
    elif [ ! -f ".env" ]; then
        print_info "Création du fichier .env..."
        cat > .env << 'ENV'
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
REDIS_PORT=6379

GEMINI_API_KEY=your_gemini_api_key_here
ENV
        print_success ".env créé"
    else
        print_success ".env existe déjà"
    fi
}

build_and_start() {
    print_section "Construction et démarrage de l'application"
    
    # Déterminer la commande docker-compose
    if docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    print_info "Construction des images Docker (cela peut prendre plusieurs minutes)..."
    $COMPOSE_CMD build --no-cache
    
    print_success "Images Docker construites"
    
    print_info "Démarrage des conteneurs..."
    $COMPOSE_CMD up -d
    
    print_success "Conteneurs démarrés"
    
    # Attendre que les services démarrent
    print_info "Attente du démarrage des services (20 secondes)..."
    sleep 20
    
    # Vérifier l'état des conteneurs
    print_info "État des conteneurs :"
    $COMPOSE_CMD ps
}

initialize_application() {
    print_section "Initialisation de l'application"
    
    # Déterminer la commande docker-compose
    if docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    # Si c'est une application Laravel
    if [ -f "artisan" ]; then
        print_info "Application Laravel détectée, initialisation..."
        
        # Générer la clé d'application
        print_info "Génération de la clé d'application..."
        $COMPOSE_CMD exec -T app php artisan key:generate 2>/dev/null || true
        
        # Créer les dossiers de stockage si nécessaire
        $COMPOSE_CMD exec -T app mkdir -p storage/framework/{cache,sessions,views} 2>/dev/null || true
        $COMPOSE_CMD exec -T app mkdir -p storage/logs 2>/dev/null || true
        $COMPOSE_CMD exec -T app chmod -R 775 storage bootstrap/cache 2>/dev/null || true
        
        # Exécuter les migrations
        print_info "Exécution des migrations de base de données..."
        $COMPOSE_CMD exec -T app php artisan migrate --force 2>/dev/null || true
        
        # Seed de la base de données (optionnel)
        read -p "Voulez-vous insérer des données de test ? (oui/non) : " seed_choice
        if [ "$seed_choice" = "oui" ]; then
            print_info "Insertion des données de test..."
            $COMPOSE_CMD exec -T app php artisan db:seed --force 2>/dev/null || true
        fi
        
        print_success "Application Laravel initialisée"
    else
        print_warning "Pas d'application Laravel détectée"
        
        # Créer une page de test si pas de public/index.php
        if [ ! -f "public/index.php" ]; then
            print_info "Création d'une page de test..."
            mkdir -p public
            cat > public/index.php << 'PHPTEST'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhishGuard BASIC</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 60px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { font-size: 56px; margin-bottom: 20px; }
        .status { 
            background: rgba(76, 175, 80, 0.3);
            padding: 20px;
            border-radius: 10px;
            margin: 30px 0;
        }
        .info { font-size: 18px; opacity: 0.9; }
        .emoji { font-size: 72px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🛡️</div>
        <h1>PhishGuard BASIC</h1>
        <div class="status">
            <h2>✅ Installation réussie !</h2>
            <p class="info">L'application est opérationnelle</p>
        </div>
        <p class="info">
            <?php
            echo "PHP " . phpversion() . " | ";
            echo "Services Docker actifs";
            ?>
        </p>
    </div>
</body>
</html>
PHPTEST
            print_success "Page de test créée"
        fi
    fi
    
    # Permissions finales
    print_info "Application des permissions finales..."
    $COMPOSE_CMD exec -T app chown -R www-data:www-data /var/www 2>/dev/null || true
    $COMPOSE_CMD exec -T app chmod -R 755 /var/www/storage 2>/dev/null || true
    
    print_success "Application initialisée"
}

show_final_info() {
    print_section "Installation terminée !"
    
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ PhishGuard BASIC installé !       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}🌐 URL : ${GREEN}http://localhost:8080${NC}"
    echo -e "${CYAN}📂 Dossier : ${GREEN}$INSTALL_DIR${NC}"
    echo ""
}

# ==================== MAIN ====================

main() {
    print_banner
    
    detect_os
    print_info "Système détecté : $OS_NAME"
    echo ""
    
    # Vérifications des ressources
    check_ram; RAM_STATUS=$?
    check_disk_space; DISK_STATUS=$?
    check_swap
    
    # Vérifications des dépendances
    check_git || install_git
    check_docker || install_docker
    check_docker_compose || install_docker_compose
    check_ports
    
    # Résumé et confirmation
    show_summary; SUMMARY_STATUS=$?
    ask_confirmation $SUMMARY_STATUS
    
    # Installation
    clone_repository
    create_docker_files
    build_and_start
    initialize_app
    show_final_info
}

main "$@"
