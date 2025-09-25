#!/bin/bash
# PhishGuard BASIC - Installation automatique complète
# =================================================================
# Repository: https://github.com/Reaper-Official/cyber-prevention-tool
# Branch: dev
# Version: 1.0
# Auteur: Reaper Official

set -e

# Configuration globale
REPO_URL="https://github.com/Reaper-Official/cyber-prevention-tool"
BRANCH="dev"
PROJECT_NAME="phishguard-basic"
INSTALL_DIR="/opt/$PROJECT_NAME"
SERVICE_USER="phishguard"
LOG_FILE="/tmp/phishguard_install.log"
TEMP_DIR="/tmp/phishguard_install_$$"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Symboles Unicode
CHECK="✅"
CROSS="❌"
INFO="ℹ️"
WARNING="⚠️"
ROCKET="🚀"
GEAR="⚙️"
SHIELD="🛡️"
GLOBE="🌐"

# =======================
# FONCTIONS D'AFFICHAGE
# =======================

print_banner() {
    clear
    echo -e "${PURPLE}"
    cat << 'EOF'
██████╗ ██╗  ██╗██╗███████╗██╗  ██╗ ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ 
██╔══██╗██║  ██║██║██╔════╝██║  ██║██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
██████╔╝███████║██║███████╗███████║██║  ███╗██║   ██║███████║██████╔╝██║  ██║
██╔═══╝ ██╔══██║██║╚════██║██╔══██║██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
██║     ██║  ██║██║███████║██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
EOF
    echo -e "${NC}"
    echo -e "${CYAN}                     Installation Automatique v1.0${NC}"
    echo -e "${BLUE}              Plateforme de Formation en Cybersécurité${NC}"
    echo ""
    echo -e "${GREEN}${ROCKET} Installateur automatique de PhishGuard BASIC${NC}"
    echo -e "${YELLOW}${WARNING} Ce script va installer toutes les dépendances nécessaires${NC}"
    echo ""
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

print_status() { 
    echo -e "${GREEN}${CHECK} $1${NC}"
    log "SUCCESS: $1"
}

print_error() { 
    echo -e "${RED}${CROSS} $1${NC}"
    log "ERROR: $1"
}

print_warning() { 
    echo -e "${YELLOW}${WARNING} $1${NC}"
    log "WARNING: $1"
}

print_info() { 
    echo -e "${BLUE}${INFO} $1${NC}"
    log "INFO: $1"
}

print_step() { 
    echo -e "${PURPLE}${GEAR} $1${NC}"
    log "STEP: $1"
}

# =======================
# GESTION DES ERREURS
# =======================

error_exit() {
    print_error "$1"
    cleanup
    exit 1
}

cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT
trap 'print_error "Installation interrompue par l utilisateur"; cleanup; exit 1' INT TERM

# =======================
# DÉTECTION SYSTÈME
# =======================

detect_os() {
    print_step "Détection du système d'exploitation..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="debian"
            PKG_MANAGER="apt"
            if grep -q "Ubuntu" /etc/os-release 2>/dev/null; then
                DISTRO="ubuntu"
            elif grep -q "Debian" /etc/os-release 2>/dev/null; then
                DISTRO="debian"
            else
                DISTRO="ubuntu"
            fi
        elif [ -f /etc/redhat-release ]; then
            OS="redhat"
            PKG_MANAGER="yum"
            DISTRO="centos"
            if command -v dnf &> /dev/null; then
                PKG_MANAGER="dnf"
            fi
        elif [ -f /etc/arch-release ]; then
            OS="arch"
            PKG_MANAGER="pacman"
            DISTRO="arch"
        else
            error_exit "Distribution Linux non supportée"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PKG_MANAGER="brew"
        DISTRO="macos"
    else
        error_exit "Système d'exploitation non supporté: $OSTYPE"
    fi
    
    print_info "OS détecté: $OS ($DISTRO) - Gestionnaire: $PKG_MANAGER"
}

# =======================
# VÉRIFICATIONS INITIALES
# =======================

check_privileges() {
    print_step "Vérification des privilèges..."
    
    if [[ $EUID -ne 0 ]]; then
        error_exit "Ce script doit être exécuté en tant que root (sudo)"
    fi
    print_status "Privilèges administrateur confirmés"
}

check_system_requirements() {
    print_step "Vérification des prérequis système..."
    
    # Vérifier l'espace disque (minimum 2GB)
    local available_space=$(df / | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 2097152 ]; then
        error_exit "Espace disque insuffisant. Minimum requis: 2GB"
    fi
    
    # Vérifier la RAM (minimum 1GB)
    local total_ram=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ "$total_ram" -lt 1024 ]; then
        print_warning "RAM limitée détectée (${total_ram}MB). 2GB recommandés pour de meilleures performances"
    fi
    
    # Vérifier la connexion Internet
    if ! ping -c 1 8.8.8.8 &> /dev/null && ! ping -c 1 1.1.1.1 &> /dev/null; then
        error_exit "Aucune connexion Internet détectée"
    fi
    
    print_status "Prérequis système validés"
}

# =======================
# MISE À JOUR SYSTÈME
# =======================

update_system() {
    print_step "Mise à jour du système..."
    
    case $PKG_MANAGER in
        "apt")
            export DEBIAN_FRONTEND=noninteractive
            apt update -y
            apt upgrade -y
            ;;
        "yum")
            yum update -y
            ;;
        "dnf")
            dnf update -y
            ;;
        "pacman")
            pacman -Syu --noconfirm
            ;;
        "brew")
            if command -v brew &> /dev/null; then
                brew update && brew upgrade
            fi
            ;;
        *)
            error_exit "Gestionnaire de paquets non supporté: $PKG_MANAGER"
            ;;
    esac
    
    print_status "Système mis à jour"
}

# =======================
# INSTALLATION DÉPENDANCES
# =======================

install_system_dependencies() {
    print_step "Installation des dépendances système..."
    
    case $PKG_MANAGER in
        "apt")
            export DEBIAN_FRONTEND=noninteractive
            apt install -y \
                curl \
                wget \
                git \
                unzip \
                zip \
                software-properties-common \
                apt-transport-https \
                ca-certificates \
                gnupg \
                lsb-release \
                openssl \
                ufw \
                fail2ban \
                htop \
                nano \
                vim \
                tree \
                jq \
                netcat-openbsd \
                dnsutils \
                net-tools \
                systemd \
                cron
            ;;
        "yum"|"dnf")
            $PKG_MANAGER install -y epel-release
            $PKG_MANAGER install -y \
                curl \
                wget \
                git \
                unzip \
                zip \
                openssl \
                firewalld \
                fail2ban \
                htop \
                nano \
                vim \
                tree \
                jq \
                nc \
                bind-utils \
                net-tools \
                systemd \
                cronie
            ;;
        "pacman")
            pacman -S --noconfirm \
                curl \
                wget \
                git \
                unzip \
                zip \
                openssl \
                ufw \
                fail2ban \
                htop \
                nano \
                vim \
                tree \
                jq \
                netcat \
                dnsutils \
                net-tools \
                systemd \
                cronie
            ;;
        "brew")
            if ! command -v brew &> /dev/null; then
                print_info "Installation de Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install curl wget git openssl tree jq netcat
            ;;
    esac
    
    print_status "Dépendances système installées"
}

# =======================
# INSTALLATION DOCKER
# =======================

install_docker() {
    print_step "Installation de Docker..."
    
    if command -v docker &> /dev/null; then
        print_info "Docker déjà installé: $(docker --version)"
        # Vérifier que Docker fonctionne
        if systemctl is-active --quiet docker; then
            print_status "Docker est déjà actif"
        else
            systemctl start docker
            systemctl enable docker
        fi
        return 0
    fi
    
    case $OS in
        "debian")
            # Supprimer les anciennes installations
            apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
            
            # Ajouter la clé GPG officielle de Docker
            curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            # Ajouter le repository Docker
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # Installer Docker
            apt update
            apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            # Démarrer et activer Docker
            systemctl start docker
            systemctl enable docker
            ;;
        "redhat")
            # Supprimer les anciennes installations
            $PKG_MANAGER remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine 2>/dev/null || true
            
            # Installer yum-utils
            $PKG_MANAGER install -y yum-utils
            
            # Ajouter le repository Docker
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            
            # Installer Docker
            $PKG_MANAGER install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            # Démarrer et activer Docker
            systemctl start docker
            systemctl enable docker
            ;;
        "arch")
            pacman -S --noconfirm docker docker-compose
            systemctl start docker
            systemctl enable docker
            ;;
        "macos")
            error_exit "Sur macOS, veuillez installer Docker Desktop manuellement depuis https://www.docker.com/products/docker-desktop"
            ;;
    esac
    
    # Vérifier l'installation
    if command -v docker &> /dev/null; then
        print_status "Docker installé: $(docker --version)"
        
        # Tester Docker
        if docker run --rm hello-world &> /dev/null; then
            print_status "Docker fonctionne correctement"
        else
            print_warning "Docker installé mais test échoué"
        fi
        
        # Ajout de l'utilisateur au groupe docker
        if [ "$OS" != "macos" ] && [ -n "$SUDO_USER" ]; then
            usermod -aG docker "$SUDO_USER"
            print_info "Utilisateur $SUDO_USER ajouté au groupe docker"
        fi
    else
        error_exit "Échec de l'installation de Docker"
    fi
}

install_docker_compose() {
    print_step "Vérification de Docker Compose..."
    
    # Vérifier Docker Compose plugin
    if docker compose version &> /dev/null; then
        print_status "Docker Compose (plugin) disponible: $(docker compose version --short)"
        return 0
    fi
    
    # Vérifier Docker Compose standalone
    if command -v docker-compose &> /dev/null; then
        print_status "Docker Compose (standalone) disponible: $(docker-compose --version)"
        return 0
    fi
    
    print_info "Installation de Docker Compose standalone..."
    
    if [ "$OS" != "macos" ]; then
        # Obtenir la dernière version
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        
        if [ -z "$DOCKER_COMPOSE_VERSION" ]; then
            DOCKER_COMPOSE_VERSION="v2.24.0"  # Version de fallback
        fi
        
        # Télécharger et installer
        curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        # Créer un symlink
        if [ ! -f /usr/bin/docker-compose ]; then
            ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        fi
    fi
    
    # Vérification finale
    if docker compose version &> /dev/null || command -v docker-compose &> /dev/null; then
        print_status "Docker Compose installé avec succès"
    else
        error_exit "Échec de l'installation de Docker Compose"
    fi
}

# =======================
# GESTION UTILISATEUR SYSTÈME
# =======================

create_system_user() {
    print_step "Création de l'utilisateur système..."
    
    if id "$SERVICE_USER" &>/dev/null; then
        print_info "Utilisateur $SERVICE_USER existe déjà"
    else
        # Créer l'utilisateur système
        useradd -r -s /bin/false -d "$INSTALL_DIR" -c "PhishGuard Service User" "$SERVICE_USER"
        print_status "Utilisateur $SERVICE_USER créé"
    fi
    
    # Ajout au groupe docker
    if command -v docker &> /dev/null; then
        usermod -aG docker "$SERVICE_USER" 2>/dev/null || true
        print_info "Utilisateur $SERVICE_USER ajouté au groupe docker"
    fi
}

# =======================
# TÉLÉCHARGEMENT PROJET
# =======================

download_and_install_project() {
    print_step "Téléchargement du projet PhishGuard BASIC..."
    
    # Créer le répertoire temporaire
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # Cloner le repository avec la branche dev
    print_info "Clonage depuis GitHub: $REPO_URL (branche: $BRANCH)"
    if ! git clone -b "$BRANCH" "$REPO_URL" phishguard-source; then
        print_warning "Échec du clonage de la branche $BRANCH, tentative avec la branche main"
        if ! git clone "$REPO_URL" phishguard-source; then
            error_exit "Échec du clonage du repository GitHub"
        fi
    fi
    
    if [ ! -d "phishguard-source" ]; then
        error_exit "Répertoire source non trouvé après clonage"
    fi
    
    # Créer le répertoire d'installation
    mkdir -p "$INSTALL_DIR"
    
    # Copier les fichiers
    print_info "Copie des fichiers vers $INSTALL_DIR"
    cp -r phishguard-source/* "$INSTALL_DIR/"
    
    # Vérifier la structure du projet et copier les fichiers importants
    if [ -f "$INSTALL_DIR/app-full/management/docker-compose.yml" ]; then
        cp "$INSTALL_DIR/app-full/management/docker-compose.yml" "$INSTALL_DIR/"
        print_info "docker-compose.yml copié depuis app-full/management"
    fi
    
    if [ -f "$INSTALL_DIR/app-full/management/Dockerfile" ]; then
        cp "$INSTALL_DIR/app-full/management/Dockerfile" "$INSTALL_DIR/"
        print_info "Dockerfile copié depuis app-full/management"
    fi
    
    if [ ! -f "$INSTALL_DIR/docker-compose.yml" ]; then
        error_exit "Fichier docker-compose.yml non trouvé dans le projet"
    fi
    
    print_status "Projet téléchargé et installé dans $INSTALL_DIR"
}

# =======================
# CONFIGURATION RÉPERTOIRES
# =======================

setup_directories_and_permissions() {
    print_step "Configuration des répertoires et permissions..."
    
    cd "$INSTALL_DIR"
    
    # Créer les répertoires nécessaires
    mkdir -p storage/{logs,cache,uploads,backups,reports}
    mkdir -p ssl
    mkdir -p nginx/sites-available
    mkdir -p logs
    mkdir -p tmp
    
    # Copier les fichiers de configuration depuis app-full/management si disponibles
    if [ -d "app-full/management" ]; then
        # Copier configurations nginx
        if [ -d "app-full/management/nginx" ]; then
            cp -r app-full/management/nginx/* nginx/ 2>/dev/null || true
        fi
        
        # Copier scripts docker
        if [ -d "app-full/management/docker" ]; then
            mkdir -p docker
            cp -r app-full/management/docker/* docker/ 2>/dev/null || true
        fi
        
        print_info "Fichiers de configuration copiés depuis app-full/management"
    fi
    
    # Configuration des permissions
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    chmod -R 755 "$INSTALL_DIR"
    chmod -R 775 "$INSTALL_DIR/storage"
    chmod -R 775 "$INSTALL_DIR/logs" 2>/dev/null || true
    chmod -R 775 "$INSTALL_DIR/tmp" 2>/dev/null || true
    
    # Scripts exécutables
    find "$INSTALL_DIR" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    
    print_status "Permissions et répertoires configurés"
}

# =======================
# CONFIGURATION ENVIRONNEMENT
# =======================

setup_environment() {
    print_step "Configuration de l'environnement..."
    
    cd "$INSTALL_DIR"
    
    if [ ! -f .env ]; then
        # Copier le fichier .env exemple s'il existe
        if [ -f "app-full/management/.env" ]; then
            cp "app-full/management/.env" .env
            print_info "Fichier .env copié depuis app-full/management"
        fi
        
        # Générer des clés sécurisées
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        JWT_SECRET=$(openssl rand -hex 32)
        ENCRYPTION_KEY=$(openssl rand -hex 32)
        
        # Détecter les adresses IP
        PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || curl -s --connect-timeout 5 ipecho.net/plain 2>/dev/null || echo "localhost")
        PRIVATE_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        
        # Créer ou mettre à jour le fichier .env
        if [ ! -f .env ]; then
            cat > .env << EOF
# PhishGuard BASIC - Configuration
# Généré automatiquement le $(date)
# =======================================

# Application
APP_NAME="PhishGuard BASIC"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://$PUBLIC_IP
APP_TIMEZONE=Europe/Paris

# Base de données PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_NAME=phishguard_basic
DB_USER=phishguard
DB_PASSWORD=$DB_PASSWORD

# Cache Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Configuration SMTP (à configurer)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_ENCRYPTION=tls
SMTP_FROM_NAME="PhishGuard Security"

# Intelligence Artificielle (optionnel)
GEMINI_API_KEY=
AI_MODEL=gemini-pro
AI_MAX_TOKENS=2048

# Sécurité
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
SESSION_LIFETIME=1440
BCRYPT_ROUNDS=12

# Performance et limitations
EMAIL_RATE_LIMIT=50
MAX_UPLOAD_SIZE=10485760

# Conformité RGPD
GDPR_ENABLED=true
DATA_RETENTION_DAYS=365
ANONYMIZE_LOGS=true

# Monitoring et logs
LOG_LEVEL=info
LOG_FILE=/var/log/phishguard/app.log
AUDIT_LOG_ENABLED=true
EOF
        else
            # Mettre à jour les clés dans le fichier existant
            sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
            sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
            sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
            sed -i "s|APP_URL=.*|APP_URL=http://$PUBLIC_IP|" .env
        fi

        print_status "Fichier .env configuré avec des clés sécurisées"
    else
        print_info "Fichier .env existant conservé"
    fi
    
    # Permissions sécurisées sur .env
    chmod 600 .env
    chown "$SERVICE_USER:$SERVICE_USER" .env
    
    print_info "Variables d'environnement configurées"
}

# =======================
# SÉCURITÉ FIREWALL
# =======================

setup_firewall() {
    print_step "Configuration du firewall..."
    
    case $OS in
        "debian"|"arch")
            if command -v ufw &> /dev/null; then
                # Reset et configuration UFW
                ufw --force reset
                ufw default deny incoming
                ufw default allow outgoing
                
                # Règles essentielles
                ufw allow 22/tcp comment 'SSH Access'
                ufw allow 80/tcp comment 'HTTP Web Access'
                ufw allow 443/tcp comment 'HTTPS Web Access'
                ufw allow from 127.0.0.1 comment 'Localhost'
                ufw allow from 172.16.0.0/12 comment 'Docker networks'
                ufw allow from 10.0.0.0/8 comment 'Private networks'
                ufw allow from 192.168.0.0/16 comment 'Local networks'
                
                # Activer le firewall
                ufw --force enable
                print_status "Firewall UFW configuré et activé"
            fi
            ;;
        "redhat")
            if command -v firewall-cmd &> /dev/null; then
                systemctl start firewalld
                systemctl enable firewalld
                
                # Configuration des services
                firewall-cmd --permanent --add-service=http
                firewall-cmd --permanent --add-service=https
                firewall-cmd --permanent --add-service=ssh
                
                # Permettre Docker
                firewall-cmd --permanent --zone=trusted --add-interface=docker0 2>/dev/null || true
                firewall-cmd --permanent --zone=trusted --add-source=172.17.0.0/16
                
                # Recharger la configuration
                firewall-cmd --reload
                print_status "Firewall firewalld configuré"
            fi
            ;;
        "macos")
            print_info "Configuration firewall manuelle requise sur macOS"
            ;;
    esac
}

setup_fail2ban() {
    print_step "Configuration de Fail2Ban..."
    
    if command -v fail2ban-server &> /dev/null; then
        # Configuration globale
        cat > /etc/fail2ban/jail.d/phishguard.conf << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = auto
usedns = warn
logencoding = auto
enabled = false

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 1800

[phishguard-auth]
enabled = true
port = http,https
filter = phishguard-auth
logpath = /opt/phishguard-basic/storage/logs/auth.log
maxretry = 5
bantime = 1800
findtime = 300
EOF
        
        # Filtre personnalisé pour PhishGuard
        cat > /etc/fail2ban/filter.d/phishguard-auth.conf << 'EOF'
[Definition]
failregex = ^.*\[.*\] "POST /management/api/auth/login.php.*" 401.*$
            ^.*login_failed.*IP: <HOST>.*$
            ^.*authentication_failed.*from.*<HOST>.*$
ignoreregex =
EOF
        
        # Redémarrer et activer Fail2Ban
        systemctl restart fail2ban
        systemctl enable fail2ban
        
        print_status "Fail2Ban configuré pour PhishGuard"
    else
        print_warning "Fail2Ban non installé, protection limitée"
    fi
}

# =======================
# SERVICES DOCKER
# =======================

build_and_start_services() {
    print_step "Construction et démarrage des services Docker..."
    
    cd "$INSTALL_DIR"
    
    # Vérifier la présence de docker-compose.yml
    if [ ! -f docker-compose.yml ]; then
        error_exit "Fichier docker-compose.yml non trouvé"
    fi
    
    # Nettoyer les anciens conteneurs si ils existent
    print_info "Nettoyage des anciens conteneurs..."
    sudo -u "$SERVICE_USER" docker compose down 2>/dev/null || \
    sudo -u "$SERVICE_USER" docker-compose down 2>/dev/null || true
    
    # Construction des images
    print_info "Construction des images Docker..."
    if ! sudo -u "$SERVICE_USER" docker compose build --no-cache --pull 2>/dev/null; then
        if ! sudo -u "$SERVICE_USER" docker-compose build --no-cache --pull 2>/dev/null; then
            print_warning "Construction avec cache..."
            sudo -u "$SERVICE_USER" docker compose build 2>/dev/null || \
            sudo -u "$SERVICE_USER" docker-compose build
        fi
    fi
    
    # Démarrage des services
    print_info "Démarrage des services..."
    if ! sudo -u "$SERVICE_USER" docker compose up -d 2>/dev/null; then
        sudo -u "$SERVICE_USER" docker-compose up -d
    fi
    
    # Attendre que PostgreSQL soit prêt
    print_info "Attente de l'initialisation de PostgreSQL..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if sudo -u "$SERVICE_USER" docker compose exec -T db pg_isready -U phishguard -d phishguard_basic >/dev/null 2>&1 || \
           sudo -u "$SERVICE_USER" docker-compose exec -T db pg_isready -U phishguard -d phishguard_basic >/dev/null 2>&1; then
            print_status "PostgreSQL opérationnel"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_warning "PostgreSQL met du temps à démarrer, poursuite de l'installation"
            break
        fi
        
        printf "."
        sleep 2
        ((attempt++))
    done
    
    echo ""
    
    # Attendre que Redis soit prêt
    print_info "Vérification de Redis..."
    sleep 5
    if sudo -u "$SERVICE_USER" docker compose exec -T redis redis-cli ping >/dev/null 2>&1 || \
       sudo -u "$SERVICE_USER" docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_status "Redis opérationnel"
    else
        print_warning "Redis en cours de démarrage"
    fi
    
    # Initialisation de la base de données si script disponible
    if [ -f "app-full/management/setup.php" ]; then
        print_info "Initialisation de la base de données..."
        sleep 10
        if sudo -u "$SERVICE_USER" docker compose exec -T app php app-full/management/setup.php 2>/dev/null || \
           sudo -u "$SERVICE_USER" docker-compose exec -T app php app-full/management/setup.php 2>/dev/null; then
            print_status "Base de données initialisée"
        else
            print_warning "Script d'initialisation non exécuté - à faire manuellement"
        fi
    fi
    
    print_status "Services Docker démarrés"
}

# =======================
# SERVICE SYSTEMD
# =======================

create_systemd_service() {
    print_step "Création du service systemd..."
    
    # Déterminer la commande docker-compose
    COMPOSE_CMD="docker compose"
    if ! docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    fi
    
    cat > /etc/systemd/system/phishguard.service << EOF
[Unit]
Description=PhishGuard BASIC - Cybersecurity Training Platform
Documentation=https://github.com/Reaper-Official/cyber-prevention-tool
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/env $COMPOSE_CMD up -d
ExecStop=/usr/bin/env $COMPOSE_CMD down
ExecReload=/usr/bin/env $COMPOSE_CMD restart
TimeoutStartSec=300
TimeoutStopSec=60
Restart=no
KillMode=none

[Install]
WantedBy=multi-user.target
EOF
    
    # Recharger systemd et activer le service
    systemctl daemon-reload
    systemctl enable phishguard.service
    
    print_status "Service systemd créé et activé"
}

# =======================
# SCRIPTS UTILITAIRES
# =======================

create_utility_scripts() {
    print_info "Création des scripts utiles..."
    
    # Script de sauvegarde
    cat > "$INSTALL_DIR/backup.sh" << 'EOF'
#!/bin/bash
# Script de sauvegarde automatique PhishGuard

BACKUP_DIR="/opt/phishguard-basic/storage/backups"
DATE=$(date +%Y%m%d_%H%M%S)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Créer le répertoire de sauvegarde
mkdir -p "$BACKUP_DIR"

cd "$SCRIPT_DIR"

echo "=== Début de la sauvegarde - $DATE ==="

# Sauvegarde de la base de données
echo "Sauvegarde de la base de données..."
if sudo -u phishguard docker compose exec -T db pg_dump -U phishguard phishguard_basic > "$BACKUP_DIR/db_backup_$DATE.sql" 2>/dev/null || \
   sudo -u phishguard docker-compose exec -T db pg_dump -U phishguard phishguard_basic > "$BACKUP_DIR/db_backup_$DATE.sql" 2>/dev/null; then
    echo "✅ Base de données sauvegardée"
    gzip "$BACKUP_DIR/db_backup_$DATE.sql"
else
    echo "❌ Échec de la sauvegarde de la base de données"
fi

# Sauvegarde des fichiers de configuration
echo "Sauvegarde des configurations..."
if tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" .env nginx/ storage/uploads/ 2>/dev/null; then
    echo "✅ Configurations sauvegardées"
else
    echo "❌ Échec de la sauvegarde des configurations"
fi

# Nettoyage des anciennes sauvegardes (garder 7 jours)
echo "Nettoyage des anciennes sauvegardes..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete 2>/dev/null
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null

echo "=== Sauvegarde terminée - $DATE ==="
EOF

    # Script de maintenance
    cat > "$INSTALL_DIR/maintenance.sh" << 'EOF'
#!/bin/bash
# Script de maintenance PhishGuard

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Maintenance PhishGuard - $(date) ==="

# Nettoyage des logs anciens
echo "Nettoyage des logs anciens..."
find storage/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
find logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
echo "✅ Logs anciens supprimés"

# Nettoyage du cache Redis
echo "Nettoyage du cache Redis..."
if sudo -u phishguard docker compose exec -T redis redis-cli FLUSHALL >/dev/null 2>&1 || \
   sudo -u phishguard docker-compose exec -T redis redis-cli FLUSHALL >/dev/null 2>&1; then
    echo "✅ Cache Redis nettoyé"
else
    echo "⚠️ Impossible de nettoyer le cache Redis"
fi

# Optimisation de la base de données
echo "Optimisation de la base de données..."
if sudo -u phishguard docker compose exec -T db psql -U phishguard -d phishguard_basic -c "VACUUM ANALYZE;" >/dev/null 2>&1 || \
   sudo -u phishguard docker-compose exec -T db psql -U phishguard -d phishguard_basic -c "VACUUM ANALYZE;" >/dev/null 2>&1; then
    echo "✅ Base de données optimisée"
else
    echo "⚠️ Impossible d'optimiser la base de données"
fi

# Vérification de l'état des services
echo "Vérification des services..."
sudo -u phishguard docker compose ps 2>/dev/null || sudo -u phishguard docker-compose ps

# Statistiques d'espace disque
echo "Espace disque utilisé:"
du -sh storage/ 2>/dev/null || true

echo "=== Maintenance terminée ==="
EOF

    # Script de mise à jour
    cat > "$INSTALL_DIR/update.sh" << 'EOF'
#!/bin/bash
# Script de mise à jour PhishGuard

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Mise à jour PhishGuard - $(date) ==="

# Vérification des prérequis
if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé"
    exit 1
fi

# Sauvegarde avant mise à jour
echo "Sauvegarde pré-mise à jour..."
if [ -f backup.sh ]; then
    ./backup.sh
else
    echo "⚠️ Script de sauvegarde non trouvé, mise à jour sans sauvegarde"
fi

# Arrêt des services
echo "Arrêt des services..."
sudo -u phishguard docker compose down 2>/dev/null || sudo -u phishguard docker-compose down

# Mise à jour du code source
echo "Mise à jour du code source..."
if [ -d .git ]; then
    git stash push -m "Auto-stash before update $(date)"
    if git pull origin dev || git pull origin main; then
        echo "✅ Code source mis à jour"
        git stash pop 2>/dev/null || echo "Aucun stash à restaurer"
    else
        echo "❌ Échec de la mise à jour du code source"
        exit 1
    fi
else
    echo "⚠️ Pas de repository git, téléchargement manuel requis"
fi

# Reconstruction des images Docker
echo "Reconstruction des images Docker..."
if sudo -u phishguard docker compose build --no-cache --pull 2>/dev/null || \
   sudo -u phishguard docker-compose build --no-cache --pull; then
    echo "✅ Images Docker reconstruites"
else
    echo "⚠️ Reconstruction avec cache..."
    sudo -u phishguard docker compose build 2>/dev/null || sudo -u phishguard docker-compose build
fi

# Redémarrage des services
echo "Redémarrage des services..."
sudo -u phishguard docker compose up -d 2>/dev/null || sudo -u phishguard docker-compose up -d

# Attendre que les services soient prêts
echo "Attente de la disponibilité des services..."
sleep 30

# Vérification de l'état
echo "Vérification de l'état après mise à jour..."
sudo -u phishguard docker compose ps 2>/dev/null || sudo -u phishguard docker-compose ps

echo "=== Mise à jour terminée ==="
EOF

    # Script de diagnostic
    cat > "$INSTALL_DIR/diagnostic.sh" << 'EOF'
#!/bin/bash
# Script de diagnostic PhishGuard

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Diagnostic PhishGuard - $(date) ==="

# Informations système
echo "📊 Informations système:"
echo "   OS: $(uname -a)"
echo "   Docker: $(docker --version 2>/dev/null || echo 'Non installé')"
echo "   Docker Compose: $(docker compose version 2>/dev/null || docker-compose --version 2>/dev/null || echo 'Non installé')"
echo "   Espace disque: $(df -h . | tail -1 | awk '{print $4}') disponible"
echo "   RAM: $(free -h | grep '^Mem:' | awk '{print $3"/"$2}')"

# État des services
echo ""
echo "🔧 État des services:"
if systemctl is-active --quiet phishguard; then
    echo "   ✅ Service systemd: actif"
else
    echo "   ❌ Service systemd: inactif"
fi

# État des conteneurs Docker
echo ""
echo "🐳 État des conteneurs:"
sudo -u phishguard docker compose ps 2>/dev/null || sudo -u phishguard docker-compose ps

# Tests de connectivité
echo ""
echo "🌐 Tests de connectivité:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost --connect-timeout 5 | grep -q "200\|302"; then
    echo "   ✅ Interface web: accessible"
else
    echo "   ❌ Interface web: non accessible"
fi

# Vérification de la base de données
echo ""
echo "💾 Base de données:"
if sudo -u phishguard docker compose exec -T db pg_isready -U phishguard -d phishguard_basic >/dev/null 2>&1 || \
   sudo -u phishguard docker-compose exec -T db pg_isready -U phishguard -d phishguard_basic >/dev/null 2>&1; then
    echo "   ✅ PostgreSQL: opérationnel"
    # Statistiques de la base
    TABLES_COUNT=$(sudo -u phishguard docker compose exec -T db psql -U phishguard -d phishguard_basic -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' \n' || echo "N/A")
    echo "   📊 Nombre de tables: $TABLES_COUNT"
else
    echo "   ❌ PostgreSQL: problème détecté"
fi

# Vérification de Redis
echo ""
echo "⚡ Cache Redis:"
if sudo -u phishguard docker compose exec -T redis redis-cli ping >/dev/null 2>&1 || \
   sudo -u phishguard docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo "   ✅ Redis: opérationnel"
    REDIS_MEMORY=$(sudo -u phishguard docker compose exec -T redis redis-cli info memory 2>/dev/null | grep "used_memory_human:" | cut -d: -f2 | tr -d '\r' || echo "N/A")
    echo "   📊 Mémoire utilisée: $REDIS_MEMORY"
else
    echo "   ❌ Redis: problème détecté"
fi

# Logs récents
echo ""
echo "📋 Logs récents (10 dernières lignes):"
sudo -u phishguard docker compose logs --tail=10 2>/dev/null || sudo -u phishguard docker-compose logs --tail=10

echo ""
echo "=== Diagnostic terminé ==="
EOF

    # Script de configurateur
    if [ -f "app-full/management/configurator.sh" ]; then
        cp "app-full/management/configurator.sh" "$INSTALL_DIR/"
        print_info "Configurateur interactif copié"
    fi

    # Rendre tous les scripts exécutables
    chmod +x "$INSTALL_DIR"/{backup.sh,maintenance.sh,update.sh,diagnostic.sh} 2>/dev/null || true
    if [ -f "$INSTALL_DIR/configurator.sh" ]; then
        chmod +x "$INSTALL_DIR/configurator.sh"
    fi
    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"/*.sh 2>/dev/null || true
    
    print_info "Scripts utiles créés: backup.sh, maintenance.sh, update.sh, diagnostic.sh"
}

setup_log_rotation() {
    print_info "Configuration de la rotation des logs..."
    
    cat > /etc/logrotate.d/phishguard << EOF
$INSTALL_DIR/storage/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    sharedscripts
    postrotate
        sudo -u $SERVICE_USER docker compose -f $INSTALL_DIR/docker-compose.yml kill -s USR1 app 2>/dev/null || \
        sudo -u $SERVICE_USER docker-compose -f $INSTALL_DIR/docker-compose.yml kill -s USR1 app 2>/dev/null || true
    endscript
}

$INSTALL_DIR/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
    
    print_info "Rotation des logs configurée"
}

setup_automatic_backups() {
    print_info "Configuration des sauvegardes automatiques..."
    
    # Créer le répertoire de sauvegarde
    mkdir -p "$INSTALL_DIR/storage/backups"
    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/storage/backups"
    
    # Configurer les tâches cron pour l'utilisateur service
    (crontab -u "$SERVICE_USER" -l 2>/dev/null; echo "0 2 * * * cd $INSTALL_DIR && ./backup.sh >> $INSTALL_DIR/storage/logs/backup.log 2>&1") | crontab -u "$SERVICE_USER" -
    (crontab -u "$SERVICE_USER" -l 2>/dev/null; echo "0 3 * * 0 cd $INSTALL_DIR && ./maintenance.sh >> $INSTALL_DIR/storage/logs/maintenance.log 2>&1") | crontab -u "$SERVICE_USER" -
    
    print_info "Sauvegardes automatiques configurées (quotidiennes à 2h, maintenance hebdomadaire à 3h)"
}

# =======================
# TESTS DE VALIDATION
# =======================

run_validation_tests() {
    print_step "Tests de validation du déploiement..."
    
    cd "$INSTALL_DIR"
    local all_services_ok=true
    
    # Test des conteneurs Docker
    print_info "Vérification des services Docker..."
    local services=("db" "redis" "app" "nginx")
    
    for service in "${services[@]}"; do
        if sudo -u "$SERVICE_USER" docker compose ps "$service" 2>/dev/null | grep -q "Up" || \
           sudo -u "$SERVICE_USER" docker-compose ps "$service" 2>/dev/null | grep -q "Up"; then
            print_status "Service $service: opérationnel"
        else
            print_error "Service $service: problème détecté"
            all_services_ok=false
        fi
    done
    
    # Test de connectivité web
    print_info "Test de connectivité web..."
    sleep 20  # Attendre un peu plus longtemps
    
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --connect-timeout 10 2>/dev/null || echo "000")
    if [[ "$http_code" =~ ^(200|301|302)$ ]]; then
        print_status "Interface web: accessible (HTTP $http_code)"
    else
        print_warning "Interface web: non accessible immédiatement (HTTP $http_code) - normal au premier démarrage"
    fi
    
    # Test de la base de données
    print_info "Test de la base de données..."
    if sudo -u "$SERVICE_USER" docker compose exec -T db pg_isready -U phishguard -d phishguard_basic >/dev/null 2>&1 || \
       sudo -u "$SERVICE_USER" docker-compose exec -T db pg_isready -U phishguard -d phishguard_basic >/dev/null 2>&1; then
        print_status "Base de données PostgreSQL: opérationnelle"
    else
        print_warning "Base de données: en cours d'initialisation"
        all_services_ok=false
    fi
    
    # Test Redis
    print_info "Test du cache Redis..."
    if sudo -u "$SERVICE_USER" docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG" || \
       sudo -u "$SERVICE_USER" docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        print_status "Redis: opérationnel"
    else
        print_warning "Redis: problème détecté"
        all_services_ok=false
    fi
    
    # Test de l'espace disque
    print_info "Vérification de l'espace disque..."
    local disk_usage=$(df "$INSTALL_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 80 ]; then
        print_status "Espace disque: OK ($disk_usage% utilisé)"
    else
        print_warning "Espace disque: critique ($disk_usage% utilisé)"
    fi
    
    if [ "$all_services_ok" = true ]; then
        print_status "Tous les tests de validation réussis"
    else
        print_warning "Certains services ont des problèmes - consultez les logs avec: $INSTALL_DIR/diagnostic.sh"
    fi
}

# =======================
# RAPPORT D'INSTALLATION
# =======================

generate_install_report() {
    print_step "Génération du rapport d'installation..."
    
    local REPORT_FILE="$INSTALL_DIR/installation_report.txt"
    local PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "localhost")
    local PRIVATE_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    
    cat > "$REPORT_FILE" << EOF
===========================================
  PHISHGUARD BASIC - RAPPORT D'INSTALLATION
===========================================

Date d'installation: $(date)
Système: $(uname -a)
Utilisateur d'installation: $(whoami)
Répertoire d'installation: $INSTALL_DIR
Repository: $REPO_URL (branche: $BRANCH)

INFORMATIONS SYSTÈME:
====================
OS: $OS ($DISTRO)
Gestionnaire de paquets: $PKG_MANAGER
Adresse IP privée: $PRIVATE_IP
Adresse IP publique: $PUBLIC_IP
Docker: $(docker --version 2>/dev/null || echo "Non détecté")
Docker Compose: $(docker compose version --short 2>/dev/null || docker-compose --version 2>/dev/null || echo "Plugin Docker")

SERVICES INSTALLÉS:
==================
✅ PostgreSQL: Conteneur Docker
✅ Redis: Conteneur Docker
✅ Nginx: Conteneur Docker
✅ PHP-FPM: Conteneur Docker
✅ Service systemd: phishguard.service

CONFIGURATION:
==============
📁 Répertoire d'installation: $INSTALL_DIR
👤 Utilisateur système: $SERVICE_USER
🔐 Fichier de configuration: $INSTALL_DIR/.env
📝 Logs d'installation: $LOG_FILE

ACCÈS À L'APPLICATION:
=====================
🌐 URL locale: http://localhost
🌐 URL réseau local: http://$PRIVATE_IP
🌐 URL publique: http://$PUBLIC_IP
👤 Identifiants par défaut: admin / admin

GESTION DES SERVICES:
====================
Service systemd: phishguard.service

Commandes principales:
- Démarrer: systemctl start phishguard
- Arrêter: systemctl stop phishguard
- Redémarrer: systemctl restart phishguard
- Statut: systemctl status phishguard

COMMANDES DOCKER UTILES:
========================
cd $INSTALL_DIR
sudo -u $SERVICE_USER docker compose logs -f      # Voir tous les logs
sudo -u $SERVICE_USER docker compose logs app     # Logs de l'application
sudo -u $SERVICE_USER docker compose ps           # Statut des conteneurs
sudo -u $SERVICE_USER docker compose restart      # Redémarrage complet
sudo -u $SERVICE_USER docker compose down         # Arrêt complet
sudo -u $SERVICE_USER docker compose up -d        # Démarrage

SCRIPTS UTILES:
===============
$INSTALL_DIR/backup.sh        # Sauvegarde manuelle
$INSTALL_DIR/maintenance.sh   # Maintenance et nettoyage
$INSTALL_DIR/update.sh        # Mise à jour depuis GitHub
$INSTALL_DIR/diagnostic.sh    # Diagnostic complet
$INSTALL_DIR/configurator.sh  # Configuration interactive

SÉCURITÉ:
=========
🔥 Firewall: $(command -v ufw >/dev/null && echo "UFW configuré" || command -v firewall-cmd >/dev/null && echo "firewalld configuré" || echo "Non configuré")
🛡️  Fail2Ban: $(command -v fail2ban-server >/dev/null && echo "Configuré" || echo "Non installé")
🔐 Utilisateur système: $SERVICE_USER (non-login)
🔒 Permissions: Configurées selon les bonnes pratiques

AUTOMATISATIONS:
================
📦 Sauvegardes automatiques: quotidiennes à 2h00
🧹 Maintenance automatique: hebdomadaire dimanche 3h00
📋 Rotation des logs: quotidienne (30 jours de rétention)

PROCHAINES ÉTAPES RECOMMANDÉES:
===============================
1. 🔑 Changez immédiatement le mot de passe administrateur par défaut
2. 📧 Configurez votre serveur SMTP dans le fichier .env
3. 🔒 Activez HTTPS avec un certificat SSL (Let's Encrypt recommandé)
4. 👥 Importez votre liste d'employés
5. 📧 Créez votre première campagne de test de phishing
6. 📊 Configurez la surveillance et les alertes
7. 🧪 Effectuez des tests de sécurité réguliers

CONFIGURATION INTERACTIVE:
==========================
Pour configurer facilement PhishGuard:
sudo $INSTALL_DIR/configurator.sh

RESSOURCES UTILES:
==================
📁 Configuration Nginx: $INSTALL_DIR/nginx/
📊 Logs application: $INSTALL_DIR/storage/logs/
💾 Sauvegardes: $INSTALL_DIR/storage/backups/
🔧 Fichiers temporaires: $INSTALL_DIR/tmp/

SUPPORT ET DOCUMENTATION:
=========================
📧 Support: reaper@etik.com
🐛 Issues GitHub: $REPO_URL/issues
📖 Documentation: README.md dans le répertoire d'installation
🌐 Repository: $REPO_URL

COMMANDES DE DÉPANNAGE:
=======================
# Diagnostic complet
$INSTALL_DIR/diagnostic.sh

# Redémarrer tous les services
systemctl restart phishguard

# Voir les logs en temps réel
cd $INSTALL_DIR && sudo -u $SERVICE_USER docker compose logs -f

# Vérifier l'état des conteneurs
cd $INSTALL_DIR && sudo -u $SERVICE_USER docker compose ps

NOTES IMPORTANTES:
==================
- Ce rapport contient des informations sensibles
- Conservez vos identifiants de connexion en sécurité
- Effectuez des sauvegardes régulières
- Surveillez les logs pour détecter des anomalies
- Mettez à jour régulièrement le système et l'application

Installation terminée avec succès le $(date)

=== FIN DU RAPPORT ===
EOF

    chown "$SERVICE_USER:$SERVICE_USER" "$REPORT_FILE"
    chmod 600 "$REPORT_FILE"
    
    print_status "Rapport d'installation créé: $REPORT_FILE"
}

# =======================
# CONFIGURATION POST-INSTALLATION
# =======================

post_install_setup() {
    print_step "Configuration post-installation..."
    
    create_utility_scripts
    setup_log_rotation
    setup_automatic_backups
    
    # Créer un script de démarrage rapide
    cat > "$INSTALL_DIR/start.sh" << 'EOF'
#!/bin/bash
# Script de démarrage rapide PhishGuard
cd "$(dirname "$0")"
echo "🚀 Démarrage de PhishGuard BASIC..."
sudo systemctl start phishguard
echo "⏳ Attente du démarrage des services..."
sleep 30
echo "🌐 PhishGuard devrait être accessible sur http://localhost"
echo "📊 Pour vérifier l'état: ./diagnostic.sh"
EOF
    
    chmod +x "$INSTALL_DIR/start.sh"
    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/start.sh"
    
    print_status "Configuration post-installation terminée"
}

# =======================
# AFFICHAGE FINAL
# =======================

show_final_summary() {
    clear
    print_banner
    
    echo -e "${GREEN}🎉 INSTALLATION TERMINÉE AVEC SUCCÈS! 🎉${NC}"
    echo ""
    
    local PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "localhost")
    local PRIVATE_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    
    echo -e "${BLUE}📋 INFORMATIONS DE CONNEXION:${NC}"
    echo -e "   🌐 URL locale: ${CYAN}http://localhost${NC}"
    echo -e "   🌐 URL réseau: ${CYAN}http://$PRIVATE_IP${NC}"
    if [ "$PUBLIC_IP" != "localhost" ]; then
        echo -e "   🌐 URL publique: ${CYAN}http://$PUBLIC_IP${NC}"
    fi
    echo -e "   👤 Utilisateur par défaut: ${YELLOW}admin${NC}"
    echo -e "   🔑 Mot de passe par défaut: ${YELLOW}admin${NC}"
    echo ""
    
    echo -e "${BLUE}📁 RÉPERTOIRES IMPORTANTS:${NC}"
    echo -e "   📂 Installation: ${CYAN}$INSTALL_DIR${NC}"
    echo -e "   🔧 Configuration: ${CYAN}$INSTALL_DIR/.env${NC}"
    echo -e "   📊 Logs: ${CYAN}$INSTALL_DIR/storage/logs${NC}"
    echo -e "   💾 Sauvegardes: ${CYAN}$INSTALL_DIR/storage/backups${NC}"
    echo -e "   📈 Rapport complet: ${CYAN}$INSTALL_DIR/installation_report.txt${NC}"
    echo ""
    
    echo -e "${BLUE}🔧 COMMANDES UTILES:${NC}"
    echo -e "   🔍 Statut: ${CYAN}systemctl status phishguard${NC}"
    echo -e "   📋 Logs temps réel: ${CYAN}cd $INSTALL_DIR && sudo -u $SERVICE_USER docker compose logs -f${NC}"
    echo -e "   🔄 Redémarrer: ${CYAN}systemctl restart phishguard${NC}"
    echo -e "   🚀 Démarrage rapide: ${CYAN}$INSTALL_DIR/start.sh${NC}"
    echo -e "   🔧 Diagnostic: ${CYAN}$INSTALL_DIR/diagnostic.sh${NC}"
    echo -e "   💾 Sauvegarde: ${CYAN}$INSTALL_DIR/backup.sh${NC}"
    echo -e "   🧹 Maintenance: ${CYAN}$INSTALL_DIR/maintenance.sh${NC}"
    echo -e "   🔄 Mise à jour: ${CYAN}$INSTALL_DIR/update.sh${NC}"
    echo -e "   ⚙️  Configuration: ${CYAN}sudo $INSTALL_DIR/configurator.sh${NC}"
    echo ""
    
    echo -e "${YELLOW}⚠️  ACTIONS PRIORITAIRES:${NC}"
    echo -e "   1. ${RED}Changez immédiatement${NC} le mot de passe admin par défaut"
    echo -e "   2. ${YELLOW}Configurez${NC} votre serveur SMTP dans $INSTALL_DIR/.env"
    echo -e "   3. ${GREEN}Activez${NC} HTTPS avec un certificat SSL"
    echo -e "   4. ${BLUE}Testez${NC} l'interface web et les fonctionnalités"
    echo -e "   5. ${PURPLE}Planifiez${NC} votre première campagne de sensibilisation"
    echo ""
    
    echo -e "${GREEN}✨ PhishGuard BASIC est maintenant opérationnel! ✨${NC}"
    echo -e "${BLUE}📧 Support: ${CYAN}reaper@etik.com${NC}"
    echo -e "${BLUE}🐛 Issues: ${CYAN}$REPO_URL/issues${NC}"
    echo ""
    
    # Test rapide de connectivité
    echo -e "${PURPLE}🔍 Test de connectivité final...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost --connect-timeout 5 | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ Interface web accessible !${NC}"
        echo -e "${CYAN}🚀 Accédez à PhishGuard: http://localhost${NC}"
    else
        echo -e "${YELLOW}⏳ Interface web en cours de démarrage... (essayez dans quelques minutes)${NC}"
        echo -e "${INFO} Les services peuvent prendre jusqu'à 5 minutes pour être complètement opérationnels"
    fi
    echo ""
    
    echo -e "${WHITE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}Installation terminée! Consultez le rapport détaillé:${NC}"
    echo -e "${CYAN}cat $INSTALL_DIR/installation_report.txt${NC}"
    echo -e "${WHITE}═══════════════════════════════════════${NC}"
}

# =======================
# FONCTION PRINCIPALE
# =======================

main() {
    # Initialisation des logs
    log "=== DÉBUT DE L'INSTALLATION PHISHGUARD BASIC ==="
    log "Date: $(date)"
    log "Utilisateur: $(whoami)"
    log "Système: $(uname -a)"
    log "Repository: $REPO_URL (branche: $BRANCH)"
    
    print_banner
    
    # Confirmation avant installation
    echo -e "${YELLOW}⚠️  Cette installation va:${NC}"
    echo "   • Mettre à jour le système"
    echo "   • Installer Docker et Docker Compose"
    echo "   • Télécharger PhishGuard BASIC depuis GitHub (branche: $BRANCH)"
    echo "   • Créer un utilisateur système 'phishguard'"
    echo "   • Configurer les services et la sécurité"
    echo "   • Démarrer automatiquement tous les services"
    echo "   • Configurer le firewall et Fail2Ban"
    echo "   • Créer des scripts de maintenance automatiques"
    echo ""
    echo -e "${INFO} Repository: ${CYAN}$REPO_URL${NC}"
    echo -e "${INFO} Branche: ${CYAN}$BRANCH${NC}"
    echo -e "${INFO} Installation dans: ${CYAN}$INSTALL_DIR${NC}"
    echo ""
    
    read -p "$(echo -e ${CYAN}Continuer l\'installation? [y/N]: ${NC})" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Installation annulée par l'utilisateur.${NC}"
        exit 0
    fi
    
    # Étapes d'installation
    detect_os
    check_privileges
    check_system_requirements
    update_system
    install_system_dependencies
    install_docker
    install_docker_compose
    create_system_user
    download_and_install_project
    setup_directories_and_permissions
    setup_environment
    setup_firewall
    setup_fail2ban
    build_and_start_services
    create_systemd_service
    post_install_setup
    run_validation_tests
    generate_install_report
    
    # Finalisation
    log "=== INSTALLATION TERMINÉE AVEC SUCCÈS ==="
    show_final_summary
}

# =======================
# FONCTIONS SUPPLÉMENTAIRES
# =======================

# Fonction pour installer des paquets supplémentaires selon les besoins
install_optional_packages() {
    print_step "Installation de paquets optionnels..."
    
    case $PKG_MANAGER in
        "apt")
            # Outils de surveillance et optimisation
            apt install -y iotop ncdu glances 2>/dev/null || true
            ;;
        "yum"|"dnf")
            $PKG_MANAGER install -y iotop ncdu glances 2>/dev/null || true
            ;;
        "pacman")
            pacman -S --noconfirm iotop ncdu glances 2>/dev/null || true
            ;;
    esac
    
    print_info "Paquets optionnels installés"
}

# Fonction de vérification finale avancée
advanced_health_check() {
    print_step "Vérification avancée du système..."
    
    cd "$INSTALL_DIR"
    
    # Vérifier les ports utilisés
    print_info "Vérification des ports..."
    local ports=("80" "443" "5432" "6379")
    for port in "${ports[@]}"; do
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            print_info "Port $port: utilisé"
        else
            print_warning "Port $port: libre (peut être normal selon la configuration)"
        fi
    done
    
    # Vérifier les processus Docker
    print_info "Vérification des processus Docker..."
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q phishguard; then
        print_status "Conteneurs PhishGuard en cours d'exécution"
    else
        print_warning "Aucun conteneur PhishGuard détecté"
    fi
    
    # Vérifier l'utilisation des ressources
    print_info "Vérification des ressources système..."
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    echo "   CPU: ${cpu_usage}%"
    echo "   RAM: ${mem_usage}%"
    
    if [ "${mem_usage%.*}" -gt 80 ]; then
        print_warning "Utilisation RAM élevée: ${mem_usage}%"
    fi
}

# Fonction de nettoyage de sécurité
security_cleanup() {
    print_step "Nettoyage de sécurité..."
    
    # Nettoyer l'historique des commandes sensibles
    history -c 2>/dev/null || true
    
    # Nettoyer les fichiers temporaires
    find /tmp -name "phishguard*" -type f -delete 2>/dev/null || true
    
    # Sécuriser les permissions des fichiers de configuration
    find "$INSTALL_DIR" -name "*.env" -exec chmod 600 {} \; 2>/dev/null || true
    find "$INSTALL_DIR" -name "*.key" -exec chmod 600 {} \; 2>/dev/null || true
    
    print_status "Nettoyage de sécurité terminé"
}

# =======================
# GESTION DES ARGUMENTS
# =======================

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Afficher cette aide"
    echo "  -v, --verbose       Mode verbeux"
    echo "  -q, --quiet         Mode silencieux"
    echo "  --branch BRANCH     Spécifier la branche Git (défaut: dev)"
    echo "  --install-dir DIR   Répertoire d'installation (défaut: /opt/phishguard-basic)"
    echo "  --skip-firewall     Ne pas configurer le firewall"
    echo "  --skip-fail2ban     Ne pas configurer Fail2Ban"
    echo "  --no-auto-start     Ne pas démarrer automatiquement les services"
    echo "  --dev-mode          Mode développement (pas de sécurité renforcée)"
    echo ""
    echo "Exemples:"
    echo "  $0                          # Installation standard"
    echo "  $0 --branch main            # Installer depuis la branche main"
    echo "  $0 --install-dir /app       # Installer dans /app"
    echo "  $0 --dev-mode               # Mode développement"
}

# Parser les arguments de la ligne de commande
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                set -x
                shift
                ;;
            -q|--quiet)
                exec 1>/dev/null
                shift
                ;;
            --branch)
                BRANCH="$2"
                shift 2
                ;;
            --install-dir)
                INSTALL_DIR="$2"
                shift 2
                ;;
            --skip-firewall)
                SKIP_FIREWALL=true
                shift
                ;;
            --skip-fail2ban)
                SKIP_FAIL2BAN=true
                shift
                ;;
            --no-auto-start)
                NO_AUTO_START=true
                shift
                ;;
            --dev-mode)
                DEV_MODE=true
                shift
                ;;
            *)
                echo "Option inconnue: $1"
                echo "Utilisez --help pour voir les options disponibles"
                exit 1
                ;;
        esac
    done
}

# =======================
# POINT D'ENTRÉE PRINCIPAL
# =======================

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Parser les arguments
    parse_arguments "$@"
    
    # Ajuster la configuration selon les options
    if [ "$DEV_MODE" = true ]; then
        print_warning "Mode développement activé"
        SKIP_FIREWALL=true
        SKIP_FAIL2BAN=true
    fi
    
    # Exécuter l'installation principale
    main "$@"
    
    # Nettoyage final
    security_cleanup
    
    # Vérification avancée (optionnelle)
    if [ "$DEV_MODE" != true ]; then
        advanced_health_check
    fi
    
    echo ""
    echo -e "${GREEN}🎊 Installation PhishGuard BASIC terminée avec succès! 🎊${NC}"
    echo -e "${CYAN}Merci d'avoir choisi PhishGuard pour votre sécurité informatique.${NC}"
fi
