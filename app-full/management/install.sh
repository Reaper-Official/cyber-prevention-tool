#!/bin/bash

# PhishGuard BASIC - Script d'installation automatique
# ====================================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Installation PhishGuard BASIC"
echo "================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérification des prérequis
print_info "Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé. Veuillez installer Docker first."
    echo "Installation Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé."
    echo "Installation Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

print_status "Docker et Docker Compose sont installés"

# Vérification des ports
print_info "Vérification de la disponibilité des ports..."

check_port() {
    if lsof -i:$1 &>/dev/null; then
        print_warning "Le port $1 est déjà utilisé"
        read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

check_port 80
check_port 443
check_port 5432

# Création de la structure des répertoires
print_info "Création de la structure des répertoires..."

mkdir -p {storage/{logs,cache,uploads,backups},ssl,nginx/sites-available,docker/php,templates}
print_status "Répertoires créés"

# Configuration de l'environnement
if [ ! -f .env ]; then
    print_info "Création du fichier de configuration..."
    cp .env.example .env
    
    # Génération des clés sécurisées
    JWT_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Remplacement dans le fichier .env
    sed -i.bak "s/VotreCleSecreteTresSecurisee256bits/$JWT_SECRET/" .env
    sed -i.bak "s/VotreCleDeChiffrement32Caracteres/$ENCRYPTION_KEY/" .env
    sed -i.bak "s/VotreMotDePasseSecurise123!/$DB_PASSWORD/" .env
    
    print_status "Fichier .env créé avec des clés sécurisées"
else
    print_info "Fichier .env existant détecté"
fi

# Construction des images Docker
print_info "Construction des images Docker..."
docker-compose build --no-cache

print_status "Images Docker construites"

# Démarrage des services
print_info "Démarrage des services..."
docker-compose up -d

# Attente de la base de données
print_info "Attente de l'initialisation de la base de données..."
sleep 30

# Vérification que les services sont actifs
print_info "Vérification des services..."

services=("phishguard_db" "phishguard_redis" "phishguard_app" "phishguard_nginx")
for service in "${services[@]}"; do
    if docker ps --filter "name=$service" --filter "status=running" | grep -q $service; then
        print_status "Service $service: actif"
    else
        print_error "Service $service: problème détecté"
        docker-compose logs $service
    fi
done

# Exécution du script de configuration
print_info "Exécution de la configuration initiale..."
docker-compose exec -T app php setup.php

# Configuration des permissions finales
print_info "Configuration des permissions..."
docker-compose exec app chown -R www-data:www-data /var/www/html/storage
docker-compose exec app chmod -R 775 /var/www/html/storage

# Tests de connectivité
print_info "Tests de connectivité..."

if curl -s http://localhost >/dev/null; then
    print_status "Interface web accessible"
else
    print_warning "Interface web non accessible - vérifiez les logs"
fi

# Affichage des informations de connexion
echo ""
echo "🎉 Installation terminée avec succès!"
echo "====================================="
echo ""
echo -e "${GREEN}📱 URL d'accès:${NC} http://localhost"
echo -e "${GREEN}👤 Identifiants par défaut:${NC}"
echo -e "   Username: ${BLUE}admin${NC}"
echo -e "   Password: ${BLUE}admin${NC}"
echo ""
echo -e "${YELLOW}🔧 Prochaines étapes importantes:${NC}"
echo "1. Changez le mot de passe administrateur"
echo "2. Configurez votre serveur SMTP dans les paramètres"
echo "3. Importez votre liste d'employés (CSV)"
echo "4. Créez votre première campagne de test"
echo ""
echo -e "${BLUE}📚 Commandes utiles:${NC}"
echo "• Voir les logs: docker-compose logs -f"
echo "• Arrêter: docker-compose down"
echo "• Redémarrer: docker-compose restart"
echo "• Sauvegarde: docker-compose exec db pg_dump..."
echo ""
echo -e "${GREEN}✨ PhishGuard BASIC est prêt à l'emploi!${NC}"
