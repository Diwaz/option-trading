import express, { json, raw } from "express";
import { updateBalanceForClosedOrder, updateBalanceForUser } from "./balances";
import {prices} from '../index';
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
export const openTrades :Record<string,{trades:openTrade[]}>={};
export const mapUserToTrades: Record<string,[]>={};
const closedTrades :Record<string,{trades:closedTrade[]}>={};


export const openTradesArray :openTrade[] =[];

// let orderCounter = 1;
const addTrades = (userId: string , trade: openTrade) =>{
    try {
      if (!userId || !trade){
        return false;
      }
       if (!openTrades[userId]) {
        openTrades[userId] = { trades: [] }; 
      }
      openTrades[userId]?.trades.push(trade);
      openTradesArray.push(trade);
      // mapUserToTrades[userId]?.push(trade.orderId);
      console.log('openTradesArray',openTradesArray);
      // console.log('mapUserToTrades',mapUserToTrades);
      return true;
} catch(err){
  return false ;
}
  
}
export const mapOrderIdToUserId = (orderId:string):string | null => {
  for (const [userId , {trades}]  of Object.entries(openTrades)){
      if (trades.some(trade => trade.orderId === orderId)){
        return userId;
      }
  }
  return null;
}

export const closeTrade = (userId:string,orderId:string) => {

  const user= openTrades[userId];

  if (!user) return null;

  const tradeIndex = user.trades.findIndex(i=>i.orderId === orderId);
  const tradeArrayIndex = openTradesArray.findIndex(i=>i.orderId === orderId);
  const trade  = user.trades[tradeIndex];
  const asset = trade?.asset;
  const closingPrice = prices[asset];

  // calculate pnl 
  // openingQty = trade.openingPrice/margin
  // TotalPnl = closingPrice - trade.openingPrice;
  // netPnl = totalPnl * qty
  // ----------------------------------------------------
  // const rawPnl = closingPrice - trade?.openPrice;
  // const exposer = trade?.margin * trade?.leverage;
  // const qty = trade?.openPrice / exposer;
  // const netPnl= rawPnl * qty;
  // 1. Convert back to real numbers
const openPrice = trade.openPrice / 1e4;
const closePrice = closingPrice / 1e4;
const margin = trade.margin / 1e2;
const leverage = trade.leverage;

// 2. Calculate exposure (not scaled)
const exposure = margin * leverage;

// 3. Calculate position size (quantity)
const qty = exposure / openPrice; // how many units of asset bought

// 4. Calculate PnL
const rawPnl = (closePrice - openPrice) * qty;
const totalTransaction = rawPnl+margin;

  const closedTrade : closedTrade = {
    ...trade,
    closePrice:closingPrice,
    pnl:rawPnl,
  }

  user.trades.splice(tradeIndex,1);
  openTradesArray.splice(tradeArrayIndex,1);
  console.log('after closing balance',totalTransaction)
  updateBalanceForClosedOrder(userId,totalTransaction);
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


//get open orders
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

//get closed orders
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


// post to close order
router.post('/close',(req,res)=>{
  const {orderId,userId} = req.body;
  console.log(orderId);

   if (!orderId){
    return res.status(411).json({
      message:"Invalid Input"
    })
   }
   const user = openTrades[userId];
  const ct = closeTrade(userId,orderId);

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
