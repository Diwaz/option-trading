// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import routes from './routes/index.ts'
import { createClient } from "redis";
import { closeTrade, mapOrderIdToUserId, openTrades, openTradesArray } from "./routes/order.ts";



const client = createClient();
await client.connect();
const subscriber = client.duplicate();
await subscriber.connect();

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors());         
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/", routes);



// Store latest prices for all symbols
export let prices = {
  SOL: 0,
  ETH: 0,
  BTC: 0,
};
const liquidationEngine = (liveTrade ) =>{
    
  


   openTradesArray.map((order)=>{
    if ( order.leverage > 1 && order.type === "buy"){
      // const rawPnl = liveTrade.sellPrice - order.openPrice;
      // const exposer = order?.margin * order?.leverage;
      // const qty = order?.openPrice / exposer;
      // const netPnl= rawPnl * qty;

      // threshold = 100/leverage === (2)50% ====(3)33.33% ======(10)10%===100(1%)
      // % loss =  rawPnl / netPnl;
        // if threshold > 0.9*(%loss*100) then close order
      // const threshold = 90/leverage;


      if (liveTrade.sellPrice < order.openPrice) {
       const changePercentge = (order.openPrice - liveTrade.sellPrice) / order.openPrice ;  
        if (changePercentge > 9/(order.leverage)){
          // close order
          const index = openTradesArray.findIndex(i=>i.orderId == order.orderId);
          openTradesArray.splice(index,1)
          const userId:string | null = mapOrderIdToUserId(order.orderId);
          if (!userId){
            return ;
          }
          closeTrade(userId,order.orderId);
          console.log("order closed");
          
        }
        
      } 
      
      
      
      
    }
    if ( order.type === "sell"){
      if (liveTrade.buyPrice > order.openPrice){
        const changePercentage = (liveTrade.buyPrice-order.openPrice) / order.openPrice;
        if (changePercentage > 90/(order.leverage)){
          // close order
              const index = openTradesArray.findIndex(i=>i.orderId == order.orderId);
          openTradesArray.splice(index,1)
          console.log("order closed");
          }
        }
    }

   }) 
}
// Subscribe once at startup
subscriber.subscribe("tradeData", (message,channel) => {
  try {
    const data = JSON.parse(message);
    liquidationEngine(data);
    // Assuming published message looks like: { symbol: "btc", bid: 12345 }
    const { symbol, buyPrice } = data;
    // console.log(s,p)
    // if (s && prices.hasOwnProperty(s)) {
      prices[symbol] = buyPrice;
      // console.log('here',prices);
    // }
  } catch (e) {
    console.error("Invalid message:", message);
  }
});

// HTTP endpoint returns last known price for symbol
app.get("/prices", (req, res) => {
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




// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
