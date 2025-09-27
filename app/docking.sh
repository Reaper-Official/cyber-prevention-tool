cd /workspaces/cyber-prevention-tool/app

docker compose exec backend npx prisma db push
docker compose exec backend npx prisma generate
sleep 10

docker compose down
sleep 10
docker rmi app-backend app-frontend
sleep 10
docker compose build --no-cache backend
docker compose build --no-cache frontend
docker compose up -d
sleep 20
docker compose exec backend npx prisma db push
docker compose exec backend node prisma/seed.ts