import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function runMigrations() {
  let connection;

  try {
    console.log('🔄 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'brainex_db';
    console.log(`📦 Creating database: ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('📖 Reading schema file...');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Execute schema
    console.log('⚙️  Executing database migrations...');
    await connection.query(schema);

    console.log('✅ Database migrations completed successfully!');
    console.log('\nCreated tables:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach((table) => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migrations
runMigrations();
