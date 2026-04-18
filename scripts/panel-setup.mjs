/**
 * PANEL! Manual setup script — bypasses the interactive EverShop wizard.
 * Reads credentials from .env, creates admin user, runs all migrations.
 *
 * Usage: node scripts/panel-setup.mjs
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Load .env manually
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.error('⚠ No .env file found. Copy .env.example → .env and fill in values.');
  process.exit(1);
}

const { Pool } = (await import('pg')).default ?? await import('pg');
import bcrypt from 'bcryptjs';

const {
  commit,
  execute,
  insertOnUpdate,
  rollback,
  startTransaction,
  migrate
} = await import('@evershop/postgres-query-builder');

const { getCoreModules } = await import(
  '@evershop/evershop/dist/bin/lib/loadModules.js'
);

const DB = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'paneltshirts',
  user: process.env.DB_USER || 'panel',
  password: process.env.DB_PASSWORD || '',
  max: 5,
  idleTimeoutMillis: 30000
};

console.log('\n🛍  PANEL! EverShop Setup\n');
console.log(`  DB: ${DB.user}@${DB.host}:${DB.port}/${DB.database}`);
console.log(`  Admin: ${process.env.ADMIN_EMAIL}\n`);

// Test connection
let pool;
try {
  pool = new Pool({ ...DB, ssl: false });
  await pool.query('SELECT 1');
  console.log('✔ PostgreSQL connection OK');
} catch (e) {
  console.error('✘ Cannot connect to PostgreSQL:', e.message);
  console.error('  Is Docker running? Try: docker-compose up -d');
  process.exit(1);
}

const connection = await pool.connect();
await startTransaction(connection);

try {
  // Create admin_user table
  await execute(connection, `
    CREATE TABLE IF NOT EXISTS "admin_user" (
      "admin_user_id" INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
      "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
      "status" boolean NOT NULL DEFAULT TRUE,
      "email" varchar NOT NULL,
      "password" varchar NOT NULL,
      "full_name" varchar DEFAULT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ADMIN_USER_EMAIL_UNIQUE" UNIQUE ("email"),
      CONSTRAINT "ADMIN_USER_UUID_UNIQUE" UNIQUE ("uuid")
    )
  `);

  // Hash admin password (async — correct usage)
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // Upsert admin user
  await insertOnUpdate('admin_user', ['email'])
    .given({
      status: 1,
      email: process.env.ADMIN_EMAIL || 'admin@paneltshirts.com',
      password: passwordHash,
      full_name: process.env.ADMIN_FULLNAME || 'Admin PANEL!'
    })
    .execute(connection);
  console.log('✔ Admin user created');

  // Run all core module migrations
  const coreModules = getCoreModules();
  await migrate(coreModules, connection);
  console.log('✔ Core migrations complete');

  await commit(connection);
  console.log('\n✅ Setup complete!\n');
  console.log('  Next steps:');
  console.log('  1. npm run build');
  console.log('  2. npm run dev');
  console.log('  3. Open http://localhost:3000\n');
} catch (e) {
  await rollback(connection);
  console.error('✘ Setup failed:', e.message);
  console.error(e.stack);
  process.exit(1);
} finally {
  connection.release();
  await pool.end();
}
