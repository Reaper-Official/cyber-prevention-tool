#!/bin/bash

#═══════════════════════════════════════════════════════════════════════════════
#  Script d'installation PhishGuard BASIC - Version Ultra-Complète
#  Description: Installation 100% automatisée sur machine vierge
#  Auteur: Reaper Official
#  Version: 2.0.0
#  Prérequis: AUCUN - Le script installe tout
#═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail
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
readonly MIN_RAM=2048
readonly MIN_DISK=10
readonly REQUIRED_PORTS=(8080 5432 6379)

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
    sudo touch "$LOG_FILE" 2>/dev/null || touch "$LOG_FILE"
    sudo chmod 666 "$LOG_FILE" 2>/dev/null || chmod 666 "$LOG_FILE"
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
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
║              🚀 Installation Automatique v2.0.0                               ║
║                     💻 Pour Machine Vierge - Zéro Prérequis                   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $*"
}

log_error() {
    echo -e "${RED}[✗]${NC} $*"
}

section_header() {
    echo ""
    echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════╗${NC}"
    printf "${MAGENTA}║${NC} %-56s ${MAGENTA}║${NC}\n" "$1"
    echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════╝${NC}"
}

#═══════════════════════════════════════════════════════════════════════════════
# Vérification des privilèges
#═══════════════════════════════════════════════════════════════════════════════

check_privileges() {
    section_header "Vérification des privilèges"
    
    if [ "$EUID" -eq 0 ]; then
        log_success "Script exécuté en tant que root"
        SUDO_CMD=""
        CURRENT_USER="${SUDO_USER:-root}"
        
        if [ -n "${SUDO_USER:-}" ]; then
            CURRENT_USER="$SUDO_USER"
        fi
    else
        if command -v sudo &> /dev/null; then
            if sudo -n true 2>/dev/null; then
                log_success "Privilèges sudo disponibles"
                SUDO_CMD="sudo"
                CURRENT_USER="$USER"
            else
                log_error "Ce script nécessite les privilèges root ou sudo"
                echo ""
                echo "Exécutez avec: sudo bash $0"
                exit 1
            fi
        else
            log_error "sudo n'est pas installé et vous n'êtes pas root"
            exit 1
        fi
    fi
    
    log_info "Utilisateur: ${CURRENT_USER}"
}

#═══════════════════════════════════════════════════════════════════════════════
# Détection du système
#═══════════════════════════════════════════════════════════════════════════════

detect_system() {
    section_header "Détection du système"
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=${VERSION_ID:-"unknown"}
        log_info "Système: $PRETTY_NAME"
    else
        log_error "Impossible de détecter le système"
        exit 1
    fi
    
    if command -v apt-get &> /dev/null; then
        PKG_MANAGER="apt"
        PKG_UPDATE="$SUDO_CMD apt-get update -qq"
        PKG_INSTALL="$SUDO_CMD DEBIAN_FRONTEND=noninteractive apt-get install -y -qq"
        log_success "Gestionnaire: APT"
    elif command -v dnf &> /dev/null; then
        PKG_MANAGER="dnf"
        PKG_UPDATE="$SUDO_CMD dnf check-update -q || true"
        PKG_INSTALL="$SUDO_CMD dnf install -y -q"
        log_success "Gestionnaire: DNF"
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum"
        PKG_UPDATE="$SUDO_CMD yum check-update -q || true"
        PKG_INSTALL="$SUDO_CMD yum install -y -q"
        log_success "Gestionnaire: YUM"
    else
        log_error "Gestionnaire de paquets non supporté"
        exit 1
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Mise à jour et outils de base
#═══════════════════════════════════════════════════════════════════════════════

update_system() {
    section_header "Mise à jour du système"
    log_info "Mise à jour de la liste des paquets..."
    $PKG_UPDATE > /dev/null 2>&1 || true
    log_success "Liste des paquets mise à jour"
}

install_basic_tools() {
    section_header "Installation des outils de base"
    
    local tools=("curl" "wget" "ca-certificates" "gnupg" "lsb-release")
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_info "Installation de $tool..."
            $PKG_INSTALL "$tool" > /dev/null 2>&1 || log_warning "Échec: $tool"
        else
            log_success "$tool installé"
        fi
    done
}

#═══════════════════════════════════════════════════════════════════════════════
# Vérification des ressources
#═══════════════════════════════════════════════════════════════════════════════

check_system_resources() {
    section_header "Vérification des ressources"
    
    local total_ram=$(free -m | awk 'NR==2{print $2}')
    local available_ram=$(free -m | awk 'NR==2{print $7}')
    
    log_info "RAM totale: ${total_ram}MB"
    log_info "RAM disponible: ${available_ram}MB"
    
    if [ "$available_ram" -lt "$MIN_RAM" ]; then
        log_warning "RAM faible (recommandé: ${MIN_RAM}MB)"
    else
        log_success "RAM suffisante"
    fi
    
    local available_disk=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    log_info "Espace disque: ${available_disk}GB"
    
    if [ "$available_disk" -lt "$MIN_DISK" ]; then
        log_error "Espace insuffisant (minimum: ${MIN_DISK}GB)"
        exit 1
    else
        log_success "Espace disque suffisant"
    fi
    
    local swap_size=$(free -m | awk 'NR==3{print $2}')
    if [ "$swap_size" -eq 0 ]; then
        log_warning "Aucun SWAP configuré"
        read -p "$(echo -e ${YELLOW}Créer un SWAP de 2GB ? [O/n]:${NC} )" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            create_swap
        fi
    else
        log_success "SWAP: ${swap_size}MB"
    fi
}

create_swap() {
    log_info "Création du SWAP..."
    
    if [ -f /swapfile ]; then
        $SUDO_CMD swapoff /swapfile 2>/dev/null || true
        $SUDO_CMD rm -f /swapfile
    fi
    
    $SUDO_CMD fallocate -l 2G /swapfile 2>/dev/null || \
        $SUDO_CMD dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
    
    $SUDO_CMD chmod 600 /swapfile
    $SUDO_CMD mkswap /swapfile > /dev/null 2>&1
    $SUDO_CMD swapon /swapfile
    
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | $SUDO_CMD tee -a /etc/fstab > /dev/null
    fi
    
    log_success "SWAP créé (2GB)"
}

#═══════════════════════════════════════════════════════════════════════════════
# Vérification des ports
#═══════════════════════════════════════════════════════════════════════════════

check_ports() {
    section_header "Vérification des ports"
    
    for port in "${REQUIRED_PORTS[@]}"; do
        if $SUDO_CMD ss -tuln 2>/dev/null | grep -q ":$port "; then
            log_error "Port $port déjà utilisé"
            read -p "$(echo -e ${YELLOW}Continuer ? [o/N]:${NC} )" -n 1 -r
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
        log_success "Git installé ($(git --version | awk '{print $3}'))"
    else
        log_info "Installation de Git..."
        $PKG_INSTALL git > /dev/null 2>&1
        
        if command -v git &> /dev/null; then
            log_success "Git installé"
        else
            log_error "Échec installation Git"
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
        log_success "Docker installé ($(docker --version | awk '{print $3}' | sed 's/,//'))"
        
        if ! $SUDO_CMD docker ps > /dev/null 2>&1; then
            log_warning "Docker ne fonctionne pas, redémarrage..."
            $SUDO_CMD systemctl start docker 2>/dev/null || true
        fi
    else
        log_info "Installation de Docker..."
        
        if curl -fsSL https://get.docker.com -o /tmp/get-docker.sh 2>/dev/null; then
            $SUDO_CMD sh /tmp/get-docker.sh > /dev/null 2>&1
            rm -f /tmp/get-docker.sh
        else
            $PKG_INSTALL docker.io docker-compose-plugin > /dev/null 2>&1
        fi
        
        $SUDO_CMD systemctl start docker 2>/dev/null || true
        $SUDO_CMD systemctl enable docker 2>/dev/null || true
        
        if command -v docker &> /dev/null; then
            log_success "Docker installé"
        else
            log_error "Échec installation Docker"
            exit 1
        fi
    fi
    
    if [ "$CURRENT_USER" != "root" ] && [ -n "$CURRENT_USER" ]; then
        if ! groups "$CURRENT_USER" | grep -q docker; then
            $SUDO_CMD usermod -aG docker "$CURRENT_USER"
            log_warning "Reconnexion nécessaire pour Docker sans sudo"
        fi
    fi
}

check_docker_compose() {
    section_header "Vérification Docker Compose"
    
    if docker compose version &> /dev/null; then
        log_success "Docker Compose installé"
    elif command -v docker-compose &> /dev/null; then
        log_success "Docker Compose standalone installé"
    else
        log_error "Docker Compose non trouvé"
        $PKG_INSTALL docker-compose-plugin > /dev/null 2>&1
        
        if docker compose version &> /dev/null; then
            log_success "Docker Compose installé"
        else
            log_error "Échec installation Docker Compose"
            exit 1
        fi
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Clonage et configuration
#═══════════════════════════════════════════════════════════════════════════════

clone_repository() {
    section_header "Clonage du projet"
    
    if [ -d "$INSTALL_DIR" ]; then
        log_warning "Répertoire $INSTALL_DIR existe"
        read -p "$(echo -e ${YELLOW}Supprimer et réinstaller ? [O/n]:${NC} )" -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            $SUDO_CMD rm -rf "$INSTALL_DIR"
        else
            return 0
        fi
    fi
    
    $SUDO_CMD mkdir -p "$(dirname "$INSTALL_DIR")"
    
    log_info "Clonage depuis GitHub..."
    
    if $SUDO_CMD git clone --depth 1 -b "$REPO_BRANCH" "$REPO_URL" "$INSTALL_DIR" > /dev/null 2>&1; then
        log_success "Projet cloné"
    else
        log_error "Échec du clonage"
        exit 1
    fi
    
    if [ "$CURRENT_USER" != "root" ]; then
        $SUDO_CMD chown -R "$CURRENT_USER":"$CURRENT_USER" "$INSTALL_DIR"
    fi
}

fix_dockerfiles() {
    section_header "Correction des Dockerfiles"
    
    cd "$INSTALL_DIR"
    
    local dockerfiles=$(find . -name "Dockerfile*" -type f)
    
    if [ -z "$dockerfiles" ]; then
        log_warning "Aucun Dockerfile trouvé"
        return 0
    fi
    
    echo "$dockerfiles" | while read -r dockerfile; do
        log_info "Correction: $dockerfile"
        cp "$dockerfile" "${dockerfile}.backup"
        
        if grep -q "apk add" "$dockerfile"; then
            if ! grep -q "oniguruma-dev" "$dockerfile"; then
                sed -i '/apk add.*--no-cache/,/^[[:space:]]*&&/ {
                    /libzip-dev/a\    oniguruma-dev \\
                    /libjpeg-turbo-dev/a\    libpng-dev \\
                }' "$dockerfile"
                log_success "Dépendances Alpine ajoutées"
            fi
        fi
        
        if grep -q "apt-get install" "$dockerfile"; then
            if ! grep -q "libonig-dev" "$dockerfile"; then
                sed -i '/apt-get install/,/^[[:space:]]*&&/ {
                    /libzip-dev/a\    libonig-dev \\
                }' "$dockerfile"
                log_success "Dépendances Debian ajoutées"
            fi
        fi
    done
}

create_env_file() {
    section_header "Configuration environnement"
    
    local env_file="$INSTALL_DIR/.env"
    
    if [ -f "$env_file" ]; then
        read -p "$(echo -e ${YELLOW}Remplacer .env ? [o/N]:${NC} )" -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Oo]$ ]]; then
            return 0
        fi
    fi
    
    log_info "Génération des secrets..."
    local postgres_pass=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    local jwt_secret=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    local server_ip=$(hostname -I | awk '{print $1}')
    
    cat > "$env_file" << EOF
# PhishGuard BASIC Configuration
# Généré le $(date '+%Y-%m-%d %H:%M:%S')

NODE_ENV=production
PORT=8080

POSTGRES_USER=phishguard
POSTGRES_PASSWORD=${postgres_pass}
POSTGRES_DB=phishguard
DATABASE_URL=postgresql://phishguard:${postgres_pass}@postgres:5432/phishguard

REDIS_URL=redis://redis:6379

JWT_SECRET=${jwt_secret}

GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

APP_URL=http://${server_ip}:8080
EOF

    chmod 600 "$env_file"
    
    if [ "$CURRENT_USER" != "root" ]; then
        $SUDO_CMD chown "$CURRENT_USER":"$CURRENT_USER" "$env_file"
    fi
    
    log_success "Fichier .env créé"
}

#═══════════════════════════════════════════════════════════════════════════════
# Build et démarrage
#═══════════════════════════════════════════════════════════════════════════════

build_and_start() {
    section_header "Construction et démarrage"
    
    cd "$INSTALL_DIR"
    
    if [ ! -f "docker-compose.yml" ] && [ ! -f "docker-compose.yaml" ]; then
        log_error "docker-compose.yml introuvable"
        exit 1
    fi
    
    log_info "Arrêt des conteneurs existants..."
    docker compose down 2>/dev/null || true
    
    log_info "Construction des images (patience...)..."
    
    if docker compose build --no-cache > /tmp/docker-build.log 2>&1; then
        log_success "Images construites"
    else
        log_error "Échec construction"
        tail -n 50 /tmp/docker-build.log
        exit 1
    fi
    
    log_info "Démarrage des conteneurs..."
    
    if docker compose up -d > /tmp/docker-up.log 2>&1; then
        log_success "Conteneurs démarrés"
    else
        log_error "Échec démarrage"
        tail -n 50 /tmp/docker-up.log
        exit 1
    fi
    
    sleep 10
}

verify_installation() {
    section_header "Vérification"
    
    cd "$INSTALL_DIR"
    
    local running=$(docker compose ps --services --filter "status=running" 2>/dev/null | wc -l)
    local total=$(docker compose ps --services 2>/dev/null | wc -l)
    
    if [ "$running" -eq "$total" ] && [ "$total" -gt 0 ]; then
        log_success "Conteneurs OK (${running}/${total})"
    else
        log_warning "Conteneurs partiels (${running}/${total})"
        docker compose ps
    fi
}

show_final_instructions() {
    local server_ip=$(hostname -I | awk '{print $1}')
    
    clear
    echo -e "${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║            ✅ INSTALLATION TERMINÉE AVEC SUCCÈS                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    echo -e "${BLUE}🌐 URLs d'accès:${NC}"
    echo -e "   ${GREEN}http://localhost:8080${NC}"
    echo -e "   ${GREEN}http://${server_ip}:8080${NC}\n"
    
    echo -e "${BLUE}📁 Installation:${NC} ${GREEN}${INSTALL_DIR}${NC}\n"
    
    echo -e "${RED}⚠️  CONFIGURATION OBLIGATOIRE:${NC}\n"
    echo -e "1. Clé API Gemini: ${BLUE}https://aistudio.google.com/app/apikey${NC}"
    echo -e "2. Modifier: ${GREEN}nano ${INSTALL_DIR}/.env${NC}"
    echo -e "3. Remplacer: ${RED}YOUR_GEMINI_API_KEY_HERE${NC}"
    echo -e "4. Redémarrer: ${GREEN}cd ${INSTALL_DIR} && docker compose restart${NC}\n"
    
    echo -e "${BLUE}📖 Commandes utiles:${NC}"
    echo -e "   ${GREEN}cd ${INSTALL_DIR}${NC}"
    echo -e "   ${GREEN}docker compose ps${NC}              # Statut"
    echo -e "   ${GREEN}docker compose logs -f${NC}         # Logs"
    echo -e "   ${GREEN}docker compose restart${NC}         # Redémarrer"
    echo -e "   ${GREEN}docker compose down${NC}            # Arrêter\n"
    
    echo -e "${YELLOW}Installation terminée ! 🚀${NC}\n"
}

cleanup_on_error() {
    log_error "Erreur pendant l'installation"
    log_info "Consultez: $LOG_FILE"
    exit 1
}

#═══════════════════════════════════════════════════════════════════════════════
# Main
#═══════════════════════════════════════════════════════════════════════════════

main() {
    setup_logging
    print_banner
    
    echo -e "${CYAN}Installation PhishGuard BASIC v${SCRIPT_VERSION}${NC}\n"
    sleep 2
    
    check_privileges
    detect_system
    update_system
    install_basic_tools
    check_system_resources
    check_ports
    install_git
    install_docker
    check_docker_compose
    clone_repository
    fix_dockerfiles
    create_env_file
    build_and_start
    verify_installation
    show_final_instructions
    
    log_success "Installation terminée!"
}

trap cleanup_on_error ERR
trap 'echo -e "\n${RED}Interrompu${NC}"; exit 130' INT TERM

if [ -z "$BASH_VERSION" ]; then
    echo "❌ Nécessite bash. Exécutez: bash $0"
    exit 1
fi

main "$@"

exit 0
