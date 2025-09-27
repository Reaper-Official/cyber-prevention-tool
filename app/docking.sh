# Arrêter et nettoyer complètement Docker
docker compose down -v
docker rmi phishguard-basic-backend phishguard-basic-frontend 2>/dev/null || true

# Rebuild sans cache
docker compose build --no-cache

# Démarrer les services
docker compose up -d

# Attendre 20 secondes
sleep 20

# Exécuter les migrations
docker compose exec -T backend npx prisma migrate deploy || docker compose exec -T backend npx prisma migrate dev --name init --skip-seed

# Exécuter le seed
docker compose exec -T backend npx prisma db seed || docker compose exec -T backend npx ts-node prisma/seed.ts