import express, { json, raw } from "express";
import { updateBalanceForUser } from "./balances";
import {prices} from './price';
import {randomUUIDv7} from 'bun';

const router = express.Router();

// In-memory orders
//  { orderId: { token, price, quantity, userId, type } }
const orders: Record<string, any> = {};
interface openTrade  {
  orderId: string,
  asset: string,
  openPrice: number
  margin: number,
  leverage: number,
  type: "buy" | "sell",
}

interface closedTrade extends openTrade  {
  closePrice:number,
  pnl: number
}
// {userId { trades : [ {  trade1 } , { trade2 }] }}
const openTrades :Record<string,{trades:openTrade[]}>={};
const closedTrades :Record<string,{trades:closedTrade[]}>={};
let orderCounter = 1;
const addTrades = (userId: string , trade: openTrade) =>{
    try {
      if (!userId || !trade){
        return false;
      }
       if (!openTrades[userId]) {
        openTrades[userId] = { trades: [] }; 
      }
      openTrades[userId]?.trades.push(trade);
      return true;
} catch(err){
  return false ;
}
  
}

const closeTrade = (userId:string,orderId:string,user) => {

  // const user= openTrades[userId];

  if (!user) return null;

  const tradeIndex = user.trades.findIndex(i=>i.orderId === orderId);
  const trade  = user.trades[tradeIndex];
  const asset = trade.asset;
  const closingPrice = prices[asset];

  // calculate pnl 
  // openingQty = trade.openingPrice/margin
  // TotalPnl = closingPrice - trade.openingPrice;
  // netPnl = totalPnl * qty
  const rawPnl = closingPrice - trade?.openPrice;
  const exposer = trade?.margin * trade?.leverage;
  const qty = trade?.openPrice / exposer;
  const netPnl= rawPnl * qty;

  const closedTrade : closedTrade = {
    ...trade,
    closePrice:closingPrice,
    pnl:netPnl,
  }

  user.trades.splice(tradeIndex,1);

  if (!closedTrades[userId]) {
    closedTrades[userId] = { trades: [] }; 
  }
    closedTrades[userId]?.trades.push(closedTrade);
  console.log('closing trade',closedTrade);
  
    return true;
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
  console.log("trades",orders[orderId]);
  const added = addTrades(userId,orders[orderId]);
  console.log("openTrades",JSON.stringify(openTrades,null,2));
  if(!added){
    
    return res.status(404).json({ message :"Failed to add order" });
  }
  updateBalanceForUser(userId,asset,buyPrice,leverage,margin,type);
  return res.status(200).json({  orderId: orderId });
});

router.get('/open',(req,res)=>{
    const {userId} = req.body;
    if (!userId){
      return res.status(411).json({
        message:"Invalid input"
      })
    }
  res.json(
    openTrades[userId] || []
  )
})

router.get('/',(req,res)=>{
    const {userId} = req.body;
    if (!userId){
      return res.status(411).json({
        message:"Invalid input"
      })
    }
  res.json(
    closedTrades[userId] || []
  )
})



router.post('/close',(req,res)=>{
  const {orderId,userId} = req.body;
  console.log(orderId);

   if (!orderId){
    return res.status(411).json({
      message:"Invalid Input"
    })
   }
   const user = openTrades[userId];
  const ct = closeTrade(userId,orderId,user);

  if (!ct){
   return res.status(404).json({
      message: "Trade not found"
    })
  }

  return res.status(200).json({
    message :"trade closed successfully"
  });
})

export default router;
