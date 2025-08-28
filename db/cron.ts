import { Client } from 'pg';

const client = new Client({
  user: 'optionTradTest',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5430,
});

async function refreshViews() {
  try {
    // get all materialized views in public schema
    const res = await client.query(`
      SELECT matviewname
      FROM pg_matviews
      WHERE schemaname = 'public';
    `);

    for (const row of res.rows) {
      const viewName = row.matviewname;
      await client.query(`REFRESH MATERIALIZED VIEW ${viewName};`);
      console.log(`Refreshed: ${viewName}`);
    }
  } catch (err) {
    console.error("Error refreshing views:", err);
  }
}

async function main() {
  await client.connect();

  // refresh immediately once
  await refreshViews();

  // schedule refresh every 10 seconds
  setInterval(refreshViews, 10_000);
}

main().catch(console.error);
