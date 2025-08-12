import { Pool, PoolClient } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { logger } from '../utils/logger';

let pgPool: Pool | null = null;
let sqliteDb: Database | null = null;

export interface DatabaseConnection {
  query: (sql: string, params?: any[]) => Promise<any>;
  close?: () => Promise<void>;
}

export async function connectDatabase(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    await connectPostgreSQL();
  } else {
    await connectSQLite();
  }
}

async function connectPostgreSQL(): Promise<void> {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required for production');
    }

    pgPool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    logger.info('PostgreSQL connected successfully');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

async function connectSQLite(): Promise<void> {
  try {
    const dbPath = process.env.SQLITE_PATH || './database/learning_platform.db';
    sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await sqliteDb.exec('PRAGMA foreign_keys = ON');
    
    logger.info('SQLite connected successfully');
  } catch (error) {
    logger.error('Failed to connect to SQLite:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<DatabaseConnection> {
  if (process.env.NODE_ENV === 'production') {
    if (!pgPool) {
      throw new Error('PostgreSQL not connected');
    }
    return {
      query: async (sql: string, params: any[] = []) => {
        const client = await pgPool!.connect();
        try {
          const result = await client.query(sql, params);
          return result.rows;
        } finally {
          client.release();
        }
      }
    };
  } else {
    if (!sqliteDb) {
      throw new Error('SQLite not connected');
    }
    return {
      query: async (sql: string, params: any[] = []) => {
        return await sqliteDb!.all(sql, params);
      }
    };
  }
}

export async function closeDatabase(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
  if (sqliteDb) {
    await sqliteDb.close();
    sqliteDb = null;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});
