# Supprimer les conteneurs et volumes
docker compose down -v

# Reconstruire tout
docker compose up -d --build

# Attendre le démarrage
sleep 20

# Créer la migration
docker compose exec backend npx prisma migrate dev --name init

# Seed
docker compose exec backend npm run prisma:seed

# Vérifier les modules
docker compose exec db psql -U postgres -d phishguard -c "SELECT id, title FROM \"TrainingModule\";"