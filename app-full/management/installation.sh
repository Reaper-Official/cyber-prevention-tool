#!/bin/bash

set -e

echo "╔═══════════════════════════════════════╗"
echo "║  PhishGuard - Installation            ║"
echo "╚═══════════════════════════════════════╝"

DIR="./phishguard-app"
[ -d "$DIR" ] && rm -rf "$DIR"
mkdir -p "$DIR"/{backend/routes,frontend/src,docker}
cd "$DIR"

# .env
cat > .env << 'EOF'
DB_HOST=postgres
DB_PORT=5432
DB_NAME=phishguard
DB_USER=phishguard
DB_PASSWORD=phishguard123
EOF

# docker/init.sql
cat > docker/init.sql << 'EOF'
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  department VARCHAR(100),
  role VARCHAR(50) DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  emails_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_tracking (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(255) UNIQUE,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP
);

INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@test.com', 'admin', 'admin');
EOF

# backend/package.json
cat > backend/package.json << 'EOF'
{
  "name": "backend",
  "scripts": {"start": "node server.js"},
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.11.3",
    "uuid": "^9.0.1",
    "dotenv": "^16.3.1"
  }
}
EOF

# backend/server.js
cat > backend/server.js << 'EOF'
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
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 5432
});

pool.connect().then(() => console.log('✓ DB connected')).catch(console.error);

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const r = await pool.query('SELECT * FROM users WHERE email=$1 AND password=$2', [email, password]);
  r.rows[0] ? res.json({ user: r.rows[0] }) : res.status(401).json({ error: 'Invalid' });
});

app.get('/api/campaigns', async (req, res) => {
  const r = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
  res.json(r.rows);
});

app.get('/api/users', async (req, res) => {
  const r = await pool.query('SELECT id,name,email,department,role FROM users');
  res.json(r.rows);
});

app.get('/api/stats', async (req, res) => {
  const c = await pool.query('SELECT COUNT(*) FROM campaigns');
  const u = await pool.query('SELECT COUNT(*) FROM users');
  const o = await pool.query('SELECT COUNT(*) FROM email_tracking WHERE opened_at IS NOT NULL');
  const cl = await pool.query('SELECT COUNT(*) FROM email_tracking WHERE clicked_at IS NOT NULL');
  res.json({ campaigns: c.rows[0].count, users: u.rows[0].count, opened: o.rows[0].count, clicked: cl.rows[0].count });
});

app.get('/track/:token', async (req, res) => {
  await pool.query('UPDATE email_tracking SET opened_at=NOW() WHERE token=$1 AND opened_at IS NULL', [req.params.token]);
  res.type('image/gif').send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
});

app.get('/click/:token', async (req, res) => {
  await pool.query('UPDATE email_tracking SET clicked_at=NOW() WHERE token=$1', [req.params.token]);
  res.send('<h1>Phishing Detected!</h1><p>This was a security test.</p>');
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('✓ Backend on 3000'));
EOF

# backend/Dockerfile
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# frontend/package.json
cat > frontend/package.json << 'EOF'
{
  "name": "frontend",
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
EOF

# frontend/vite.config.js
cat > frontend/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': 'http://backend:3000',
      '/track': 'http://backend:3000',
      '/click': 'http://backend:3000'
    }
  }
})
EOF

# frontend/index.html
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html>
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
EOF

# frontend/src/main.jsx
cat > frontend/src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
EOF

# frontend/src/App.jsx
cat > frontend/src/App.jsx << 'EOF'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  const [data, setData] = useState({ campaigns: [], users: [], stats: {} })

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    const [c, u, s] = await Promise.all([
      axios.get('/api/campaigns'),
      axios.get('/api/users'),
      axios.get('/api/stats')
    ])
    setData({ campaigns: c.data, users: u.data, stats: s.data })
  }

  const login = async () => {
    try {
      const res = await axios.post('/api/auth/login', { email: 'admin@test.com', password: 'admin' })
      setUser(res.data.user)
      setPage('dashboard')
    } catch (e) {
      alert('Erreur login')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-96">
          <h1 className="text-3xl font-bold text-center mb-6">PhishGuard</h1>
          <button onClick={login} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
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
              className={'w-full text-left px-4 py-3 rounded ' + (page === p ? 'bg-blue-600' : 'hover:bg-gray-800')}>
              {p.toUpperCase()}
            </button>
          ))}
        </nav>
      </aside>
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">{page.toUpperCase()}</h1>
        
        {page === 'dashboard' && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Campagnes', value: data.stats.campaigns || 0 },
              { label: 'Utilisateurs', value: data.stats.users || 0 },
              { label: 'Ouverts', value: data.stats.opened || 0 },
              { label: 'Cliqués', value: data.stats.clicked || 0 }
            ].map(s => (
              <div key={s.label} className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">{s.label}</p>
                <p className="text-3xl font-bold mt-2">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {page === 'campaigns' && (
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                {['Nom', 'Statut', 'Envoyés'].map(h => (
                  <th key={h} className="p-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-4">{c.name || 'Sans nom'}</td>
                  <td className="p-4">{c.status}</td>
                  <td className="p-4">{c.emails_sent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {page === 'users' && (
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                {['Nom', 'Email', 'Département'].map(h => (
                  <th key={h} className="p-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.users.map(u => (
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
EOF

# frontend/Dockerfile
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EOF

# docker-compose.yml
cat > docker-compose.yml << 'EOF'
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
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U phishguard"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
      - DB_NAME=phishguard
      - DB_USER=phishguard
      - DB_PASSWORD=phishguard123
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "5173:5173"

volumes:
  pgdata:
EOF

# README
cat > README.md << 'EOF'
# PhishGuard BASIC

## Démarrage

```bash
docker-compose up -d
```

## Accès

http://localhost:5173

Login: admin@test.com / admin

## Fonctionnalités

- Tracking ouverture (pixel invisible)
- Tracking clics
- Dashboard temps réel
- PostgreSQL
EOF

echo "✓ Build..."
docker-compose build --quiet

echo "✓ Démarrage..."
docker-compose up -d

sleep 8

echo ""
echo "════════════════════════════════════"
echo "✓ Installation terminée!"
echo "════════════════════════════════════"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000"
echo "Login:    admin@test.com / admin"
echo ""
echo "Projet: $(pwd)"
echo ""

exit 0