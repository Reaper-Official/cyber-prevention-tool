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
