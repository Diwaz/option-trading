const { Client } = require('pg');

const client = new Client({
  user: 'optionTradTest',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5430,
});

async function initializeDB(market) {
  const tableName = market.toLowerCase(); // normalize to lowercase

  await client.connect();

  // Drop old table
  await client.query(`DROP TABLE IF EXISTS ${tableName};`);

  // Create new table
  await client.query(`
    CREATE TABLE ${tableName} (
      time        TIMESTAMPTZ NOT NULL,
      price       DOUBLE PRECISION,
      volume      DOUBLE PRECISION,
      stock_code  VARCHAR(10)
    );
  `);

  // Convert into hypertable
  await client.query(`SELECT create_hypertable('${tableName}', 'time');`);

  // List of resolutions
  const intervals = [
    { name: "15s", bucket: "15 seconds" },
    { name: "30s", bucket: "30 seconds" },
    { name: "1m", bucket: "1 minute" },
    { name: "5m", bucket: "5 minutes" },
    { name: "1h", bucket: "1 hour" },
    { name: "1d", bucket: "1 day" },
    { name: "1w", bucket: "1 week" }
  ];

  // Create materialized views dynamically
  for (const { name, bucket } of intervals) {
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS ${tableName}_klines_${name} AS
      SELECT
        time_bucket('${bucket}', time) AS bucket,
        first(price, time) AS open,
        max(price) AS high,
        min(price) AS low,
        last(price, time) AS close,
        sum(volume) AS volume,
        stock_code
      FROM ${tableName}
      GROUP BY bucket, stock_code;
    `);
  }

  await client.end();
  console.log(`✅ Database initialized successfully for ${market}`);
}

// Example usage:
// initializeDB("BTCUSDT").catch(console.error);
// initializeDB("ETHUSDT").catch(console.error);
initializeDB("SOLUSDT").catch(console.error);
