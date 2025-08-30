import express from "express";
import { Client } from "pg";

const router = express.Router();

const client = new Client({
  user: "optionTradTest",
  host: "localhost",
  database: "postgres",
  password: "admin",
  port: 5430,
});
await client.connect();

router.get("/", async (req, res) => {
  try {
    const market = req.query.assest;   // e.g. "btcusdt"
    const duration = req.query.duration; // e.g. "1m"
    const startTime = req.query.startTime; // e.g. "2025-08-01T00:00:00Z"
    const endTime = req.query.endTime;   // e.g. "2025-08-02T00:00:00Z"
    console.log(market)
    // validate inputs (avoid SQL injection)
    const allowedDurations = ["15s", "30s", "1m", "5m", "1h", "1d", "1w"];
    if (!allowedDurations.includes(duration)) {
      return res.status(400).json({ error: "Invalid duration" });
    }

    // dynamically build safe table name
    const tableName = `${market}_klines_${duration}`;

   const query = `
      SELECT *
      FROM ${tableName}
      WHERE bucket BETWEEN $1::timestamptz AND $2::timestamptz
      ORDER BY bucket DESC;
    `;
    const result = await client.query(query, [startTime, endTime]);

    res.json(result.rows);
  } catch (err) {
    console.error("DB query error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
