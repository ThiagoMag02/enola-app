const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://supabase_user:supabase_password@localhost:5432/radiant_juno_local';

const client = new Client({
  connectionString: connectionString,
});

async function applySchema() {
  try {
    await client.connect();
    console.log('Connected to local PostgreSQL');

    // Create minimal Supabase roles for RLS compatibility
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon;
        END IF;
      END
      $$;
    `);
    console.log('Supabase roles created/verified');

    const schemaPath = path.join(__dirname, '..', 'radiant-juno-next', 'supabase_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL into commands if needed, but pg.query can often handle a block if it's not too complex
    // Actually, it's better to split by ; to avoid issues with enums and tables in one block
    // But let's try the whole block first
    await client.query(sql);
    console.log('Schema applied successfully to PostgreSQL!');

    // Apply seed data if exists
    const seedPath = path.join(__dirname, 'seed_data.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('Seed data applied successfully!');
    }

  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await client.end();
  }
}

applySchema();
