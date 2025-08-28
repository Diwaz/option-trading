import express from "express";
import { updateBalanceForUser } from "./balances";

const router = express.Router();

// In-memory orders
//  { orderId: { token, price, quantity, userId, type } }
const orders: Record<string, any> = {};
let orderCounter = 1;

// POST /order/open
router.post("/open", (req, res) => {
  const { token, price, quantity, userId, type } = req.body;

  if (!token || !price || !quantity || !userId || !type) {
    return res.status(400).json({ error: "token, price, quantity, userId, and type are required" });
  }

  if (type !== "buy" && type !== "sell") {
    return res.status(400).json({ error: "type must be either 'buy' or 'sell'" });
  }

  const orderId = orderCounter++;
  orders[orderId] = { orderId, token, price, quantity, userId, type };
  updateBalanceForUser(userId,token,price,quantity,type);
  res.json({ message: "Order placed successfully", order: orders[orderId] });
});

// (Optional) View all orders
router.get("/", (req, res) => {
  res.json({ orders: Object.values(orders) });
});

export default router;
