import express from "express";
import { updateBalanceForUser } from "./balances";
import {prices} from './price';
import {randomUUIDv7} from 'bun';

const router = express.Router();

// In-memory orders
//  { orderId: { token, price, quantity, userId, type } }
const orders: Record<string, any> = {};
interface Trade  {
  orderId: string,
  assest: string,
  openPrice: number
  margin: number,
  leverage: number,
  type: "buy" | "sell",
}
// {userId { trades : [ {  trade1 } , { trade2 }] }}
const openTrades :Record<string,{trades:Trade[]}>={};
let orderCounter = 1;
const addTrades = (userId: string , trade: Trade) =>{
 if (!openTrades[userId]) {
    openTrades[userId] = { trades: [] }; 
  }
  openTrades[userId]?.trades.push(trade);
}
// POST /trade/
router.post("/", (req, res) => {
  const { asset, userId, type,leverage,margin } = req.body;

  if (!asset || !userId || !type || !leverage || !margin) {
    return res.status(411).json({ message: "Incorrect inputs" });
  }

  if (type !== "buy" && type !== "sell") {
    return res.status(411).json({ message: "Incorrect inputs" });
  }

  const orderId = randomUUIDv7();
  const buyPrice = prices[asset];
  // console.log("traded at",buyPrice);
  orders[orderId] = { orderId, asset,openPrice: buyPrice, margin,leverage, type };
  updateBalanceForUser(userId,asset,buyPrice,leverage,margin,type);
  console.log("trades",orders[orderId]);
  addTrades(userId,orders[orderId]);
  console.log("openTrades",JSON.stringify(openTrades,null,2));

  res.status(200).json({  orderId: orderId });
});

router.get('/open',(req,res)=>{
    const {userId} = req.body;
  res.json(
    openTrades[userId] || []
  )
})


export default router;
