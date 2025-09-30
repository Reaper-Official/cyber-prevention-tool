# Arrêtez tout
docker compose down

# Supprimez le volume de la base de données
docker volume rm app_postgres_data

# Redémarrez
docker compose up -d

# Attendez 20 secondes
sleep 20

# Forcez l'application du schéma
docker compose exec backend npx prisma db push --accept-data-loss

# Seedez
docker compose exec backend npm run prisma:seed