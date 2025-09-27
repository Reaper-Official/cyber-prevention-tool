docker compose exec backend npx prisma db push
sleep 10
docker compose exec backend npx ts-node prisma/seed.ts