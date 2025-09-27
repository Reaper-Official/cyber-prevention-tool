cd /workspaces/cyber-prevention-tool/app

# Nettoyer complètement
docker compose down -v
docker rmi app-backend app-frontend 2>/dev/null || true

# Rebuild sans cache
docker compose build --no-cache

# Démarrer
docker compose up -d