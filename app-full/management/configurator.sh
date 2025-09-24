#!/bin/bash
# configurator.sh - Configurateur interactif PhishGuard BASIC
# ===========================================================

set -e

CONFIG_FILE="/opt/phishguard-basic/.env"
BACKUP_FILE="/opt/phishguard-basic/.env.backup"
INSTALL_DIR="/opt/phishguard-basic"

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
KEY="🔑"
MAIL="📧"
GLOBE="🌐"
SHIELD="🛡️"

print_banner() {
    clear
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║                    PHISHGUARD BASIC CONFIGURATOR                         ║"
    echo "║                     Configuration Interactive v1.0                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${CYAN}${GEAR} Configurateur interactif pour PhishGuard BASIC${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${WHITE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}${1}${NC}"
    echo -e "${WHITE}═══════════════════════════════════════${NC}"
    echo ""
}

print_status() { echo -e "${GREEN}${CHECK} $1${NC}"; }
print_error() { echo -e "${RED}${CROSS} $1${NC}"; }
print_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
print_info() { echo -e "${BLUE}${INFO} $1${NC}"; }

# Validation des entrées
validate_email() {
    local email="$1"
    if [[ "$email" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_url() {
    local url="$1"
    if [[ "$url" =~ ^https?://[A-Za-z0-9.-]+(:[0-9]+)?(/.*)?$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_port() {
    local port="$1"
    if [[ "$port" =~ ^[0-9]+$ ]] && [ "$port" -ge 1 ] && [ "$port" -le 65535 ]; then
        return 0
    else
        return 1
    fi
}

# Lecture sécurisée des mots de passe
read_password() {
    local prompt="$1"
    local password
    echo -n "$prompt"
    read -s password
    echo ""
    echo "$password"
}

# Sauvegarde de la configuration
backup_config() {
    if [ -f "$CONFIG_FILE" ]; then
        cp "$CONFIG_FILE" "$BACKUP_FILE.$(date +%Y%m%d_%H%M%S)"
        print_info "Sauvegarde de la configuration créée"
    fi
}

# Lecture de la configuration existante
load_current_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        print_info "Configuration existante chargée"
    else
        print_warning "Aucune configuration existante trouvée"
        return 1
    fi
}

# Configuration de l'application
configure_app() {
    print_section "${ROCKET} CONFIGURATION DE L'APPLICATION"
    
    echo -e "${BLUE}Nom de l'application:${NC}"
    read -p "$(echo -e ${CYAN}Nom [${APP_NAME:-PhishGuard BASIC}]: ${NC})" app_name
    APP_NAME="${app_name:-${APP_NAME:-PhishGuard BASIC}}"
    
    echo ""
    echo -e "${BLUE}URL de base de l'application:${NC}"
    while true; do
        read -p "$(echo -e ${CYAN}URL [${APP_URL:-http://localhost}]: ${NC})" app_url
        app_url="${app_url:-${APP_URL:-http://localhost}}"
        
        if validate_url "$app_url"; then
            APP_URL="$app_url"
            break
        else
            print_error "URL invalide. Format attendu: http://example.com ou https://example.com"
        fi
    done
    
    echo ""
    echo -e "${BLUE}Environnement:${NC}"
    echo "1) Production (recommandé)"
    echo "2) Développement"
    read -p "$(echo -e ${CYAN}Choix [1]: ${NC})" env_choice
    
    case "${env_choice:-1}" in
        1)
            APP_ENV="production"
            APP_DEBUG="false"
            ;;
        2)
            APP_ENV="development"
            APP_DEBUG="true"
            print_warning "Mode développement - Ne pas utiliser en production!"
            ;;
        *)
            APP_ENV="production"
            APP_DEBUG="false"
            ;;
    esac
    
    print_status "Configuration de l'application terminée"
}

# Configuration de la base de données
configure_database() {
    print_section "${SHIELD} CONFIGURATION BASE DE DONNÉES"
    
    echo -e "${BLUE}Configuration PostgreSQL:${NC}"
    
    read -p "$(echo -e ${CYAN}Host [${DB_HOST:-db}]: ${NC})" db_host
    DB_HOST="${db_host:-${DB_HOST:-db}}"
    
    while true; do
        read -p "$(echo -e ${CYAN}Port [${DB_PORT:-5432}]: ${NC})" db_port
        db_port="${db_port:-${DB_PORT:-5432}}"
        
        if validate_port "$db_port"; then
            DB_PORT="$db_port"
            break
        else
            print_error "Port invalide (1-65535)"
        fi
    done
    
    read -p "$(echo -e ${CYAN}Nom de la base [${DB_NAME:-phishguard_basic}]: ${NC})" db_name
    DB_NAME="${db_name:-${DB_NAME:-phishguard_basic}}"
    
    read -p "$(echo -e ${CYAN}Utilisateur [${DB_USER:-phishguard}]: ${NC})" db_user
    DB_USER="${db_user:-${DB_USER:-phishguard}}"
    
    if [ -z "$DB_PASSWORD" ]; then
        echo ""
        echo -e "${YELLOW}Génération d'un mot de passe sécurisé...${NC}"
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        print_info "Mot de passe généré automatiquement"
    else
        read -p "$(echo -e ${CYAN}Changer le mot de passe DB? (y/N): ${NC})" change_db_pass
        if [[ "$change_db_pass" =~ ^[Yy]$ ]]; then
            DB_PASSWORD=$(read_password "$(echo -e ${CYAN}Nouveau mot de passe DB: ${NC})")
        fi
    fi
    
    print_status "Configuration base de données terminée"
}

# Configuration SMTP
configure_smtp() {
    print_section "${MAIL} CONFIGURATION SMTP"
    
    echo -e "${BLUE}Configuration du serveur email:${NC}"
    
    read -p "$(echo -e ${CYAN}Serveur SMTP [${SMTP_HOST:-localhost}]: ${NC})" smtp_host
    SMTP_HOST="${smtp_host:-${SMTP_HOST:-localhost}}"
    
    while true; do
        read -p "$(echo -e ${CYAN}Port SMTP [${SMTP_PORT:-587}]: ${NC})" smtp_port
        smtp_port="${smtp_port:-${SMTP_PORT:-587}}"
        
        if validate_port "$smtp_port"; then
            SMTP_PORT="$smtp_port"
            break
        else
            print_error "Port invalide"
        fi
    done
    
    while true; do
        read -p "$(echo -e ${CYAN}Email expéditeur [${SMTP_USER}]: ${NC})" smtp_user
        smtp_user="${smtp_user:-$SMTP_USER}"
        
        if [ -n "$smtp_user" ] && validate_email "$smtp_user"; then
            SMTP_USER="$smtp_user"
            break
        elif [ -z "$smtp_user" ]; then
            print_warning "Email expéditeur laissé vide (configuration locale)"
            SMTP_USER=""
            break
        else
            print_error "Email invalide"
        fi
    done
    
    if [ -n "$SMTP_USER" ]; then
        SMTP_PASS=$(read_password "$(echo -e ${CYAN}Mot de passe SMTP: ${NC})")
        
        echo ""
        echo -e "${BLUE}Chiffrement SMTP:${NC}"
        echo "1) TLS (recommandé - port 587)"
        echo "2) SSL (port 465)"
        echo "3) Aucun (non recommandé)"
        read -p "$(echo -e ${CYAN}Choix [1]: ${NC})" encryption_choice
        
        case "${encryption_choice:-1}" in
            1) SMTP_ENCRYPTION="tls" ;;
            2) SMTP_ENCRYPTION="ssl" ;;
            3) 
                SMTP_ENCRYPTION=""
                print_warning "Connexion non chiffrée sélectionnée"
                ;;
            *) SMTP_ENCRYPTION="tls" ;;
        esac
        
        SMTP_FROM_NAME="${APP_NAME}"
    fi
    
    print_status "Configuration SMTP terminée"
}

# Configuration de sécurité
configure_security() {
    print_section "${KEY} CONFIGURATION SÉCURITÉ"
    
    echo -e "${BLUE}Génération des clés de sécurité...${NC}"
    
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -hex 32)
        print_info "Clé JWT générée"
    else
        read -p "$(echo -e ${CYAN}Régénérer la clé JWT? (y/N): ${NC})" regen_jwt
        if [[ "$regen_jwt" =~ ^[Yy]$ ]]; then
            JWT_SECRET=$(openssl rand -hex 32)
            print_info "Nouvelle clé JWT générée"
        fi
    fi
    
    if [ -z "$ENCRYPTION_KEY" ]; then
        ENCRYPTION_KEY=$(openssl rand -hex 32)
        print_info "Clé de chiffrement générée"
    else
        read -p "$(echo -e ${CYAN}Régénérer la clé de chiffrement? (y/N): ${NC})" regen_enc
        if [[ "$regen_enc" =~ ^[Yy]$ ]]; then
            ENCRYPTION_KEY=$(openssl rand -hex 32)
            print_info "Nouvelle clé de chiffrement générée"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}Paramètres de session:${NC}"
    read -p "$(echo -e ${CYAN}Durée de session en minutes [${SESSION_LIFETIME:-1440}]: ${NC})" session_lifetime
    SESSION_LIFETIME="${session_lifetime:-${SESSION_LIFETIME:-1440}}"
    
    print_status "Configuration sécurité terminée"
}

# Configuration IA
configure_ai() {
    print_section "${GLOBE} CONFIGURATION INTELLIGENCE ARTIFICIELLE"
    
    echo -e "${BLUE}Configuration Gemini AI:${NC}"
    echo -e "${INFO} Pour obtenir une clé API Gemini:"
    echo "   1. Visitez: https://makersuite.google.com/app/apikey"
    echo "   2. Créez une nouvelle clé API"
    echo "   3. Copiez la clé ici"
    echo ""
    
    read -p "$(echo -e ${CYAN}Clé API Gemini [${GEMINI_API_KEY:0:10}...]: ${NC})" gemini_key
    if [ -n "$gemini_key" ]; then
        GEMINI_API_KEY="$gemini_key"
        print_status "Clé API Gemini configurée"
    elif [ -z "$GEMINI_API_KEY" ]; then
        print_warning "Aucune clé API - Fonctionnalités IA désactivées"
        GEMINI_API_KEY=""
    fi
    
    read -p "$(echo -e ${CYAN}Modèle IA [${AI_MODEL:-gemini-pro}]: ${NC})" ai_model
    AI_MODEL="${ai_model:-${AI_MODEL:-gemini-pro}}"
    
    print_info "Configuration IA terminée"
}

# Configuration avancée
configure_advanced() {
    print_section "${GEAR} CONFIGURATION AVANCÉE"
    
    echo -e "${BLUE}Paramètres de performance:${NC}"
    
    read -p "$(echo -e ${CYAN}Limite d'emails par heure [${EMAIL_RATE_LIMIT:-50}]: ${NC})" email_limit
    EMAIL_RATE_LIMIT="${email_limit:-${EMAIL_RATE_LIMIT:-50}}"
    
    read -p "$(echo -e ${CYAN}Taille max upload (Mo) [${MAX_UPLOAD_SIZE:-10}]: ${NC})" upload_size
    upload_size="${upload_size:-${MAX_UPLOAD_SIZE:-10}}"
    MAX_UPLOAD_SIZE=$((upload_size * 1048576)) # Conversion en octets
    
    echo ""
    echo -e "${BLUE}Conformité RGPD:${NC}"
    read -p "$(echo -e ${CYAN}Activer RGPD? [${GDPR_ENABLED:-true}] (y/N): ${NC})" gdpr_enabled
    if [[ "$gdpr_enabled" =~ ^[Nn]$ ]]; then
        GDPR_ENABLED="false"
    else
        GDPR_ENABLED="true"
    fi
    
    if [ "$GDPR_ENABLED" = "true" ]; then
        read -p "$(echo -e ${CYAN}Rétention des données (jours) [${DATA_RETENTION_DAYS:-365}]: ${NC})" retention_days
        DATA_RETENTION_DAYS="${retention_days:-${DATA_RETENTION_DAYS:-365}}"
    fi
    
    print_status "Configuration avancée terminée"
}

# Sauvegarde de la configuration
save_config() {
    print_section "${SHIELD} SAUVEGARDE DE LA CONFIGURATION"
    
    # Création du répertoire si nécessaire
    mkdir -p "$(dirname "$CONFIG_FILE")"
    
    cat > "$CONFIG_FILE" << EOF
# PhishGuard BASIC - Configuration
# Généré le $(date)
# ================================

# Application
APP_NAME="$APP_NAME"
APP_ENV=$APP_ENV
APP_DEBUG=$APP_DEBUG
APP_URL=$APP_URL
APP_TIMEZONE=Europe/Paris

# Base de données PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Cache Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Configuration SMTP
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_ENCRYPTION=$SMTP_ENCRYPTION
SMTP_FROM_NAME="$SMTP_FROM_NAME"

# Intelligence Artificielle
GEMINI_API_KEY=$GEMINI_API_KEY
AI_MODEL=$AI_MODEL
AI_MAX_TOKENS=2048

# Sécurité
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
SESSION_LIFETIME=$SESSION_LIFETIME
BCRYPT_ROUNDS=12

# Performance
EMAIL_RATE_LIMIT=$EMAIL_RATE_LIMIT
MAX_UPLOAD_SIZE=$MAX_UPLOAD_SIZE

# Conformité RGPD
GDPR_ENABLED=$GDPR_ENABLED
DATA_RETENTION_DAYS=$DATA_RETENTION_DAYS
ANONYMIZE_LOGS=true
AUDIT_LOG_ENABLED=true

# Monitoring
LOG_LEVEL=info
LOG_FILE=/var/log/phishguard/app.log
EOF

    # Permissions sécurisées
    chmod 600 "$CONFIG_FILE"
    chown phishguard:phishguard "$CONFIG_FILE" 2>/dev/null || true
    
    print_status "Configuration sauvegardée: $CONFIG_FILE"
}

# Test de la configuration
test_config() {
    print_section "${GEAR} TEST DE LA CONFIGURATION"
    
    if [ ! -d "$INSTALL_DIR" ]; then
        print_error "PhishGuard BASIC n'est pas installé dans $INSTALL_DIR"
        return 1
    fi
    
    cd "$INSTALL_DIR"
    
    # Test de connectivité base de données
    print_info "Test de connexion à la base de données..."
    if docker-compose exec -T app php -r "
        try { 
            \$pdo = new PDO('pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME', '$DB_USER', '$DB_PASSWORD'); 
            echo 'OK'; 
        } catch(Exception \$e) { 
            echo 'FAIL: ' . \$e->getMessage(); 
            exit(1); 
        }
    " 2>/dev/null | grep -q "OK"; then
        print_status "Base de données: OK"
    else
        print_error "Base de données: Connexion échouée"
    fi
    
    # Test SMTP (si configuré)
    if [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASS" ]; then
        print_info "Test SMTP (simulation)..."
        # Ici on pourrait ajouter un test SMTP réel
        print_status "SMTP: Configuré"
    fi
    
    # Test API Gemini (si configuré)
    if [ -n "$GEMINI_API_KEY" ]; then
        print_info "Test API Gemini..."
        # Test basique de l'API
        if curl -s -o /dev/null -w "%{http_code}" \
           -H "Content-Type: application/json" \
           -H "x-goog-api-key: $GEMINI_API_KEY" \
           "https://generativelanguage.googleapis.com/v1beta/models" | grep -q "200"; then
            print_status "API Gemini: OK"
        else
            print_warning "API Gemini: Clé invalide ou service indisponible"
        fi
    fi
}

# Redémarrage des services
restart_services() {
    print_section "${ROCKET} REDÉMARRAGE DES SERVICES"
    
    if [ -d "$INSTALL_DIR" ]; then
        cd "$INSTALL_DIR"
        
        print_info "Redémarrage des conteneurs..."
        docker-compose down
        sleep 5
        docker-compose up -d
        
        print_info "Attente de l'initialisation..."
        sleep 15
        
        # Vérification des services
        services=("phishguard_db" "phishguard_redis" "phishguard_app" "phishguard_nginx")
        all_running=true
        
        for service in "${services[@]}"; do
            if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
                print_status "Service $service: Démarré"
            else
                print_error "Service $service: Problème"
                all_running=false
            fi
        done
        
        if [ "$all_running" = true ]; then
            print_status "Tous les services sont opérationnels"
        else
            print_warning "Certains services ont des problèmes - Vérifiez les logs"
        fi
    else
        print_error "Répertoire d'installation non trouvé: $INSTALL_DIR"
    fi
}

# Menu principal
show_menu() {
    echo ""
    echo -e "${WHITE}╔══════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║            MENU PRINCIPAL            ║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN} 1) ${NC}Configuration de l'application"
    echo -e "${CYAN} 2) ${NC}Configuration base de données"
    echo -e "${CYAN} 3) ${NC}Configuration SMTP"
    echo -e "${CYAN} 4) ${NC}Configuration sécurité"
    echo -e "${CYAN} 5) ${NC}Configuration IA (Gemini)"
    echo -e "${CYAN} 6) ${NC}Configuration avancée"
    echo -e "${CYAN} 7) ${NC}Sauvegarder la configuration"
    echo -e "${CYAN} 8) ${NC}Tester la configuration"
    echo -e "${CYAN} 9) ${NC}Redémarrer les services"
    echo -e "${CYAN}10) ${NC}Configuration complète (tout)"
    echo -e "${CYAN} 0) ${NC}Quitter"
    echo ""
}

# Configuration complète
full_configuration() {
    print_info "Démarrage de la configuration complète..."
    
    backup_config
    configure_app
    configure_database
    configure_smtp
    configure_security
    configure_ai
    configure_advanced
    save_config
    
    echo ""
    read -p "$(echo -e ${CYAN}Tester la configuration maintenant? (Y/n): ${NC})" test_now
    if [[ ! "$test_now" =~ ^[Nn]$ ]]; then
        test_config
    fi
    
    echo ""
    read -p "$(echo -e ${CYAN}Redémarrer les services maintenant? (Y/n): ${NC})" restart_now
    if [[ ! "$restart_now" =~ ^[Nn]$ ]]; then
        restart_services
    fi
    
    print_status "Configuration complète terminée!"
}

# Fonction principale
main() {
    # Vérification des privilèges
    if [[ $EUID -ne 0 ]]; then
        print_error "Ce script doit être exécuté avec sudo"
        echo "Utilisation: sudo bash configurator.sh"
        exit 1
    fi
    
    print_banner
    
    # Chargement de la configuration existante
    load_current_config
    
    # Boucle du menu principal
    while true; do
        show_menu
        read -p "$(echo -e ${CYAN}Votre choix: ${NC})" choice
        
        case $choice in
            1) configure_app ;;
            2) configure_database ;;
            3) configure_smtp ;;
            4) configure_security ;;
            5) configure_ai ;;
            6) configure_advanced ;;
            7) save_config ;;
            8) test_config ;;
            9) restart_services ;;
            10) full_configuration ;;
            0) 
                echo -e "${GREEN}Au revoir! ${ROCKET}${NC}"
                exit 0 
                ;;
            *) 
                print_error "Choix invalide. Veuillez choisir entre 0 et 10."
                sleep 2
                ;;
        esac
        
        echo ""
        read -p "$(echo -e ${BLUE}Appuyez sur Entrée pour continuer...${NC})"
    done
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
