
docker compose restart backend
sleep 15
docker compose exec backend npm run prisma:seed