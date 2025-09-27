docker compose down -v
docker compose build --no-cache backend
docker compose build --no-cache frontend
docker compose up -d

sleep 20
docker compose logs backend --tail=30