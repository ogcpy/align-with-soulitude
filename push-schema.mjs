// push-schema.mjs
import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function createTables() {
  try {
    console.log('Connecting to database...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Create tables manually in the correct order
    console.log('Creating tables...');
    
    // Array of table creation SQL queries
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        price INTEGER,
        duration INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        session_type TEXT DEFAULT 'one-on-one', 
        max_participants INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS available_slots (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        session_type TEXT DEFAULT 'individual',
        service_id INTEGER,
        max_participants INTEGER DEFAULT 1
      )`,
      
      `CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        slot_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        service_id INTEGER NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        quote TEXT NOT NULL,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        image TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        is_resolved BOOLEAN DEFAULT FALSE
      )`,
      
      `CREATE TABLE IF NOT EXISTS discount_codes (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        discount_type TEXT NOT NULL,
        discount_value NUMERIC NOT NULL,
        valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
        valid_until TIMESTAMP,
        usage_limit INTEGER,
        usage_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        reset_token TEXT,
        reset_token_expiry TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    ];
    
    // Execute each query
    for (const query of queries) {
      console.log(`Executing: ${query.split('\n')[0]}...`);
      await pool.query(query);
    }
    
    console.log('All tables created successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables().catch(console.error);