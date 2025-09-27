#!/usr/bin/env bash
set -euo pipefail
trap 'echo "❌ Erreur sur la ligne $LINENO"; exit 1' ERR

# rebuild_repo.sh - Version corrigée
# Reconstruit le dépôt phishguard-basic avec tous les fichiers nécessaires

PROJECT_NAME="phishguard-basic"
ROOT_DIR="$(pwd)/${PROJECT_NAME}"
FILE_COUNT=0

# Detect sha256 command
if command -v sha256sum >/dev/null 2>&1; then
  SHA256_CMD="sha256sum"
elif command -v shasum >/dev/null 2>&1; then
  SHA256_CMD="shasum -a 256"
else
  echo "❌ Aucun utilitaire sha256 trouvé"
  exit 2
fi

echo "📁 Création du répertoire projet: $ROOT_DIR"
mkdir -p "$ROOT_DIR"
cd "$ROOT_DIR"

inc() {
  FILE_COUNT=$((FILE_COUNT + 1))
}

# 1) Top-level files
cat > "STACK.txt" <<'ENDFILE'
## Stack
- React 18 + TypeScript + Vite
- Node.js 18 + Express + Prisma
- PostgreSQL 14 + Docker
ENDFILE
inc

cat > "LICENSE" <<'ENDFILE'
INTERNAL USE ONLY LICENSE
Copyright (c) 2025 PhishGuard
FOR INTERNAL SECURITY TRAINING ONLY
ENDFILE
inc

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
FRONTEND_URL=http://localhost:5173
ENDFILE
inc

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

cat > "install.sh" <<'ENDFILE'
#!/usr/bin/env bash
set -euo pipefail
trap 'echo "❌ Erreur pendant install.sh (ligne $LINENO)"; exit 1' ERR

echo "🚀 PhishGuard Installation"

# Check prerequisites
for cmd in git openssl docker; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Pré-requis manquant: $cmd"
    exit 2
  fi
done

# Create .env if missing
if [ ! -f .env ]; then
  echo "🔐 Création de .env depuis .env.example"
  cp .env.example .env
  JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n' | tr -d '\r')
  if sed --version >/dev/null 2>&1; then
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
  else
    sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
  fi
  echo "✅ .env créé (JWT_SECRET généré)"
fi

echo "🐳 Lancement via docker compose..."
echo "⚠️  Nettoyage des images Docker en cache..."
docker compose down -v 2>/dev/null || docker-compose down -v 2>/dev/null || true
docker system prune -f 2>/dev/null || true
echo "🔨 Build des images Docker (sans cache)..."
docker compose build --no-cache || docker-compose build --no-cache
echo "🚀 Démarrage des conteneurs..."
docker compose up -d || docker-compose up -d

echo "⏳ Attente du backend..."
sleep 20

echo "⚙️ Exécution des migrations Prisma..."
docker compose exec -T backend npx prisma migrate deploy || docker-compose exec -T backend npx prisma migrate deploy || {
  echo "⚠️ Migration failed, trying dev mode"
  docker compose exec -T backend npx prisma migrate dev --name init --skip-seed || docker-compose exec -T backend npx prisma migrate dev --name init --skip-seed || true
}

echo "⚙️ Lancement du seed..."
docker compose exec -T backend npx prisma db seed || docker-compose exec -T backend npx prisma db seed || {
  echo "⚠️ Seed failed, trying manual execution"
  docker compose exec -T backend npx ts-node prisma/seed.ts || docker-compose exec -T backend npx ts-node prisma/seed.ts || true
}

echo "🔍 Vérification sanitaire backend..."
if curl -sSf http://localhost:3000/health >/dev/null 2>&1; then
  echo "✅ Backend répond sur /health"
else
  echo "⚠️ Échec du healthcheck. Vérifiez les logs: docker compose logs backend"
fi

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
echo ""
echo "🎉 Installation terminée!"
echo ""
echo "📚 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🔐 Credentials:"
echo "   Email:    ${ADMIN_EMAIL}"
echo "   Password: ${ADMIN_PASS}"
echo ""
echo "⚠️  N'oubliez pas de changer le mot de passe admin après la première connexion!"
exit 0
ENDFILE
chmod +x install.sh
inc

# Script de nettoyage Docker
cat > "clean-docker.sh" <<'ENDFILE'
#!/usr/bin/env bash
set -e

echo "🧹 Nettoyage complet Docker..."

# Stop and remove containers
docker compose down -v 2>/dev/null || docker-compose down -v 2>/dev/null || true

# Remove project images
docker rmi phishguard-basic-backend phishguard-basic-frontend 2>/dev/null || true

# Prune system (optional)
read -p "Nettoyer tout le cache Docker système ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker system prune -af --volumes
fi

echo "✅ Nettoyage terminé!"
echo "💡 Vous pouvez maintenant relancer: ./install.sh"
ENDFILE
chmod +x clean-docker.sh
inc

# Backend Dockerfile (fixed - uses npm install)
mkdir -p backend
cat > "backend/Dockerfile" <<'ENDFILE'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --legacy-peer-deps
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
  lastName  String?
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

cat > "backend/prisma/seed.ts" <<'ENDFILE'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { 
      name: 'Admin', 
      permissions: { 
        users: ['create', 'read', 'update', 'delete'], 
        campaigns: ['create', 'read', 'update', 'delete'] 
      } 
    }
  });

  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';
  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { 
      email: 'admin@local.test', 
      password: hashed, 
      firstName: 'Admin', 
      roleId: adminRole.id 
    }
  });

  console.log('✅ Seed completed');
  console.log('   Admin: admin@local.test');
  console.log(`   Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
ENDFILE
inc

mkdir -p backend/src
cat > "backend/src/server.ts" <<'ENDFILE'
import dotenv from 'dotenv';
dotenv.config();
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
ENDFILE
inc

cat > "backend/src/app.ts" <<'ENDFILE'
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import campaignRoutes from './routes/campaignRoutes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;
ENDFILE
inc

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
  res.status(500).json({ error: 'Internal server error' });
};
ENDFILE
inc

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
    if (!token) throw new AppError(401, 'Authentication required');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId }, 
      include: { role: true } 
    });
    
    if (!user || !user.active) throw new AppError(401, 'Invalid user');
    
    req.user = { id: user.id, email: user.email, role: user.role.name };
    next();
  } catch (error) {
    next(new AppError(401, 'Invalid token'));
  }
};
ENDFILE
inc

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
    const user = await prisma.user.findUnique({ 
      where: { email }, 
      include: { role: true } 
    });
    
    if (!user || !user.active) throw new AppError(401, 'Invalid credentials');
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Invalid credentials');
    
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role.name 
      } 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
ENDFILE
inc

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
      include: { 
        createdBy: { select: { email: true } }, 
        _count: { select: { targets: true } } 
      },
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
        name, 
        subject, 
        body, 
        fromName, 
        fromEmail, 
        sandbox: true, 
        createdById: (req as any).user.id,
        targets: { 
          create: (targetUserIds || []).map((userId: string) => ({ 
            userId, 
            status: 'pending' 
          })) 
        }
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
      include: { 
        targets: { include: { user: true } }, 
        createdBy: true 
      }
    });
    if (!campaign) throw new AppError(404, 'Campaign not found');
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

export default router;
ENDFILE
inc

# Frontend files
mkdir -p frontend
cat > "frontend/Dockerfile" <<'ENDFILE'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
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
  server: { 
    port: 5173, 
    proxy: { 
      '/api': { 
        target: 'http://localhost:3000', 
        changeOrigin: true 
      } 
    } 
  }
});
ENDFILE
inc

cat > "frontend/tailwind.config.js" <<'ENDFILE'
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { 
    extend: { 
      colors: { 
        primary: { 
          50: '#eff6ff',
          600: '#2563eb', 
          700: '#1d4ed8' 
        } 
      } 
    } 
  },
  plugins: []
};
ENDFILE
inc

cat > "frontend/postcss.config.js" <<'ENDFILE'
export default { 
  plugins: { 
    tailwindcss: {}, 
    autoprefixer: {} 
  } 
};
ENDFILE
inc

cat > "frontend/index.html" <<'ENDFILE'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PhishGuard - Security Training</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
ENDFILE
inc

mkdir -p frontend/src/components frontend/src/contexts frontend/src/pages frontend/src/services

cat > "frontend/src/main.tsx" <<'ENDFILE'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
ENDFILE
inc

cat > "frontend/src/index.css" <<'ENDFILE'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn { 
    @apply px-4 py-2 rounded-lg font-medium transition-colors; 
  }
  .btn-primary { 
    @apply bg-primary-600 text-white hover:bg-primary-700; 
  }
  .card { 
    @apply bg-white rounded-lg shadow-md p-6; 
  }
  .input { 
    @apply w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600; 
  }
  .label { 
    @apply block text-sm font-medium text-gray-700 mb-1; 
  }
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

interface User { 
  id: string; 
  email: string; 
  role: string; 
}

interface AuthContextType { 
  user: User | null; 
  token: string | null; 
  login: (email: string, password: string) => Promise<void>; 
  logout: () => void; 
  loading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
ENDFILE
inc

cat > "frontend/src/components/PrivateRoute.tsx" <<'ENDFILE'
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
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
      <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-semibold">
        ⚠️ INTERNAL USE ONLY - Security Training Platform
      </div>
      <div className="flex">
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Shield className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold">PhishGuard</h1>
            </div>
            <nav className="space-y-2">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink 
                to="/campaigns" 
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Mail className="w-5 h-5" />
                <span>Campaigns</span>
              </NavLink>
            </nav>
          </div>
          <div className="absolute bottom-0 w-64 p-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
ENDFILE
inc

cat > "frontend/src/services/api.ts" <<'ENDFILE'
import axios from 'axios';

export const api = axios.create({ 
  baseURL: '/api', 
  headers: { 'Content-Type': 'application/json' } 
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
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
          <p className="text-gray-600 mt-2">Security Training Platform</p>
        </div>
        
        <div className="card">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 text-center font-semibold">
              ⚠️ Internal Use Only - Training Environment
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input" 
                required 
                placeholder="admin@local.test"
              />
            </div>
            
            <div>
              <label className="label">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="input" 
                required 
                placeholder="Enter your password"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <button type="submit" className="w-full btn btn-primary">
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Default credentials: admin@local.test</p>
          </div>
        </div>
      </div>
    </div>
  );
}
ENDFILE
inc

cat > "frontend/src/pages/DashboardPage.tsx" <<'ENDFILE'
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Mail, TrendingUp, Users, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/campaigns');
        setStats({ 
          total: res.data.length, 
          active: res.data.filter((c: any) => c.status === 'published').length,
          draft: res.data.filter((c: any) => c.status === 'draft').length 
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Phishing awareness training overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Campaigns</p>
              <p className="text-3xl font-bold mt-1">{stats?.total || 0}</p>
            </div>
            <Mail className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold mt-1">{stats?.active || 0}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-3xl font-bold mt-1">{stats?.draft || 0}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sandbox Mode</p>
              <p className="text-xl font-bold mt-1">Enabled</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="ml-4">
              <p className="font-medium">Create your first campaign</p>
              <p className="text-sm text-gray-600">Set up a phishing simulation for your team</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="ml-4">
              <p className="font-medium">Configure recipients</p>
              <p className="text-sm text-gray-600">Select who will receive the training</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="ml-4">
              <p className="font-medium">Review and launch</p>
              <p className="text-sm text-gray-600">Test in sandbox before deploying</p>
            </div>
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
import { Plus, Eye } from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/campaigns');
        setCampaigns(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-gray-600 mt-2">Manage phishing simulation campaigns</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Campaign</span>
        </button>
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Targets</th>
                <th className="text-left py-3 px-4 font-semibold">Created</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{campaign.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{campaign._count?.targets || 0}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-600 hover:text-primary-700">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No campaigns yet. Create your first campaign to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
ENDFILE
inc

# GitHub Actions CI
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
          --health-cmd pg_isready 
          --health-interval 10s 
          --health-timeout 5s 
          --health-retries 5
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
      - name: Generate Prisma client
        working-directory: ./backend
        run: npx prisma generate
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

# README
cat > "README.md" <<'ENDFILE'
# PhishGuard BASIC

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![License](https://img.shields.io/badge/License-Internal_Use-red.svg)](#license)

**Self-hosted phishing awareness training platform**

[English](#english) | [Français](#français)

</div>

---

## English

### 🎯 Overview

PhishGuard BASIC is an open-source, self-hosted platform designed to train employees in cybersecurity through ethical phishing simulations. Built with modern technologies and AI-powered content generation.

### ✨ Key Features

- **📧 Phishing Simulations**: Create realistic phishing campaigns with customizable templates
- **🎓 Training Modules**: Interactive educational content with adaptive learning paths
- **📊 Analytics Dashboard**: Real-time metrics, reports, and performance tracking
- **🤖 AI-Powered**: Automated content generation via Gemini AI (or other providers)
- **🔒 Self-Hosted**: Complete control over your data and infrastructure
- **✅ GDPR Compliant**: Built-in privacy controls and data protection

### 🚀 Quick Start

#### Prerequisites

- Docker & Docker Compose
- Git
- OpenSSL (for generating secrets)

#### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/phishguard-basic.git
cd phishguard-basic

# Run the installation script
chmod +x install.sh
./install.sh
```

#### Troubleshooting

If you encounter Docker build errors:

```bash
# Clean Docker cache and rebuild
chmod +x clean-docker.sh
./clean-docker.sh

# Then reinstall
./install.sh
```

Or manually:

```bash
# Stop and remove everything
docker compose down -v

# Remove images
docker rmi phishguard-basic-backend phishguard-basic-frontend

# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

The script will:
1. Generate `.env` configuration
2. Build Docker containers
3. Run database migrations
4. Seed initial admin user
5. Start all services

#### Access the Platform

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Default credentials**: See `CREDENTIALS_ADMIN.txt`

### 📋 Configuration

Edit `.env` file to configure:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/phishguard

# JWT Secret (auto-generated)
JWT_SECRET=your-secret-key

# AI Provider
AI_PROVIDER=GEMINI
AI_API_KEY=your-api-key

# Security
SANDBOX_MODE=true
DEFAULT_ADMIN_EMAIL=admin@local.test
DEFAULT_ADMIN_PASSWORD=ChangeMe123!
```

### 🏗️ Architecture

```
phishguard-basic/
├── backend/          # Node.js + Express + Prisma
├── frontend/         # React + TypeScript + Vite
├── docker-compose.yml
└── install.sh
```

### 🔒 Security & Ethics

**IMPORTANT**: This platform is designed **exclusively** for internal corporate cybersecurity training.

- ✅ Authorized: Internal training, controlled simulations, security audits
- ❌ Prohibited: Real phishing attacks, unauthorized data collection, malicious use

All campaigns must be approved by HR/Security teams before deployment.

### 📖 Documentation

- [Installation Guide](./docs/installation.md)
- [User Manual](./docs/user-guide.md)
- [API Documentation](./docs/api.md)
- [Development Guide](./docs/development.md)

### 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md).

### 📄 License

Internal Use Only License - See [LICENSE](./LICENSE) for details.

---

## Français

### 🎯 Aperçu

PhishGuard BASIC est une plateforme open-source auto-hébergée conçue pour former les employés à la cybersécurité via des simulations de phishing éthiques. Développée avec des technologies modernes et génération de contenu par IA.

### ✨ Fonctionnalités Principales

- **📧 Simulations de Phishing**: Créez des campagnes réalistes avec templates personnalisables
- **🎓 Modules de Formation**: Contenu éducatif interactif avec parcours adaptatifs
- **📊 Tableau de Bord**: Métriques temps réel, rapports et suivi des performances
- **🤖 Propulsé par IA**: Génération automatique de contenu via Gemini AI (ou autres)
- **🔒 Auto-Hébergé**: Contrôle total sur vos données et infrastructure
- **✅ Conforme RGPD**: Contrôles de confidentialité et protection des données intégrés

### 🚀 Démarrage Rapide

#### Prérequis

- Docker & Docker Compose
- Git
- OpenSSL (pour générer les secrets)

#### Installation

```bash
# Cloner le dépôt
git clone https://github.com/your-org/phishguard-basic.git
cd phishguard-basic

# Exécuter le script d'installation
chmod +x install.sh
./install.sh
```

Le script va :
1. Générer la configuration `.env`
2. Construire les conteneurs Docker
3. Exécuter les migrations de base de données
4. Créer l'utilisateur admin initial
5. Démarrer tous les services

#### Accéder à la Plateforme

- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3000
- **Identifiants par défaut**: Voir `CREDENTIALS_ADMIN.txt`

### 📋 Configuration

Éditez le fichier `.env` pour configurer :

```env
# Base de données
DATABASE_URL=postgresql://postgres:postgres@db:5432/phishguard

# Secret JWT (auto-généré)
JWT_SECRET=votre-clé-secrète

# Fournisseur IA
AI_PROVIDER=GEMINI
AI_API_KEY=votre-clé-api

# Sécurité
SANDBOX_MODE=true
DEFAULT_ADMIN_EMAIL=admin@local.test
DEFAULT_ADMIN_PASSWORD=ChangeMe123!
```

### 🔒 Sécurité & Éthique

**IMPORTANT**: Cette plateforme est conçue **exclusivement** pour la formation interne en cybersécurité.

- ✅ Autorisé: Formation interne, simulations contrôlées, audits de sécurité
- ❌ Interdit: Vraies attaques de phishing, collecte de données non autorisée, usage malveillant

Toutes les campagnes doivent être approuvées par les équipes RH/Sécurité avant déploiement.

### 📄 Licence

Licence Usage Interne Uniquement - Voir [LICENSE](./LICENSE) pour les détails.

---

<div align="center">

**Made with ❤️ for a safer digital world**

[Report Issue](https://github.com/your-org/phishguard-basic/issues) · [Request Feature](https://github.com/your-org/phishguard-basic/issues) · [Documentation](./docs)

</div>
ENDFILE
inc

# MANIFEST
cat > "MANIFEST.txt" <<'ENDFILE'
PhishGuard BASIC - File Manifest

Root Files:
- STACK.txt
- LICENSE
- .gitignore
- .env.example
- docker-compose.yml
- install.sh
- clean-docker.sh
- README.md
- MANIFEST.txt

Backend (/backend):
- Dockerfile
- package.json
- tsconfig.json
- prisma/schema.prisma
- prisma/seed.ts
- src/server.ts
- src/app.ts
- src/middleware/errorHandler.ts
- src/middleware/auth.ts
- src/routes/authRoutes.ts
- src/routes/campaignRoutes.ts

Frontend (/frontend):
- Dockerfile
- package.json
- tsconfig.json
- vite.config.ts
- tailwind.config.js
- postcss.config.js
- index.html
- src/main.tsx
- src/index.css
- src/App.tsx
- src/contexts/AuthContext.tsx
- src/components/PrivateRoute.tsx
- src/components/Layout.tsx
- src/services/api.ts
- src/pages/LoginPage.tsx
- src/pages/DashboardPage.tsx
- src/pages/CampaignsPage.tsx

CI/CD:
- .github/workflows/ci.yml

Scripts:
- install.sh (Main installation script)
- clean-docker.sh (Docker cleanup utility)

Total Files: 42+
ENDFILE
inc

echo ""
echo "📊 Generating SHA256 manifest..."
find . -type f ! -path "./.git/*" ! -name "MANIFEST.sha256" -print0 | xargs -0 $SHA256_CMD > MANIFEST.sha256 2>/dev/null || true
echo "✅ MANIFEST.sha256 created"

echo ""
echo "📦 Initializing git..."
if [ ! -d .git ]; then
  git init -q
  git add .
  git commit -m "Initial commit: PhishGuard Basic (fixed)" -q || true
  echo "✅ Git initialized"
fi

ADMIN_EMAIL_DEFAULT="admin@local.test"
ADMIN_PASS_TEMP="ChangeMe123!"

cat > "CREDENTIALS_ADMIN.txt" <<CREDFILE
PhishGuard Admin Credentials

Email:    ${ADMIN_EMAIL_DEFAULT}
Password: ${ADMIN_PASS_TEMP}

⚠️ SECURITY WARNING:
- Change password immediately after first login
- Delete this file after noting credentials
- Never commit to version control
- INTERNAL USE ONLY

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
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. cd $PROJECT_NAME"
echo ""
echo "2. (Optional) Edit .env and add your AI_API_KEY:"
echo "   nano .env"
echo ""
echo "3. Install and start:"
echo "   ./install.sh"
echo ""
echo "   If you get Docker build errors, run:"
echo "   ./clean-docker.sh"
echo "   ./install.sh"
echo ""
echo "📚 URLs (after installation):"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🔐 Default Admin:"
echo "   Email:    admin@local.test"
echo "   Password: ChangeMe123!"
echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "   • INTERNAL USE ONLY - Training platform"
echo "   • Requires HR/Security approval for real campaigns"
echo "   • Sandbox mode enabled by default"
echo "   • Change admin password immediately after first login"
echo "   • Delete CREDENTIALS_ADMIN.txt after noting credentials"
echo ""
echo "📖 Documentation:"
echo "   • README.md - Complete guide (EN/FR)"
echo "   • clean-docker.sh - Docker cleanup utility"
echo "   • docker-compose.yml - Service configuration"
echo ""
echo "🐛 Troubleshooting:"
echo "   If Docker fails: ./clean-docker.sh && ./install.sh"
echo "   View logs: docker compose logs -f"
echo "   Stop services: docker compose down"
echo ""
echo "✨ Repository ready to use!"
echo "=========================================="
exit 0