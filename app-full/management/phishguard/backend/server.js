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
