#!/bin/bash

#═══════════════════════════════════════════════════════════════════════════════
#  Script d'installation PhishGuard BASIC - Version Ultra-Complète
#  Description: Installation 100% automatisée sur machine vierge
#  Auteur: Reaper Official
#  Version: 2.0.0
#  Prérequis: AUCUN - Le script installe tout
#═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail  # Arrêt strict en cas d'erreur
IFS=$'\n\t'

# Couleurs
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Variables globales
readonly SCRIPT_VERSION="2.0.0"
readonly PROJECT_NAME="PhishGuard BASIC"
readonly REPO_URL="https://github.com/Reaper-Official/cyber-prevention-tool.git"
readonly REPO_BRANCH="dev"
readonly INSTALL_DIR="/opt/phishguard"
readonly LOG_FILE="/var/log/phishguard-install.log"
readonly MIN_RAM=2048  # MB
readonly MIN_DISK=10   # GB
readonly REQUIRED_PORTS=(8080 5432 6379)

# Variables de configuration
SUDO_CMD=""
CURRENT_USER=""
OS=""
OS_VERSION=""
PKG_MANAGER=""
PKG_UPDATE=""
PKG_INSTALL=""

#═══════════════════════════════════════════════════════════════════════════════
# Fonctions de logging
#═══════════════════════════════════════════════════════════════════════════════

setup_logging() {
    # Créer le fichier de log avec permissions appropriées
    sudo touch "$LOG_FILE" 2>/dev/null || touch "$LOG_FILE"
    sudo chmod 666 "$LOG_FILE" 2>/dev/null || chmod 666 "$LOG_FILE"
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
}

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

print_banner() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██████╗ ██╗  ██╗██╗███████╗██╗  ██╗ ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗║
║   ██╔══██╗██║  ██║██║██╔════╝██║  ██║██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
║   ██████╔╝███████║██║███████╗███████║██║  ███╗██║   ██║███████║██████╔╝██║  ██║
║   ██╔═══╝ ██╔══██║██║╚════██║██╔══██║██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
║   ██║     ██║  ██║██║███████║██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
║   ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
║                                                                               ║
║              🚀 Installation Automatique Ultra-Complète v${SCRIPT_VERSION}              ║
║                     💻 Pour Machine Vierge - Zéro Prérequis                     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[✗]${NC} $*" | tee -a "$LOG_FILE"
}

section_header() {
    echo "" | tee -a "$LOG_FILE"
    echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════╗${NC}" | tee -a "$LOG_FILE"
    printf "${MAGENTA}║${NC} %-56s ${MAGENTA}║${NC}\n" "$1" | tee -a "$LOG_FILE"
    echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════╝${NC}" | tee -a "$LOG_FILE"
}

spinner() {
    local pid=$1
    local message=$2
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    
    while kill -0 "$pid" 2>/dev/null; do
        i=$(( (i+1) % 10 ))
        printf "\r${CYAN}[${spinstr:$i:1}]${NC} %s" "$message"
        sleep 0.1
    done
    printf "\r${GREEN}[✓]${NC} %s\n" "$message"
}

#═══════════════════════════════════════════════════════════════════════════════
# Vérification des privilèges et configuration sudo
#═══════════════════════════════════════════════════════════════════════════════

check_privileges() {
    section_header "Vérification des privilèges"
    
    if [ "$EUID" -eq 0 ]; then
        log_success "Script exécuté en tant que root"
        SUDO_CMD=""
        CURRENT_USER="${SUDO_USER:-root}"
        
        # Si exécuté via sudo, récupérer le vrai utilisateur
        if [ -n "${SUDO_USER:-}" ]; then
            CURRENT_USER="$SUDO_USER"
        fi
    else
        # Vérifier si sudo est disponible
        if command -v sudo &> /dev/null; then
            if sudo -n true 2>/dev/null; then
                log_success "Privilèges sudo disponibles"
                SUDO_CMD="sudo"
                CURRENT_USER="$USER"
            else
                log_error "Ce script nécessite les privilèges root ou sudo"
                echo ""
                echo "Exécutez avec l'une de ces commandes:"
                echo "  sudo bash $0"
                echo "  su -c 'bash $0'"
                exit 1
            fi
        else
            log_error "sudo n'est pas installé et vous n'êtes pas root"
            echo ""
            echo "Solutions:"
            echo "1. Devenez root: su -"
            echo "2. Installez sudo: apt-get install sudo (en tant que root)"
            exit 1
        fi
    fi
    
    log_info "Utilisateur: ${CURRENT_USER}"
    log_info "Commande sudo: ${SUDO_CMD:-'non nécessaire (root)'}"
}

#═══════════════════════════════════════════════════════════════════════════════
# Détection du système et configuration du gestionnaire de paquets
#═══════════════════════════════════════════════════════════════════════════════

detect_system() {
    section_header "Détection du système d'exploitation"
    
    # Détection de l'OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=${VERSION_ID:-"unknown"}
        log_info "Système: $PRETTY_NAME"
    elif [ -f /etc/redhat-release ]; then
        OS="rhel"
        OS_VERSION=$(cat /etc/redhat-release | grep -oE '[0-9]+\.[0-9]+' | head -1)
        log_info "Système: Red Hat Enterprise Linux $OS_VERSION"
    else
        log_error "Impossible de détecter le système d'exploitation"
        exit 1
    fi
    
    # Configuration du gestionnaire de paquets
    if command -v apt-get &> /dev/null; then
        PKG_MANAGER="apt"
        PKG_UPDATE="$SUDO_CMD apt-get update -qq"
        PKG_INSTALL="$SUDO_CMD DEBIAN_FRONTEND=noninteractive apt-get install -y -qq"
        log_success "Gestionnaire de paquets: APT (Debian/Ubuntu)"
        
    elif command -v dnf &> /dev/null; then
        PKG_MANAGER="dnf"
        PKG_UPDATE="$SUDO_CMD dnf check-update -q || true"
        PKG_INSTALL="$SUDO_CMD dnf install -y -q"
        log_success "Gestionnaire de paquets: DNF (Fedora/RHEL 8+)"
        
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum"
        PKG_UPDATE="$SUDO_CMD yum check-update -q || true"
        PKG_INSTALL="$SUDO_CMD yum install -y -q"
        log_success "Gestionnaire de paquets: YUM (CentOS/RHEL)"
        
    elif command -v zypper &> /dev/null; then
        PKG_MANAGER="zypper"
        PKG_UPDATE="$SUDO_CMD zypper refresh"
        PKG_INSTALL="$SUDO_CMD zypper install -y"
        log_success "Gestionnaire de paquets: Zypper (openSUSE)"
        
    elif command -v pacman &> /dev/null; then
        PKG_MANAGER="pacman"
        PKG_UPDATE="$SUDO_CMD pacman -Sy"
        PKG_INSTALL="$SUDO_CMD pacman -S --noconfirm"
        log_success "Gestionnaire de paquets: Pacman (Arch Linux)"
        
    else
        log_error "Aucun gestionnaire de paquets supporté trouvé"
        log_error "Systèmes supportés: Debian, Ubuntu, CentOS, RHEL, Fedora, openSUSE, Arch"
        exit 1
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Mise à jour du système
#═══════════════════════════════════════════════════════════════════════════════

update_system() {
    section_header "Mise à jour du système"
    
    log_info "Mise à jour de la liste des paquets..."
    if $PKG_UPDATE > /dev/null 2>&1; then
        log_success "Liste des paquets mise à jour"
    else
        log_warning "Échec de la mise à jour (non critique)"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Installation des outils de base
#═══════════════════════════════════════════════════════════════════════════════

install_basic_tools() {
    section_header "Installation des outils de base"
    
    local tools=(
        "curl"
        "wget"
        "ca-certificates"
        "gnupg"
        "lsb-release"
    )
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null && ! dpkg -l | grep -q "^ii  $tool "; then
            log_info "Installation de $tool..."
            $PKG_INSTALL "$tool" > /dev/null 2>&1 || log_warning "Échec installation de $tool"
        else
            log_success "$tool déjà installé"
        fi
    done
}

#═══════════════════════════════════════════════════════════════════════════════
# Vérification des ressources système
#═══════════════════════════════════════════════════════════════════════════════

check_system_resources() {
    section_header "Vérification des ressources système"
    
    # RAM
    local total_ram=$(free -m | awk 'NR==2{print $2}')
    local available_ram=$(free -m | awk 'NR==2{print $7}')
    
    log_info "RAM totale: ${total_ram}MB"
    log_info "RAM disponible: ${available_ram}MB"
    
    if [ "$available_ram" -lt "$MIN_RAM" ]; then
        log_warning "RAM faible (recommandé: ${MIN_RAM}MB minimum)"
        log_warning "L'installation peut être plus lente"
    else
        log_success "RAM suffisante"
    fi
    
    # Espace disque
    local available_disk=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    log_info "Espace disque disponible: ${available_disk}GB"
    
    if [ "$available_disk" -lt "$MIN_DISK" ]; then
        log_error "Espace disque insuffisant (minimum: ${MIN_DISK}GB)"
        exit 1
    else
        log_success "Espace disque suffisant"
    fi
    
    # SWAP
    local swap_size=$(free -m | awk 'NR==3{print $2}')
    if [ "$swap_size" -eq 0 ]; then
        log_warning "Aucun SWAP configuré"
        read -p "$(echo -e ${YELLOW}Créer un SWAP de 2GB ? [O/n]:${NC} )" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            create_swap
        fi
    else
        log_success "SWAP configuré: ${swap_size}MB"
    fi
}

create_swap() {
    log_info "Création d'un fichier SWAP de 2GB..."
    
    if [ -f /swapfile ]; then
        log_warning "Fichier /swapfile existe déjà"
        $SUDO_CMD swapoff /swapfile 2>/dev/null || true
        $SUDO_CMD rm -f /swapfile
    fi
    
    $SUDO_CMD fallocate -l 2G /swapfile 2>/dev/null || \
        $SUDO_CMD dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
    
    $SUDO_CMD chmod 600 /swapfile
    $SUDO_CMD mkswap /swapfile > /dev/null 2>&1
    $SUDO_CMD swapon /swapfile
    
    # Ajouter au fstab si pas déjà présent
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | $SUDO_CMD tee -a /etc/fstab > /dev/null
    fi
    
    log_success "SWAP de 2GB créé et activé"
}

#═══════════════════════════════════════════════════════════════════════════════
# Vérification des ports
#═══════════════════════════════════════════════════════════════════════════════

check_ports() {
    section_header "Vérification des ports"
    
    for port in "${REQUIRED_PORTS[@]}"; do
        if $SUDO_CMD ss -tuln 2>/dev/null | grep -q ":$port " || \
           $SUDO_CMD netstat -tuln 2>/dev/null | grep -q ":$port "; then
            log_error "Port $port déjà utilisé"
            $SUDO_CMD ss -tuln 2>/dev/null | grep ":$port" || \
                $SUDO_CMD netstat -tuln 2>/dev/null | grep ":$port"
            
            read -p "$(echo -e ${YELLOW}Continuer malgré tout ? [o/N]:${NC} )" -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Oo]$ ]]; then
                exit 1
            fi
        else
            log_success "Port $port disponible"
        fi
    done
}

#═══════════════════════════════════════════════════════════════════════════════
# Installation de Git
#═══════════════════════════════════════════════════════════════════════════════

install_git() {
    section_header "Installation de Git"
    
    if command -v git &> /dev/null; then
        local git_version=$(git --version | awk '{print $3}')
        log_success "Git déjà installé (version $git_version)"
    else
        log_info "Installation de Git..."
        $PKG_INSTALL git > /dev/null 2>&1
        
        if command -v git &> /dev/null; then
            log_success "Git installé avec succès ($(git --version | awk '{print $3}'))"
        else
            log_error "Échec de l'installation de Git"
            exit 1
        fi
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Installation de Docker
#═══════════════════════════════════════════════════════════════════════════════

install_docker() {
    section_header "Installation de Docker"
    
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
        log_success "Docker déjà installé (version $docker_version)"
        
        # Vérifier si Docker fonctionne
        if ! $SUDO_CMD docker ps > /dev/null 2>&1; then
            log_warning "Docker installé mais ne fonctionne pas, redémarrage..."
            $SUDO_CMD systemctl start docker 2>/dev/null || \
                $SUDO_CMD service docker start 2>/dev/null || true
        fi
    else
        log_info "Téléchargement et installation de Docker..."
        
        # Méthode 1: Script officiel Docker (universel)
        if curl -fsSL https://get.docker.com -o /tmp/get-docker.sh 2>/dev/null; then
            log_info "Installation via le script officiel Docker..."
            $SUDO_CMD sh /tmp/get-docker.sh > /dev/null 2>&1
            rm -f /tmp/get-docker.sh
        else
            log_warning "Échec du téléchargement du script Docker officiel"
            
            # Méthode 2: Installation par gestionnaire de paquets
            case "$PKG_MANAGER" in
                apt)
                    log_info "Installation via APT..."
                    $PKG_INSTALL docker.io docker-compose-plugin > /dev/null 2>&1
                    ;;
                dnf|yum)
                    log_info "Installation via $PKG_MANAGER..."
                    $PKG_INSTALL docker docker-compose-plugin > /dev/null 2>&1
                    ;;
                *)
                    log_error "Impossible d'installer Docker automatiquement"
                    exit 1
                    ;;
            esac
        fi
        
        # Démarrer et activer Docker
        $SUDO_CMD systemctl start docker 2>/dev/null || \
            $SUDO_CMD service docker start 2>/dev/null || true
        
        $SUDO_CMD systemctl enable docker 2>/dev/null || true
        
        if command -v docker &> /dev/null; then
            log_success "Docker installé avec succès ($(docker --version | awk '{print $3}' | sed 's/,//'))"
        else
            log_error "Échec de l'installation de Docker"
            exit 1
        fi
    fi
    
    # Ajouter l'utilisateur au groupe docker
    if [ "$CURRENT_USER" != "root" ] && [ -n "$CURRENT_USER" ]; then
        if ! groups "$CURRENT_USER" | grep -q docker; then
            log_info "Ajout de $CURRENT_USER au groupe docker..."
            $SUDO_CMD usermod -aG docker "$CURRENT_USER"
            log_warning "Déconnexion/reconnexion nécessaire pour utiliser Docker sans sudo"
        else
            log_success "$CURRENT_USER déjà dans le groupe docker"
        fi
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Vérification de Docker Compose
#═══════════════════════════════════════════════════════════════════════════════

check_docker_compose() {
    section_header "Vérification de Docker Compose"
    
    # Docker Compose v2 (plugin)
    if docker compose version &> /dev/null; then
        local compose_version=$(docker compose version --short 2>/dev/null || docker compose version | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | sed 's/v//')
        log_success "Docker Compose plugin installé (v${compose_version})"
    # Docker Compose v1 (standalone)
    elif command -v docker-compose &> /dev/null; then
        local compose_version=$(docker-compose --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
        log_success "Docker Compose standalone installé (v${compose_version})"
        log_warning "Utilisation de 'docker-compose' au lieu de 'docker compose'"
    else
        log_error "Docker Compose non trouvé"
        log_info "Installation de Docker Compose plugin..."
        
        # Installer le plugin Compose
        case "$PKG_MANAGER" in
            apt)
                $PKG_INSTALL docker-compose-plugin > /dev/null 2>&1
                ;;
            dnf|yum)
                $PKG_INSTALL docker-compose-plugin > /dev/null 2>&1
                ;;
            *)
                log_error "Installation manuelle requise pour Docker Compose"
                exit 1
                ;;
        esac
        
        if docker compose version &> /dev/null; then
            log_success "Docker Compose plugin installé"
        else
            log_error "Échec de l'installation de Docker Compose"
            exit 1
        fi
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Clonage du projet
#═══════════════════════════════════════════════════════════════════════════════

clone_repository() {
    section_header "Clonage du projet PhishGuard"
    
    # Vérifier si le répertoire existe
    if [ -d "$INSTALL_DIR" ]; then
        log_warning "Le répertoire $INSTALL_DIR existe déjà"
        
        read -p "$(echo -e ${YELLOW}Supprimer et réinstaller ? [O/n]:${NC} )" -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            log_info "Suppression de $INSTALL_DIR..."
            $SUDO_CMD rm -rf "$INSTALL_DIR"
        else
            log_info "Conservation du répertoire existant"
            return 0
        fi
    fi
    
    # Créer le répertoire parent si nécessaire
    $SUDO_CMD mkdir -p "$(dirname "$INSTALL_DIR")"
    
    log_info "Clonage depuis $REPO_URL (branche: $REPO_BRANCH)..."
    
    if $SUDO_CMD git clone --depth 1 -b "$REPO_BRANCH" "$REPO_URL" "$INSTALL_DIR" > /dev/null 2>&1; then
        log_success "Projet cloné avec succès"
    else
        log_error "Échec du clonage du projet"
        log_error "Vérifiez votre connexion Internet et l'URL du dépôt"
        exit 1
    fi
    
    # Définir les permissions
    if [ "$CURRENT_USER" != "root" ]; then
        $SUDO_CMD chown -R "$CURRENT_USER":"$CURRENT_USER" "$INSTALL_DIR"
        log_success "Permissions définies pour $CURRENT_USER"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Correction des Dockerfiles
#═══════════════════════════════════════════════════════════════════════════════

fix_dockerfiles() {
    section_header "Correction des Dockerfiles"
    
    cd "$INSTALL_DIR"
    
    # Trouver tous les Dockerfiles
    local dockerfiles=$(find . -name "Dockerfile*" -type f)
    
    if [ -z "$dockerfiles" ]; then
        log_warning "Aucun Dockerfile trouvé"
        return 0
    fi
    
    log_info "Dockerfiles trouvés:"
    echo "$dockerfiles" | while read -r dockerfile; do
        echo "  - $dockerfile"
    done
    
    # Corriger chaque Dockerfile
    echo "$dockerfiles" | while read -r dockerfile; do
        log_info "Correction de: $dockerfile"
        
        # Backup
        cp "$dockerfile" "${dockerfile}.backup"
        
        # Alpine Linux - Ajouter oniguruma-dev
        if grep -q "apk add" "$dockerfile"; then
            if ! grep -q "oniguruma-dev" "$dockerfile"; then
                # Ajouter après les dépendances existantes
                sed -i '/apk add.*--no-cache/,/^[[:space:]]*&&/ {
                    /libzip-dev/a\    oniguruma-dev \\
                    /libjpeg-turbo-dev/a\    libpng-dev \\
                    /postgresql-dev/a\    icu-dev \\
                }' "$dockerfile"
                log_success "Dépendances Alpine ajoutées"
            fi
        fi
        
        # Debian/Ubuntu - Ajouter libonig-dev
        if grep -q "apt-get install" "$dockerfile"; then
            if ! grep -q "libonig-dev" "$dockerfile"; then
                sed -i '/apt-get install/,/^[[:space:]]*&&/ {
                    /libzip-dev/a\    libonig-dev \\
                    /libjpeg-dev/a\    libpng-dev \\
                    /libpq-dev/a\    libicu-dev \\
                }' "$dockerfile"
                log_success "Dépendances Debian ajoutées"
            fi
        fi
    done
    
    log_success "Correction des Dockerfiles terminée"
}

#═══════════════════════════════════════════════════════════════════════════════
# Création du fichier .env
#═══════════════════════════════════════════════════════════════════════════════

create_env_file() {
    section_header "Configuration de l'environnement"
    
    local env_file="$INSTALL_DIR/.env"
    
    if [ -f "$env_file" ]; then
        log_warning "Fichier .env existant trouvé"
        
        read -p "$(echo -e ${YELLOW}Remplacer le fichier .env ? [o/N]:${NC} )" -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Oo]$ ]]; then
            log_info "Conservation du fichier .env existant"
            return 0
        fi
        
        # Backup de l'ancien .env
        cp "$env_file" "${env_file}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Génération de secrets sécurisés
    log_info "Génération de secrets sécurisés..."
    local postgres_pass=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    local jwt_secret=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    local redis_pass=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    
    # Obtenir l'IP du serveur
    local server_ip=$(hostname -I | awk '{print $1}')
    
    cat > "$env_file" << EOF
#═══════════════════════════════════════════════════════════════════════════════
# Configuration PhishGuard BASIC
# Généré automatiquement le $(date '+%Y-%m-%d %H:%M:%S')
# Par le script d'installation PhishGuard v${SCRIPT_VERSION}
#═══════════════════════════════════════════════════════════════════════════════

# Environnement
NODE_ENV=production
PORT=8080
DEBUG=false

# Base de données PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=phishguard
POSTGRES_PASSWORD=${postgres_pass}
POSTGRES_DB=phishguard
DATABASE_URL=postgresql://phishguard:${postgres_pass}@postgres:5432/phishguard

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${redis_pass}
REDIS_URL=redis://:${redis_pass}@redis:6379

# Sécurité & Authentication
JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=7d
SESSION_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Gemini AI API (⚠️ OBLIGATOIRE - À CONFIGURER)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-pro

# Configuration Email (Optionnel - pour les campagnes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_NAME=PhishGuard Security
SMTP_FROM_EMAIL=

# URLs de l'application
APP_URL=http://${server_ip}:8080
APP_NAME=PhishGuard BASIC
FRONTEND_URL=http://${server_ip}:8080
BACKEND_URL=http://${server_ip}:8080/api

# Sécurité avancée
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=12

# Logs
LOG_LEVEL=info
LOG_FORMAT=combined

# Upload de fichiers
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png

# Session
SESSION_MAX_AGE=86400000
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true

# Timezone
TZ=Europe/Paris

EOF

    chmod 600 "$env_file"
    
    if [ "$CURRENT_USER" != "root" ]; then
        $SUDO_CMD chown "$CURRENT_USER":"$CURRENT_USER" "$env_file"
    fi
    
    log_success "Fichier .env créé avec secrets générés automatiquement"
    log_info "PostgreSQL password: ${postgres_pass:0:8}..."
    log_info "JWT secret: ${jwt_secret:0:8}..."
}

#═══════════════════════════════════════════════════════════════════════════════
# Construction et démarrage de l'application
#═══════════════════════════════════════════════════════════════════════════════

build_and_start() {
    section_header "Construction et démarrage de l'application"
    
    cd "$INSTALL_DIR"
    
    # Vérifier l'existence de docker-compose.yml
    if [ ! -f "docker-compose.yml" ] && [ ! -f "docker-compose.yaml" ]; then
        log_error "Fichier docker-compose.yml introuvable"
        exit 1
    fi
    
    # Arrêter les conteneurs existants
    log_info "Arrêt des conteneurs existants..."
    docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true
    
    # Construction des images
    log_info "Construction des images Docker (cela peut prendre plusieurs minutes)..."
    echo -e "${YELLOW}⏳ Veuillez patienter, construction en cours...${NC}"
    
    if docker compose build --no-cache > /tmp/docker-build.log 2>&1; then
        log_success "Images construites avec succès"
    else
        log_error "Échec de la construction des images"
        log_error "Consultez les logs: /tmp/docker-build.log"
        tail -n 50 /tmp/docker-build.log
        exit 1
    fi
    
    # Démarrage des conteneurs
    log_info "Démarrage des conteneurs..."
    
    if docker compose up -d > /tmp/docker-up.log 2>&1; then
        log_success "Conteneurs démarrés avec succès"
    else
        log_error "Échec du démarrage des conteneurs"
        log_error "Consultez les logs: /tmp/docker-up.log"
        tail -n 50 /tmp/docker-up.log
        exit 1
    fi
    
    # Attendre que les services soient prêts
    log_info "Attente du démarrage des services..."
    sleep 10
}

#═══════════════════════════════════════════════════════════════════════════════
# Vérification post-installation
#═══════════════════════════════════════════════════════════════════════════════

verify_installation() {
    section_header "Vérification de l'installation"
    
    cd "$INSTALL_DIR"
    
    # Vérifier les conteneurs en cours d'exécution
    log_info "Vérification des conteneurs..."
    
    local running_containers=$(docker compose ps --services --filter "status=running" 2>/dev/null | wc -l)
    local total_containers=$(docker compose ps --services 2>/dev/null | wc -l)
    
    if [ "$running_containers" -eq "$total_containers" ] && [ "$total_containers" -gt 0 ]; then
        log_success "Tous les conteneurs sont en cours d'exécution (${running_containers}/${total_containers})"
    else
        log_warning "Certains conteneurs ne sont pas démarrés (${running_containers}/${total_containers})"
        echo ""
        docker compose ps
        echo ""
    fi
    
    # Afficher les conteneurs
    echo -e "\n${BLUE}📋 État des conteneurs:${NC}"
    docker compose ps
    
    # Vérifier les logs pour les erreurs critiques
    log_info "Vérification des logs..."
    
    if docker compose logs --tail=100 2>/dev/null | grep -i "error\|fatal\|exception" | grep -v "node_modules" > /tmp/errors.log; then
        if [ -s /tmp/errors.log ]; then
            log_warning "Erreurs détectées dans les logs (non bloquantes)"
            log_info "Consultez: docker compose logs -f"
        fi
    fi
    
    # Test de connectivité
    log_info "Test de connectivité HTTP..."
    sleep 3
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|301\|302"; then
        log_success "Application accessible sur le port 8080"
    else
        log_warning "Application peut-être pas encore prête (normal lors du premier démarrage)"
        log_info "Attendez 30 secondes puis vérifiez: http://localhost:8080"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Création d'un service systemd (optionnel)
#═══════════════════════════════════════════════════════════════════════════════

create_systemd_service() {
    section_header "Création du service systemd (optionnel)"
    
    read -p "$(echo -e ${YELLOW}Créer un service systemd pour démarrage automatique ? [O/n]:${NC} )" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "Service systemd non créé"
        return 0
    fi
    
    local service_file="/etc/systemd/system/phishguard.service"
    
    log_info "Création du service systemd..."
    
    $SUDO_CMD tee "$service_file" > /dev/null << EOF
[Unit]
Description=PhishGuard BASIC - Cybersecurity Training Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${INSTALL_DIR}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0
User=${CURRENT_USER}
Group=${CURRENT_USER}

[Install]
WantedBy=multi-user.target
EOF

    $SUDO_CMD systemctl daemon-reload
    $SUDO_CMD systemctl enable phishguard.service > /dev/null 2>&1
    
    log_success "Service systemd créé et activé"
    log_info "Commandes disponibles:"
    echo "  systemctl start phishguard    # Démarrer"
    echo "  systemctl stop phishguard     # Arrêter"
    echo "  systemctl restart phishguard  # Redémarrer"
    echo "  systemctl status phishguard   # État"
}

#═══════════════════════════════════════════════════════════════════════════════
# Configuration du firewall (optionnel)
#═══════════════════════════════════════════════════════════════════════════════

configure_firewall() {
    section_header "Configuration du firewall (optionnel)"
    
    # Détecter le firewall
    local firewall_cmd=""
    
    if command -v ufw &> /dev/null; then
        firewall_cmd="ufw"
    elif command -v firewall-cmd &> /dev/null; then
        firewall_cmd="firewalld"
    elif command -v iptables &> /dev/null; then
        firewall_cmd="iptables"
    fi
    
    if [ -z "$firewall_cmd" ]; then
        log_info "Aucun firewall détecté, configuration ignorée"
        return 0
    fi
    
    log_info "Firewall détecté: $firewall_cmd"
    
    read -p "$(echo -e ${YELLOW}Configurer le firewall pour autoriser le port 8080 ? [O/n]:${NC} )" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "Configuration firewall ignorée"
        return 0
    fi
    
    case "$firewall_cmd" in
        ufw)
            $SUDO_CMD ufw allow 8080/tcp > /dev/null 2>&1
            log_success "Port 8080 autorisé (UFW)"
            ;;
        firewalld)
            $SUDO_CMD firewall-cmd --permanent --add-port=8080/tcp > /dev/null 2>&1
            $SUDO_CMD firewall-cmd --reload > /dev/null 2>&1
            log_success "Port 8080 autorisé (FirewallD)"
            ;;
        iptables)
            $SUDO_CMD iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
            $SUDO_CMD service iptables save > /dev/null 2>&1 || true
            log_success "Port 8080 autorisé (iptables)"
            ;;
    esac
}

#═══════════════════════════════════════════════════════════════════════════════
# Affichage des instructions finales
#═══════════════════════════════════════════════════════════════════════════════

show_final_instructions() {
    local server_ip=$(hostname -I | awk '{print $1}')
    local server_hostname=$(hostname)
    
    clear
    echo -e "${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                      ✅ INSTALLATION TERMINÉE AVEC SUCCÈS                     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                          📋 INFORMATIONS D'ACCÈS                              ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BLUE}🌐 URLs d'accès:${NC}"
    echo -e "   Local:      ${GREEN}http://localhost:8080${NC}"
    echo -e "   IP:         ${GREEN}http://${server_ip}:8080${NC}"
    echo -e "   Hostname:   ${GREEN}http://${server_hostname}:8080${NC}\n"
    
    echo -e "${BLUE}📁 Répertoire d'installation:${NC}"
    echo -e "   ${GREEN}${INSTALL_DIR}${NC}\n"
    
    echo -e "${BLUE}📝 Fichier de logs:${NC}"
    echo -e "   ${GREEN}${LOG_FILE}${NC}\n"
    
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    ⚠️  CONFIGURATION OBLIGATOIRE                              ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${RED}🔑 Clé API Gemini REQUISE:${NC}\n"
    echo -e "   1. Obtenez une clé API gratuite:"
    echo -e "      ${BLUE}https://aistudio.google.com/app/apikey${NC}\n"
    echo -e "   2. Configurez la clé dans le fichier .env:"
    echo -e "      ${GREEN}cd ${INSTALL_DIR}${NC}"
    echo -e "      ${GREEN}nano .env${NC}"
    echo -e "      Remplacer: ${RED}YOUR_GEMINI_API_KEY_HERE${NC}\n"
    echo -e "   3. Redémarrez l'application:"
    echo -e "      ${GREEN}cd ${INSTALL_DIR} && docker compose restart${NC}\n"
    
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                           📖 COMMANDES UTILES                                 ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BLUE}Navigation:${NC}"
    echo -e "   ${GREEN}cd ${INSTALL_DIR}${NC}                          # Aller dans le répertoire\n"
    
    echo -e "${BLUE}Gestion des conteneurs:${NC}"
    echo -e "   ${GREEN}docker compose ps${NC}                          # Voir les conteneurs"
    echo -e "   ${GREEN}docker compose logs -f${NC}                     # Voir les logs en temps réel"
    echo -e "   ${GREEN}docker compose logs -f backend${NC}             # Logs du backend uniquement"
    echo -e "   ${GREEN}docker compose restart${NC}                     # Redémarrer tous les services"
    echo -e "   ${GREEN}docker compose restart backend${NC}             # Redémarrer le backend uniquement"
    echo -e "   ${GREEN}docker compose stop${NC}                        # Arrêter l'application"
    echo -e "   ${GREEN}docker compose start${NC}                       # Démarrer l'application"
    echo -e "   ${GREEN}docker compose down${NC}                        # Arrêter et supprimer les conteneurs"
    echo -e "   ${GREEN}docker compose down -v${NC}                     # + supprimer les volumes (⚠️ données)\n"
    
    echo -e "${BLUE}Mise à jour:${NC}"
    echo -e "   ${GREEN}git pull origin ${REPO_BRANCH}${NC}                    # Récupérer les mises à jour"
    echo -e "   ${GREEN}docker compose build --no-cache${NC}            # Reconstruire les images"
    echo -e "   ${GREEN}docker compose up -d${NC}                       # Redémarrer avec les nouvelles images\n"
    
    echo -e "${BLUE}Dépannage:${NC}"
    echo -e "   ${GREEN}docker compose ps -a${NC}                       # Voir tous les conteneurs"
    echo -e "   ${GREEN}docker compose logs --tail=100${NC}             # Voir les 100 dernières lignes de logs"
    echo -e "   ${GREEN}docker system prune -af${NC}                    # Nettoyer Docker (⚠️ tout supprimer)"
    echo -e "   ${GREEN}docker volume ls${NC}                           # Lister les volumes"
    echo -e "   ${GREEN}docker network ls${NC}                          # Lister les réseaux\n"
    
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                         🔐 SÉCURITÉ & BONNES PRATIQUES                        ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${YELLOW}⚠️  Recommandations de sécurité:${NC}\n"
    echo -e "   ✅ Changez les mots de passe par défaut dans .env"
    echo -e "   ✅ Configurez HTTPS avec un reverse proxy (Nginx/Traefik)"
    echo -e "   ✅ Activez le firewall et limitez l'accès au port 8080"
    echo -e "   ✅ Effectuez des sauvegardes régulières de la base de données"
    echo -e "   ✅ Surveillez les logs régulièrement"
    echo -e "   ✅ Gardez Docker et le système à jour\n"
    
    echo -e "${BLUE}Sauvegarde de la base de données:${NC}"
    echo -e "   ${GREEN}docker compose exec postgres pg_dump -U phishguard phishguard > backup.sql${NC}\n"
    
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                          ⚖️  AVERTISSEMENT LÉGAL                              ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${RED}⚠️  CET OUTIL EST DESTINÉ UNIQUEMENT À:${NC}\n"
    echo -e "   ${GREEN}✅${NC} La formation interne des employés de votre organisation"
    echo -e "   ${GREEN}✅${NC} Les campagnes de sensibilisation à la cybersécurité"
    echo -e "   ${GREEN}✅${NC} Les tests de sécurité autorisés et documentés\n"
    
    echo -e "${RED}❌ STRICTEMENT INTERDIT:${NC}\n"
    echo -e "   ${RED}✗${NC} Réaliser de vraies attaques de phishing"
    echo -e "   ${RED}✗${NC} Collecter des données non autorisées"
    echo -e "   ${RED}✗${NC} Cibler des personnes en dehors de votre organisation"
    echo -e "   ${RED}✗${NC} Utiliser à des fins malveillantes\n"
    
    echo -e "${YELLOW}Toute utilisation malveillante peut entraîner des poursuites judiciaires.${NC}\n"
    
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                              📞 SUPPORT                                        ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BLUE}🐛 Signaler un bug:${NC}"
    echo -e "   ${GREEN}https://github.com/Reaper-Official/cyber-prevention-tool/issues${NC}\n"
    
    echo -e "${BLUE}💬 Communauté:${NC}"
    echo -e "   ${GREEN}https://github.com/Reaper-Official/cyber-prevention-tool/discussions${NC}\n"
    
    echo -e "${BLUE}📧 Contact:${NC}"
    echo -e "   ${GREEN}reaper@etik.com${NC}\n"
    
    if [ "$CURRENT_USER" != "root" ]; then
        echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║                           ⚠️  ACTION REQUISE                                  ║${NC}"
        echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
        echo -e "${YELLOW}⚠️  Pour utiliser Docker sans sudo, déconnectez-vous puis reconnectez-vous:${NC}"
        echo -e "   ${GREEN}exit${NC}  # puis reconnectez-vous avec SSH\n"
    fi
    
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎉 Merci d'utiliser PhishGuard BASIC !                     ║${NC}"
    echo -e "${GREEN}║                Pour un internet plus sûr et une cybersécurité accessible     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${CYAN}Installation terminée avec succès ! 🚀${NC}\n"
}

#═══════════════════════════════════════════════════════════════════════════════
# Nettoyage en cas d'erreur
#═══════════════════════════════════════════════════════════════════════════════

cleanup_on_error() {
    log_error "Une erreur est survenue pendant l'installation"
    log_info "Consultez le fichier de log: $LOG_FILE"
    
    read -p "$(echo -e ${YELLOW}Voulez-vous nettoyer l'installation partielle ? [o/N]:${NC} )" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        log_info "Nettoyage en cours..."
        
        if [ -d "$INSTALL_DIR" ]; then
            cd "$INSTALL_DIR" 2>/dev/null && docker compose down -v 2>/dev/null || true
            $SUDO_CMD rm -rf "$INSTALL_DIR"
        fi
        
        log_success "Nettoyage terminé"
    fi
    
    exit 1
}

#═══════════════════════════════════════════════════════════════════════════════
# Fonction principale
#═══════════════════════════════════════════════════════════════════════════════

main() {
    # Configuration du logging
    setup_logging
    
    # Affichage de la bannière
    print_banner
    
    # Message de bienvenue
    echo -e "${CYAN}Bienvenue dans l'installateur PhishGuard BASIC v${SCRIPT_VERSION}${NC}"
    echo -e "${CYAN}Ce script va installer tous les prérequis et déployer l'application${NC}\n"
    
    sleep 2
    
    # Vérifications préliminaires
    check_privileges
    detect_system
    update_system
    install_basic_tools
    check_system_resources
    check_ports
    
    # Installation des dépendances
    install_git
    install_docker
    check_docker_compose
    
    # Configuration du projet
    clone_repository
    fix_dockerfiles
    create_env_file
    
    # Déploiement
    build_and_start
    verify_installation
    
    # Configuration optionnelle
    create_systemd_service
    configure_firewall
    
    # Instructions finales
    show_final_instructions
    
    log_success "Installation terminée avec succès!"
}

#═══════════════════════════════════════════════════════════════════════════════
# Gestion des signaux et point d'entrée
#═══════════════════════════════════════════════════════════════════════════════

# Gestion des interruptions
trap cleanup_on_error ERR
trap 'echo -e "\n${RED}Installation interrompue par l'\''utilisateur${NC}"; exit 130' INT TERM

# Vérifier que le script n'est pas exécuté avec "sh" (nécessite bash)
if [ -z "$BASH_VERSION" ]; then
    echo "❌ Ce script nécessite bash. Exécutez avec: bash $0"
    exit 1
fi

# Point d'entrée
main "$@"

exit 0
