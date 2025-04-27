import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

dotenv.config();
neonConfig.webSocketConstructor = ws;

// Always use the external Neon PostgreSQL database
const connectionString = 'postgresql://neondb_owner:npg_hqrXK72xnNaD@ep-purple-bar-abxju02g.eu-west-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });