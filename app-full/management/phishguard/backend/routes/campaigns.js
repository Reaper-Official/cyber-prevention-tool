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
