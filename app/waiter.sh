docker compose exec backend npx prisma migrate dev --name init
sleep 10
docker compose exec backend npx ts-node prisma/seed.ts
sleep 10
docker compose logs backend --tail=20