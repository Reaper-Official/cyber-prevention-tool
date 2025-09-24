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
        # Charger les variables sans exécuter de commandes
        set -a
        source <(grep -v '^#' "$CONFIG_FILE" | grep '=' | sed 's/^/export /')
        set +a
        print_info "Configuration existante chargée"
        return 0
    else
        print_warning "Aucune configuration existante trouvée"
        return 1
    fi
}

# Configuration de l'application
configure_app() {
    print_section "${ROCKET} CONFIGURATION DE L'APPLICATION"
    
    echo -e "${BLUE}Configuration générale de l'application:${NC}"
    echo ""
    
    echo -e "${CYAN}Nom de l'application:${NC}"
    read -p "$(echo -e ${WHITE}Nom [${APP_NAME:-PhishGuard BASIC}]: ${NC})" app_name
    APP_NAME="${app_name:-${APP_NAME:-PhishGuard BASIC}}"
    
    echo ""
    echo -e "${CYAN}URL de base de l'application:${NC}"
    echo -e "${YELLOW}${INFO} Cette URL sera utilisée dans les emails de phishing${NC}"
    
    # Détecter automatiquement l'IP
    local auto_ip=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}' || echo "localhost")
    
    while true; do
        read -p "$(echo -e ${WHITE}URL [${APP_URL:-http://$auto_ip}]: ${NC})" app_url
        app_url="${app_url:-${APP_URL:-http://$auto_ip}}"
        
        if validate_url "$app_url"; then
            APP_URL="$app_url"
            break
        else
            print_error "URL invalide. Format attendu: http://example.com ou https://example.com"
            echo -e "${YELLOW}Exemples valides:${NC}"
            echo "  - http://$auto_ip"
            echo "  - https://phishguard.votre-entreprise.com"
            echo "  - http://192.168.1.100"
        fi
    done
    
    echo ""
    echo -e "${CYAN}Environnement d'exécution:${NC}"
    echo "1) Production (recommandé - logs minimaux, optimisations)"
    echo "2) Développement (debug activé, logs détaillés)"
    read -p "$(echo -e ${WHITE}Choix [${APP_ENV:-1}]: ${NC})" env_choice
    
    case "${env_choice:-1}" in
        1|production)
            APP_ENV="production"
            APP_DEBUG="false"
            ;;
        2|development)
            APP_ENV="development"
            APP_DEBUG="true"
            print_warning "Mode développement - Ne pas utiliser en production!"
            ;;
        *)
            APP_ENV="production"
            APP_DEBUG="false"
            ;;
    esac
    
    echo ""
    echo -e "${CYAN}Fuseau horaire:${NC}"
    read -p "$(echo -e ${WHITE}Fuseau [${APP_TIMEZONE:-Europe/Paris}]: ${NC})" timezone
    APP_TIMEZONE="${timezone:-${APP_TIMEZONE:-Europe/Paris}}"
    
    print_status "Configuration de l'application terminée"
    
    # Résumé
    echo ""
    echo -e "${BLUE}${INFO} Résumé de la configuration:${NC}"
    echo "  Nom: $APP_NAME"
    echo "  URL: $APP_URL" 
    echo "  Environnement: $APP_ENV"
    echo "  Fuseau: $APP_TIMEZONE"
}

# Configuration de la base de données
configure_database() {
    print_section "${SHIELD} CONFIGURATION BASE DE DONNÉES"
    
    echo -e "${BLUE}Configuration PostgreSQL:${NC}"
    echo -e "${YELLOW}${INFO} La base de données fonctionne dans un conteneur Docker${NC}"
    echo ""
    
    read -p "$(echo -e ${WHITE}Host [${DB_HOST:-db}]: ${NC})" db_host
    DB_HOST="${db_host:-${DB_HOST:-db}}"
    
    while true; do
        read -p "$(echo -e ${WHITE}Port [${DB_PORT:-5432}]: ${NC})" db_port
        db_port="${db_port:-${DB_PORT:-5432}}"
        
        if validate_port "$db_port"; then
            DB_PORT="$db_port"
            break
        else
            print_error "Port invalide (1-65535)"
        fi
    done
    
    read -p "$(echo -e ${WHITE}Nom de la base [${DB_NAME:-phishguard_basic}]: ${NC})" db_name
    DB_NAME="${db_name:-${DB_NAME:-phishguard_basic}}"
    
    read -p "$(echo -e ${WHITE}Utilisateur [${DB_USER:-phishguard}]: ${NC})" db_user
    DB_USER="${db_user:-${DB_USER:-phishguard}}"
    
    echo ""
    echo -e "${CYAN}Mot de passe de la base de données:${NC}"
    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${YELLOW}Génération d'un mot de passe sécurisé...${NC}"
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        print_info "Mot de passe généré automatiquement"
    else
        echo -e "${GREEN}${INFO} Mot de passe existant détecté${NC}"
        read -p "$(echo -e ${WHITE}Changer le mot de passe DB? (y/N): ${NC})" change_db_pass
        if [[ "$change_db_pass" =~ ^[Yy]$ ]]; then
            echo "1) Générer automatiquement un nouveau mot de passe"
            echo "2) Saisir manuellement un mot de passe"
            read -p "$(echo -e ${WHITE}Choix [1]: ${NC})" pwd_choice
            
            case "${pwd_choice:-1}" in
                1)
                    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
                    print_info "Nouveau mot de passe généré automatiquement"
                    ;;
                2)
                    DB_PASSWORD=$(read_password "$(echo -e ${WHITE}Nouveau mot de passe DB: ${NC})")
                    ;;
            esac
        fi
    fi
    
    print_status "Configuration base de données terminée"
    
    # Test de connexion (si les services sont démarrés)
    if [ -d "$INSTALL_DIR" ] && command -v docker-compose &> /dev/null; then
        echo ""
        read -p "$(echo -e ${CYAN}Tester la connexion à la base de données? (Y/n): ${NC})" test_db
        if [[ ! "$test_db" =~ ^[Nn]$ ]]; then
            echo -e "${YELLOW}Test de connexion...${NC}"
            cd "$INSTALL_DIR"
            if sudo -u phishguard docker-compose exec -T db pg_isready -U "$DB_USER" -d "$DB_NAME" 2>/dev/null; then
                print_status "Connexion à la base de données: OK"
            else
                print_warning "Impossible de tester la connexion (services peut-être arrêtés)"
            fi
        fi
    fi
}

# Configuration SMTP
configure_smtp() {
    print_section "${MAIL} CONFIGURATION SMTP"
    
    echo -e "${BLUE}Configuration du serveur email:${NC}"
    echo -e "${YELLOW}${INFO} Nécessaire pour l'envoi des emails de phishing${NC}"
    echo ""
    
    echo -e "${CYAN}Voulez-vous configurer l'envoi d'emails?${NC}"
    echo "1) Oui, configurer un serveur SMTP"
    echo "2) Non, utiliser le mode simulation (développement)"
    read -p "$(echo -e ${WHITE}Choix [${SMTP_USER:+1}${SMTP_USER:-2}]: ${NC})" smtp_choice
    
    case "${smtp_choice:-2}" in
        1)
            echo ""
            echo -e "${CYAN}Serveur SMTP:${NC}"
            read -p "$(echo -e ${WHITE}Host SMTP [${SMTP_HOST:-smtp.gmail.com}]: ${NC})" smtp_host
            SMTP_HOST="${smtp_host:-${SMTP_HOST:-smtp.gmail.com}}"
            
            while true; do
                read -p "$(echo -e ${WHITE}Port SMTP [${SMTP_PORT:-587}]: ${NC})" smtp_port
                smtp_port="${smtp_port:-${SMTP_PORT:-587}}"
                
                if validate_port "$smtp_port"; then
                    SMTP_PORT="$smtp_port"
                    break
                else
                    print_error "Port invalide"
                fi
            done
            
            echo ""
            echo -e "${CYAN}Chiffrement SMTP:${NC}"
            echo "1) TLS (port 587 - recommandé)"
            echo "2) SSL (port 465)"  
            echo "3) Aucun (port 25 - non recommandé)"
            read -p "$(echo -e ${WHITE}Choix [${SMTP_ENCRYPTION:-1}]: ${NC})" encryption_choice
            
            case "${encryption_choice:-1}" in
                1|tls) SMTP_ENCRYPTION="tls" ;;
                2|ssl) SMTP_ENCRYPTION="ssl" ;;
                3|none) 
                    SMTP_ENCRYPTION=""
                    print_warning "Connexion non chiffrée sélectionnée"
                    ;;
                *) SMTP_ENCRYPTION="tls" ;;
            esac
            
            echo ""
            while true; do
                read -p "$(echo -e ${WHITE}Email expéditeur [${SMTP_USER}]: ${NC})" smtp_user
                smtp_user="${smtp_user:-$SMTP_USER}"
                
                if [ -n "$smtp_user" ] && validate_email "$smtp_user"; then
                    SMTP_USER="$smtp_user"
                    break
                elif [ -z "$smtp_user" ]; then
                    print_error "Email expéditeur requis pour l'envoi SMTP"
                else
                    print_error "Email invalide"
                fi
            done
            
            SMTP_PASS=$(read_password "$(echo -e ${WHITE}Mot de passe SMTP: ${NC})")
            SMTP_FROM_NAME="${APP_NAME}"
            
            echo ""
            echo -e "${GREEN}${INFO} Configuration SMTP:${NC}"
            echo "  Serveur: $SMTP_HOST:$SMTP_PORT ($SMTP_ENCRYPTION)"
            echo "  Expéditeur: $SMTP_USER"
            echo "  Nom: $SMTP_FROM_NAME"
            ;;
        2|*)
            SMTP_HOST="localhost"
            SMTP_PORT="25"
            SMTP_USER=""
            SMTP_PASS=""
            SMTP_ENCRYPTION=""
            SMTP_FROM_NAME="PhishGuard Simulation"
            
            print_info "Mode simulation activé - les emails ne seront pas vraiment envoyés"
            ;;
    esac
    
    print_status "Configuration SMTP terminée"
}

# Configuration de sécurité
configure_security() {
    print_section "${KEY} CONFIGURATION SÉCURITÉ"
    
    echo -e "${BLUE}Génération et gestion des clés de sécurité:${NC}"
    echo ""
    
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -hex 32)
        print_info "Clé JWT générée automatiquement"
    else
        echo -e "${GREEN}${INFO} Clé JWT existante détectée${NC}"
        read -p "$(echo -e ${WHITE}Régénérer la clé JWT? (y/N): ${NC})" regen_jwt
        if [[ "$regen_jwt" =~ ^[Yy]$ ]]; then
            JWT_SECRET=$(openssl rand -hex 32)
            print_info "Nouvelle clé JWT générée"
            print_warning "Les sessions utilisateur existantes seront invalidées"
        fi
    fi
    
    if [ -z "$ENCRYPTION_KEY" ]; then
        ENCRYPTION_KEY=$(openssl rand -hex 32)
        print_info "Clé de chiffrement générée automatiquement"
    else
        echo -e "${GREEN}${INFO} Clé de chiffrement existante détectée${NC}"
        read -p "$(echo -e ${WHITE}Régénérer la clé de chiffrement? (y/N): ${NC})" regen_enc
        if [[ "$regen_enc" =~ ^[Yy]$ ]]; then
            ENCRYPTION_KEY=$(openssl rand -hex 32)
            print_info "Nouvelle clé de chiffrement générée"
            print_warning "Les données chiffrées existantes ne pourront plus être déchiffrées"
        fi
    fi
    
    echo ""
    echo -e "${CYAN}Paramètres de session:${NC}"
    read -p "$(echo -e ${WHITE}Durée de session (minutes) [${SESSION_LIFETIME:-1440}]: ${NC})" session_lifetime
    SESSION_LIFETIME="${session_lifetime:-${SESSION_LIFETIME:-1440}}"
    
    echo ""
    echo -e "${CYAN}Sécurité des mots de passe:${NC}"
    echo -e "${YELLOW}${INFO} Plus le nombre de rounds est élevé, plus le hachage est sécurisé mais lent${NC}"
    read -p "$(echo -e ${WHITE}Rounds de hachage bcrypt [${BCRYPT_ROUNDS:-12}]: ${NC})" bcrypt_rounds
    BCRYPT_ROUNDS="${bcrypt_rounds:-${BCRYPT_ROUNDS:-12}}"
    
    print_status "Configuration sécurité terminée"
    
    # Afficher les informations de sécurité
    echo ""
    echo -e "${BLUE}${INFO} Résumé sécurité:${NC}"
    echo "  Durée de session: $SESSION_LIFETIME minutes"
    echo "  Rounds bcrypt: $BCRYPT_ROUNDS"
    echo "  Clé JWT: ${JWT_SECRET:0:8}..."
    echo "  Clé chiffrement: ${ENCRYPTION_KEY:0:8}..."
}

# Configuration IA
configure_ai() {
    print_section "${GLOBE} CONFIGURATION INTELLIGENCE ARTIFICIELLE"
    
    echo -e "${BLUE}Configuration Gemini AI (Google):${NC}"
    echo -e "${YELLOW}${INFO} L'IA est optionnelle et utilisée pour améliorer les templates d'emails${NC}"
    echo ""
    
    echo -e "${CYAN}Voulez-vous activer l'IA Gemini?${NC}"
    echo "1) Oui, configurer Gemini AI"
    echo "2) Non, désactiver les fonctionnalités IA"
    read -p "$(echo -e ${WHITE}Choix [${GEMINI_API_KEY:+1}${GEMINI_API_KEY:-2}]: ${NC})" ai_choice
    
    case "${ai_choice:-2}" in
        1)
            echo ""
            echo -e "${BLUE}${INFO} Pour obtenir une clé API Gemini:${NC}"
            echo "   1. Visitez: https://makersuite.google.com/app/apikey"
            echo "   2. Connectez-vous avec votre compte Google"
            echo "   3. Créez une nouvelle clé API"
            echo "   4. Copiez la clé ici"
            echo ""
            
            read -p "$(echo -e ${WHITE}Clé API Gemini [${GEMINI_API_KEY:0:20}...]: ${NC})" gemini_key
            if [ -n "$gemini_key" ]; then
                GEMINI_API_KEY="$gemini_key"
                print_status "Clé API Gemini configurée"
                
                # Test de la clé API
                echo ""
                read -p "$(echo -e ${CYAN}Tester la clé API maintenant? (Y/n): ${NC})" test_api
                if [[ ! "$test_api" =~ ^[Nn]$ ]]; then
                    echo -e "${YELLOW}Test de l'API Gemini...${NC}"
                    if curl -s -o /dev/null -w "%{http_code}" \
                       -H "Content-Type: application/json" \
                       -H "x-goog-api-key: $GEMINI_API_KEY" \
                       "https://generativelanguage.googleapis.com/v1beta/models" | grep -q "200"; then
                        print_status "API Gemini: Clé valide"
                    else
                        print_warning "API Gemini: Clé invalide ou service indisponible"
                        read -p "$(echo -e ${YELLOW}Continuer malgré l'erreur? (y/N): ${NC})" continue_anyway
                        if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
                            GEMINI_API_KEY=""
                        fi
                    fi
                fi
            elif [ -z "$GEMINI_API_KEY" ]; then
                print_info "API Gemini désactivée"
                GEMINI_API_KEY=""
            fi
            
            if [ -n "$GEMINI_API_KEY" ]; then
                echo ""
                echo -e "${CYAN}Modèle d'IA à utiliser:${NC}"
                echo "1) gemini-pro (recommandé - gratuit jusqu'à un certain quota)"
                echo "2) gemini-pro-vision (avec capacités visuelles)"
                read -p "$(echo -e ${WHITE}Choix [${AI_MODEL:-1}]: ${NC})" model_choice
                
                case "${model_choice:-1}" in
                    1|pro) AI_MODEL="gemini-pro" ;;
                    2|vision) AI_MODEL="gemini-pro-vision" ;;
                    *) AI_MODEL="gemini-pro" ;;
                esac
                
                read -p "$(echo -e ${WHITE}Nombre max de tokens [${AI_MAX_TOKENS:-2048}]: ${NC})" max_tokens
                AI_MAX_TOKENS="${max_tokens:-${AI_MAX_TOKENS:-2048}}"
            fi
            ;;
        2|*)
            GEMINI_API_KEY=""
            AI_MODEL="gemini-pro"
            AI_MAX_TOKENS="2048"
            print_info "Fonctionnalités IA désactivées"
            ;;
    esac
    
    print_status "Configuration IA terminée"
}

# Configuration avancée
configure_advanced() {
    print_section "${GEAR} CONFIGURATION AVANCÉE"
    
    echo -e "${BLUE}Paramètres de performance et limitations:${NC}"
    echo ""
    
    echo -e "${CYAN}Limitation d'envoi d'emails:${NC}"
    echo -e "${YELLOW}${INFO} Pour éviter d'être marqué comme spam${NC}"
    read -p "$(echo -e ${WHITE}Emails par heure [${EMAIL_RATE_LIMIT:-50}]: ${NC})" email_limit
    EMAIL_RATE_LIMIT="${email_limit:-${EMAIL_RATE_LIMIT:-50}}"
    
    echo ""
    echo -e "${CYAN}Taille maximum des uploads:${NC}"
    read -p "$(echo -e ${WHITE}Taille max (Mo) [${MAX_UPLOAD_SIZE:-10}]: ${NC})" upload_size
    upload_size="${upload_size:-${MAX_UPLOAD_SIZE:-10}}"
    # Conversion en octets si c'est un nombre simple
    if [[ "$upload_size" =~ ^[0-9]+$ ]]; then
        MAX_UPLOAD_SIZE=$((upload_size * 1048576))
    else
        MAX_UPLOAD_SIZE="$upload_size"
    fi
    
    echo ""
    echo -e "${CYAN}Conformité RGPD:${NC}"
    echo "1) Activer la conformité RGPD (recommandé pour l'Europe)"
    echo "2) Désactiver RGPD"
    read -p "$(echo -e ${WHITE}Choix [${GDPR_ENABLED:-1}]: ${NC})" gdpr_choice
    
    case "${gdpr_choice:-1}" in
        1|true) GDPR_ENABLED="true" ;;
        2|false) GDPR_ENABLED="false" ;;
        *) GDPR_ENABLED="true" ;;
    esac
    
    if [ "$GDPR_ENABLED" = "true" ]; then
        echo ""
        echo -e "${CYAN}Rétention des données (conformité RGPD):${NC}"
        read -p "$(echo -e ${WHITE}Durée de conservation (jours) [${DATA_RETENTION_DAYS:-365}]: ${NC})" retention_days
        DATA_RETENTION_DAYS="${retention_days:-${DATA_RETENTION_DAYS:-365}}"
        
        echo ""
        echo -e "${CYAN}Anonymisation des logs:${NC}"
        echo "1) Oui, anonymiser les adresses IP dans les logs"
        echo "2) Non, conserver les IP complètes"
        read -p "$(echo -e ${WHITE}Choix [${ANONYMIZE_LOGS:-1}]: ${NC})" anonymize_choice
        
        case "${anonymize_choice:-1}" in
            1|true) ANONYMIZE_LOGS="true" ;;
            2|false) ANONYMIZE_LOGS="false" ;;
            *) ANONYMIZE_LOGS="true" ;;
        esac
    fi
    
    echo ""
    echo -e "${CYAN}Niveau de logging:${NC}"
    echo "1) ERROR - Seulement les erreurs"
    echo "2) WARN - Erreurs et avertissements"
    echo "3) INFO - Informations générales (recommandé)"
    echo "4) DEBUG - Tout (développement seulement)"
    read -p "$(echo -e ${WHITE}Choix [${LOG_LEVEL:-3}]: ${NC})" log_choice
    
    case "${log_choice:-3}" in
        1|error) LOG_LEVEL="error" ;;
        2|warn) LOG_LEVEL="warn" ;;
        3|info) LOG_LEVEL="info" ;;
        4|debug) LOG_LEVEL="debug" ;;
        *) LOG_LEVEL="info" ;;
    esac
    
    print_status "Configuration avancée terminée"
    
    # Résumé
    echo ""
    echo -e "${BLUE}${INFO} Résumé configuration avancée:${NC}"
    echo "  Limite emails: $EMAIL_RATE_LIMIT/heure"
    echo "  Upload max: $upload_size Mo"
    echo "  RGPD: $GDPR_ENABLED"
    if [ "$GDPR_ENABLED" = "true" ]; then
        echo "  Rétention: $DATA_RETENTION_DAYS jours"
        echo "  Anonymisation: $ANONYMIZE_LOGS"
    fi
    echo "  Niveau logs: $LOG_LEVEL"
}

# Sauvegarde de la configuration
save_config() {
    print_section "${SHIELD} SAUVEGARDE DE LA CONFIGURATION"
    
    # Création du répertoire si nécessaire
    mkdir -p "$(dirname "$CONFIG_FILE")"
    
    cat > "$CONFIG_FILE" << EOF
# PhishGuard BASIC - Configuration
# Généré par le configurateur le $(date)
# ======================================

# Application
APP_NAME="$APP_NAME"
APP_ENV=$APP_ENV
APP_DEBUG=$APP_DEBUG
APP_URL=$APP_URL
APP_TIMEZONE=$APP_TIMEZONE

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
AI_MAX_TOKENS=${AI_MAX_TOKENS:-2048}

# Sécurité
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
SESSION_LIFETIME=$SESSION_LIFETIME
BCRYPT_ROUNDS=$BCRYPT_ROUNDS

# Performance et limitations
EMAIL_RATE_LIMIT=$EMAIL_RATE_LIMIT
MAX_UPLOAD_SIZE=$MAX_UPLOAD_SIZE

# Conformité RGPD
GDPR_ENABLED=$GDPR_ENABLED
DATA_RETENTION_DAYS=${DATA_RETENTION_DAYS:-365}
ANONYMIZE_LOGS=${ANONYMIZE_LOGS:-true}
AUDIT_LOG_ENABLED=true

# Monitoring et logs
LOG_LEVEL=${LOG_LEVEL:-info}
LOG_FILE=/var/log/phishguard/app.log
EOF

    # Permissions sécurisées
    chmod 600 "$CONFIG_FILE"
    if command -v chown &>/dev/null && id phishguard &>/dev/null; then
        chown phishguard:phishguard "$CONFIG_FILE" 2>/dev/null || true
    fi
    
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
    
    echo -e "${YELLOW}Tests en cours...${NC}"
    echo ""
    
    # Test de connectivité base de données
    print_info "Test de connexion à la base de données..."
    if command -v docker-compose &>/dev/null; then
        if docker-compose ps | grep -q "Up"; then
            if sudo -u phishguard docker-compose exec -T db pg_isready -U "$DB_USER" -d "$DB_NAME" 2>/dev/null; then
                print_status "Base de données: Connexion OK"
            else
                print_error "Base de données: Connexion échouée"
            fi
        else
            print_warning "Services Docker non démarrés"
        fi
    else
        print_warning "Docker Compose non disponible"
    fi
    
    # Test SMTP (si configuré)
    if [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASS" ]; then
        print_info "Test SMTP..."
        if command -v nc &>/dev/null || command -v netcat &>/dev/null; then
            if timeout 5 nc -z "$SMTP_HOST" "$SMTP_PORT" 2>/dev/null; then
                print_status "SMTP: Port $SMTP_PORT accessible sur $SMTP_HOST"
            else
                print_warning "SMTP: Impossible de joindre $SMTP_HOST:$SMTP_PORT"
            fi
        else
            print_info "SMTP: Configuré (test de connectivité non disponible)"
        fi
    else
        print_info "SMTP: Mode simulation activé"
    fi
    
    # Test API Gemini (si configuré)
    if [ -n "$GEMINI_API_KEY" ]; then
        print_info "Test API Gemini..."
        if command -v curl &>/dev/null; then
            if curl -s -o /dev/null -w "%{http_code}" \
               -H "Content-Type: application/json" \
               -H "x-goog-api-key: $GEMINI_API_KEY" \
               "https://generativelanguage.googleapis.com/v1beta/models" | grep -q "200"; then
                print_status "API Gemini: Clé valide"
            else
                print_warning "API Gemini: Clé invalide ou service indisponible"
            fi
        else
            print_info "API Gemini: Configurée (test non disponible - curl manquant)"
        fi
    else
        print_info "API Gemini: Désactivée"
    fi
    
    # Test des URLs
    print_info "Test de l'URL de base..."
    if command -v curl &>/dev/null; then
        if curl -s -o /dev/null -w "%{http_code}" "$APP_URL" --connect-timeout 10 | grep -q "200\|301\|302"; then
            print_status "URL de base: $APP_URL accessible"
        else
            print_warning "URL de base: $APP_URL non accessible (normal si les services sont arrêtés)"
        fi
    fi
    
    # Résumé des tests
    echo ""
    print_info "Tests terminés - vérifiez les résultats ci-dessus"
}

# Redémarrage des services
restart_services() {
    print_section "${ROCKET} REDÉMARRAGE DES SERVICES"
    
    if [ ! -d "$INSTALL_DIR" ]; then
        print_error "Répertoire d'installation non trouvé: $INSTALL_DIR"
        return 1
    fi
    
    cd "$INSTALL_DIR"
    
    if ! command -v docker-compose &>/dev/null; then
        print_error "Docker Compose non installé"
        return 1
    fi
    
    print_info "Arrêt des services..."
    sudo -u phishguard docker-compose down
    
    print_info "Attente de l'arrêt complet..."
    sleep 5
    
    print_info "Démarrage des services avec la nouvelle configuration..."
    sudo -u phishguard docker-compose up -d
    
    print_info "Attente de l'initialisation..."
    sleep 15
    
    # Vérification des services
    echo ""
    print_info "Vérification des services:"
    
    local services=("phishguard_db" "phishguard_redis" "phishguard_app" "phishguard_nginx")
    local all_running=true
    
    for service in "${services[@]}"; do
        if docker ps --filter "name=$service" --filter "status=running" --format "table {{.Names}}" | grep -q "$service"; then
            print_status "Service $service: Démarré"
        else
            print_error "Service $service: Problème"
            all_running=false
        fi
    done
    
    if [ "$all_running" = true ]; then
        print_status "Tous les services sont opérationnels"
        echo ""
        print_info "PhishGuard est accessible à l'adresse: $APP_URL"
    else
        print_warning "Certains services ont des problèmes"
        echo ""
        print_info "Pour diagnostiquer, utilisez:"
        echo "  cd $INSTALL_DIR"
        echo "  sudo -u phishguard docker-compose logs -f"
    fi
}

# Menu principal
show_menu() {
    echo ""
    echo -e "${WHITE}╔══════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║            MENU PRINCIPAL            ║${NC}"
    echo -e "${WHITE}╚══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN} 1) ${NC}Configuration de l'application ${ROCKET}"
    echo -e "${CYAN} 2) ${NC}Configuration base de données ${SHIELD}"
    echo -e "${CYAN} 3) ${NC}Configuration SMTP ${MAIL}"
    echo -e "${CYAN} 4) ${NC}Configuration sécurité ${KEY}"
    echo -e "${CYAN} 5) ${NC}Configuration IA (Gemini) ${GLOBE}"
    echo -e "${CYAN} 6) ${NC}Configuration avancée ${GEAR}"
    echo -e "${CYAN} 7) ${NC}Sauvegarder la configuration ${CHECK}"
    echo -e "${CYAN} 8) ${NC}Tester la configuration ${INFO}"
    echo -e "${CYAN} 9) ${NC}Redémarrer les services ${ROCKET}"
    echo -e "${CYAN}10) ${NC}Configuration complète (tout) ${GEAR}${ROCKET}"
    echo -e "${CYAN}11) ${NC}Afficher la configuration actuelle ${INFO}"
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

# Afficher la configuration actuelle
show_current_config() {
    print_section "${INFO} CONFIGURATION ACTUELLE"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Aucun fichier de configuration trouvé"
        return 1
    fi
    
    echo -e "${BLUE}Application:${NC}"
    echo "  Nom: ${APP_NAME:-Non défini}"
    echo "  URL: ${APP_URL:-Non défini}"
    echo "  Environnement: ${APP_ENV:-Non défini}"
    echo "  Debug: ${APP_DEBUG:-Non défini}"
    echo ""
    
    echo -e "${BLUE}Base de données:${NC}"
    echo "  Host: ${DB_HOST:-Non défini}"
    echo "  Port: ${DB_PORT:-Non défini}"
    echo "  Base: ${DB_NAME:-Non défini}"
    echo "  Utilisateur: ${DB_USER:-Non défini}"
    echo "  Mot de passe: ${DB_PASSWORD:+[Configuré]}${DB_PASSWORD:-[Non configuré]}"
    echo ""
    
    echo -e "${BLUE}SMTP:${NC}"
    if [ -n "$SMTP_USER" ]; then
        echo "  Serveur: ${SMTP_HOST:-Non défini}:${SMTP_PORT:-Non défini}"
        echo "  Chiffrement: ${SMTP_ENCRYPTION:-Aucun}"
        echo "  Expéditeur: ${SMTP_USER}"
        echo "  Mot de passe: [Configuré]"
    else
        echo "  Mode: Simulation (pas d'envoi réel)"
    fi
    echo ""
    
    echo -e "${BLUE}Intelligence Artificielle:${NC}"
    if [ -n "$GEMINI_API_KEY" ]; then
        echo "  API Gemini: Configurée"
        echo "  Modèle: ${AI_MODEL:-gemini-pro}"
        echo "  Tokens max: ${AI_MAX_TOKENS:-2048}"
    else
        echo "  IA: Désactivée"
    fi
    echo ""
    
    echo -e "${BLUE}Sécurité:${NC}"
    echo "  Session: ${SESSION_LIFETIME:-1440} minutes"
    echo "  Bcrypt rounds: ${BCRYPT_ROUNDS:-12}"
    echo "  JWT: ${JWT_SECRET:+[Configuré]}${JWT_SECRET:-[Non configuré]}"
    echo "  Chiffrement: ${ENCRYPTION_KEY:+[Configuré]}${ENCRYPTION_KEY:-[Non configuré]}"
    echo ""
    
    echo -e "${BLUE}Avancé:${NC}"
    echo "  Limite emails: ${EMAIL_RATE_LIMIT:-50}/heure"
    echo "  Upload max: $((${MAX_UPLOAD_SIZE:-10485760}/1048576)) Mo"
    echo "  RGPD: ${GDPR_ENABLED:-true}"
    echo "  Rétention: ${DATA_RETENTION_DAYS:-365} jours"
    echo "  Logs: ${LOG_LEVEL:-info}"
    echo ""
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
            11) show_current_config ;;
            0) 
                echo -e "${GREEN}Configuration terminée! ${ROCKET}${NC}"
                echo ""
                echo -e "${BLUE}${INFO} N'oubliez pas de:${NC}"
                echo "  1. Sauvegarder votre configuration"
                echo "  2. Redémarrer les services si nécessaire"
                echo "  3. Tester votre installation"
                echo ""
                echo -e "${CYAN}PhishGuard est accessible à: ${APP_URL:-http://localhost}${NC}"
                exit 0 
                ;;
            *) 
                print_error "Choix invalide. Veuillez choisir entre 0 et 11."
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
