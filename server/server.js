import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 80;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize database schema
const initDb = async () => {
  try {
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Error initializing database schema:', err);
  }
};

// Handshake endpoint
app.post('/api/auth/handshake', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  // In this custom handshake, we derive a user_id from the token or assume the token IS the user_id if it's numeric/BIGINT-compatible for this demo.
  // The prompt says "The API returns a user_id." and "The id must match the user_id returned from the authentication handshake."
  // For UUID tokens, we might need a mapping or use a hash. 
  // But wait, "id BIGINT PRIMARY KEY" for users. BIGINT can represent UUIDs if transformed, but usually it's a numeric ID.
  // I'll assume the token can be converted to a BIGINT or we have a pool of IDs.
  // For now, I'll use a simple deterministic hash of the token to get a BIGINT for the id.
  
  try {
    // Basic hash to bigint (simplified for UUID strings)
    const userId = BigInt('0x' + token.replace(/-/g, '').substring(0, 15)); 
    
    // Phase 11 — User Initialization
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId.toString()]);
    if (userCheck.rowCount === 0) {
      await pool.query('INSERT INTO users (id) VALUES ($1)', [userId.toString()]);
    }
    
    res.json({ user_id: userId.toString() });
  } catch (err) {
    console.error('Handshake error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Constellation Endpoints (Phase 12 — Enforcing User Isolation)
app.get('/api/constellations', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await pool.query(
      'SELECT c.id, c.created_at, json_agg(s.*) as stars FROM constellations c ' +
      'JOIN stars s ON s.constellation_id = c.id ' +
      'WHERE c.user_id = $1 GROUP BY c.id ORDER BY c.created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/constellations', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id, stars } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO constellations (id, user_id) VALUES ($1, $2)',
      [id, userId]
    );
    
    for (const star of stars) {
      await client.query(
        'INSERT INTO stars (star_index, constellation_id, x, y, label) VALUES ($1, $2, $3, $4, $5)',
        [star.id, id, star.x, star.y, star.label]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ message: 'Saved' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/constellations/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await pool.query('DELETE FROM constellations WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');
  
  // Serve static assets with long cache
  app.use('/identity_reflection', express.static(distPath, { maxAge: '1d' }));
  
  // Handshake and API are handled above. 
  // Any other GET request that isn't an API should serve index.html
  app.get(['/identity_reflection', '/identity_reflection/*', '/', '/*'], (req, res) => {
    // If it's an API request that got here, it's a 404 for the API
    if (req.url.startsWith('/api')) {
      return res.status(404).json({ error: 'API not found' });
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  initDb();
});
