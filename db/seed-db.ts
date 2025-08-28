const { Client } = require('pg');

const client = new Client({
    user: 'optionTradTest',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5430,
});

async function initializeDB() {
    await client.connect();
    


    await client.query(`
        DROP TABLE IF EXISTS "btcusdt";`);
    await client.query(`
            CREATE TABLE "btcusdt"(
                time            TIMESTAMP WITH TIME ZONE NOT NULL,
                price   DOUBLE PRECISION,
                volume      DOUBLE PRECISION,
                stock_code   VARCHAR (10)
                );`);
    await client.query(`SELECT create_hypertable('btcusdt', 'time');`);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_15s AS
        SELECT
            time_bucket('15 seconds', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            stock_code
        FROM btcusdt
        GROUP BY bucket, stock_code;
    `);


    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_30s AS
        SELECT
            time_bucket('30 seconds', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            stock_code
        FROM btcusdt
        GROUP BY bucket, stock_code;
    `);


    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
        SELECT
            time_bucket('1 minute', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            stock_code
        FROM btcusdt
        GROUP BY bucket, stock_code;
    `);
    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_5m AS
        SELECT
            time_bucket('5 minute', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            stock_code
        FROM btcusdt
        GROUP BY bucket, stock_code;
    `);
    
    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h AS
        SELECT
            time_bucket('1 hour', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            stock_code
        FROM btcusdt
        GROUP BY bucket, stock_code;
    `);
    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1d AS
        SELECT
            time_bucket('1 day', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            stock_code
        FROM btcusdt
        GROUP BY bucket, stock_code;
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w AS
        SELECT
            time_bucket('1 week', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            stock_code
        FROM btcusdt
        GROUP BY bucket, stock_code;
    `);

    await client.end();
    console.log("Database initialized successfully");
}

initializeDB().catch(console.error);