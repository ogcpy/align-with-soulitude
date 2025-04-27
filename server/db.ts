import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

dotenv.config();

// Configure WebSocket for Neon
if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), use the native WebSocket implementation
  neonConfig.webSocketConstructor = WebSocket;
} else {
  // In development, use the ws package
  neonConfig.webSocketConstructor = ws;
}

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure pool with SSL settings
export const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Vercel deployment
  }
});

export const db = drizzle({ client: pool, schema });
