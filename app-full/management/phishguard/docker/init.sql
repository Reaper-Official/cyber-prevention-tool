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
