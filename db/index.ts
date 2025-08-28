import { Client } from 'pg';
import { createClient } from 'redis';
import { type Trade } from '../poller-be';

// 1. Configure PostgreSQL connection
const pg = new Client({
  user: 'optionTradTest',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5430,
});
pg.connect();

// 2. Extract only relevant fields
const extractReleventData = (trade: Trade) => {
  const price = trade.p;
  const timestamp = new Date(trade.T);
  const volume = trade.q;
  return { timestamp, price, volume };
};

// 3. Batch Insert Helper
async function insertBatch(table: string, rows: { timestamp: Date; price: number; volume: number }[]) {
  if (rows.length === 0) return;

  const placeholders: string[] = [];
  const values: any[] = [];

  rows.forEach((row, i) => {
    const idx = i * 3; // 3 fields per row
    placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3})`);
    values.push(row.timestamp, row.price, row.volume);
  });

  const query = `
    INSERT INTO ${table} (time, price, volume)
    VALUES ${placeholders.join(',')}
  `;

  await pg.query(query, values);
}

// 4. Main loop
async function main() {
  const redis = createClient();
  await redis.connect();

  let ethBatch: any[] = [];
  let btcBatch: any[] = [];
  let solBatch: any[] = [];

  while (true) {
    const response = await redis.brPop('tradeData', 0);
    if (!response) continue;

    const { element } = response;
    try {
      const trade: Trade = JSON.parse(element);
      const data = extractReleventData(trade);

      if (trade.s === 'ETHUSDT') {
        ethBatch.push(data);
        if (ethBatch.length >= 100) {
          await insertBatch('ETHUSDT', ethBatch);
          ethBatch = [];
        }
      } else if (trade.s === 'BTCUSDT') {
        btcBatch.push(data);
        if (btcBatch.length >= 100) {
          await insertBatch('BTCUSDT', btcBatch);
          btcBatch = [];
        }
      } else if (trade.s === 'SOLUSDT') {
        solBatch.push(data);
        if (solBatch.length >= 100) {
          await insertBatch('SOLUSDT', solBatch);
          solBatch = [];
        }
      }
    } catch (err) {
      console.error('Invalid JSON:', element, err);
    }
  }
}

main();
