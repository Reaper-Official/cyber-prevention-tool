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
