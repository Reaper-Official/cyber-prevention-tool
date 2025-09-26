#!/bin/bash

#################################################
# Script de désinstallation PhishGuard BASIC
#################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

INSTALL_DIR="$(pwd)/cyber-prevention-tool"

print_header() {
    echo -e "\n${CYAN}════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header "Désinstallation PhishGuard BASIC"

# Confirmation
echo -e "${YELLOW}Cette action va :${NC}"
echo "  - Arrêter tous les conteneurs"
echo "  - Supprimer les conteneurs, images et volumes"
echo "  - Supprimer le dossier d'installation"
echo ""
read -p "Êtes-vous sûr de vouloir continuer ? (oui/non) : " confirm

if [ "$confirm" != "oui" ]; then
    echo -e "${CYAN}Désinstallation annulée.${NC}"
    exit 0
fi

# Arrêter et supprimer les conteneurs
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR"
    
    print_warning "Arrêt des conteneurs..."
    docker-compose down -v 2>/dev/null || true
    
    print_warning "Suppression des images..."
    docker-compose down --rmi all 2>/dev/null || true
    
    print_success "Conteneurs supprimés"
fi

# Supprimer le dossier d'installation
if [ -d "$INSTALL_DIR" ]; then
    print_warning "Suppression du dossier d'installation..."
    rm -rf "$INSTALL_DIR"
    print_success "Dossier supprimé"
fi

print_header "Désinstallation terminée"
echo -e "${GREEN}PhishGuard BASIC a été complètement désinstallé.${NC}\n"
