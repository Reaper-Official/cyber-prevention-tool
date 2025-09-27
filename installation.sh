#!/usr/bin/env bash
set -euo pipefail
trap 'echo "❌ Erreur sur la ligne $LINENO"; exit 1' ERR

# rebuild_repo.sh
# Reconstruit fidèlement l'arborescence et les fichiers du projet "phishguard-basic"
# - Écrit tous les fichiers via heredocs (texte) ou base64 (si nécessaire)
# - Génère install.sh (exécutable) qui installe dépendances et démarre le projet via docker-compose
# - Calcule MANIFEST.sha256 et vérifie checksums
# - Initialise git et crée CREDENTIALS_ADMIN.txt
#
# Usage:
#   chmod +x rebuild_repo.sh
#   ./rebuild_repo.sh [--skip-start]
#
# Option:
#   --skip-start   : ne pas proposer de lancer docker-compose à la fin

SKIP_START=false
for arg in "$@"; do
  case "$arg" in
    --skip-start) SKIP_START=true ;;
    *) ;;
  esac
done

PROJECT_NAME="phishguard-basic"
ROOT_DIR="$(pwd)/${PROJECT_NAME}"
FILE_COUNT=0

# Detect sha256 command (sha256sum or shasum -a 256)
if command -v sha256sum >/dev/null 2>&1; then
  SHA256_CMD="sha256sum"
elif command -v shasum >/dev/null 2>&1; then
  SHA256_CMD="shasum -a 256"
else
  echo "❌ Aucun utilitaire sha256 trouvé (sha256sum ou shasum requis)"
  exit 2
fi

echo "📁 Création du répertoire projet: $ROOT_DIR"
mkdir -p "$ROOT_DIR"
cd "$ROOT_DIR"

# helper to increment file counter
inc() {
  FILE_COUNT=$((FILE_COUNT + 1))
}

# -----------------------------
# WRITE FILES (heredocs)
# -----------------------------

# 1) Top-level descriptor (stack comment)
cat > "STACK.txt" <<'ENDFILE'
## Stack
- React 18 + TypeScript + Vite
- Node.js 18 + Express + Prisma
- PostgreSQL 14 + Docker
ENDFILE
inc

# 2) LICENSE
cat > "LICENSE" <<'ENDFILE'
INTERNAL USE ONLY LICENSE
Copyright (c) 2025 PhishGuard
FOR INTERNAL SECURITY TRAINING ONLY
ENDFILE
inc

# 3) .gitignore
cat > ".gitignore" <<'ENDFILE'
node_modules/
dist/
build/
*.log
.env
.env.local
.DS_Store
CREDENTIALS_ADMIN.txt
MANIFEST.sha256
ENDFILE
inc

# 4) .env.example
cat > ".env.example" <<'ENDFILE'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/phishguard
JWT_SECRET=change-me-32-chars-minimum
AI_PROVIDER=GEMINI
AI_API_KEY=your-key-here
SANDBOX_MODE=true
DEFAULT_ADMIN_EMAIL=admin@local.test
DEFAULT_ADMIN_PASSWORD=ChangeMe123!
ENDFILE
inc

# 5) docker-compose.yml
cat > "docker-compose.yml" <<'ENDFILE'
version: '3.9'
services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: phishguard
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/phishguard
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: sh -c "npx prisma migrate deploy && npx prisma db seed && npm start"
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
volumes:
  postgres_data:
ENDFILE
inc

# 6) install.sh (this will be created inside the repo and marked executable)
cat > "install.sh" <<'ENDFILE'
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
ENDFILE
inc
chmod +x "install.sh"

# 7) backend/Dockerfile
mkdir -p backend
cat > "backend/Dockerfile" <<'ENDFILE'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/server.js"]
ENDFILE
inc

# 8) backend/package.json
cat > "backend/package.json" <<'ENDFILE'
{
  "name": "phishguard-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "express": "^4.18.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3",
    "prisma": "^5.7.0"
  }
}
ENDFILE
inc

# 9) backend/tsconfig.json
cat > "backend/tsconfig.json" <<'ENDFILE'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
ENDFILE
inc

# 10) backend/prisma/schema.prisma
mkdir -p backend/prisma
cat > "backend/prisma/schema.prisma" <<'ENDFILE'
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String?
  lastName String?
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  campaignsCreated Campaign[] @relation("CampaignCreator")
  campaignTargets  CampaignTarget[]
}
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  permissions Json     @default("{}")
  users       User[]
}
model Campaign {
  id          String   @id @default(uuid())
  name        String
  subject     String
  body        String   @db.Text
  fromName    String
  fromEmail   String
  status      String   @default("draft")
  sandbox     Boolean  @default(true)
  createdById String
  createdBy   User     @relation("CampaignCreator", fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  targets     CampaignTarget[]
}
model CampaignTarget {
  id          String   @id @default(uuid())
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  status      String   @default("pending")
  trackingId  String   @unique @default(uuid())
  @@unique([campaignId, userId])
}
ENDFILE
inc

# 11) backend/prisma/seed.ts
cat > "backend/prisma/seed.ts" <<'ENDFILE'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', permissions: { users: ['create', 'read'], campaigns: ['create', 'read'] } }
  });
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';
  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { email: 'admin@local.test', password: hashed, firstName: 'Admin', roleId: adminRole.id }
  });
  console.log('✅ Admin: admin@local.test');
  console.log(`   Admin password: ${password}`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
ENDFILE
inc

# 12) backend/src/server.ts
mkdir -p backend/src
cat > "backend/src/server.ts" <<'ENDFILE'
import dotenv from 'dotenv';
dotenv.config();
import app from './app';
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});
ENDFILE
inc

# 13) backend/src/app.ts
cat > "backend/src/app.ts" <<'ENDFILE'
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import campaignRoutes from './routes/campaignRoutes';
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);
export default app;
ENDFILE
inc

# 14) backend/src/middleware/errorHandler.ts
mkdir -p backend/src/middleware
cat > "backend/src/middleware/errorHandler.ts" <<'ENDFILE'
import { Request, Response, NextFunction } from 'express';
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}
export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal error' });
};
ENDFILE
inc

# 15) backend/src/middleware/auth.ts
cat > "backend/src/middleware/auth.ts" <<'ENDFILE'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';
const prisma = new PrismaClient();
export interface AuthRequest extends Request {
  user?: any;
}
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new AppError(401, 'Auth required');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { role: true } });
    if (!user || !user.active) throw new AppError(401, 'Invalid');
    req.user = { id: user.id, email: user.email, role: user.role.name };
    next();
  } catch (error) {
    next(new AppError(401, 'Invalid token'));
  }
};
ENDFILE
inc

# 16) backend/src/routes/authRoutes.ts
mkdir -p backend/src/routes
cat > "backend/src/routes/authRoutes.ts" <<'ENDFILE'
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
const router = Router();
const prisma = new PrismaClient();
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user || !user.active) throw new AppError(401, 'Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Invalid credentials');
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role.name } });
  } catch (error) {
    next(error);
  }
});
export default router;
ENDFILE
inc

# 17) backend/src/routes/campaignRoutes.ts
cat > "backend/src/routes/campaignRoutes.ts" <<'ENDFILE'
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);
router.get('/', async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { createdBy: { select: { email: true } }, _count: { select: { targets: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});
router.post('/', async (req, res, next) => {
  try {
    const { name, subject, body, fromName, fromEmail, targetUserIds } = req.body;
    const campaign = await prisma.campaign.create({
      data: {
        name, subject, body, fromName, fromEmail, sandbox: true, createdById: (req as any).user.id,
        targets: { create: (targetUserIds || []).map((userId: string) => ({ userId, status: 'pending' })) }
      }
    });
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { targets: { include: { user: true } }, createdBy: true }
    });
    if (!campaign) throw new AppError(404, 'Not found');
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});
export default router;
ENDFILE
inc

# 18) frontend Dockerfile + package and configs
mkdir -p frontend

cat > "frontend/Dockerfile" <<'ENDFILE'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
ENDFILE
inc

cat > "frontend/package.json" <<'ENDFILE'
{
  "name": "phishguard-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
ENDFILE
inc

cat > "frontend/tsconfig.json" <<'ENDFILE'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
ENDFILE
inc

cat > "frontend/vite.config.ts" <<'ENDFILE'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } } }
});
ENDFILE
inc

cat > "frontend/tailwind.config.js" <<'ENDFILE'
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { primary: { 600: '#2563eb', 700: '#1d4ed8' } } } },
  plugins: []
};
ENDFILE
inc

cat > "frontend/postcss.config.js" <<'ENDFILE'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
ENDFILE
inc

cat > "frontend/index.html" <<'ENDFILE'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PhishGuard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
ENDFILE
inc

# 19) frontend src files
mkdir -p frontend/src/components
mkdir -p frontend/src/contexts
mkdir -p frontend/src/pages
mkdir -p frontend/src/services

cat > "frontend/src/main.tsx" <<'ENDFILE'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
ENDFILE
inc

cat > "frontend/src/index.css" <<'ENDFILE'
@tailwind base;
@tailwind components;
@tailwind utilities;
@layer components {
  .btn { @apply px-4 py-2 rounded-lg font-medium transition-colors; }
  .btn-primary { @apply bg-primary-600 text-white hover:bg-primary-700; }
  .card { @apply bg-white rounded-lg shadow-md p-6; }
  .input { @apply w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600; }
  .label { @apply block text-sm font-medium text-gray-700 mb-1; }
}
ENDFILE
inc

cat > "frontend/src/App.tsx" <<'ENDFILE'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
ENDFILE
inc

cat > "frontend/src/contexts/AuthContext.tsx" <<'ENDFILE'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
interface User { id: string; email: string; role: string; }
interface AuthContextType { user: User | null; token: string | null; login: (e: string, p: string) => Promise<void>; logout: () => void; loading: boolean; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    }
    setLoading(false);
  }, []);
  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };
  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
};
ENDFILE
inc

cat > "frontend/src/components/PrivateRoute.tsx" <<'ENDFILE'
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};
ENDFILE
inc

cat > "frontend/src/components/Layout.tsx" <<'ENDFILE'
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Mail, LogOut, Shield } from 'lucide-react';
export const Layout = () => {
const { user, logout } = useAuth();
const navigate = useNavigate();
return (
<div className="min-h-screen bg-gray-50">
<div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm">⚠️ INTERNAL USE ONLY</div>
<div className="flex">
<aside className="w-64 bg-white shadow-lg min-h-screen">
<div className="p-6">
<div className="flex items-center space-x-2 mb-8">
<Shield className="w-8 h-8 text-primary-600" />
<h1 className="text-xl font-bold">PhishGuard</h1>
</div>
<nav className="space-y-2">
<NavLink to="/dashboard" className={({ isActive }) => flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}}>
<Home className="w-5 h-5" /><span>Dashboard</span>
</NavLink>
<NavLink to="/campaigns" className={({ isActive }) => flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}}>
<Mail className="w-5 h-5" /><span>Campaigns</span>
</NavLink>
</nav>
</div>
<div className="absolute bottom-0 w-64 p-6 border-t">
<div className="flex items-center justify-between">
<div><p className="text-sm font-medium">{user?.email}</p><p className="text-xs text-gray-500">{user?.role}</p></div>
<button onClick={() => { logout(); navigate('/login'); }} className="p-2 text-gray-500 hover:text-gray-700"><LogOut className="w-5 h-5" /></button>
</div>
</div>
</aside>
<main className="flex-1 p-8"><Outlet /></main>
</div>
</div>
);
};
ENDFILE
inc

cat > "frontend/src/services/api.ts" <<'ENDFILE'
import axios from 'axios';
export const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });
api.interceptors.response.use((r) => r, (error) => {
if (error.response?.status === 401) {
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.href = '/login';
}
return Promise.reject(error);
});
ENDFILE
inc

cat > "frontend/src/pages/LoginPage.tsx" <<'ENDFILE'
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
export default function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const { login } = useAuth();
const navigate = useNavigate();
const handleSubmit = async (e: FormEvent) => {
e.preventDefault();
setError('');
try {
await login(email, password);
navigate('/dashboard');
} catch (err: any) {
setError(err.response?.data?.error || 'Login failed');
}
};
return (
<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
<div className="max-w-md w-full">
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
<Shield className="w-8 h-8 text-white" />
</div>
<h1 className="text-3xl font-bold">PhishGuard</h1>
</div> <div className="card"> <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"> <p className="text-sm text-yellow-800 text-center">⚠️ Internal Use Only</p> </div> <form onSubmit={handleSubmit} className="space-y-4"> <div> <label className="label">Email</label> <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required /> </div> <div> <label className="label">Password</label> <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required /> </div> {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-800">{error}</p></div>} <button type="submit" className="w-full btn btn-primary">Login</button> </form> <div className="mt-6 text-center text-sm text-gray-500"><p>Default: admin@local.test</p></div> </div> </div> </div> ); } 
ENDFILE
inc

cat > "frontend/src/pages/DashboardPage.tsx" <<'ENDFILE'
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Mail, TrendingUp } from 'lucide-react';
export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/campaigns');
        setStats({ total: res.data.length, active: res.data.filter((c: any) => c.status === 'published').length });
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);
  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-gray-600 mt-2">Phishing awareness overview</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Total Campaigns</p><p className="text-3xl font-bold mt-1">{stats?.total || 0}</p></div>
            <Mail className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Active</p><p className="text-3xl font-bold mt-1">{stats?.active || 0}</p></div>
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
ENDFILE
inc

cat > "frontend/src/pages/CampaignsPage.tsx" <<'ENDFILE'
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Plus } from 'lucide-react';
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/campaigns');
        setCampaigns(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Campaigns</h1><p className="text-gray-600 mt-2">Manage phishing simulations</p></div>
        <button className="btn btn-primary flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Create</span></button>
      </div>
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Targets</th>
              <th className="text-left py-3 px-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4">{c.status}</td>
                <td className="py-3 px-4">{c._count?.targets || 0}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {campaigns.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">No campaigns</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
ENDFILE
inc

# 20) GitHub workflow
mkdir -p .github/workflows
cat > ".github/workflows/ci.yml" <<'ENDFILE'
name: CI
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: phishguard_test
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install backend
        working-directory: ./backend
        run: npm ci
      - name: Build backend
        working-directory: ./backend
        run: npm run build
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install frontend
        working-directory: ./frontend
        run: npm ci
      - name: Build frontend
        working-directory: ./frontend
        run: npm run build
ENDFILE
inc

# -----------------------------
# END FILE CREATION
# -----------------------------

echo ""
echo "📊 Generating SHA256 manifest..."
# generate manifest with chosen sha256 command
if [ "$SHA256_CMD" = "sha256sum" ]; then
  find . -type f ! -path "./.git/*" ! -name "MANIFEST.sha256" -print0 | xargs -0 sha256sum > MANIFEST.sha256
else
  # shasum -a 256
  find . -type f ! -path "./.git/*" ! -name "MANIFEST.sha256" -print0 | xargs -0 shasum -a 256 > MANIFEST.sha256
fi
echo "✅ MANIFEST.sha256 created"

echo ""
echo "🔍 Verifying checksums..."
# verification: format differs slightly between tools; attempt common checks
if command -v sha256sum >/dev/null 2>&1; then
  if sha256sum -c MANIFEST.sha256 --quiet 2>/dev/null; then
    echo "✅ All checksums verified"
  else
    echo "❌ Checksum verification failed"
    echo "→ Contenu de MANIFEST.sha256 (extraits):"
    head -n 10 MANIFEST.sha256 || true
    exit 1
  fi
else
  # try shasum -a 256 -c (not supported on some systems). We'll recompute and compare.
  echo "ℹ️ sha256sum absent, recomputing and comparing..."
  TMPFILE="$(mktemp)"
  find . -type f ! -path "./.git/*" ! -name "MANIFEST.sha256" -print0 | xargs -0 shasum -a 256 > "$TMPFILE"
  if cmp -s "$TMPFILE" MANIFEST.sha256; then
    echo "✅ All checksums verified (shasum)"
    rm -f "$TMPFILE"
  else
    echo "❌ Checksum verification failed (shasum)"
    head -n 10 MANIFEST.sha256 || true
    rm -f "$TMPFILE"
    exit 1
  fi
fi

echo ""
echo "📦 Initializing git..."
if [ ! -d .git ]; then
  git init -q
  git add .
  git commit -m "Initial commit: PhishGuard Basic" -q || true
  echo "✅ Git initialized"
else
  echo "ℹ️ .git already exists, skipping git init"
fi

# Generate admin credentials file (temporary)
ADMIN_EMAIL_DEFAULT="admin@local.test"
ADMIN_PASS_TEMP="$(openssl rand -base64 16 2>/dev/null | tr -dc 'a-zA-Z0-9' | head -c16 || echo 'ChangeMe123!')"

cat > "CREDENTIALS_ADMIN.txt" <<CREDFILE
PhishGuard Admin Credentials

Email:    ${ADMIN_EMAIL_DEFAULT}
Password: ${ADMIN_PASS_TEMP}

⚠️ SECURITY WARNING:

    Change password immediately after first login
    Delete this file after noting credentials
    Never commit to version control
    INTERNAL USE ONLY

Created: $(date)

CREDFILE

echo "✅ Admin credentials saved to CREDENTIALS_ADMIN.txt"

echo ""
echo "=========================================="
echo "✅ Repository Created Successfully!"
echo "=========================================="
echo ""
echo "📁 Project: $PROJECT_NAME"
echo "📊 Files created: $FILE_COUNT"
echo "📋 Manifest: MANIFEST.sha256"
echo "🔐 Credentials: CREDENTIALS_ADMIN.txt"
echo ""
echo "📍 Structure:"
echo " ├── backend/ (Node.js + Express + Prisma)"
echo " ├── frontend/ (React + Vite + Tailwind)"
echo " ├── prisma/ (DB schema & seed)"
echo " ├── docker-compose.yml"
echo " └── install.sh"
echo ""
echo "🚀 Next Steps:"
echo "1. cd $PROJECT_NAME"
echo "2. Inspect .env and set AI_API_KEY"
echo "3. ./install.sh   (or ./install.sh --use-docker --non-interactive)"
echo ""
echo "📚 URLs (after start):"
echo " Frontend: http://localhost:5173"
echo " Backend:  http://localhost:3000"
echo ""
echo "🔐 Admin: ${ADMIN_EMAIL_DEFAULT} / (see CREDENTIALS_ADMIN.txt)"
echo ""
echo "⚠️ REMINDERS:"
echo " • Internal use only"
echo " • HR/Security approval required to run real campaigns"
echo " • Sandbox mode enabled by default"
echo " • Change admin password immediately"
echo ""

# Optionally start docker-compose if not skipped
if [ "$SKIP_START" = false ]; then
  if command -v docker >/dev/null 2>&1 && (docker compose version >/dev/null 2>&1 || docker-compose --version >/dev/null 2>&1); then
    echo ""
    read -r -p "🚀 Lancer docker-compose maintenant ? (y/N) " REPLY || REPLY="n"
    case "$REPLY" in
      y|Y)
        echo "Démarrage docker-compose..."
        docker-compose down -v 2>/dev/null || true
        docker-compose up -d --build
        echo "⏳ Attente des services..."
        sleep 15
        if curl -sSf http://localhost:3000/health >/dev/null 2>&1; then
          echo "✅ Services démarrés et backend OK"
        else
          echo "⚠️ Healthcheck failed — vérifiez docker-compose logs backend"
        fi
        ;;
      *) echo "ℹ️ Skip docker start. Lancez manuellement: docker-compose up -d --build" ;;
    esac
  else
    echo "⚠️ Docker non détecté — démarrez les services localement ou installez Docker"
  fi
fi

echo ""
echo "✨ Done."
exit 0
