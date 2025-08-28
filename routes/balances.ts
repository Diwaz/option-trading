import express from "express";

const router = express.Router();

// In-memory balances per userId
//  { "uuid-123": { usd: { qty: 1000 } } }
const balances: Record<string, any> = {};

// GET /balance
router.get("/", (req, res) => {
  const { userId } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId query parameter is required" });
  }

  const userBalance = balances[userId];

  if (!userBalance) {
    return res.status(404).json({ error: "Balance not found for this user" });
  }

  res.json({ balance: userBalance });
});

// Helper function (to be called in auth.ts on registration)
export const initBalanceForUser = (userId: string) => {
  balances[userId] = { usd: { qty: 1000 } }; // default starting balance
};
export const updateBalanceForUser = (userId:string,token :string ,price : number , quantity: number, type : "buy" | "sell")=>{
    const userBalance = balances[userId]
if (type === "buy") {
    // Deduct USD
    userBalance.usd.qty -= price * quantity;

    // Add token
    if (!userBalance[token]) {
      userBalance[token] = { qty: 0, type: "buy" };
    }
    userBalance[token].qty += quantity;
    userBalance[token].type = "buy";
  }

  if (type === "sell") {
    // Add USD
    userBalance.usd.qty += price * quantity;

    // Deduct token
    if (!userBalance[token]) {
      userBalance[token] = { qty: 0, type: "sell" };
    }
    userBalance[token].qty -= quantity;
    if (userBalance[token].qty < 0) userBalance[token].qty = 0;
    userBalance[token].type = "sell";
  }

}

export default router;
