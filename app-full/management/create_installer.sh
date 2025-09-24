#!/bin/bash
# create_installer.sh - Créateur de fichier d'installation portable
# ==================================================================

set -e

SCRIPT_NAME="phishguard_installer.sh"
REPO_URL="https://github.com/Reaper-Official/cyber-prevention-tool"
OUTPUT_DIR="$(pwd)"

print_banner() {
    echo "=================================================="
    echo "  PHISHGUARD BASIC - CRÉATEUR D'INSTALLATEUR"
    echo "=================================================="
    echo ""
}

print_status() { echo "✅ $1"; }
print_error() { echo "❌ $1"; }
print_info() { echo "ℹ️  $1"; }

create_portable_installer() {
    print_info "Création de l'installateur portable..."
    
    cat > "$OUTPUT_DIR/$SCRIPT_NAME" << 'INSTALLER_EOF'
#!/bin/bash
# PhishGuard BASIC - Installateur Portable Auto-Extractible
# =========================================================

TEMP_DIR="/tmp/phishguard_install_$$"
REPO_URL="https://github.com/Reaper-Official/cyber-prevention-tool"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_banner() {
    clear
    echo -e "${BLUE}"
    echo "██████╗ ██╗  ██╗██╗███████╗██╗  ██╗ ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ "
    echo "██╔══██╗██║  ██║██║██╔════╝██║  ██║██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗"
    echo "██████╔╝███████║██║███████╗███████║██║  ███╗██║   ██║███████║██████╔╝██║  ██║"
    echo "██╔═══╝ ██╔══██║██║╚════██║██╔══██║██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║"
    echo "██║     ██║  ██║██║███████║██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝"
    echo "╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ "
    echo -e "${NC}"
    echo -e "${GREEN}              Installateur Portable Auto-Extractible${NC}"
    echo ""
}

extract_and_run() {
    print_banner
    
    echo -e "${YELLOW}🚀 Démarrage de l'installation PhishGuard BASIC${NC}"
    echo ""
    
    # Création du répertoire temporaire
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # Vérification des privilèges
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ Ce script doit être exécuté avec sudo${NC}"
        echo "Utilisation: sudo bash $0"
        exit 1
    fi
    
    # Téléchargement du script d'installation principal
    echo -e "${BLUE}📥 Téléchargement du script d'installation...${NC}"
    if command -v curl &> /dev/null; then
        curl -sSL "https://raw.githubusercontent.com/Reaper-Official/cyber-prevention-tool/main/install.sh" -o install.sh
    elif command -v wget &> /dev/null; then
        wget -q "https://raw.githubusercontent.com/Reaper-Official/cyber-prevention-tool/main/install.sh"
    else
        echo -e "${RED}❌ curl ou wget requis pour le téléchargement${NC}"
        exit 1
    fi
    
    if [ ! -f "install.sh" ]; then
        echo -e "${RED}❌ Échec du téléchargement du script d'installation${NC}"
        exit 1
    fi
    
    # Extraction des données embarquées (si présentes)
    ARCHIVE_LINE=$(awk '/^__ARCHIVE_BEGIN__/ { print NR + 1; exit 0; }' "$0")
    if [ -n "$ARCHIVE_LINE" ]; then
        echo -e "${BLUE}📦 Extraction des fichiers embarqués...${NC}"
        tail -n +$ARCHIVE_LINE "$0" | base64 -d | tar -xzf -
    fi
    
    # Exécution de l'installation
    chmod +x install.sh
    ./install.sh
    
    # Nettoyage
    cd /
    rm -rf "$TEMP_DIR"
    
    echo -e "${GREEN}🎉 Installation terminée!${NC}"
}

# Nettoyage en cas d'interruption
trap 'rm -rf "$TEMP_DIR"; exit 1' INT TERM EXIT

extract_and_run "$@"

# Point de départ des données embarquées
__ARCHIVE_BEGIN__
INSTALLER_EOF

    chmod +x "$OUTPUT_DIR/$SCRIPT_NAME"
    print_status "Installateur portable créé: $OUTPUT_DIR/$SCRIPT_NAME"
}

# Fonction pour embarquer des fichiers (optionnel)
embed_files() {
    read -p "Voulez-vous embarquer des fichiers de configuration ? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Fichiers à embarquer (séparés par des espaces):"
        read -r files_to_embed
        
        if [ -n "$files_to_embed" ]; then
            print_info "Embarquement des fichiers..."
            tar -czf - $files_to_embed | base64 >> "$OUTPUT_DIR/$SCRIPT_NAME"
            print_status "Fichiers embarqués dans l'installateur"
        fi
    fi
}

main() {
    print_banner
    
    echo "Ce script va créer un installateur portable auto-extractible"
    echo "pour PhishGuard BASIC."
    echo ""
    
    create_portable_installer
    embed_files
    
    echo ""
    echo "✨ Installateur créé avec succès!"
    echo "📁 Fichier: $OUTPUT_DIR/$SCRIPT_NAME"
    echo ""
    echo "Utilisation:"
    echo "  sudo bash $SCRIPT_NAME"
    echo ""
}

main "$@"
