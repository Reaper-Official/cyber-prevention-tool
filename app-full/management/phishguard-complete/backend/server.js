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
