#!/bin/bash

set -e

echo "🚀 Installation de PhishGuard - Plateforme de Sensibilisation au Phishing"
echo "=========================================================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérification des prérequis
echo -e "\n${YELLOW}Vérification des prérequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker est installé${NC}"
echo -e "${GREEN}✅ Docker Compose est installé${NC}"

# Création du fichier .env
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Création du fichier .env...${NC}"
    cp .env.example .env
    
    echo -e "${YELLOW}Configuration de l'environnement:${NC}"
    read -p "Fournisseur AI (GEMINI/OPENAI/ANTHROPIC/OLLAMA) [GEMINI]: " AI_PROVIDER
    AI_PROVIDER=${AI_PROVIDER:-GEMINI}
    
    read -p "Clé API AI: " AI_API_KEY
    
    read -p "Mode Sandbox par défaut (true/false) [true]: " SANDBOX_MODE
    SANDBOX_MODE=${SANDBOX_MODE:-true}
    
    sed -i "s/AI_PROVIDER=.*/AI_PROVIDER=$AI_PROVIDER/" .env
    sed -i "s/AI_API_KEY=.*/AI_API_KEY=$AI_API_KEY/" .env
    sed -i "s/SANDBOX_MODE=.*/SANDBOX_MODE=$SANDBOX_MODE/" .env
    
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
else
    echo -e "${GREEN}✅ Fichier .env existe déjà${NC}"
fi

# Arrêt des conteneurs existants
echo -e "\n${YELLOW}Arrêt des conteneurs existants...${NC}"
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Construction et démarrage des conteneurs
echo -e "\n${YELLOW}Construction et démarrage des conteneurs...${NC}"
docker-compose up -d --build || docker compose up -d --build

# Attente que les services soient prêts
echo -e "\n${YELLOW}Attente du démarrage des services...${NC}"
sleep 15

# Application des migrations
echo -e "\n${YELLOW}Application des migrations de la base de données...${NC}"
docker-compose exec -T backend npx prisma db push || docker compose exec -T backend npx prisma db push

# Seed de la base de données
echo -e "\n${YELLOW}Initialisation des données...${NC}"
docker-compose exec -T backend npm run prisma:seed || docker compose exec -T backend npm run prisma:seed

# Affichage des informations de connexion
echo -e "\n${GREEN}=========================================================================="
echo -e "✅ Installation terminée avec succès!"
echo -e "==========================================================================${NC}"
echo -e "\n${GREEN}📋 Informations de connexion:${NC}"
echo -e "   URL: ${YELLOW}http://localhost${NC}"
echo -e "   Admin: ${YELLOW}admin@local.test${NC}"
echo -e "   Password: ${YELLOW}Admin123!${NC}"
echo -e "\n${GREEN}📧 MailHog (emails de test):${NC}"
echo -e "   URL: ${YELLOW}http://localhost:8025${NC}"
echo -e "\n${GREEN}🔧 Services:${NC}"
echo -e "   Frontend: ${YELLOW}http://localhost${NC}"
echo -e "   Backend: ${YELLOW}http://localhost:4000${NC}"
echo -e "   Database: ${YELLOW}localhost:5432${NC}"
echo -e "   Redis: ${YELLOW}localhost:6379${NC}"
echo -e "\n${YELLOW}⚠️  IMPORTANT:${NC}"
echo -e "   - Mode Sandbox activé par défaut (aucun email réel envoyé)"
echo -e "   - Configurez SMTP pour la production dans le fichier .env"
echo -e "   - Toute campagne nécessite une approbation RH/Admin"
echo -e "\n${GREEN}📚 Documentation:${NC}"
echo -e "   - README.md pour plus d'informations"
echo -e "   - API: http://localhost:4000/api"
echo -e "\n${GREEN}🛠️  Commandes utiles:${NC}"
echo -e "   Arrêter: ${YELLOW}docker-compose down${NC}"
echo -e "   Logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "   Redémarrer: ${YELLOW}docker-compose restart${NC}"

echo -e "\n${GREEN}Bon usage de PhishGuard! 🎯${NC}\n"