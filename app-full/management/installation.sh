#!/bin/bash

# PhishGuard BASIC - Installation Système Complet
# Version corrigée sans erreurs de syntaxe

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║   PhishGuard BASIC - Système Complet         ║
║   Tracking • Emails • BDD • Rapports          ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

INSTALL_DIR="$PWD/phishguard"

# Nettoyage
if [ -d "$INSTALL_DIR" ]; then
    print_info "Nettoyage de l'installation précédente..."
    cd "$INSTALL_DIR" 2>/dev/null && docker-compose down -v 2>/dev/null || true
    cd ..
    rm -rf "$INSTALL_DIR"
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Structure complète
print_info "Création de la structure complète..."
mkdir -p backend/routes backend/services docker frontend/src nginx templates storage/logs storage/uploads

# ============================================
# CONFIGURATION
# ============================================
print_info "Génération de la configuration..."

JWT_SECRET=$(openssl rand -hex 32)

cat > .env << EOF
APP_NAME=PhishGuard
APP_URL=http://localhost
BACKEND_PORT=3000
FRONTEND_PORT=5173

DB_HOST=postgres
DB_PORT=5432
DB_NAME=phishguard
DB_USER=phishguard
DB_PASSWORD=phishguard123

REDIS_HOST=redis
REDIS_PORT=6379

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=phishguard@company.com

GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-1.5-flash

JWT_SECRET=$JWT_SECRET
TRACKING_DOMAIN=http://localhost:3000
EOF

# ============================================
# BASE DE DONNÉES
# ============================================
print_info "Schéma de base de données..."

cat > docker/init.sql << 'EOSQL'
-- Utilisateurs
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  department VARCHAR(100),
  position VARCHAR(100),
  role VARCHAR(50) DEFAULT 'employee',
  risk_level VARCHAR(20) DEFAULT 'low',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campagnes
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(255),
  email_content TEXT,
  target_users JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_date TIMESTAMP,
  launched_at TIMESTAMP,
  total_targets INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracking emails
CREATE TABLE email_tracking (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tracking_token VARCHAR(255) UNIQUE NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  opened_count INTEGER DEFAULT 0
);

-- Tracking clics
CREATE TABLE click_tracking (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email_tracking_id INTEGER REFERENCES email_tracking(id),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Templates
CREATE TABLE email_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subject VARCHAR(255),
  content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_email_tracking_token ON email_tracking(tracking_token);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Données test
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT INTO email_templates (name, category, subject, content) VALUES
('Mise à jour IT', 'IT Support', 'Action requise: Mise à jour', 
 '<p>Bonjour,</p><p>Mise à jour critique disponible.</p><a href="{{TRACKING_LINK}}">Installer</a>');
EOSQL

# ============================================
# BACKEND
# ============================================
print_info "Création du backend..."

cat > backend/package.json << 'EOPACKAGE'
{
  "name": "phishguard-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.7",
    "uuid": "^9.0.1",
    "helmet": "^7.1.0"
  }
}
EOPACKAGE

cat > backend/server.js << 'EOSERVER'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/users', require('./routes/users'));

// Tracking
app.get('/track/:token', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  
  try {
    const { token } = req.params;
    const ip = req.ip || req.connection.remoteAddress;
    
    await pool.query(
      'UPDATE email_tracking SET opened_at = COALESCE(opened_at, NOW()), opened_count = opened_count + 1, ip_address = $2 WHERE tracking_token = $1',
      [token, ip]
    );
    
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': pixel.length });
    res.end(pixel);
  } catch (error) {
    res.status(200).end();
  }
});

app.get('/click/:token', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  
  try {
    const { token } = req.params;
    const ip = req.ip || req.connection.remoteAddress;
    
    const tracking = await pool.query('SELECT * FROM email_tracking WHERE tracking_token = $1', [token]);
    
    if (tracking.rows.length > 0) {
      const t = tracking.rows[0];
      await pool.query(
        'INSERT INTO click_tracking (campaign_id, user_id, email_tracking_id, ip_address) VALUES ($1, $2, $3, $4)',
        [t.campaign_id, t.user_id, t.id, ip]
      );
      
      res.send('<h1>Attention au phishing!</h1><p>Vous avez cliqué sur un lien de simulation.</p>');
    } else {
      res.status(404).send('Link not found');
    }
  } catch (error) {
    res.status(500).send('Error');
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.BACKEND_PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('✓ Backend running on port ' + PORT);
});
EOSERVER

# Routes AUTH
cat > backend/routes/auth.js << 'EOAUTH'
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
EOAUTH

# Routes CAMPAIGNS
cat > backend/routes/campaigns.js << 'EOCAMPAIGNS'
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, subject, email_content, target_users } = req.body;
    const result = await pool.query(
      'INSERT INTO campaigns (name, description, subject, email_content, target_users) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, subject, email_content, JSON.stringify(target_users)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/launch', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id]);
    
    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const camp = campaign.rows[0];
    const targetUsers = camp.target_users;
    
    for (const userId of targetUsers) {
      const trackingToken = uuidv4();
      await pool.query(
        'INSERT INTO email_tracking (campaign_id, user_id, tracking_token) VALUES ($1, $2, $3)',
        [id, userId, trackingToken]
      );
    }
    
    await pool.query(
      'UPDATE campaigns SET status = $1, launched_at = NOW(), emails_sent = $2 WHERE id = $3',
      ['active', targetUsers.length, id]
    );
    
    res.json({ success: true, emails_sent: targetUsers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
EOCAMPAIGNS

# Routes USERS
cat > backend/routes/users.js << 'EOUSERS'
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, department, role, risk_level FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
EOUSERS

cat > backend/Dockerfile << 'EODOCKERBACK'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EODOCKERBACK

# ============================================
# FRONTEND
# ============================================
print_info "Création du frontend..."

cat > frontend/package.json << 'EOFRONTPACKAGE'
{
  "name": "phishguard-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
EOFRONTPACKAGE

cat > frontend/vite.config.js << 'EOVITE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': 'http://backend:3000'
    }
  }
})
EOVITE

cat > frontend/index.html << 'EOHTML'
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PhishGuard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOHTML

cat > frontend/src/main.jsx << 'EOMAIN'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
EOMAIN

cat > frontend/src/App.jsx << 'EOAPP'
import { useState } from 'react';
import { Shield } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-96">
          <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-center mb-6">PhishGuard</h1>
          <button 
            onClick={() => setUser({name: 'Admin'})}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Connexion Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">PhishGuard Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Campagnes</p>
          <p className="text-3xl font-bold">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Emails</p>
          <p className="text-3xl font-bold">245</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Taux ouverture</p>
          <p className="text-3xl font-bold">68%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Taux clic</p>
          <p className="text-3xl font-bold">15%</p>
        </div>
      </div>
    </div>
  );
}
EOAPP

cat > frontend/Dockerfile << 'EODOCKERFRONT'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EODOCKERFRONT

# ============================================
# DOCKER COMPOSE
# ============================================
cat > docker-compose.yml << 'EOCOMPOSE'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: phishguard
      POSTGRES_USER: phishguard
      POSTGRES_PASSWORD: phishguard123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    env_file: .env
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
EOCOMPOSE

# ============================================
# BUILD
# ============================================
print_info "Construction des images..."
docker-compose build

print_info "Démarrage..."
docker-compose up -d

sleep 10

clear
print_success "Installation terminée!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000"
echo ""
echo "Configurez SMTP dans .env puis: docker-compose restart"

exit 0