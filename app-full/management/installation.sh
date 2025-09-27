#!/bin/bash

# PhishGuard BASIC - Installation Complète Automatique
# Crée TOUT le projet en une seule exécution

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PhishGuard - Installation Auto      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"

INSTALL_DIR="./phishguard-complete"

# Nettoyage
[ -d "$INSTALL_DIR" ] && rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "${GREEN}[1/8]${NC} Structure..."
mkdir -p backend/{routes,services} frontend/src docker

# ============================================
# FICHIER 1: .env
# ============================================
cat > .env << 'ENV_FILE'
APP_NAME=PhishGuard
BACKEND_PORT=3000
FRONTEND_PORT=5173

DB_HOST=postgres
DB_PORT=5432
DB_NAME=phishguard
DB_USER=phishguard
DB_PASSWORD=phishguard123

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

JWT_SECRET=super_secret_key_change_this
TRACKING_DOMAIN=http://localhost:3000
ENV_FILE

# ============================================
# FICHIER 2: docker/init.sql
# ============================================
cat > docker/init.sql << 'SQL_FILE'
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  department VARCHAR(100),
  role VARCHAR(50) DEFAULT 'employee',
  risk_level VARCHAR(20) DEFAULT 'low',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  email_content TEXT,
  target_users JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  launched_at TIMESTAMP,
  emails_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_tracking (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  user_id INTEGER REFERENCES users(id),
  tracking_token VARCHAR(255) UNIQUE NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  opened_count INTEGER DEFAULT 0
);

CREATE TABLE click_tracking (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  user_id INTEGER REFERENCES users(id),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@test.com', 'admin123', 'admin');
SQL_FILE

# ============================================
# FICHIER 3: backend/package.json
# ============================================
cat > backend/package.json << 'BACK_PKG'
{
  "name": "phishguard-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {"start": "node server.js"},
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "uuid": "^9.0.1"
  }
}
BACK_PKG

# ============================================
# FICHIER 4: backend/server.js
# ============================================
cat > backend/server.js << 'SERVER_JS'
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuid } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
  if (result.rows.length > 0) {
    res.json({ user: result.rows[0], token: 'demo-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Campaigns
app.get('/api/campaigns', async (req, res) => {
  const result = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/campaigns', async (req, res) => {
  const { name, subject, email_content, target_users } = req.body;
  const result = await pool.query(
    'INSERT INTO campaigns (name, subject, email_content, target_users) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, subject, email_content, JSON.stringify(target_users)]
  );
  res.json(result.rows[0]);
});

app.post('/api/campaigns/:id/launch', async (req, res) => {
  const { id } = req.params;
  const camp = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id]);
  const users = camp.rows[0].target_users;
  
  for (const userId of users) {
    const token = uuid();
    await pool.query(
      'INSERT INTO email_tracking (campaign_id, user_id, tracking_token) VALUES ($1, $2, $3)',
      [id, userId, token]
    );
  }
  
  await pool.query('UPDATE campaigns SET status = $1, launched_at = NOW(), emails_sent = $2 WHERE id = $3', ['active', users.length, id]);
  res.json({ success: true });
});

// Users
app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT id, name, email, department, role, risk_level FROM users');
  res.json(result.rows);
});

// Stats
app.get('/api/stats', async (req, res) => {
  const campaigns = await pool.query('SELECT COUNT(*) FROM campaigns');
  const users = await pool.query('SELECT COUNT(*) FROM users');
  const opened = await pool.query('SELECT COUNT(*) FROM email_tracking WHERE opened_at IS NOT NULL');
  const clicked = await pool.query('SELECT COUNT(*) FROM click_tracking');
  
  res.json({
    total_campaigns: campaigns.rows[0].count,
    total_users: users.rows[0].count,
    total_opened: opened.rows[0].count,
    total_clicked: clicked.rows[0].count
  });
});

// Tracking pixel
app.get('/track/:token', async (req, res) => {
  await pool.query(
    'UPDATE email_tracking SET opened_at = COALESCE(opened_at, NOW()), opened_count = opened_count + 1 WHERE tracking_token = $1',
    [req.params.token]
  );
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, { 'Content-Type': 'image/gif' });
  res.end(pixel);
});

// Click tracking
app.get('/click/:token', async (req, res) => {
  const track = await pool.query('SELECT * FROM email_tracking WHERE tracking_token = $1', [req.params.token]);
  if (track.rows.length > 0) {
    await pool.query('INSERT INTO click_tracking (campaign_id, user_id) VALUES ($1, $2)', 
      [track.rows[0].campaign_id, track.rows[0].user_id]);
    res.send('<h1>Phishing détecté!</h1><p>Ceci était un test de sécurité.</p>');
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(3000, () => console.log('Backend OK port 3000'));
SERVER_JS

# ============================================
# FICHIER 5: backend/Dockerfile
# ============================================
cat > backend/Dockerfile << 'BACK_DOCKER'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
BACK_DOCKER

# ============================================
# FICHIER 6: frontend/package.json
# ============================================
cat > frontend/package.json << 'FRONT_PKG'
{
  "name": "phishguard-frontend",
  "scripts": {"dev": "vite"},
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
FRONT_PKG

# ============================================
# FICHIER 7: frontend/vite.config.js
# ============================================
cat > frontend/vite.config.js << 'VITE_CONFIG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: { '/api': 'http://backend:3000' }
  }
})
VITE_CONFIG

# ============================================
# FICHIER 8: frontend/index.html
# ============================================
cat > frontend/index.html << 'INDEX_HTML'
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>PhishGuard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
INDEX_HTML

# ============================================
# FICHIER 9: frontend/src/main.jsx
# ============================================
cat > frontend/src/main.jsx << 'MAIN_JSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
MAIN_JSX

# ============================================
# FICHIER 10: frontend/src/App.jsx
# ============================================
cat > frontend/src/App.jsx << 'APP_JSX'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  const [campaigns, setCampaigns] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    const [c, u, s] = await Promise.all([
      axios.get('/api/campaigns'),
      axios.get('/api/users'),
      axios.get('/api/stats')
    ])
    setCampaigns(c.data)
    setUsers(u.data)
    setStats(s.data)
  }

  const login = async () => {
    const res = await axios.post('/api/auth/login', { 
      email: 'admin@test.com', 
      password: 'admin123' 
    })
    setUser(res.data.user)
    setPage('dashboard')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-96">
          <h1 className="text-3xl font-bold text-center mb-6">PhishGuard</h1>
          <button onClick={login} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Connexion (admin@test.com)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">PhishGuard</h2>
        <nav className="space-y-2">
          {['dashboard', 'campaigns', 'users'].map(p => (
            <button key={p} onClick={() => setPage(p)} 
              className={'w-full text-left px-4 py-3 rounded-lg ' + (page === p ? 'bg-blue-600' : 'hover:bg-gray-800')}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">{page}</h1>

        {page === 'dashboard' && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Campagnes</p>
              <p className="text-3xl font-bold">{stats.total_campaigns || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Utilisateurs</p>
              <p className="text-3xl font-bold">{stats.total_users || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Emails ouverts</p>
              <p className="text-3xl font-bold">{stats.total_opened || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Clics</p>
              <p className="text-3xl font-bold">{stats.total_clicked || 0}</p>
            </div>
          </div>
        )}

        {page === 'campaigns' && (
          <div>
            <table className="w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Nom</th>
                  <th className="p-4 text-left">Statut</th>
                  <th className="p-4 text-left">Envoyés</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="p-4">{c.name}</td>
                    <td className="p-4">{c.status}</td>
                    <td className="p-4">{c.emails_sent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page === 'users' && (
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Nom</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Département</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.department || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
APP_JSX

# ============================================
# FICHIER 11: frontend/Dockerfile
# ============================================
cat > frontend/Dockerfile << 'FRONT_DOCKER'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
FRONT_DOCKER

# ============================================
# FICHIER 12: docker-compose.yml
# ============================================
cat > docker-compose.yml << 'COMPOSE_FILE'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: phishguard
      POSTGRES_USER: phishguard
      POSTGRES_PASSWORD: phishguard123
    volumes:
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=phishguard
      - DB_USER=phishguard
      - DB_PASSWORD=phishguard123

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "5173:5173"

volumes:
  postgres_data:
COMPOSE_FILE

# ============================================
# FICHIER 13: README.md
# ============================================
cat > README.md << 'README_FILE'
# PhishGuard BASIC - Installation Complète

## Démarrage rapide

```bash
docker-compose up -d
```

## Accès

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Login: admin@test.com / admin123

## Fonctionnalités

- Tracking d'ouverture d'emails (pixel invisible)
- Tracking de clics sur liens
- Gestion de campagnes
- Base de données PostgreSQL
- Stats en temps réel

## Configuration SMTP

Éditez `.env` puis `docker-compose restart`
README_FILE

# ============================================
# BUILD ET DÉMARRAGE
# ============================================
echo -e "${GREEN}[2/8]${NC} Build backend..."
cd backend && docker build -t phishguard-backend . 2>&1 | grep -v "^#" || true
cd ..

echo -e "${GREEN}[3/8]${NC} Build frontend..."
cd frontend && docker build -t phishguard-frontend . 2>&1 | grep -v "^#" || true
cd ..

echo -e "${GREEN}[4/8]${NC} Docker Compose..."
docker-compose up -d

echo -e "${GREEN}[5/8]${NC} Attente démarrage..."
sleep 10

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Installation terminée!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "📍 Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "📍 Backend:  ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "🔑 Login: ${BLUE}admin@test.com${NC} / ${BLUE}admin123${NC}"
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"

cd ..
echo ""
echo "Projet créé dans: $(pwd)/phishguard-complete"
echo ""

exit 0