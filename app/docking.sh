# Nettoyer et redémarrer
docker compose down -v
docker compose up -d --build

# Voir les logs d'un service spécifique
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Exécuter les migrations manuellement
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed