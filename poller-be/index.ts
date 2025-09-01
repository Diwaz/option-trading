import WebSocket from 'ws';
const redis = require('redis');

const publisher = redis.createClient('redis://localhost:6379');
await publisher.connect();

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

const TradePoller = (market:string)=> {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${market}@trade`);
  
  ws.on('open', async function open() {
    
    console.log('connection opened')
    
  });
  
  ws.on('message', async function  message (data) {
    const trade:Trade = JSON.parse(data.toString());

    const spreadData: spreadData = {
      symbol : trade.s === "SOLUSDT" ? "SOL" : trade.s === "ETHUSDT" ? "ETH" : "BTC",
      buyPrice : Math.trunc((trade.p * 1.01)*1e4),
      sellPrice : Math.trunc((trade.p * 0.99)*1e4),
      decimal: 4

    }  
    console.log(spreadData)
  await publisher.publish('tradeData',JSON.stringify(spreadData));
  await publisher.rPush('tradeData',JSON.stringify(trade));
});

ws.on('error', function error(data) {
  console.log('received: %s',data );
});

ws.on('close',function handleClose(){
  
  console.log("closed ok")
});
}

tradeMarkets.forEach((market)=>{
TradePoller(market);
});
