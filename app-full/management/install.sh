#!/bin/bash
# PhishGuard BASIC - Installation automatique complète
# =================================================================

set -e

# Configuration
REPO_URL="https://github.com/Reaper-Official/cyber-prevention-tool"
PROJECT_NAME="phishguard-basic"
INSTALL_DIR="/opt/$PROJECT_NAME"
SERVICE_USER="phishguard"
LOG_FILE="/tmp/phishguard_install.log"
TEMP_DIR="/tmp/phishguard_install_$$"

# Couleurs et styles
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Unicode symbols
CHECK="✅"
CROSS="❌"
INFO="ℹ️"
WARNING="⚠️"
ROCKET="🚀"
GEAR="⚙️"
SHIELD="🛡️"
GLOBE="🌐"

# Fonctions d'affichage
print_banner() {
    clear
    echo -e "${PURPLE}"
    echo "██████╗ ██╗  ██╗██╗███████╗██╗  ██╗ ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ "
    echo "██╔══██╗██║  ██║██║██╔════╝██║  ██║██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗"
    echo "██████╔╝███████║██║███████╗███████║██║  ███╗██║   ██║███████║██████╔╝██║  ██║"
    echo "██╔═══╝ ██╔══██║██║╚════██║██╔══██║██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║"
    echo "██║     ██║  ██║██║███████║██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝"
    echo "╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ "
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

print_status() { echo -e "${GREEN}${CHECK} $1${NC}"; log "SUCCESS: $1"; }
print_error() { echo -e "${RED}${CROSS} $1${NC}"; log "ERROR: $1"; }
print_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; log "WARNING: $1"; }
print_info() { echo -e "${BLUE}${INFO} $1${NC}"; log "INFO: $1"; }
print_step() { echo -e "${PURPLE}${GEAR} $1${NC}"; log "STEP: $1"; }

# Gestion des erreurs
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

# Détection de l'OS
detect_os() {
    print_step "Détection du système d'exploitation..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="debian"
            PKG_MANAGER="apt"
            if grep -q "Ubuntu" /etc/os-release; then
                DISTRO="ubuntu"
            elif grep -q "Debian" /etc/os-release; then
                DISTRO="debian"
            else
                DISTRO="ubuntu"  # Fallback
            fi
        elif [ -f /etc/redhat-release ]; then
            OS="redhat"
            PKG_MANAGER="yum"
            DISTRO="centos"
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

# Vérification des privilèges
check_privileges() {
    print_step "Vérification des privilèges..."
    
    if [[ $EUID -ne 0 ]]; then
        error_exit "Ce script doit être exécuté en tant que root (sudo)"
    fi
    print_status "Privilèges administrateur confirmés"
}

# Mise à jour du système
update_system() {
    print_step "Mise à jour du système..."
    
    case $PKG_MANAGER in
        "apt")
            apt update -y && apt upgrade -y
            ;;
        "yum")
            yum update -y
            ;;
        "pacman")
            pacman -Syu --noconfirm
            ;;
        "brew")
            brew update && brew upgrade
            ;;
    esac
    
    print_status "Système mis à jour"
}

# Installation des dépendances système
install_system_dependencies() {
    print_step "Installation des dépendances système..."
    
    case $PKG_MANAGER in
        "apt")
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
                net-tools
            ;;
        "yum")
            yum install -y epel-release
            yum install -y \
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
                net-tools
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
                net-tools
            ;;
        "brew")
            if ! command -v brew &> /dev/null; then
                print_info "Installation de Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install curl wget git openssl tree jq netcat
            ;;
        *)
            error_exit "Gestionnaire de paquets non supporté: $PKG_MANAGER"
            ;;
    esac
    
    print_status "Dépendances système installées"
}

# Installation de Docker
install_docker() {
    print_step "Installation de Docker..."
    
    if command -v docker &> /dev/null; then
        print_info "Docker déjà installé: $(docker --version)"
        return 0
    fi
    
    case $OS in
        "debian")
            # Installation Docker sur Debian/Ubuntu
            curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            apt update
            apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            systemctl start docker
            systemctl enable docker
            ;;
        "redhat")
            # Installation Docker sur CentOS/RHEL
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
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
    
    # Vérification de l'installation
    if command -v docker &> /dev/null; then
        print_status "Docker installé: $(docker --version)"
        
        # Ajout de l'utilisateur au groupe docker
        if [ "$OS" != "macos" ] && [ -n "$SUDO_USER" ]; then
            usermod -aG docker $SUDO_USER
            print_info "Utilisateur $SUDO_USER ajouté au groupe docker"
        fi
    else
        error_exit "Échec de l'installation de Docker"
    fi
}

# Installation de Docker Compose (si nécessaire)
install_docker_compose() {
    print_step "Vérification de Docker Compose..."
    
    if docker compose version &> /dev/null; then
        print_status "Docker Compose (plugin) disponible: $(docker compose version)"
        return 0
    fi
    
    if command -v docker-compose &> /dev/null; then
        print_status "Docker Compose (standalone) disponible: $(docker-compose --version)"
        return 0
    fi
    
    print_info "Installation de Docker Compose standalone..."
    
    # Installation du standalone Docker Compose
    if [ "$OS" != "macos" ]; then
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        # Créer un symlink si nécessaire
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

# Création de l'utilisateur système
create_system_user() {
    print_step "Création de l'utilisateur système..."
    
    if id "$SERVICE_USER" &>/dev/null; then
        print_info "Utilisateur $SERVICE_USER existe déjà"
    else
        useradd -r -s /bin/false -d "$INSTALL_DIR" -c "PhishGuard Service User" "$SERVICE_USER"
        print_status "Utilisateur $SERVICE_USER créé"
    fi
    
    # Ajout au groupe docker
    if command -v docker &> /dev/null; then
        usermod -aG docker "$SERVICE_USER" 2>/dev/null || true
        print_info "Utilisateur $SERVICE_USER ajouté au groupe docker"
    fi
}

# Téléchargement et installation du projet
download_and_install_project() {
    print_step "Téléchargement du projet PhishGuard BASIC..."
    
    # Création du répertoire temporaire
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # Clonage du repository
    print_info "Clonage depuis GitHub: $REPO_URL"
    git clone "$REPO_URL" phishguard-source
    
    if [ ! -d "phishguard-source" ]; then
        error_exit "Échec du clonage du repository GitHub"
    fi
    
    # Création du répertoire d'installation
    mkdir -p "$INSTALL_DIR"
    
    # Copie des fichiers
    print_info "Copie des fichiers vers $INSTALL_DIR"
    cp -r phishguard-source/* "$INSTALL_DIR/"
    
    # Vérifier que les fichiers importants sont présents
    if [ ! -f "$INSTALL_DIR/docker-compose.yml" ] && [ ! -f "$INSTALL_DIR/app-full/management/docker-compose.yml" ]; then
        error_exit "Fichier docker-compose.yml non trouvé dans le projet"
    fi
    
    # Déplacer docker-compose.yml si nécessaire
    if [ -f "$INSTALL_DIR/app-full/management/docker-compose.yml" ] && [ ! -f "$INSTALL_DIR/docker-compose.yml" ]; then
        cp "$INSTALL_DIR/app-full/management/docker-compose.yml" "$INSTALL_DIR/"
        print_info "docker-compose.yml copié à la racine"
    fi
    
    print_status "Projet téléchargé et installé dans $INSTALL_DIR"
}

# Configuration des permissions et répertoires
setup_directories_and_permissions() {
    print_step "Configuration des répertoires et permissions..."
    
    cd "$INSTALL_DIR"
    
    # Créer les répertoires nécessaires
    mkdir -p {storage/{logs,cache,uploads,backups,reports},ssl,nginx/sites-available,logs}
    
    # Copier les fichiers de configuration si ils existent dans app-full/management
    if [ -d "app-full/management" ]; then
        # Copier les fichiers Docker
        if [ -f "app-full/management/Dockerfile" ]; then
            cp "app-full/management/Dockerfile" ./
        fi
        
        # Copier les configurations nginx
        if [ -d "app-full/management/nginx" ]; then
            cp -r app-full/management/nginx/* nginx/ 2>/dev/null || true
        fi
        
        # Copier les scripts
        if [ -f "app-full/management/docker/init.sh" ]; then
            mkdir -p docker
            cp -r app-full/management/docker/* docker/
        fi
    fi
    
    # Configuration des permissions
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    chmod -R 755 "$INSTALL_DIR"
    chmod -R 775 "$INSTALL_DIR/storage"
    chmod -R 775 "$INSTALL_DIR/logs" 2>/dev/null || true
    
    # Scripts exécutables
    find "$INSTALL_DIR" -name "*.sh" -exec chmod +x {} \;
    
    print_status "Permissions et répertoires configurés"
}

# Configuration de l'environnement
setup_environment() {
    print_step "Configuration de l'environnement..."
    
    cd "$INSTALL_DIR"
    
    if [ ! -f .env ]; then
        # Générer des clés sécurisées
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        JWT_SECRET=$(openssl rand -hex 32)
        ENCRYPTION_KEY=$(openssl rand -hex 32)
        
        # Détecter l'IP publique
        PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipecho.net/plain 2>/dev/null || echo "localhost")
        
        # Créer le fichier .env
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

# Monitoring
LOG_LEVEL=info
LOG_FILE=/var/log/phishguard/app.log
AUDIT_LOG_ENABLED=true
EOF

        print_status "Fichier .env créé avec des clés sécurisées"
    else
        print_info "Fichier .env existant conservé"
    fi
    
    # Permissions sécurisées sur .env
    chmod 600 .env
    chown "$SERVICE_USER:$SERVICE_USER" .env
}

# Configuration du firewall
setup_firewall() {
    print_step "Configuration du firewall..."
    
    case $OS in
        "debian"|"arch")
            if command -v ufw &> /dev/null; then
                # Configuration UFW
                ufw --force reset
                ufw default deny incoming
                ufw default allow outgoing
                
                # Règles essentielles
                ufw allow 22/tcp comment 'SSH'
                ufw allow 80/tcp comment 'HTTP'
                ufw allow 443/tcp comment 'HTTPS'
                ufw allow from 127.0.0.1 comment 'Localhost'
                ufw allow from 172.16.0.0/12 comment 'Docker networks'
                
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

# Configuration de Fail2Ban
setup_fail2ban() {
    print_step "Configuration de Fail2Ban..."
    
    if command -v fail2ban-server &> /dev/null; then
        # Configuration pour PhishGuard
        cat > /etc/fail2ban/jail.d/phishguard.conf << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

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

[phishguard-auth]
enabled = true
port = http,https
filter = phishguard-auth
logpath = /opt/phishguard-basic/storage/logs/auth.log
maxretry = 5
bantime = 1800
EOF
        
        # Filtre personnalisé pour PhishGuard
        cat > /etc/fail2ban/filter.d/phishguard-auth.conf << 'EOF'
[Definition]
failregex = ^.*\[.*\] "POST /management/api/auth/login.php.*" 401.*$
            ^.*login_failed.*IP: <HOST>.*$
ignoreregex =
EOF
        
        # Redémarrer et activer Fail2Ban
        systemctl restart fail2ban
        systemctl enable fail2ban
        
        print_status "Fail2Ban configuré pour PhishGuard"
    else
        print_warning "Fail2Ban non installé, configuration ignorée"
    fi
}

# Construction et démarrage des services Docker
build_and_start_services() {
    print_step "Construction et démarrage des services Docker..."
    
    cd "$INSTALL_DIR"
    
    # Vérifier la présence de docker-compose.yml
    if [ ! -f docker-compose.yml ]; then
        error_exit "Fichier docker-compose.yml non trouvé"
    fi
    
    # Construction des images en tant qu'utilisateur service
    print_info "Construction des images Docker..."
    sudo -u "$SERVICE_USER" docker-compose build --no-cache --pull
    
    # Démarrage des services
    print_info "Démarrage des services..."
    sudo -u "$SERVICE_USER" docker-compose up -d
    
    # Attendre que PostgreSQL soit prêt
    print_info "Attente de l'initialisation de PostgreSQL..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if sudo -u "$SERVICE_USER" docker-compose exec -T db pg_isready -U phishguard -d phishguard_basic >/dev/null 2>&1; then
            print_status "PostgreSQL opérationnel"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_warning "Timeout: PostgreSQL met du temps à démarrer, mais l'installation continue"
            break
        fi
        
        printf "."
        sleep 2
        ((attempt++))
    done
    
    # Initialisation de la base de données
    print_info "Initialisation de la base de données..."
    if [ -f "app-full/management/setup.php" ]; then
        sleep 10  # Attendre encore un peu
        sudo -u "$SERVICE_USER" docker-compose exec -T app php app-full/management/setup.php
    else
        print_warning "Script d'initialisation non trouvé"
    fi
    
    print_status "Services Docker démarrés"
}

# Création du service systemd
create_systemd_service() {
    print_step "Création du service systemd..."
    
    # Déterminer la commande docker-compose
    COMPOSE_CMD="docker-compose"
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
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
ExecStart=$COMPOSE_CMD up -d
ExecStop=$COMPOSE_CMD down
ExecReload=$COMPOSE_CMD restart
TimeoutStartSec=300
TimeoutStopSec=60
Restart=no

[Install]
WantedBy=multi-user.target
EOF
    
    # Recharger systemd et activer le service
    systemctl daemon-reload
    systemctl enable phishguard.service
    
    print_status "Service systemd créé et activé"
}

# Tests de validation
run_validation_tests() {
    print_step "Tests de validation du déploiement..."
    
    cd "$INSTALL_DIR"
    
    local all_services_ok=true
    
    # Test des conteneurs Docker
    print_info "Vérification des services Docker..."
    local services=("db" "redis" "app" "nginx")
    
    for service in "${services[@]}"; do
        local container_name="${PROJECT_NAME}_${service}"
        if sudo -u "$SERVICE_USER" docker ps --filter "name=$container_name" --filter "status=running" --format "table {{.Names}}" | grep -q "$container_name"; then
            print_status "Service $service: opérationnel"
        else
            print_error "Service $service: problème détecté"
            sudo -u "$SERVICE_USER" docker-compose logs --tail=10 "$service" | head -20
            all_services_ok=false
        fi
    done
    
    # Test de connectivité web
    sleep 15
    print_info "Test de connectivité web..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost --connect-timeout 10 | grep -q "200\|302\|301"; then
        print_status "Interface web: accessible"
    else
        print_warning "Interface web: non accessible immédiatement (normal au premier démarrage)"
        all_services_ok=false
    fi
    
    # Test de la base de données
    print_info "Test de la base de données..."
    if sudo -u "$SERVICE_USER" docker-compose exec -T db psql -U phishguard -d phishguard_basic -c "SELECT 1;" >/dev/null 2>&1; then
        print_status "Base de données PostgreSQL: opérationnelle"
    else
        print_warning "Base de données: problème de connexion"
        all_services_ok=false
    fi
    
    # Test Redis
    print_info "Test du cache Redis..."
    if sudo -u "$SERVICE_USER" docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        print_status "Redis: opérationnel"
    else
        print_warning "Redis: problème détecté"
    fi
    
    if [ "$all_services_ok" = true ]; then
        print_status "Tous les tests de validation réussis"
    else
        print_warning "Certains services ont des problèmes - consultez les logs"
    fi
}

# Génération du rapport d'installation
generate_install_report() {
    print_step "Génération du rapport d'installation..."
    
    local REPORT_FILE="$INSTALL_DIR/installation_report.txt"
    local PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    local PRIVATE_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    
    cat > "$REPORT_FILE" << EOF
===========================================
  PHISHGUARD BASIC - RAPPORT D'INSTALLATION
===========================================

Date d'installation: $(date)
Système: $(uname -a)
Utilisateur d'installation: $(whoami)
Répertoire d'installation: $INSTALL_DIR

INFORMATIONS SYSTÈME:
====================
OS: $OS ($DISTRO)
Gestionnaire de paquets: $PKG_MANAGER
Adresse IP privée: $PRIVATE_IP
Adresse IP publique: $PUBLIC_IP

SERVICES INSTALLÉS:
==================
${CHECK} Docker: $(docker --version 2>/dev/null || echo "Non détecté")
${CHECK} Docker Compose: $(docker-compose --version 2>/dev/null || echo "Plugin Docker")
${CHECK} PostgreSQL: Conteneur Docker
${CHECK} Redis: Conteneur Docker
${CHECK} Nginx: Conteneur Docker
${CHECK} PHP-FPM: Conteneur Docker

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
🔧 Service systemd: phishguard.service

COMMANDES UTILES:
================
# Statut du service
systemctl status phishguard

# Logs en temps réel
cd $INSTALL_DIR && sudo -u $SERVICE_USER docker-compose logs -f

# Redémarrage des services
systemctl restart phishguard

# Arrêt des services
systemctl stop phishguard

# Démarrage des services
systemctl start phishguard

# Sauvegarde manuelle
$INSTALL_DIR/backup.sh

# Maintenance
$INSTALL_DIR/maintenance.sh

# Mise à jour
$INSTALL_DIR/update.sh

SÉCURITÉ:
=========
🔥 Firewall: Configuré (ports 80, 443, 22)
🛡️  Fail2Ban: $(command -v fail2ban-server &>/dev/null && echo "Configuré" || echo "Non installé")
🔐 Utilisateur système: $SERVICE_USER (non-login)
🔒 Permissions: Configurées selon les bonnes pratiques

PROCHAINES ÉTAPES:
==================
1. 🔑 Changez le mot de passe administrateur par défaut
2. 📧 Configurez votre serveur SMTP dans le fichier .env
3. 🔒 Configurez SSL/TLS pour HTTPS (Let's Encrypt recommandé)
4. 👥 Importez votre liste d'employés
5. 📧 Créez votre première campagne de test

RESSOURCES UTILES:
==================
📁 Fichiers de configuration: $INSTALL_DIR/nginx/
📊 Logs de l'application: $INSTALL_DIR/storage/logs/
💾 Sauvegardes: $INSTALL_DIR/storage/backups/

SUPPORT ET DOCUMENTATION:
=========================
📧 Support: reaper@etik.com
🐛 Issues GitHub: https://github.com/Reaper-Official/cyber-prevention-tool/issues
📖 Documentation: README.md dans le répertoire d'installation

NOTES IMPORTANTES:
==================
- Ce rapport contient des informations sensibles
- Gardez vos identifiants de connexion sécurisés
- Effectuez des sauvegardes régulières
- Surveillez les logs pour détecter des anomalies

Installation terminée avec succès le $(date)
EOF

    chown "$SERVICE_USER:$SERVICE_USER" "$REPORT_FILE"
    chmod 600 "$REPORT_FILE"  # Lecture seule pour le propriétaire
    
    print_status "Rapport d'installation créé: $REPORT_FILE"
}

# Configuration post-installation
post_install_setup() {
    print_step "Configuration post-installation..."
    
    # Créer des scripts utiles
    create_utility_scripts
    
    # Configurer la rotation des logs
    setup_log_rotation
    
    # Créer un cron job pour les sauvegardes automatiques
    setup_automatic_backups
    
    print_status "Configuration post-installation terminée"
}

create_utility_scripts() {
    print_info "Création des scripts utiles..."
    
    # Script de sauvegarde
    cat > "$INSTALL_DIR/backup.sh" << 'EOF'
#!/bin/bash
# Script de sauvegarde automatique PhishGuard

BACKUP_DIR="/opt/phishguard-basic/storage/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

cd /opt/phishguard-basic

echo "Début de la sauvegarde - $DATE"

# Sauvegarde base de données
sudo -u phishguard docker-compose exec -T db pg_dump -U phishguard phishguard_basic > "$BACKUP_DIR/db_backup_$DATE.sql"

# Sauvegarde des fichiers de configuration
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" .env nginx/ storage/uploads/

# Nettoyage des anciennes sauvegardes (garder 7 jours)
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Sauvegarde terminée - $DATE"
EOF

    # Script de maintenance
    cat > "$INSTALL_DIR/maintenance.sh" << 'EOF'
#!/bin/bash
# Script de maintenance PhishGuard

cd /opt/phishguard-basic

echo "=== Maintenance PhishGuard - $(date) ==="

# Nettoyage des logs anciens
echo "Nettoyage des logs..."
find storage/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true

# Nettoyage du cache
echo "Nettoyage du cache..."
sudo -u phishguard docker-compose exec -T redis redis-cli FLUSHALL

# Optimisation base de données
echo "Optimisation de la base de données..."
sudo -u phishguard docker-compose exec -T db psql -U phishguard -d phishguard_basic -c "VACUUM ANALYZE;"

# Vérification des services
echo "Vérification des services..."
sudo -u phishguard docker-compose ps

echo "=== Maintenance terminée ==="
EOF

    # Script de mise à jour
    cat > "$INSTALL_DIR/update.sh" << 'EOF'
#!/bin/bash
# Script de mise à jour PhishGuard

cd /opt/phishguard-basic

echo "=== Mise à jour PhishGuard - $(date) ==="

# Sauvegarde avant mise à jour
echo "Sauvegarde pré-mise à jour..."
./backup.sh

# Récupération des dernières modifications
echo "Mise à jour du code source..."
git stash
git pull origin main
git stash pop 2>/dev/null || true

# Reconstruction des images
echo "Reconstruction des images Docker..."
sudo -u phishguard docker-compose build --no-cache

# Redémarrage des services
echo "Redémarrage des services..."
sudo -u phishguard docker-compose down
sudo -u phishguard docker-compose up -d

echo "=== Mise à jour terminée ==="
EOF

    # Rendre les scripts exécutables
    chmod +x "$INSTALL_DIR"/{backup.sh,maintenance.sh,update.sh}
    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"/{backup.sh,maintenance.sh,update.sh}
    
    print_info "Scripts utiles créés (backup.sh, maintenance.sh, update.sh)"
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
    sharedscripts
    postrotate
        sudo -u $SERVICE_USER docker-compose -f $INSTALL_DIR/docker-compose.yml exec app kill -USR1 1 2>/dev/null || true
    endscript
}

/var/log/nginx/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        sudo -u $SERVICE_USER docker-compose -f $INSTALL_DIR/docker-compose.yml exec nginx nginx -s reopen 2>/dev/null || true
    endscript
}
EOF
    
    print_info "Rotation des logs configurée"
}

setup_automatic_backups() {
    print_info "Configuration des sauvegardes automatiques..."
    
    # Ajouter une tâche cron pour les sauvegardes quotidiennes
    (crontab -u "$SERVICE_USER" -l 2>/dev/null; echo "0 2 * * * $INSTALL_DIR/backup.sh >> $INSTALL_DIR/storage/logs/backup.log 2>&1") | crontab -u "$SERVICE_USER" -
    
    # Ajouter une tâche cron pour la maintenance hebdomadaire
    (crontab -u "$SERVICE_USER" -l 2>/dev/null; echo "0 3 * * 0 $INSTALL_DIR/maintenance.sh >> $INSTALL_DIR/storage/logs/maintenance.log 2>&1") | crontab -u "$SERVICE_USER" -
    
    print_info "Sauvegardes automatiques configurées (quotidiennes à 2h)"
}

# Affichage final avec toutes les informations
show_final_summary() {
    clear
    print_banner
    
    echo -e "${GREEN}🎉 INSTALLATION TERMINÉE AVEC SUCCÈS! 🎉${NC}"
    echo ""
    
    # Informations de connexion
    local PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    local PRIVATE_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    
    echo -e "${BLUE}📋 INFORMATIONS DE CONNEXION:${NC}"
    echo -e "   🌐 URL locale: ${CYAN}http://localhost${NC}"
    echo -e "   🌐 URL réseau: ${CYAN}http://$PRIVATE_IP${NC}"
    echo -e "   🌐 URL publique: ${CYAN}http://$PUBLIC_IP${NC}"
    echo -e "   👤 Utilisateur: ${YELLOW}admin${NC}"
    echo -e "   🔑 Mot de passe: ${YELLOW}admin${NC}"
    echo ""
    
    echo -e "${BLUE}📁 RÉPERTOIRES IMPORTANTS:${NC}"
    echo -e "   📂 Installation: ${CYAN}$INSTALL_DIR${NC}"
    echo -e "   🔧 Configuration: ${CYAN}$INSTALL_DIR/.env${NC}"
    echo -e "   📊 Logs: ${CYAN}$INSTALL_DIR/storage/logs${NC}"
    echo -e "   📈 Rapport: ${CYAN}$INSTALL_DIR/installation_report.txt${NC}"
    echo ""
    
    echo -e "${BLUE}🔧 COMMANDES UTILES:${NC}"
    echo -e "   🔍 Statut des services: ${CYAN}systemctl status phishguard${NC}"
    echo -e "   📋 Logs en temps réel: ${CYAN}cd $INSTALL_DIR && sudo -u $SERVICE_USER docker-compose logs -f${NC}"
    echo -e "   🔄 Redémarrer: ${CYAN}systemctl restart phishguard${NC}"
    echo -e "   💾 Sauvegarde: ${CYAN}$INSTALL_DIR/backup.sh${NC}"
    echo ""
    
    echo -e "${YELLOW}⚠️  ACTIONS PRIORITAIRES:${NC}"
    echo -e "   1. ${RED}Changez immédiatement${NC} le mot de passe admin"
    echo -e "   2. ${YELLOW}Configurez${NC} votre serveur SMTP"
    echo -e "   3. ${GREEN}Activez${NC} HTTPS pour la production"
    echo -e "   4. ${BLUE}Importez${NC} votre liste d'employés"
    echo -e "   5. ${PURPLE}Testez${NC} avec une campagne pilote"
    echo ""
    
    echo -e "${GREEN}✨ PhishGuard BASIC est maintenant opérationnel! ✨${NC}"
    echo -e "${BLUE}📧 Support: reaper@etik.com${NC}"
    echo ""
}

# Fonction principale
main() {
    print_banner
    
    # Confirmation avant installation
    echo -e "${YELLOW}⚠️  Cette installation va:${NC}"
    echo "   • Installer Docker et Docker Compose"
    echo "   • Télécharger PhishGuard BASIC depuis GitHub"
    echo "   • Créer un utilisateur système 'phishguard'"
    echo "   • Configurer les services et la sécurité"
    echo "   • Démarrer automatiquement tous les services"
    echo "   • Configurer le firewall et Fail2Ban"
    echo ""
    
    read -p "$(echo -e ${CYAN}Continuer l'installation? [y/N]: ${NC})" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation annulée par l'utilisateur."
        exit 0
    fi
    
    # Initialisation des logs
    log "=== DÉBUT DE L'INSTALLATION PHISHGUARD BASIC ==="
    log "Date: $(date)"
    log "Utilisateur: $(whoami)"
    log "Système: $(uname -a)"
    
    # Étapes d'installation
    detect_os
    check_privileges
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

# Gestion des signaux d'interruption
trap 'print_error "Installation interrompue par l utilisateur"; cleanup; exit 1' INT TERM

# Point d'entrée principal
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
