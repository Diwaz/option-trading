import WebSocket from 'ws';
// import { publishData,publisher } from './redis';
// const ws = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');
const redis = require('redis');

const publisher = redis.createClient('redis://localhost:6379');
await publisher.connect();

// const publishData = async (trade: Trade) => {
// //   await publisher.connect();

//   await publisher.publish('btcusdt', JSON.stringify(trade));
//   await publisher.rPush('kline',JSON.stringify(trade));
// };

// {
  //   "e": "aggTrade",    // Event type
  //   "E": 1672515782136, // Event time
  //   "s": "BNBBTC",      // Symbol
  //   "a": 12345,         // Aggregate trade ID
  //   "p": "0.001",       // Price
  //   "q": "100",         // Quantity
  //   "f": 100,           // First trade ID
  //   "l": 105,           // Last trade ID
  //   "T": 1672515782136, // Trade time
  //   "m": true,          // Is the buyer the market maker?
  //   "M": true           // Ignore
  // }
  export interface Trade {
    e : String,
  E: BigInt,
  s: String,
  a: number,
  p:number,
  q:number,
  f:String,
  l:String, 
  T:BigInt,
  m:Boolean,
  M:Boolean
}
interface spreadData {
  symbol: String,
  buyPrice: number,
  sellPrice: number,
  decimal: number,

}

export const tradeMarkets = ['btcusdt' , 'ethusdt','solusdt'];
const TradeCollector:Trade[] =[];
let batchData:Trade[]=[];
const TradePoller = (market:string,redisTopic:string)=> {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${market}@trade`);
  
  ws.on('open', async function open() {
    // ws.send('something');
    
    console.log('connection opened')
    
  });
  
  ws.on('message', async function  message (data) {
    const trade:Trade = JSON.parse(data.toString());
  // console.log('received:',trade );
  // publishData(trade);
  // TradeCollector.push(trade)
  // console.log('data',JSON.stringify(trade));

    const spreadData: spreadData = {
      symbol : trade.s === "SOLUSDT" ? "SOL" : trade.s === "ETHUSDT" ? "ETH" : "BTC",
      buyPrice : Math.trunc((trade.p * 1.01)*1e4),
      sellPrice : Math.trunc((trade.p * 0.99)*1e4),
      decimal: 4

    }  
    console.log(spreadData)
  await publisher.publish('tradeData',JSON.stringify(spreadData));
  await publisher.rPush('tradeData',JSON.stringify(trade));
  // console.log(TradeCollector.length);
});

ws.on('error', function error(data) {
  console.log('received: %s',data );
});

ws.on('close',function handleClose(){
  
  console.log("closed ok")
});
}

// ws.on('open', async function open() {
//   // ws.send('something');
//   await publisher.connect();
  
//   console.log('connection opened')
  
// });

// ws.on('message', async function  message (data) {
//   const trade:Trade = JSON.parse(data.toString());
//   // console.log('received:',trade );
//   publishData(trade);
//   TradeCollector.push(trade)
  
//   if (TradeCollector.length >= 100) {
//     // pop the 2000 data as a batch from this tradecollector array 
//     batchData=TradeCollector.splice(0,99);
//     //send it to DB
//     // console.log("Batch ",batchData);
//   }
//   console.log(TradeCollector.length)
// });

// ws.on('error', function error(data) {
//   console.log('received: %s',data );
// });

// ws.on('close',function handleClose(){
  
//   console.log("closed ok")
// })
// // console.log('trades',batchData)

tradeMarkets.forEach((market)=>{
TradePoller(market,market);
});
