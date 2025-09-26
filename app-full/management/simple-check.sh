#!/bin/bash

#################################################
# Script de vérification système PhishGuard
# Vérifie que tout est bien installé
#################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}\n"
}

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $2 : $(command -v $1)${NC}"
        if [ "$3" != "" ]; then
            echo -e "   Version: $($3 2>&1 | head -1)"
        fi
        return 0
    else
        echo -e "${RED}❌ $2 : Non installé${NC}"
        return 1
    fi
}

check_docker_service() {
    if systemctl is-active --quiet docker 2>/dev/null; then
        echo -e "${GREEN}✅ Service Docker : Actif${NC}"
        return 0
    elif pgrep -x "Docker" > /dev/null || pgrep -x "com.docker.backend" > /dev/null; then
        echo -e "${GREEN}✅ Docker Desktop : En cours d'exécution${NC}"
        return 0
    else
        echo -e "${RED}❌ Service Docker : Non actif${NC}"
        return 1
    fi
}

check_docker_group() {
    if groups | grep -q docker; then
        echo -e "${GREEN}✅ Groupe Docker : Utilisateur dans le groupe${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Groupe Docker : Utilisateur pas dans le groupe${NC}"
        echo -e "   ${YELLOW}Exécutez: sudo usermod -aG docker \$USER${NC}"
        return 1
    fi
}

check_ports() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${YELLOW}⚠️  Port $port : Déjà utilisé (peut causer des conflits avec $service)${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port : Disponible${NC}"
        return 0
    fi
}

check_disk_space() {
    local available=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$available" -gt 5 ]; then
        echo -e "${GREEN}✅ Espace disque : ${available}GB disponible${NC}"
        return 0
    else
        echo -e "${RED}❌ Espace disque : Seulement ${available}GB disponible (minimum 5GB recommandé)${NC}"
        return 1
    fi
}

check_containers() {
    if docker ps --filter "name=phishguard" --format "{{.Names}}" 2>/dev/null | grep -q phishguard; then
        echo -e "${GREEN}✅ Conteneurs PhishGuard :${NC}"
        docker ps --filter "name=phishguard" --format "   - {{.Names}} ({{.Status}})"
        return 0
    else
        echo -e "${YELLOW}⚠️  Conteneurs PhishGuard : Aucun conteneur en cours d'exécution${NC}"
        return 1
    fi
}

main() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔════════════════════════════════════════╗
║    Vérification du Système             ║
║    PhishGuard BASIC                    ║
╚════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    print_header "Vérification des commandes"
    
    check_command "git" "Git" "git --version"
    check_command "docker" "Docker" "docker --version"
    check_command "docker-compose" "Docker Compose" "docker-compose --version" || \
        check_command "docker" "Docker Compose (plugin)" "docker compose version"
    
    print_header "Vérification des services"
    
    check_docker_service
    if [ "$(uname)" != "Darwin" ]; then
        check_docker_group
    fi
    
    print_header "Vérification des ports"
    
    check_ports 8080 "Nginx"
    check_ports 5432 "PostgreSQL"
    check_ports 6379 "Redis"
    
    print_header "Vérification des ressources"
    
    check_disk_space
    
    print_header "Vérification des conteneurs"
    
    check_containers
    
    # Test de connexion Docker
    print_header "Test de connexion Docker"
    
    if docker ps &> /dev/null; then
        echo -e "${GREEN}✅ Connexion Docker : OK${NC}"
        echo -e "   Conteneurs actifs : $(docker ps -q | wc -l)"
    else
        echo -e "${RED}❌ Connexion Docker : Échec${NC}"
        echo -e "${YELLOW}   Vérifiez que Docker est démarré${NC}"
    fi
    
    print_header "Résumé"
    
    echo -e "${CYAN}Pour installer PhishGuard, exécutez :${NC}"
    echo -e "   ${GREEN}./install-complete.sh${NC}"
    echo ""
    echo -e "${CYAN}Pour plus d'aide :${NC}"
    echo -e "   ${GREEN}./install-complete.sh --help${NC}"
    echo ""
}

main "$@"
