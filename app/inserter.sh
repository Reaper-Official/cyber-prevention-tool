# Reconstruire le backend
docker compose down
docker compose up -d --build

# Attendre que tout démarre
sleep 20

# Réexécuter le seed
docker compose exec backend npm run prisma:seed

# Vérifier les modules dans la DB
docker compose exec db psql -U postgres -d phishguard -c "SELECT id, title, category FROM \"TrainingModule\";"