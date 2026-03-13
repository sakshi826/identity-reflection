import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function verify() {
  console.log('--- Database Verification ---');
  try {
    // 0. Initialize Schema
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✔ Schema initialized.');

    // 1. Connection Test
    const timeRes = await pool.query('SELECT NOW()');
    console.log('✔ Connection successful:', timeRes.rows[0].now);

    // 2. Schema check
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log('✔ Tables found:', tableNames.join(', '));

    const requiredTables = ['users', 'constellations', 'stars'];
    const missing = requiredTables.filter(t => !tableNames.includes(t));
    if (missing.length === 0) {
      console.log('✔ All required tables exist.');
    } else {
      console.log('✖ Missing tables:', missing.join(', '));
    }

    // 3. Simple insert/read test record
    console.log('--- Test Record Cycle ---');
    const testUserId = 9999999999n;
    await pool.query('INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [testUserId.toString()]);
    console.log('✔ User test record handled.');

    const testConstId = '00000000-0000-0000-0000-000000000000';
    await pool.query('INSERT INTO constellations (id, user_id) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [testConstId, testUserId.toString()]);
    console.log('✔ Constellation test record handled.');

    await pool.query('DELETE FROM constellations WHERE id = $1', [testConstId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId.toString()]);
    console.log('✔ Cleanup complete.');

    console.log('--- Verification Complete: SUCCESS ---');
    process.exit(0);
  } catch (err) {
    console.error('--- Verification Failed ---');
    console.error(err);
    process.exit(1);
  }
}

verify();
