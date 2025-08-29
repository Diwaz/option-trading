import express from "express";
import { updateBalanceForUser } from "./balances";
import {prices} from './price';
import {randomUUIDv7} from 'bun';

const router = express.Router();

// In-memory orders
//  { orderId: { token, price, quantity, userId, type } }
const orders: Record<string, any> = {};
let orderCounter = 1;

// POST /order/open
router.post("/", (req, res) => {
  const { token, userId, type,leverage,margin } = req.body;

  if (!token || !userId || !type || !leverage || !margin) {
    return res.status(400).json({ error: "token, price, quantity, userId, and type are required" });
  }

  if (type !== "buy" && type !== "sell") {
    return res.status(400).json({ error: "type must be either 'buy' or 'sell'" });
  }

  const orderId = randomUUIDv7();
  const buyPrice = prices[token];
  // console.log("traded at",buyPrice);
  orders[orderId] = { orderId, token, buyPrice, margin,leverage, userId, type };
  updateBalanceForUser(userId,token,buyPrice,leverage,margin,type);
  res.json({  orderId: orderId });
});


export default router;
