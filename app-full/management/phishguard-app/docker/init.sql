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
