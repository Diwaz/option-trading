
import express from "express";
import { createClient } from "redis";

const router = express.Router();
const client = createClient();
await client.connect();

const subscriber = client.duplicate();
await subscriber.connect();

// Store latest prices for all symbols
let prices = {
  SOLUSDT: 0,
  ETHUSDT: 0,
  BTCUSDT: 0,
};

// Subscribe once at startup
subscriber.subscribe("tradeData", (message) => {
  try {
    const data = JSON.parse(message);
    // console.log("Received:", data);

    // Assuming published message looks like: { symbol: "btc", bid: 12345 }
    const { s, p } = data;
    // console.log(s,p)
    // if (s && prices.hasOwnProperty(s)) {
      prices[s] = p;
    //   console.log('here',prices);
    // }
  } catch (e) {
    console.error("Invalid message:", message);
  }
});

// HTTP endpoint returns last known price for symbol
router.get("/", (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "symbol query param required" });
  }

  const key = symbol;
  if (!(key in prices)) {
    return res.status(404).json({ error: "Unknown symbol" });
  }

  res.json({ symbol: key, price: prices[key] });
});

export default router;
