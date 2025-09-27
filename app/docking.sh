cd /workspaces/cyber-prevention-tool/app

# Nettoyer complètement
docker compose down -v
docker rmi app-backend app-frontend 2>/dev/null || true

docker compose build --no-cache frontend
docker compose build --no-cache backend
docker compose up -d
