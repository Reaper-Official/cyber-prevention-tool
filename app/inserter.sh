# Arrêter tout
docker compose down -v

# Reconstruire
docker compose up -d --build

# Attendre le démarrage
sleep 20

# Créer la migration pour ajouter readingSpeed
docker compose exec backend npx prisma migrate dev --name add_reading_speed

# Seed
docker compose exec backend npm run prisma:seed

# Vérifier les modules
docker compose exec db psql -U postgres -d phishguard -c "SELECT id, title FROM \"TrainingModule\";"