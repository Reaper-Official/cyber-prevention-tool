sleep 20
docker compose exec backend npx prisma db push --skip-generate
docker compose exec backend npx prisma generate
docker compose exec backend npx ts-node prisma/seed.ts