# Arrêtez tout
docker compose down

# Supprimez les volumes pour repartir de zéro
docker volume rm app_postgres_data

# Relancez avec le nouveau schéma
docker compose up -d db redis mailhog

# Attendez 10 secondes
sleep 10

# Appliquez le nouveau schéma
cd backend
npx prisma db push
npx prisma generate
cd ..

# Relancez tout
docker compose up -d --build