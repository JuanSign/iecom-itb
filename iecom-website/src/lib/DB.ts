import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) 
  throw new Error('DATABASE_URL environment variable is not set');

export const DB = neon(process.env.DATABASE_URL);