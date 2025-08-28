import { Client } from 'pg';

const client = new Client({
  user: 'optionTradTest',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5430,
});

// refresh all materialized views
async function refreshViews() {
  try {
    const res = await client.query(`
      SELECT matviewname
      FROM pg_matviews
      WHERE schemaname = 'public';
    `);

    for (const row of res.rows) {
      const viewName = row.matviewname;
      await client.query(`REFRESH MATERIALIZED VIEW ${viewName};`);
      console.log(`Refreshed: ${viewName}`);

      // count rows in the materialized view
      const countRes = await client.query(`SELECT COUNT(*) FROM ${viewName};`);
      console.log(`📊 ${viewName}: ${countRes.rows[0].count} rows`);
    }
  } catch (err) {
    console.error("Error refreshing views:", err);
  }
}

// log counts of all tables
async function logTableCounts() {
  try {
    const res = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tableowner = current_user;
    `);

    for (const row of res.rows) {
      const tableName = row.tablename;
      const countRes = await client.query(`SELECT COUNT(*) FROM ${tableName};`);
      console.log(`📊 ${tableName}: ${countRes.rows[0].count} rows`);
    }
  } catch (err) {
    console.error("Error calculating table lengths:", err);
  }
}

async function main() {
  await client.connect();

  // run immediately
  await refreshViews();
  await logTableCounts();

  // schedule refresh for materialized views every 10s
  setInterval(refreshViews, 10_000);

  // schedule table row counts every 1min
  setInterval(logTableCounts, 60_000);
}

main().catch(console.error);
