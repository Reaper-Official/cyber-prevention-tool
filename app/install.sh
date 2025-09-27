#!/usr/bin/env bash
set -euo pipefail
trap 'echo "❌ Erreur pendant install.sh (ligne $LINENO)"; exit 1' ERR

# install.sh : installe dépendances, configure .env, démarre via docker-compose et exécute migrations & seed
# Options:
#   --target /path : copier le repo (optionnel) ; non utilisé par défaut
#   --non-interactive : mode CI (ne pas attendre les confirmations)
#   --use-docker : forcer l'utilisation de docker compose
#   --skip-seed : ne pas lancer le seed
#   --skip-start : ne pas démarrer les services

TARGET_DIR="."
NON_INTERACTIVE=false
USE_DOCKER=false
SKIP_SEED=false
SKIP_START=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET_DIR="$2"; shift 2 ;;
    --non-interactive) NON_INTERACTIVE=true; shift ;;
    --use-docker) USE_DOCKER=true; shift ;;
    --skip-seed) SKIP_SEED=true; shift ;;
    --skip-start) SKIP_START=true; shift ;;
    *) echo "Unknown option: $1"; exit 2 ;;
  esac
done

echo "🚀 PhishGuard Installation (target: $TARGET_DIR)"

# Check prerequisites
REQUIRED_CMDS=(git openssl)
# Prefer docker-compose tooling if available
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1 || docker-compose --version >/dev/null 2>&1; then
    DOCKER_AVAILABLE=true
    REQUIRED_CMDS+=(docker)
  else
    DOCKER_AVAILABLE=false
  fi
else
  DOCKER_AVAILABLE=false
fi

for c in "${REQUIRED_CMDS[@]}"; do
  if ! command -v "$c" >/dev/null 2>&1; then
    echo "❌ Pré-requis manquant: $c"
    exit 2
  fi
done

# copy project if target differs
if [ "$TARGET_DIR" != "." ]; then
  echo "📁 Copie du projet vers $TARGET_DIR"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude='.git' ./ "$TARGET_DIR"/
  else
    cp -a . "$TARGET_DIR"/
  fi
  cd "$TARGET_DIR"
fi

# Create .env from template if missing
if [ ! -f .env ]; then
  echo "🔐 Création de .env depuis .env.example"
  if [ -f .env.example ]; then
    cp .env.example .env
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n' | tr -d '\r')
    # portable sed replacement
    if sed --version >/dev/null 2>&1; then
      sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env || true
    else
      # macOS fallback (shouldn't be needed in Codespaces)
      sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env || true
    fi
    echo "✅ .env créé (JWT_SECRET généré)"
  else
    echo "⚠️ .env.example introuvable, créez manuellement .env"
  fi
else
  echo "ℹ️ .env existe déjà, conservation"
fi

# Decide start method
if [ "$USE_DOCKER" = false ] && [ "$DOCKER_AVAILABLE" = true ] && [ "$NON_INTERACTIVE" = false ]; then
  echo ""
  read -r -p "Utiliser Docker Compose pour démarrer les services ? (y/n) " ans || ans="y"
  case "$ans" in
    y|Y) USE_DOCKER=true ;;
    *) USE_DOCKER=false ;;
  esac
fi

# Start services
if [ "$SKIP_START" = false ]; then
  if [ "$USE_DOCKER" = true ]; then
    echo "🐳 Lancement via docker compose..."
    docker-compose down -v 2>/dev/null || true
    docker-compose up -d --build
    echo "⏳ Attente du backend..."
    sleep 15
    # Run migrations & seed inside backend container
    echo "⚙️ Exécution des migrations Prisma..."
    docker-compose exec -T backend npx prisma migrate deploy || {
      echo "⚠️ prisma migrate deploy failed; trying prisma migrate dev"
      docker-compose exec -T backend npx prisma migrate dev --name init --skip-seed || true
    }
    if [ "$SKIP_SEED" = false ]; then
      echo "⚙️ Lancement du seed..."
      docker-compose exec -T backend npx prisma db seed || {
        echo "⚠️ seed via npx prisma db seed failed; essayez d'exécuter manuellement"
      }
    fi
  else
    echo "⚠️ Mode sans conteneur — exécution locale des étapes (démo)"
    if [ -d backend ]; then
      echo "📦 Installation backend dependencies..."
      if command -v pnpm >/dev/null 2>&1; then
        (cd backend && pnpm install)
      elif command -v yarn >/dev/null 2>&1; then
        (cd backend && yarn install)
      else
        (cd backend && npm ci)
      fi
      echo "⚙️ Build backend..."
      (cd backend && npm run build || true)
      echo "⚙️ Migrations (local)..."
      (cd backend && npx prisma migrate dev --name init --skip-seed || true)
      if [ "$SKIP_SEED" = false ]; then
        (cd backend && node prisma/seed.js) || (cd backend && npx ts-node prisma/seed.ts) || true
      fi
    fi
    if [ -d frontend ]; then
      echo "📦 Installation frontend dependencies..."
      if command -v pnpm >/dev/null 2>&1; then
        (cd frontend && pnpm install)
      elif command -v yarn >/dev/null 2>&1; then
        (cd frontend && yarn install)
      else
        (cd frontend && npm ci)
      fi
      echo "📦 Build frontend..."
      (cd frontend && npm run build || true)
    fi
    echo "✅ Services (locaux) prêts (si les commandes ci-dessus ont réussi)"
  fi
fi

# Healthcheck
echo "🔍 Vérification sanitaire backend..."
if curl -sSf http://localhost:3000/health >/dev/null 2>&1; then
  echo "✅ Backend répond sur /health"
else
  echo "⚠️ Échec du healthcheck. Vérifiez les logs (docker-compose logs backend)"
fi

# Admin credentials reminder
ADMIN_EMAIL=$(grep -E '^DEFAULT_ADMIN_EMAIL=' .env | cut -d= -f2- || echo "admin@local.test")
ADMIN_PASS=$(grep -E '^DEFAULT_ADMIN_PASSWORD=' .env | cut -d= -f2- || echo "ChangeMe123!")
cat > "CREDENTIALS_ADMIN.txt" <<CREDFILE
PhishGuard Admin Credentials

Email:    ${ADMIN_EMAIL}
Password: ${ADMIN_PASS}

⚠️ SECURITY WARNING:
- Change this password immediately after first login
- Delete this file once noted
- Do NOT commit this file to version control
CREDFILE

echo "✅ CREDENTIALS_ADMIN.txt généré"

echo "🎉 Installation terminée. Frontend: http://localhost:5173 | Backend: http://localhost:3000"
exit 0
