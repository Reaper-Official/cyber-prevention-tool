#!/bin/bash
# install.sh - Installation automatique complète de PhishGuard BASIC
# =================================================================

set -e

# Configuration
REPO_URL="https://github.com/Reaper-Official/cyber-prevention-tool"
PROJECT_NAME="phishguard-basic"
INSTALL_DIR="/opt/$PROJECT_NAME"
SERVICE_USER="phishguard"
LOG_FILE="/tmp/phishguard_install.log"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

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
    echo -e "${GREEN}🚀 Installateur automatique de PhishGuard BASIC${NC}"
    echo -e "${YELLOW}⚠️  Ce script va installer toutes les dépendances nécessaires${NC}"
    echo ""
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

print_status() { echo -e "${GREEN}✅ $1${NC}"; log "SUCCESS: $1"; }
print_error() { echo -e "${RED}❌ $1${NC}"; log "ERROR: $1"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; log "WARNING: $1"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; log "INFO: $1"; }
print_step() { echo -e "${PURPLE}🔧 $1${NC}"; log "STEP: $1"; }

# Détection de l'OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="debian"
            PKG_MANAGER="apt"
        elif [ -f /etc/redhat-release ]; then
            OS="redhat"
            PKG_MANAGER="yum"
        elif [ -f /etc/arch-release ]; then
            OS="arch"
            PKG_MANAGER="pacman"
        else
            OS="linux"
            PKG_MANAGER="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PKG_MANAGER="brew"
    else
        OS="unknown"
        PKG_MANAGER="unknown"
    fi
    
    print_info "OS détecté: $OS ($PKG_MANAGER)"
}

# Vérification des privilèges
check_privileges() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Ce script doit être exécuté en tant que root (sudo)"
        echo "Utilisation: sudo bash install.sh"
        exit 1
    fi
    print_status "Privilèges administrateur confirmés"
}

# Installation des dépendances système
install_system_dependencies() {
    print_step "Installation des dépendances système..."
    
    case $PKG_MANAGER in
        "apt")
            apt update -y
            apt install -y \
                curl \
                wget \
                git \
                unzip \
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
                vim
            ;;
        "yum")
            yum update -y
            yum install -y \
                curl \
                wget \
                git \
                unzip \
                openssl \
                firewalld \
                fail2ban \
                htop \
                nano \
                vim
            ;;
        "pacman")
            pacman -Syu --noconfirm
            pacman -S --noconfirm \
                curl \
                wget \
                git \
                unzip \
                openssl \
                ufw \
                fail2ban \
                htop \
                nano \
                vim
            ;;
        "brew")
            if ! command -v brew &> /dev/null; then
                print_info "Installation de Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew update
            brew install curl wget git openssl
            ;;
        *)
            print_error "Gestionnaire de paquets non supporté: $PKG_MANAGER"
            exit 1
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
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            if [ -f /etc/debian_version ]; then
                DISTRO="ubuntu"
                if grep -q "Ubuntu" /etc/os-release; then
                    DISTRO="ubuntu"
                elif grep -q "Debian" /etc/os-release; then
                    DISTRO="debian"
                fi
            fi
            
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            apt update
            apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
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
            print_info "Sur macOS, veuillez installer Docker Desktop manuellement"
            open "https://www.docker.com/products/docker-desktop"
            read -p "Appuyez sur Entrée une fois Docker Desktop installé..."
            ;;
    esac
    
    # Vérification de l'installation
    if command -v docker &> /dev/null; then
        print_status "Docker installé: $(docker --version)"
        
        # Ajout de l'utilisateur au groupe docker
        if [ "$OS" != "macos" ]; then
            usermod -aG docker $SUDO_USER 2>/dev/null || true
        fi
    else
        print_error "Échec de l'installation de Docker"
        exit 1
    fi
}

# Installation de Docker Compose
install_docker_compose() {
    print_step "Vérification de Docker Compose..."
    
    if docker compose version &> /dev/null; then
        print_status "Docker Compose (plugin) déjà disponible"
        return 0
    fi
    
    if command -v docker-compose &> /dev/null; then
        print_status "Docker Compose (standalone) déjà installé"
        return 0
    fi
    
    print_info "Installation de Docker Compose..."
    
    # Installation du plugin Docker Compose (méthode recommandée)
    if [ "$OS" != "macos" ]; then
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    fi
    
    # Vérification
    if docker compose version &> /dev/null || command -v docker-compose &> /dev/null; then
        print_status "Docker Compose installé"
    else
        print_error "Échec de l'installation de Docker Compose"
        exit 1
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
    usermod -aG docker "$SERVICE_USER" 2>/dev/null || true
}

# Téléchargement et installation du projet
install_project() {
    print_step "Téléchargement du projet PhishGuard BASIC..."
    
    # Création du répertoire d'installation
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Suppression de l'ancien projet s'il existe
    if [ -d ".git" ]; then
        print_info "Mise à jour du projet existant..."
        git fetch origin
        git reset --hard origin/main
        git clean -fd
    else
        print_info "Clonage du projet depuis GitHub..."
        rm -rf * .* 2>/dev/null || true
        git clone "$REPO_URL" .
    fi
    
    print_status "Projet téléchargé dans $INSTALL_DIR"
}

# Configuration des permissions
setup_permissions() {
    print_step "Configuration des permissions..."
    
    # Répertoires de données
    mkdir -p {storage/{logs,cache,uploads,backups,reports},ssl,nginx/sites-available,docker/php,templates}
    
    # Permissions
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    chmod -R 755 "$INSTALL_DIR"
    chmod -R 775 "$INSTALL_DIR/storage"
    
    # Scripts exécutables
    chmod +x "$INSTALL_DIR/install.sh" 2>/dev/null || true
    chmod +x "$INSTALL_DIR/docker/init.sh" 2>/dev/null || true
    
    print_status "Permissions configurées"
}

# Configuration du firewall
setup_firewall() {
    print_step "Configuration du firewall..."
    
    case $OS in
        "debian"|"arch")
            if command -v ufw &> /dev/null; then
                ufw --force enable
                ufw allow 22/tcp
                ufw allow 80/tcp
                ufw allow 443/tcp
                ufw allow from 127.0.0.1
                print_status "Firewall UFW configuré"
            fi
            ;;
        "redhat")
            if command -v firewall-cmd &> /dev/null; then
                systemctl start firewalld
                systemctl enable firewalld
                firewall-cmd --permanent --add-service=http
                firewall-cmd --permanent --add-service=https
                firewall-cmd --permanent --add-service=ssh
                firewall-cmd --reload
                print_status "Firewall firewalld configuré"
            fi
            ;;
    esac
}

# Configuration de Fail2Ban
setup_fail2ban() {
    print_step "Configuration de Fail2Ban..."
    
    if command -v fail2ban-server &> /dev/null; then
        # Configuration basique Fail2Ban pour PhishGuard
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
EOF
        
        # Filtre personnalisé pour PhishGuard
        cat > /etc/fail2ban/filter.d/phishguard-auth.conf << 'EOF'
[Definition]
failregex = ^.*\[.*\] "POST /management/api/auth/login.php.*" 401.*$
            ^.*login_failed.*IP: <HOST>.*$
ignoreregex =
EOF
        
        systemctl restart fail2ban
        systemctl enable fail2ban
        print_status "Fail2Ban configuré pour PhishGuard"
    fi
}

# Configuration de l'environnement
setup_environment() {
    print_step "Configuration de l'environnement..."
    
    cd "$INSTALL_DIR"
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
        else
            # Création d'un .env minimal
            cat > .env << EOF
# PhishGuard BASIC - Configuration
APP_NAME="PhishGuard BASIC"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost

# Base de données PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_NAME=phishguard_basic
DB_USER=phishguard
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Cache Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Sécurité
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Email SMTP
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_ENCRYPTION=tls

# IA Gemini
GEMINI_API_KEY=
EOF
        fi
        
        print_status "Fichier .env créé avec des clés sécurisées"
    else
        print_info "Fichier .env existant conservé"
    fi
    
    # Permissions sur .env
    chmod 600 .env
    chown "$SERVICE_USER:$SERVICE_USER" .env
}

# Installation et démarrage des services
start_services() {
    print_step "Construction et démarrage des services..."
    
    cd "$INSTALL_DIR"
    
    # Construction des images
    print_info "Construction des images Docker..."
    sudo -u "$SERVICE_USER" docker-compose build --no-cache
    
    # Démarrage des services
    print_info "Démarrage des services..."
    sudo -u "$SERVICE_USER" docker-compose up -d
    
    # Attente de PostgreSQL
    print_info "Attente de l'initialisation de PostgreSQL..."
    sleep 30
    
    # Test de connectivité
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if sudo -u "$SERVICE_USER" docker-compose exec -T db pg_isready -U phishguard -d phishguard_basic >/dev/null 2>&1; then
            print_status "PostgreSQL opérationnel"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Timeout: PostgreSQL n'a pas pu démarrer"
            sudo -u "$SERVICE_USER" docker-compose logs db
            exit 1
        fi
        
        printf "."
        sleep 2
        ((attempt++))
    done
    
    # Configuration initiale de la base de données
    print_info "Configuration initiale de la base de données..."
    sudo -u "$SERVICE_USER" docker-compose exec -T app php setup.php
    
    print_status "Services démarrés avec succès"
}

# Création du service systemd
create_systemd_service() {
    print_step "Création du service systemd..."
    
    cat > /etc/systemd/system/phishguard.service << EOF
[Unit]
Description=PhishGuard BASIC - Cybersecurity Training Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$SERVICE_USER
Group=$SERVICE_USER

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable phishguard.service
    
    print_status "Service systemd créé et activé"
}

# Tests de validation
run_tests() {
    print_step "Tests de validation..."
    
    cd "$INSTALL_DIR"
    
    # Test des services Docker
    services=("phishguard_db" "phishguard_redis" "phishguard_app" "phishguard_nginx")
    for service in "${services[@]}"; do
        if sudo -u "$SERVICE_USER" docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
            print_status "Service $service: opérationnel"
        else
            print_error "Service $service: problème détecté"
            sudo -u "$SERVICE_USER" docker-compose logs "$service" | tail -10
        fi
    done
    
    # Test de connectivité web
    sleep 10
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
        print_status "Interface web accessible"
    else
        print_warning "Interface web non accessible - vérifiez les logs"
    fi
    
    # Test de la base de données
    if sudo -u "$SERVICE_USER" docker-compose exec -T app php -r "
        try { 
            \$pdo = new PDO('pgsql:host=db;port=5432;dbname=phishguard_basic', 'phishguard', getenv('DB_PASSWORD')); 
            echo 'OK'; 
        } catch(Exception \$e) { 
            echo 'FAIL'; 
            exit(1); 
        }
    " | grep -q "OK"; then
        print_status "Base de données PostgreSQL: opérationnelle"
    else
        print_error "Base de données PostgreSQL: problème"
    fi
}

# Création du rapport d'installation
create_install_report() {
    print_step "Génération du rapport d'installation..."
    
    REPORT_FILE="$INSTALL_DIR/installation_report.txt"
    
    cat > "$REPORT_FILE" << EOF
===========================================
  PHISHGUARD BASIC - RAPPORT D'INSTALLATION
===========================================

Date d'installation: $(date)
Système: $(uname -a)
Utilisateur: $(whoami)

SERVICES INSTALLÉS:
==================
✅ Docker: $(docker --version 2>/dev/null || echo "Non installé")
✅ Docker Compose: $(docker-compose --version 2>/dev/null || echo "Non installé")
✅ PostgreSQL: Conteneur Docker
✅ Redis: Conteneur Docker
✅ Nginx: Conteneur Docker
✅ PHP-FPM: Conteneur Docker

CONFIGURATION:
==============
📁 Répertoire d'installation: $INSTALL_DIR
👤 Utilisateur système: $SERVICE_USER
🔐 Fichier de configuration: $INSTALL_DIR/.env
📝 Logs d'installation: $LOG_FILE

ACCÈS:
======
🌐 Interface web: http://$(hostname -I | awk '{print $1}')
🌐 Interface web (local): http://localhost
👤 Compte administrateur: admin / admin

SERVICES SYSTEMD:
=================
🔧 Service: phishguard.service
   - Démarrage: systemctl start phishguard
   - Arrêt: systemctl stop phishguard
   - Statut: systemctl status phishguard

COMMANDES UTILES:
=================
cd $INSTALL_DIR
sudo -u $SERVICE_USER docker-compose logs -f    # Voir les logs
sudo -u $SERVICE_USER docker-compose ps         # Statut des conteneurs
sudo -u $SERVICE_USER docker-compose restart    # Redémarrage
sudo -u $SERVICE_USER docker-compose down       # Arrêt complet
sudo -u $SERVICE_USER docker-compose up -d      # Démarrage

SÉCURITÉ:
=========
🔥 Firewall: Configuré (ports 80, 443, 22)
🛡️  Fail2Ban: Configuré
🔐 Certificats SSL: À configurer manuellement

PROCHAINES ÉTAPES:
==================
1. Changez le mot de passe administrateur
2. Configurez le serveur SMTP
3. Configurez SSL/TLS pour HTTPS
4. Importez vos employés
5. Créez votre première campagne de test

SUPPORT:
========
📧 Email: reaper@etik.com
🐛 Issues: https://github.com/Reaper-Official/cyber-prevention-tool/issues
📖 Documentation: Consultez le README.md

EOF

    chown "$SERVICE_USER:$SERVICE_USER" "$REPORT_FILE"
    print_status "Rapport d'installation créé: $REPORT_FILE"
}

# Affichage final
show_final_info() {
    clear
    print_banner
    
    echo -e "${GREEN}🎉 INSTALLATION TERMINÉE AVEC SUCCÈS! 🎉${NC}"
    echo ""
    echo -e "${BLUE}📋 INFORMATIONS DE CONNEXION:${NC}"
    echo -e "   🌐 URL: ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
    echo -e "   🌐 URL locale: ${CYAN}http://localhost${NC}"
    echo -e "   👤 Utilisateur: ${YELLOW}admin${NC}"
    echo -e "   🔑 Mot de passe: ${YELLOW}admin${NC}"
    echo ""
    echo -e "${BLUE}📁 RÉPERTOIRES IMPORTANTS:${NC}"
    echo -e "   📂 Installation: ${CYAN}$INSTALL_DIR${NC}"
    echo -e "   📄 Configuration: ${CYAN}$INSTALL_DIR/.env${NC}"
    echo -e "   📊 Logs: ${CYAN}$INSTALL_DIR/storage/logs${NC}"
    echo -e "   📈 Rapport: ${CYAN}$INSTALL_DIR/installation_report.txt${NC}"
    echo ""
    echo -e "${BLUE}🔧 COMMANDES UTILES:${NC}"
    echo -e "   🔍 Statut: ${CYAN}systemctl status phishguard${NC}"
    echo -e "   📋 Logs: ${CYAN}cd $INSTALL_DIR && sudo -u $SERVICE_USER docker-compose logs -f${NC}"
    echo -e "   🔄 Redémarrage: ${CYAN}systemctl restart phishguard${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  SÉCURITÉ IMPORTANTE:${NC}"
    echo -e "   🔐 Changez immédiatement le mot de passe admin"
    echo -e "   🌐 Configurez HTTPS pour la production"
    echo -e "   📧 Configurez votre serveur SMTP"
    echo ""
    echo -e "${GREEN}✨ PhishGuard BASIC est maintenant opérationnel! ✨${NC}"
    echo ""
}

# Fonction principale
main() {
    print_banner
    
    # Confirmation de l'installation
    echo -e "${YELLOW}⚠️  Cette installation va:${NC}"
    echo "   • Installer Docker et Docker Compose"
    echo "   • Télécharger PhishGuard BASIC depuis GitHub"
    echo "   • Créer un utilisateur système"
    echo "   • Configurer les services et la sécurité"
    echo "   • Démarrer tous les services automatiquement"
    echo ""
    read -p "Continuer l'installation ? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation annulée."
        exit 0
    fi
    
    # Début du log
    log "Début de l'installation PhishGuard BASIC"
    
    # Étapes d'installation
    detect_os
    check_privileges
    install_system_dependencies
    install_docker
    install_docker_compose
    create_system_user
    install_project
    setup_permissions
    setup_environment
    setup_firewall
    setup_fail2ban
    start_services
    create_systemd_service
    run_tests
    create_install_report
    
    # Finalisation
    log "Installation terminée avec succès"
    show_final_info
}

# Gestion des erreurs
trap 'print_error "Installation interrompue"; exit 1' INT TERM

# Vérification des arguments
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
